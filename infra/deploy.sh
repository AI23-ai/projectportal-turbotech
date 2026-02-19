#!/bin/bash
# Unified deployment script for Project Portal
# Deploys: Secrets Manager + Auth0 (automated) + Database (optional) + Backend (SAM or App Runner) + Frontend (App Runner)
#
# Backend detection:
#   - If backend-stack.yaml exists: ECR + App Runner (requires database-stack.yaml, --vpc-id, --subnet-ids)
#   - Otherwise: SAM Lambda + API Gateway (default)
#
# Prerequisites:
#   - AWS CLI configured with the target account credentials
#   - SAM CLI installed (only for SAM backend path)
#   - Docker running (for backend container/image build)
#   - GitHub connection ARN (create at AWS Console > App Runner > GitHub connections)
#
# Usage:
#   SAM backend (default):
#     ./deploy.sh --client=turbotech --project=portal --environment=staging \
#       --github-connection-arn=arn:aws:apprunner:...
#
#   App Runner backend (with database):
#     ./deploy.sh --client=fpls --project=boss --environment=staging \
#       --github-connection-arn=arn:aws:apprunner:... \
#       --vpc-id=vpc-xxx --subnet-ids=subnet-aaa,subnet-bbb --db-password=<password>
#
#   Skip phases:
#     ./deploy.sh --client=fpls --project=boss --environment=staging \
#       --skip-frontend --skip-database --skip-auth0

set -euo pipefail

# ── Configuration ────────────────────────────────────────────────────────────
CLIENT_NAME=""
PROJECT_NAME=""
ENVIRONMENT=""
REGION="us-east-2"
SAM_S3_BUCKET=""
GITHUB_CONNECTION_ARN=""
GITHUB_REPO_URL=""
GITHUB_BRANCH=""
AUTH0_ISSUER_BASE_URL=""
AUTH0_AUDIENCE=""
AUTH0_ORGANIZATION=""
AUTH0_M2M_CLIENT_ID="${AUTH0_M2M_CLIENT_ID:-}"
AUTH0_M2M_CLIENT_SECRET="${AUTH0_M2M_CLIENT_SECRET:-}"
AUTH0_DOMAIN="${AUTH0_DOMAIN:-}"
AUTH0_ORG_NAME="${AUTH0_ORG_NAME:-}"
AUTH0_API_AUDIENCE="${AUTH0_API_AUDIENCE:-}"
AUTH0_AUTOMATED=false
VPC_ID=""
SUBNET_IDS=""
DB_PASSWORD=""
DB_INSTANCE_CLASS="db.t4g.micro"
SKIP_BACKEND=false
SKIP_FRONTEND=false
SKIP_DATABASE=false
SKIP_AUTH0=false

# ── Parse Arguments ──────────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case "$1" in
    --client=*)                   CLIENT_NAME="${1#*=}" ;;
    --project=*)                  PROJECT_NAME="${1#*=}" ;;
    --environment=*)              ENVIRONMENT="${1#*=}" ;;
    --region=*)                   REGION="${1#*=}" ;;
    --github-connection-arn=*)    GITHUB_CONNECTION_ARN="${1#*=}" ;;
    --github-repo-url=*)         GITHUB_REPO_URL="${1#*=}" ;;
    --sam-s3-bucket=*)            SAM_S3_BUCKET="${1#*=}" ;;
    --auth0-issuer=*)             AUTH0_ISSUER_BASE_URL="${1#*=}" ;;
    --auth0-audience=*)           AUTH0_AUDIENCE="${1#*=}" ;;
    --auth0-organization=*)       AUTH0_ORGANIZATION="${1#*=}" ;;
    --auth0-m2m-client-id=*)      AUTH0_M2M_CLIENT_ID="${1#*=}" ;;
    --auth0-m2m-client-secret=*)  AUTH0_M2M_CLIENT_SECRET="${1#*=}" ;;
    --auth0-domain=*)             AUTH0_DOMAIN="${1#*=}" ;;
    --auth0-org-name=*)           AUTH0_ORG_NAME="${1#*=}" ;;
    --auth0-api-audience=*)       AUTH0_API_AUDIENCE="${1#*=}" ;;
    --github-branch=*)            GITHUB_BRANCH="${1#*=}" ;;
    --vpc-id=*)                   VPC_ID="${1#*=}" ;;
    --subnet-ids=*)               SUBNET_IDS="${1#*=}" ;;
    --db-password=*)              DB_PASSWORD="${1#*=}" ;;
    --db-instance-class=*)        DB_INSTANCE_CLASS="${1#*=}" ;;
    --skip-backend)               SKIP_BACKEND=true ;;
    --skip-frontend)              SKIP_FRONTEND=true ;;
    --skip-database)              SKIP_DATABASE=true ;;
    --skip-auth0)                 SKIP_AUTH0=true ;;
    *)
      echo "Unknown option: $1"
      echo ""
      echo "Usage: $0 --client=NAME --project=NAME --environment=<staging|prod> [options]"
      echo ""
      echo "Required:"
      echo "  --client=NAME                Client short name (e.g., turbotech, fpls)"
      echo "  --project=NAME               Project short name (e.g., portal, boss)"
      echo "  --environment=ENV            Deployment environment (staging, prod)"
      echo "  --github-connection-arn=ARN  App Runner GitHub connection ARN"
      echo ""
      echo "Database / App Runner backend (required if database-stack.yaml exists):"
      echo "  --vpc-id=VPC_ID              VPC ID for RDS and App Runner VPC connector"
      echo "  --subnet-ids=IDS             Comma-separated subnet IDs (at least 2 AZs)"
      echo "  --db-password=PASSWORD       RDS master password (first deploy only)"
      echo ""
      echo "Auth0 automation (optional — reads from Secrets Manager if omitted):"
      echo "  --auth0-m2m-client-id=ID     Auth0 M2M client ID"
      echo "  --auth0-m2m-client-secret=S  Auth0 M2M client secret"
      echo "  --auth0-domain=DOMAIN        Auth0 tenant domain"
      echo "  --auth0-org-name=NAME        Auth0 org name (default: {client}-{env})"
      echo "  --auth0-api-audience=URL     Auth0 API audience identifier"
      echo "  --skip-auth0                 Skip Auth0 automation (use manual setup)"
      echo ""
      echo "Optional:"
      echo "  --region=REGION              AWS region (default: us-east-2)"
      echo "  --github-repo-url=URL        GitHub repo URL (auto-derived from git remote)"
      echo "  --github-branch=BRANCH       Branch to deploy (default: staging for staging, main for prod)"
      echo "  --sam-s3-bucket=BUCKET       S3 bucket for SAM artifacts (SAM backend only)"
      echo "  --auth0-issuer=URL           Auth0 issuer URL (auto-configured if M2M creds available)"
      echo "  --auth0-audience=URL         Auth0 API audience (auto-configured if M2M creds available)"
      echo "  --auth0-organization=ID      Auth0 organization ID (override auto-derived org)"
      echo "  --db-instance-class=CLASS    RDS instance class (default: db.t4g.micro)"
      echo "  --skip-backend               Skip backend deployment"
      echo "  --skip-frontend              Skip frontend deployment"
      echo "  --skip-database              Skip database/storage deployment"
      exit 1
      ;;
  esac
  shift
done

# ── Validate ─────────────────────────────────────────────────────────────────
if [[ -z "$CLIENT_NAME" ]]; then
  echo "ERROR: --client is required (e.g. --client=turbotech)"
  exit 1
