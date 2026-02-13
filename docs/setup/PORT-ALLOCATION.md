# Port Allocation

This document tracks all service port assignments to prevent port conflicts during local development.

---

## Current Port Allocation

### Project Portal

| Service | Port | Protocol | Usage |
|---------|------|----------|-------|
| **Frontend (Next.js)** | **3000** | HTTP | Development server |
| **Backend (FastAPI)** | **8000** | HTTP | API server |

---

## Quick Reference

### Project Portal URLs

**Local Development**:
```
Frontend:  http://localhost:3000
Backend:   http://localhost:8000/docs
API:       http://localhost:8000/api
```

**Auth0 Configuration**:
```
Allowed Callback URLs:    http://localhost:3000/api/auth/callback
Allowed Logout URLs:      http://localhost:3000
Allowed Web Origins:      http://localhost:3000
```

**Production** (when deployed):
```
Frontend:  https://<your-production-domain>
Backend:   https://api.<your-production-domain>
```

---

## Configuration Files

### 1. Backend Port (8000)

**Start command**:
```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Docker Compose** (starts on port 8000):
```bash
docker-compose up -d
```

---

### 2. Frontend Port (3000) and API URL

**File**: `frontend/.env.local`

```bash
# Frontend runs on port 3000 (default)
# PORT=3000  # Optional, Next.js defaults to 3000

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Auth0 Configuration
AUTH0_SECRET='use [openssl rand -hex 32] to generate a 32 bytes value'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://<your-auth0-domain>.us.auth0.com'
AUTH0_CLIENT_ID='<your-auth0-client-id>'
AUTH0_CLIENT_SECRET='<your-auth0-client-secret>'
AUTH0_ORGANIZATION='<your-auth0-org-id>'
```

**Start command**:
```bash
cd frontend
npm run dev
```

Next.js will start on port 3000 by default.

---

## How to Check Port Usage

### Check What's Using a Port

```bash
# Check specific port
lsof -i :3000
lsof -i :8000

# Check all portal ports
for port in 3000 8000; do
  echo "=== Port $port ==="
  lsof -i :$port || echo "FREE"
done
```

### Kill Process on Port

```bash
lsof -ti:3000 | xargs kill -9
lsof -ti:8000 | xargs kill -9
```

---

## Troubleshooting

### Issue: "Address already in use"

**Cause**: Previous instance still running

**Solution**:
```bash
# Find and kill process
lsof -ti:<port> | xargs kill -9

# Restart the service
```

### Issue: Frontend can't connect to backend

**Symptoms**:
- Network errors in browser console
- "Failed to fetch" errors
- CORS errors

**Solution**:

1. **Verify backend is running on 8000**:
   ```bash
   curl http://localhost:8000/api/health
   ```

2. **Check frontend .env.local**:
   Ensure `NEXT_PUBLIC_API_URL=http://localhost:8000`

3. **Restart frontend** (required after .env.local changes)

4. **Check CORS settings** in backend `main.py`

---

## Port Allocation Strategy

When adding new services, use these port ranges:

| Purpose | Port Range |
|---------|------------|
| Frontend services | 3000-3099 |
| Backend services | 8000-8099 |
| Databases | 5432, 6379 (standard) |

---

**Document Version**: 1.0
