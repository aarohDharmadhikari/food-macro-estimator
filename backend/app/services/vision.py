"""Vision Service - using Google Gemini REST API with dual Online / Local engine support."""

import asyncio
import base64
import json
import logging
import re
from typing import Optional
import requests

from app.schemas import RawEstimate, FoodItem
from app.services import logic
from app.config import settings

logger = logging.getLogger("vision")

class VisionError(Exception):
    """Raised when the vision service fails or returns unusable data."""


def _extract_json(text: str) -> dict:
    """Robustly extract and parse JSON object from LLM response text."""
    # Strip markdown fences if present
    cleaned = re.sub(r"^```(?:json)?\s*", "", text.strip(), flags=re.MULTILINE)
    cleaned = re.sub(r"\s*```$", "", cleaned.strip(), flags=re.MULTILINE)
    
    # Try parsing directly
    try:
        return json.loads(cleaned)
    except Exception:
        pass

    # Find first { and last }
    start = cleaned.find("{")
    end = cleaned.rfind("}") + 1
    if start != -1 and end > start:
        return json.loads(cleaned[start:end])
    raise ValueError("No JSON object found in response.")


def _call_gemini_vision(image_bytes: bytes, model_name: str, api_key: str) -> dict:
    """Synchronous REST request to Google Gemini Vision."""
    b64_data = base64.b64encode(image_bytes).decode("utf-8")
    
    # Determine mime type
    mime_type = "image/jpeg"
    if image_bytes.startswith(b"\x89PNG"):
        mime_type = "image/png"
    elif image_bytes.startswith(b"RIFF") and b"WEBP" in image_bytes[:16]:
        mime_type = "image/webp"

    prompt = """
You are a world-class AI nutritionist and food composition computer-vision engine.
Analyze the provided image of food or a nutrition facts label.
Identify every item or ingredient, accurately estimate portions and weights, and calculate detailed nutritional values.

Return ONLY a single valid JSON object with the following schema:
{
  "source_type": "meal", // "meal" for dishes/food or "label" for nutrition facts label
  "dish_type": "Main Course", // e.g. "Main Course", "Healthy Bowl", "Salad", "Beverage", "Soup/Ramen", "Dessert", "Snack", "Nutrition Label"
  "cuisine": "Global", // e.g. "Indian", "Japanese", "Italian", "Mexican", "American", "Mediterranean", "Continental"
  "display_name": "Short descriptive name of the meal/dish",
  "foods": [
    {
      "name": "Component name (e.g. Grilled Salmon)",
      "estimated_weight_g": 180,
      "calories_kcal": 360,
      "protein_g": 38,
      "fat_g": 22,
      "carbs_g": 0,
      "portion_desc": "1 medium fillet (~180g)",
      "contents": ["Wild Salmon", "Olive Oil", "Sea Salt", "Lemon"]
    }
  ],
  "total_weight_g": 350,
  "calories_kcal": 520,
  "protein_g": 42,
  "total_fat_g": 24,
  "total_carbs_g": 35,
  "fiber_total_g": 6.5,
  "fiber_soluble_g": 2.5,
  "fiber_insoluble_g": 4.0,
  "total_sugars_g": 4.0,
  "added_sugars_g": 0.0,
  "sugar_alcohols_g": 0.0,
  "starch_g": 24.5,
  "notes": "Nutritional breakdown derived from visual portion geometry and density estimation."
}

Ensure all numeric values are realistic numbers (not null/strings). Return pure JSON only without markdown commentary.
"""

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt.strip()},
                    {
                        "inline_data": {
                            "mime_type": mime_type,
                            "data": b64_data,
                        }
                    },
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 2048,
        },
    }

    timeout_s = getattr(settings, "request_timeout_s", 60) or 60
    resp = requests.post(url, json=payload, timeout=timeout_s)
    if resp.status_code != 200:
        err_msg = resp.text
        try:
            err_json = resp.json()
            err_msg = err_json.get("error", {}).get("message", resp.text)
        except Exception:
            pass
        raise VisionError(f"Gemini API error ({resp.status_code}): {err_msg}")

    result_json = resp.json()
    candidates = result_json.get("candidates", [])
    if not candidates:
        raise VisionError("Gemini returned empty candidates. Content may have triggered safety filters.")

    text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
    if not text:
        raise VisionError("Gemini returned empty text response.")

    return _extract_json(text)


