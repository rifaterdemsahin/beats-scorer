# 🧪 Lyra-Beat Runbook — How to Run This Repository

> **Location:** `4_Formula/runbook.md`  
> **Purpose:** Step-by-step guide to clone, configure, and run the Lyra-Beat (beats-scorer) project locally and deploy to production.  
> **Template:** Based on [delivery-pilot-template](https://github.com/rifaterdemsahin/delivery-pilot-template)

---

## 📋 Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Quick Start (Local Development)](#2-quick-start-local-development)
3. [Full Setup Guide](#3-full-setup-guide)
4. [Running with Docker](#4-running-with-docker)
5. [Running Tests](#5-running-tests)
6. [Production Deployment (Fly.io)](#6-production-deployment-flyio)
7. [Secrets Management (Doppler)](#7-secrets-management-doppler)
8. [Architecture Overview](#8-architecture-overview)
9. [Known Gaps & Blockers](#9-known-gaps--blockers)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Prerequisites

| Tool | Version | Purpose | Install Command |
|------|---------|---------|-----------------|
| Python | 3.11+ | Backend runtime | `brew install python@3.11` |
| Node.js | 20+ | Frontend runtime | `brew install node` |
| Docker | Latest | Containerization | [Docker Desktop](https://www.docker.com/products/docker-desktop) |
| Git | Latest | Version control | `brew install git` |
| Flyctl | Latest | Fly.io CLI | `brew install flyctl` |
| Doppler CLI | Latest | Secrets management | `brew install dopplerhq/cli/doppler` |

**Verify installations:**
```bash
python3 --version      # 3.11.x
node --version         # v20+
docker --version       # 24+
flyctl version         # 0.2+
doppler --version      # 3+
```

---

## 2. Quick Start (Local Development)

### 2.1 Clone the Repository

```bash
git clone https://github.com/rifaterdemsahin/beats-scorer.git
cd beats-scorer
```

### 2.2 Set Up Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your API keys (see Section 7 for Doppler setup)
nano .env
```

**Minimum required for local run:**
```env
GEMINI_API_KEY=your_gemini_key_here
FAL_KEY=your_fal_key_here
```

### 2.3 Start the Backend

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt

# Run the server
cd backend
uvicorn app.main:app --reload --port 8000
```

**Backend will be available at:** `http://localhost:8000`

**API Documentation (auto-generated):**
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### 2.4 Start the Frontend (in a new terminal)

```bash
cd frontend
npm install
npm run dev
```

**Frontend will be available at:** `http://localhost:3000`

### 2.5 Test the Integration

1. Open `http://localhost:3000` in your browser
2. Type a sentence like: *"The storm grew over the dark ocean"*
3. Click **Generate Music**
4. The backend will:
   - Analyze mood via Gemini AI
   - Generate audio via fal.ai
   - Return metadata + audio URL

---

## 3. Full Setup Guide

### 3.1 Backend Deep Dive

```bash
cd backend

# Install dev dependencies (includes pytest)
pip install -r requirements.txt

# Verify imports work
python -c "from app.main import app; print('✅ Backend imports OK')"

# Run with auto-reload (development)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run production-style (no reload)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2
```

**Key Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check + service status |
| GET | `/metrics` | Prometheus metrics |
| POST | `/generate-score` | Generate music from text |
| POST | `/review` | Refine based on feedback |

**Example API Call:**
```bash
curl -X POST http://localhost:8000/generate-score \
  -H "Content-Type: application/json" \
  -d '{"text": "The storm grew", "style_hint": "cinematic"}'
```

### 3.2 Frontend Deep Dive

```bash
cd frontend

# Install dependencies
npm install

# Development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

**Frontend Architecture:**
- `pages/index.tsx` — Main application page
- `components/AudioPlayer.tsx` — Custom audio player with seek/volume
- `components/MoodVisualizer.tsx` — 2D valence/arousal visualization
- `components/FeedbackForm.tsx` — User feedback collection
- `styles/globals.css` — Tailwind v4 theming

---

## 4. Running with Docker

### 4.1 Full Stack (Backend + Qdrant)

```bash
# Make sure you have .env file with API keys
docker-compose up --build
```

**Services:**
- API: `http://localhost:8080`
- Qdrant (vector DB): `http://localhost:6333`

### 4.2 Backend Only

```bash
docker build -t beats-scorer .
docker run -p 8080:8080 --env-file .env beats-scorer
```

### 4.3 Frontend Only (Docker)

```bash
cd frontend
docker build -f Dockerfile.frontend -t beats-scorer-frontend .
docker run -p 3000:3000 beats-scorer-frontend
```

---

## 5. Running Tests

### 5.1 Backend Tests

```bash
cd backend

# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_api.py -v
```

**Test Coverage:**
- ✅ Health endpoint (`/health`)
- ✅ Metrics endpoint (`/metrics`)
- ✅ Generate score with mocked Gemini
- ✅ Review/refine with mocked Gemini
- ✅ CORS headers validation

### 5.2 Frontend Tests

```bash
cd frontend

# Add test dependencies first
npm install --save-dev jest @testing-library/react @testing-library/jest-dom

# Run tests (when configured)
npm test
```

---

## 6. Production Deployment (Fly.io)

### 6.1 Prerequisites

1. **Fly.io account** — Sign up at [fly.io](https://fly.io)
2. **Flyctl authenticated:**
   ```bash
   flyctl auth login
   ```
3. **Doppler project configured** (see Section 7)

### 6.2 Deploy

```bash
# Using Doppler (recommended)
doppler run -- flyctl deploy --remote-only

# Or using GitHub Actions (automatic on push to main)
git push origin main
```

### 6.3 Verify Deployment

```bash
# Check app status
flyctl status --app lyra-beat

# View logs
flyctl logs --app lyra-beat

# Open in browser
flyctl open --app lyra-beat
```

**Production URL:** `https://lyra-beat.fly.dev`

---

## 7. Secrets Management (Doppler)

### 7.1 Why Doppler?

All API keys and tokens are managed via Doppler. **Never commit secrets to git.**

### 7.2 Setup Steps

```bash
# 1. Login to Doppler
doppler login

# 2. Set up project
doppler setup --project lyra-beat --config dev

# 3. Add secrets (one by one or via script)
doppler secrets set GEMINI_API_KEY "your_key"
doppler secrets set FAL_KEY "your_key"
doppler secrets set SENTRY_DSN "your_dsn"

# 4. Verify
doppler secrets

# 5. Run app with Doppler
doppler run -- python backend/app/main.py
```

### 7.3 Using the Setup Script

```bash
# Export your keys as environment variables first
export GEMINI_API_KEY="..."
export FAL_KEY="..."
export OPENROUTER_API_KEY="..."
export OPENAI_API_KEY="..."
export CLAUDE_API_KEY="..."
export XAI_API_KEY="..."
export FLY_API_TOKEN="..."

# Run the automated setup
./scripts/setup-doppler.sh
```

### 7.4 GitHub Actions + Doppler

1. Get a **Service Token** from Doppler dashboard
2. Add to GitHub secrets:
   ```bash
   export DOPPLER_TOKEN="dp.st.xxx"
   ./scripts/setup-github-secrets.sh
   ```

---

## 8. Architecture Overview

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   User Input    │─────▶│  Next.js Frontend │─────▶│  FastAPI Backend │
│  (Text/Speech)  │      │   localhost:3000  │      │  localhost:8000 │
└─────────────────┘      └──────────────────┘      └────────┬────────┘
                                                            │
                              ┌─────────────────────────────┼─────────────────────────────┐
                              │                             │                             │
                              ▼                             ▼                             ▼
                    ┌─────────────────┐          ┌──────────────────┐          ┌─────────────────┐
                    │   Gemini AI     │          │    fal.ai        │          │   Prometheus    │
                    │  (Mood Analysis)│          │ (Audio Generate) │          │   (Metrics)     │
                    └─────────────────┘          └──────────────────┘          └─────────────────┘
```

**Data Flow:**
1. User types text → Frontend
2. Frontend POSTs to `/generate-score`
3. Backend sends text to **Gemini** → gets musical metadata
4. Backend sends metadata to **fal.ai** → gets audio URL
5. Backend returns metadata + audio URL + rationale
6. Frontend displays mood visualization + plays audio
7. User provides feedback → Frontend POSTs to `/review`
8. Backend refines metadata via Gemini → re-generates audio

---

## 9. Known Gaps & Blockers

### 🔴 Critical (Must Fix Before Running)

| # | Gap | Impact | Fix |
|---|-----|--------|-----|
| 1 | **Missing `.env` file** | Backend crashes on startup without API keys | `cp .env.example .env` and fill in keys |
| 2 | **`.env.keys` not tracked** | No reference for which keys are needed | Document in README or create a secure vault reference |
| 3 | **No root startup script** | Must run backend + frontend in separate terminals manually | Create `Makefile` or `start.sh` |
| 4 | **Fly.io app name mismatch** | `fly.toml` uses `lyra-beat` but repo is `beats-scorer` | Rename app in `fly.toml` or create new Fly app |
| 5 | **Backend port inconsistency** | Config defaults to 8000, but Dockerfile/fly.toml use 8080 | Standardize on 8080 everywhere |

### 🟡 High (Should Fix for Smooth Operation)

| # | Gap | Impact | Fix |
|---|-----|--------|-----|
| 6 | **No `.dockerignore`** | Docker build is slow, copies `.git`, `node_modules`, etc. | Add `.dockerignore` file |
| 7 | **Missing `package-lock.json`** | Non-deterministic npm installs | Run `npm install` and commit lock file |
| 8 | **Frontend API rewrites** | `next.config.js` rewrites `/api/*` but backend has no `/api` prefix | Remove rewrites or add `/api` prefix to backend |
| 9 | **CORS may fail** | `ALLOWED_ORIGINS` defaults to `*` which works but is insecure | Set explicit `http://localhost:3000` in dev |
| 10 | **No frontend tests** | No test coverage for React components | Add Jest + React Testing Library setup |

### 🟢 Medium (Nice to Have)

| # | Gap | Impact | Fix |
|---|-----|--------|-----|
| 11 | **No `Makefile`** | Must remember multiple commands | Create `Makefile` with `make dev`, `make test`, `make deploy` |
| 12 | **No dependency lock for Python** | `requirements.txt` without pinned hashes | Use `pip freeze > requirements.lock.txt` or Poetry |
| 13 | **Missing `Procfile`** | Heroku/alternative deployment harder | Add `Procfile` with web worker |
| 14 | **No `app.json` for Fly** | `fly launch` won't auto-configure | Add `app.json` with build hints |
| 15 | **No pre-commit hooks** | Code quality not enforced | Add `.pre-commit-config.yaml` with black, flake8 |
| 16 | **Backend test may fail** | `gemini_service` initializes on import, may error without key | Add `pytest` fixtures or lazy initialization |
| 17 | **Tailwind v4 bleeding edge** | `@theme` and `@import "tailwindcss"` may break | Pin to stable v3 or ensure v4 compatibility |
| 18 | **No health check for frontend** | No way to verify UI is serving | Add simple health endpoint or build check |
| 19 | **No logging configuration** | Uses default logging, no rotation or structured logs | Add `logging.conf` or structlog |
| 20 | **Missing API rate limiting** | No protection against abuse | Add `slowapi` or nginx rate limiting |

---

## 10. Troubleshooting

### Issue: Backend won't start

```bash
# Check if port is in use
lsof -i :8000

# Verify environment variables
python -c "import os; print(os.getenv('GEMINI_API_KEY', 'NOT SET'))"

# Test imports
python -c "from app.main import app; print('OK')"
```

### Issue: Frontend can't connect to backend

```bash
# 1. Check backend is running
curl http://localhost:8000/health

# 2. Check CORS headers
curl -I -X OPTIONS http://localhost:8000/generate-score \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST"

# 3. Check frontend env var
echo $NEXT_PUBLIC_API_URL  # Should be http://localhost:8000
```

### Issue: Gemini API errors

```bash
# Test Gemini directly
python -c "
import google.generativeai as genai
genai.configure(api_key='YOUR_KEY')
model = genai.GenerativeModel('gemini-1.5-flash')
print(model.generate_content('Say hello'))
"
```

### Issue: fal.ai audio generation fails

```bash
# Check FAL_KEY is set
echo $FAL_KEY

# Test fal client
python -c "
import fal_client
result = fal_client.subscribe('fal-ai/stable-audio', {'prompt': 'test', 'seconds': 5})
print(result)
"
```

### Issue: Docker build fails

```bash
# Clean build
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

### Issue: Tests fail

```bash
# Run with verbose output
cd backend
pytest -v -s

# Run single test
pytest tests/test_api.py::TestHealthEndpoint::test_health_returns_200 -v
```

---

## 🧪 Testing Checklist

- [ ] Clone repo and follow Quick Start — works end-to-end
- [ ] `.env` file created and populated
- [ ] Backend starts without import errors
- [ ] Frontend compiles without errors
- [ ] `/generate-score` returns valid JSON with mocked Gemini
- [ ] `/review` refines metadata correctly
- [ ] Audio player loads and plays (if fal.ai key provided)
- [ ] Docker Compose starts all services
- [ ] Fly.io deployment succeeds
- [ ] Doppler secrets inject correctly

---

## 📚 Related Documents

| Document | Location | Purpose |
|----------|----------|---------|
| `.env.example` | Root | Environment variable template |
| `docker-compose.yml` | Root | Local orchestration |
| `fly.toml` | Root | Fly.io deployment config |
| `backend/requirements.txt` | `backend/` | Python dependencies |
| `frontend/package.json` | `frontend/` | Node.js dependencies |
| `scripts/setup-doppler.sh` | `scripts/` | Automated Doppler setup |
| `README.md` | Root | High-level project overview |

---

*Last updated: 2026-05-03*  
*Maintainer: AI Assistant*  
*Template: delivery-pilot-template Stage 4*
