# finpick-back/app/api/recommendations.py
from fastapi import APIRouter, HTTPException, Depends, status # status 임포트 추가
from typing import List, Dict, Any
from datetime import datetime
import time

from app.models.recommendation import (
    RecommendationRequest,
    RecommendationResponse,
    NaturalLanguageRequest,
    NaturalLanguageResult,
    UserProfile,
    FeedbackData # FeedbackData 임포트 추가
)
from app.services.recommendation_service import RecommendationService
from app.auth.dependencies import get_current_user # get_current_user가 User 객체를 반환한다고 가정

router = APIRouter()

@router.get("/test")
async def test_endpoint():
    return {"message": "추천 API가 정상 작동합니다!", "status": "success"}

@router.post("/natural-language")
async def analyze_natural_language(
    request_body: Dict[str, str],
    current_user: Any = Depends(get_current_user) # current_user 타입 Any로 변경하여 유연성 확보
):
    try:
        query = request_body.get("query", "")
        if not query:
            raise HTTPException(status_code=400, detail="query 파라미터가 필요합니다.")
        
        print(f"🤖 Gemini AI로 자연어 분석: {query}")
        
        start_time = time.time()
        service = RecommendationService()
        
        # current_user가 User 객체일 경우 uid 사용
        user_id_str = current_user.uid if hasattr(current_user, 'uid') else str(current_user)

        result = await service.process_natural_language(
            user_id=user_id_str, # uid 사용
            query=query
        )
        processing_time = time.time() - start_time
        
        if result.success:
            print(f"🔍 자연어 분석 결과: {result.parsed_conditions}")
            
            return {
                "success": True,
                "analysis_result": {
                    "original_query": result.original_query,
                    "parsed_conditions": result.parsed_conditions,
                    "confidence_score": result.confidence_score,
                    "processing_method": getattr(result, 'processing_method', 'AI 분석'),
                    "extracted_entities": getattr(result, 'extracted_entities', {}),
                    "suggested_products": [p.value for p in result.suggested_products],
                    "processing_time_ms": round(processing_time * 1000, 2)
                },
                "ai_insights": {
                    "method": "Gemini AI 자연어 이해",
                    "confidence": result.confidence_score,
                    "explanation": result.parsed_conditions.get("reason", "AI 분석 완료")
                }
            }
        else:
            error_msg = getattr(result, 'error', '알 수 없는 오류')
            raise HTTPException(status_code=400, detail=f"자연어 분석 실패: {error_msg}")
            
    except Exception as e:
        print(f"❌ 자연어 분석 API 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate")
