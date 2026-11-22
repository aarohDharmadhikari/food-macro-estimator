"""Deterministic post-processing of the model's raw estimate.

The model only *extracts* values. Everything derived (net carbs, energy
density, fiber totals) is computed here so the formulas are always exact:

    Net Carbs      = Total Carbs - Dietary Fiber - Sugar Alcohols   (min 0)
    Energy Density = Calories / Serving Weight (g)
"""

from app.schemas import FiberBreakdown, NutritionResult, RawEstimate


def _clean(value: float) -> float:
    """Clamp to >= 0 and round to 1 decimal."""
    try:
        number = float(value)
    except (TypeError, ValueError):
        return 0.0
    return round(max(0.0, number), 1)


def _display_name(raw: RawEstimate) -> str:
    names = [f.name.strip() for f in raw.foods if f.name.strip()]
    if not names:
        return "Unknown food"
    if len(names) <= 3:
        return ", ".join(names)
    return ", ".join(names[:3]) + f" +{len(names) - 3} more"


def build_result(raw: RawEstimate, mode: str) -> NutritionResult:
    soluble = _clean(raw.fiber_soluble_g)
    insoluble = _clean(raw.fiber_insoluble_g)
    # Total fiber can never be smaller than its two parts.
    fiber_total = round(max(_clean(raw.fiber_total_g), soluble + insoluble), 1)

    total_carbs = _clean(raw.total_carbs_g)
    sugar_alcohols = _clean(raw.sugar_alcohols_g)
    net_carbs = round(max(0.0, total_carbs - fiber_total - sugar_alcohols), 1)

    calories = _clean(raw.calories_kcal)
    weight = _clean(raw.serving_weight_g)
    density = round(calories / weight, 2) if weight > 0 else 0.0

    confidence = min(1.0, max(0.0, float(raw.confidence)))

    return NutritionResult(
        mode=mode,
        source_type="label" if raw.source_type.lower().startswith("label") else "meal",
        display_name=_display_name(raw),
        foods=raw.foods,
        confidence=round(confidence, 2),
        serving_weight_g=weight,
        calories_kcal=calories,
        energy_density_kcal_per_g=density,
        protein_g=_clean(raw.protein_g),
        total_fat_g=_clean(raw.total_fat_g),
        total_carbs_g=total_carbs,
        fiber=FiberBreakdown(
            total_g=fiber_total, soluble_g=soluble, insoluble_g=insoluble
        ),
        total_sugars_g=_clean(raw.total_sugars_g),
        added_sugars_g=_clean(raw.added_sugars_g),
        sugar_alcohols_g=sugar_alcohols,
        starch_g=_clean(raw.starch_g),
        net_carbs_g=net_carbs,
        notes=raw.notes.strip(),
    )