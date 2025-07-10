import firebase_admin 
from firebase_admin import credentials, auth
from fastapi import HTTPException, status
from app.config import settings
import os

class FirebaseAuth:
    def __init__(self):
        if not firebase_admin._apps:
            # Firebase 초기화
            cred_path = os.path.join(os.getcwd(), settings.firebase_credentials_path)
            cred = credentials.Certificate(cred_path)
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