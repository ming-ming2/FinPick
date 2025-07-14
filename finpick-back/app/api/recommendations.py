# finpick-back/app/api/recommendations.py

from fastapi import APIRouter, Depends, HTTPException, status
from typing import Any, Dict, List, Optional
import json
from datetime import datetime
import re # Import re for _parse_income_range

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
    """자연어 쿼리 처리 - 사용자 정보 연동"""
    
    try:
        # 요청 데이터 파싱
        natural_query = request_data.get("query", "").strip()
        user_profile = request_data.get("user_profile", {})
        filters = request_data.get("filters", {})
        limit = request_data.get("limit", 5)
        
        # 🔥 사용자 정보 로깅
        print(f"👤 사용자 ID: {current_user.uid}")
        print(f"📝 받은 user_profile: {user_profile}")
        print(f"🎯 자연어 쿼리: {natural_query}")
        
        if not natural_query:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="쿼리가 비어있습니다."
            )
        
        # 사용자 ID 추출
        user_id_str = current_user.uid if hasattr(current_user, 'uid') else str(current_user)
        
        # 🔥 사용자 프로필 정보를 표준 형식으로 변환
        standardized_profile = _standardize_user_profile(user_profile)
        print(f"🔄 표준화된 프로필: {standardized_profile}")
        
        # 추천 서비스 초기화
        service = RecommendationService()
        gemini_service = GeminiService()
        
        # 도메인 분류
        domain = await gemini_service.classify_financial_domain(natural_query)
        print(f"📊 분류된 도메인: {domain}")
        
        # 데이터셋 준비
        available_products = service.financial_products
        dataset = gemini_service.prepare_domain_dataset(available_products, domain)
        print(f"📦 준비된 데이터셋: {len(dataset['products'])}개 상품")
        
        # 🔥 사용자 정보를 포함한 AI 추천
        ai_result = await gemini_service.recommend_financial_model(
            user_query=natural_query,
            user_profile=standardized_profile,  # 🔥 표준화된 프로필 전달
            available_products=available_products,
            limit=limit
        )
        
        if ai_result.get("success"):
            print("✅ 사용자 맞춤 금융모델 추천 성공")
            
            # 추천 결과 변환
            recommended_products = []
            
            for product_data in ai_result.get("recommended_products", []):
                original_product = product_data.get("original_product")
                if original_product:
                    product_response = {
                        "product_id": original_product.get('id'),
                        "product_name": original_product.get('name'),
                        "product_type": original_product.get('type'),
                        "provider_name": original_product.get('provider', {}).get('name'),
                        # 🔥 사용자 신용등급 기반 금리 계산
                        "interest_rate": _extract_interest_rate_with_user_profile(
                            original_product,  
                            standardized_profile
                        ),
                        "minimum_amount": original_product.get('details', {}).get('minimum_amount', 0),
                        "maximum_amount": original_product.get('details', {}).get('maximum_amount', 0),
                        "subscription_period": original_product.get('details', {}).get('subscription_period', ''),
                        "maturity_period": original_product.get('details', {}).get('maturity_period', ''),
                        "join_conditions": original_product.get('conditions', {}).get('join_member', ''),
                        "join_ways": original_product.get('conditions', {}).get('join_way', []),
                        "special_benefits": original_product.get('benefits', []),
                        "ai_analysis": {
                            "model_fit_score": product_data.get('match_score', 75),
                            "role_in_model": product_data.get('ai_analysis', {}).get('role_in_model', '추천'),
                            "match_reasons": product_data.get('ai_analysis', {}).get('match_reasons', ['AI 분석 완료']),
                            "contribution": product_data.get('ai_analysis', {}).get('contribution', 'AI 추천'),
                            "user_specific_note": _generate_user_specific_note(original_product, standardized_profile)
                        },
                        "match_score": product_data.get('match_score', 75),
                        "recommendation_reason": product_data.get('ai_analysis', {}).get('contribution', 'AI 추천 상품')
                    }
                    recommended_products.append(product_response)
            
            # 응답 구성
            response_data = {
                "success": True,
                "recommendation_type": "user_personalized",
                "user_query": natural_query,
                "user_profile_used": True,
                "classified_domain": domain,
                "recommendations": recommended_products,
                "ai_insights": ai_result.get("ai_insights", {}),
                "portfolio_analysis": ai_result.get("portfolio_analysis", ""),
                "metadata": {
                    "user_id": user_id_str,
                    "domain": domain,
                    "dataset_size": len(dataset['products']),
                    "personalization_applied": True,
                    "timestamp": datetime.now().isoformat()
                }
            }
            
            return {"success": True, "data": response_data}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="AI 추천 생성에 실패했습니다."
            )
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 추천 처리 실패: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"내부 오류: {str(e)}"
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


