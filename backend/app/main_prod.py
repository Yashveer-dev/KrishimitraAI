import os
import sys
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import uvicorn

# Add parent directory to path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

# Import configuration
from config import settings

# Import ML models
from ml.yield_prediction import CropYieldPredictor
from ml.disease_detection import DiseaseDetectionAPI
from ml.chatbot import ChatbotAPI

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.log_level),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(settings.log_file),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# Global variables for ML models
yield_predictor = None
detection_api = None
chatbot_api = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    logger.info("Starting KrishimitraAI backend...")
    
    # Initialize ML models
    global yield_predictor, detection_api, chatbot_api
    try:
        yield_predictor = CropYieldPredictor()
        yield_predictor.load_models(settings.model_dir)
        logger.info("Yield prediction model loaded")
        
        detection_api = DiseaseDetectionAPI()
        logger.info("Disease detection API initialized")
        
        chatbot_api = ChatbotAPI()
        logger.info("Chatbot API initialized")
        
    except Exception as e:
        logger.error(f"Failed to initialize ML models: {e}")
    
    logger.info("Backend startup complete")
    
    yield
    
    # Shutdown
    logger.info("Shutting down KrishimitraAI backend...")

# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    description="SIH25076 Agritech Platform - Production API",
    version=settings.app_version,
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=settings.allowed_methods,
    allow_headers=settings.allowed_headers,
)

# Import all API routes
from main import (
    router,  # Import all the routes from main.py
)

# Include router
app.include_router(router, prefix="/api")

# Health check endpoint
@app.get("/health")
async def health_check():
    """Enhanced health check for production"""
    return {
        "status": "healthy",
        "app_name": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment,
        "models_loaded": {
            "yield_predictor": yield_predictor is not None,
            "detection_api": detection_api is not None,
            "chatbot_api": chatbot_api is not None
        }
    }

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "KrishimitraAI API - SIH25076 Agritech Platform",
        "version": settings.app_version,
        "environment": settings.environment,
        "docs": "/docs",
        "health": "/health"
    }

# Serve static files (for production)
if os.path.exists("../frontend/build"):
    app.mount("/static", StaticFiles(directory="../frontend/build/static"), name="static")
    
    @app.get("/")
    async def serve_frontend():
        """Serve the frontend SPA"""
        from fastapi.responses import FileResponse
        return FileResponse("../frontend/build/index.html")

if __name__ == "__main__":
    uvicorn.run(
        "main_prod:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
        workers=4,
        log_level=settings.log_level.lower()
    )
