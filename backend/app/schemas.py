"""Pydantic models.

RawEstimate  -> what the vision model returns (validated, not trusted).
NutritionResult -> what the API returns to the frontend (adds derived metrics).
"""

from typing import List

from pydantic import BaseModel, Field


class FoodItem(BaseModel):
    name: str
    estimated_weight_g: float = 0.0
    calories_kcal: float = 0.0


class RawEstimate(BaseModel):
    """Structured JSON extracted by the vision / OCR model."""

    source_type: str = "meal"  # "meal" or "label"
    foods: List[FoodItem] = Field(default_factory=list)
    confidence: float = 0.5  # 0..1
    serving_weight_g: float = 0.0
    calories_kcal: float = 0.0
    protein_g: float = 0.0
    total_fat_g: float = 0.0
    total_carbs_g: float = 0.0
    fiber_total_g: float = 0.0
    fiber_soluble_g: float = 0.0
    fiber_insoluble_g: float = 0.0
    total_sugars_g: float = 0.0
    added_sugars_g: float = 0.0
    sugar_alcohols_g: float = 0.0
    starch_g: float = 0.0
    notes: str = ""


class FiberBreakdown(BaseModel):
    total_g: float
    soluble_g: float
    insoluble_g: float


class NutritionResult(BaseModel):
    """Final payload sent to the frontend."""

    mode: str  # "gemini" or "mock"
    source_type: str  # "meal" or "label"
    display_name: str
    foods: List[FoodItem]
    confidence: float  # 0..1
    serving_weight_g: float

    calories_kcal: float
    energy_density_kcal_per_g: float

    protein_g: float
    total_fat_g: float
    total_carbs_g: float

    fiber: FiberBreakdown
    total_sugars_g: float
    added_sugars_g: float
    sugar_alcohols_g: float
    starch_g: float
    net_carbs_g: float  # total carbs - fiber - sugar alcohols (never below 0)

    notes: str = ""