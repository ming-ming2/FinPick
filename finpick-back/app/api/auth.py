from fastapi import APIRouter, Depends, HTTPException, status
from app.models.user import User, UserCreate, Token, UserLogin
from app.auth.firebase_auth import firebase_auth
from app.auth.dependencies import get_current_user
from typing import Dict

router = APIRouter()

@router.post("/register", response_model=Token)
async def register(user_data: UserCreate):
    """회원가입"""
    try:
        # Firebase에 사용자 생성
        firebase_user = firebase_auth.create_user(
            email=user_data.email,
            password=user_data.password,
            display_name=user_data.display_name
        )
        
        # 사용자 정보 반환
        user = User(
            uid=firebase_user.uid,
            email=firebase_user.email,
            display_name=firebase_user.display_name,
            email_verified=firebase_user.email_verified
        )
        
        return Token(
            access_token="firebase_token_required",
            token_type="bearer",
            user=user
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/login")
async def login(user_data: UserLogin):
    """로그인 (프론트엔드에서 Firebase 토큰 받아서 검증)"""
    return {
        "message": "Please login with Firebase on frontend and send the token",
        "login_data": user_data
    }

@router.post("/verify-token", response_model=User)
async def verify_token(current_user: User = Depends(get_current_user)):
    """토큰 검증 및 사용자 정보 반환"""
    return current_user

@router.get("/profile", response_model=User)
async def get_profile(current_user: User = Depends(get_current_user)):
    """사용자 프로필 정보"""
    return current_user

@router.get("/protected")
async def protected_route(current_user: User = Depends(get_current_user)):
    """보호된 라우트 예시"""
    return {
        "message": f"Hello {current_user.display_name or current_user.email}!",
        "user_id": current_user.uid
    }