#!/bin/bash
# Unified deployment script for TurboTech Portal
# Deploys: Secrets Manager + Backend (SAM) + Frontend (App Runner)
#
# Works for any environment (staging, prod, etc.) — all resource names
# are derived from the --environment flag.
#
# Prerequisites:
#   - AWS CLI configured with the target account credentials
#   - SAM CLI installed (brew install aws-sam-cli)
#   - Docker running (for backend Lambda image build)
#   - GitHub connection ARN (create at AWS Console > App Runner > GitHub connections)
#
# Usage:
#   Staging:  ./deploy.sh --environment=staging --github-connection-arn=arn:aws:apprunner:... --github-repo-url=https://github.com/ORG/REPO
#   Prod:     ./deploy.sh --environment=prod    --github-connection-arn=arn:aws:apprunner:... --github-repo-url=https://github.com/ORG/REPO
#
#   Backend only:   ./deploy.sh --environment=prod --github-connection-arn=ARN --github-repo-url=URL --skip-frontend
#   Frontend only:  ./deploy.sh --environment=prod --github-connection-arn=ARN --github-repo-url=URL --skip-backend

set -euo pipefail

# ── Configuration ────────────────────────────────────────────────────────────
ENVIRONMENT=""
REGION="us-east-2"
SAM_S3_BUCKET=""
GITHUB_CONNECTION_ARN=""
GITHUB_REPO_URL=""
GITHUB_BRANCH="main"
AUTH0_ISSUER_BASE_URL=""
AUTH0_AUDIENCE=""
AUTH0_ORGANIZATION=""
SKIP_BACKEND=false
SKIP_FRONTEND=false

# ── Parse Arguments ──────────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case "$1" in
    --environment=*)              ENVIRONMENT="${1#*=}" ;;
    --region=*)                   REGION="${1#*=}" ;;
    --github-connection-arn=*)    GITHUB_CONNECTION_ARN="${1#*=}" ;;
    --github-repo-url=*)         GITHUB_REPO_URL="${1#*=}" ;;
    --sam-s3-bucket=*)            SAM_S3_BUCKET="${1#*=}" ;;
    --auth0-issuer=*)             AUTH0_ISSUER_BASE_URL="${1#*=}" ;;
    --auth0-audience=*)           AUTH0_AUDIENCE="${1#*=}" ;;
    --auth0-organization=*)       AUTH0_ORGANIZATION="${1#*=}" ;;
    --github-branch=*)            GITHUB_BRANCH="${1#*=}" ;;
    --skip-backend)               SKIP_BACKEND=true ;;
    --skip-frontend)              SKIP_FRONTEND=true ;;
    *)
      echo "Unknown option: $1"
      echo ""
      echo "Usage: $0 --environment=<staging|prod> --github-connection-arn=ARN --github-repo-url=URL [options]"
      echo ""
      echo "Required:"
      echo "  --environment=ENV              Deployment environment (staging, prod)"
      echo "  --github-connection-arn=ARN    App Runner GitHub connection ARN"
      echo "  --github-repo-url=URL         GitHub repository URL"
      echo ""
      echo "Optional:"
      echo "  --region=REGION                AWS region (default: us-east-2)"
      echo "  --sam-s3-bucket=BUCKET         S3 bucket for SAM artifacts"
      echo "  --auth0-issuer=URL             Auth0 issuer URL (reads from Secrets Manager if omitted)"
      echo "  --auth0-audience=URL           Auth0 API audience (reads from Secrets Manager if omitted)"
      echo "  --auth0-organization=ID        Auth0 organization ID (optional)"
      echo "  --github-branch=BRANCH         Branch to deploy (default: main)"
      echo "  --skip-backend                 Skip backend deployment"
      echo "  --skip-frontend                Skip frontend deployment"
      exit 1
      ;;
  esac
  shift
done

# ── Validate Environment ────────────────────────────────────────────────────
if [[ -z "$ENVIRONMENT" ]]; then
  echo "ERROR: --environment is required."
  echo "Usage: $0 --environment=<staging|prod> --github-connection-arn=ARN --github-repo-url=URL"
  exit 1
fi

if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "prod" ]]; then
  echo "ERROR: --environment must be 'staging' or 'prod' (got '${ENVIRONMENT}')"
  exit 1
fi

# Derive GITHUB_REPO_URL from git remote if not provided
if [[ -z "$GITHUB_REPO_URL" ]]; then
  GITHUB_REPO_URL=$(git -C "$(dirname "$0")/.." remote get-url origin 2>/dev/null || echo "")
  if [[ -z "$GITHUB_REPO_URL" ]]; then
    echo "ERROR: --github-repo-url is required (could not derive from git remote)."
    exit 1
  fi
  echo "Derived GitHub repo URL from git remote: ${GITHUB_REPO_URL}"
