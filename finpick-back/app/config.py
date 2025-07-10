from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    firebase_project_id: str
    firebase_credentials_path: str
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    class Config:
        env_file = ".env"

settings = Settings()