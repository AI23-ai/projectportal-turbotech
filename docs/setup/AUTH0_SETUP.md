# Auth0 Configuration Guide

## Credentials Setup

Your Auth0 credentials should be added to the environment files:
- `.env` (root)
- `backend/.env`
- `frontend/.env.local`

**Domain**: `<your-auth0-domain>.us.auth0.com`
**Client ID**: `<your-auth0-client-id>`
**AUTH0_SECRET**: Generate securely with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

---

## Complete Auth0 Dashboard Configuration

Now you need to configure the callback URLs in your Auth0 application dashboard:

### 1. Go to Auth0 Dashboard

Visit: https://manage.auth0.com/dashboard/us/<your-auth0-domain>/applications/<your-auth0-client-id>/settings

### 2. Configure Application URIs

Scroll to **Application URIs** section and add these URLs:

#### Allowed Callback URLs
```
http://localhost:3000/api/auth/callback, https://<your-production-domain>/api/auth/callback
```

#### Allowed Logout URLs
```
http://localhost:3000, https://<your-production-domain>
```

#### Allowed Web Origins
```
http://localhost:3000, https://<your-production-domain>
```

### 3. Configure Advanced Settings (Optional)

Scroll to **Advanced Settings** > **Grant Types** and ensure these are checked:
- Authorization Code
- Refresh Token
- Implicit (if needed for SPA)

### 4. Save Changes

Click **Save Changes** at the bottom of the page.

---

## Add Users

### For Development/Testing

1. Go to **User Management** > **Users**
2. Click **Create User**
3. Add test users for your teams:

**Admin Team**
```
- admin@example.com (Admin)
- tech-lead@example.com (Admin)
- engineer@example.com (Editor)
```

**Client Team**
```
- client-admin@example.com (Viewer + Approver)
- client-user@example.com (Editor)
```

### Set Temporary Passwords

Auth0 will send password reset emails, or you can set temporary passwords in the dashboard.

---

## Test Authentication

### 1. Start the Development Environment

```bash
# Terminal 1: Start infrastructure
docker compose up -d

# Terminal 2: Start backend
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn main:app --reload

# Terminal 3: Start frontend
cd frontend
npm install
npm run dev
```

### 2. Test Login Flow

1. Visit: http://localhost:3000
2. Click **Sign In**
3. You should be redirected to Auth0 login page
4. Use one of the test users you created
5. After successful login, you should be redirected back to the portal

### 3. Verify Authentication

- Check that you see user info in the UI
- Verify protected routes work (e.g., `/dashboard`)
- Test logout functionality

---

## Troubleshooting

### Callback URL Mismatch Error

**Error**: `Callback URL mismatch`

**Solution**:
- Verify callback URL in Auth0 dashboard exactly matches: `http://localhost:3000/api/auth/callback`
- No trailing slashes
- Check for typos

### Invalid State Error

**Error**: `Invalid state`

**Solution**:
- Clear browser cookies
- Regenerate AUTH0_SECRET: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Update `frontend/.env.local`
- Restart Next.js dev server

### CORS Error

**Error**: CORS policy blocked

**Solution**:
- Add `http://localhost:3000` to **Allowed Web Origins** in Auth0
- Verify backend CORS settings in `backend/main.py`

---

## Quick Reference

**Auth0 Dashboard**: https://manage.auth0.com/

**Application Settings**: Configure in your Auth0 dashboard under Applications

**Users**: Manage under User Management in Auth0 dashboard

---

## Checklist

- [ ] Configured Allowed Callback URLs in Auth0
- [ ] Configured Allowed Logout URLs in Auth0
- [ ] Configured Allowed Web Origins in Auth0
- [ ] Saved changes in Auth0 dashboard
- [ ] Created test users
- [ ] Tested login flow successfully
- [ ] Tested logout flow successfully
- [ ] Verified protected routes work

---

## Next Steps

Once Auth0 is working:

1. **Build Dashboard UI** - Create the main dashboard page
2. **Add Navigation** - Header with user menu and logout
3. **Protect Routes** - Use `@auth0/nextjs-auth0` to protect pages
4. **Display User Info** - Show logged-in user's name and organization

---

**Note**: The same Auth0 application will work for both development (localhost) and production since we added both URLs.
