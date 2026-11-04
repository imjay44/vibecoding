import os
from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_ENV: str = "development"
    APP_NAME: str = "HomeServe Technologies API"
    API_V1_PREFIX: str = "/api/v1"
    
    SECRET_KEY: str = "development_secret_key_change_in_production"
    JWT_SECRET_KEY: str = "development_jwt_secret_key_change_in_production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Database URL
    DATABASE_URL: str = "sqlite:///./homeserve.db"
    
    # CORS
    FRONTEND_URL: str = "http://localhost:5173"
    CORS_ORIGINS: Union[str, List[str]] = "http://localhost:5173,http://localhost:3000"
    
    # Razorpay
    RAZORPAY_KEY_ID: str = "rzp_test_homeserve123456"
    RAZORPAY_KEY_SECRET: str = "sec_test_homeserveabcdef"
    RAZORPAY_WEBHOOK_SECRET: str = "whsec_test_homeserve789"
    
    # Cloudinary
    CLOUDINARY_CLOUD_NAME: str = "homeserve_cloud"
    CLOUDINARY_API_KEY: str = "123456789012345"
    CLOUDINARY_API_SECRET: str = "abcdefghijklmnopqrstuvwxyz1"
    
    # Platform Defaults
    DEFAULT_PLATFORM_COMMISSION_PERCENT: float = 10.0
    
    # Upload limits
    MAX_FILE_SIZE_MB: int = 10
    ALLOWED_IMAGE_EXTENSIONS: List[str] = ["jpg", "jpeg", "png", "webp", "pdf"]
    
    # SMTP (optional)
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = "noreply@homeservetech.com"

    @property
    def cors_origins_list(self) -> List[str]:
        if isinstance(self.CORS_ORIGINS, list):
            return self.CORS_ORIGINS
        if isinstance(self.CORS_ORIGINS, str):
            return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]
        return ["*"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
