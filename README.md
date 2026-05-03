# beats-scorer

AI-powered beat and sound-bite scoring engine for YouTube content creators.

## Project Description

beats-scorer is a FastAPI backend service that leverages multiple AI providers (Gemini, OpenAI, Claude, xAI, FAL) to analyze, score, and enhance audio beats and sound bites. Designed for content creators who want data-driven feedback on their audio assets before publishing.

## Tech Stack

- **Backend:** FastAPI + Python 3.11
- **Deployment:** Fly.io (London region)
- **Secrets:** Doppler
- **CI/CD:** GitHub Actions
- **Monitoring:** Sentry + Prometheus
- **Vector DB:** Qdrant (for AI embeddings)

## Setup Instructions

### Frontend Development

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Run development server
npm run dev

# 4. Frontend will be available at http://localhost:3000
```

### Local Development (with Docker)

```bash
# 1. Clone the repository
git clone https://github.com/rifaterdemsahin/beats-scorer.git
cd beats-scorer

# 2. Copy environment variables
cp .env.example .env
# Edit .env and fill in your API keys

# 3. Start services
docker-compose up --build

# 4. API will be available at http://localhost:8080
```

### Local Development (without Docker)

```bash
# 1. Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r backend/requirements.txt

# 3. Run server
cd backend
uvicorn app.main:app --reload --port 8080
```

## Deployment Instructions

### Prerequisites

1. **Fly.io account** and CLI installed: `brew install flyctl`
2. **Doppler account** with project `beats-scorer` created
3. **GitHub repository** secrets configured:
   - `FLY_API_TOKEN`
   - `DOPPLER_TOKEN`

### Deploy

Pushing to the `main` branch automatically triggers the GitHub Actions workflow:

```bash
git push origin main
```

Manual deployment via CLI:

```bash
# Login to Fly.io
flyctl auth login

# Deploy with Doppler secrets
doppler run -- flyctl deploy --remote-only
```

## Project Links

- **GitHub Repository:** https://github.com/rifaterdemsahin/beats-scorer
- **LinkedIn:** https://www.linkedin.com/in/rifaterdemsahin/
- **YouTube:** https://www.youtube.com/@RifatErdemSahin

## GitHub Pages

- **Live Site:** https://rifaterdemsahin.github.io/beats-scorer

## Environment Variables

See `.env.example` for the full list of required variables. All secrets are managed via Doppler — never commit them to git.

## License

MIT
