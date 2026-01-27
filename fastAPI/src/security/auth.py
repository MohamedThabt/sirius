from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# Strong 256-bit hardcoded Bearer token for Laravel-FastAPI communication
VALID_BEARER_TOKEN = "sk_sirius_a9f7c2e4b8d1f6a3c5e9d2b7f4a8c1e6d3b9f5a2c8e4d7b1f6a3c9e5d2b8f4a1"

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
    
    if credentials.credentials != VALID_BEARER_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid bearer token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return credentials.credentials