fi
if ! [[ "$CLIENT_NAME" =~ ^[a-z0-9-]+$ ]]; then
  echo "ERROR: --client must be lowercase alphanumeric with hyphens only (got '${CLIENT_NAME}')"
  exit 1
fi

if [[ -z "$PROJECT_NAME" ]]; then
  echo "ERROR: --project is required (e.g. --project=portal)"
  exit 1
fi
if ! [[ "$PROJECT_NAME" =~ ^[a-z0-9-]+$ ]]; then
  echo "ERROR: --project must be lowercase alphanumeric with hyphens only (got '${PROJECT_NAME}')"
  exit 1
fi

if [[ -z "$ENVIRONMENT" ]]; then
  echo "ERROR: --environment is required."
  exit 1
fi
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "prod" ]]; then
  echo "ERROR: --environment must be 'staging' or 'prod' (got '${ENVIRONMENT}')"
  exit 1
fi

# Default GitHub branch based on environment
if [[ -z "$GITHUB_BRANCH" ]]; then
  if [[ "$ENVIRONMENT" == "prod" ]]; then
    GITHUB_BRANCH="main"
  else
    GITHUB_BRANCH="staging"
  fi
fi

# Derive GITHUB_REPO_URL from git remote if not provided
if [[ -z "$GITHUB_REPO_URL" ]]; then
  GITHUB_REPO_URL=$(git -C "$(dirname "$0")/.." remote get-url origin 2>/dev/null || echo "")
  if [[ -z "$GITHUB_REPO_URL" ]]; then
    echo "WARNING: Could not derive GitHub repo URL from git remote."
  else
    echo "Derived GitHub repo URL from git remote: ${GITHUB_REPO_URL}"
  fi
fi

# ── Derive Resource Names ───────────────────────────────────────────────────
SECRET_PREFIX="${CLIENT_NAME}-${ENVIRONMENT}-${PROJECT_NAME}"
SECRETS_STACK_NAME="${CLIENT_NAME}-${ENVIRONMENT}-${PROJECT_NAME}-secrets"
DATABASE_STACK_NAME="${CLIENT_NAME}-${ENVIRONMENT}-database"
BACKEND_STACK_NAME="${CLIENT_NAME}-${ENVIRONMENT}-${PROJECT_NAME}-backend"
FRONTEND_STACK_NAME="${CLIENT_NAME}-${ENVIRONMENT}-${PROJECT_NAME}-frontend"
ECR_REPO_NAME="${CLIENT_NAME}-${ENVIRONMENT}-backend"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Detect backend type by file existence
BACKEND_TYPE="sam"
if [[ -f "${SCRIPT_DIR}/backend-stack.yaml" ]]; then
  BACKEND_TYPE="apprunner"
fi

echo ""
echo "========================================"
echo "  Project Portal - Deploying: ${ENVIRONMENT}"
echo "========================================"
echo ""
echo "  Client:          ${CLIENT_NAME}"
echo "  Project:         ${PROJECT_NAME}"
echo "  Backend type:    ${BACKEND_TYPE}"
echo "  Branch:          ${GITHUB_BRANCH}"
echo "  Region:          ${REGION}"
echo "  Secrets stack:   ${SECRETS_STACK_NAME}"
if [[ "$BACKEND_TYPE" == "apprunner" ]]; then
  echo "  Database stack:  ${DATABASE_STACK_NAME}"
fi
echo "  Backend stack:   ${BACKEND_STACK_NAME}"
echo "  Frontend stack:  ${FRONTEND_STACK_NAME}"
echo ""

# ── Auth0 Automation Helpers ──────────────────────────────────────────────────

auth0_api() {
  local method="$1" endpoint="$2"
  shift 2
  curl -s -X "$method" \
    "https://${AUTH0_DOMAIN}/api/v2${endpoint}" \
    -H "Authorization: Bearer ${AUTH0_MGMT_TOKEN}" \
    -H "Content-Type: application/json" \
    "$@"
}

auth0_resolve_m2m_credentials() {
  if [[ -n "$AUTH0_M2M_CLIENT_ID" ]] && [[ -n "$AUTH0_M2M_CLIENT_SECRET" ]] && [[ -n "$AUTH0_DOMAIN" ]]; then
    echo "Using Auth0 M2M credentials from CLI/environment"
    return 0
  fi

  echo "Fetching Auth0 M2M credentials from Secrets Manager..."
  local m2m_secret
  m2m_secret=$(aws secretsmanager get-secret-value \
    --secret-id "ai23-m2m/auth0-deploy" \
    --region "${REGION}" \
    --query SecretString --output text 2>/dev/null || echo "")

  if [[ -z "$m2m_secret" ]]; then
    echo "Auth0 M2M credentials not found in CLI args, environment, or Secrets Manager."
    return 1
  fi

  AUTH0_M2M_CLIENT_ID="${AUTH0_M2M_CLIENT_ID:-$(echo "$m2m_secret" | python3 -c "import sys,json; print(json.load(sys.stdin)['AUTH0_M2M_CLIENT_ID'])")}"
  AUTH0_M2M_CLIENT_SECRET="${AUTH0_M2M_CLIENT_SECRET:-$(echo "$m2m_secret" | python3 -c "import sys,json; print(json.load(sys.stdin)['AUTH0_M2M_CLIENT_SECRET'])")}"
  AUTH0_DOMAIN="${AUTH0_DOMAIN:-$(echo "$m2m_secret" | python3 -c "import sys,json; print(json.load(sys.stdin)['AUTH0_DOMAIN'])")}"

  if [[ -z "$AUTH0_M2M_CLIENT_ID" ]] || [[ -z "$AUTH0_M2M_CLIENT_SECRET" ]] || [[ -z "$AUTH0_DOMAIN" ]]; then
    echo "Failed to resolve all Auth0 M2M credentials from Secrets Manager."
    return 1
  fi

  echo "Resolved Auth0 M2M credentials (client: ${AUTH0_M2M_CLIENT_ID:0:8}...)"
}