fi

# ── Derive Resource Names ───────────────────────────────────────────────────
BACKEND_STACK_NAME="turbotech-backend-${ENVIRONMENT}"
SECRETS_STACK_NAME="turbotech-${ENVIRONMENT}-secrets"
FRONTEND_STACK_NAME="turbotech-${ENVIRONMENT}-frontend"

echo ""
echo "========================================"
echo "  Deploying: ${ENVIRONMENT}"
echo "========================================"
echo ""
echo "  Region:          ${REGION}"
echo "  Secrets stack:   ${SECRETS_STACK_NAME}"
echo "  Backend stack:   ${BACKEND_STACK_NAME}"
echo "  Frontend stack:  ${FRONTEND_STACK_NAME}"
echo ""

# ── Phase 0: Validate Prerequisites ─────────────────────────────────────────
echo "=== Phase 0: Validating prerequisites ==="

if ! command -v aws &> /dev/null; then
  echo "ERROR: AWS CLI not found. Install with: brew install awscli"
  exit 1
fi

if [[ "$SKIP_BACKEND" == false ]] && ! command -v sam &> /dev/null; then
  echo "ERROR: SAM CLI not found. Install with: brew install aws-sam-cli"
  exit 1
fi

if [[ "$SKIP_BACKEND" == false ]] && ! docker info &> /dev/null 2>&1; then
  echo "ERROR: Docker is not running. Start Docker Desktop."
  exit 1
fi

if [[ "$SKIP_FRONTEND" == false ]] && [[ -z "$GITHUB_CONNECTION_ARN" ]]; then
  echo "ERROR: --github-connection-arn is required for frontend deployment."
  echo "Create one at: https://${REGION}.console.aws.amazon.com/apprunner/home?region=${REGION}#/github-connections"
  exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "Deploying to account: ${ACCOUNT_ID} in ${REGION}"

# ── Phase 1: Deploy Secrets Stack ────────────────────────────────────────────
echo ""
echo "=== Phase 1: Deploying secrets stack ==="

aws cloudformation deploy \
  --template-file "$(dirname "$0")/secrets-stack.yaml" \
  --stack-name "${SECRETS_STACK_NAME}" \
  --region "${REGION}" \
  --parameter-overrides Environment="${ENVIRONMENT}" \
  --no-fail-on-empty-changeset

# Check if secrets still have placeholder values
FRONTEND_SECRET=$(aws secretsmanager get-secret-value \
  --secret-id "turbotech-${ENVIRONMENT}/auth0-frontend" \
  --region "${REGION}" \
  --query SecretString --output text 2>/dev/null || echo "")

if echo "$FRONTEND_SECRET" | grep -q "PLACEHOLDER_REPLACE_ME"; then
  echo ""
  echo "WARNING: Auth0 secrets still have placeholder values!"
  echo "Populate them before the frontend will work:"
  echo ""
  echo "  aws secretsmanager put-secret-value \\"
  echo "    --secret-id turbotech-${ENVIRONMENT}/auth0-frontend \\"
  echo "    --region ${REGION} \\"
  echo "    --secret-string '{\"AUTH0_SECRET\":\"<generate-random-32-chars>\",\"AUTH0_CLIENT_ID\":\"<from-auth0>\",\"AUTH0_CLIENT_SECRET\":\"<from-auth0>\"}'"
  echo ""
  echo "  aws secretsmanager put-secret-value \\"
  echo "    --secret-id turbotech-${ENVIRONMENT}/auth0-backend \\"
  echo "    --region ${REGION} \\"
  echo "    --secret-string '{\"AUTH0_DOMAIN\":\"<your-tenant.us.auth0.com>\",\"AUTH0_AUDIENCE\":\"<your-api-audience>\"}'"
  echo ""
fi

