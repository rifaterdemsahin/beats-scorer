"""Configuration management for Lyra-Beat backend."""
import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    APP_NAME: str = os.getenv("APP_NAME", "Lyra-Beat")
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    PORT: int = int(os.getenv("PORT", "8000"))
    HOST: str = os.getenv("HOST", "0.0.0.0")
    
    # API Keys (managed by Doppler)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    FAL_KEY: str = os.getenv("FAL_KEY", "")
    
    # Sentry
    SENTRY_DSN: str = os.getenv("SENTRY_DSN", "")
    
    # CORS
    ALLOWED_ORIGINS: list = os.getenv("ALLOWED_ORIGINS", "*").split(",")
    
    # Defaults
    DEFAULT_BPM_MIN: int = int(os.getenv("DEFAULT_BPM_MIN", "60"))
    DEFAULT_BPM_MAX: int = int(os.getenv("DEFAULT_BPM_MAX", "180"))

settings = Settings()
