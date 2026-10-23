import os
import secrets

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# Shared secret for Laravel -> FastAPI calls. Set SIRIUS_API_TOKEN in the environment
# (the same value as FASTAPI_API_TOKEN in Laravel). Never commit the real value.
VALID_BEARER_TOKEN = os.getenv("SIRIUS_API_TOKEN", "")

bearer_scheme = HTTPBearer(auto_error=False)

async def verify_bearer_token(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)
) -> str:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not VALID_BEARER_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="API token is not configured on the server",
        )

    if not secrets.compare_digest(credentials.credentials, VALID_BEARER_TOKEN):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid bearer token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return credentials.credentials
