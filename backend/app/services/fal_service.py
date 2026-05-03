"""fal.ai service for audio generation."""
import logging
import os
from app.config import settings

logger = logging.getLogger(__name__)

# fal-client uses FAL_KEY env var internally
os.environ.setdefault("FAL_KEY", settings.FAL_KEY)

class FalService:
    def __init__(self):
        self.enabled = bool(settings.FAL_KEY)
        if self.enabled:
            try:
                import fal_client
                self.client = fal_client
                logger.info("fal.ai client initialized")
            except Exception as e:
                logger.warning("fal.ai client import failed: %s", e)
                self.enabled = False
                self.client = None
        else:
            self.client = None
            logger.warning("FAL_KEY not set; audio generation disabled")
    
    def generate_audio(self, metadata: dict, prompt_text: str) -> str:
        """Generate audio via fal.ai based on musical metadata."""
        if not self.enabled or not self.client:
            logger.info("fal.ai disabled; returning placeholder URL")
            return ""
        
        # Build a descriptive prompt for audio generation
        fal_prompt = (
            f"{prompt_text}. "
            f"Musical composition in {metadata.get('key', 'C major')}, "
            f"{metadata.get('bpm', 120)} BPM, "
            f"time signature {metadata.get('time_signature', '4/4')}. "
            f"Instrumentation: {', '.join(metadata.get('instrumentation', ['piano']))}. "
            f"Mood: valence {metadata.get('valence', 0):.2f}, arousal {metadata.get('arousal', 0.5):.2f}."
        )
        
        try:
            # Use fal.ai's stable-audio or similar endpoint
            result = self.client.subscribe(
                "fal-ai/stable-audio",
                arguments={
                    "prompt": fal_prompt,
                    "seconds": 15,
                    "steps": 50,
                },
                with_logs=False,
            )
            audio_url = result.get("audio", {}).get("url", "")
            logger.info("fal.ai audio generated: %s", audio_url[:80])
            return audio_url
        except Exception as e:
            logger.error("fal.ai generation failed: %s", e)
            return ""

fal_service = FalService()
