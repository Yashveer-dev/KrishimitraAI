import os
from typing import Optional
from pydantic import BaseSettings

class Settings(BaseSettings):
    # Application Settings
    app_name: str = "KrishimitraAI"
    app_version: str = "1.0.0"
    debug: bool = False
    environment: str = "production"
    
    # Database Settings
    database_url: str
    db_pool_size: int = 10
    db_max_overflow: int = 20
    
    # Redis Settings
    redis_url: str = "redis://localhost:6379"
    
    # Security Settings
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # CORS Settings
    allowed_origins: list = ["https://yourdomain.com", "https://www.yourdomain.com"]
    allowed_methods: list = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allowed_headers: list = ["*"]
    
    # API Keys
    openweather_api_key: Optional[str] = None
    
    # File Settings
    upload_dir: str = "uploads"
    max_file_size: int = 10 * 1024 * 1024  # 10MB
    
    # Logging Settings
    log_level: str = "INFO"
    log_file: str = "logs/app.log"
    
    # ML Model Settings
    model_dir: str = "data/models"
    dataset_dir: str = "data/raw"
    
    # Rate Limiting
    rate_limit_per_minute: int = 60
    rate_limit_per_hour: int = 1000
    
    # Monitoring
    sentry_dsn: Optional[str] = None
    
    class Config:
        env_file = ".env"
        case_sensitive = False

# Create settings instance
settings = Settings()
