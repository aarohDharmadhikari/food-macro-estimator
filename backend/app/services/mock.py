"""Mock vision backend.

Used automatically when GEMINI_API_KEY is empty, so the whole UI can be
tested immediately. The same image always maps to the same sample result
(chosen from a hash of the image bytes), and one sample imitates a
nutrition-label OCR scan that includes sugar alcohols.
"""

import asyncio
import hashlib
from typing import List

from app.schemas import FoodItem, RawEstimate

_MOCK_NOTE = "Demo data (mock mode). Add GEMINI_API_KEY to backend/.env for real analysis."

_SAMPLES: List[RawEstimate] = [
    RawEstimate(
        source_type="meal",
        foods=[
            FoodItem(name="Grilled chicken breast", estimated_weight_g=150, calories_kcal=248),
            FoodItem(name="Quinoa", estimated_weight_g=140, calories_kcal=168),
            FoodItem(name="Roasted vegetables", estimated_weight_g=130, calories_kcal=144),
        ],
        confidence=0.91,
        serving_weight_g=420,
        calories_kcal=560,
        protein_g=42,
        total_fat_g=20,
        total_carbs_g=52,
        fiber_total_g=9,
        fiber_soluble_g=3.2,
        fiber_insoluble_g=5.8,
        total_sugars_g=8,
        added_sugars_g=0,
        sugar_alcohols_g=0,
        starch_g=30,
        notes=_MOCK_NOTE,
    ),
    RawEstimate(
        source_type="meal",
        foods=[
            FoodItem(name="Pepperoni pizza (2 slices)", estimated_weight_g=220, calories_kcal=620),
        ],
        confidence=0.87,
        serving_weight_g=220,
        calories_kcal=620,
        protein_g=26,
        total_fat_g=28,
        total_carbs_g=66,
        fiber_total_g=4,
        fiber_soluble_g=1.2,
        fiber_insoluble_g=2.8,
        total_sugars_g=8,
        added_sugars_g=3,
        sugar_alcohols_g=0,
        starch_g=50,
        notes=_MOCK_NOTE,
    ),
    RawEstimate(
        source_type="meal",
        foods=[
            FoodItem(name="Oatmeal", estimated_weight_g=240, calories_kcal=190),
            FoodItem(name="Banana", estimated_weight_g=80, calories_kcal=70),
            FoodItem(name="Peanut butter", estimated_weight_g=30, calories_kcal=230),
        ],
        confidence=0.89,
        serving_weight_g=350,
        calories_kcal=490,
        protein_g=16,
        total_fat_g=18,
        total_carbs_g=66,
        fiber_total_g=10,
        fiber_soluble_g=4.5,
        fiber_insoluble_g=5.5,
        total_sugars_g=20,
        added_sugars_g=6,
        sugar_alcohols_g=0,
        starch_g=32,
        notes=_MOCK_NOTE,
    ),
    RawEstimate(
        source_type="label",
        foods=[FoodItem(name="High-protein bar (label scan)", estimated_weight_g=60, calories_kcal=220)],
        confidence=0.96,
        serving_weight_g=60,
        calories_kcal=220,
        protein_g=20,
        total_fat_g=8,
        total_carbs_g=24,
        fiber_total_g=10,
        fiber_soluble_g=8,
        fiber_insoluble_g=2,
        total_sugars_g=2,
        added_sugars_g=1,
        sugar_alcohols_g=8,
        starch_g=2,
        notes=_MOCK_NOTE,
    ),
]


async def analyze_image(image_bytes: bytes) -> RawEstimate:
    """Pretend to analyse the image (with a short delay for realistic UX)."""
    await asyncio.sleep(1.2)
    digest = hashlib.sha256(image_bytes).digest()
    return _SAMPLES[digest[0] % len(_SAMPLES)].model_copy(deep=True)