async def generate_recommendations(
    request_body: Dict[str, Any],
    current_user: Any = Depends(get_current_user) # current_user 타입 Any로 변경
):
    try:
        natural_query = request_body.get("natural_query", "")
        user_profile_data = request_body.get("user_profile")
        filters = request_body.get("filters", {})
        limit = request_body.get("limit", 5)

        # current_user가 User 객체일 경우 uid 사용
        user_id_str = current_user.uid if hasattr(current_user, 'uid') else str(current_user)

        # user_profile_data가 None이 아니면 UserProfile 모델로 변환 시도
        user_profile = None
        if user_profile_data:
            try:
                user_profile = UserProfile(**user_profile_data)
            except Exception as e:
                print(f"⚠️ 사용자 프로필 파싱 오류: {e}. None으로 처리합니다.")
                user_profile = None
        
        print(f"🎯 실제 추천 요청: {user_id_str}") # user_id_str 사용
        print(f"📝 요청 데이터: natural_query='{natural_query}' user_profile={user_profile is not None} filters={filters} limit={limit}")
        
        start_time = time.time()
        service = RecommendationService()
        
        # RecommendationRequest 객체 생성
        recommendation_request_obj = RecommendationRequest(
            user_id=user_id_str, # uid 사용
            natural_query=natural_query,
            user_profile=user_profile,
            filters=filters,
            limit=limit
        )

        if service.use_ai and service.gemini_service:
            print("🚀 Gemini AI로 처리 중...")
            
            ai_result = await service.generate_recommendations(recommendation_request_obj) # 객체 전달
            
            if ai_result.success: # ai_result가 RecommendationResponse 객체이므로 success 속성 직접 접근
                processing_time = time.time() - start_time
                recommendations = ai_result.recommendations # ai_result에서 recommendations 직접 접근
                
                print(f"✅ AI 추천 완료: {len(recommendations)}개 상품")
                
                for rec in recommendations:
                    print(f"🤖 AI 점수: {rec.name} = {rec.match_score}점") # rec는 ProductRecommendation 객체
                
                response_data = {
                    "success": True,
                    "total_count": len(recommendations),
                    "processing_time_seconds": round(processing_time, 3),
                    "recommendations": [
                        {
                            "id": rec.product_id,
                            "name": rec.name,
                            "provider": rec.provider,
                            "type": rec.type.value, # Enum 값을 문자열로
                            "match_score": rec.match_score,
                            "interest_rate": rec.interest_rate,
                            "recommendation_reason": rec.recommendation_reason,
                            "pros": rec.pros,
                            "cons": rec.cons,
                            "join_conditions": rec.join_conditions,
                            "special_benefits": rec.special_benefits,
                            "ai_analysis": rec.ai_analysis
                        }
                        for rec in recommendations
                    ],
                    "ai_insights": {
                        "analysis_method": ai_result.ai_insights.get('method', 'Gemini AI 종합 분석'),
                        "confidence_score": ai_result.ai_insights.get('confidence', 0.8),
                        "user_analysis": ai_result.ai_insights.get('user_analysis', {}),
                        "overall_analysis": ai_result.ai_insights.get('overall_analysis', ''),
                        "investment_advice": ai_result.ai_insights.get('investment_advice', ''),
                        "products_analyzed": ai_result.ai_insights.get('products_analyzed', len(service.financial_products)),
                        "recommendation_summary": ai_result.ai_insights.get('note', f"AI가 {len(service.financial_products)}개 상품을 분석해서 상위 {len(recommendations)}개를 추천했습니다.")
                    },
                    "metadata": {
                        "filters_applied": ai_result.filters_applied,
                        "timestamp": ai_result.created_at.isoformat(), # created_at 사용
                        "api_version": "2.0-ai-powered"
                    }
                }
                
                return response_data
            else:
                print("⚠️ AI 추천 실패, 폴백 처리")
                # RecommendationRequest 객체를 생성하여 전달
                return await service._fallback_recommendations(recommendation_request_obj)
        else:
            print("📊 규칙 기반 추천으로 처리")
            # RecommendationRequest 객체를 생성하여 전달
            return await service._fallback_recommendations(recommendation_request_obj)
            
    except Exception as e:
        print(f"❌ 추천 생성 API 오류: {e}")
        # 오류 발생 시에도 RecommendationRequest 객체를 생성하여 전달
        # user_id도 문자열로 변환하여 전달
        fallback_request = RecommendationRequest(
            user_id=user_id_str, # uid 사용
            natural_query=natural_query, # 원본 쿼리 유지
            user_profile=user_profile, # 원본 프로필 유지
            filters=filters, # 원본 필터 유지
            limit=limit # 원본 limit 유지
        )
        return await service._fallback_recommendations(fallback_request)


@router.post("/feedback", status_code=status.HTTP_200_OK) # 새로운 피드백 엔드포인트 추가
async def submit_feedback(
    feedback_data: FeedbackData, # FeedbackData 모델을 사용하여 요청 바디 유효성 검사
    current_user: Any = Depends(get_current_user)
):
    try:
        # current_user의 uid와 feedback_data의 user_id가 일치하는지 확인 (선택 사항)
        user_id_str = current_user.uid if hasattr(current_user, 'uid') else str(current_user)
        if user_id_str != feedback_data.user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="피드백 제출 권한이 없습니다."
            )

        print(f"✅ 사용자 {feedback_data.user_id}로부터 피드백 수신: "
              f"추천 ID={feedback_data.recommendation_id}, 평점={feedback_data.rating}, "
              f"피드백={feedback_data.feedback_text}, 상호작용={feedback_data.interaction_type}")

        # 여기에 피드백 데이터를 데이터베이스에 저장하는 로직을 추가할 수 있습니다.
        # 예: await feedback_repository.save_feedback(feedback_data)

        return {"message": "피드백이 성공적으로 제출되었습니다.", "success": True}
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"❌ 피드백 제출 오류: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"피드백 제출 실패: {str(e)}")


