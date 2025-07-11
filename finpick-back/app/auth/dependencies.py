#finpick-back/app/auth/dependencies.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.auth.firebase_auth import firebase_auth
from app.models.user import User

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """현재 로그인한 사용자 정보 가져오기"""
    token = credentials.credentials
    
    # Firebase 토큰 검증
    decoded_token = firebase_auth.verify_token(token)
    
    # 사용자 정보 반환
    user = User(
        uid=decoded_token['uid'],
        email=decoded_token.get('email', ''),
        display_name=decoded_token.get('name'),
        photo_url=decoded_token.get('picture'),
        email_verified=decoded_token.get('email_verified', False)
    )
    
    return user