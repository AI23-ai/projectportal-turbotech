# Database Setup & Data Seeding

This guide shows you how to initialize the database with sample data.

---

## What This Does

The seed script populates your DynamoDB tables with sample project data:

- **5 Deliverables** across project phases
- **3 Metrics** with targets
- **3 Updates** (project milestones)
- **2 Meetings** with notes
- **2 Action Items** linked to meetings

After running this, your dashboard will show sample project data instead of empty tables.

---

## Prerequisites

- AWS CLI configured with DynamoDB access
- Python 3.12+ with boto3 installed
- DynamoDB tables created (via SAM deployment)

---

## Steps to Seed the Database

### 1. Activate backend virtual environment

```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Run the seed script

```bash
# From the backend directory
python scripts/seed_dynamodb.py --env dev
```

**Expected output:**
```
Seeding DynamoDB tables for environment: dev

Seeding 5 deliverables to turbotech-dev-deliverables...
  - Added: Project Setup & Configuration
  - Added: Requirements Documentation
  ...
Seeding complete!
```

### 3. View the data

Visit your dashboard: **http://localhost:3000/dashboard**

You should now see:
- **Deliverables**: Sample project items with status tracking
- **Metrics**: Overall completion, tasks completed, active users
- **Updates**: Project milestones and announcements

---

## Seed Specific Tables

```bash
# Seed only deliverables
python scripts/seed_dynamodb.py --env dev --deliverables-only

# Seed only metrics
python scripts/seed_dynamodb.py --env dev --metrics-only

# Seed only updates
python scripts/seed_dynamodb.py --env dev --updates-only
```

---

## Re-seeding the Database

If you need to clear and re-seed, simply run the seed script again. DynamoDB `put_item` will overwrite existing items with the same keys.

---

## Troubleshooting

### Error: "Table does not exist"

Ensure DynamoDB tables are created. Deploy the SAM stack first:
```bash
cd backend
sam build --template-file template-fastapi.yaml
sam deploy --guided
```

### Error: "Unable to locate credentials"

Configure AWS CLI:
```bash
aws configure
```

---

## Verify Everything Works

1. **Check Dashboard**: http://localhost:3000/dashboard
2. **Check API directly**: http://localhost:8000/api/dashboard
3. **Check metrics**: http://localhost:8000/api/metrics
