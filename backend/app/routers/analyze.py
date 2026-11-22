"""POST /api/analyze  - accepts an image, returns a NutritionResult."""

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.config import get_settings
from app.schemas import NutritionResult
from app.services import mock, vision
from app.services.nutrition import build_result

router = APIRouter(prefix="/api", tags=["analysis"])

ALLOWED_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}


@router.get("/health")
async def health():
    """Lets the frontend show whether it is talking to real AI or mock data."""
    settings = get_settings()
    return {
        "status": "ok",
        "mode": "mock" if settings.use_mock else "gemini",
        "model": None if settings.use_mock else settings.gemini_model,
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

    if settings.use_mock:
        raw = await mock.analyze_image(data)
        mode = "mock"
    else:
        try:
            raw = await vision.analyze_image(data, image.content_type)
        except vision.VisionError as exc:
            raise HTTPException(status_code=502, detail=str(exc)) from exc
        mode = "gemini"

    if not raw.foods:
        raise HTTPException(
            status_code=422,
            detail="No food or nutrition label detected. Try a clearer, closer photo.",
        )

    return build_result(raw, mode)