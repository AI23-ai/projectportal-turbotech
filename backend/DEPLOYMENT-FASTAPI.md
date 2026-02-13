# Project Portal - FastAPI + Lambda Web Adapter Deployment

## Overview

This deployment uses **AWS Lambda Web Adapter** to run your existing FastAPI application on AWS Lambda without code changes. The entire FastAPI app runs as a single Lambda function with DynamoDB for data storage.

### Architecture

```
Frontend (Vercel/Amplify)
         ↓ HTTPS
API Gateway (HTTP API)
         ↓
Lambda Function (Container)
  ├─ Lambda Web Adapter (converts API Gateway → HTTP)
  └─ FastAPI + Uvicorn (your existing code!)
         ↓
DynamoDB Tables
  ├─ deliverables
  ├─ metrics
  ├─ updates
  └─ users
```

### Key Benefits

✅ **Keep your FastAPI code unchanged** - No rewrite to Lambda handlers!
✅ **Simple deployment** - One `./deploy.sh` command (like WashCAD)
✅ **Serverless pricing** - Pay only when used ($5-15/month for MVP)
✅ **Auto-scaling** - Handles any traffic automatically
✅ **DynamoDB** - Pay-per-request, no fixed database costs

### Trade-offs

❌ **Cold starts** - First request after idle: 3-5 seconds
❌ **No PostgreSQL** - Using DynamoDB instead (no pgvector)
✅ **Perfect for simple CRUD portal** - Not for heavy AI features

---

## Prerequisites

### 1. Install AWS SAM CLI

**macOS:**
```bash
brew tap aws/tap
brew install aws-sam-cli
```

**Linux/WSL:**
```bash
wget https://github.com/aws/aws-sam-cli/releases/latest/download/aws-sam-cli-linux-x86_64.zip
unzip aws-sam-cli-linux-x86_64.zip -d sam-installation
sudo ./sam-installation/install
```

**Verify:**
```bash
sam --version
# Should show: SAM CLI, version 1.120.0 or later
```

### 2. Install Docker

**Required for building Lambda container images.**

```bash
# Check if Docker is installed
docker --version

# If not installed, download from: https://docs.docker.com/get-docker/
```

### 3. Configure AWS CLI

```bash
aws configure
# Enter:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region: us-east-1
# - Default output format: json

# Verify
aws sts get-caller-identity
```

### 4. Create S3 Deployment Bucket (One-time)

```bash
aws s3 mb s3://project-portal-deployments-dev --region us-east-1
```

---

## Quick Start Deployment

### Step 1: Configure Environment

Create `../frontend/.env.local`:
```bash
AUTH0_ISSUER_BASE_URL=https://your-domain.auth0.com
AUTH0_AUDIENCE=https://api.your-domain.example.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 2: Deploy Backend

```bash
cd backend

# Deploy to dev environment
./deploy.sh \
  --env=dev \
  --s3-bucket=project-portal-deployments-dev \
  --auth0-domain=your-domain.auth0.com \
  --auth0-audience=https://api.your-domain.example.com
```

**What happens:**
1. ✅ Docker builds your FastAPI container image
2. ✅ SAM creates/updates CloudFormation stack
3. ✅ Pushes image to ECR (Elastic Container Registry)
4. ✅ Creates/updates Lambda function
5. ✅ Creates/updates DynamoDB tables
6. ✅ Configures API Gateway

**Time:** ~5-10 minutes (first deploy), ~2-3 minutes (updates)

### Step 3: Get API Endpoint

The deploy script will output:
```
ApiEndpoint: https://abc123xyz.execute-api.us-east-1.amazonaws.com/
```

### Step 4: Update Frontend

Update `frontend/.env.local`:
```bash
NEXT_PUBLIC_API_URL=https://abc123xyz.execute-api.us-east-1.amazonaws.com/
```

### Step 5: Test

```bash
# Test health endpoint
curl https://your-api-endpoint/api/health

# Should return:
# {"status":"healthy","environment":"dev",...}
```

---

## How Lambda Web Adapter Works

### Traditional Lambda (❌ Requires rewrite)
```python
def lambda_handler(event, context):
    # Parse API Gateway event
    body = json.loads(event['body'])
    # ... handle request
    return {
        'statusCode': 200,
        'body': json.dumps(response)
    }
