from fastapi import FastAPI
from routes.api_routes import router
from utils.logger import setup_logger
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

setup_logger()

app = FastAPI(
    title="Requirements Generator API",
    version="1.0.0"
)

# Include the main API router which contains all sub-routes
app.include_router(router)