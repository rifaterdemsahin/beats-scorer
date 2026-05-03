#!/bin/bash
# Doppler Secrets Setup Script for Lyra-Beat
# Run this script to configure all API keys in Doppler
# Prerequisites: Doppler CLI installed and authenticated

set -e

echo "🔐 Setting up Doppler secrets for Lyra-Beat..."

# Check if Doppler CLI is installed
if ! command -v doppler &> /dev/null; then
    echo "❌ Doppler CLI not found. Install it first:"
    echo "   brew install dopplerhq/cli/doppler  # macOS"
    echo "   wget -q -t3 https://cli.doppler.com/install.sh -O - | sh  # Linux"
    exit 1
fi

# Check if logged in
if ! doppler me &> /dev/null; then
    echo "❌ Not logged in to Doppler. Run: doppler login"
    exit 1
fi

# Create project if it doesn't exist
echo "📁 Creating Doppler project 'beats-scorer'..."
doppler projects create beats-scorer 2>/dev/null || echo "   Project already exists"

# Set environment to dev
doppler setup --project beats-scorer --config dev 2>/dev/null || true

echo "🔑 Uploading secrets to Doppler..."

# AI API Keys - Set these from your local environment or pass as arguments
# Example: ./setup-doppler.sh
doppler secrets set GEMINI_API_KEY "${GEMINI_API_KEY:-}"
doppler secrets set OPENROUTER_API_KEY "${OPENROUTER_API_KEY:-}"
doppler secrets set OPENAI_API_KEY "${OPENAI_API_KEY:-}"
doppler secrets set CLAUDE_API_KEY "${CLAUDE_API_KEY:-}"
doppler secrets set XAI_API_KEY "${XAI_API_KEY:-}"

# Deployment Tokens
doppler secrets set FLY_API_TOKEN "${FLY_API_TOKEN:-}"

# Monitoring (placeholder - update with actual DSN)
doppler secrets set SENTRY_DSN "${SENTRY_DSN:-}"

echo "✅ All secrets uploaded to Doppler!"
echo ""
echo "🚀 To deploy with Doppler secrets:"
echo "   doppler run -- flyctl deploy"
echo ""
echo "🧪 To run locally with Doppler secrets:"
echo "   doppler run -- python backend/app/main.py"