# ── Phase 2: Deploy Backend (SAM) ───────────────────────────────────────────
if [[ "$SKIP_BACKEND" == false ]]; then
  echo ""
  echo "=== Phase 2: Building and deploying backend ==="

  # Create SAM S3 bucket if not provided
  if [[ -z "$SAM_S3_BUCKET" ]]; then
    SAM_S3_BUCKET="turbotech-deployments-${ENVIRONMENT}"
    echo "Using default S3 bucket: ${SAM_S3_BUCKET}"
    aws s3 mb "s3://${SAM_S3_BUCKET}" --region "${REGION}" 2>/dev/null || true
  fi

  # Read Auth0 backend config from Secrets Manager if not provided via args
  if [[ -z "$AUTH0_ISSUER_BASE_URL" ]] || [[ -z "$AUTH0_AUDIENCE" ]]; then
    BACKEND_SECRET=$(aws secretsmanager get-secret-value \
      --secret-id "turbotech-${ENVIRONMENT}/auth0-backend" \
      --region "${REGION}" \
      --query SecretString --output text 2>/dev/null || echo "")

    if [[ -n "$BACKEND_SECRET" ]] && ! echo "$BACKEND_SECRET" | grep -q "PLACEHOLDER_REPLACE_ME"; then
      AUTH0_DOMAIN=$(echo "$BACKEND_SECRET" | python3 -c "import sys,json; print(json.load(sys.stdin)['AUTH0_DOMAIN'])")
      AUTH0_AUDIENCE=$(echo "$BACKEND_SECRET" | python3 -c "import sys,json; print(json.load(sys.stdin)['AUTH0_AUDIENCE'])")
    else
      echo "ERROR: Auth0 backend secrets not populated and --auth0-issuer/--auth0-audience not provided."
      echo "Either populate the secrets or pass values via CLI arguments."
      exit 1
    fi
  else
    # Strip https:// prefix if present (SAM template expects bare domain)
    AUTH0_DOMAIN="${AUTH0_ISSUER_BASE_URL#https://}"
  fi

  # Deploy using the existing SAM template
  pushd "$(dirname "$0")/../backend" > /dev/null

  echo "Building SAM application (Docker image)..."
  sam build --template template-fastapi.yaml

  echo "Deploying backend stack..."
  sam deploy \
    --template-file .aws-sam/build/template.yaml \
    --stack-name "${BACKEND_STACK_NAME}" \
    --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND \
    --region "${REGION}" \
    --s3-bucket "${SAM_S3_BUCKET}" \
    --parameter-overrides \
      "Environment=${ENVIRONMENT}" \
      "Auth0Domain=${AUTH0_DOMAIN}" \
      "Auth0Audience=${AUTH0_AUDIENCE}" \
      "CorsOrigin=*" \
    --no-fail-on-empty-changeset \
    --resolve-image-repos

  popd > /dev/null
else
  echo ""
  echo "=== Phase 2: Skipping backend (--skip-backend) ==="
fi

# ── Phase 3: Get Backend API URL ─────────────────────────────────────────────
echo ""
echo "=== Phase 3: Retrieving backend API URL ==="

