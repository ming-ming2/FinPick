# finpick-back/app/api/recommendations.py
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any, Optional
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

@router.post("/generate", response_model=RecommendationResponse)
async def generate_recommendations(
    request: RecommendationRequest,
    current_user: User = Depends(get_current_user)
):
    """맞춤 상품 추천 생성"""
    try:
        service = RecommendationService()
        recommendations = await service.generate_recommendations(
            user_id=current_user.uid,
            request=request
        )
        
        return recommendations
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"추천 생성 중 오류가 발생했습니다: {str(e)}"
        )

@router.post("/natural-language")  # 🔧 이 엔드포인트가 핵심!
async def process_natural_language(
    request_body: Dict[str, str],  # {"query": "사용자 입력"}
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
        
        # 자연어 처리 및 조건 추출
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
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"자연어 처리 중 오류가 발생했습니다: {str(e)}"
        )

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
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"추천 이력 조회 중 오류가 발생했습니다: {str(e)}"
        )

@router.post("/feedback")
async def submit_feedback(
    feedback_data: Dict[str, Any],  # {"recommendation_id": "...", "rating": 5, "feedback": "..."}
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
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"피드백 처리 중 오류가 발생했습니다: {str(e)}"
        )

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
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"인사이트 조회 중 오류가 발생했습니다: {str(e)}"
        )

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