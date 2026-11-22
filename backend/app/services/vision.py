"""Gemini vision + OCR client with enforced structured JSON output.

Strategy:
  1. Send the image + a strict extraction prompt.
  2. Ask Gemini for `application/json` constrained by a response schema,
     so the reply is machine-parseable instead of free text.
  3. Validate the JSON with Pydantic (RawEstimate) before using it.
"""

import base64
import json
import logging
import re

import httpx
from pydantic import ValidationError

from app.config import get_settings
from app.schemas import RawEstimate

logger = logging.getLogger("vision")

GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models"


class VisionError(Exception):
    """Raised when the vision service fails or returns unusable data."""


PROMPT = """You are a meticulous nutrition analyst with expert food recognition and OCR skills.

STEP 1 - Classify the image:
  - "label": a Nutrition Facts panel / packaged-food label is the main subject.
  - "meal": a plated meal, snack, drink or raw food.

STEP 2 - Extract:
  If "label": read the printed values with OCR for ONE serving as printed.
    serving_weight_g = the serving size in grams (convert ml/oz if needed).
    sugar_alcohols_g = sum of all polyols (erythritol, maltitol, xylitol, sorbitol, etc.).
    Use printed soluble/insoluble fiber if shown, otherwise estimate a sensible split.
  If "meal": identify each distinct food, estimate its portion weight in grams from
    visual cues (plate size, utensils, hands), then give totals for the WHOLE visible portion.

RULES:
  - Units: grams for macros, kcal for energy. All numbers must be >= 0.
  - total_carbs_g includes fiber, sugars, starch and sugar alcohols.
  - fiber_total_g >= fiber_soluble_g + fiber_insoluble_g.
  - Do NOT calculate net carbs or energy density; the server does that.
  - confidence is 0..1 (how sure you are of the identification and portion).
  - If the image contains no food or label, return an empty "foods" array and confidence 0.
  - notes: one short sentence about assumptions (cooking method, hidden oils, etc.).
Return ONLY JSON matching the schema."""

_NUM = {"type": "NUMBER"}

RESPONSE_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "source_type": {"type": "STRING", "enum": ["meal", "label"]},
        "foods": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "name": {"type": "STRING"},
                    "estimated_weight_g": _NUM,
                    "calories_kcal": _NUM,
                },
                "required": ["name", "estimated_weight_g", "calories_kcal"],
            },
        },
        "confidence": _NUM,
        "serving_weight_g": _NUM,
        "calories_kcal": _NUM,
        "protein_g": _NUM,
        "total_fat_g": _NUM,
        "total_carbs_g": _NUM,
        "fiber_total_g": _NUM,
        "fiber_soluble_g": _NUM,
        "fiber_insoluble_g": _NUM,
        "total_sugars_g": _NUM,
        "added_sugars_g": _NUM,
        "sugar_alcohols_g": _NUM,
        "starch_g": _NUM,
        "notes": {"type": "STRING"},
    },
    "required": [
        "source_type", "foods", "confidence", "serving_weight_g", "calories_kcal",
        "protein_g", "total_fat_g", "total_carbs_g", "fiber_total_g",
        "fiber_soluble_g", "fiber_insoluble_g", "total_sugars_g",
        "added_sugars_g", "sugar_alcohols_g", "starch_g", "notes",
    ],
}


def _extract_json_text(body: dict) -> str:
    """Pull the model's text out of the Gemini response envelope."""
    try:
        parts = body["candidates"][0]["content"]["parts"]
        text = "".join(p.get("text", "") for p in parts)
    except (KeyError, IndexError, TypeError) as exc:
        feedback = body.get("promptFeedback", {})
        raise VisionError(
            f"The vision model returned no content. {feedback or ''}".strip()
        ) from exc
    # Safety net in case the model wraps JSON in markdown fences.
    return re.sub(r"^```(?:json)?\s*|\s*```$", "", text.strip())


async def analyze_image(image_bytes: bytes, mime_type: str) -> RawEstimate:
    settings = get_settings()
    url = f"{GEMINI_BASE}/{settings.gemini_model}:generateContent"

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": PROMPT},
                    {
                        "inline_data": {
                            "mime_type": mime_type,
                            "data": base64.b64encode(image_bytes).decode("ascii"),
                        }
                    },
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 4096,
            "responseMimeType": "application/json",
            "responseSchema": RESPONSE_SCHEMA,
        },
    }
    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": settings.gemini_api_key,
    }

    try:
        async with httpx.AsyncClient(timeout=settings.request_timeout_s) as client:
            response = await client.post(url, headers=headers, json=payload)
    except httpx.HTTPError as exc:
        raise VisionError(f"Could not reach the vision service: {exc}") from exc

    if response.status_code != 200:
        logger.error("Gemini error %s: %s", response.status_code, response.text[:500])
        raise VisionError(
            f"Vision API returned HTTP {response.status_code}. "
            "Check your API key, model name and quota."
        )

    text = _extract_json_text(response.json())
    try:
        return RawEstimate.model_validate(json.loads(text))
    except (json.JSONDecodeError, ValidationError) as exc:
        logger.error("Unparseable model output: %s", text[:500])
        raise VisionError("The vision model returned malformed data. Please retry.") from exc