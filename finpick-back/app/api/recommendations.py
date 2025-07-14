# finpick-back/app/api/recommendations.py

from fastapi import APIRouter, Depends, HTTPException, status
from typing import Any, Dict, List, Optional
import json # json 모듈 추가
from datetime import datetime
import re

from ..models.recommendation import RecommendationRequest, FeedbackData, ProductRecommendation
from ..services.recommendation_service import RecommendationService
from ..services.gemini_service import GeminiService
from ..auth.dependencies import get_current_user

router = APIRouter()

@router.post("/natural-language", status_code=status.HTTP_200_OK)
async def process_natural_language_query(
    request_data: Dict[str, Any],
    current_user: Any = Depends(get_current_user)
):
    """자연어 쿼리 처리 - Firestore 사용자 정보 연동 개선"""
    
    try:
        natural_query = request_data.get("query", "").strip()
        user_profile = request_data.get("user_profile", {})
        filters = request_data.get("filters", {})
        limit = request_data.get("limit", 5)
        
        print(f"👤 사용자 ID: {current_user.uid}")
        print(f"📝 받은 user_profile: {user_profile}")
        print(f"🎯 자연어 쿼리: {natural_query}")
        
        if not natural_query:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="쿼리가 비어있습니다."
            )
        
        user_id_str = current_user.uid if hasattr(current_user, 'uid') else str(current_user)
        
        standardized_profile = _standardize_user_profile(user_profile)
        enhanced_profile = _enhance_user_profile_with_analytics(standardized_profile)
        
        print(f"🔄 표준화된 프로필: {standardized_profile}")
        print(f"🚀 분석 강화된 프로필: {enhanced_profile}")
        
        service = RecommendationService()
        gemini_service = GeminiService()
        
        domain = await gemini_service.classify_financial_domain(natural_query)
        print(f"📊 분류된 도메인: {domain}")
        
        available_products = service.financial_products
        dataset = gemini_service.prepare_domain_dataset(available_products, domain)
        print(f"📦 준비된 데이터셋: {len(dataset['products'])}개 상품")
        
        ai_result = await gemini_service.recommend_financial_model(
            user_query=natural_query,
            user_profile=enhanced_profile,
            available_products=available_products,
            limit=limit
        )
        
        # --- 여기부터 디버깅을 위한 추가된 코드입니다 ---
        print(f"💡 DEBUG: Full AI Result from GeminiService: {json.dumps(ai_result, indent=2)}")
        print(f"💡 DEBUG: Recommended Products from AI Result: {ai_result.get('recommended_products')}")
        # --- 디버깅 코드 끝 ---

        if ai_result.get("success"):
            print("✅ 강화된 사용자 맞춤 금융모델 추천 성공")
            
            # 🔥 새로운 AI 응답 구조에 맞게 수정
            recommended_products = []
            
            for product_data in ai_result.get("recommended_products", []):
                print(f"💡 DEBUG: Processing product_data in loop: {product_data}")
                
                # 🔥 수정: original_product 없이 직접 product_data 사용
                if product_data and product_data.get("product_id"):
                    print(f"💡 DEBUG: Found product ID: {product_data.get('product_id')}")
                    enhanced_product = _enhance_product_with_user_context_v2(
                        product_data,  # 직접 전달
                        enhanced_profile
                    )
                    recommended_products.append(enhanced_product)
                else:
                    print(f"❌ DEBUG: Invalid product_data: {product_data}")
            
            # --- 여기부터 디버깅을 위한 추가된 코드입니다 ---
            print(f"💡 DEBUG: Final recommended_products list size: {len(recommended_products)}")
            print(f"💡 DEBUG: Final recommended_products list: {json.dumps(recommended_products, indent=2)}")
            # --- 디버깅 코드 끝 ---

            response_data = {
                "success": True,
                "data": recommended_products,
                "personalization_level": _determine_personalization_level(enhanced_profile),
                "user_insights": _generate_user_insights(enhanced_profile),
                "recommendation_reasoning": _generate_recommendation_reasoning(enhanced_profile, recommended_products),
                "ai_metadata": {
                    "domain": domain,
                    "total_products_analyzed": len(available_products),
                    "user_profile_completeness": _calculate_profile_completeness(enhanced_profile),
                    "processing_time": ai_result.get("processing_time", 0)
                }
            }
            
            return response_data
        else:
            print("❌ AI 추천 실패, 기본 추천으로 폴백")
            return await _generate_fallback_recommendations(natural_query, available_products, limit)
            
    except Exception as e:
        print(f"❌ 자연어 추천 처리 실패: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"추천 처리에 실패했습니다: {str(e)}"
        )

