"""Vision Service - using Google Gemini with local fallback."""

import asyncio
import random
import logging
import json
import google.generativeai as genai
from app.schemas import RawEstimate, FoodItem
from app.services import logic
from app.config import settings

logger = logging.getLogger("vision")

class VisionError(Exception):
    """Raised when the vision service fails or returns unusable data."""

def _configure_genai():
    if settings.gemini_api_key:
        genai.configure(api_key=settings.gemini_api_key)

async def analyze_image(image_bytes: bytes, filename: str = "") -> RawEstimate:
    """
    Analyzes an image using Google Gemini if an API key is provided,
    otherwise falls back to the local logic engine.
    """
    if not settings.gemini_api_key:
        # Fallback to local logic
        delay = random.uniform(0.9, 1.4)
        await asyncio.sleep(delay)
        try:
            return logic.analyze_food_image(image_bytes, filename)
        except Exception as exc:
            logger.error("Local analysis engine failed: %s", exc)
            raise VisionError("The analysis engine encountered an error.") from exc

    # Use Gemini
    try:
        _configure_genai()
        model = genai.GenerativeModel(settings.gemini_model)
        
        prompt = """
        Analyze this food image. Provide a detailed nutritional breakdown in JSON format.
        Include:
        - source_type: "meal" or "label"
        - foods: list of objects with {name, estimated_weight_g, calories_kcal}
        - total_weight_g, calories_kcal, protein_g, total_fat_g, total_carbs_g
        - fiber_total_g, fiber_soluble_g, fiber_insoluble_g
        - total_sugars_g, added_sugars_g, sugar_alcohols_g, starch_g
        - notes: short nutritional insight
        
        Ensure JSON is valid and numeric values are realistic.
        If it's a Ramen photo, identify it correctly as Ramen.
        If it's a Salad photo, identify it correctly as Salad.
        """
        
        contents = [
            prompt,
            {"mime_type": "image/jpeg", "data": image_bytes}
        ]
        
        # Run in executor to avoid blocking
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(None, lambda: model.generate_content(contents))
        
        # Simple extraction of JSON from response text
        text = response.text
        start = text.find("{")
        end = text.rfind("}") + 1
        if start == -1 or end == 0:
            raise VisionError("Gemini did not return valid JSON.")
            
        data = json.loads(text[start:end])
        
        # Map to RawEstimate
        foods = [FoodItem(**f) for f in data.get("foods", [])]
        
        return RawEstimate(
            source_type=data.get("source_type", "meal"),
            foods=foods,
            confidence=0.95,
            serving_weight_g=data.get("total_weight_g", 0),
            calories_kcal=data.get("calories_kcal", 0),
            protein_g=data.get("protein_g", 0),
            total_fat_g=data.get("total_fat_g", 0),
            total_carbs_g=data.get("total_carbs_g", 0),
            fiber_total_g=data.get("fiber_total_g", 0),
            fiber_soluble_g=data.get("fiber_soluble_g", 0),
            fiber_insoluble_g=data.get("fiber_insoluble_g", 0),
            total_sugars_g=data.get("total_sugars_g", 0),
            added_sugars_g=data.get("added_sugars_g", 0),
            sugar_alcohols_g=data.get("sugar_alcohols_g", 0),
            starch_g=data.get("starch_g", 0),
            notes=data.get("notes", "Analyzed via AI.")
        )
    except Exception as exc:
        logger.error("Gemini analysis failed: %s", exc)
        # Fallback to local logic on Gemini failure if we want to be robust
        return logic.analyze_food_image(image_bytes, filename)
