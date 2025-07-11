# 📁 finpick-back/app/auth/firebase_auth.py
import firebase_admin
from firebase_admin import credentials, auth
from app.config import settings
import os

class FirebaseAuth:
    def __init__(self):
        if not firebase_admin._apps:
            try:
                json_path = "firebase-key.json"
                if os.path.exists(json_path):
                    print(f"firebase-key.json 파일을 사용하여 Firebase 초기화")
                    cred = credentials.Certificate(json_path)
                else:
                    print("firebase-key.json 파일이 없습니다. 환경변수 확인이 필요합니다.")
                    raise FileNotFoundError("firebase-key.json 파일을 찾을 수 없습니다.")
                
                firebase_admin.initialize_app(cred, {
                    'projectId': settings.firebase_project_id,
                })
                
                print(f"✅ Firebase Admin 초기화 완료: {settings.firebase_project_id}")
                
            except Exception as e:
                print(f"❌ Firebase 초기화 실패: {str(e)}")
                raise e
    
    def verify_token(self, token: str):
        """Firebase ID 토큰 검증"""
        try:
            decoded_token = auth.verify_id_token(token)
            return decoded_token
        except Exception as e:
            raise Exception(f"토큰 검증 실패: {str(e)}")
    
    def create_user(self, email: str, password: str, display_name: str = None):
        """새 사용자 생성 (관리자용)"""
        try:
            user_data = {
                'email': email,
                'password': password,
                'email_verified': False,
                'disabled': False,
            }
            
            if display_name:
                user_data['display_name'] = display_name
                
            user = auth.create_user(**user_data)
            return user
        except Exception as e:
            raise Exception(f"사용자 생성 실패: {str(e)}")
    
    def get_user(self, uid: str):
        """사용자 정보 조회"""
        try:
            user = auth.get_user(uid)
            return user
        except Exception as e:
            raise Exception(f"사용자 조회 실패: {str(e)}")

firebase_auth = FirebaseAuth()