@router.get("/test-gemini")
async def test_gemini(current_user: Any = Depends(get_current_user)): # current_user 타입 Any로 변경
    try:
        from app.services.gemini_service import GeminiService
        
        gemini_service = GeminiService()
        test_query = "30만원으로 안전하게 저축하고 싶어요"
        
        result = await gemini_service.recommend_products(
            user_query=test_query,
            user_profile=None,
            available_products=[
                {
                    "id": "test001",
                    "name": "테스트 정기예금",
                    "type": "정기예금",
                    "provider": {"name": "테스트 은행"},
                    "details": {"interest_rate": 3.5, "minimum_amount": 100000},
                    "conditions": {"join_way": ["인터넷"], "join_member": "일반"}
                }
            ],
            limit=1
        )
        
        return {
            "gemini_service_status": "정상 동작",
            "test_query": test_query,
            "test_result": result,
            "gemini_api_connected": result.get("success", False)
        }
        
    except Exception as e:
        return {
            "gemini_service_status": "오류 발생",
            "error": str(e),
            "suggestion": "GEMINI_API_KEY 환경변수를 확인하세요"
        }

@router.post("/compare-ai-vs-legacy")
async def compare_ai_vs_legacy(
    request: RecommendationRequest,
    current_user: Any = Depends(get_current_user) # current_user 타입 Any로 변경
):
    try:
        service = RecommendationService()
        
        ai_start = time.time()
        ai_result = await service.generate_recommendations(request)
        ai_time = time.time() - ai_start
        
        legacy_start = time.time()
        service.use_ai = False
        legacy_result = await service.generate_recommendations(request)
        legacy_time = time.time() - legacy_start
        
        return {
            "comparison_results": {
                "ai_recommendation": {
                    "count": ai_result.total_count,
                    "processing_time": round(ai_time, 3),
                    "method": ai_result.ai_insights.get('method', 'AI') if ai_result.ai_insights else 'AI',
                    "confidence": ai_result.ai_insights.get('confidence', 0) if ai_result.ai_insights else 0,
                    "top_products": [rec.name for rec in ai_result.recommendations[:3]]
                },
                "legacy_recommendation": {
                    "count": legacy_result.total_count,
                    "processing_time": round(legacy_time, 3),
                    "method": "규칙 기반",
                    "confidence": 0.6,
                    "top_products": [rec.name for rec in legacy_result.recommendations[:3]]
                },
                "performance_comparison": {
                    "ai_faster": ai_time < legacy_time,
                    "speed_difference_ms": round(abs(ai_time - legacy_time) * 1000, 2),
                    "recommendation_overlap": len(set([r.name for r in ai_result.recommendations]) & 
                                                 set([r.name for r in legacy_result.recommendations]))
                }
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"비교 분석 실패: {str(e)}")

@router.post("/ai-insights")
async def get_ai_insights(
    natural_query: str,
    current_user: Any = Depends(get_current_user) # current_user 타입 Any로 변경
):
    try:
        from app.services.gemini_service import GeminiService
        
        gemini_service = GeminiService()
        analysis = await gemini_service._analyze_user_requirements(natural_query, None)
        
        return {
            "user_query": natural_query,
            "ai_insights": analysis,
            "interpretation": {
                "risk_level": "높음" if analysis.get("risk_appetite", 5) > 7 else "보통" if analysis.get("risk_appetite", 5) > 4 else "낮음",
                "investment_style": "공격적" if analysis.get("urgency_level", 5) > 7 else "안정적",
                "recommended_approach": "단기 고수익 상품" if analysis.get("risk_appetite", 5) > 7 else "중장기 안정 상품"
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI 인사이트 생성 실패: {str(e)}")
