# Project Portal - AWS Deployment Guide

## Overview

This project uses **AWS SAM (Serverless Application Model)** for deployment, matching the pattern from the WashCAD project. The backend is serverless using:

- **API Gateway** - REST API endpoints
- **Lambda Functions** - Python 3.10 handlers (one per endpoint)
- **DynamoDB** - NoSQL database (pay-per-request)
- **Auth0** - Authentication

## Architecture

```
┌─────────────────────────────────────────────────┐
│  Frontend (Vercel/Amplify)                      │
│  - Next.js 15 + React 19                        │
└─────────────────┬───────────────────────────────┘
                  │ HTTPS
┌─────────────────▼───────────────────────────────┐
│  API Gateway                                     │
│  - CORS enabled                                  │
│  - Auth0 custom authorizer                      │
└─────────────────┬───────────────────────────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
┌───▼──────┐ ┌───▼──────┐ ┌───▼──────┐
│ Lambda   │ │ Lambda   │ │ Lambda   │
│ Health   │ │ Deliver. │ │ Metrics  │
└───┬──────┘ └───┬──────┘ └───┬──────┘
    │            │            │
    └────────────┼────────────┘
                 │
┌────────────────▼────────────────────┐
│  DynamoDB Tables                    │
│  - deliverables                     │
│  - metrics                          │
│  - updates                          │
│  - users                            │
└─────────────────────────────────────┘
```

## Cost Estimate

**Monthly costs (pay-per-request, low traffic MVP):**
- Lambda: $0-5 (1M requests free tier)
- DynamoDB: $0-5 (25GB free tier)
- API Gateway: $0-5 (1M requests = $3.50)
- **Total: $0-15/month**

Compare to PostgreSQL approach: $82/month

## Prerequisites

### 1. Install AWS SAM CLI

**macOS:**
```bash
brew tap aws/tap
brew install aws-sam-cli
```

**Linux:**
```bash
wget https://github.com/aws/aws-sam-cli/releases/latest/download/aws-sam-cli-linux-x86_64.zip
unzip aws-sam-cli-linux-x86_64.zip -d sam-installation
sudo ./sam-installation/install
```

**Verify:**
```bash
sam --version
```

### 2. Configure AWS CLI

```bash
aws configure
# Enter:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region (e.g., us-east-1)
# - Default output format (json)

# Verify
aws sts get-caller-identity
```

### 3. Create S3 Deployment Bucket

```bash
# One-time setup per environment
aws s3 mb s3://project-portal-deployments-dev --region us-east-1
aws s3 mb s3://project-portal-deployments-prod --region us-east-1
```

## Deployment Steps

### Quick Deploy (Development)

```bash
cd backend

# Deploy to dev environment
./deploy.sh \
  --env=dev \
  --s3-bucket=project-portal-deployments-dev \
  --auth0-domain=your-domain.auth0.com \
  --auth0-audience=https://api.your-domain.example.com
```

### Production Deploy

```bash
./deploy.sh \
  --env=prod \
  --s3-bucket=project-portal-deployments-prod \
  --region=us-east-1 \
  --auth0-domain=your-domain.auth0.com \
  --auth0-audience=https://api.your-domain.example.com \
  --cors-origin=https://app.your-domain.example.com
```

### Using Environment Variables

Create `../frontend/.env.local`:
```bash
AUTH0_ISSUER_BASE_URL=https://your-domain.auth0.com
AUTH0_AUDIENCE=https://api.your-domain.example.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Then deploy:
```bash
./deploy.sh --env=dev --s3-bucket=project-portal-deployments-dev
```

## Post-Deployment

### 1. Get API Endpoint

The deploy script will output the API endpoint. Example:
```
ApiEndpoint: https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev/
```

### 2. Update Frontend Configuration

Update `frontend/.env.local`:
```bash
NEXT_PUBLIC_API_URL=https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev/
```

### 3. Seed Database

```bash
# TODO: Create seed script
# For now, use AWS Console to add initial data to DynamoDB tables
```

### 4. Test Health Check

```bash
curl https://your-api-endpoint/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "environment": "dev",
  "timestamp": "2025-10-13T12:00:00Z"
}
```

## Development Workflow

### Local Testing with SAM

```bash
# Start local API Gateway + Lambda
sam local start-api

# Test endpoint
curl http://localhost:3000/api/health
```

### Update and Redeploy

```bash
# Make code changes
vim lambda/deliverables/list.py

# Deploy (SAM only uploads changed functions)
./deploy.sh --env=dev --s3-bucket=project-portal-deployments-dev
```

### View Logs

```bash
# CloudWatch Logs
sam logs --stack-name project-portal-backend-dev --tail

# Or use AWS Console
# CloudWatch → Log Groups → /aws/lambda/portal-dev-*
```

## DynamoDB Tables

### Deliverables Table
```
PK: id (Number)
Attributes:
  - title (String)
  - description (String)
  - status (String): NOT_STARTED | IN_PROGRESS | REVIEW | BLOCKED | COMPLETED
  - completion_percentage (Number)
  - month (Number): 1-12
  - owner (String): PARTNER | CLIENT | JOINT
  - updated_at (String)

GSI: MonthIndex
  - PK: month
```

### Metrics Table
```
PK: id (Number)
Attributes:
  - name (String)
  - description (String)
  - current_value (Number)
  - target_value (Number)
  - unit (String)
  - updated_at (String)
```

### Updates Table
```
PK: id (Number)
Attributes:
  - content (String)
  - update_type (String): milestone | blocker | success | general
  - priority (String): high | normal | fyi
  - author_id (Number)
  - created_at (String)
  - read_by (List): [user_ids]

GSI: CreatedAtIndex
  - PK: created_at
GSI: TypeIndex
  - PK: update_type
  - SK: created_at
```

## Troubleshooting

### Deploy Fails with "No S3 bucket"

Create the deployment bucket:
```bash
aws s3 mb s3://project-portal-deployments-dev --region us-east-1
```

### Lambda Timeout Errors

Increase timeout in `template.yaml`:
```yaml
Globals:
  Function:
    Timeout: 60  # Increase from 30 to 60 seconds
```

### CORS Errors

Update `CorsOrigin` parameter:
```bash
./deploy.sh --cors-origin=https://your-frontend-domain.com
```

### DynamoDB Permission Errors

Check IAM policies in `template.yaml`. Lambda functions need:
- `DynamoDBReadPolicy` for GET operations
- `DynamoDBCrudPolicy` for PUT/POST/DELETE operations

## Clean Up (Delete Stack)

```bash
aws cloudformation delete-stack --stack-name project-portal-backend-dev

# Delete deployment artifacts
aws s3 rb s3://project-portal-deployments-dev --force
```

## Comparison to WashCAD

This deployment follows the exact same pattern as the WashCAD project:

| Feature | WashCAD | Project Portal |
|---------|---------|--------------|
| Deployment Tool | SAM | SAM |
| Compute | Lambda | Lambda |
| Database | DynamoDB | DynamoDB |
| API | API Gateway | API Gateway |
| Auth | Auth0 | Auth0 |
| Deploy Script | deploy.sh | deploy.sh |
| Cost | ~$5/month | ~$5-15/month |

**Key Difference:** Project Portal is much simpler - no file uploads, no weather data, just CRUD for project tracking.

## Next Steps

1. Convert FastAPI routes to Lambda handlers (see `lambda/` directory structure)
2. Create seed data script for initial deliverables/metrics
3. Set up CI/CD with GitHub Actions
4. Add CloudWatch alarms for monitoring
5. Create staging environment
