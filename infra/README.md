# Infrastructure

CloudFormation templates and deployment scripts for the Project Portal.

## Architecture

A single `deploy.sh` script handles all environments. Resource names are derived from `--environment`:

| Stack pattern | Template | What it deploys |
|---------------|----------|-----------------|
| `portal-{env}-secrets` | `secrets-stack.yaml` | Secrets Manager secrets for Auth0 credentials |
| `portal-backend-{env}` | `../backend/template-fastapi.yaml` | Lambda + API Gateway + 7 DynamoDB tables (SAM) |
| `portal-{env}-frontend` | `frontend-stack.yaml` | App Runner service (Next.js from GitHub source) |

## Prerequisites

- **AWS CLI** configured with the target account credentials
- **SAM CLI**: `brew install aws-sam-cli`
- **Docker** running (for backend Lambda image build)
- **App Runner GitHub connection** (one-time setup per account, see below)
- **Auth0 application** configured for the target environment

## First-Time Setup

### 1. Create App Runner GitHub Connection

This requires a one-time OAuth handshake per AWS account that can't be automated.

1. Go to [App Runner GitHub connections](https://us-east-2.console.aws.amazon.com/apprunner/home?region=us-east-2#/github-connections)
2. Click "Add new" and complete the GitHub OAuth flow
3. Copy the connection ARN (e.g., `arn:aws:apprunner:us-east-2:123456789:connection/...`)

### 2. Deploy

```bash
# Staging
./deploy.sh --environment=staging --github-connection-arn=arn:aws:apprunner:us-east-2:ACCOUNT:connection/NAME/ID --github-repo-url=https://github.com/YOUR-ORG/YOUR-REPO

# Production
./deploy.sh --environment=prod --github-connection-arn=arn:aws:apprunner:us-east-2:ACCOUNT:connection/NAME/ID --github-repo-url=https://github.com/YOUR-ORG/YOUR-REPO
```

### 3. Populate Secrets

After the first deploy, the secrets have placeholder values. Update them:

```bash
# Generate a random AUTH0_SECRET
AUTH0_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# Replace ENV with 'staging' or 'prod'
ENV=staging

# Frontend secret
aws secretsmanager put-secret-value \
  --secret-id portal-${ENV}/auth0-frontend \
  --region us-east-2 \
  --secret-string "{\"AUTH0_SECRET\":\"${AUTH0_SECRET}\",\"AUTH0_CLIENT_ID\":\"YOUR_CLIENT_ID\",\"AUTH0_CLIENT_SECRET\":\"YOUR_CLIENT_SECRET\"}"

# Backend secret
aws secretsmanager put-secret-value \
  --secret-id portal-${ENV}/auth0-backend \
  --region us-east-2 \
  --secret-string '{"AUTH0_DOMAIN":"your-tenant.us.auth0.com","AUTH0_AUDIENCE":"https://your-api-audience"}'
```

Then redeploy the frontend to pick up the real secrets:

```bash
./deploy.sh --environment=${ENV} --github-connection-arn=ARN --skip-backend
```

### 4. Configure Auth0

Add these URLs to your Auth0 application settings:

- **Allowed Callback URLs**: `https://<app-runner-url>/api/auth/callback`
- **Allowed Logout URLs**: `https://<app-runner-url>`
- **Allowed Web Origins**: `https://<app-runner-url>`

### 5. Seed the Database

```bash
cd ../backend && python scripts/seed_dynamodb.py --env ${ENV}
```

## Updating

For subsequent deploys (code changes, config updates):

```bash
# Full deploy (backend + frontend)
./deploy.sh --environment=staging --github-connection-arn=ARN --github-repo-url=URL

# Backend only
./deploy.sh --environment=prod --github-connection-arn=ARN --skip-frontend

# Frontend only
./deploy.sh --environment=prod --github-connection-arn=ARN --skip-backend
```

Note: The frontend auto-deploys from GitHub on push to `main` via App Runner. Manual redeploy is only needed for infrastructure or config changes.

## All Options

```
./deploy.sh --environment=<staging|prod> --github-connection-arn=ARN --github-repo-url=URL [options]

Required:
  --environment=ENV              Deployment environment (staging, prod)
  --github-connection-arn=ARN    App Runner GitHub connection ARN
  --github-repo-url=URL         GitHub repository URL

Optional:
  --region=REGION                AWS region (default: us-east-2)
  --sam-s3-bucket=BUCKET         S3 bucket for SAM artifacts
  --auth0-issuer=URL             Auth0 issuer URL (reads from Secrets Manager if omitted)
  --auth0-audience=URL           Auth0 API audience (reads from Secrets Manager if omitted)
  --auth0-organization=ID        Auth0 organization ID (optional)
  --github-branch=BRANCH         Branch to deploy (default: main)
  --skip-backend                 Skip backend deployment
  --skip-frontend                Skip frontend deployment
```
