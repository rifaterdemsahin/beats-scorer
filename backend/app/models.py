"""Pydantic models for Lyra-Beat API requests and responses."""
from pydantic import BaseModel, Field
from typing import Optional, List

class GenerateScoreRequest(BaseModel):
    text: str = Field(..., description="Input text describing mood/scene", example="The storm grew")
    style_hint: Optional[str] = Field(None, description="Optional genre/style hint")

class MusicalMetadata(BaseModel):
    valence: float = Field(..., ge=-1.0, le=1.0, description="Emotional positivity (-1 to 1)")
    arousal: float = Field(..., ge=0.0, le=1.0, description="Energy/intensity (0 to 1)")
    key: str = Field(..., description="Musical key, e.g. C minor")
    bpm: int = Field(..., ge=20, le=300, description="Tempo in beats per minute")
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
    feedback: str = Field(..., description="User feedback, e.g. 'Too loud' or 'More strings'")
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