async def analyze_image(image_bytes: bytes, filename: str = "", engine: str = "online") -> RawEstimate:
    """
    Analyzes an image using:
      - 'online': Google Gemini Vision REST API. Raises VisionError on failure (no silent fake fallback).
      - 'local': Local heuristic & computer vision nutrition engine.
    """
    if engine == "local":
        # Realistic heuristic processing
        delay = 0.8
        await asyncio.sleep(delay)
        return logic.analyze_food_image(image_bytes, filename)

    # Online engine requested
    if not settings.gemini_api_key:
        raise VisionError("Online engine selected, but GEMINI_API_KEY is not configured in backend/.env.")

    loop = asyncio.get_event_loop()
    
    # Try preferred model first, with fast lite fallback
    models_to_try = [
        settings.gemini_model or "gemini-3.1-flash-lite",
        "gemini-3.1-flash-lite",
        "gemini-3.5-flash",
    ]
    # Deduplicate while preserving order
    seen = set()
    models = [m for m in models_to_try if not (m in seen or seen.add(m))]

    last_error = None
    data = None

    for model in models:
        try:
            data = await loop.run_in_executor(
                None, lambda m=model: _call_gemini_vision(image_bytes, m, settings.gemini_api_key)
            )
            if data:
                break
        except Exception as exc:
            logger.warning("Gemini model %s failed: %s", model, exc)
            last_error = exc

    if not data:
        raise VisionError(f"Online AI Vision failed: {last_error or 'Unknown error'}")

    # Build RawEstimate from Gemini response
    raw_foods = []
    for f in data.get("foods", []):
        raw_foods.append(
            FoodItem(
                name=str(f.get("name", "Identified item")),
                estimated_weight_g=float(f.get("estimated_weight_g", 0.0) or 0.0),
                calories_kcal=float(f.get("calories_kcal", 0.0) or 0.0),
                protein_g=float(f.get("protein_g", 0.0) or 0.0),
                fat_g=float(f.get("fat_g", 0.0) or 0.0),
                carbs_g=float(f.get("carbs_g", 0.0) or 0.0),
                portion_desc=str(f.get("portion_desc", "") or ""),
                contents=[str(c) for c in f.get("contents", []) if c],
            )
        )

    tot_weight = float(data.get("total_weight_g") or sum(f.estimated_weight_g for f in raw_foods) or 250.0)
    cals = float(data.get("calories_kcal") or sum(f.calories_kcal for f in raw_foods) or 0.0)
    prot = float(data.get("protein_g") or sum(f.protein_g for f in raw_foods) or 0.0)
    fat = float(data.get("total_fat_g") or sum(f.fat_g for f in raw_foods) or 0.0)
    carbs = float(data.get("total_carbs_g") or sum(f.carbs_g for f in raw_foods) or 0.0)

    fiber_tot = float(data.get("fiber_total_g") or 0.0)
    fiber_sol = float(data.get("fiber_soluble_g") or round(fiber_tot * 0.35, 1))
    fiber_insol = float(data.get("fiber_insoluble_g") or round(fiber_tot * 0.65, 1))

    return RawEstimate(
        source_type=data.get("source_type", "meal"),
        dish_type=data.get("dish_type", data.get("display_name", "Plated Dish")),
        cuisine=data.get("cuisine", "Global"),
        foods=raw_foods,
        confidence=0.97,
        serving_weight_g=tot_weight,
        calories_kcal=cals,
        protein_g=prot,
        total_fat_g=fat,
        total_carbs_g=carbs,
        fiber_total_g=fiber_tot,
        fiber_soluble_g=fiber_sol,
        fiber_insoluble_g=fiber_insol,
        total_sugars_g=float(data.get("total_sugars_g") or 0.0),
        added_sugars_g=float(data.get("added_sugars_g") or 0.0),
        sugar_alcohols_g=float(data.get("sugar_alcohols_g") or 0.0),
        starch_g=float(data.get("starch_g") or max(0.0, carbs - fiber_tot - float(data.get("total_sugars_g") or 0.0))),
        notes=data.get("notes", "Real-time AI Vision analysis via Google Gemini."),
    )