```

### Lambda Web Adapter (✅ No changes!)
```python
# Your existing FastAPI code just works!
@app.get("/api/deliverables")
async def list_deliverables():
    return {"deliverables": [...]}
```

**Magic:** Lambda Web Adapter intercepts API Gateway events and converts them to standard HTTP requests that FastAPI understands!

---

## File Structure

```
backend/
├── Dockerfile                    # Lambda container with Web Adapter
├── template-fastapi.yaml         # SAM template (single Lambda)
├── deploy.sh                     # Deployment script
├── app/                          # Your FastAPI application
│   ├── main.py                   # FastAPI app
│   ├── api/                      # API routes
│   ├── models/                   # Data models
│   └── ...
├── requirements.txt              # Python dependencies
└── DEPLOYMENT-FASTAPI.md         # This file
```

---

## DynamoDB Integration

### Current Status

Your FastAPI app currently uses **PostgreSQL with SQLAlchemy**. For this deployment, you need to:

**Option 1: Use DynamoDB adapter (recommended)**
- Keep your existing route structure
- Replace SQLAlchemy with boto3 DynamoDB calls
- See `app/adapters/dynamodb.py` (TODO: create this)

**Option 2: Keep PostgreSQL (add RDS)**
- Add RDS Serverless v2 to template
- Keep all your existing code
- Cost: +$10-20/month

---

## Environment Variables

Your Lambda function has access to:

```bash
ENVIRONMENT=dev                    # dev, staging, prod
LOG_LEVEL=INFO                     # DEBUG, INFO, WARNING, ERROR
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_AUDIENCE=https://api...
CORS_ORIGIN=*                      # Or specific domain

# DynamoDB table names
DELIVERABLES_TABLE=portal-dev-deliverables
METRICS_TABLE=portal-dev-metrics
UPDATES_TABLE=portal-dev-updates
USERS_TABLE=portal-dev-users
```

Access in FastAPI:
```python
import os

table_name = os.environ['DELIVERABLES_TABLE']
```

---

## Deployment Workflows

### Development Workflow

```bash
# 1. Make code changes
vim app/api/deliverables.py

# 2. Deploy (only rebuilds changed Lambda)
./deploy.sh --env=dev --s3-bucket=project-portal-deployments-dev

# 3. Test
curl https://your-api/api/deliverables
```

### Production Deployment

```bash
# Deploy to production
./deploy.sh \
  --env=prod \
  --s3-bucket=project-portal-deployments-prod \
  --auth0-domain=your-domain.auth0.com \
  --auth0-audience=https://api.your-domain.example.com \
  --cors-origin=https://app.your-domain.example.com
```

### Multi-Environment Strategy

```bash
# Create separate buckets
aws s3 mb s3://project-portal-deployments-dev
aws s3 mb s3://project-portal-deployments-staging
aws s3 mb s3://project-portal-deployments-prod

# Deploy to each
./deploy.sh --env=dev --s3-bucket=project-portal-deployments-dev
./deploy.sh --env=staging --s3-bucket=project-portal-deployments-staging
./deploy.sh --env=prod --s3-bucket=project-portal-deployments-prod
```

---

## Monitoring & Debugging

### View Logs

```bash
# Tail logs in real-time
sam logs --stack-name project-portal-backend-dev --tail

# View specific time range
sam logs --stack-name project-portal-backend-dev \
  --start-time '10min ago' \
  --end-time '5min ago'
```

### CloudWatch Logs (AWS Console)

1. Go to CloudWatch → Log Groups
2. Find `/aws/lambda/project-portal-backend-dev-FastAPIFunction-xxx`
3. View log streams

### Common Issues

**Cold Start Too Slow:**
```yaml
# Increase memory (faster CPU) in template-fastapi.yaml
MemorySize: 2048  # Up from 1024
```

**Timeout Errors:**
```yaml
# Increase timeout in template-fastapi.yaml
Timeout: 60  # Up from 30
```

**DynamoDB Throttling:**
```yaml
# Change to provisioned capacity
BillingMode: PROVISIONED
ProvisionedThroughput:
  ReadCapacityUnits: 5
  WriteCapacityUnits: 5
