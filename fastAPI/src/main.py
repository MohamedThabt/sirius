from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.api_routes import router
from utils.logger import setup_logger
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from parent directory
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

setup_logger()

app = FastAPI(
    title="Requirements Generator API",
    version="1.0.0"
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

# Include the main API router which contains all sub-routes
app.include_router(router)