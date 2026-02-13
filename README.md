# Project Portal Template

A serverless project tracking portal built with Next.js, FastAPI, DynamoDB, and Auth0. Track deliverables, metrics, updates, meetings, and action items for any project engagement.

## Architecture

```
Frontend (Next.js)  -->  Backend (FastAPI)  -->  DynamoDB
      |                        |
  App Runner              Lambda + API GW
      |                        |
      +--- Auth0 (authentication) ---+
```

- **Frontend**: Next.js 15 on AWS App Runner (auto-deploy from GitHub)
- **Backend**: FastAPI on AWS Lambda via SAM/CloudFormation
- **Database**: AWS DynamoDB (serverless, pay-per-request)
- **Auth**: Auth0 with organization support

## Quick Start

```bash
# Clone and configure
git clone <repo-url> && cd project-portal
cp .env.example .env
cp frontend/.env.local.example frontend/.env.local
cp backend/.env.example backend/.env

# Start locally
docker-compose up -d

# Or start services individually
cd backend && python -m venv venv && source venv/bin/activate
pip install -r requirements.txt && uvicorn main:app --reload

cd frontend && npm install && npm run dev

# Seed sample data
cd backend && python scripts/seed_dynamodb.py --env dev
```

Frontend: http://localhost:3000 | API docs: http://localhost:8000/docs

## Deployment

Infrastructure is managed with AWS SAM. See [infra/README.md](infra/README.md) and
[docs/setup/DEPLOYMENT-GUIDE.md](docs/setup/DEPLOYMENT-GUIDE.md) for full instructions.

```bash
# Frontend: auto-deploys on push to main via App Runner

# Backend: manual SAM deploy
cd backend
sam build --template-file template-fastapi.yaml
sam deploy --guided

# Seed DynamoDB
python scripts/seed_dynamodb.py --env dev
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, Tailwind CSS, Recharts |
| Backend | FastAPI, Python 3.12, Pydantic, boto3 |
| Database | AWS DynamoDB |
| Auth | Auth0 (NextAuth integration) |
| Hosting | AWS App Runner (frontend), Lambda + API Gateway (backend) |
| IaC | AWS SAM / CloudFormation |

## Project Structure

```
frontend/          Next.js application
backend/           FastAPI application
  scripts/         Seed scripts and utilities
  template-*.yaml  SAM/CloudFormation templates
docs/
  setup/           Setup and deployment guides
infra/             Infrastructure configuration
```

## Documentation

- [Quick Start](docs/setup/QUICKSTART.md)
- [Auth0 Setup](docs/setup/AUTH0_SETUP.md)
- [Deployment Guide](docs/setup/DEPLOYMENT-GUIDE.md)
- [Database Setup](docs/setup/SETUP_DATABASE.md)
- [Port Allocation](docs/setup/PORT-ALLOCATION.md)