@router.post("/feedback", status_code=status.HTTP_200_OK)
async def submit_recommendation_feedback(
    feedback_data: FeedbackData,
    current_user: Any = Depends(get_current_user)
):
    """추천 피드백 제출"""
    try:
        user_id_str = current_user.uid if hasattr(current_user, 'uid') else str(current_user)
        
        print(f"📝 피드백 수신: {feedback_data.rating}/5 - {feedback_data.feedback}")
        print(f"👤 사용자: {user_id_str}")
        
        return {
            "success": True,
            "message": "피드백이 성공적으로 제출되었습니다.",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"❌ 피드백 처리 실패: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="피드백 처리에 실패했습니다."
        )

# === 🔥 새로운 헬퍼 함수 ===

def _enhance_product_with_user_context_v2(
    product_data: Dict[str, Any], 
    user_profile: Dict[str, Any]
) -> Dict[str, Any]:
    """새로운 AI 응답 구조를 위한 상품 컨텍스트 추가 함수"""
    
    # 🔥 AI가 이미 완성된 데이터를 주므로 그대로 사용
    enhanced_product = {
        "product_id": product_data.get('product_id'),
        "name": product_data.get('name'),
        "bank_name": product_data.get('bank_name'),
        "type": product_data.get('type'),
        "interest_rate": product_data.get('interest_rate'),
        "conditions": product_data.get('conditions', {}),
        "features": product_data.get('features', []),
        
        # AI 분석 결과 그대로 사용
        "ai_analysis": product_data.get('ai_analysis', {
            "suitability_score": 0.5,
            "match_reasons": [],
            "risk_assessment": "보통",
            "expected_benefit": ""
        }),
        
        # 사용자 특정 정보 그대로 사용
        "user_specific": product_data.get('user_specific', {
            "recommended_monthly_amount": 300000,
            "risk_compatibility": "적합",
            "age_appropriateness": "적합"
        })
    }
    
    return enhanced_product

# === 기존 헬퍼 함수들 ===

def _standardize_user_profile(raw_profile: Dict[str, Any]) -> Dict[str, Any]:
    """원시 사용자 프로필을 표준화된 형식으로 변환"""
    
    if not raw_profile:
        return {}
    
    standardized = {
        "basic_info": {
            "age": raw_profile.get("basicInfo", {}).get("age", ""),
            "gender": raw_profile.get("basicInfo", {}).get("gender", ""),
            "occupation": raw_profile.get("basicInfo", {}).get("occupation", ""),
            "residence": raw_profile.get("basicInfo", {}).get("residence", ""),
            "marital_status": raw_profile.get("basicInfo", {}).get("maritalStatus", ""),
            "dependents": raw_profile.get("basicInfo", {}).get("dependents", "")
        },
        "investment_profile": {
            "risk_tolerance": raw_profile.get("investmentProfile", {}).get("riskTolerance", {}),
            "investment_period": raw_profile.get("investmentProfile", {}).get("investmentPeriod", {}),
            "investment_knowledge": raw_profile.get("investmentProfile", {}).get("investmentKnowledge", {}),
            "return_expectation": raw_profile.get("investmentProfile", {}).get("returnExpectation", {}),
            "total_score": raw_profile.get("investmentProfile", {}).get("totalScore", 0)
        },
        "financial_status": raw_profile.get("financialStatus"),
        "investment_goals": raw_profile.get("investmentGoals")
    }
    
    return standardized