```

---

## Cost Breakdown

### Monthly Costs (Low Traffic MVP)

| Service | Usage | Cost |
|---------|-------|------|
| Lambda | 100K requests @ 1024MB, 1s avg | $2.08 |
| API Gateway (HTTP API) | 100K requests | $0.10 |
| DynamoDB | 100K reads, 50K writes | $0.63 |
| ECR (Docker images) | 1 GB storage | $0.10 |
| CloudWatch Logs | 1 GB ingestion, 1 GB storage | $0.53 |
| **Total** | | **~$3.44/month** |

### Scaling Costs

| Traffic Level | Requests/Month | Estimated Cost |
|---------------|----------------|----------------|
| MVP (low) | 100K | $3-5 |
| Growing | 1M | $20-30 |
| Production | 10M | $150-200 |

**Compare to always-on server:**
- EC2 t3.small: ~$15/month minimum
- RDS t3.micro: ~$15/month minimum
- **Fixed costs: $30/month even with 0 traffic**

---

## Troubleshooting

### Deploy Fails: "Docker daemon not running"

```bash
# Start Docker Desktop (macOS/Windows)
# Or start Docker service (Linux)
sudo systemctl start docker
```

### Deploy Fails: "No such file: app/main.py"

Your FastAPI app must be in `backend/app/main.py`:
```bash
cd backend
ls -la app/main.py  # Should exist
```

### Lambda Returns 502 Bad Gateway

Check CloudWatch logs:
```bash
sam logs --stack-name project-portal-backend-dev --tail
```

Common causes:
- FastAPI not starting (check `app.main:app` path)
- Missing dependencies in requirements.txt
- Environment variables not set

### CORS Errors

Update CORS_ORIGIN parameter:
```bash
./deploy.sh --cors-origin=https://your-frontend-domain.com
```

---

## Next Steps

### 1. Create DynamoDB Adapter

Replace SQLAlchemy calls with boto3:
```python
# app/adapters/dynamodb.py
import boto3
import os

dynamodb = boto3.resource('dynamodb')

class DeliverableAdapter:
    def __init__(self):
        self.table = dynamodb.Table(os.environ['DELIVERABLES_TABLE'])

    def list_all(self):
        response = self.table.scan()
        return response['Items']
```

### 2. Seed DynamoDB Data

Create script to populate initial deliverables:
```bash
python scripts/seed_dynamodb.py --env=dev
```

### 3. Set Up CI/CD

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy Backend
on:
  push:
    branches: [main]
    paths: ['backend/**']
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: aws-actions/setup-sam@v2
      - run: cd backend && ./deploy.sh --env=prod
```

### 4. Add Monitoring

Set up CloudWatch alarms for:
- Lambda errors
- High latency
- DynamoDB throttling

---

## Migration Path to PostgreSQL (Future)

When you need PostgreSQL + pgvector for AI features:

1. Add RDS Serverless v2 to template:
```yaml
DBInstance:
  Type: AWS::RDS::DBInstance
  Properties:
    Engine: postgres
    EngineVersion: '15.4'
    DBInstanceClass: db.serverless
    ...
```

2. Update Lambda environment:
```yaml
Environment:
  Variables:
    DATABASE_URL: !Sub "postgresql://${DBInstance.Endpoint.Address}:5432/portal"
```

3. Keep DynamoDB for cache/sessions, use PostgreSQL for AI data

---

## Comparison to Original Plan

| Aspect | Original (RDS + ECS) | Current (Lambda + DynamoDB) |
|--------|---------------------|----------------------------|
| Cost (MVP) | $82/month | $5-15/month |
| Deploy complexity | High (VPC, ALB, ECS) | Low (single command) |
| FastAPI changes | None | Need DynamoDB adapter |
| Cold starts | No | Yes (3-5s) |
| PostgreSQL | Yes | No (can add later) |
| Auto-scaling | Manual | Automatic |
| Best for | AI features | Simple CRUD portal |

**Recommendation:** Start with this serverless approach for MVP, migrate to RDS when you build the actual AI estimation system (separate project).

---

## Support

**Questions?** Check:
- [AWS Lambda Web Adapter Docs](https://github.com/awslabs/aws-lambda-web-adapter)
- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/)
- [FastAPI on Lambda Guide](https://aws.amazon.com/blogs/compute/using-aws-lambda-web-adapter-to-deploy-python-web-frameworks/)

**Issues?** Create an issue in the repo or check CloudWatch Logs.
