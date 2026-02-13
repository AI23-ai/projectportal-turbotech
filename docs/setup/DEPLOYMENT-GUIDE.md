# Project Portal - Deployment Guide

This document clarifies which deployment files are actively used vs obsolete to prevent confusion for future development teams.

---

## Active Deployment Strategy

### **Frontend (Next.js)**
**Service:** AWS App Runner
**Deployment Method:** Native Node.js Runtime (configured in AWS Console)

**Configuration:**
- Configuration stored directly in AWS App Runner service settings
- **NOT** using `apprunner.yaml` (obsolete)

**How to Deploy:**
```bash
# Trigger new deployment (pulls latest from GitHub main branch)
aws apprunner start-deployment \
  --service-arn <your-apprunner-service-arn> \
  --region <your-aws-region>
```

**Build/Start Commands (configured in AWS):**
- Build: `cd frontend && npm install && npm run build`
- Start: `cd frontend && npm start`
- Port: 3000

---

### **Backend (FastAPI)**
**Service:** AWS Lambda + Function URL (via SAM/CloudFormation)
**Deployment Method:** SAM Template

**Active Files:**
- `backend/template-fastapi.yaml` - CloudFormation/SAM template (ACTIVE)
- `backend/Dockerfile` - Docker image for Lambda (ACTIVE)

**How to Deploy:**
```bash
cd backend

# Build
sam build --template-file template-fastapi.yaml

# Deploy
sam deploy \
  --template-file .aws-sam/build/template.yaml \
  --stack-name portal-backend-dev \
  --capabilities CAPABILITY_IAM \
  --region <your-aws-region> \
  --parameter-overrides \
    Environment=dev \
    Auth0Domain=<your-auth0-domain>.us.auth0.com \
    Auth0Audience=https://api.<your-production-domain>
```

---

## Local Development

### **docker-compose.yml**
**ACTIVE** - Used for local development only

**Services:**
- `backend` - FastAPI backend (port 8000)
- `frontend` - Next.js frontend (port 3000)

**How to Use:**
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f
```

---

## Deployment Architecture Diagram

```
+---------------------------------------------------------+
|                    PRODUCTION                            |
+---------------------------------------------------------+
|                                                         |
|  Frontend (Next.js)              Backend (FastAPI)      |
|  +------------------+            +-----------------+    |
|  | AWS App Runner   |            | AWS Lambda +    |    |
|  | Native Node.js   |----------->| Function URL    |    |
|  | Port 3000        |   API      |                 |    |
|  +------------------+   Calls    +-----------------+    |
|                                                         |
|                                  +-----------------+    |
|                                  | DynamoDB Tables |    |
|                                  | - Deliverables  |    |
|                                  | - Metrics       |    |
|                                  | - Updates       |    |
|                                  +-----------------+    |
+---------------------------------------------------------+

+---------------------------------------------------------+
|                LOCAL DEVELOPMENT                         |
+---------------------------------------------------------+
|                                                         |
|  +--------------+  +--------------+                     |
|  | Frontend     |  | Backend      |                     |
|  | Docker       |  | Docker       |                     |
|  | Port 3000    |->| Port 8000    |                     |
|  +--------------+  +--------------+                     |
|                                                         |
|  Managed by: docker-compose.yml                         |
+---------------------------------------------------------+
```

---

## Environment Variables

### **Frontend (App Runner)**
Configured in AWS App Runner service settings:
- `NEXT_PUBLIC_API_URL=https://api.<your-production-domain>`
- `AUTH0_SECRET=...`
- `AUTH0_BASE_URL=https://<your-production-domain>`
- `AUTH0_ISSUER_BASE_URL=https://<your-auth0-domain>.us.auth0.com`
- `AUTH0_CLIENT_ID=<your-auth0-client-id>`
- `AUTH0_CLIENT_SECRET=<your-auth0-client-secret>`
- `AUTH0_AUDIENCE=https://api.<your-production-domain>`

### **Backend (Lambda via SAM)**
Configured in CloudFormation stack parameters:
- `Environment=dev`
- `Auth0Domain=<your-auth0-domain>.us.auth0.com`
- `Auth0Audience=https://api.<your-production-domain>`

DynamoDB table names set via environment variables:
- `DELIVERABLES_TABLE=portal-dev-deliverables`
- `METRICS_TABLE=portal-dev-metrics`
- `UPDATES_TABLE=portal-dev-updates`

### **Local Development**
Use `.env.local` files:
- `frontend/.env.local` - Frontend environment variables
- `backend/.env` - Backend environment variables

---

## Deployment Checklist

### **Frontend Updates**
1. Commit and push changes to GitHub `main` branch
2. Trigger App Runner deployment
3. Monitor deployment (5-10 minutes)
4. Verify at your production URL

### **Backend Updates**
1. Commit changes to `backend/` directory
2. Build SAM template:
   ```bash
   cd backend
   sam build --template-file template-fastapi.yaml
   ```
3. Deploy:
   ```bash
   sam deploy \
     --template-file .aws-sam/build/template.yaml \
     --stack-name portal-backend-dev \
     --capabilities CAPABILITY_IAM \
     --region <your-aws-region>
   ```
4. Verify at your API URL `/docs`

### **Database Updates (DynamoDB)**
1. Update seed script: `backend/scripts/seed_dynamodb.py`
2. Run seeding:
   ```bash
   cd backend
   python scripts/seed_dynamodb.py --env dev
   ```

---

## Additional Resources

- **App Runner Documentation:** https://docs.aws.amazon.com/apprunner/
- **SAM Documentation:** https://docs.aws.amazon.com/serverless-application-model/
- **DynamoDB Documentation:** https://docs.aws.amazon.com/dynamodb/

---

**Maintained By:** Platform Team
