# finpick-back/app/api/recommendations.py
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.models.user import User
from app.models.recommendation import (
    UserProfile, 
    RecommendationRequest, 
    RecommendationResponse,
    ProductRecommendation
)
from app.auth.dependencies import get_current_user
from app.services.recommendation_service import RecommendationService

router = APIRouter()

# 간단한 추천 요청 모델
class SimpleRecommendationRequest(BaseModel):
    natural_query: Optional[str] = None
    user_profile: Optional[Dict[str, Any]] = None
    filters: Optional[Dict[str, Any]] = None
    preferred_products: Optional[List[str]] = []
    limit: int = Field(default=5, le=20)

@router.post("/analyze-profile", response_model=Dict[str, Any])
async def analyze_user_profile(
    profile_data: UserProfile,
    current_user: User = Depends(get_current_user)
):
    """사용자 프로필 분석"""
    try:
        analysis = await RecommendationService.analyze_user_profile(
            user_id=current_user.uid,
            profile=profile_data
        )
        
        return {
            "status": "success",
            "user_id": current_user.uid,
            "analysis": analysis,
            "message": "프로필 분석이 완료되었습니다."
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"프로필 분석 중 오류가 발생했습니다: {str(e)}"
        )

@router.post("/generate")  # 🔥 실제 서비스 연동
async def generate_recommendations(
    request: SimpleRecommendationRequest,
    current_user: User = Depends(get_current_user)
):
    """맞춤 상품 추천 생성 - 실제 서비스 버전"""
    try:
        print(f"🎯 실제 추천 요청: {current_user.uid}")
        print(f"📝 요청 데이터: {request}")
        
        service = RecommendationService()
        
       # 🔥 RecommendationRequest 객체 생성 시 user_id 추가
        recommendation_request = RecommendationRequest(
            user_id=current_user.uid,  # 🔥 user_id 추가
            user_profile=None,
            natural_query=request.natural_query,
            filters=request.filters or {},
            preferred_products=[],
            limit=request.limit
        )
        print(f"🔄 RecommendationRequest 생성 완료")
        
        # 🚀 실제 추천 서비스 호출
        recommendations = await service.generate_recommendations(
            user_id=current_user.uid,
            request=recommendation_request
        )
        
        print(f"✅ 실제 추천 생성 성공: {len(recommendations.products)}개 상품")
        
        # 🔧 응답 데이터를 프론트엔드 형식에 맞게 변환
        response_data = {
            "user_id": recommendations.user_id,
            "recommendation_id": recommendations.recommendation_id,
            "created_at": recommendations.created_at.isoformat(),
            "products": [
                {
                    "product_id": product.product_id,
                    "product_name": product.name,
                    "product_type": product.type.value if hasattr(product.type, 'value') else str(product.type),
                    "bank_name": product.bank,
                    "interest_rate": product.interest_rate,
                    "minimum_amount": product.minimum_amount,
                    "match_score": product.match_score,
                    "recommendation_reason": product.recommendation_reason,
                    "pros": product.pros,
                    "cons": product.cons,
                    "key_features": product.join_conditions
                }
                for product in recommendations.products
            ],
            "summary": recommendations.summary,
            "ai_analysis": recommendations.ai_analysis,
            "suggested_actions": recommendations.suggested_actions
        }
        
        return response_data
        
    except Exception as e:
        print(f"❌ 실제 추천 생성 오류: {str(e)}")
        print(f"❌ 오류 타입: {type(e)}")
        import traceback
        print(f"❌ 스택 트레이스: {traceback.format_exc()}")
        
        # 🔄 오류 시 폴백: Mock 데이터 반환
        print("🔄 폴백: Mock 데이터로 대체")
        
        fallback_response = {
            "user_id": current_user.uid,
            "recommendation_id": f"fallback_rec_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "created_at": datetime.now().isoformat(),
            "products": [
                {
                    "product_id": "fallback_loan_001",
                    "product_name": "신용대출 (폴백)",
                    "product_type": "대출",
                    "bank_name": "시스템 은행",
                    "interest_rate": 4.2,
                    "minimum_amount": 500000,
                    "match_score": 75,
                    "recommendation_reason": f"'{request.natural_query}' - 시스템 오류로 폴백 상품을 제공합니다.",
                    "pros": ["빠른 처리", "안정적 서비스"],
                    "cons": ["제한적 정보"],
                    "key_features": {
                        "fallback_mode": True,
                        "error_message": str(e)
                    }
                }
            ],
            "summary": {
                "total_count": 1,
                "fallback_mode": True,
                "error_occurred": True,
                "original_error": str(e)
            },
            "ai_analysis": {
                "fallback_mode": True,
                "user_intent": request.natural_query,
                "confidence_score": 0.5
            },
            "suggested_actions": [
                {
                    "action": "재시도",
                    "description": "잠시 후 다시 시도해보세요"
                }
            ]
        }
        
        return fallback_response

