"""Lyra-Beat FastAPI backend application."""
import logging
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import make_asgi_app, Counter, Histogram
import sentry_sdk
from sentry_sdk.integrations.asgi import SentryAsgiMiddleware

from app.config import settings
from app.models import (
    GenerateScoreRequest,
    GenerateScoreResponse,
    ReviewRequest,
    ReviewResponse,
    HealthResponse,
    MusicalMetadata,
)
from app.services.gemini_service import gemini_service
from app.services.fal_service import fal_service
from app.services.audio_service import audio_service

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Sentry if DSN is configured
if settings.SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        traces_sample_rate=1.0,
    )

app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered beat and sound-bite scoring engine.",
    version="0.1.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Prometheus metrics
REQUEST_COUNT = Counter("lyra_requests_total", "Total requests", ["method", "endpoint", "status"])
REQUEST_LATENCY = Histogram("lyra_request_duration_seconds", "Request latency")
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

# Sentry middleware
if settings.SENTRY_DSN:
    app.add_middleware(SentryAsgiMiddleware)


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    services = {
        "gemini": bool(settings.GEMINI_API_KEY),
        "fal": fal_service.enabled,
    }
    return HealthResponse(status="healthy", services=services)


@app.post("/generate-score", response_model=GenerateScoreResponse)
async def generate_score(request: GenerateScoreRequest):
    """Generate musical metadata and audio from text input."""
    request_id = audio_service.generate_request_id()
    try:
        # 1. Semantic mood analysis via Gemini
        analysis = gemini_service.analyze_mood(request.text, request.style_hint)
        validated = audio_service.validate_metadata(analysis)
        
        # 2. Build rationale
        rationale = analysis.get("rationale", "")
        if not rationale:
            rationale = audio_service.build_rationale(validated, request.text)
        
        # 3. Audio generation via fal.ai
        audio_url = fal_service.generate_audio(validated, request.text)
        
        metadata = MusicalMetadata(
            valence=validated["valence"],
            arousal=validated["arousal"],
            key=validated["key"],
            bpm=validated["bpm"],
            instrumentation=validated["instrumentation"],
            time_signature=validated["time_signature"],
        )
        
        REQUEST_COUNT.labels(method="POST", endpoint="/generate-score", status="200").inc()
        return GenerateScoreResponse(
            success=True,
            metadata=metadata,
            audio_url=audio_url or None,
            musical_rationale=rationale,
            request_id=request_id,
        )
    except Exception as e:
        logger.exception("Error generating score")
        REQUEST_COUNT.labels(method="POST", endpoint="/generate-score", status="500").inc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/review", response_model=ReviewResponse)
async def review_score(request: ReviewRequest):
    """Refine musical metadata based on user feedback."""
    try:
        current_dict = request.current_metadata.model_dump()
        refined = gemini_service.refine_mood(request.feedback, current_dict)
        validated = audio_service.validate_metadata(refined)
        
        rationale = refined.get("rationale", "")
        adjustments = refined.get("adjustments", [])
        
        # Re-generate audio if fal is enabled
        audio_url = ""
        if fal_service.enabled:
            # Use a generic prompt based on refined metadata
            audio_url = fal_service.generate_audio(validated, "Refined composition")
        
        metadata = MusicalMetadata(
            valence=validated["valence"],
            arousal=validated["arousal"],
            key=validated["key"],
            bpm=validated["bpm"],
            instrumentation=validated["instrumentation"],
            time_signature=validated["time_signature"],
        )
        
        REQUEST_COUNT.labels(method="POST", endpoint="/review", status="200").inc()
        return ReviewResponse(
            success=True,
            refined_metadata=metadata,
            audio_url=audio_url or None,
            musical_rationale=rationale,
            adjustments_made=adjustments,
        )
    except Exception as e:
        logger.exception("Error refining score")
        REQUEST_COUNT.labels(method="POST", endpoint="/review", status="500").inc()
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.HOST, port=settings.PORT)
