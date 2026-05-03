"""Gemini AI service for semantic mood analysis."""
import logging
import google.generativeai as genai
from app.config import settings

logger = logging.getLogger(__name__)

genai.configure(api_key=settings.GEMINI_API_KEY)

class GeminiService:
    def __init__(self):
        self.model = genai.GenerativeModel("gemini-1.5-flash")
    
    def analyze_mood(self, text: str, style_hint: str = None) -> dict:
        """Analyze text to extract musical metadata."""
        style_part = f"\nStyle hint: {style_hint}" if style_hint else ""
        prompt = f"""Analyze the following text and return ONLY a JSON object with these keys:
- valence (float, -1 to 1): emotional positivity
- arousal (float, 0 to 1): energy/intensity
- key (string): suggested musical key, e.g. "C minor", "F# major"
- bpm (int): suggested tempo in BPM (20-300)
- instrumentation (list of strings): recommended instruments
- time_signature (string): e.g. "4/4", "6/8"
- rationale (string): brief musical explanation of choices

Text: "{text}"{style_part}

Respond with valid JSON only."""
        try:
            response = self.model.generate_content(prompt)
            raw = response.text.strip()
            # Strip markdown code fences if present
            if raw.startswith("```"):
                raw = raw.split("\n", 1)[1]
            if raw.endswith("```"):
                raw = raw.rsplit("\n", 1)[0]
            if raw.startswith("json"):
                raw = raw.split("\n", 1)[1]
            import json
            data = json.loads(raw.strip())
            logger.info("Gemini mood analysis completed for input: %s", text[:50])
            return data
        except Exception as e:
            logger.error("Gemini analysis failed: %s", e)
            # Return safe defaults
            return {
                "valence": 0.0,
                "arousal": 0.5,
                "key": "C major",
                "bpm": 120,
                "instrumentation": ["piano", "strings"],
                "time_signature": "4/4",
                "rationale": f"Default fallback due to analysis error: {str(e)}"
            }
    
    def refine_mood(self, feedback: str, current: dict) -> dict:
        """Refine musical metadata based on user feedback."""
        prompt = f"""Given the current musical metadata and user feedback, return ONLY a JSON object with refined values and a rationale.

Current metadata:
{current}

User feedback: "{feedback}"

Rules:
- If feedback mentions "loud", "quiet", "soft", "intense": adjust arousal and instrumentation accordingly.
- If feedback mentions "happy", "sad", "dark", "bright": adjust valence and key accordingly.
- If feedback mentions "fast", "slow": adjust BPM accordingly.
- If feedback mentions specific instruments: update instrumentation list.

Return JSON with keys: valence, arousal, key, bpm, instrumentation, time_signature, rationale, adjustments (list of strings describing what changed)."""
        try:
            response = self.model.generate_content(prompt)
            raw = response.text.strip()
            if raw.startswith("```"):
                raw = raw.split("\n", 1)[1]
            if raw.endswith("```"):
                raw = raw.rsplit("\n", 1)[0]
            if raw.startswith("json"):
                raw = raw.split("\n", 1)[1]
            import json
            data = json.loads(raw.strip())
            logger.info("Gemini refinement completed for feedback: %s", feedback[:50])
            return data
        except Exception as e:
            logger.error("Gemini refinement failed: %s", e)
            return {
                **current,
                "rationale": f"Refinement fallback due to error: {str(e)}",
                "adjustments": ["No adjustments applied due to service error"]
            }

gemini_service = GeminiService()