API_ENDPOINT=$(aws cloudformation describe-stacks \
  --stack-name "${BACKEND_STACK_NAME}" \
  --region "${REGION}" \
  --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue" \
  --output text)

if [[ -z "$API_ENDPOINT" ]] || [[ "$API_ENDPOINT" == "None" ]]; then
  echo "ERROR: Could not retrieve API endpoint from backend stack."
  echo "Make sure the backend stack '${BACKEND_STACK_NAME}' exists and is deployed."
  exit 1
fi

echo "Backend API URL: ${API_ENDPOINT}"

# ── Phase 4: Deploy Frontend (App Runner) ────────────────────────────────────
if [[ "$SKIP_FRONTEND" == false ]]; then
  echo ""
  echo "=== Phase 4: Deploying frontend stack ==="

  # Read Auth0 issuer from secrets if not provided
  if [[ -z "$AUTH0_ISSUER_BASE_URL" ]]; then
    AUTH0_ISSUER_BASE_URL="https://${AUTH0_DOMAIN}"
  fi
  if [[ -z "$AUTH0_AUDIENCE" ]]; then
    AUTH0_AUDIENCE=$(aws secretsmanager get-secret-value \
      --secret-id "turbotech-${ENVIRONMENT}/auth0-backend" \
      --region "${REGION}" \
      --query SecretString --output text | python3 -c "import sys,json; print(json.load(sys.stdin)['AUTH0_AUDIENCE'])")
  fi

  # Check if frontend stack already exists to get current Auth0BaseUrl
  EXISTING_AUTH0_BASE_URL="https://PLACEHOLDER"
  EXISTING_SERVICE_URL=$(aws cloudformation describe-stacks \
    --stack-name "${FRONTEND_STACK_NAME}" \
    --region "${REGION}" \
    --query "Stacks[0].Outputs[?OutputKey=='ServiceUrl'].OutputValue" \
    --output text 2>/dev/null || echo "")

  if [[ -n "$EXISTING_SERVICE_URL" ]] && [[ "$EXISTING_SERVICE_URL" != "None" ]]; then
    EXISTING_AUTH0_BASE_URL="${EXISTING_SERVICE_URL}"
    echo "Using existing App Runner URL for AUTH0_BASE_URL: ${EXISTING_AUTH0_BASE_URL}"
  fi

  aws cloudformation deploy \
    --template-file "$(dirname "$0")/frontend-stack.yaml" \
    --stack-name "${FRONTEND_STACK_NAME}" \
    --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
    --region "${REGION}" \
    --parameter-overrides \
      "Environment=${ENVIRONMENT}" \
      "GitHubConnectionArn=${GITHUB_CONNECTION_ARN}" \
      "GitHubRepositoryUrl=${GITHUB_REPO_URL}" \
      "GitHubBranch=${GITHUB_BRANCH}" \
      "ApiGatewayUrl=${API_ENDPOINT}" \
      "Auth0IssuerBaseUrl=${AUTH0_ISSUER_BASE_URL}" \
      "Auth0Audience=${AUTH0_AUDIENCE}" \
      "Auth0Organization=${AUTH0_ORGANIZATION}" \
      "Auth0BaseUrl=${EXISTING_AUTH0_BASE_URL}" \
    --no-fail-on-empty-changeset

  # ── Phase 5: Update AUTH0_BASE_URL with actual App Runner URL ────────────
  echo ""
  echo "=== Phase 5: Updating AUTH0_BASE_URL ==="

  FRONTEND_URL=$(aws cloudformation describe-stacks \
    --stack-name "${FRONTEND_STACK_NAME}" \
    --region "${REGION}" \
    --query "Stacks[0].Outputs[?OutputKey=='ServiceUrl'].OutputValue" \
    --output text)

  if [[ "$EXISTING_AUTH0_BASE_URL" == "https://PLACEHOLDER" ]] && [[ -n "$FRONTEND_URL" ]] && [[ "$FRONTEND_URL" != "None" ]]; then
    echo "Updating AUTH0_BASE_URL to: ${FRONTEND_URL}"
    aws cloudformation deploy \
      --template-file "$(dirname "$0")/frontend-stack.yaml" \
      --stack-name "${FRONTEND_STACK_NAME}" \
      --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
      --region "${REGION}" \
      --parameter-overrides \
        "Environment=${ENVIRONMENT}" \
        "GitHubConnectionArn=${GITHUB_CONNECTION_ARN}" \
        "GitHubRepositoryUrl=${GITHUB_REPO_URL}" \
        "GitHubBranch=${GITHUB_BRANCH}" \
        "ApiGatewayUrl=${API_ENDPOINT}" \
        "Auth0IssuerBaseUrl=${AUTH0_ISSUER_BASE_URL}" \
        "Auth0Audience=${AUTH0_AUDIENCE}" \
        "Auth0Organization=${AUTH0_ORGANIZATION}" \
        "Auth0BaseUrl=${FRONTEND_URL}" \
      --no-fail-on-empty-changeset
  else
    echo "AUTH0_BASE_URL already set: ${EXISTING_AUTH0_BASE_URL}"
  fi
else
  echo ""
  echo "=== Phase 4-5: Skipping frontend (--skip-frontend) ==="
  FRONTEND_URL="(skipped)"
fi

# ── Phase 6: Summary ─────────────────────────────────────────────────────────
echo ""
echo "========================================"
echo "  Deployment Complete! (${ENVIRONMENT})"
echo "========================================"
echo ""
echo "Environment:  ${ENVIRONMENT}"
echo "Backend API:  ${API_ENDPOINT}"
echo "Frontend URL: ${FRONTEND_URL}"
echo ""
echo "Test backend health:"
echo "  curl ${API_ENDPOINT}api/health"
echo ""

if echo "$FRONTEND_SECRET" | grep -q "PLACEHOLDER_REPLACE_ME" 2>/dev/null; then
  echo "REMAINING STEPS:"
  echo "  1. Populate Auth0 secrets in Secrets Manager (see warnings above)"
  echo "  2. Redeploy frontend to pick up real secrets:"
  echo "       ./deploy.sh --environment=${ENVIRONMENT} --github-connection-arn=ARN --skip-backend"
  echo "  3. Configure Auth0 callback URLs (see below)"
  echo "  4. Seed the database: cd backend && python scripts/seed_dynamodb.py --env ${ENVIRONMENT}"
  echo ""
fi

echo "Auth0 callback URLs to configure:"
echo "  Allowed Callback URLs:  ${FRONTEND_URL}/api/auth/callback"
echo "  Allowed Logout URLs:    ${FRONTEND_URL}"
echo "  Allowed Web Origins:    ${FRONTEND_URL}"
echo ""