def _standardize_user_profile(user_profile: Dict) -> Dict:
    """프론트엔드 사용자 프로필을 백엔드 표준 형식으로 변환"""
    
    # 기본 구조 생성
    standardized = {
        "basic_info": {},
        "financial_situation": {},
        "investment_personality": {},
        "goal_setting": {}
    }
    
    # 재무 상황 매핑
    if "financialStatus" in user_profile:
        financial = user_profile["financialStatus"]
        standardized["financial_situation"] = {
            "monthly_income": _parse_income_range(financial.get("monthlyIncome")),
            "monthly_expense": financial.get("monthlyExpense", 0),
            "debt_amount": financial.get("debt", 0),
            "assets_amount": financial.get("assets", 0),
            "credit_score": financial.get("creditScore", 650)  # 기본값 650
        }
    
    # 기본 정보 매핑
    if "basicInfo" in user_profile:
        basic = user_profile["basicInfo"]
        standardized["basic_info"] = {
            "age": basic.get("age"),
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

def _parse_income_range(income_string: str) -> int:
    """소득 범위 문자열을 숫자로 변환"""
    if not income_string:
        return 0
    
    # "300-400만원" 형식에서 중간값 추출
    numbers = re.findall(r'\d+', income_string)
    if len(numbers) >= 2:
        min_income = int(numbers[0]) * 10000
        max_income = int(numbers[1]) * 10000
        return (min_income + max_income) // 2
    elif len(numbers) == 1:
        return int(numbers[0]) * 10000
    
    return 0

def _extract_interest_rate_with_user_profile(product: Dict, user_profile: Dict) -> float:
    """사용자 프로필을 고려한 금리 추출"""
    try:
        product_type = product.get('type', '').lower()
        
        print(f"🔍 사용자 맞춤 금리 계산: {product.get('name', 'Unknown')} ({product_type})")
        
        # 🏠 주택담보대출: 실제 데이터 사용
        if '주택담보대출' in product_type or '모기지' in product.get('name', '').lower():
            # 실제 금리 데이터 사용 (기존 로직)
            details_rate = product.get('details', {}).get('interest_rate', 0)
            if details_rate > 0:
                print(f"    ✅ 주택담보대출 실제 금리: {details_rate}%")
                return round(details_rate, 2)
            
            rates = product.get('rates', [])
            if rates and len(rates) > 0:
                for rate_info in rates:
                    avg_rate = rate_info.get('avg_rate', 0)
                    if avg_rate > 0:
                        print(f"    ✅ 주택담보대출 평균 금리: {avg_rate}%")
                        return round(avg_rate, 2)
        
        # 💳 신용대출: 사용자 신용등급 기반 계산
        elif '신용대출' in product_type:
            calculated_rate = _calculate_personalized_credit_rate(product, user_profile)
            print(f"    🧮 신용대출 맞춤 금리: {calculated_rate}%")
            return calculated_rate
        
        # 💰 예금/적금: 실제 데이터 사용
        else:
            details_rate = product.get('details', {}).get('interest_rate', 0)
            if details_rate > 0:
                print(f"    ✅ 예금/적금 실제 금리: {details_rate}%")
                return round(details_rate, 2)
            
            rates = product.get('rates', [])
            if rates and len(rates) > 0:
                first_rate = rates[0]
                base_rate = first_rate.get('base_rate', 0)
                max_rate = first_rate.get('max_rate', 0)
                final_rate = base_rate if base_rate > 0 else max_rate
                if final_rate > 0:
                    print(f"    ✅ 예금/적금 rates 금리: {final_rate}%")
                    return round(final_rate, 2)
        
        print(f"    ❌ 금리 정보 없음, 0% 반환")
        return 0.0
        
    except Exception as e:
        print(f"❌ 사용자 맞춤 금리 계산 실패: {e}")
        return 0.0

def _calculate_personalized_credit_rate(product: Dict, user_profile: Dict) -> float:
    """사용자별 맞춤 신용대출 금리 계산"""
    
    # 기준 금리
    base_rate = 3.5
    
    # 은행별 가산금리
    bank_name = product.get('provider', {}).get('name', '').lower()
    product_name = product.get('name', '').lower()
    
    major_banks = ['국민', '신한', '하나', '우리', 'nh농협', 'kb']
    digital_banks = ['토스', '카카오', '케이뱅크']
    
    if any(bank in bank_name for bank in major_banks):
        bank_margin = 0.0
    elif any(bank in bank_name for bank in digital_banks):
        bank_margin = -0.3
    else:
        bank_margin = 0.5
    
    # 상품별 가산금리
    product_margin = 0.0
    if '마이너스' in product_name:
        product_margin = 1.0
    elif '카드' in product_name:
        product_margin = 0.5
    
    # 🔥 사용자 신용등급별 가산금리
    financial_situation = user_profile.get('financial_situation', {})
    credit_score = financial_situation.get('credit_score', 650)
    
    print(f"    👤 사용자 신용점수: {credit_score}")
    
    if credit_score >= 900:      # 1등급
        credit_margin = 0.0
        grade = "1등급"
    elif credit_score >= 870:    # 2등급
        credit_margin = 0.5
        grade = "2등급"
    elif credit_score >= 840:    # 3등급
        credit_margin = 1.0
        grade = "3등급"
    elif credit_score >= 805:    # 4등급
        credit_margin = 1.8
        grade = "4등급"
    elif credit_score >= 750:    # 5등급
        credit_margin = 2.5
        grade = "5등급"
    elif credit_score >= 665:    # 6등급
        credit_margin = 3.5
        grade = "6등급"
    elif credit_score >= 600:    # 7등급
        credit_margin = 4.8
        grade = "7등급"
    elif credit_score >= 515:    # 8등급
        credit_margin = 6.2
        grade = "8등급"
    elif credit_score >= 445:    # 9등급
        credit_margin = 8.0
        grade = "9등급"
    else:                        # 10등급
        credit_margin = 10.0
        grade = "10등급"
    
    # 소득별 우대금리
    monthly_income = financial_situation.get('monthly_income', 0)
    if monthly_income >= 8000000:
        income_discount = -0.5
        income_tier = "고소득"
    elif monthly_income >= 5000000:
        income_discount = -0.3
        income_tier = "중고소득"
    elif monthly_income >= 3000000:
        income_discount = -0.1
        income_tier = "중간소득"
    else:
        income_discount = 0.0
        income_tier = "일반소득"
    
    # 최종 금리 계산
    final_rate = base_rate + bank_margin + product_margin + credit_margin + income_discount
    final_rate = max(2.0, min(15.0, final_rate))  # 2~15% 범위 제한
    
    print(f"    📊 {grade}, {income_tier}: 기준{base_rate}% + 은행{bank_margin}% + 상품{product_margin}% + 신용{credit_margin}% + 소득{income_discount}% = {final_rate}%")
    
    return round(final_rate, 2)


def _generate_user_specific_note(product: Dict, user_profile: Dict) -> str:
    """사용자별 맞춤 노트 생성"""
    notes = []
    
    # 신용등급 기반 노트
    credit_score = user_profile.get("financial_situation", {}).get("credit_score", 650)
    if credit_score >= 870:
        notes.append("우수한 신용등급으로 최고 우대금리 적용 가능")
    elif credit_score >= 750:
        notes.append("양호한 신용등급으로 우대금리 혜택 가능")
    elif credit_score < 600:
        notes.append("신용등급 개선 후 재신청 권장")
    
    # 소득 수준 기반 노트
    monthly_income = user_profile.get("financial_situation", {}).get("monthly_income", 0)
    if monthly_income >= 5000000:
        notes.append("고소득자 우대 프로그램 대상")
    
    return "; ".join(notes) if notes else "표준 조건 적용"


def _get_base_interest_rate(product: Dict) -> float:
    """상품에서 실제 금리 추출 - 디버깅 강화"""
    try:
        print(f"🔍 금리 추출 디버깅: {product.get('name', 'Unknown')}")
        print(f"    - details: {product.get('details', {})}")
        print(f"    - rates: {product.get('rates', [])}")
        
        # 1순위: details.interest_rate가 0이 아닌 경우
        details_rate = product.get('details', {}).get('interest_rate', 0)
        print(f"    - details.interest_rate: {details_rate}")
        if details_rate > 0:
            print(f"    ✅ details에서 금리 발견: {details_rate}%")
            return details_rate
        
        # 2순위: rates 배열에서 첫 번째 금리 사용
        rates = product.get('rates', [])
        print(f"    - rates 배열 길이: {len(rates)}")
        if rates and len(rates) > 0:
            first_rate = rates[0]
            print(f"    - 첫 번째 rate: {first_rate}")
            base_rate = first_rate.get('base_rate', 0)
            max_rate = first_rate.get('max_rate', 0)
            print(f"    - base_rate: {base_rate}, max_rate: {max_rate}")
            
            final_rate = base_rate if base_rate > 0 else max_rate
            if final_rate > 0:
                print(f"    ✅ rates에서 금리 발견: {final_rate}%")
                return final_rate
        
        # 3순위: details.max_interest_rate
        max_interest_rate = product.get('details', {}).get('max_interest_rate', 0)
        print(f"    - max_interest_rate: {max_interest_rate}")
        if max_interest_rate > 0:
            print(f"    ✅ max_interest_rate에서 금리 발견: {max_interest_rate}%")
            return max_interest_rate
        
        # 4순위: 대출상품 특별 처리 - 임시 금리
        product_type = product.get('type', '').lower()
        if '대출' in product_type:
            default_rate = 4.5  # 대출 기본 금리
            print(f"    ⚠️ 대출상품 기본 금리 적용: {default_rate}%")
            return default_rate
            
        # 마지막: 기본값 0
        print(f"    ❌ 금리를 찾을 수 없음, 0% 반환")
        return 0.0
        
    except Exception as e:
        print(f"❌ 금리 추출 실패: {e}")
        return 0.0
