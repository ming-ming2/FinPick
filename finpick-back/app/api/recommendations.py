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
            
            recommended_products = []
            
            for product_data in ai_result.get("recommended_products", []):
                print(f"💡 DEBUG: Processing product_data in loop: {product_data}") # 각 product_data 확인
                original_product = product_data.get("original_product")
                if original_product:
                    print(f"💡 DEBUG: Found original_product ID: {original_product.get('id')}") # original_product ID 확인
                    enhanced_product = _enhance_product_with_user_context(
                        original_product, 
                        product_data, 
                        enhanced_profile
                    )
                    recommended_products.append(enhanced_product)
                else:
                    print(f"❌ DEBUG: 'original_product' missing or None in product_data: {product_data}") # original_product 누락 시 경고
            
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
            "feedback_id": f"feedback_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{user_id_str[:8]}"
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
        
        return {
            "success": True,
            "user_id": user_id_str,
            "recommendations": [],
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

def _parse_age_to_number(age_string: str) -> int:
    """나이 문자열을 숫자로 변환"""
    if not age_string:
        return 30  # 기본값
    
    age_lower = str(age_string).lower()
    
    # "20대", "30대" 등의 패턴 처리
    if "20" in age_lower:
        return 25
    elif "30" in age_lower:
        return 35
    elif "40" in age_lower:
        return 45
    elif "50" in age_lower:
        return 55
    else:
        # 숫자만 있는 경우 시도
        try:
            return int(age_string)
        except ValueError:
            return 30  # 기본값

def _standardize_user_profile(user_profile: Dict) -> Dict:
    """프론트엔드 사용자 프로필을 백엔드 표준 형식으로 변환"""
    
    # 🔥 None 체크 먼저 수행
    if not user_profile or user_profile is None:
        return {
            "basic_info": {},
            "financial_situation": {
                "monthly_income": 3000000,
                "monthly_expense": 2000000, 
                "debt_amount": 0,
                "assets_amount": 0,
                "credit_score": 650
            },
            "investment_personality": {},
            "goal_setting": {}
        }
    
    # 기본 구조 생성
    standardized = {
        "basic_info": {},
        "financial_situation": {},
        "investment_personality": {},
        "goal_setting": {}
    }
    
    # 🔥 재무 상황 매핑 - None 체크 추가
    financial = user_profile.get("financialStatus")
    if financial and isinstance(financial, dict):
        standardized["financial_situation"] = {
            "monthly_income": _parse_income_range(financial.get("monthlyIncome", "")),
            "monthly_expense": financial.get("monthlyExpense", 0),
            "debt_amount": financial.get("debt", 0),
            "assets_amount": financial.get("assets", 0),
            "credit_score": financial.get("creditScore", 650)
        }
    else:
        # 🔥 None이거나 빈 값일 때 기본값 설정
        standardized["financial_situation"] = {
            "monthly_income": 3000000,  # 기본 300만원
            "monthly_expense": 2000000,  # 기본 200만원
            "debt_amount": 0,
            "assets_amount": 0,
            "credit_score": 650
        }
    
    # 🔥 기본 정보 매핑 - age 변환 추가
    if "basicInfo" in user_profile:
        basic = user_profile["basicInfo"]
        standardized["basic_info"] = {
            "age": _parse_age_to_number(basic.get("age")),  # 🔥 나이 변환 함수 사용
            "occupation": basic.get("occupation"),
            "residence": basic.get("residence"),
            "marital_status": basic.get("maritalStatus")
        }
    
    # 투자 성향 매핑
    if "investmentPersonality" in user_profile:
        investment = user_profile["investmentPersonality"]
        standardized["investment_personality"] = {
            "risk_tolerance": investment.get("riskTolerance"),
            "investment_experience": investment.get("experience"),
            "preferred_period": investment.get("period")
        }
    
    # 목표 설정 매핑
    if "goals" in user_profile:
        goals = user_profile["goals"]
        if isinstance(goals, list) and len(goals) > 0:
            primary_goal = goals[0]
            standardized["goal_setting"] = {
                "primary_goal": primary_goal.get("value"),
                "target_amount": primary_goal.get("targetAmount"),
                "timeframe": primary_goal.get("timeframe"),
                "monthly_budget": primary_goal.get("monthlyBudget")
            }
    
    return standardized

def _enhance_user_profile_with_analytics(profile: Dict[str, Any]) -> Dict[str, Any]:
    """사용자 프로필에 분석 데이터 추가"""
    
    enhanced = profile.copy()
    
    enhanced["analytics"] = {
        "age_group": _categorize_age_group(profile.get("basic_info", {}).get("age")),
        "income_tier": _categorize_income_tier(profile.get("financial_situation", {}).get("monthly_income")),
        "risk_category": _categorize_risk_level(profile.get("investment_personality", {}).get("risk_tolerance", 3)),
        "savings_ratio": _calculate_savings_ratio(profile.get("financial_situation", {})),
        "investment_capacity": _calculate_investment_capacity(profile.get("financial_situation", {})),
        "primary_goal_type": _extract_primary_goal_type(profile.get("goal_setting", {})),
        "profile_completeness": _calculate_profile_completeness(profile)
    }
    
    enhanced["personalization_factors"] = {
        "life_stage": _determine_life_stage(profile),
        "financial_stability": _assess_financial_stability(profile),
        "investment_readiness": _assess_investment_readiness(profile),
        "goal_urgency": _assess_goal_urgency(profile)
    }
    
    return enhanced

def _enhance_product_with_user_context(
    original_product: Dict[str, Any], 
    ai_analysis: Dict[str, Any], 
    user_profile: Dict[str, Any]
) -> Dict[str, Any]:
    """상품에 사용자 맞춤 정보 추가"""
    
    enhanced_product = {
        "product_id": original_product.get('id'),
        "name": original_product.get('name'),
        "bank_name": original_product.get('bank_name'),
        "type": original_product.get('type'),
        "interest_rate": original_product.get('interest_rate'),
        "conditions": original_product.get('conditions', []),
        "features": original_product.get('features', []),
        "ai_analysis": {
            "suitability_score": ai_analysis.get("suitability_score", 0.5),
            "match_reasons": ai_analysis.get("reasoning", []),
            "risk_assessment": ai_analysis.get("risk_assessment", "보통"),
            "expected_benefit": ai_analysis.get("expected_benefit", "")
        },
        "user_specific": _generate_user_specific_analysis(original_product, user_profile)
    }
    
    return enhanced_product

def _generate_user_specific_analysis(product: Dict[str, Any], user_profile: Dict[str, Any]) -> Dict[str, Any]:
    """사용자별 맞춤 분석 생성"""
    
    analysis = {}
    
    financial_status = user_profile.get("financial_situation", {})
    monthly_income = financial_status.get("monthly_income", 0)
    
    if monthly_income > 0:
        recommended_amount = int(monthly_income * 0.1)
        analysis["recommended_monthly_amount"] = recommended_amount
        
        if product.get("interest_rate"):
            goal_setting = user_profile.get("goal_setting", {})
            target_amount = goal_setting.get("target_amount", 0)
            if target_amount > 0:
                analysis["achievement_timeline"] = _calculate_achievement_timeline(
                    target_amount, 
                    product["interest_rate"], 
                    recommended_amount
                )
    
    user_risk = user_profile.get("investment_personality", {}).get("risk_tolerance", 3)
    product_risk = _estimate_product_risk(product)
    analysis["risk_compatibility"] = _assess_risk_compatibility(user_risk, product_risk)
    
    user_age = user_profile.get("basic_info", {}).get("age")
    if user_age:
        analysis["age_appropriateness"] = _assess_age_appropriateness(product, int(user_age))
    
    return analysis

def _determine_personalization_level(user_profile: Dict[str, Any]) -> str:
    """개인화 수준 결정"""
    
    if not user_profile:
        return "none"
    
    completeness = user_profile.get("analytics", {}).get("profile_completeness", 0)
    
    if completeness >= 0.9:
        return "high"
    elif completeness >= 0.7:
        return "medium"
    elif completeness >= 0.4:
        return "low"
    else:
        return "basic"

def _generate_user_insights(user_profile: Dict[str, Any]) -> Dict[str, Any]:
    """사용자 인사이트 생성"""
    
    if not user_profile:
        return {}
    
    analytics = user_profile.get("analytics", {})
    personalization_factors = user_profile.get("personalization_factors", {})
    
    return {
        "age_group": analytics.get("age_group", "unknown"),
        "income_tier": analytics.get("income_tier", "unknown"),
        "risk_category": analytics.get("risk_category", "moderate"),
        "savings_capacity": analytics.get("savings_ratio", 0),
        "investment_readiness": personalization_factors.get("investment_readiness", "beginner"),
        "primary_goal": analytics.get("primary_goal_type", "savings"),
        "life_stage": personalization_factors.get("life_stage", "unknown"),
        "financial_stability": personalization_factors.get("financial_stability", "stable")
    }

def _generate_recommendation_reasoning(user_profile: Dict[str, Any], recommendations: List[Dict[str, Any]]) -> str:
    """추천 이유 생성"""
    
    if not user_profile or not recommendations:
        return "일반적인 금융상품 정보를 바탕으로 추천했습니다."
    
    reasoning_parts = []
    
    analytics = user_profile.get("analytics", {})
    age_group = analytics.get("age_group")
    risk_category = analytics.get("risk_category")
    income_tier = analytics.get("income_tier")
    primary_goal = analytics.get("primary_goal_type")
    
    if age_group == "young":
        reasoning_parts.append("젊은 연령대의 장기 자산 형성")
    elif age_group == "middle":
        reasoning_parts.append("중년층의 안정적 자산 증대")
    elif age_group == "senior":
        reasoning_parts.append("은퇴 준비를 위한 안전성 중심")
    
    if risk_category == "conservative":
        reasoning_parts.append("보수적 투자 성향에 맞는 저위험 상품")
    elif risk_category == "aggressive":
        reasoning_parts.append("적극적 투자 성향을 반영한 수익성 중심 상품")
    else:
        reasoning_parts.append("균형 잡힌 투자 성향에 따른 중간 위험도 상품")
    
    if income_tier == "high":
        reasoning_parts.append("높은 소득 수준을 활용한 고액 상품")
    elif income_tier == "low":
        reasoning_parts.append("소득 수준을 고려한 부담 없는 상품")
    
    if primary_goal == "house":
        reasoning_parts.append("주택 구입 목표에 맞는 적금 상품 중심")
    elif primary_goal == "marriage":
        reasoning_parts.append("결혼 자금 마련을 위한 단기 고수익 상품")
    elif primary_goal == "retirement":
        reasoning_parts.append("노후 대비 장기 안정성 상품 중심")
    
    if reasoning_parts:
        return f"귀하의 {', '.join(reasoning_parts)}을 고려하여 추천했습니다."
    else:
        return "종합적인 금융 상황을 분석하여 최적의 상품을 추천했습니다."

def _parse_income_value(income_str: Any) -> int:
    """소득 문자열을 숫자로 변환"""
    if not income_str:
        return 0
    
    if isinstance(income_str, (int, float)):
        return int(income_str)
    
    income_str = str(income_str).replace(',', '').replace('원', '').replace('만', '0000')
    
    try:
        return int(re.sub(r'[^0-9]', '', income_str))
    except (ValueError, TypeError):
        return 0

def _parse_income_range(income_string: str) -> int:
    """소득 범위 문자열을 숫자로 변환"""
    # 🔥 None 체크 추가
    if not income_string or income_string is None:
        return 3000000  # 기본값 300만원
    
    # "300-400만원" 형식에서 중간값 추출
    numbers = re.findall(r'\d+', str(income_string))
    if len(numbers) >= 2:
        min_income = int(numbers[0]) * 10000
        max_income = int(numbers[1]) * 10000
        return (min_income + max_income) // 2
    elif len(numbers) == 1:
        return int(numbers[0]) * 10000
    
    return 3000000  # 기본값 300만원

def _categorize_age_group(age: Any) -> str:
    """나이를 그룹으로 분류"""
    if not age:
        return "unknown"
    
    try:
        age_num = int(age)
        if age_num < 30:
            return "young"
        elif age_num < 50:
            return "middle"
        else:
            return "senior"
    except (ValueError, TypeError):
        return "unknown"

def _categorize_income_tier(monthly_income: int) -> str:
    """소득을 등급으로 분류"""
    if monthly_income >= 5000000:
        return "high"
    elif monthly_income >= 3000000:
        return "medium"
    elif monthly_income > 0:
        return "low"
    else:
        return "unknown"

def _categorize_risk_level(risk_level: int) -> str:
    """위험 수준 분류"""
    if risk_level <= 2:
        return "conservative"
    elif risk_level <= 4:
        return "moderate"
    else:
        return "aggressive"

def _calculate_savings_ratio(financial_status: Dict[str, Any]) -> float:
    """저축 비율 계산"""
    monthly_income = financial_status.get("monthly_income", 0)
    monthly_expense = financial_status.get("monthly_expense", 0)
    
    if monthly_income <= 0:
        return 0.0
    
    return max(0.0, min(1.0, (monthly_income - monthly_expense) / monthly_income))

def _calculate_investment_capacity(financial_status: Dict[str, Any]) -> int:
    """투자 가능 금액 계산"""
    monthly_income = financial_status.get("monthly_income", 0)
    monthly_expense = financial_status.get("monthly_expense", 0)
    
    surplus = monthly_income - monthly_expense
    return max(0, int(surplus * 0.7))

def _extract_primary_goal_type(goal_setting: Dict[str, Any]) -> str:
    """주요 목표 유형 추출"""
    if not goal_setting:
        return "savings"
    
    purpose = goal_setting.get("primary_goal", "").lower()
    
    if "주택" in purpose or "집" in purpose:
        return "house"
    elif "결혼" in purpose:
        return "marriage"
    elif "노후" in purpose or "은퇴" in purpose:
        return "retirement"
    elif "교육" in purpose or "학비" in purpose:
        return "education"
    else:
        return "savings"

def _calculate_profile_completeness(profile: Dict[str, Any]) -> float:
    """프로필 완성도 계산"""
    if not profile:
        return 0.0
    
    score = 0.0
    max_score = 100.0
    
    if profile.get("basic_info", {}).get("age"):
        score += 20
    if profile.get("basic_info", {}).get("occupation"):
        score += 15
    if profile.get("investment_personality", {}).get("risk_tolerance"):
        score += 25
    if profile.get("financial_situation", {}).get("monthly_income"):
        score += 25
    if profile.get("goal_setting"):
        score += 15
    
    return score / max_score

def _determine_life_stage(profile: Dict[str, Any]) -> str:
    """생애 단계 결정"""
    age = profile.get("basic_info", {}).get("age")
    marital_status = profile.get("basic_info", {}).get("marital_status")
    
    if not age:
        return "unknown"
    
    try:
        age_num = int(age)
        if age_num < 30:
            return "early_career"
        elif age_num < 40:
            return "career_building" if marital_status != "married" else "family_formation"
        elif age_num < 55:
            return "peak_earning"
        else:
            return "pre_retirement"
    except (ValueError, TypeError):
        return "unknown"

def _assess_financial_stability(profile: Dict[str, Any]) -> str:
    """재정 안정성 평가"""
    financial_status = profile.get("financial_situation", {})
    savings_ratio = _calculate_savings_ratio(financial_status)
    
    if savings_ratio >= 0.3:
        return "high"
    elif savings_ratio >= 0.1:
        return "stable"
    else:
        return "tight"

def _assess_investment_readiness(profile: Dict[str, Any]) -> str:
    """투자 준비도 평가"""
    investment_personality = profile.get("investment_personality", {})
    experience = investment_personality.get("investment_experience", "beginner")
    knowledge = investment_personality.get("investment_knowledge", "basic")
    
    if experience == "expert" and knowledge == "advanced":
        return "expert"
    elif experience in ["intermediate", "experienced"] or knowledge == "intermediate":
        return "intermediate"
    else:
        return "beginner"

def _assess_goal_urgency(profile: Dict[str, Any]) -> str:
    """목표 긴급도 평가"""
    goal_setting = profile.get("goal_setting", {})
    if not goal_setting:
        return "low"
    
    timeframe = goal_setting.get("timeframe", "").lower()
    if "단기" in timeframe or "1년" in timeframe:
        return "high"
    elif "중기" in timeframe or "3년" in timeframe:
        return "medium"
    else:
        return "low"

def _calculate_achievement_timeline(target_amount: int, interest_rate: float, monthly_amount: int) -> str:
    """목표 달성 기간 계산"""
    if monthly_amount <= 0:
        return "계산 불가"
    
    # 간단한 선형 계산 (복리 미고려)
    months = target_amount / monthly_amount
    years = months / 12
    return f"약 {years:.1f}년"

def _estimate_product_risk(product: Dict[str, Any]) -> int:
    """상품 위험도 추정"""
    product_type = product.get("type", "").lower()
    
    if "예금" in product_type:
        return 1
    elif "적금" in product_type:
        return 2
    elif "대출" in product_type:
        return 3
    else:
        return 3

def _assess_risk_compatibility(user_risk: int, product_risk: int) -> str:
    """위험도 호환성 평가"""
    diff = abs(user_risk - product_risk)
    
    if diff <= 1:
        return "매우 적합"
    elif diff <= 2:
        return "적합"
    else:
        return "주의 필요"

def _assess_age_appropriateness(product: Dict[str, Any], age: int) -> str:
    """연령 적합성 평가"""
    product_type = product.get("type", "").lower()
    
    if age < 30:
        if "적금" in product_type:
            return "매우 적합"
        else:
            return "적합"
    elif age < 50:
        return "적합"
    else:
        if "예금" in product_type:
            return "매우 적합"
        else:
            return "적합"

async def _generate_fallback_recommendations(query: str, products: List[Dict], limit: int) -> Dict[str, Any]:
    """폴백 추천 생성"""
    
    try:
        filtered_products = products[:limit]
        
        return {
            "success": True,
            "data": [
                {
                    "product_id": product.get('id'),
                    "name": product.get('name'),
                    "bank_name": product.get('bank_name'),
                    "type": product.get('type'),
                    "interest_rate": product.get('interest_rate'),
                    "conditions": product.get('conditions', []),
                    "features": product.get('features', []),
                    "ai_analysis": {
                        "suitability_score": 0.5,
                        "match_reasons": ["일반적인 상품 조건에 부합"],
                        "risk_assessment": "보통",
                        "expected_benefit": "기본적인 금융 혜택"
                    }
                }
                for product in filtered_products
            ],
            "personalization_level": "none",
            "user_insights": {},
            "recommendation_reasoning": "사용자 정보가 부족하여 일반적인 추천을 제공했습니다.",
            "ai_metadata": {
                "domain": "general",
                "total_products_analyzed": len(products),
                "user_profile_completeness": 0.0,
                "processing_time": 0
            }
        }
        
    except Exception as e:
        print(f"❌ 폴백 추천 생성 실패: {e}")
        return {
            "success": False,
            "data": [],
            "error": "추천을 생성할 수 없습니다."
        }