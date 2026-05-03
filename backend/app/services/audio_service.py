"""Audio processing and utility service."""
import logging
import uuid

logger = logging.getLogger(__name__)

class AudioService:
    @staticmethod
    def generate_request_id() -> str:
        return str(uuid.uuid4())
    
    @staticmethod
    def validate_metadata(metadata: dict) -> dict:
        """Ensure metadata values are within acceptable musical ranges."""
        validated = {
            "valence": max(-1.0, min(1.0, float(metadata.get("valence", 0)))),
            "arousal": max(0.0, min(1.0, float(metadata.get("arousal", 0.5)))),
            "key": str(metadata.get("key", "C major")),
            "bpm": max(20, min(300, int(metadata.get("bpm", 120)))),
            "instrumentation": list(metadata.get("instrumentation", ["piano"])),
            "time_signature": str(metadata.get("time_signature", "4/4")),
        }
        return validated
    
    @staticmethod
    def build_rationale(metadata: dict, original_text: str) -> str:
        """Build a human-readable musical rationale."""
        valence = metadata.get("valence", 0)
        arousal = metadata.get("arousal", 0.5)
        key = metadata.get("key", "C major")
        bpm = metadata.get("bpm", 120)
        instruments = metadata.get("instrumentation", ["piano"])
        
        mood_desc = []
        if valence < -0.3:
            mood_desc.append("dissonance and minor tonalities for tension")
        elif valence > 0.3:
            mood_desc.append("consonant harmonies for uplift")
        else:
            mood_desc.append("neutral tonal balance")
        
        if arousal > 0.7:
            mood_desc.append("driving rhythms and high dynamics")
        elif arousal < 0.3:
            mood_desc.append("sparse texture and low dynamics")
        else:
            mood_desc.append("moderate rhythmic activity")
        
        rationale = (
            f"Given the input '{original_text}', the music uses {key} at {bpm} BPM. "
            f"Instrumentation includes {', '.join(instruments)}. "
            f"Musically, this employs {'; '.join(mood_desc)} to match the described scene."
        )
        return rationale

audio_service = AudioService()
