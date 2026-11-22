"""POST /api/analyze  - accepts an image, returns a NutritionResult."""

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.config import get_settings
from app.schemas import NutritionResult
from app.services import vision
from app.services.nutrition import build_result

router = APIRouter(prefix="/api", tags=["analysis"])

ALLOWED_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}


@router.get("/health")
async def health():
    """Returns the status of the local analysis engine."""
    return {
        "status": "ok",
        "mode": "production",
        "model": "Local Vision & Nutrition Engine",
    }


@router.post("/analyze", response_model=NutritionResult)
async def analyze(image: UploadFile = File(...)):
    settings = get_settings()

    if image.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=415, detail="Unsupported file type. Use JPG, PNG or WEBP."
        )

    data = await image.read()
    if not data:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")
    if len(data) > settings.max_upload_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"Image too large. Maximum size is {settings.max_upload_mb} MB.",
        )

    try:
        raw = await vision.analyze_image(data, image.filename)
    except vision.VisionError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    if not raw.foods:
        raise HTTPException(
            status_code=422,
            detail="No food or nutrition label detected. Try a clearer, closer photo.",
        )

    # We use "live" mode internally so build_result doesn't add mock banners
    return build_result(raw, "live")