def _enhance_user_profile_with_analytics(profile: Dict[str, Any]) -> Dict[str, Any]:
    """사용자 프로필에 분석 요소 추가"""
    
    enhanced = profile.copy()
    
    # 투자 성향 점수 기반 분석
    investment_profile = profile.get("investment_profile", {})
    risk_score = investment_profile.get("total_score", 0)
    
    # 위험 성향 분류
    if risk_score <= 20:
        risk_category = "conservative"
    elif risk_score <= 40:
        risk_category = "moderate"
    else:
        risk_category = "aggressive"
    
    # 연령대 기반 분석
    basic_info = profile.get("basic_info", {})
    age = basic_info.get("age", "")
    
    if "20" in age:
        age_group = "young"
    elif "30" in age or "40" in age:
        age_group = "middle"
    else:
        age_group = "senior"
    
    enhanced["personalization_factors"] = {
        "life_stage": _determine_life_stage(profile),
        "financial_stability": _assess_financial_stability(profile),
        "investment_readiness": _assess_investment_readiness(profile),
        "goal_urgency": _assess_goal_urgency(profile)
    }
    
    return enhanced

def _determine_life_stage(profile: Dict[str, Any]) -> str:
    """생애 주기 단계 결정"""
    basic_info = profile.get("basic_info", {})
    age = basic_info.get("age", "")
    marital_status = basic_info.get("marital_status", "")
    
    if "20" in age:
        return "young_professional"
    elif "30" in age and marital_status == "미혼":
        return "single_professional"
    elif "30" in age or "40" in age:
        return "family_building"
    else:
        return "pre_retirement"

def _assess_financial_stability(profile: Dict[str, Any]) -> str:
    """재정적 안정성 평가"""
    # 기본적인 직업 기반 안정성 평가
    basic_info = profile.get("basic_info", {})
    occupation = basic_info.get("occupation", "").lower()
    
    stable_occupations = ["공무원", "교사", "의사", "변호사", "회계사"]
    if any(job in occupation for job in stable_occupations):
        return "high"
    else:
        return "medium"

def _assess_investment_readiness(profile: Dict[str, Any]) -> str:
    """투자 준비도 평가"""
    investment_profile = profile.get("investment_profile", {})
    knowledge_score = investment_profile.get("investment_knowledge", {}).get("score", 0)
    
    if knowledge_score >= 4:
        return "advanced"
    elif knowledge_score >= 2:
        return "intermediate"
    else:
        return "beginner"

def _assess_goal_urgency(profile: Dict[str, Any]) -> str:
    """목표 긴급도 평가"""
    investment_profile = profile.get("investment_profile", {})
    period = investment_profile.get("investment_period", {}).get("selected", "")
    
    if "1년" in period:
        return "urgent"
    elif "3년" in period:
        return "medium"
    else:
        return "long_term"

def _determine_personalization_level(profile: Dict[str, Any]) -> str:
    """개인화 수준 결정"""
    if not profile:
        return "none"
    
    # 프로필 완성도에 따라 개인화 수준 결정
    basic_info = profile.get("basic_info", {})
    investment_profile = profile.get("investment_profile", {})
    
    if investment_profile.get("total_score", 0) > 0:
        return "high"
    elif basic_info.get("occupation"):
        return "medium"
    else:
        return "low"

def _generate_user_insights(profile: Dict[str, Any]) -> Dict[str, Any]:
    """사용자 인사이트 생성"""
    
    basic_info = profile.get("basic_info", {})
    investment_profile = profile.get("investment_profile", {})
    
    # 연령대 결정
    age = basic_info.get("age", "")
    if "20" in age:
        age_group = "young"
    elif "30" in age or "40" in age:
        age_group = "middle"
    else:
        age_group = "senior"
    
    # 소득 추정 (직업 기반)
    occupation = basic_info.get("occupation", "").lower()
    if "공무원" in occupation:
        income_tier = "medium"
    elif any(prof in occupation for prof in ["의사", "변호사", "회계사"]):
        income_tier = "high"
    else:
        income_tier = "medium"
    
    # 위험 성향
    risk_score = investment_profile.get("total_score", 0)
    if risk_score <= 20:
        risk_category = "conservative"
    elif risk_score <= 40:
        risk_category = "moderate"
    else:
        risk_category = "aggressive"
    
    return {
        "age_group": age_group,
        "income_tier": income_tier,
        "risk_category": risk_category,
        "savings_capacity": 0.2 + (risk_score / 100),  # 20-50% 범위
        "investment_readiness": _assess_investment_readiness(profile),
        "financial_goals": ["목돈 마련", "노후 준비"] if age_group == "young" else ["노후 준비", "자산 증식"]
    }