auth0_get_mgmt_token() {
  echo "Obtaining Auth0 Management API token..."
  local payload
  payload=$(python3 -c "
import json, sys
print(json.dumps({
    'client_id': sys.argv[1],
    'client_secret': sys.argv[2],
    'audience': 'https://' + sys.argv[3] + '/api/v2/',
    'grant_type': 'client_credentials'
}))" "$AUTH0_M2M_CLIENT_ID" "$AUTH0_M2M_CLIENT_SECRET" "$AUTH0_DOMAIN")

  local response
  response=$(curl -s -X POST "https://${AUTH0_DOMAIN}/oauth/token" \
    -H "Content-Type: application/json" \
    -d "$payload")

  AUTH0_MGMT_TOKEN=$(echo "$response" | python3 -c "
import sys, json
d = json.load(sys.stdin)
if 'access_token' not in d:
    print('ERROR: ' + d.get('error_description', d.get('error', 'unknown')), file=sys.stderr)
    sys.exit(1)
print(d['access_token'])")

  echo "Auth0 Management API token obtained"
}

auth0_find_or_create_app() {
  local app_name="${SECRET_PREFIX}"

  # Fast path: check if we already have a client ID from a previous deploy
  local existing_frontend
  existing_frontend=$(aws secretsmanager get-secret-value \
    --secret-id "${SECRET_PREFIX}/auth0-frontend" \
    --region "${REGION}" \
    --query SecretString --output text 2>/dev/null || echo "")

  if [[ -n "$existing_frontend" ]] && ! echo "$existing_frontend" | grep -q "PLACEHOLDER_REPLACE_ME"; then
    local existing_id
    existing_id=$(echo "$existing_frontend" | python3 -c "import sys,json; print(json.load(sys.stdin).get('AUTH0_CLIENT_ID',''))" 2>/dev/null || echo "")

    if [[ -n "$existing_id" ]]; then
      local verify
      verify=$(auth0_api GET "/clients/${existing_id}?fields=client_id,name&include_fields=true" 2>/dev/null || echo "")

      if echo "$verify" | python3 -c "import sys,json; d=json.load(sys.stdin); assert 'client_id' in d" 2>/dev/null; then
        AUTH0_CLIENT_ID="$existing_id"
        AUTH0_CLIENT_SECRET=$(echo "$existing_frontend" | python3 -c "import sys,json; print(json.load(sys.stdin).get('AUTH0_CLIENT_SECRET',''))")
        echo "Found existing Auth0 application from secrets: ${AUTH0_CLIENT_ID:0:8}..."
        return 0
      fi
    fi
  fi

  # Search by name
  echo "Looking for Auth0 application '${app_name}'..."
  local clients
  clients=$(auth0_api GET "/clients?fields=client_id,name&include_fields=true&per_page=100")

  local found_id
  found_id=$(echo "$clients" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if isinstance(data, dict) and 'error' in data:
    print('Auth0 error: ' + data.get('message', data['error']), file=sys.stderr)
    sys.exit(1)
for c in data:
    if c.get('name') == sys.argv[1]:
        print(c['client_id'])
        break
" "$app_name" 2>/dev/null || echo "")

  if [[ -n "$found_id" ]]; then
    AUTH0_CLIENT_ID="$found_id"
    AUTH0_CLIENT_SECRET=$(echo "$existing_frontend" | python3 -c "import sys,json; print(json.load(sys.stdin).get('AUTH0_CLIENT_SECRET',''))" 2>/dev/null || echo "")
    echo "Found existing Auth0 application: ${AUTH0_CLIENT_ID:0:8}..."
    return 0
  fi

  echo "Creating Auth0 application '${app_name}'..."
  local result
  result=$(auth0_api POST "/clients" \
    -d "{\"name\":\"${app_name}\",\"app_type\":\"regular_web\",\"token_endpoint_auth_method\":\"client_secret_post\",\"oidc_conformant\":true,\"jwt_configuration\":{\"alg\":\"RS256\"},\"grant_types\":[\"authorization_code\",\"refresh_token\"],\"organization_usage\":\"require\",\"organization_require_behavior\":\"no_prompt\"}")

  AUTH0_CLIENT_ID=$(echo "$result" | python3 -c "
import sys, json
d = json.load(sys.stdin)
if 'error' in d:
    print('Auth0 error: ' + d.get('message', d['error']), file=sys.stderr)
    sys.exit(1)
print(d['client_id'])")
  AUTH0_CLIENT_SECRET=$(echo "$result" | python3 -c "import sys,json; print(json.load(sys.stdin)['client_secret'])")
  echo "Created Auth0 application: ${AUTH0_CLIENT_ID:0:8}..."
}

auth0_enable_org_on_app() {
  echo "Ensuring Auth0 Organizations are enabled on application..."
  auth0_api PATCH "/clients/${AUTH0_CLIENT_ID}" \
    -d "{\"organization_usage\":\"require\",\"organization_require_behavior\":\"no_prompt\",\"grant_types\":[\"authorization_code\",\"refresh_token\"]}" > /dev/null
  echo "Organizations enabled on application (usage=require)"
}

auth0_find_or_create_api() {
  local audience="${AUTH0_API_AUDIENCE}"
  local api_name="ai23-${ENVIRONMENT}-api"
  echo "Looking for Auth0 API with audience '${audience}'..."

  local encoded_audience
  encoded_audience=$(python3 -c "import urllib.parse; print(urllib.parse.quote(input(), safe=''))" <<< "$audience")

  local existing
  existing=$(auth0_api GET "/resource-servers/${encoded_audience}" 2>/dev/null || echo "")

  if echo "$existing" | python3 -c "import sys,json; d=json.load(sys.stdin); assert 'identifier' in d" 2>/dev/null; then
    echo "Found existing Auth0 API: ${audience}"
    auth0_api PATCH "/resource-servers/${encoded_audience}" \
      -d "{\"skip_consent_for_verifiable_first_party_clients\":true,\"allow_offline_access\":true}" > /dev/null 2>/dev/null \
      && echo "Verified API settings" \
      || echo "Warning: could not update API settings"
    return 0
  fi

  echo "Creating Auth0 API '${api_name}' with audience '${audience}'..."
  auth0_api POST "/resource-servers" \
    -d "{\"name\":\"${api_name}\",\"identifier\":\"${audience}\",\"signing_alg\":\"RS256\",\"token_lifetime\":86400,\"skip_consent_for_verifiable_first_party_clients\":true,\"allow_offline_access\":true}" > /dev/null

  echo "Created Auth0 API: ${audience}"
}

auth0_find_or_create_org() {
  local org_name="${AUTH0_ORG_NAME}"
  echo "Looking for Auth0 organization '${org_name}'..."

  local existing
  existing=$(auth0_api GET "/organizations/name/${org_name}" 2>/dev/null || echo "")

  AUTH0_ORG_ID=$(echo "$existing" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print(d.get('id', ''))" 2>/dev/null || echo "")

  if [[ -n "$AUTH0_ORG_ID" ]]; then
    echo "Found existing Auth0 organization: ${AUTH0_ORG_ID}"
    return 0
  fi

  echo "Creating Auth0 organization '${org_name}'..."
  local result
  result=$(auth0_api POST "/organizations" \
    -d "{\"name\":\"${org_name}\",\"display_name\":\"${CLIENT_NAME} (${ENVIRONMENT})\"}")

  AUTH0_ORG_ID=$(echo "$result" | python3 -c "
import sys, json
d = json.load(sys.stdin)
if 'error' in d:
    print('Auth0 error: ' + d.get('message', d['error']), file=sys.stderr)
    sys.exit(1)
print(d['id'])")
  echo "Created Auth0 organization: ${AUTH0_ORG_ID}"
}

auth0_enable_org_connection() {
  echo "Enabling database connection for organization..."

  local connections
  connections=$(auth0_api GET "/connections?strategy=auth0&fields=id,name&include_fields=true")

  local connection_id
  connection_id=$(echo "$connections" | python3 -c "
import sys, json
conns = json.load(sys.stdin)
if isinstance(conns, dict) and 'error' in conns: conns = []
for c in conns:
    if c['name'] == 'Username-Password-Authentication':
        print(c['id']); sys.exit(0)
if conns: print(conns[0]['id'])
" 2>/dev/null || echo "")

  if [[ -z "$connection_id" ]]; then
    echo "WARNING: No database connection found — skipping"
    return 0
  fi

  local enabled
  enabled=$(auth0_api GET "/organizations/${AUTH0_ORG_ID}/enabled_connections" 2>/dev/null || echo "[]")

  local already_enabled
  already_enabled=$(echo "$enabled" | python3 -c "
import sys, json
conns = json.load(sys.stdin)
if isinstance(conns, list):
    for c in conns:
        if c.get('connection_id') == sys.argv[1]: print('yes'); break
" "$connection_id" 2>/dev/null || echo "")

  if [[ "$already_enabled" == "yes" ]]; then
    auth0_api PATCH "/organizations/${AUTH0_ORG_ID}/enabled_connections/${connection_id}" \
      -d "{\"assign_membership_on_login\":false,\"is_signup_enabled\":false}" > /dev/null 2>/dev/null \
      && echo "Database connection updated for organization" \
      || echo "Database connection already enabled"
    return 0
  fi

  local result
  result=$(auth0_api POST "/organizations/${AUTH0_ORG_ID}/enabled_connections" \
    -d "{\"connection_id\":\"${connection_id}\",\"assign_membership_on_login\":false,\"is_signup_enabled\":false}")

  if echo "$result" | python3 -c "import sys,json; d=json.load(sys.stdin); assert 'connection_id' in d" 2>/dev/null; then
    echo "Enabled database connection for organization"
  else
    echo "WARNING: Failed to enable connection — $(echo "$result" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('message', d.get('error', 'unknown')))" 2>/dev/null || echo "unknown error")"
    echo "You may need to enable the connection manually in the Auth0 dashboard."
  fi
}

auth0_enable_client_grant() {
  local audience="${AUTH0_API_AUDIENCE}"
  echo "Checking client grant for app to API..."

  local existing
  existing=$(auth0_api GET "/client-grants?client_id=${AUTH0_CLIENT_ID}&audience=$(python3 -c "import urllib.parse; print(urllib.parse.quote(input(), safe=''))" <<< "$audience")")

  local grant_exists
  grant_exists=$(echo "$existing" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if isinstance(data, list) and len(data) > 0: print('yes')
" 2>/dev/null || echo "")

  if [[ "$grant_exists" == "yes" ]]; then
    echo "Client grant already exists"
    return 0
  fi

  auth0_api POST "/client-grants" \
    -d "{\"client_id\":\"${AUTH0_CLIENT_ID}\",\"audience\":\"${audience}\",\"scope\":[]}" > /dev/null

  echo "Created client grant"
}

auth0_sync_ai23_members() {
  local ai23_org_name="ai23-${ENVIRONMENT}"
  echo "Syncing AI23 members from '${ai23_org_name}' into '${AUTH0_ORG_NAME}'..."

  local ai23_org
  ai23_org=$(auth0_api GET "/organizations/name/${ai23_org_name}" 2>/dev/null || echo "")
  local ai23_org_id
  ai23_org_id=$(echo "$ai23_org" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null || echo "")

  if [[ -z "$ai23_org_id" ]]; then
    echo "WARNING: AI23 org '${ai23_org_name}' not found — skipping member sync"
    return 0
  fi

  local ai23_members
  ai23_members=$(auth0_api GET "/organizations/${ai23_org_id}/members?per_page=100" 2>/dev/null || echo "[]")

  local client_members
  client_members=$(auth0_api GET "/organizations/${AUTH0_ORG_ID}/members?per_page=100" 2>/dev/null || echo "[]")

  local members_to_add
  members_to_add=$(python3 -c "
import sys, json
ai23 = json.loads(sys.argv[1])
client = json.loads(sys.argv[2])
if not isinstance(ai23, list): ai23 = []
if not isinstance(client, list): client = []
client_ids = {m['user_id'] for m in client}
to_add = [m['user_id'] for m in ai23 if m['user_id'] not in client_ids]
if to_add: print(json.dumps({'members': to_add}))
else: print('')
" "$ai23_members" "$client_members" 2>/dev/null || echo "")

  if [[ -z "$members_to_add" ]]; then
    echo "All AI23 members already in '${AUTH0_ORG_NAME}'"
    return 0
  fi

  local count
  count=$(echo "$members_to_add" | python3 -c "import sys,json; print(len(json.load(sys.stdin)['members']))")

  auth0_api POST "/organizations/${AUTH0_ORG_ID}/members" \
    -d "$members_to_add" > /dev/null

  echo "Synced ${count} AI23 member(s) into '${AUTH0_ORG_NAME}'"
}

auth0_populate_secrets() {
  echo "Populating Auth0 secrets in AWS Secrets Manager..."

  # Check existing frontend secret for real AUTH0_SECRET
  local existing_frontend
  existing_frontend=$(aws secretsmanager get-secret-value \
    --secret-id "${SECRET_PREFIX}/auth0-frontend" \
    --region "${REGION}" \
    --query SecretString --output text 2>/dev/null || echo "")

  local auth0_secret=""
  if [[ -n "$existing_frontend" ]] && ! echo "$existing_frontend" | grep -q "PLACEHOLDER_REPLACE_ME"; then
    auth0_secret=$(echo "$existing_frontend" | python3 -c "import sys,json; print(json.load(sys.stdin).get('AUTH0_SECRET',''))" 2>/dev/null || echo "")
  fi

  if [[ -z "$auth0_secret" ]] || echo "$auth0_secret" | grep -q "PLACEHOLDER"; then
    auth0_secret=$(python3 -c "import secrets; print(secrets.token_hex(32))")
    echo "Generated new AUTH0_SECRET"
  else
    echo "Preserving existing AUTH0_SECRET"
  fi

  local frontend_json
  frontend_json=$(python3 -c "
import json, sys
print(json.dumps({
    'AUTH0_SECRET': sys.argv[1],
    'AUTH0_CLIENT_ID': sys.argv[2],
    'AUTH0_CLIENT_SECRET': sys.argv[3]
}))" "$auth0_secret" "$AUTH0_CLIENT_ID" "$AUTH0_CLIENT_SECRET")

  aws secretsmanager put-secret-value \
    --secret-id "${SECRET_PREFIX}/auth0-frontend" \
    --region "${REGION}" \
    --secret-string "$frontend_json" > /dev/null

  echo "Updated ${SECRET_PREFIX}/auth0-frontend"

  local backend_json
  backend_json=$(python3 -c "
import json, sys
print(json.dumps({
    'AUTH0_DOMAIN': sys.argv[1],
    'AUTH0_AUDIENCE': sys.argv[2],
    'AUTH0_ORGANIZATION': sys.argv[3]
}))" "$AUTH0_DOMAIN" "$AUTH0_API_AUDIENCE" "$AUTH0_ORG_ID")

  aws secretsmanager put-secret-value \
    --secret-id "${SECRET_PREFIX}/auth0-backend" \
    --region "${REGION}" \
    --secret-string "$backend_json" > /dev/null

  echo "Updated ${SECRET_PREFIX}/auth0-backend"
}

auth0_update_callback_urls() {
  local frontend_url="$1"
  echo "Updating Auth0 callback URLs for ${frontend_url}..."

  local payload
  payload=$(python3 -c "
import json, sys
url = sys.argv[1]
print(json.dumps({
    'callbacks': ['http://localhost:3000/auth/callback', url + '/auth/callback'],
    'allowed_logout_urls': ['http://localhost:3000', url],
    'web_origins': ['http://localhost:3000', url],
    'initiate_login_uri': url + '/auth/login'
}))" "$frontend_url")

  auth0_api PATCH "/clients/${AUTH0_CLIENT_ID}" -d "$payload" > /dev/null

  echo "Updated Auth0 callback/logout/origin URLs"
}

# ── Phase 0: Validate Prerequisites ─────────────────────────────────────────
echo "=== Phase 0: Validating prerequisites ==="

if ! command -v aws &> /dev/null; then
  echo "ERROR: AWS CLI not found. Install with: brew install awscli"
  exit 1
fi

if [[ "$SKIP_BACKEND" == false ]]; then
  if [[ "$BACKEND_TYPE" == "sam" ]] && ! command -v sam &> /dev/null; then
    echo "ERROR: SAM CLI not found. Install with: brew install aws-sam-cli"
    exit 1
  fi

  if ! docker info &> /dev/null 2>&1; then
    echo "ERROR: Docker is not running. Start Docker Desktop."
    exit 1
  fi
fi

if [[ "$SKIP_FRONTEND" == false ]] && [[ -z "$GITHUB_CONNECTION_ARN" ]]; then
  echo "ERROR: --github-connection-arn is required for frontend deployment."
  echo "Create one at: https://${REGION}.console.aws.amazon.com/apprunner/home?region=${REGION}#/github-connections"
  exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "Deploying to account: ${ACCOUNT_ID} in ${REGION}"

# ── Phase 1: Deploy Secrets Stack ────────────────────────────────────────────
echo ""
echo "=== Phase 1: Deploying secrets stack ==="

aws cloudformation deploy \
  --template-file "${SCRIPT_DIR}/secrets-stack.yaml" \
  --stack-name "${SECRETS_STACK_NAME}" \
  --region "${REGION}" \
  --parameter-overrides \
    "Environment=${ENVIRONMENT}" \
    "ClientName=${CLIENT_NAME}" \
    "ProjectName=${PROJECT_NAME}" \
  --tags project="${PROJECT_NAME}" client="${CLIENT_NAME}" \
  --no-fail-on-empty-changeset

# Check if secrets still have placeholder values
FRONTEND_SECRET=$(aws secretsmanager get-secret-value \
  --secret-id "${SECRET_PREFIX}/auth0-frontend" \
  --region "${REGION}" \
  --query SecretString --output text 2>/dev/null || echo "")

if echo "$FRONTEND_SECRET" | grep -q "PLACEHOLDER_REPLACE_ME"; then
  echo ""
  echo "Auth0 secrets have placeholder values — will attempt automated setup..."
fi

# ── Phase 1.5a: Auth0 Configuration ─────────────────────────────────────────
if [[ "$SKIP_AUTH0" == false ]]; then
  echo ""
  echo "=== Phase 1.5a: Auth0 Configuration (automated) ==="

  AUTH0_ORG_NAME="${AUTH0_ORG_NAME:-${CLIENT_NAME}-${ENVIRONMENT}}"
  AUTH0_API_AUDIENCE="${AUTH0_API_AUDIENCE:-${AUTH0_AUDIENCE:-https://api.ai23-${ENVIRONMENT}}}"

  if auth0_resolve_m2m_credentials; then
    auth0_get_mgmt_token
    auth0_find_or_create_app
    auth0_enable_org_on_app
    auth0_find_or_create_api
    auth0_find_or_create_org
    auth0_enable_org_connection
    auth0_sync_ai23_members
    auth0_enable_client_grant
    auth0_populate_secrets

    # Re-read frontend secret so downstream checks see updated values
    FRONTEND_SECRET=$(aws secretsmanager get-secret-value \
      --secret-id "${SECRET_PREFIX}/auth0-frontend" \
      --region "${REGION}" \
      --query SecretString --output text 2>/dev/null || echo "")

    # Set downstream variables for subsequent phases
    AUTH0_ISSUER_BASE_URL="https://${AUTH0_DOMAIN}"
    AUTH0_AUDIENCE="${AUTH0_API_AUDIENCE}"
    AUTH0_ORGANIZATION="${AUTH0_ORG_ID}"
    AUTH0_AUTOMATED=true

    echo ""
    echo "Auth0 configuration complete"
  else
    echo ""
    echo "WARNING: Auth0 M2M credentials not available — skipping Auth0 automation."
    echo "Use --skip-auth0 to suppress this warning, or populate ai23-m2m/auth0-deploy in Secrets Manager."
  fi
else
  echo ""
  echo "=== Phase 1.5a: Skipping Auth0 (--skip-auth0) ==="
fi

# ── Phase 2: Deploy Database Stack (optional) ────────────────────────────────
if [[ -f "${SCRIPT_DIR}/database-stack.yaml" ]] && [[ "$SKIP_DATABASE" == false ]]; then
  echo ""
  echo "=== Phase 2: Deploying database stack (RDS + S3) ==="

  if [[ -z "$VPC_ID" ]] || [[ -z "$SUBNET_IDS" ]]; then
    echo "ERROR: --vpc-id and --subnet-ids are required for database deployment."
    echo "Use default VPC: aws ec2 describe-vpcs --filters Name=isDefault,Values=true --query 'Vpcs[0].VpcId' --output text"
    exit 1
  fi

  # Get DB password from Secrets Manager if not provided
  if [[ -z "$DB_PASSWORD" ]]; then
    DB_SECRET=$(aws secretsmanager get-secret-value \
      --secret-id "${SECRET_PREFIX}/database" \
      --region "${REGION}" \
      --query SecretString --output text 2>/dev/null || echo "")

    if [[ -n "$DB_SECRET" ]] && ! echo "$DB_SECRET" | grep -q "PLACEHOLDER_REPLACE_ME"; then
      DB_PASSWORD=$(echo "$DB_SECRET" | python3 -c "import sys,json; print(json.load(sys.stdin)['DB_PASSWORD'])")
    else
      echo "ERROR: Database password not set. Either pass --db-password or populate the secret:"
      echo "  aws secretsmanager put-secret-value --secret-id ${SECRET_PREFIX}/database --secret-string '{\"DB_PASSWORD\":\"...\"}'"
      exit 1
    fi
  fi

  # Use first public subnet for NAT Gateway placement
  PUBLIC_SUBNET_FOR_NAT=$(echo "${SUBNET_IDS}" | cut -d',' -f1)

  aws cloudformation deploy \
    --template-file "${SCRIPT_DIR}/database-stack.yaml" \
    --stack-name "${DATABASE_STACK_NAME}" \
    --region "${REGION}" \
    --parameter-overrides \
      "Environment=${ENVIRONMENT}" \
      "ClientName=${CLIENT_NAME}" \
      "ProjectName=${PROJECT_NAME}" \
      "VpcId=${VPC_ID}" \
      "PublicSubnetId=${PUBLIC_SUBNET_FOR_NAT}" \
      "DBSubnetIds=${SUBNET_IDS}" \
      "DBInstanceClass=${DB_INSTANCE_CLASS}" \
      "DBPassword=${DB_PASSWORD}" \
    --tags project="${PROJECT_NAME}" client="${CLIENT_NAME}" \
    --no-fail-on-empty-changeset

  # Persist DB password to Secrets Manager so backend can read it at runtime
  CURRENT_DB_SECRET=$(aws secretsmanager get-secret-value \
    --secret-id "${SECRET_PREFIX}/database" \
    --region "${REGION}" \
    --query SecretString --output text 2>/dev/null || echo "")

  if echo "$CURRENT_DB_SECRET" | grep -q "PLACEHOLDER_REPLACE_ME"; then
    echo "Populating database secret in Secrets Manager..."
    aws secretsmanager put-secret-value \
      --secret-id "${SECRET_PREFIX}/database" \
      --secret-string "{\"DB_PASSWORD\":\"${DB_PASSWORD}\"}" \
      --region "${REGION}"
  fi

  echo "Database stack deployed."
elif [[ -f "${SCRIPT_DIR}/database-stack.yaml" ]]; then
  echo ""
  echo "=== Phase 2: Skipping database (--skip-database) ==="
else
  echo ""
  echo "=== Phase 2: No database-stack.yaml — skipping database ==="
fi

# ── Phase 3: Deploy Backend ──────────────────────────────────────────────────
if [[ "$SKIP_BACKEND" == false ]]; then
  if [[ "$BACKEND_TYPE" == "apprunner" ]]; then
    # ── App Runner Backend Path ──────────────────────────────────────────
    echo ""
    echo "=== Phase 3: Building and pushing backend Docker image ==="

    # Create ECR repo if it doesn't exist
    aws ecr describe-repositories --repository-names "${ECR_REPO_NAME}" --region "${REGION}" &>/dev/null || \
      aws ecr create-repository --repository-name "${ECR_REPO_NAME}" --region "${REGION}" --image-scanning-configuration scanOnPush=true

    # Login to ECR
    aws ecr get-login-password --region "${REGION}" | \
      docker login --username AWS --password-stdin "${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"

    IMAGE_TAG="$(date +%Y%m%d-%H%M%S)-$(git -C "${REPO_DIR}" rev-parse --short HEAD 2>/dev/null || echo 'latest')"
    IMAGE_URI="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${ECR_REPO_NAME}:${IMAGE_TAG}"

    echo "Building image: ${IMAGE_URI}"
    docker build -t "${IMAGE_URI}" "${REPO_DIR}/backend"

    echo "Pushing image to ECR..."
    docker push "${IMAGE_URI}"
    echo "Image pushed: ${IMAGE_URI}"

    echo ""
    echo "=== Phase 3b: Deploying backend App Runner stack ==="

    # Get database stack outputs
    DB_ENDPOINT=$(aws cloudformation describe-stacks \
      --stack-name "${DATABASE_STACK_NAME}" \
      --region "${REGION}" \
      --query "Stacks[0].Outputs[?OutputKey=='DBEndpoint'].OutputValue" \
      --output text)

    DB_PORT=$(aws cloudformation describe-stacks \
      --stack-name "${DATABASE_STACK_NAME}" \
      --region "${REGION}" \
      --query "Stacks[0].Outputs[?OutputKey=='DBPort'].OutputValue" \
      --output text)

    S3_BUCKET=$(aws cloudformation describe-stacks \
      --stack-name "${DATABASE_STACK_NAME}" \
      --region "${REGION}" \
      --query "Stacks[0].Outputs[?OutputKey=='UploadsBucketName'].OutputValue" \
      --output text)

    VPC_CONNECTOR_SG=$(aws cloudformation describe-stacks \
      --stack-name "${DATABASE_STACK_NAME}" \
      --region "${REGION}" \
      --query "Stacks[0].Outputs[?OutputKey=='VpcConnectorSecurityGroupId'].OutputValue" \
      --output text)

    PRIVATE_SUBNET_IDS=$(aws cloudformation describe-stacks \
      --stack-name "${DATABASE_STACK_NAME}" \
      --region "${REGION}" \
      --query "Stacks[0].Outputs[?OutputKey=='PrivateSubnetIds'].OutputValue" \
      --output text)

    # Read Auth0 backend config from Secrets Manager if not set by automation
    if [[ -z "$AUTH0_ISSUER_BASE_URL" ]]; then
      BACKEND_SECRET=$(aws secretsmanager get-secret-value \
        --secret-id "${SECRET_PREFIX}/auth0-backend" \
        --region "${REGION}" \
        --query SecretString --output text 2>/dev/null || echo "")

      if [[ -n "$BACKEND_SECRET" ]] && ! echo "$BACKEND_SECRET" | grep -q "PLACEHOLDER_REPLACE_ME"; then
        AUTH0_ISSUER_BASE_URL="https://$(echo "$BACKEND_SECRET" | python3 -c "import sys,json; print(json.load(sys.stdin)['AUTH0_DOMAIN'])")"
        AUTH0_AUDIENCE=$(echo "$BACKEND_SECRET" | python3 -c "import sys,json; print(json.load(sys.stdin)['AUTH0_AUDIENCE'])")
        AUTH0_ORGANIZATION=$(echo "$BACKEND_SECRET" | python3 -c "import sys,json; print(json.load(sys.stdin).get('AUTH0_ORGANIZATION',''))")
      fi
    fi

    # Check for existing frontend URL for CORS (must be JSON array for pydantic)
    CORS_ORIGIN='["*"]'
    EXISTING_FRONTEND_URL=$(aws cloudformation describe-stacks \
      --stack-name "${FRONTEND_STACK_NAME}" \
      --region "${REGION}" \
      --query "Stacks[0].Outputs[?OutputKey=='ServiceUrl'].OutputValue" \
      --output text 2>/dev/null || echo "")

    if [[ -n "$EXISTING_FRONTEND_URL" ]] && [[ "$EXISTING_FRONTEND_URL" != "None" ]]; then
      CORS_ORIGIN="[\"${EXISTING_FRONTEND_URL}\"]"
      echo "Using existing frontend URL for CORS: ${CORS_ORIGIN}"
    else
      echo "No existing frontend — using permissive CORS for initial deploy"
    fi

    aws cloudformation deploy \
      --template-file "${SCRIPT_DIR}/backend-stack.yaml" \
      --stack-name "${BACKEND_STACK_NAME}" \
      --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
      --region "${REGION}" \
      --parameter-overrides \
        "Environment=${ENVIRONMENT}" \
        "ClientName=${CLIENT_NAME}" \
        "ProjectName=${PROJECT_NAME}" \
        "ImageUri=${IMAGE_URI}" \
        "DBEndpoint=${DB_ENDPOINT}" \
        "DBPort=${DB_PORT}" \
        "S3BucketName=${S3_BUCKET}" \
        "VpcConnectorSecurityGroupId=${VPC_CONNECTOR_SG}" \
        "SubnetIds=${PRIVATE_SUBNET_IDS}" \
        "Auth0IssuerBaseUrl=${AUTH0_ISSUER_BASE_URL:-https://PLACEHOLDER}" \
        "CorsOrigins=${CORS_ORIGIN}" \
      --tags project="${PROJECT_NAME}" client="${CLIENT_NAME}" \
      --no-fail-on-empty-changeset

  else
    # ── SAM Backend Path ─────────────────────────────────────────────────
    echo ""
    echo "=== Phase 3: Building and deploying backend (SAM) ==="

    # Create SAM S3 bucket if not provided
    if [[ -z "$SAM_S3_BUCKET" ]]; then
      SAM_S3_BUCKET="${CLIENT_NAME}-deployments-${ENVIRONMENT}"
      echo "Using default S3 bucket: ${SAM_S3_BUCKET}"
      aws s3 mb "s3://${SAM_S3_BUCKET}" --region "${REGION}" 2>/dev/null || true
      aws s3api put-bucket-tagging --bucket "${SAM_S3_BUCKET}" --region "${REGION}" \
        --tagging "TagSet=[{Key=project,Value=${PROJECT_NAME}},{Key=client,Value=${CLIENT_NAME}}]" 2>/dev/null || true
    fi

    # Read Auth0 backend config from Secrets Manager if not provided via args
    if [[ -z "$AUTH0_ISSUER_BASE_URL" ]] || [[ -z "$AUTH0_AUDIENCE" ]]; then
      BACKEND_SECRET=$(aws secretsmanager get-secret-value \
        --secret-id "${SECRET_PREFIX}/auth0-backend" \
        --region "${REGION}" \
        --query SecretString --output text 2>/dev/null || echo "")

      if [[ -n "$BACKEND_SECRET" ]] && ! echo "$BACKEND_SECRET" | grep -q "PLACEHOLDER_REPLACE_ME"; then
        AUTH0_DOMAIN=$(echo "$BACKEND_SECRET" | python3 -c "import sys,json; print(json.load(sys.stdin)['AUTH0_DOMAIN'])")
        AUTH0_AUDIENCE=$(echo "$BACKEND_SECRET" | python3 -c "import sys,json; print(json.load(sys.stdin)['AUTH0_AUDIENCE'])")
      else
        echo "ERROR: Auth0 backend secrets not populated and --auth0-issuer/--auth0-audience not provided."
        echo "Either populate the secrets or pass values via CLI arguments."
        exit 1
      fi
    else
      # Strip https:// prefix if present (SAM template expects bare domain)
      AUTH0_DOMAIN="${AUTH0_ISSUER_BASE_URL#https://}"
    fi

    # Check for existing frontend URL for CORS (plain string for SAM/Lambda)
    CORS_ORIGIN="*"
    EXISTING_FRONTEND_URL=$(aws cloudformation describe-stacks \
      --stack-name "${FRONTEND_STACK_NAME}" \
      --region "${REGION}" \
      --query "Stacks[0].Outputs[?OutputKey=='ServiceUrl'].OutputValue" \
      --output text 2>/dev/null || echo "")

    if [[ -n "$EXISTING_FRONTEND_URL" ]] && [[ "$EXISTING_FRONTEND_URL" != "None" ]]; then
      CORS_ORIGIN="${EXISTING_FRONTEND_URL}"
      echo "Using existing frontend URL for CORS: ${CORS_ORIGIN}"
    else
      echo "No existing frontend — using permissive CORS for initial deploy (will be tightened later)"
    fi

    # Deploy using the existing SAM template
    pushd "${REPO_DIR}/backend" > /dev/null

    echo "Building SAM application (Docker image)..."
    sam build --template template-fastapi.yaml

    echo "Deploying backend stack..."
    sam deploy \
      --template-file .aws-sam/build/template.yaml \
      --stack-name "${BACKEND_STACK_NAME}" \
      --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND \
      --region "${REGION}" \
      --s3-bucket "${SAM_S3_BUCKET}" \
      --parameter-overrides \
        "Environment=${ENVIRONMENT}" \
        "Auth0Domain=${AUTH0_DOMAIN}" \
        "Auth0Audience=${AUTH0_AUDIENCE}" \
        "CorsOrigin=${CORS_ORIGIN}" \
      --tags "project=${PROJECT_NAME}" "client=${CLIENT_NAME}" \
      --no-fail-on-empty-changeset \
      --resolve-image-repos

    popd > /dev/null
  fi
else
  echo ""
  echo "=== Phase 3: Skipping backend (--skip-backend) ==="
fi

# ── Phase 4: Retrieve Backend URL ────────────────────────────────────────────
echo ""
echo "=== Phase 4: Retrieving backend URL ==="

if [[ "$BACKEND_TYPE" == "apprunner" ]]; then
  BACKEND_URL=$(aws cloudformation describe-stacks \
    --stack-name "${BACKEND_STACK_NAME}" \
    --region "${REGION}" \
    --query "Stacks[0].Outputs[?OutputKey=='ServiceUrl'].OutputValue" \
    --output text 2>/dev/null || echo "")
else
  BACKEND_URL=$(aws cloudformation describe-stacks \
    --stack-name "${BACKEND_STACK_NAME}" \
    --region "${REGION}" \
    --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue" \
    --output text 2>/dev/null || echo "")
fi

if [[ -z "$BACKEND_URL" ]] || [[ "$BACKEND_URL" == "None" ]]; then
  echo "ERROR: Could not retrieve backend URL from stack '${BACKEND_STACK_NAME}'."
  echo "Make sure the backend stack is deployed."
  exit 1
fi

echo "Backend URL: ${BACKEND_URL}"

# ── Phase 5: Deploy Frontend (App Runner) ────────────────────────────────────
if [[ "$SKIP_FRONTEND" == false ]]; then
  echo ""
  echo "=== Phase 5: Deploying frontend stack ==="

  if [[ -z "$AUTH0_ISSUER_BASE_URL" ]]; then
    AUTH0_ISSUER_BASE_URL="https://$(aws secretsmanager get-secret-value \
      --secret-id "${SECRET_PREFIX}/auth0-backend" \
      --region "${REGION}" \
      --query SecretString --output text | python3 -c "import sys,json; print(json.load(sys.stdin)['AUTH0_DOMAIN'])")"
  fi
  if [[ -z "$AUTH0_AUDIENCE" ]]; then
    AUTH0_AUDIENCE=$(aws secretsmanager get-secret-value \
      --secret-id "${SECRET_PREFIX}/auth0-backend" \
      --region "${REGION}" \
      --query SecretString --output text | python3 -c "import sys,json; print(json.load(sys.stdin)['AUTH0_AUDIENCE'])")
  fi
  if [[ -z "$AUTH0_ORGANIZATION" ]]; then
    AUTH0_ORGANIZATION=$(aws secretsmanager get-secret-value \
      --secret-id "${SECRET_PREFIX}/auth0-backend" \
      --region "${REGION}" \
      --query SecretString --output text | python3 -c "import sys,json; print(json.load(sys.stdin).get('AUTH0_ORGANIZATION',''))" 2>/dev/null || echo "")
  fi

  # Check if frontend stack already exists to get current Auth0BaseUrl
  EXISTING_AUTH0_BASE_URL="https://PLACEHOLDER"
  EXISTING_SERVICE_URL=$(aws cloudformation describe-stacks \
    --stack-name "${FRONTEND_STACK_NAME}" \
    --region "${REGION}" \
    --query "Stacks[0].Outputs[?OutputKey=='ServiceUrl'].OutputValue" \
    --output text 2>/dev/null || echo "")

  if [[ -n "$EXISTING_SERVICE_URL" ]] && [[ "$EXISTING_SERVICE_URL" != "None" ]]; then
    EXISTING_AUTH0_BASE_URL="${EXISTING_SERVICE_URL}"
    echo "Using existing App Runner URL for AUTH0_BASE_URL: ${EXISTING_AUTH0_BASE_URL}"
  fi

  aws cloudformation deploy \
    --template-file "${SCRIPT_DIR}/frontend-stack.yaml" \
    --stack-name "${FRONTEND_STACK_NAME}" \
    --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
    --region "${REGION}" \
    --parameter-overrides \
      "Environment=${ENVIRONMENT}" \
      "ClientName=${CLIENT_NAME}" \
      "ProjectName=${PROJECT_NAME}" \
      "GitHubConnectionArn=${GITHUB_CONNECTION_ARN}" \
      "GitHubRepositoryUrl=${GITHUB_REPO_URL}" \
      "GitHubBranch=${GITHUB_BRANCH}" \
      "BackendUrl=${BACKEND_URL}" \
      "Auth0IssuerBaseUrl=${AUTH0_ISSUER_BASE_URL}" \
      "Auth0Audience=${AUTH0_AUDIENCE}" \
      "Auth0Organization=${AUTH0_ORGANIZATION}" \
      "Auth0BaseUrl=${EXISTING_AUTH0_BASE_URL}" \
    --tags project="${PROJECT_NAME}" client="${CLIENT_NAME}" \
    --no-fail-on-empty-changeset

  # ── Phase 6: Update AUTH0_BASE_URL with actual App Runner URL ────────────
  echo ""
  echo "=== Phase 6: Updating AUTH0_BASE_URL ==="

  FRONTEND_URL=$(aws cloudformation describe-stacks \
    --stack-name "${FRONTEND_STACK_NAME}" \
    --region "${REGION}" \
    --query "Stacks[0].Outputs[?OutputKey=='ServiceUrl'].OutputValue" \
    --output text)

  if [[ "$EXISTING_AUTH0_BASE_URL" == "https://PLACEHOLDER" ]] && [[ -n "$FRONTEND_URL" ]] && [[ "$FRONTEND_URL" != "None" ]]; then
    echo "Updating AUTH0_BASE_URL to: ${FRONTEND_URL}"
    aws cloudformation deploy \
      --template-file "${SCRIPT_DIR}/frontend-stack.yaml" \
      --stack-name "${FRONTEND_STACK_NAME}" \
      --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
      --region "${REGION}" \
      --parameter-overrides \
        "Environment=${ENVIRONMENT}" \
        "ClientName=${CLIENT_NAME}" \
        "ProjectName=${PROJECT_NAME}" \
        "GitHubConnectionArn=${GITHUB_CONNECTION_ARN}" \
        "GitHubRepositoryUrl=${GITHUB_REPO_URL}" \
        "GitHubBranch=${GITHUB_BRANCH}" \
        "BackendUrl=${BACKEND_URL}" \
        "Auth0IssuerBaseUrl=${AUTH0_ISSUER_BASE_URL}" \
        "Auth0Audience=${AUTH0_AUDIENCE}" \
        "Auth0Organization=${AUTH0_ORGANIZATION}" \
        "Auth0BaseUrl=${FRONTEND_URL}" \
      --tags project="${PROJECT_NAME}" client="${CLIENT_NAME}" \
      --no-fail-on-empty-changeset
  else
    echo "AUTH0_BASE_URL already set: ${EXISTING_AUTH0_BASE_URL}"
  fi

  # ── Phase 6a: Update Auth0 callback URLs ─────────────────────────────────
  if [[ -n "$FRONTEND_URL" ]] && [[ "$FRONTEND_URL" != "None" ]]; then
    if [[ "$AUTH0_AUTOMATED" == true ]]; then
      echo ""
      echo "=== Phase 6a: Updating Auth0 callback URLs ==="
      auth0_update_callback_urls "${FRONTEND_URL}"
    elif [[ -z "${AUTH0_MGMT_TOKEN:-}" ]]; then
      # Auth0 was skipped but try to get a token for callback URL updates
      if auth0_resolve_m2m_credentials 2>/dev/null; then
        auth0_get_mgmt_token 2>/dev/null && {
          echo ""
          echo "=== Phase 6a: Updating Auth0 callback URLs ==="
          auth0_find_or_create_app
          auth0_update_callback_urls "${FRONTEND_URL}"
        } || echo "Skipping Auth0 callback URL update (could not get management token)"
      fi
    fi
  fi

  # ── Phase 7: Tighten CORS on backend with actual frontend URL ──────────
  if [[ "$SKIP_BACKEND" == false ]] && [[ -n "$FRONTEND_URL" ]] && [[ "$FRONTEND_URL" != "None" ]]; then
    if [[ "$BACKEND_TYPE" == "apprunner" ]] && [[ "${CORS_ORIGIN:-}" == '["*"]' ]]; then
      echo ""
      echo "=== Phase 7: Tightening backend CORS ==="
      echo "Updating CORS from * to: ${FRONTEND_URL}"

      aws cloudformation deploy \
        --template-file "${SCRIPT_DIR}/backend-stack.yaml" \
        --stack-name "${BACKEND_STACK_NAME}" \
        --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
        --region "${REGION}" \
        --parameter-overrides \
          "Environment=${ENVIRONMENT}" \
          "ClientName=${CLIENT_NAME}" \
          "ProjectName=${PROJECT_NAME}" \
          "ImageUri=${IMAGE_URI}" \
          "DBEndpoint=${DB_ENDPOINT}" \
          "DBPort=${DB_PORT}" \
          "S3BucketName=${S3_BUCKET}" \
          "VpcConnectorSecurityGroupId=${VPC_CONNECTOR_SG}" \
          "SubnetIds=${PRIVATE_SUBNET_IDS}" \
          "Auth0IssuerBaseUrl=${AUTH0_ISSUER_BASE_URL}" \
          "CorsOrigins=[\"${FRONTEND_URL}\"]" \
        --tags project="${PROJECT_NAME}" client="${CLIENT_NAME}" \
        --no-fail-on-empty-changeset

    elif [[ "$BACKEND_TYPE" == "sam" ]] && [[ "${CORS_ORIGIN:-}" == "*" ]]; then
      echo ""
      echo "=== Phase 7: Tightening backend CORS ==="
      echo "Updating CorsOrigin from * to: ${FRONTEND_URL}"

      pushd "${REPO_DIR}/backend" > /dev/null
      sam deploy \
        --template-file .aws-sam/build/template.yaml \
        --stack-name "${BACKEND_STACK_NAME}" \
        --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND \
        --region "${REGION}" \
        --s3-bucket "${SAM_S3_BUCKET}" \
        --parameter-overrides \
          "Environment=${ENVIRONMENT}" \
          "Auth0Domain=${AUTH0_DOMAIN}" \
          "Auth0Audience=${AUTH0_AUDIENCE}" \
          "CorsOrigin=${FRONTEND_URL}" \
        --tags "project=${PROJECT_NAME}" "client=${CLIENT_NAME}" \
        --no-fail-on-empty-changeset \
        --resolve-image-repos
      popd > /dev/null
    fi
  fi
else
  echo ""
  echo "=== Phase 5-7: Skipping frontend (--skip-frontend) ==="
  FRONTEND_URL="(skipped)"
fi

# ── Phase 8: Summary ─────────────────────────────────────────────────────────
echo ""
echo "========================================"
echo "  Deployment Complete! (${ENVIRONMENT})"
echo "========================================"
echo ""
echo "Client:       ${CLIENT_NAME}"
echo "Project:      ${PROJECT_NAME}"
echo "Environment:  ${ENVIRONMENT}"
echo "Backend type: ${BACKEND_TYPE}"
echo "Backend URL:  ${BACKEND_URL}"
echo "Frontend URL: ${FRONTEND_URL:-N/A}"
echo ""

if [[ "$BACKEND_TYPE" == "apprunner" ]]; then
  echo "Test backend health:"
  echo "  curl ${BACKEND_URL}/api/health"
else
  echo "Test backend health:"
  echo "  curl ${BACKEND_URL}api/health"
fi
echo ""

if [[ "$AUTH0_AUTOMATED" == true ]]; then
  echo "Auth0 Configuration: AUTOMATED"
  echo "  Application:    ${SECRET_PREFIX} (${AUTH0_CLIENT_ID:0:8}...)"
  echo "  API Audience:   ${AUTH0_API_AUDIENCE}"
  echo "  Organization:   ${AUTH0_ORG_NAME} (${AUTH0_ORG_ID})"
  echo "  Callback URLs:  configured"
  echo ""
elif echo "$FRONTEND_SECRET" | grep -q "PLACEHOLDER_REPLACE_ME" 2>/dev/null; then
  echo "REMAINING STEPS:"
  echo "  1. Populate Auth0 secrets in Secrets Manager"
  echo "  2. Redeploy to pick up real secrets:"
  echo "       ./deploy.sh --client=${CLIENT_NAME} --project=${PROJECT_NAME} --environment=${ENVIRONMENT} --skip-backend"
  echo "  3. Configure Auth0 callback URLs:"
  echo "       Allowed Callback URLs:  ${FRONTEND_URL}/auth/callback"
  echo "       Allowed Logout URLs:    ${FRONTEND_URL}"
  echo "       Allowed Web Origins:    ${FRONTEND_URL}"
  echo ""
fi

if [[ "$BACKEND_TYPE" == "apprunner" ]]; then
  echo "Note: The backend runs Alembic migrations on startup via entrypoint.sh."
  echo "No separate migration step is needed."
  echo ""
fi
