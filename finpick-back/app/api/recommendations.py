# finpick-back/app/api/recommendations.py

from fastapi import APIRouter, Depends, HTTPException, status
from typing import Any, Dict, List, Optional
import json
from datetime import datetime

from ..models.recommendation import RecommendationRequest, FeedbackData, ProductRecommendation
from ..services.recommendation_service import RecommendationService
from ..services.gemini_service import GeminiService
from ..auth.dependencies import get_current_user  # 🔥 경로 수정!

router = APIRouter()

@router.post("/natural-language", status_code=status.HTTP_200_OK)
async def process_natural_language_query(
    request_data: Dict[str, Any],
    current_user: Any = Depends(get_current_user)
):
    """자연어 쿼리 처리 - 금융모델 추천 중심으로 완전 개편"""
    
    try:
        # 요청 데이터 파싱
        natural_query = request_data.get("query", "").strip()
        user_profile = request_data.get("user_profile", {})
        filters = request_data.get("filters", {})
        limit = request_data.get("limit", 5)
        
        if not natural_query:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="쿼리가 비어있습니다."
            )
        
        # 사용자 ID 추출
        user_id_str = current_user.uid if hasattr(current_user, 'uid') else str(current_user)
        
        print(f"🎯 금융모델 추천 요청: {natural_query}")
        
        # 추천 서비스 초기화
        service = RecommendationService()
        
        # 🔥 핵심 변경: Gemini 서비스로 금융모델 추천
        gemini_service = GeminiService()
        
        # 1단계: 사용자 쿼리로 도메인 분류
        domain = await gemini_service.classify_financial_domain(natural_query)
        print(f"📊 분류된 도메인: {domain}")
        
        # 2단계: 도메인별 데이터셋 준비
        available_products = service.financial_products  # 전체 상품 데이터
        dataset = gemini_service.prepare_domain_dataset(available_products, domain)
        print(f"📦 준비된 데이터셋: {len(dataset['products'])}개 상품")
        
        # 3단계: 금융모델 기반 추천 실행
        ai_result = await gemini_service.recommend_financial_model(
            user_query=natural_query,
            user_profile=user_profile,
            available_products=available_products,
            limit=limit
        )
        
        if ai_result.get("success"):
            print("✅ 금융모델 추천 성공")
            
            # 추천 결과를 기존 형식과 호환되게 변환
            recommended_products = []
            
            for product_data in ai_result.get("recommended_products", []):
                original_product = product_data.get("original_product")
                if original_product:
                    # 기존 API 형식으로 변환 (ProductRecommendation 객체 생성하지 않고 Dict로)
                    product_response = {
                        'product_id': original_product.get('id'),
                        'product_name': original_product.get('name'),
                        'product_type': original_product.get('type'),
                        'provider_name': original_product.get('provider', {}).get('name'),
                        'interest_rate': original_product.get('details', {}).get('interest_rate', 0),
                        'minimum_amount': original_product.get('details', {}).get('minimum_amount', 0),
                        'maximum_amount': original_product.get('details', {}).get('maximum_amount', 0),
                        'subscription_period': original_product.get('details', {}).get('subscription_period', ''),
                        'maturity_period': original_product.get('details', {}).get('maturity_period', ''),
                        'join_conditions': original_product.get('conditions', {}).get('join_member', ''),
                        'join_ways': original_product.get('conditions', {}).get('join_way', []),
                        'special_benefits': original_product.get('benefits', []),
                        'ai_analysis': {
                            'model_fit_score': product_data.get('model_fit_score', 0),
                            'role_in_model': product_data.get('role_in_model', ''),
                            'match_reasons': product_data.get('match_reasons', []),
                            'contribution': product_data.get('contribution', ''),
                            'synergy_effect': product_data.get('synergy_effect', ''),
                            'implementation_priority': product_data.get('implementation_priority', 1)
                        }
                    }
                    recommended_products.append(product_response)
            
            # 🔥 새로운 응답 형식 - 금융모델 중심
            response_data = {
                "success": True,
                "recommendation_type": "financial_model_based",
                "user_query": natural_query,
                "classified_domain": ai_result.get("classified_domain"),
                
                # 🎯 핵심: 금융모델 정보
                "financial_model": ai_result.get("financial_model"),
                
                # 🏦 추천 상품들 (기존 형식 호환)
                "recommendations": [
                    {
                        "product_id": rec['product_id'],
                        "product_name": rec['product_name'],
                        "product_type": rec['product_type'],
                        "provider_name": rec['provider_name'],
                        "interest_rate": rec['interest_rate'],
                        "minimum_amount": rec['minimum_amount'],
                        "maximum_amount": rec['maximum_amount'],
                        "subscription_period": rec['subscription_period'],
                        "maturity_period": rec['maturity_period'],
                        "join_conditions": rec['join_conditions'],
                        "join_ways": rec['join_ways'],
                        "special_benefits": rec['special_benefits'],
                        "ai_analysis": rec['ai_analysis'],
                        
                        # 🆕 금융모델 특화 정보
                        "model_relevance": rec['ai_analysis'].get('model_fit_score', 0),
                        "model_role": rec['ai_analysis'].get('role_in_model', ''),
                        "implementation_priority": rec['ai_analysis'].get('implementation_priority', 1)
                    }
                    for rec in recommended_products
                ],
                
                # 📊 포트폴리오 분석
                "portfolio_analysis": ai_result.get("portfolio_analysis"),
                
                # 🤖 AI 인사이트 (확장된 정보)
                "ai_insights": {
                    "method": "Gemini AI 금융모델 분석",
                    "domain_specialized": True,
                    "model_based": True,
                    "confidence_score": ai_result.get("ai_insights", {}).get("confidence_score", 0.8),
                    "user_analysis": ai_result.get("user_analysis", {}),
                    "financial_strategy": ai_result.get("financial_model", {}).get("strategy", {}),
                    "expected_outcomes": ai_result.get("financial_model", {}).get("expected_outcomes", {}),
                    "products_analyzed": len(dataset['products']),
                    "recommendation_summary": f"AI가 {domain} 도메인에서 맞춤 금융모델을 설계하고 최적 상품 {len(recommended_products)}개를 추천했습니다."
                },
                
                # 📋 실행 계획
                "next_steps": ai_result.get("next_steps", []),
                
                # 📈 메타데이터
                "metadata": {
                    "domain": ai_result.get("classified_domain"),
                    "dataset_size": len(dataset['products']),
                    "model_confidence": ai_result.get("financial_model", {}).get("confidence", 3),
                    "timestamp": datetime.now().isoformat(),
                    "api_version": "3.0-financial-model"
                }
            }
            
            return response_data
            
        else:
            print("⚠️ 금융모델 추천 실패, 기존 방식으로 폴백")
            
            # 폴백: 기존 추천 방식 사용
            recommendation_request = RecommendationRequest(
                user_id=user_id_str,
                natural_query=natural_query,
                user_profile=user_profile,
                filters=filters,
                limit=limit
            )
            
            return await service._fallback_recommendations(recommendation_request)
            
    except Exception as e:
        print(f"❌ 자연어 쿼리 처리 오류: {e}")
        
        # 오류 시 폴백 처리
        try:
            service = RecommendationService()
            fallback_request = RecommendationRequest(
                user_id=user_id_str,
                natural_query=natural_query,
                user_profile=user_profile,
                filters=filters,
                limit=limit
            )
            return await service._fallback_recommendations(fallback_request)
            
        except Exception as fallback_error:
            print(f"❌ 폴백 처리도 실패: {fallback_error}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="추천 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요."
            )


