# 🔐 GitHub Actions Secrets Setup — Execution Log

> **Date:** 2026-05-03  
> **Operator:** AI Assistant  
> **Project:** beats-scorer  
> **Purpose:** Configure GitHub repository secrets so pushes to `main` auto-deploy to Fly.io via Doppler

---

## ✅ Prerequisites Verified

| Tool | Status | Version | Notes |
|------|--------|---------|-------|
| GitHub CLI (`gh`) | ✅ Installed | v2.92.0 | Authenticated as `rifaterdemsahin` |
| Doppler CLI | ✅ Installed | v3.76.0 | Logged in, workplace `5ccb59c6d72db414f3e7` |
| Git remote | ✅ Valid | `origin` | Points to `github.com:rifaterdemsahin/beats-scorer.git` |

**Verification commands:**
```bash
gh auth status          # Confirmed: logged in to github.com
which gh && gh --version # v2.92.0
doppler me              # workplace: rifaterdemsahin (5ccb59c6d72db414f3e7)
```

---

## 📋 Step-by-Step Execution

### Step 1 — Verify gh CLI Authentication

**Command:**
```bash
gh auth status
```

**Output:**
```
github.com
  ✓ Logged in to github.com account rifaterdemsahin (keyring)
  - Active account: true
  - Git operations protocol: ssh
  - Token: gho_************************************
  - Token scopes: 'admin:public_key', 'gist', 'read:org', 'repo'
```

**Result:** ✅ gh CLI is authenticated with sufficient scopes (`repo`, `read:org`) to set repository secrets.

---

### Step 2 — Retrieve FLY_API_TOKEN from Doppler

**Command:**
```bash
doppler secrets get FLY_API_TOKEN --plain
```

**Output:**
```
FlyV1 fm2_lJPECAAAAAAAEkhKxBDXBZ3Y9uaEbh0UJdAG6hmowrVodHRwczovL2FwaS5mbHkuaW8vdjGUAJLOABdCOB8Lk7lodHRwczovL2FwaS5mbHkuaW8vYWFhL3YxxDzDulYuSMdzwTSH5TBlSRaARX4AfcU5EWYt+ByIXeWXVzsvmRpNxFI28gPHKVstnoQGlhxLlkrwnSYzLL/ETu6XRUiwbAyFru2bBhAFyh4m8ORpJCaJHA9RGsTGA5iwUUm7lf+ckG1tUZidujUAgCShqxTz94S4FnSQd6vGxM/P7rCDR+VCYxGMj6z3vsQgPGpfzzA+SsIVlaLckWX8a/TONZR9qTW/5I4CyijtM4g=
```

**Result:** ✅ FLY_API_TOKEN successfully retrieved from the `beats-scorer` Doppler project.

---

### Step 3 — Create Doppler Service Token

**Why:** GitHub Actions needs a Doppler Service Token (not the CLI login token) to authenticate and pull secrets during the CI/CD pipeline.

**Command:**
```bash
doppler configs tokens create github-actions-ci --config dev --plain
```

**Output:**
```
[DOPPLER_SERVICE_TOKEN_PLACEHOLDER]
```

**Result:** ✅ Service token created with name `github-actions-ci`, scoped to the `dev` config of the `beats-scorer` project.

**Token details:**
- **Type:** Doppler Service Token
- **Config:** `dev`
- **Project:** `beats-scorer`
- **Name:** `github-actions-ci`

---

### Step 4 — Set FLY_API_TOKEN as GitHub Secret

**Command:**
```bash
gh secret set FLY_API_TOKEN \
  --body "FlyV1 fm2_lJPEC..." \
  --repo rifaterdemsahin/beats-scorer
```

**Output:** *(none — command succeeds silently)*

**Result:** ✅ Secret `FLY_API_TOKEN` set on the `beats-scorer` GitHub repository.

---

### Step 5 — Set DOPPLER_TOKEN as GitHub Secret

**Command:**
```bash
gh secret set DOPPLER_TOKEN \
  --body "[DOPPLER_SERVICE_TOKEN_PLACEHOLDER]" \
  --repo rifaterdemsahin/beats-scorer
```

**Output:** *(none — command succeeds silently)*

**Result:** ✅ Secret `DOPPLER_TOKEN` set on the `beats-scorer` GitHub repository.

---

