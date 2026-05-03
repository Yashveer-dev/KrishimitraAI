"""
Render-specific configuration
"""
import os
from dotenv import load_dotenv

load_dotenv()

class RenderConfig:
    """Render deployment configuration"""
    
    # Render-specific settings
    RENDER = os.getenv('RENDER', 'true').lower() == 'true'
    
    # Database configuration
    DATABASE_URL = os.getenv('DATABASE_URL')
    
    # CORS settings for Vercel
    ALLOWED_ORIGINS = [
        "https://krishimitraai.vercel.app",
        "https://krishimitraai.vercel.app/*",
        "https://www.krishimitraai.vercel.app",
        "http://localhost:3000"  # For development
    ]
    
    # Health check endpoint
    HEALTH_CHECK_PATH = "/health"
    
    # Render free tier limitations
    FREE_TIER_LIMITS = {
        'ram_mb': 512,
        'sleep_time': 900,  # 15 minutes in seconds
        'build_timeout': 300,  # 5 minutes
        'max_concurrent': 1
    }
    
    @classmethod
    def is_render_environment(cls):
        """Check if running on Render"""
        return cls.RENDER or 'render.com' in os.getenv('HOSTNAME', '')
    
    @classmethod
    def get_database_url(cls):
        """Get database URL with fallback"""
        return cls.DATABASE_URL or os.getenv('POSTGRES_URL')
    
    @classmethod
    def get_cors_origins(cls):
        """Get CORS origins for Vercel frontend"""
        origins = cls.ALLOWED_ORIGINS.copy()
        
        # Add Vercel preview URLs
        if cls.is_render_environment():
            origins.append("https://*.vercel.app")
        
        return origins
