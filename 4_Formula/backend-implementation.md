# 🐍 Formula: Backend Implementation

> **Bounded Context:** FastAPI Backend Services  
> **Stage:** 4_Formula  
> **Date:** 2026-05-03  
> **Stack:** Python 3.11, FastAPI, Pydantic

---

## 📋 Objective

Build a FastAPI backend that:
1. Accepts text input via `POST /generate-score`
2. Analyzes mood using Gemini AI (valence, arousal, key, BPM, instrumentation)
3. Generates audio via fal.ai based on metadata
4. Supports refinement via `POST /review`
5. Exposes health, metrics, and CORS endpoints

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FastAPI Application                      │
│                         (app/main.py)                        │
├─────────────────────────────────────────────────────────────┤
│  Routes          │  Services           │  Config            │
│  ─────────────── │  ────────────────── │  ───────────────── │
│  /health         │  gemini_service     │  Settings (Pydantic│
│  /metrics        │  fal_service        │   based env vars)  │
│  /generate-score │  audio_service      │                    │
│  /review         │                     │                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Dependencies

**File:** `backend/requirements.txt`

```txt
fastapi==0.115.0
uvicorn==0.32.0
python-dotenv==1.0.1
google-generativeai==0.8.3
fal-client==0.4.1
pydantic==2.9.2
python-multipart==0.0.12
httpx==0.27.2
prometheus-client==0.21.0
sentry-sdk==2.18.0
pytest==8.3.4
pytest-asyncio==0.24.0
```

**Rationale:**
- `fastapi` + `uvicorn` — Web framework and ASGI server
- `google-generativeai` — Gemini AI integration
- `fal-client` — fal.ai audio generation
- `pydantic` — Request/response validation
- `prometheus-client` — Metrics exposition
- `sentry-sdk` — Error tracking
- `pytest` — Testing framework

---

## 🔧 Implementation Steps

### Step 1: Configuration Management

**File:** `backend/app/config.py`

```python
import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    APP_NAME: str = os.getenv("APP_NAME", "beats-scorer")
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    PORT: int = int(os.getenv("PORT", "8080"))
    HOST: str = os.getenv("HOST", "0.0.0.0")
    
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    FAL_KEY: str = os.getenv("FAL_KEY", "")
    SENTRY_DSN: str = os.getenv("SENTRY_DSN", "")
    ALLOWED_ORIGINS: list = os.getenv("ALLOWED_ORIGINS", "*").split(",")
    
    DEFAULT_BPM_MIN: int = int(os.getenv("DEFAULT_BPM_MIN", "60"))
    DEFAULT_BPM_MAX: int = int(os.getenv("DEFAULT_BPM_MAX", "180"))

settings = Settings()
```

**Key Design:**
- All secrets read from environment variables (injected by Doppler)
- Sensible defaults for local development
- Single `Settings` instance imported across modules

### Step 2: Pydantic Models

**File:** `backend/app/models.py`

```python
from pydantic import BaseModel, Field
from typing import Optional, List

class GenerateScoreRequest(BaseModel):
    text: str = Field(..., description="Input text", example="The storm grew")
    style_hint: Optional[str] = Field(None, description="Optional genre/style hint")

class MusicalMetadata(BaseModel):
    valence: float = Field(..., ge=-1.0, le=1.0, description="Emotional positivity")
    arousal: float = Field(..., ge=0.0, le=1.0, description="Energy/intensity")
    key: str = Field(..., description="Musical key, e.g. C minor")
    bpm: int = Field(..., ge=20, le=300, description="Tempo in BPM")
    instrumentation: List[str] = Field(default_factory=list, description="List of instruments")
    time_signature: str = Field(default="4/4", description="Time signature")

class GenerateScoreResponse(BaseModel):
    success: bool = True
    metadata: MusicalMetadata
    audio_url: Optional[str] = Field(None, description="URL to generated audio")
    musical_rationale: str = Field(..., description="Explanation of musical choices")
    request_id: str = Field(..., description="Unique request identifier")

class ReviewRequest(BaseModel):
    request_id: str = Field(..., description="ID from original generation")
    feedback: str = Field(..., description="User feedback, e.g. 'Too loud'")
    current_metadata: MusicalMetadata

class ReviewResponse(BaseModel):
    success: bool = True
    refined_metadata: MusicalMetadata
    audio_url: Optional[str] = Field(None, description="URL to refined audio")
    musical_rationale: str = Field(..., description="Explanation of refinement choices")
    adjustments_made: List[str] = Field(default_factory=list, description="List of applied adjustments")

class HealthResponse(BaseModel):
    status: str = "healthy"
    version: str = "0.1.0"
    services: dict = Field(default_factory=dict)
```

**Key Design:**
- Strict validation with Field constraints (`ge`, `le`)
- Self-documenting with descriptions and examples
- Optional fields for graceful degradation (e.g., `audio_url` may be empty)

### Step 3: Gemini AI Service

**File:** `backend/app/services/gemini_service.py`

**Algorithm:**
1. Configure Gemini client with API key
2. Build prompt instructing structured JSON output
3. Parse response, stripping markdown code fences
4. Fallback to safe defaults on any error

**Prompt Engineering:**
```
Analyze the following text and return ONLY a JSON object with these keys:
- valence (float, -1 to 1): emotional positivity
- arousal (float, 0 to 1): energy/intensity
- key (string): suggested musical key
- bpm (int): suggested tempo (20-300)
- instrumentation (list of strings): recommended instruments
- time_signature (string): e.g. "4/4", "6/8"
- rationale (string): brief musical explanation

Text: "{text}"
Style hint: "{style_hint}"

Respond with valid JSON only.
```

