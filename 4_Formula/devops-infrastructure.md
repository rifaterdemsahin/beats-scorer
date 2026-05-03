# 🚀 Formula: DevOps & Infrastructure

> **Bounded Context:** Deployment, CI/CD, Containers, Secrets  
> **Stage:** 4_Formula  
> **Date:** 2026-05-03  
> **Platforms:** Fly.io, GitHub Actions, Docker, Doppler

---

## 📋 Objective

Establish a complete DevOps pipeline:
1. Containerize the backend with Docker
2. Deploy to Fly.io with health checks
3. Automate CI/CD with GitHub Actions
4. Manage secrets securely with Doppler
5. Support local development with Docker Compose

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      DevOps Pipeline                          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   Developer Push ──▶ GitHub ──▶ GitHub Actions               │
│                                      │                       │
│                                      ▼                       │
│                              ┌──────────────┐               │
│                              │   Test Job   │               │
│                              │  - Checkout  │               │
│                              │  - Setup Py  │               │
│                              │  - Install   │               │
│                              │  - pytest    │               │
│                              └──────┬───────┘               │
│                                     │ Pass                  │
│                                     ▼                      │
│                              ┌──────────────┐               │
│                              │  Deploy Job  │               │
│                              │  - Checkout  │               │
│                              │  - Doppler   │               │
│                              │  - Flyctl    │               │
│                              │  - Deploy    │               │
│                              └──────┬───────┘               │
│                                     │                      │
│                                     ▼                      │
│                           ┌─────────────────┐               │
│                           │   Fly.io         │               │
│                           │  - Docker Build  │               │
│                           │  - Health Check  │               │
│                           │  - Live App      │               │
│                           └─────────────────┘               │
│                                                              │
│   Secrets Flow:                                             │
│   Doppler ──▶ GitHub Actions ──▶ Fly.io Runtime             │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔧 Implementation Steps

### Step 1: Dockerfile

**File:** `Dockerfile`

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY backend/ .

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8080/health')" || exit 1

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
```

**Optimizations:**
- `python:3.11-slim` — Smaller base image
- `--no-install-recommends` — Reduce layer size
- `--no-cache-dir` — Prevent pip cache bloat
- `HEALTHCHECK` — Fly.io uses this for auto-restart

**Build Command:**
```bash
docker build -t beats-scorer .
```

### Step 2: Docker Compose (Local Dev)

**File:** `docker-compose.yml`

```yaml
version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    env_file:
      - .env
    volumes:
      - ./backend:/app
    command: uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload
    healthcheck:
      test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:8080/health')"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 10s

  qdrant:
    image: qdrant/qdrant:latest
    ports:
      - "6333:6333"
    volumes:
      - qdrant_storage:/qdrant/storage

volumes:
  qdrant_storage:
```

**Features:**
- Live reload via volume mount (`./backend:/app`)
- Health checks on API service
- Qdrant vector database for future embeddings

**Run Command:**
```bash
docker-compose up --build
```

### Step 3: Fly.io Configuration

**File:** `fly.toml`

```toml
app = "beats-scorer"
primary_region = "lhr"

[build]
  dockerfile = "Dockerfile"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = "stop"
  auto_start_machines = true
  min_machines_running = 0
  processes = ["app"]

  [[http_service.checks]]
    grace_period = "10s"
    interval = "30s"
    method = "GET"
    timeout = "5s"
    path = "/health"

[env]
  # Environment variables are injected via Doppler at deploy time

[deploy]
  strategy = "rolling"
```

**Settings:**
- `app = "beats-scorer"` — Matches repository name
- `primary_region = "lhr"` — London (closest to user)
- `auto_stop_machines` — Cost savings (scales to zero)
- `auto_start_machines` — Auto-wake on request
- `min_machines_running = 0` — No idle costs
- `checks` — Health endpoint for load balancer
- `strategy = "rolling"` — Zero-downtime deploys

**Commands:**
```bash
# Login
flyctl auth login

# Deploy with Doppler secrets
doppler run -- flyctl deploy --remote-only

# Status
flyctl status --app beats-scorer

