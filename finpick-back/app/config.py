from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Firebase 설정
    firebase_type: str # 'type' 필드 추가
    firebase_project_id: str
    firebase_private_key_id: str
    firebase_private_key: str
    firebase_client_email: str
    firebase_client_id: str
    firebase_auth_uri: str = "https://accounts.google.com/o/oauth2/auth" # 기본값 설정
    firebase_token_uri: str = "https://oauth2.googleapis.com/token" # 기본값 설정
    firebase_auth_provider_cert_url: str = "https://www.googleapis.com/oauth2/v1/certs" # 실제 값으로 기본값 설정
    firebase_client_cert_url: str = "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40finpick-e11a2.iam.gserviceaccount.com" # 실제 값으로 기본값 설정
    
    # FastAPI 설정
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    class Config:
        env_file = ".env" # .env 파일을 로드하도록 설정

settings = Settings()