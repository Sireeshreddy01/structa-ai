"""AI Workers Configuration"""
import os
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings from environment variables"""
    
    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    workers: int = 4
    debug: bool = False
    
    # Redis
    redis_url: str = "redis://localhost:6379"
    
    # Backend API
    backend_url: str = "http://localhost:3000"
    backend_api_key: str = ""
    
    # Storage
    storage_type: str = "local"  # local, s3
    storage_path: str = "/tmp/structa-ai"
    s3_bucket: str = ""
    s3_endpoint: str = ""
    
    # AI Models
    ocr_engine: str = "tesseract"  # tesseract, easyocr
    layout_model: str = "lp://PubLayNet/faster_rcnn_R_50_FPN_3x"
    table_engine: str = "img2table"  # img2table, camelot
    
    # Processing
    max_image_size: int = 4096
    jpeg_quality: int = 85
    confidence_threshold: float = 0.5
    
    class Config:
        env_prefix = "AI_"
        case_sensitive = False


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
