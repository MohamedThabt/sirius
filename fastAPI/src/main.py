from fastapi import FastAPI, Depends, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from routes.api_routes import router
from utils.logger import setup_logger, get_logger, log_error_structured
from security.auth import verify_bearer_token
import os
from pathlib import Path
from dotenv import load_dotenv
import uuid
import time

# Load environment variables from parent directory
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

setup_logger()
logger = get_logger(__name__)

app = FastAPI(
    title="Requirements Generator API",
    version="1.0.0",
    dependencies=[Depends(verify_bearer_token)]
)

# Configure CORS with environment variable support
cors_origins = os.getenv("CORS_ORIGINS", "*")
allowed_origins = cors_origins.split(",") if cors_origins != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request context middleware for structured logging
@app.middleware("http")
async def request_context_middleware(request: Request, call_next):
    """
    Add request context for structured logging.
    Attaches request_id, method, and path to the request state.
    """
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    request.state.method = request.method
    request.state.path = request.url.path
    request.state.start_time = time.time()
    
    # Add request_id to response headers for tracing
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    
    # Log request completion with timing
    duration_ms = int((time.time() - request.state.start_time) * 1000)
    logger.info(
        f"Request completed: {request.method} {request.url.path} | "
        f"Status: {response.status_code} | Duration: {duration_ms}ms | "
        f"Request-ID: {request_id}"
    )
    
    return response


# Global exception handler for structured error logging
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Handle all unhandled exceptions with structured logging.
    """
    request_id = getattr(request.state, "request_id", "unknown")
    method = getattr(request.state, "method", request.method)
    path = getattr(request.state, "path", request.url.path)
    
    # Log with structured context
    log_error_structured(
        logger,
        event="Unhandled exception",
        exception=exc,
        route=path,
        method=method,
        request_id=request_id,
    )
    
    # Return user-friendly error response
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal server error",
            "message": str(exc) if os.getenv("DEBUG", "false").lower() == "true" else "An unexpected error occurred",
            "request_id": request_id,
        },
    )


# Include the main API router which contains all sub-routes
app.include_router(router)