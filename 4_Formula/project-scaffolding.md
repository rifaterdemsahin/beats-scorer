# 🏗️ Formula: Project Scaffolding & Template Application

> **Bounded Context:** Infrastructure Setup  
> **Stage:** 4_Formula  
> **Date:** 2026-05-03  
> **Template Source:** [delivery-pilot-template](https://github.com/rifaterdemsahin/delivery-pilot-template)

---

## 📋 Objective

Clone the `delivery-pilot-template` structure and adapt it for the `beats-scorer` project, establishing the 7-stage delivery pilot framework.

---

## 🗺️ 7-Stage Structure Applied

| Stage | Folder | Purpose | Content Added |
|-------|--------|---------|---------------|
| 1 | `1_Real_Unknown/` | Problem definitions, OKRs | README with project intent |
| 2 | `2_Environment/` | Roadmaps, constraints, setup | README with environment guide |
| 3 | `3_Simulation/` | UI mockups, image carousel | WhatsApp images from user |
| 4 | `4_Formula/` | Step-by-step guides | This document and others |
| 5 | `5_Symbols/` | Core source code | Reference to backend/frontend |
| 6 | `6_Semblance/` | Error logs, workarounds | README for gap analysis |
| 7 | `7_Testing_Known/` | Validation, checklists | README with testing criteria |

---

## 🔧 Commands Executed

### Step 1: Clone Template

```bash
git clone https://github.com/rifaterdemsahin/delivery-pilot-template.git /tmp/delivery-pilot-template
```

**Result:** Template downloaded to `/tmp/delivery-pilot-template`

### Step 2: Copy Structure to Project

```bash
cp -r /tmp/delivery-pilot-template/1_Real_Unknown /Users/rifaterdemsahin/projects/beats-scorer/
cp -r /tmp/delivery-pilot-template/2_Environment /Users/rifaterdemsahin/projects/beats-scorer/
cp -r /tmp/delivery-pilot-template/3_Simulation /Users/rifaterdemsahin/projects/beats-scorer/
cp -r /tmp/delivery-pilot-template/4_Formula /Users/rifaterdemsahin/projects/beats-scorer/
cp -r /tmp/delivery-pilot-template/5_Symbols /Users/rifaterdemsahin/projects/beats-scorer/
cp -r /tmp/delivery-pilot-template/6_Semblance /Users/rifaterdemsahin/projects/beats-scorer/
cp -r /tmp/delivery-pilot-template/7_Testing_Known /Users/rifaterdemsahin/projects/beats-scorer/
cp /tmp/delivery-pilot-template/claude.md /Users/rifaterdemsahin/projects/beats-scorer/
cp /tmp/delivery-pilot-template/copilot.md /Users/rifaterdemsahin/projects/beats-scorer/
cp /tmp/delivery-pilot-template/gemini.md /Users/rifaterdemsahin/projects/beats-scorer/
cp /tmp/delivery-pilot-template/kilocode.md /Users/rifaterdemsahin/projects/beats-scorer/
```

**Result:** All 7 stage folders + AI config files copied to project root.

### Step 3: Create Application Directories

```bash
mkdir -p /Users/rifaterdemsahin/projects/beats-scorer/backend/app
mkdir -p /Users/rifaterdemsahin/projects/beats-scorer/backend/tests
mkdir -p /Users/rifaterdemsahin/projects/beats-scorer/frontend/pages
mkdir -p /Users/rifaterdemsahin/projects/beats-scorer/frontend/components
mkdir -p /Users/rifaterdemsahin/projects/beats-scorer/.github/workflows
mkdir -p /Users/rifaterdemsahin/projects/beats-scorer/scripts
```

**Result:** Project structure ready for backend, frontend, CI/CD, and automation scripts.

---

## 📁 Final Project Structure

```
beats-scorer/
├── 1_Real_Unknown/              # Stage 1: Problem & Intent
│   └── README.md
├── 2_Environment/               # Stage 2: Constraints & Roadmap
│   └── README.md
├── 3_Simulation/                # Stage 3: UI Mockups
│   ├── README.md
│   └── WhatsApp Image*.jpeg     # User-provided mockups
├── 4_Formula/                   # Stage 4: Recipes & Guides (this folder)
│   ├── README.md
│   ├── ai_4d_approach.md
│   ├── runbook.md
│   ├── github-actions-secrets-log.md
│   ├── backend-implementation.md
│   ├── frontend-implementation.md
│   ├── devops-infrastructure.md
│   └── project-scaffolding.md   # This file
├── 5_Symbols/                   # Stage 5: Source Code References
│   └── README.md
├── 6_Semblance/                 # Stage 6: Errors & Workarounds
│   └── README.md
├── 7_Testing_Known/             # Stage 7: Validation
│   └── README.md
├── backend/                     # FastAPI Application
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── models.py
│   │   └── services/
│   │       ├── __init__.py
│   │       ├── gemini_service.py
│   │       ├── fal_service.py
│   │       └── audio_service.py
│   ├── tests/
│   │   ├── __init__.py
│   │   └── test_api.py
│   └── requirements.txt
├── frontend/                    # Next.js Application
│   ├── components/
│   │   ├── AudioPlayer.tsx
│   │   ├── MoodVisualizer.tsx
│   │   └── FeedbackForm.tsx
│   ├── pages/
│   │   ├── _app.tsx
│   │   └── index.tsx
│   ├── styles/
│   │   └── globals.css
│   ├── package.json
│   ├── next.config.js
│   ├── tsconfig.json
│   └── postcss.config.js
├── .github/workflows/           # CI/CD
│   └── deploy.yml
├── scripts/                     # Automation
│   ├── setup-doppler.sh
│   └── setup-github-secrets.sh
├── .env.example                 # Environment template
├── .env.keys                    # Local secret reference (gitignored)
├── .gitignore                   # Git exclusions
├── Dockerfile                   # Container build
├── docker-compose.yml           # Local orchestration
├── doppler.yaml                 # Doppler config
├── fly.toml                     # Fly.io deployment
├── README.md                    # Project overview
├── claude.md                    # AI persona instructions
├── copilot.md                   # GitHub Copilot instructions
├── gemini.md                    # Gemini AI instructions
└── kilocode.md                  # Kilocode AI instructions
```

---

## 🎯 Decisions Made

| Decision | Rationale |
|----------|-----------|
| Keep template's 7-stage naming | Maintains consistency with delivery-pilot-template |
| Use `beats-scorer` as repo name | Matches GitHub repository, avoids confusion |
| Separate `backend/` and `frontend/` | Clear bounded contexts, enables independent scaling |
| Add `scripts/` directory | Centralizes automation (Doppler, GitHub setup) |
| Copy AI config files (claude.md, etc.) | Preserves multi-AI tooling setup from template |

---

## 🧪 Testing Checklist

- [x] All 7 stage folders exist with README.md
- [x] Backend directory structure created
- [x] Frontend directory structure created
- [x] `.github/workflows/` directory created
- [x] `scripts/` directory created
- [x] Template files copied successfully
- [x] Git tracks new files correctly

---

## 📚 Related Documents

- [`runbook.md`](./runbook.md) — Full project runbook
- [`backend-implementation.md`](./backend-implementation.md) — Backend build details
- [`frontend-implementation.md`](./frontend-implementation.md) — Frontend build details
- [`devops-infrastructure.md`](./devops-infrastructure.md) — CI/CD and deployment

---

*Created: 2026-05-03*  
*Template: delivery-pilot-template Stage 4*