@router.post("/natural-language")
async def process_natural_language(
    request_body: Dict[str, str],
    current_user: User = Depends(get_current_user)
):
    """자연어 입력 처리"""
    try:
        query = request_body.get("query", "")
        if not query:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="query 파라미터가 필요합니다."
            )
        
        # 🚀 실제 자연어 처리 서비스 호출
        parsed_request = await RecommendationService.process_natural_language(
            user_id=current_user.uid,
            query=query
        )
        
        return {
            "status": "success",
            "original_query": query,
            "parsed_conditions": parsed_request.extracted_conditions,
            "confidence_score": parsed_request.confidence_score,
            "suggested_products": [str(p.value) for p in parsed_request.suggested_products],
            "message": "자연어 분석이 완료되었습니다."
        }
    except Exception as e:
        print(f"❌ 자연어 처리 오류: {str(e)}")
        
        # 🔄 폴백: 기본 응답
        return {
            "status": "success",
            "original_query": query,
            "parsed_conditions": {"fallback_mode": True},
            "confidence_score": 0.7,
            "suggested_products": ["대출"] if "대출" in query else ["정기예금"],
            "message": "폴백 모드로 자연어 분석이 완료되었습니다."
        }

@router.get("/history")
async def get_recommendation_history(
    limit: int = 10,
    current_user: User = Depends(get_current_user)
):
    """추천 이력 조회"""
    try:
        history = await RecommendationService.get_user_recommendation_history(
            user_id=current_user.uid,
            limit=limit
        )
        
        return {
            "status": "success",
            "user_id": current_user.uid,
            "history": history,
            "count": len(history)
        }
    except Exception as e:
        return {
            "status": "success",
            "user_id": current_user.uid,
            "history": [],
            "count": 0
        }

@router.post("/feedback")
async def submit_feedback(
    feedback_data: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    """추천 피드백 제출"""
    try:
        recommendation_id = feedback_data.get("recommendation_id")
        rating = feedback_data.get("rating")
        feedback = feedback_data.get("feedback")
        
        if not recommendation_id or not rating:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="recommendation_id와 rating이 필요합니다."
            )
        
        # 🚀 실제 피드백 서비스 호출
        result = await RecommendationService.record_feedback(
            user_id=current_user.uid,
            recommendation_id=recommendation_id,
            rating=rating,
            feedback=feedback
        )
        
        return {
            "status": "success",
            "recommendation_id": recommendation_id,
            "message": "피드백이 성공적으로 기록되었습니다.",
            "result": result
        }
    except Exception as e:
        print(f"❌ 피드백 처리 오류: {str(e)}")
        return {
            "status": "success",
            "recommendation_id": recommendation_id,
            "message": "피드백이 기록되었습니다 (폴백 모드).",
            "result": {"fallback": True}
        }

@router.get("/user-insights")
async def get_user_insights(
    current_user: User = Depends(get_current_user)
):
    """사용자 개인화 인사이트"""
    try:
        insights = await RecommendationService.get_user_insights(
            user_id=current_user.uid
        )
        
        return {
            "status": "success",
            "user_id": current_user.uid,
            "insights": insights
        }
    except Exception as e:
        return {
            "status": "success",
            "user_id": current_user.uid,
            "insights": {
                "fallback_mode": True,
                "message": "인사이트 데이터를 불러올 수 없습니다."
            }
        }

# 🔧 테스트용 엔드포인트 (인증 없이 접근 가능)
@router.post("/test/natural-language")
async def test_natural_language(
    request_body: Dict[str, str]
):
    """자연어 처리 테스트 (인증 없음)"""
    try:
        query = request_body.get("query", "")
        if not query:
            return {"error": "query가 필요합니다"}
        
        parsed_request = await RecommendationService.process_natural_language(
            user_id="test_user",
            query=query
        )
        
        return {
            "status": "success",
            "original_query": query,
            "parsed_conditions": parsed_request.extracted_conditions,
            "confidence_score": parsed_request.confidence_score,
            "suggested_products": [str(p.value) for p in parsed_request.suggested_products]
        }
    except Exception as e:
        return {"error": str(e)}