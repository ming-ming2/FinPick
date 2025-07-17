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
        
        available_products = service.financial_products
        
        # 🔥 AI 관련성 판단을 포함한 추천 요청 시 enhanced_profile 전달
        ai_result = await gemini_service.recommend_financial_model(
            user_query=natural_query,
            user_profile=enhanced_profile,  # 🔥 사용자 프로필 전달
            available_products=available_products,
            limit=limit
        )
        
        print(f"💡 DEBUG: Full AI Result from GeminiService: {json.dumps(ai_result, indent=2)}")
        
        # 🔥 관련성 검사 실패한 경우 - 상품 데이터 없이 안내 메시지만 반환
        if not ai_result.get("is_financial_related", True):
            print(f"❌ 금융 관련 없는 요청 감지")
            
            return {
                "success": False,
                "is_financial_related": False,
                "message": ai_result.get("suggested_response", 
                    "죄송해요, 저는 대출, 예금, 적금 상품 추천을 도와드리는 AI입니다. 금융 상품에 대해 궁금한 점이 있으시면 언제든 말씀해 주세요! 😊"),
                "confidence": ai_result.get("confidence", 0),
                "reason": ai_result.get("reason", ""),
                "data": [],
                "timestamp": datetime.now().isoformat()
            }

        # 🔥 관련성 검사 통과한 경우 - 기존 로직 그대로
        if ai_result.get("success"):
            print("✅ 강화된 사용자 맞춤 금융모델 추천 성공")
            
            # 기존 코드 그대로 유지하되 enhanced_profile 전달
            recommended_products = []
            
            for product_data in ai_result.get("recommended_products", []):
                print(f"💡 DEBUG: Processing product_data in loop: {product_data}")
                
                if product_data and product_data.get("product_id"):
                    print(f"💡 DEBUG: Found product ID: {product_data.get('product_id')}")
                    # 🔥 enhanced_profile 전달
                    enhanced_product = _enhance_product_with_user_context_v2(
                        product_data,
                        enhanced_profile  # 사용자 프로필 전달
                    )
                    recommended_products.append(enhanced_product)
                else:
                    print(f"❌ DEBUG: Invalid product_data: {product_data}")
            
            print(f"💡 DEBUG: Final recommended_products list size: {len(recommended_products)}")
            print(f"💡 DEBUG: Final recommended_products list: {json.dumps(recommended_products, indent=2)}")

            response_data = {
                "success": True,
                "is_financial_related": True,
                "data": recommended_products,
                "personalization_level": _determine_personalization_level(enhanced_profile),
                "user_insights": _generate_user_insights(enhanced_profile),
                "recommendation_reasoning": _generate_recommendation_reasoning(enhanced_profile, recommended_products),
                "ai_metadata": {
                    "domain": ai_result.get("domain"),
                    "total_products_analyzed": len(available_products),
                    "user_profile_completeness": _calculate_profile_completeness(enhanced_profile),
                    "processing_time": ai_result.get("processing_time", 0)
                }
            }
            
            return response_data
        else:
            print("❌ AI 추천 실패, 기본 추천으로 폴백")
            # 🔥 폴백에도 enhanced_profile 전달
            return await _generate_fallback_recommendations(natural_query, available_products, limit, enhanced_profile)
            
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

# === 🔥 새로운 헬퍼 함수 - 사용자 프로필 기반 개선 ===

def _enhance_product_with_user_context_v2(
    product_data: Dict[str, Any], 
    user_profile: Dict[str, Any]
) -> Dict[str, Any]:
    """새로운 AI 응답 구조를 위한 상품 컨텍스트 추가 함수 - 사용자 프로필 기반"""
    
    # 🔥 GeminiService에서 이미 사용자 프로필 기반으로 계산된 데이터를 사용
    # user_specific 정보가 이미 계산되어 있으므로 그대로 사용
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
        
        # 🔥 사용자 특정 정보 - GeminiService에서 계산된 값 사용
        "user_specific": product_data.get('user_specific', {
            "recommended_monthly_amount": _estimate_monthly_amount_with_profile(product_data, user_profile),
            "risk_compatibility": _assess_risk_compatibility_simple(product_data, user_profile),
            "age_appropriateness": _assess_age_appropriateness_simple(product_data, user_profile)
        })
    }
    
    return enhanced_product

# === 간단한 헬퍼 함수들 (GeminiService 함수들의 단순화 버전) ===

