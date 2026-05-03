# 4️⃣ Formula — The "Recipe"

> **Stage 4 of 7:** Document the logic before others try to reproduce it.

## Purpose

This folder is the **knowledge base** of the project — the step-by-step reasoning, research notes, and implementation logic. If someone needs to understand *why* a decision was made or *how* something was built, the answer is here.

## What belongs here

- **Step-by-step guides** — How to implement specific features
- **Research notes** — Findings, comparisons, and tech evaluations
- **Decision records** — Why X was chosen over Y (ADRs)
- **Containerised setup** — Docker/Compose definitions for Qdrant + Ollama
- **API references** — Key endpoints and integration notes

## Files

| File | Bounded Context | Description |
|------|----------------|-------------|
| [`runbook.md`](./runbook.md) | **Operations** | Complete guide to clone, configure, and run the project |
| [`project-scaffolding.md`](./project-scaffolding.md) | **Infrastructure** | How the 7-stage template was applied and directories created |
| [`backend-implementation.md`](./backend-implementation.md) | **Backend** | FastAPI architecture, Gemini/fal.ai integration, API design |
| [`frontend-implementation.md`](./frontend-implementation.md) | **Frontend** | Next.js components, design system, backend integration |
| [`devops-infrastructure.md`](./devops-infrastructure.md) | **DevOps** | Docker, Fly.io, GitHub Actions, Doppler configuration |
| [`github-actions-secrets-log.md`](./github-actions-secrets-log.md) | **Security** | Step-by-step execution log of CI/CD secrets setup |
| `ai_4d_approach.md` | **Research** | AI Fluency 4Ds framework reference |

## Containerised AI Stack

```yaml
# docker-compose.yml (reference — full file in 5_Symbols)
services:
  qdrant:
    image: qdrant/qdrant
    ports:
      - "6333:6333"
    volumes:
      - qdrant_data:/qdrant/storage

  ollama:
    image: ollama/ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
```

## Rules

- Write the *why* not just the *what* — reasoning decays fastest
- Link research notes to the decisions they informed
- Move superseded guides to `_obsolete/` 🚮
- Keep Docker configs in sync with `2_Environment` setup guides

## 🧪 Testing Checklist

- [x] Implementation guide covers all major features (backend, frontend, DevOps)
- [x] All bounded contexts have dedicated formula documents
- [x] Docker Compose config starts API and Qdrant cleanly
- [x] Secrets management documented with step-by-step logs
- [ ] Research notes reference their sources (partial — ai_4d_approach.md present)
- [ ] Architecture Decision Records (ADRs) formalized in `decisions.md`

## 🗺️ Bounded Contexts Map

```
┌─────────────────────────────────────────────────────────────┐
│                    beats-scorer Project                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Scaffolding │  │   Backend    │  │   Frontend   │      │
│  │  (1_Folder   │  │  (FastAPI)   │  │  (Next.js)   │      │
│  │   setup)     │  │              │  │              │      │
│  │              │  │  - Gemini    │  │  - Audio     │      │
│  │  project-    │  │  - fal.ai    │  │    Player    │      │
│  │  scaffolding │  │  - Prometheus│  │  - Mood Viz  │      │
│  │  .md         │  │              │  │  - Feedback  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  DevOps & Security                   │   │
│  │                                                      │   │
│  │  - Dockerfile    - fly.toml    - GitHub Actions      │   │
│  │  - docker-compose.yml    - Doppler    - Secrets      │   │
│  │                                                      │   │
│  │  devops-infra.md    github-actions-secrets-log.md    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   Operations Guide                   │   │
│  │                                                      │   │
│  │  runbook.md — Complete setup, deployment, gaps       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```