**Refinement Prompt:**
```
Given the current musical metadata and user feedback, return ONLY a JSON object with refined values.

Current metadata: {current}
User feedback: "{feedback}"

Rules:
- If feedback mentions "loud", "quiet", "soft", "intense": adjust arousal
- If feedback mentions "happy", "sad", "dark", "bright": adjust valence and key
- If feedback mentions "fast", "slow": adjust BPM
- If feedback mentions specific instruments: update instrumentation

Return JSON with keys: valence, arousal, key, bpm, instrumentation, time_signature, rationale, adjustments (list of strings).
```

**Error Handling:**
- Try/except wraps all Gemini calls
- Returns safe defaults if API fails
- Logs error for observability

### Step 4: fal.ai Audio Service

**File:** `backend/app/services/fal_service.py`

**Algorithm:**
1. Check if `FAL_KEY` is configured
2. Build descriptive prompt from metadata
3. Call `fal-ai/stable-audio` endpoint
4. Return audio URL or empty string on failure

**Prompt Construction:**
```python
fal_prompt = (
    f"{prompt_text}. "
    f"Musical composition in {metadata['key']}, "
    f"{metadata['bpm']} BPM, "
    f"time signature {metadata['time_signature']}. "
    f"Instrumentation: {', '.join(metadata['instrumentation'])}. "
    f"Mood: valence {metadata['valence']:.2f}, arousal {metadata['arousal']:.2f}."
)
```

**Parameters:**
- `seconds`: 15 (short preview)
- `steps`: 50 (generation quality)

### Step 5: Audio Processing Service

**File:** `backend/app/services/audio_service.py`

**Functions:**
- `generate_request_id()` — UUID for request tracing
- `validate_metadata()` — Clamp values to musical ranges
- `build_rationale()` — Generate human-readable explanation

**Validation Logic:**
```python
validated = {
    "valence": max(-1.0, min(1.0, float(metadata.get("valence", 0)))),
    "arousal": max(0.0, min(1.0, float(metadata.get("arousal", 0.5)))),
    "key": str(metadata.get("key", "C major")),
    "bpm": max(20, min(300, int(metadata.get("bpm", 120)))),
    "instrumentation": list(metadata.get("instrumentation", ["piano"])),
    "time_signature": str(metadata.get("time_signature", "4/4")),
}
```

### Step 6: Main Application

**File:** `backend/app/main.py`

**Setup:**
1. Initialize Sentry if `SENTRY_DSN` present
2. Configure CORS middleware
3. Mount Prometheus metrics at `/metrics`
4. Register routes

**Routes:**

| Method | Endpoint | Handler | Description |
|--------|----------|---------|-------------|
| GET | `/health` | `health_check()` | Returns service status + dependency health |
| GET | `/metrics` | Prometheus ASGI app | Exposes request counts and latency histograms |
| POST | `/generate-score` | `generate_score()` | Full pipeline: text → Gemini → fal.ai → response |
| POST | `/review` | `review_score()` | Refinement: feedback → Gemini → re-generate |

**Request Flow (`/generate-score`):**
```
1. Generate request_id (UUID)
2. Call gemini_service.analyze_mood(text, style_hint)
3. Validate metadata with audio_service.validate_metadata()
4. Build rationale (from Gemini or auto-generated)
5. Call fal_service.generate_audio(metadata, text)
6. Return GenerateScoreResponse with metadata + audio_url + rationale
```

**Metrics:**
- `lyra_requests_total` — Counter labeled by method, endpoint, status
- `lyra_request_duration_seconds` — Histogram of request latency

---

## 🧪 Testing

**File:** `backend/tests/test_api.py`

**Test Strategy:**
- Mock Gemini service to avoid requiring real API keys in CI
- Test health endpoint returns 200
- Test metrics endpoint exposes Prometheus data
- Test generate-score returns correct structure
- Test review endpoint applies adjustments
- Test CORS headers are present

**Mock Example:**
```python
def mock_analyze(text, style_hint=None):
    return {
        "valence": -0.5,
        "arousal": 0.8,
        "key": "D minor",
        "bpm": 140,
        "instrumentation": ["synth", "drums"],
        "time_signature": "4/4",
        "rationale": "Dissonance for tension",
    }

monkeypatch.setattr(gemini_module.gemini_service, "analyze_mood", mock_analyze)
```

---

## 📚 File Reference

| File | Lines | Purpose |
|------|-------|---------|
| `backend/app/main.py` | 152 | FastAPI app, routes, middleware |
| `backend/app/config.py` | 27 | Environment configuration |
| `backend/app/models.py` | 39 | Pydantic request/response models |
| `backend/app/services/gemini_service.py` | 93 | Gemini AI mood analysis |
| `backend/app/services/fal_service.py` | 61 | fal.ai audio generation |
| `backend/app/services/audio_service.py` | 56 | Audio utilities & validation |
| `backend/tests/test_api.py` | 97 | Pytest test suite |
| `backend/requirements.txt` | 12 | Python dependencies |

---

## 🎯 Design Decisions

| Decision | Rationale |
|----------|-----------|
| Pydantic v2 | Latest validation, better performance, strict typing |
| Singleton service instances | Avoid re-initializing clients on every request |
| Fallback defaults in Gemini | Prevents total failure if AI service is down |
| Separate `audio_service` | Decouples validation/rationale from AI services |
| Prometheus at `/metrics` | Standard monitoring endpoint for scraping |
| Sentry conditional init | App starts even without Sentry configured |

---

## 🔐 Security

- API keys read exclusively from environment variables
- No secrets in source code
- CORS allows all origins by default (customize for production)
- Input validated via Pydantic models

---

*Created: 2026-05-03*  
*Template: delivery-pilot-template Stage 4*
