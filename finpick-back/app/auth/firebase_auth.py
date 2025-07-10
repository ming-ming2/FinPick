import firebase_admin
from firebase_admin import credentials, auth
from fastapi import HTTPException, status
from app.config import settings
import json

class FirebaseAuth:
    def __init__(self):
        if not firebase_admin._apps:
            # 환경 변수에서 Firebase 설정 읽기
            firebase_credentials = {
                "type": "service_account",
                "project_id": settings.firebase_project_id,
                "private_key_id": settings.firebase_private_key_id,
                "private_key": settings.firebase_private_key.replace('\\n', '\n'),
                "client_email": settings.firebase_client_email,
                "client_id": settings.firebase_client_id,
                "auth_uri": settings.firebase_auth_uri,
                "token_uri": settings.firebase_token_uri,
                "auth_provider_x509_cert_url": settings.firebase_auth_provider_cert_url,
                "client_x509_cert_url": settings.firebase_client_cert_url
            }
            
            cred = credentials.Certificate(firebase_credentials)
            firebase_admin.initialize_app(cred)
    
    def verify_token(self, token: str):
        """Firebase ID 토큰 검증"""
        try:
            decoded_token = auth.verify_id_token(token)
            return decoded_token
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
    
    def create_user(self, email: str, password: str, display_name: str = None):
        """Firebase에 사용자 생성"""
        try:
            user = auth.create_user(
                email=email,
                password=password,
                display_name=display_name
            )
            return user
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to create user: {str(e)}"
            )
    
    def get_user(self, uid: str):
        """사용자 정보 가져오기"""
        try:
            user = auth.get_user(uid)
            return user
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

# 싱글톤 인스턴스
firebase_auth = FirebaseAuth()