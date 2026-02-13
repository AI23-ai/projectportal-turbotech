"""
Auth0 JWT Authentication Service
Validates JWT tokens from Auth0 for API endpoint protection
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
import requests
from functools import lru_cache
import os
from typing import Dict, Optional

# Auth0 configuration — must be set via environment variables
AUTH0_DOMAIN = os.environ["AUTH0_DOMAIN"]
AUTH0_AUDIENCE = os.environ["AUTH0_AUDIENCE"]
ALGORITHMS = ["RS256"]

security = HTTPBearer()


@lru_cache()
def get_jwks() -> Dict:
    """
    Fetch Auth0 JSON Web Key Set (JWKS) - cached to avoid repeated requests
    """
    jwks_url = f"https://{AUTH0_DOMAIN}/.well-known/jwks.json"
    response = requests.get(jwks_url)
    response.raise_for_status()
    return response.json()


def get_rsa_key(token: str) -> Optional[Dict]:
    """
    Extract the RSA key from JWKS that matches the token's key ID
    """
    try:
        unverified_header = jwt.get_unverified_header(token)
        jwks = get_jwks()

        rsa_key = {}
        for key in jwks["keys"]:
            if key["kid"] == unverified_header["kid"]:
                rsa_key = {
                    "kty": key["kty"],
                    "kid": key["kid"],
                    "use": key["use"],
                    "n": key["n"],
                    "e": key["e"]
                }
                break

        return rsa_key if rsa_key else None
    except Exception:
        return None


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict:
    """
    Verify and decode Auth0 JWT token

    Usage:
        @router.get("/protected")
        async def protected_route(token: Dict = Depends(verify_token)):
            user_id = token.get("sub")
            return {"message": "Access granted"}
    """
    token = credentials.credentials

    # Get the RSA key for this token
    rsa_key = get_rsa_key(token)

    if not rsa_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unable to find appropriate key",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        # Verify and decode the token
        payload = jwt.decode(
            token,
            rsa_key,
            algorithms=ALGORITHMS,
            audience=AUTH0_AUDIENCE,
            issuer=f"https://{AUTH0_DOMAIN}/"
        )
        return payload

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.JWTClaimsError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid claims. Please check the audience and issuer",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unable to validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication error: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_user(token: Dict = Depends(verify_token)) -> str:
    """
    Extract user ID from verified token

    Usage:
        @router.get("/me")
        async def get_me(user_id: str = Depends(get_current_user)):
            return {"user_id": user_id}
    """
    return token.get("sub", "")


# Optional: Create a dependency for optional authentication
def optional_verify_token(credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))) -> Optional[Dict]:
    """
    Optional authentication - returns None if no token provided
    Useful for endpoints that work both authenticated and unauthenticated
    """
    if not credentials:
        return None

    try:
        return verify_token(credentials)
    except HTTPException:
        return None
