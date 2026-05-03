"""Basic API tests for beats-scorer backend."""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

class TestHealthEndpoint:
    def test_health_returns_200(self):
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "services" in data

class TestMetricsEndpoint:
    def test_metrics_returns_prometheus(self):
        response = client.get("/metrics")
        assert response.status_code == 200
        assert "lyra_requests_total" in response.text or "python_info" in response.text

class TestGenerateScoreEndpoint:
    def test_generate_score_returns_structure(self, monkeypatch):
        # Mock Gemini to avoid requiring a real API key during tests
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
        
        import app.services.gemini_service as gemini_module
        monkeypatch.setattr(gemini_module.gemini_service, "analyze_mood", mock_analyze)
        
        payload = {"text": "The storm grew", "style_hint": "cinematic"}
        response = client.post("/generate-score", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "metadata" in data
        assert data["metadata"]["key"] == "D minor"
        assert data["metadata"]["bpm"] == 140
        assert "musical_rationale" in data
        assert "request_id" in data

    def test_generate_score_missing_text(self):
        response = client.post("/generate-score", json={})
        assert response.status_code == 422

class TestReviewEndpoint:
    def test_review_returns_refined_metadata(self, monkeypatch):
        def mock_refine(feedback, current):
            return {
                "valence": 0.2,
                "arousal": 0.4,
                "key": "C major",
                "bpm": 100,
                "instrumentation": ["piano", "strings"],
                "time_signature": "4/4",
                "rationale": "Reduced intensity based on feedback",
                "adjustments": ["Lowered arousal", "Reduced BPM"],
            }
        
        import app.services.gemini_service as gemini_module
        monkeypatch.setattr(gemini_module.gemini_service, "refine_mood", mock_refine)
        
        payload = {
            "request_id": "test-uuid-1234",
            "feedback": "Too loud",
            "current_metadata": {
                "valence": 0.0,
                "arousal": 0.9,
                "key": "E minor",
                "bpm": 160,
                "instrumentation": ["electric guitar", "drums"],
                "time_signature": "4/4",
            },
        }
        response = client.post("/review", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "refined_metadata" in data
        assert data["adjustments_made"] == ["Lowered arousal", "Reduced BPM"]

class TestCORS:
    def test_cors_headers_present(self):
        response = client.options("/health", headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "GET",
        })
        assert response.status_code == 200
        assert "access-control-allow-origin" in response.headers
