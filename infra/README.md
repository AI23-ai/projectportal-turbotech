# Infrastructure

CloudFormation templates and deployment script for Project Portal.

## Architecture

A single `deploy.sh` script handles all environments. It supports two backend deployment paths, auto-detected by file existence:

### SAM Backend (default)

| Stack | Template | What it deploys |
|-------|----------|-----------------|
| `{client}-{env}-{project}-secrets` | `secrets-stack.yaml` | Secrets Manager (Auth0 + DB placeholder) |
| `{client}-{env}-{project}-backend` | `../backend/template-fastapi.yaml` | Lambda + API Gateway (SAM) |
| `{client}-{env}-{project}-frontend` | `frontend-stack.yaml` | App Runner (Next.js from GitHub) |

### App Runner Backend (with database)

Activated when `backend-stack.yaml` and `database-stack.yaml` exist in `infra/`.

| Stack | Template | What it deploys |
|-------|----------|-----------------|
| `{client}-{env}-{project}-secrets` | `secrets-stack.yaml` | Secrets Manager (Auth0 + DB) |
| `{client}-{env}-database` | `database-stack.yaml` | VPC networking, RDS PostgreSQL, S3 |
| `{client}-{env}-{project}-backend` | `backend-stack.yaml` | ECR + App Runner (FastAPI) |
| `{client}-{env}-{project}-frontend` | `frontend-stack.yaml` | App Runner (Next.js from GitHub) |

### Branch Strategy

| Environment | Default branch |
|-------------|---------------|
| `staging` | `staging` |
| `prod` | `main` |

Override with `--github-branch=BRANCH`.

## Prerequisites

- **AWS CLI** configured with the target account credentials
- **SAM CLI**: `brew install aws-sam-cli` (SAM backend only)
- **Docker** running (for backend container/image build)
- **App Runner GitHub connection** (one-time setup per account, see below)

## First-Time Setup

### 1. Create App Runner GitHub Connection

This requires a one-time OAuth handshake per AWS account that can't be automated.