# Logs
flyctl logs --app beats-scorer
```

### Step 4: GitHub Actions CI/CD

**File:** `.github/workflows/deploy.yml`

```yaml
name: Deploy to Fly.io

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r backend/requirements.txt

      - name: Run tests
        run: |
          cd backend
          pytest

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Install Doppler CLI
        uses: dopplerhq/cli-action@v3

      - name: Install Flyctl
        uses: superfly/flyctl-actions/setup-flyctl@master

      - name: Deploy to Fly.io
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
          DOPPLER_TOKEN: ${{ secrets.DOPPLER_TOKEN }}
        run: |
          doppler run -- flyctl deploy --remote-only
```

**Pipeline Flow:**
1. **Trigger:** Push to `main` branch
2. **Test Job:**
   - Checkout repository
   - Setup Python 3.11
   - Install requirements
   - Run `pytest`
3. **Deploy Job:** (only if tests pass)
   - Checkout repository
   - Install Doppler CLI
   - Install Flyctl
   - Run `doppler run -- flyctl deploy --remote-only`

**Secrets Used:**
- `secrets.FLY_API_TOKEN` — Fly.io authentication
- `secrets.DOPPLER_TOKEN` — Doppler secret injection

### Step 5: Doppler Configuration

**File:** `doppler.yaml`

```yaml
setup:
  - project: beats-scorer
    config: dev
    path: /
```

**Secrets Uploaded:**

| Secret | Provider | Purpose |
|--------|----------|---------|
| `GEMINI_API_KEY` | Google AI | Mood analysis |
| `OPENROUTER_API_KEY` | OpenRouter | Alternative LLM access |
| `OPENAI_API_KEY` | OpenAI | GPT models |
| `CLAUDE_API_KEY` | Anthropic | Claude models |
| `XAI_API_KEY` | xAI | Grok models |
| `FLY_API_TOKEN` | Fly.io | Deployment auth |
| `SENTRY_DSN` | Sentry | Error tracking |

**Upload Command:**
```bash
doppler secrets set KEY_NAME "value"
```

**Local Development:**
```bash
doppler run -- python backend/app/main.py
```

### Step 6: .dockerignore

**File:** `.dockerignore`

```
# Git
.git
.gitignore

# Python
__pycache__/
*.py[cod]
env/
venv/
build/
dist/
*.egg-info/
.pytest_cache/
.coverage
htmlcov/

# Node.js
node_modules/
.next/
out/

# Environment & Secrets
.env
.env.*
.env.local
.env.keys

# IDEs
.vscode/
.idea/

# OS
.DS_Store

# Logs
*.log
```

**Purpose:** Prevents copying unnecessary files into Docker image, reducing build time and image size.

---

## 📁 File Reference

| File | Purpose |
|------|---------|
| `Dockerfile` | Python 3.11 container build |
| `docker-compose.yml` | Local orchestration (API + Qdrant) |
| `fly.toml` | Fly.io deployment configuration |
| `.github/workflows/deploy.yml` | GitHub Actions CI/CD |
| `doppler.yaml` | Doppler project configuration |
| `.dockerignore` | Docker build exclusions |
| `scripts/setup-doppler.sh` | Automated Doppler secret upload |
| `scripts/setup-github-secrets.sh` | Automated GitHub secrets setup |

---

## 🔐 Security Checklist

- [x] No secrets in source code
- [x] `.env.keys` gitignored
- [x] `.env` gitignored
- [x] GitHub Push Protection active (blocked accidental secret commits)
- [x] Doppler Service Token scoped to `dev` config only
- [x] Fly.io token stored as GitHub secret
- [x] Health endpoint exposed (non-sensitive)
- [ ] Consider adding API rate limiting (`slowapi`)
- [ ] Consider adding request authentication for production

---

## 💰 Cost Optimization

| Strategy | Implementation | Savings |
|----------|---------------|---------|
| Auto-stop machines | `auto_stop_machines = "stop"` | No idle costs |
| Min machines = 0 | `min_machines_running = 0` | Scale to zero |
| Slim Docker base | `python:3.11-slim` | Faster builds, less storage |
| Docker layer caching | Order Dockerfile layers correctly | Faster rebuilds |

---

## 🧪 Testing Infrastructure

| Test Type | Tool | Status |
|-----------|------|--------|
| Unit tests | pytest | ✅ Configured |
| Coverage | pytest-cov | ⚠️ Not configured |
| Linting | flake8/black | ⚠️ Not configured |
| Type checking | mypy | ⚠️ Not configured |
| Security scan | bandit | ⚠️ Not configured |

---

*Created: 2026-05-03*  
*Template: delivery-pilot-template Stage 4*