def _estimate_monthly_amount_with_profile(product_data: Dict, user_profile: Optional[Dict]) -> int:
    """사용자 프로필 기반 월 납입액 추정 - 단순화 버전"""
    
    if not user_profile:
        return 300000  # 기본값
    
    basic_info = user_profile.get("basic_info", {})
    min_amount = product_data.get('conditions', {}).get('minimum_amount', 100000)
    if isinstance(min_amount, str):
        try:
            min_amount = int(min_amount)
        except:
            min_amount = 100000
    
    base_amount = max(100000, min_amount)
    
    # 직업 기반 조정
    occupation = basic_info.get("occupation", "").lower()
    if any(job in occupation for job in ["의사", "변호사", "회계사"]):
        multiplier = 2.0
    elif any(job in occupation for job in ["공무원", "교사"]):
        multiplier = 1.5
    elif any(job in occupation for job in ["학생"]):
        multiplier = 0.5
    else:
        multiplier = 1.0
    
    # 연령 기반 조정
    age = basic_info.get("age", "")
    if "20" in age:
        multiplier *= 0.8
    elif "40" in age or "50" in age:
        multiplier *= 1.3
    
    # 상품 타입별 조정
    product_type = product_data.get('type', '').lower()
    if "예금" in product_type:
        multiplier *= 2.5  # 예금은 목돈
    elif "대출" in product_type:
        return 0  # 대출은 월 납입액 없음
    
    calculated = int(base_amount * multiplier)
    return max(100000, min(1000000, calculated))

def _assess_risk_compatibility_simple(product_data: Dict, user_profile: Optional[Dict]) -> str:
    """간단한 위험도 적합성 평가"""
    
    if not user_profile:
        return "적합"
    
    investment_profile = user_profile.get("investment_profile", {})
    risk_score = investment_profile.get("total_score", 25)
    
    product_type = product_data.get('type', '').lower()
    
    if any(keyword in product_type for keyword in ["예금", "적금"]):
        if risk_score <= 20:
            return "매우 적합"
        else:
            return "적합"
    elif "대출" in product_type:
        if risk_score <= 20:
            return "신중히 검토"
        else:
            return "적합"
    
    return "적합"

def _assess_age_appropriateness_simple(product_data: Dict, user_profile: Optional[Dict]) -> str:
    """간단한 연령 적합성 평가"""
    
    if not user_profile:
        return "적합"
    
    basic_info = user_profile.get("basic_info", {})
    age = basic_info.get("age", "")
    product_type = product_data.get('type', '').lower()
    
    if "20" in age:
        if "대출" in product_type:
            return "신중한 계획 필요"
        else:
            return "목돈 마련에 적합"
    elif "30" in age or "40" in age:
        return "적합"
    elif "50" in age or "60" in age:
        if "대출" in product_type:
            return "상환 계획 검토"
        else:
            return "안정 운용에 적합"
    
    return "적합"

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

async def _generate_fallback_recommendations(query: str, products: List[Dict], limit: int, user_profile: Optional[Dict] = None) -> Dict[str, Any]:
    """폴백 추천 생성 - 사용자 프로필 적용"""
    
    # 간단한 키워드 기반 추천
    keywords = query.lower().split()
    loan_keywords = ["대출", "빌리", "급전", "자금"]
    
    if any(keyword in query.lower() for keyword in loan_keywords):
        domain = "대출"
        filtered_products = [p for p in products if "대출" in p.get("type", "")]
    else:
        domain = "예금/적금"
        filtered_products = [p for p in products if "예금" in p.get("type", "") or "적금" in p.get("type", "")]
    
    # 상위 몇 개만 선택하되 사용자 프로필 적용
    recommended_products = []
    for i, product in enumerate(filtered_products[:limit]):
        # 🔥 사용자 프로필 기반 맞춤 정보 계산
        user_specific_info = {
            "recommended_monthly_amount": _estimate_monthly_amount_with_profile(product, user_profile),
            "risk_compatibility": _assess_risk_compatibility_simple(product, user_profile),
            "age_appropriateness": _assess_age_appropriateness_simple(product, user_profile)
        }
        
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
            "user_specific": user_specific_info  # 🔥 사용자 프로필 기반 정보
        })
    
    return {
        "success": True,
        "data": recommended_products,
        "personalization_level": _determine_personalization_level(user_profile) if user_profile else "none",
        "user_insights": _generate_user_insights(user_profile) if user_profile else {},
        "recommendation_reasoning": "키워드 기반 기본 추천",
        "ai_metadata": {
            "domain": domain,
            "total_products_analyzed": len(products),
            "user_profile_completeness": _calculate_profile_completeness(user_profile) if user_profile else 0.0,
            "processing_time": 0
        }
    }