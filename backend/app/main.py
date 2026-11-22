"""FastAPI entry point.

Run from the `backend` folder:
    uvicorn app.main:app --reload --port 8000
"""

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import analyze

logging.basicConfig(level=logging.INFO)

settings = get_settings()

app = FastAPI(
    title="Food Calorie & Macro Estimator API",
    version="1.0.0",
    description="Vision + OCR powered nutrition estimation.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router)


@app.get("/")
async def root():
    return {
        "name": "Food Calorie & Macro Estimator API",
        "mode": "mock" if settings.use_mock else "gemini",
        "docs": "/docs",
    }