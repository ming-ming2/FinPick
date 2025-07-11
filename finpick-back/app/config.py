# finpick-back/app/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Firebase 설정 (JSON 파일 사용)
    firebase_project_id: str = "finpick-e11a2"
    
    # FastAPI 설정
    secret_key: str = "finpick-secret-key-2024"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # API 설정
    gemini_api_key: str = ""
    fss_api_key: str = ""
    
    # CORS 설정
    frontend_url: str = "http://localhost:3000"
    allowed_origins: list = ["http://localhost:3000", "http://localhost:5173"]

    class Config:
        env_file = ".env"

settings = Settings()