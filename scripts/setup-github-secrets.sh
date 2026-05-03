# GitHub Actions Secrets Setup
# Run these commands to add secrets to GitHub for CI/CD

# 1. Install gh CLI if not already installed
#    brew install gh  # macOS

# 2. Authenticate with GitHub
#    gh auth login

# 3. Set repository secrets (run from repo root)
# Set secrets from environment variables
# Make sure to export these variables before running:
# export FLY_API_TOKEN=your_fly_token
# export DOPPLER_TOKEN=your_doppler_token

gh secret set FLY_API_TOKEN --body "$FLY_API_TOKEN"
gh secret set DOPPLER_TOKEN --body "$DOPPLER_TOKEN"

# Note: Get your Doppler Service Token from:
# https://dashboard.doppler.com/workplace/5ccb59c6d72db414f3e7/getting-started
# Project: lyra-beat, Config: dev