@router.post("/feedback", status_code=status.HTTP_200_OK)
async def submit_feedback(
    feedback_data: FeedbackData,
    current_user: Any = Depends(get_current_user)
):
    """피드백 제출"""
    try:
        user_id_str = current_user.uid if hasattr(current_user, 'uid') else str(current_user)
        
        if user_id_str != feedback_data.user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="피드백 제출 권한이 없습니다."
            )
        
        # 피드백 저장 로직 (Firestore 등)
        print(f"📝 피드백 수신: {feedback_data.rating}/5 - {feedback_data.feedback}")
        
        return {
            "success": True,
            "message": "피드백이 성공적으로 제출되었습니다.",
            "feedback_id": f"feedback_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        }
        
    except Exception as e:
        print(f"❌ 피드백 제출 오류: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="피드백 제출에 실패했습니다."
        )


@router.get("/history", status_code=status.HTTP_200_OK)
async def get_recommendation_history(
    limit: int = 10,
    current_user: Any = Depends(get_current_user)
):
    """추천 이력 조회"""
    try:
        user_id_str = current_user.uid if hasattr(current_user, 'uid') else str(current_user)
        
        # 실제로는 Firestore에서 사용자별 추천 이력을 조회
        # 여기서는 샘플 데이터 반환
        
        return {
            "success": True,
            "user_id": user_id_str,
            "recommendations": [],  # 실제 이력 데이터
            "total_count": 0,
            "limit": limit
        }
        
    except Exception as e:
        print(f"❌ 추천 이력 조회 오류: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="추천 이력 조회에 실패했습니다."
        )


@router.get("/user-insights", status_code=status.HTTP_200_OK)
async def get_user_insights(
    current_user: Any = Depends(get_current_user)
):
    """사용자 인사이트 조회"""
    try:
        user_id_str = current_user.uid if hasattr(current_user, 'uid') else str(current_user)
        
        # 사용자별 인사이트 분석
        return {
            "success": True,
            "user_id": user_id_str,
            "insights": {
                "preferred_domains": [],
                "risk_profile": "보통",
                "recommendation_satisfaction": 0.0,
                "frequent_queries": []
            }
        }
        
    except Exception as e:
        print(f"❌ 사용자 인사이트 조회 오류: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="사용자 인사이트 조회에 실패했습니다."
        )


# 🧪 테스트용 엔드포인트 (개발 단계에서만 사용)
@router.post("/test/domain-classification", status_code=status.HTTP_200_OK)
async def test_domain_classification(
    request_data: Dict[str, str]
):
    """도메인 분류 테스트"""
    try:
        query = request_data.get("query", "")
        
        gemini_service = GeminiService()
        domain = await gemini_service.classify_financial_domain(query)
        
        return {
            "query": query,
            "classified_domain": domain,
            "available_domains": list(gemini_service.domain_datasets.keys())
        }
        
    except Exception as e:
        return {"error": str(e)}


@router.post("/test/dataset-preparation", status_code=status.HTTP_200_OK)
async def test_dataset_preparation(
    request_data: Dict[str, str]
):
    """데이터셋 준비 테스트"""
    try:
        domain = request_data.get("domain", "중장기_목돈마련")
        
        service = RecommendationService()
        gemini_service = GeminiService()
        
        dataset = gemini_service.prepare_domain_dataset(service.financial_products, domain)
        
        return {
            "domain": domain,
            "total_products": len(service.financial_products),
            "filtered_products": len(dataset["products"]),
            "market_analysis": dataset["market_analysis"],
            "recommendation_strategy": dataset["recommendation_strategy"]
        }
        
    except Exception as e:
        return {"error": str(e)}