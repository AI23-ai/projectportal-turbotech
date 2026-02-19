# Deployment Runbook

Operational gotchas and troubleshooting notes from production deployments.

## First Deploy Is Two-Pass

On the very first deploy, the frontend App Runner URL doesn't exist yet, so `AUTH0_BASE_URL` is set to `https://PLACEHOLDER`. Phase 6 detects this and automatically re-deploys the frontend stack with the real URL. This is expected and adds ~3 minutes to the first deploy.

## NAT Gateway Cost

The database stack creates a NAT Gateway for the VPC connector (so App Runner backend can reach the internet while also connecting to RDS in private subnets). This costs ~$32/month regardless of traffic. It's required for:
- Auth0 token validation (backend needs to reach Auth0 endpoints)
- Any external API calls from the backend
- ECR image pull for App Runner

There is no way to avoid this cost if you need VPC-egress App Runner with internet access.

## Auth0 Connection Enablement

The `auth0_enable_org_connection` function may fail silently if the Auth0 tenant doesn't have a `Username-Password-Authentication` connection. Check the Auth0 dashboard to verify the connection is enabled on the organization. The script checks for `connection_id` in the response to detect success.

## CORS Format Differences

- **App Runner backend** (pydantic): CORS origins must be a JSON array: `["https://example.com"]`
- **SAM/Lambda backend**: CORS origin is a plain string: `https://example.com`

The deploy script handles this automatically based on `BACKEND_TYPE`, but be aware if manually updating CORS.

## RDS Connection String

The `DATABASE_URL` in `backend-stack.yaml` includes `?ssl=require`. This is mandatory for RDS — without it, connections will be rejected or unencrypted. The format is:

```
postgresql+asyncpg://{username}:{password}@{endpoint}:{port}/{dbname}?ssl=require
```

## VPC-Egress App Runner

App Runner services with `EgressType: VPC` route ALL traffic through the VPC connector. Without a NAT Gateway in the private subnets, the service cannot reach:
- Auth0 for token validation
- ECR for health check (initial startup)
- Any external APIs

Symptom: backend starts but Auth0-protected endpoints return 500 errors. Check that the NAT Gateway exists and the private route table has a `0.0.0.0/0` route to it.

## AI23 Member Sync

The deploy script syncs members from the `ai23-{env}` organization into each client organization. This org must exist in Auth0 before running the deploy. If it doesn't exist, the sync is skipped with a warning — it's non-fatal.

To create it manually:
1. Go to Auth0 Dashboard > Organizations
2. Create org named `ai23-staging` (or `ai23-prod`)
3. Add all AI23 team members
4. Re-run deploy to sync

## CloudFormation Deletion Order

When tearing down a deployment, delete stacks in this order to avoid dependency errors:

1. **Frontend** stack (references backend URL and secrets)
2. **Backend** stack (references database outputs and secrets, has VPC connector)
3. **Database** stack (has RDS with DeletionProtection — disable first)
4. **Secrets** stack (has Retain policy — secrets persist after stack deletion)

For the database stack, you must first disable deletion protection:
```bash
aws rds modify-db-instance \
  --db-instance-identifier {client}-{env}-{project} \
  --no-deletion-protection
```

## Common Issues

### "No changes to deploy" on every run
This is normal when no parameters changed. CloudFormation detects no diff and skips. The script uses `--no-fail-on-empty-changeset` so this doesn't cause errors.

### Auth0 secrets still have placeholders after Auth0 automation
Check that the M2M credentials in `ai23-m2m/auth0-deploy` are valid. The script may silently fall back to manual mode if the management token request fails. Look for "Auth0 M2M credentials not available" in the output.

### Frontend shows "Invalid state" or redirect errors
Usually means `AUTH0_BASE_URL` doesn't match the actual App Runner URL. Check the frontend stack parameters. On first deploy, this resolves after Phase 6 re-deploys.

### Backend health check fails on first deploy
App Runner health checks start immediately. If the backend needs database migrations or Auth0 config, the first few health checks may fail. App Runner retries (UnhealthyThreshold=5) and usually recovers within 60 seconds.

### ECR image push fails with "no basic auth credentials"
The ECR login token expires after 12 hours. If you've been deploying for a while, re-run the deploy and the script will re-authenticate.