### Step 6 — Verify Secrets in GitHub

**Command:**
```bash
gh secret list --repo rifaterdemsahin/beats-scorer
```

**Output:**
```
DOPPLER_TOKEN	2026-05-03T17:19:07Z
FLY_API_TOKEN	2026-05-03T17:19:00Z
```

**Result:** ✅ Both secrets confirmed present in the GitHub repository.

---

## 🔍 Final State

### GitHub Repository Secrets

| Secret Name | Value Source | Created At | Used By |
|-------------|-------------|------------|---------|
| `FLY_API_TOKEN` | Doppler secret `FLY_API_TOKEN` | 2026-05-03T17:19:00Z | Fly.io CLI deploy step |
| `DOPPLER_TOKEN` | Doppler Service Token `github-actions-ci` | 2026-05-03T17:19:07Z | Doppler CLI secret injection |

### Doppler Project State

**Project:** `beats-scorer`  
**Config:** `dev`  
**Dashboard:** https://dashboard.doppler.com/workplace/5ccb59c6d72db414f3e7/projects

**Secrets stored:**
- `GEMINI_API_KEY`
- `OPENROUTER_API_KEY`
- `OPENAI_API_KEY`
- `CLAUDE_API_KEY`
- `XAI_API_KEY`
- `FLY_API_TOKEN`
- `SENTRY_DSN`

**Service Tokens:**
- `github-actions-ci` → `[DOPPLER_SERVICE_TOKEN_PLACEHOLDER]`

---

## 🚀 What Happens Now

When you push to the `main` branch:

1. **GitHub Actions** triggers the workflow in `.github/workflows/deploy.yml`
2. **Test job** runs:
   ```bash
   pip install -r backend/requirements.txt
   pytest
   ```
3. **Deploy job** (only if tests pass):
   - Installs Doppler CLI
   - Installs Flyctl
   - Runs: `doppler run -- flyctl deploy --remote-only`
4. **Doppler** injects all secrets (`GEMINI_API_KEY`, `FAL_KEY`, etc.) into the Fly.io app at runtime
5. **Fly.io** builds and deploys the Docker container
6. **App** becomes available at `https://beats-scorer.fly.dev`

---

## 📚 Reference Commands

### Manual Deployment (Bypass CI/CD)

```bash
# Deploy directly from local machine
doppler run -- flyctl deploy --remote-only

# Check deployment status
flyctl status --app beats-scorer

# View logs
flyctl logs --app beats-scorer
```

### Rotate Secrets

```bash
# Rotate Doppler Service Token
doppler configs tokens delete github-actions-ci
doppler configs tokens create github-actions-ci --config dev --plain
gh secret set DOPPLER_TOKEN --body "<new-token>" --repo rifaterdemsahin/beats-scorer

# Rotate Fly.io token (if needed)
flyctl tokens create deploy
doppler secrets set FLY_API_TOKEN "<new-token>"
gh secret set FLY_API_TOKEN --body "<new-token>" --repo rifaterdemsahin/beats-scorer
```

### Delete GitHub Secrets

```bash
gh secret delete FLY_API_TOKEN --repo rifaterdemsahin/beats-scorer
gh secret delete DOPPLER_TOKEN --repo rifaterdemsahin/beats-scorer
```

---

## ⚠️ Security Notes

- **Never** commit secrets to git — GitHub Push Protection is active
- **Doppler Service Token** has access to all secrets in the `dev` config — keep it secure
- **FLY_API_TOKEN** grants deploy access to your Fly.io app — rotate if compromised
- Both tokens are stored encrypted by GitHub and are only exposed to GitHub Actions runners during workflow execution

---

## 🧪 Testing Checklist

- [x] gh CLI installed and authenticated
- [x] Doppler CLI logged in
- [x] FLY_API_TOKEN retrieved from Doppler
- [x] Doppler Service Token created
- [x] FLY_API_TOKEN set as GitHub secret
- [x] DOPPLER_TOKEN set as GitHub secret
- [x] Both secrets verified via `gh secret list`
- [ ] Push to `main` triggers GitHub Actions workflow
- [ ] Tests pass in CI
- [ ] Deploy job runs successfully
- [ ] App accessible at `https://beats-scorer.fly.dev`

---

*Document generated: 2026-05-03  
*Location: `4_Formula/github-actions-secrets-log.md`*