def _generate_recommendation_reasoning(profile: Dict[str, Any], products: List[Dict[str, Any]]) -> str:
    """추천 논리 생성"""
    
    if not profile:
        return "일반적인 금융상품 정보를 바탕으로 추천했습니다."
    
    basic_info = profile.get("basic_info", {})
    investment_profile = profile.get("investment_profile", {})
    
    age = basic_info.get("age", "")
    occupation = basic_info.get("occupation", "")
    risk_score = investment_profile.get("total_score", 0)
    
    # 개인화된 추천 논리 생성
    age_factor = "젊은 연령대의 장기 자산 형성" if "20" in age or "30" in age else "안정적인 자산 관리"
    risk_factor = "균형 잡힌 투자 성향" if 20 <= risk_score <= 40 else "보수적인 투자 성향"
    
    return f"귀하의 {age_factor}, {risk_factor}에 따른 중간 위험도 상품을 고려하여 추천했습니다."

def _calculate_profile_completeness(profile: Dict[str, Any]) -> float:
    """프로필 완성도 계산"""
    
    if not profile:
        return 0.0
    
    total_fields = 0
    completed_fields = 0
    
    # 기본 정보 체크
    basic_info = profile.get("basic_info", {})
    basic_fields = ["age", "gender", "occupation", "residence"]
    for field in basic_fields:
        total_fields += 1
        if basic_info.get(field):
            completed_fields += 1
    
    # 투자 프로필 체크
    investment_profile = profile.get("investment_profile", {})
    if investment_profile.get("total_score", 0) > 0:
        completed_fields += 2
    total_fields += 2
    
    return completed_fields / total_fields if total_fields > 0 else 0.0

async def _generate_fallback_recommendations(query: str, products: List[Dict], limit: int) -> Dict[str, Any]:
    """폴백 추천 생성"""
    
    # 간단한 키워드 기반 추천
    keywords = query.lower().split()
    loan_keywords = ["대출", "빌리", "급전", "자금"]
    
    if any(keyword in query.lower() for keyword in loan_keywords):
        domain = "대출"
        filtered_products = [p for p in products if "대출" in p.get("type", "")]
    else:
        domain = "예금/적금"
        filtered_products = [p for p in products if "예금" in p.get("type", "") or "적금" in p.get("type", "")]
    
    # 상위 몇 개만 선택
    recommended_products = []
    for i, product in enumerate(filtered_products[:limit]):
        recommended_products.append({
            "product_id": product.get("id", f"fallback_{i}"),
            "name": product.get("name", "상품명 없음"),
            "bank_name": product.get("provider", {}).get("name", "은행명 없음"),
            "type": product.get("type", ""),
            "interest_rate": product.get("details", {}).get("interest_rate", 0),
            "conditions": product.get("conditions", {}),
            "features": [],
            "ai_analysis": {
                "suitability_score": 0.7,
                "match_reasons": ["키워드 매칭"],
                "risk_assessment": "보통",
                "expected_benefit": "기본 추천 상품"
            },
            "user_specific": {
                "recommended_monthly_amount": 300000,
                "risk_compatibility": "적합",
                "age_appropriateness": "적합"
            }
        })
    
    return {
        "success": True,
        "data": recommended_products,
        "personalization_level": "none",
        "user_insights": {},
        "recommendation_reasoning": "키워드 기반 기본 추천",
        "ai_metadata": {
            "domain": domain,
            "total_products_analyzed": len(products),
            "user_profile_completeness": 0.0,
            "processing_time": 0
        }
    }