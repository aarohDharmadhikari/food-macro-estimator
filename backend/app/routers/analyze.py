"""POST /api/analyze - accepts an image & engine mode, returns a NutritionResult."""

from fastapi import APIRouter, File, Form, HTTPException, Query, UploadFile

from app.config import get_settings
from app.schemas import NutritionResult
from app.services import vision
from app.services.nutrition import build_result

router = APIRouter(prefix="/api", tags=["analysis"])

ALLOWED_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}


@router.get("/health")
async def health():
    """Returns the status and capabilities of the analysis engine."""
    settings = get_settings()
    has_gemini = bool(settings.gemini_api_key)
    return {
        "status": "ok",
        "mode": "gemini" if has_gemini else "local",
        "model": settings.gemini_model if has_gemini else "Local Computer Vision Engine",
        "online_available": has_gemini,
        "local_available": True,
    }


@router.post("/analyze", response_model=NutritionResult)
async def analyze(
    image: UploadFile = File(...),
    engine: str = Form("online"),
):
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

    # Normalize engine selection ("online" or "local")
    chosen_engine = engine.strip().lower()
    if chosen_engine not in ("online", "local"):
        chosen_engine = "online"

    try:
        raw = await vision.analyze_image(data, image.filename, engine=chosen_engine)
    except vision.VisionError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    if not raw.foods:
        raise HTTPException(
            status_code=422,
            detail="No food or nutrition label detected. Try a clearer, closer photo.",
        )

    return build_result(raw, "gemini" if chosen_engine == "online" else "local")
