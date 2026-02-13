# Quick Start Guide - Project Portal

## Prerequisites

- Node.js 18+
- Python 3.12+
- Docker and Docker Compose
- Auth0 account

## Start the Portal (First Time)

### Step 1: Complete Auth0 Dashboard Configuration

Before starting the servers, configure your Auth0 application:

1. Visit your Auth0 dashboard at https://manage.auth0.com

2. Add these URLs in **Application URIs** section:

   **Allowed Callback URLs:**
   ```
   http://localhost:3000/api/auth/callback, https://<your-production-domain>/api/auth/callback
   ```

   **Allowed Logout URLs:**
   ```
   http://localhost:3000, https://<your-production-domain>
   ```

   **Allowed Web Origins:**
   ```
   http://localhost:3000, https://<your-production-domain>
   ```

3. Click **Save Changes**

**Full instructions**: See `AUTH0_SETUP.md`

---

### Step 2: Start with Docker Compose

```bash
cd /path/to/project

# Copy environment files
cp .env.example .env
cp frontend/.env.local.example frontend/.env.local
cp backend/.env.example backend/.env

# Start all services
docker compose up -d

# Verify they're running
docker compose ps
```

---

### Step 3: Start Backend (FastAPI)

Open a **new terminal**:

```bash
cd backend

# Create virtual environment (first time only)
python -m venv venv

# Activate virtual environment
source venv/bin/activate
# On Windows CMD: venv\Scripts\activate

# Install dependencies (first time only)
pip install -r requirements.txt

# Start FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Verify**: Visit http://127.0.0.1:8000/docs to see API documentation

---

### Step 4: Start Frontend (Next.js)

Open a **new terminal**:

```bash
cd frontend

# Install dependencies (first time only)
npm install

# Start Next.js dev server
npm run dev
```

**Verify**: Visit http://localhost:3000

---

### Step 5: Test Authentication

1. Visit http://localhost:3000
2. Click **Sign In** button
3. You'll be redirected to Auth0 login page
4. Login with a test user (create one in Auth0 dashboard first)

**Create Test User:**
- Go to your Auth0 dashboard > User Management > Users
- Click **Create User**
- Email: `test@example.com`
- Password: (set a password)
- Click **Create**

Then try logging in!

---

## Test the APIs

### Health Check
```bash
curl http://localhost:8000/api/health
```

Expected:
```json
{
  "status": "healthy",
  "service": "Project Portal API",
  "version": "1.0.0"
}
```

### Dashboard Data
```bash
curl http://localhost:8000/api/dashboard
```

---

## Access Points

Once everything is running:

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Main portal UI |
| **Backend API** | http://127.0.0.1:8000 | REST API |
| **API Docs** | http://127.0.0.1:8000/docs | Interactive API documentation |
| **ReDoc** | http://127.0.0.1:8000/redoc | Alternative API docs |

---

## Stopping Services

### Stop All Services
```bash
# Stop Docker services
docker compose down

# Stop backend: Ctrl+C in backend terminal
# Stop frontend: Ctrl+C in frontend terminal
```

---

## Restart After First Setup

On subsequent starts, it's much simpler:

```bash
# Terminal 1: Infrastructure
docker compose up -d

# Terminal 2: Backend
cd backend
source venv/bin/activate
uvicorn main:app --reload

# Terminal 3: Frontend
cd frontend
npm run dev
```

---

## Troubleshooting

### Backend Won't Start

**Error**: `ModuleNotFoundError: No module named 'fastapi'`

**Solution**:
```bash
source venv/bin/activate
pip install -r requirements.txt
```

### Frontend Won't Start

**Error**: `Cannot find module 'next'`

**Solution**:
```bash
rm -rf node_modules
npm install
```

### Auth0 Callback Error

**Error**: `Callback URL mismatch`

**Solution**:
- Check Auth0 dashboard has `http://localhost:3000/api/auth/callback`
- Verify `.env.local` has correct `AUTH0_BASE_URL=http://localhost:3000`
- Restart frontend server

### Port Already in Use

**Error**: `Port 3000 is already in use`

**Solution**:
```bash
lsof -i :3000
kill -9 <PID>
```

---

## Seed Database

```bash
cd backend
source venv/bin/activate
python scripts/seed_dynamodb.py --env dev
```

---

## Success Checklist

- [ ] Docker containers running
- [ ] Backend API running at http://127.0.0.1:8000
- [ ] Frontend running at http://localhost:3000
- [ ] API docs accessible at http://127.0.0.1:8000/docs
- [ ] Auth0 login working

---

## Next Steps

1. **Create Test Users in Auth0** (see AUTH0_SETUP.md)
2. **Build Dashboard Page** (`frontend/app/dashboard/page.tsx`)
3. **Connect APIs to Database** (replace placeholder data)
4. **Add UI Components** (deliverables cards, metrics charts)