1. Go to [App Runner GitHub connections](https://us-east-2.console.aws.amazon.com/apprunner/home?region=us-east-2#/github-connections)
2. Click "Add new" and complete the GitHub OAuth flow
3. Copy the connection ARN (e.g., `arn:aws:apprunner:us-east-2:123456789:connection/...`)

### 2. (Optional) Set Up Auth0 Automation

Store Auth0 M2M credentials in Secrets Manager for automated Auth0 provisioning:

```bash
aws secretsmanager create-secret \
  --name "ai23-m2m/auth0-deploy" \
  --secret-string '{"AUTH0_DOMAIN":"ai23-dev.us.auth0.com","AUTH0_M2M_CLIENT_ID":"...","AUTH0_M2M_CLIENT_SECRET":"..."}'
```

The M2M application needs `read:clients`, `create:clients`, `update:clients`, `read:organizations`, `create:organizations`, `update:organizations`, `read:organization_members`, `create:organization_members`, `read:connections`, `create:resource_servers`, `update:resource_servers`, `read:client_grants`, `create:client_grants` scopes.

### 3. Deploy

#### SAM backend (default)

```bash
# Staging
./deploy.sh --client=turbotech --project=portal --environment=staging \
  --github-connection-arn=arn:aws:apprunner:us-east-2:ACCOUNT:connection/NAME/ID

# Production
./deploy.sh --client=turbotech --project=portal --environment=prod \
  --github-connection-arn=arn:aws:apprunner:us-east-2:ACCOUNT:connection/NAME/ID
```

#### App Runner backend (with database)

```bash
# Staging
./deploy.sh --client=fpls --project=boss --environment=staging \
  --github-connection-arn=arn:aws:apprunner:us-east-2:ACCOUNT:connection/NAME/ID \
  --vpc-id=vpc-xxx --subnet-ids=subnet-aaa,subnet-bbb --db-password=<password>

# Production
./deploy.sh --client=fpls --project=boss --environment=prod \
  --github-connection-arn=arn:aws:apprunner:us-east-2:ACCOUNT:connection/NAME/ID \
  --vpc-id=vpc-xxx --subnet-ids=subnet-aaa,subnet-bbb --db-password=<password>
```

### 4. Populate Secrets (if not using Auth0 automation)

If you skipped Auth0 automation (`--skip-auth0`), populate secrets manually:

```bash
# Generate a random AUTH0_SECRET
AUTH0_SECRET=$(python3 -c "import secrets; print(secrets.token_hex(32))")

CLIENT=turbotech
PROJECT=portal
ENV=staging

# Frontend secret
aws secretsmanager put-secret-value \
  --secret-id "${CLIENT}-${ENV}-${PROJECT}/auth0-frontend" \
  --region us-east-2 \
  --secret-string "{\"AUTH0_SECRET\":\"${AUTH0_SECRET}\",\"AUTH0_CLIENT_ID\":\"YOUR_CLIENT_ID\",\"AUTH0_CLIENT_SECRET\":\"YOUR_CLIENT_SECRET\"}"

# Backend secret
aws secretsmanager put-secret-value \
  --secret-id "${CLIENT}-${ENV}-${PROJECT}/auth0-backend" \
  --region us-east-2 \
  --secret-string '{"AUTH0_DOMAIN":"your-tenant.us.auth0.com","AUTH0_AUDIENCE":"https://your-api-audience","AUTH0_ORGANIZATION":"org_xxx"}'
```

Then redeploy the frontend:

```bash
./deploy.sh --client=${CLIENT} --project=${PROJECT} --environment=${ENV} \
  --github-connection-arn=ARN --skip-backend --skip-auth0
```

### 5. Configure Auth0 (if not using Auth0 automation)

Add these URLs to your Auth0 application settings:

- **Allowed Callback URLs**: `https://<app-runner-url>/auth/callback`
- **Allowed Logout URLs**: `https://<app-runner-url>`
- **Allowed Web Origins**: `https://<app-runner-url>`

## Updating

For subsequent deploys (code changes, config updates):

```bash
# Full deploy
./deploy.sh --client=turbotech --project=portal --environment=staging \
  --github-connection-arn=ARN --skip-auth0

# Backend only
./deploy.sh --client=turbotech --project=portal --environment=staging \
  --skip-frontend --skip-auth0

# Frontend only
./deploy.sh --client=turbotech --project=portal --environment=staging \
  --github-connection-arn=ARN --skip-backend --skip-auth0
```

Note: The frontend auto-deploys from GitHub on push via App Runner. Manual redeploy is only needed for infrastructure or config changes.

## All Options

```
./deploy.sh --client=NAME --project=NAME --environment=<staging|prod> [options]

Required:
  --client=NAME                Client short name (e.g., turbotech, fpls)
  --project=NAME               Project short name (e.g., portal, boss)
  --environment=ENV            Deployment environment (staging, prod)
  --github-connection-arn=ARN  App Runner GitHub connection ARN

Database / App Runner backend (required if database-stack.yaml exists):
  --vpc-id=VPC_ID              VPC ID for RDS and App Runner VPC connector
  --subnet-ids=IDS             Comma-separated subnet IDs (at least 2 AZs)
  --db-password=PASSWORD       RDS master password (first deploy only)

Auth0 automation (optional — reads from Secrets Manager if omitted):
  --auth0-m2m-client-id=ID     Auth0 M2M client ID
  --auth0-m2m-client-secret=S  Auth0 M2M client secret
  --auth0-domain=DOMAIN        Auth0 tenant domain
  --auth0-org-name=NAME        Auth0 org name (default: {client}-{env})
  --auth0-api-audience=URL     Auth0 API audience identifier
  --skip-auth0                 Skip Auth0 automation (use manual setup)

Optional:
  --region=REGION              AWS region (default: us-east-2)
  --github-repo-url=URL        GitHub repo URL (auto-derived from git remote)
  --github-branch=BRANCH       Branch to deploy (default: staging for staging, main for prod)
  --sam-s3-bucket=BUCKET       S3 bucket for SAM artifacts (SAM backend only)
  --auth0-issuer=URL           Auth0 issuer URL (auto-configured if M2M creds available)
  --auth0-audience=URL         Auth0 API audience (auto-configured if M2M creds available)
  --auth0-organization=ID      Auth0 organization ID (override auto-derived org)
  --db-instance-class=CLASS    RDS instance class (default: db.t4g.micro)
  --skip-backend               Skip backend deployment
  --skip-frontend              Skip frontend deployment
  --skip-database              Skip database/storage deployment
```

## Resource Naming & Tagging

All resource names are derived from `--client` and `--project`:
- Secret prefix: `{client}-{env}-{project}/`
- Stack names: `{client}-{env}-{project}-{component}`
- Database stack: `{client}-{env}-database` (shared across projects)

All AWS resources are tagged with `project` and `client` tags for cost allocation and filtering.
