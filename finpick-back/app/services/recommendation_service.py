# finpick-back/app/services/recommendation_service.py
import json
import os
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
import uuid
import re # re 모듈 추가

from app.models.recommendation import (
    UserProfile,
    RecommendationRequest,
    RecommendationResponse,
    ProductRecommendation,
    ProductType, # ProductType 임포트
    NaturalLanguageResult,
    UserInsights,
    FeedbackData
)
from app.services.gemini_service import GeminiService

class RecommendationService:
    def __init__(self):
        self.financial_products = self._load_financial_products()

        try:
            self.gemini_service = GeminiService()
            self.use_ai = True
            print("✅ Gemini AI 서비스 연결됨")
        except Exception as e:
            self.gemini_service = None
            self.use_ai = False
            print(f"⚠️ Gemini AI 연결 실패: {e}. 규칙 기반으로 처리됩니다.")

    def _load_financial_products(self) -> List[Dict]:
        """금융상품 데이터 로드 (금감원 API 데이터)"""
        try:
            file_path = os.path.join(os.path.dirname(__file__), "../../financial_products.json")

            with open(file_path, 'r', encoding='utf-8') as f:
                raw_data = json.load(f)

            if isinstance(raw_data, dict):
                all_products = []
                for category, products in raw_data.items():
                    if isinstance(products, list):
                        all_products.extend(products)

                print(f"✅ 금융상품 {len(all_products)}개 로드 완료")
                return all_products
            elif isinstance(raw_data, list):
                print(f"✅ 금융상품 {len(raw_data)}개 로드 완료")
                return raw_data
            else:
                print(f"❌ 예상과 다른 데이터 형식: {type(raw_data)}")
                return []
        except Exception as e:
            print(f"❌ 금융상품 데이터 로드 실패: {e}")
            return []

    async def generate_recommendations(self, request: RecommendationRequest) -> RecommendationResponse:
        try:
            print(f"🎯 사용자 {request.user_id}의 추천 요청 처리 시작...")
            print(f"📝 자연어 입력: {request.natural_query}")

            user_profile_dict = self._prepare_user_profile(request.user_profile) if request.user_profile else None

            if self.use_ai and self.gemini_service:
                print("🚀 Gemini AI로 처리 중...")

                ai_result = await self.gemini_service.recommend_products(
                    user_query=request.natural_query,
                    user_profile=user_profile_dict,
                    available_products=self.financial_products,
                    limit=request.limit
                )

                if ai_result.get("success"):
                    recommendations = self._convert_ai_recommendations(ai_result["ai_recommendations"])

                    response = RecommendationResponse(
                        request_id=str(uuid.uuid4()),
                        user_id=request.user_id,
                        recommendations=recommendations,
                        total_count=len(recommendations),
                        filters_applied=request.filters,
                        processing_time=0.0,
                        timestamp=datetime.now(timezone.utc),
                        success=True,
                        ai_insights={
                            "method": "Gemini AI 종합 분석",
                            "confidence": ai_result.get("confidence_score", 0.8),
                            "user_analysis": ai_result.get("user_analysis", {}),
                            "overall_analysis": ai_result.get("overall_analysis", ""),
                            "investment_advice": ai_result.get("investment_advice", ""),
                            "products_analyzed": len(self.financial_products)
                        }
                    )

                    print(f"✅ AI 추천 완료: {len(recommendations)}개 상품")
                    return response
                else:
                    print("⚠️ AI 추천 실패, 규칙 기반으로 폴백")
                    return await self._fallback_recommendations(request)
            else:
                print("📊 규칙 기반 추천으로 처리")
                return await self._fallback_recommendations(request)

        except Exception as e:
            print(f"❌ 추천 생성 실패: {e}")
            return RecommendationResponse(
                request_id=str(uuid.uuid4()),
                user_id=request.user_id,
                recommendations=[],
                total_count=0,
                filters_applied=request.filters,
                processing_time=0.0,
                timestamp=datetime.now(timezone.utc),
                success=False,
                error=str(e)
            )

    def _prepare_user_profile(self, profile: UserProfile) -> Dict[str, Any]:
        """사용자 프로필을 AI가 이해할 수 있는 형태로 변환"""
        return {
            "age": profile.basic_info.age,
            "occupation": profile.basic_info.occupation,
            "region": profile.basic_info.residence, # residence로 변경
            "monthly_income": profile.financial_situation.monthly_income,
            "monthly_expense": profile.financial_situation.monthly_expense,
            "investment_experience": profile.investment_personality.investment_experience,
            "risk_tolerance": profile.investment_personality.risk_tolerance,
            "primary_goal": profile.goal_setting.primary_goal,
            "target_amount": profile.goal_setting.target_amount,
            "target_period": profile.goal_setting.timeframe, # timeframe으로 변경
            "monthly_budget": profile.goal_setting.monthly_budget
        }

    def _convert_ai_recommendations(self, ai_recommendations: List[Dict]) -> List[ProductRecommendation]:
        """AI 추천 결과를 ProductRecommendation 모델로 변환"""
        converted = []

        for idx, ai_rec in enumerate(ai_recommendations):
            original_product = ai_rec.get("original_product", {})

            # 상품 타입 매핑 (ProductType.normalize 사용)
            product_type = ProductType.normalize(original_product.get("type", ""))

            recommendation = ProductRecommendation(
                product_id=original_product.get('id', str(uuid.uuid4())), # 'id' 대신 'product_id' 사용
                name=ai_rec.get("product_name", ""),
                provider=original_product.get("provider", {}).get("name", ""),
                type=product_type, # 정규화된 ProductType 사용

                # 🔥 AI가 직접 계산한 점수 사용
                match_score=float(ai_rec.get("ai_score", 0)),

                interest_rate=original_product.get("details", {}).get("interest_rate", 0),
                minimum_amount=original_product.get("details", {}).get("minimum_amount", 0),
                maximum_amount=original_product.get("details", {}).get("maximum_amount", None),
                available_periods=original_product.get("details", {}).get("available_periods", []), # 예시 필드

                # 🔥 AI가 생성한 추천 이유
                recommendation_reason=ai_rec.get("match_reason", "AI 추천"),

                # 🔥 AI가 분석한 장단점
                pros=ai_rec.get("pros", ["AI 분석 완료"]),
                cons=ai_rec.get("cons", ["상세 조건 확인 필요"]),

                join_conditions={
                    "join_way": original_product.get("conditions", {}).get("join_way", []),
                    "join_member": original_product.get("conditions", {}).get("join_member", ""),
                    "special_conditions": original_product.get("conditions", {}).get("special_conditions", "")
                },

                special_benefits=original_product.get("benefits", []),

                # AI 특화 필드들
                ai_analysis={
                    "risk_assessment": ai_rec.get("risk_assessment", "보통"),
                    "expected_return": ai_rec.get("expected_return", ""),
                    "priority": ai_rec.get("recommendation_priority", idx + 1),
                    "ai_confidence": ai_rec.get("ai_score", 0) / 100,
                    "analysis_method": "Gemini AI 개별 분석"
                }
            )
            converted.append(recommendation)

        return converted

    def _map_product_type(self, type_str: str) -> ProductType:
        """상품 타입 문자열을 ProductType enum으로 매핑"""
        # 이 함수는 ProductType.normalize로 대체될 수 있습니다.
        # 여기서는 기존 코드와의 호환성을 위해 유지합니다.
        type_mapping = {
            "정기예금": ProductType.DEPOSIT,
            "예금": ProductType.DEPOSIT,
            "적금": ProductType.SAVINGS,
            "신용대출": ProductType.CREDIT_LOAN,
            "대출": ProductType.CREDIT_LOAN,
            "주택담보대출": ProductType.MORTGAGE_LOAN,
            "투자상품": ProductType.INVESTMENT,
            "펀드": ProductType.FUND,
            "ETF": ProductType.ETF,
        }

        for key, product_type in type_mapping.items():
            if key in type_str:
                return product_type

        return ProductType.DEPOSIT  # 기본값

    async def _fallback_recommendations(self, request: RecommendationRequest) -> RecommendationResponse:
        """AI 실패 시 규칙 기반 폴백 추천"""
        print("📊 규칙 기반 폴백 추천 실행")

        # 간단한 규칙 기반 추천 로직
        # request.filters를 사용하여 필터링 로직 개선
        filtered_products = self._apply_basic_filters(request.filters)
        scored_products = []

        for product in filtered_products[:request.limit * 2]:
            score = self._calculate_basic_score(product, request.user_profile)

            if score > 50:  # 최소 점수 이상만
                recommendation = self._create_basic_recommendation(product, score)
                scored_products.append(recommendation)

        # 점수순 정렬 후 제한
        scored_products.sort(key=lambda x: x.match_score, reverse=True)
        final_recommendations = scored_products[:request.limit]

        return RecommendationResponse(
            request_id=str(uuid.uuid4()),
            user_id=request.user_id,
            recommendations=final_recommendations,
            total_count=len(final_recommendations),
            filters_applied=request.filters,
            processing_time=0.1,
            timestamp=datetime.now(timezone.utc),
            success=True,
            ai_insights={
                "method": "규칙 기반 분석 (AI 폴백)",
                "confidence": 0.6,
                "note": "AI 엔진 연결 실패로 규칙 기반 처리"
            }
        )

    def _apply_basic_filters(self, filters: Dict) -> List[Dict]:
        """기본 필터 적용"""
        filtered = self.financial_products

        # 투자 목적 필터
        if filters.get('investment_purpose'):
            # "투자_수익" 또는 "안전한_저축"에 따라 필터링
            purpose = filters['investment_purpose']
            if purpose == "투자_수익":
                filtered = [p for p in filtered if ProductType.normalize(p.get('type', '')) in [ProductType.INVESTMENT, ProductType.FUND, ProductType.ETF]]
            elif purpose == "안전한_저축":
                filtered = [p for p in filtered if ProductType.normalize(p.get('type', '')) in [ProductType.DEPOSIT, ProductType.SAVINGS]]


        # 금액 필터
        amount_filter = filters.get('amount', {})
        if amount_filter.get('minimum_amount') is not None:
            min_amount = amount_filter['minimum_amount']
            # 대출 상품의 경우, minimum_amount가 대출 한도를 의미할 수 있으므로,
            # 사용자가 원하는 금액보다 대출 상품의 최소 금액이 작거나 같은 경우를 고려
            filtered = [p for p in filtered
                       if p.get('details', {}).get('minimum_amount', 0) <= min_amount or ProductType.normalize(p.get('type', '')) in [ProductType.LOAN, ProductType.CREDIT_LOAN, ProductType.MORTGAGE_LOAN]]

        # 상품 타입 필터
        if filters.get('product_types'):
            product_types_str = filters['product_types'] # 문자열 리스트
            product_types_enum = [ProductType.normalize(pt) for pt in product_types_str] # Enum으로 변환

            filtered = [p for p in filtered
                       if ProductType.normalize(p.get('type', '')) in product_types_enum]

        return filtered

    def _calculate_basic_score(self, product: Dict, profile: Optional[UserProfile]) -> float:
        """기본 점수 계산"""
        score = 50.0  # 기본 점수

        # 금리 점수
        rate = product.get('details', {}).get('interest_rate', 0)
        if rate >= 4.0:
            score += 30
        elif rate >= 3.0:
            score += 20
        elif rate >= 2.0:
            score += 10

        # 프로필 매칭 점수
        if profile:
            # 위험 성향 매칭
            risk_tolerance = profile.investment_personality.risk_tolerance
            product_type = ProductType.normalize(product.get('type', '')) # 정규화된 ProductType 사용

            if risk_tolerance == "안전추구형":
                if product_type in [ProductType.DEPOSIT, ProductType.SAVINGS]:
                    score += 20
            elif risk_tolerance == "수익추구형":
                if product_type in [ProductType.INVESTMENT, ProductType.FUND, ProductType.ETF]:
                    score += 20

            # 목표 금액 매칭
            target_amount = profile.goal_setting.target_amount
            min_amount = product.get('details', {}).get('minimum_amount', 0)
            max_amount = product.get('details', {}).get('maximum_amount', float('inf'))

            if min_amount <= target_amount <= max_amount:
                score += 15

        return min(100.0, score)

    def _create_basic_recommendation(self, product: Dict, score: float) -> ProductRecommendation:
        """기본 추천 객체 생성"""
        product_type = ProductType.normalize(product.get("type", "")) # 정규화된 ProductType 사용

        return ProductRecommendation(
            product_id=product.get('id', str(uuid.uuid4())), # 'id' 대신 'product_id' 사용
            name=product.get('name', ''),
            provider=product.get('provider', {}).get('name', ''),
            type=product_type,
            match_score=score,
            interest_rate=product.get('details', {}).get('interest_rate', 0),
            minimum_amount=product.get('details', {}).get('minimum_amount', 0),
            maximum_amount=product.get('details', {}).get('maximum_amount', None),
            available_periods=product.get('details', {}).get('available_periods', []),
            recommendation_reason=f"규칙 기반 매칭 (점수: {score:.1f})",
            pros=["기본 조건 만족", "안정적인 금융기관"],
            cons=["AI 분석 미적용", "개인화 부족"],
            join_conditions={
                "join_way": product.get('conditions', {}).get('join_way', []),
                "join_member": product.get('conditions', {}).get('join_member', ''),
                "special_conditions": product.get('conditions', {}).get('special_conditions', '')
            },
            special_benefits=product.get('benefits', [])
        )


    @staticmethod
    async def process_natural_language(user_id: str, query: str) -> NaturalLanguageResult:
        """AI 엔진 기반 자연어 처리 - 완전히 안전한 버전"""
        try:
            service = RecommendationService()

            if service.use_ai and service.gemini_service:
                print(f"🤖 Gemini AI로 자연어 분석: {query}")

                try:
                    ai_analysis = await service.gemini_service._analyze_user_requirements(query, None)
                    print(f"📊 AI 분석 원본 결과: {ai_analysis}")

                    # 안전한 변환 함수들
                    def safe_int_convert(value, default=5):
                        if value is None:
                            return default
                        if isinstance(value, (int, float)):
                            return int(value)
                        if isinstance(value, str):
                            numbers = re.findall(r'\d+', value)
                            if numbers:
                                return int(numbers[0])
                        return default

                    def safe_float_convert(value, default=0.8):
                        if value is None:
                            return default
                        if isinstance(value, (int, float)):
                            return float(value)
                        if isinstance(value, str):
                            numbers = re.findall(r'\d+\.?\d*', value)
                            if numbers:
                                return float(numbers[0])
                        return default

                    # 먼저 모든 값을 안전하게 변환
                    risk_appetite_val = safe_int_convert(ai_analysis.get("risk_appetite"), 5)
                    target_amount_val = safe_int_convert(ai_analysis.get("target_amount"), 0)
                    urgency_level_val = safe_int_convert(ai_analysis.get("urgency_level"), 5)
                    confidence_val = safe_float_convert(ai_analysis.get("analysis_confidence"), 0.8)
                    monthly_budget_val = None
                    if ai_analysis.get("monthly_budget"):
                        monthly_budget_val = safe_int_convert(ai_analysis.get("monthly_budget"), None)

                    print(f"✅ 안전 변환 완료: risk={risk_appetite_val}, target={target_amount_val}, confidence={confidence_val}")

                    # 상품 유형 결정
                    suggested_products = []

                    # 키워드 기반 상품 추천
                    # investment_goal이 None일 경우를 대비하여 빈 문자열로 처리
                    investment_goal_str = ai_analysis.get("investment_goal", "")
                    if investment_goal_str is None: # 명시적으로 None인 경우 빈 문자열로
                        investment_goal_str = ""

                    if any(keyword in investment_goal_str.lower() for keyword in ["대출", "빌리", "급전", "필요", "융통", "살려"]):
                        if ProductType.CREDIT_LOAN not in suggested_products:
                            suggested_products.append(ProductType.CREDIT_LOAN)

                    # product_preferences 확인
                    for pref in ai_analysis.get("product_preferences", []):
                        normalized_pref = ProductType.normalize(pref)
                        if normalized_pref not in suggested_products: # 중복 방지
                            suggested_products.append(normalized_pref)
                    
                    # AI가 아무것도 추천하지 않은 경우에만 기본값
                    if not suggested_products:
                        suggested_products.append(ProductType.DEPOSIT)

                    # 중복 제거 (다시 한번 확인)
                    suggested_products = list(set(suggested_products))

                    # 필터 조건 생성 (이제 모든 값이 안전함)
                    filters = {
                        "investment_purpose": "투자_수익" if risk_appetite_val > 6 else "안전한_저축",
                        "amount": {
                            "minimum_amount": target_amount_val,
                            "target_amount": target_amount_val,
                            "monthly_amount": monthly_budget_val
                        },
                        "investment_period": ai_analysis.get("investment_period", "중기"),
                        "risk_tolerance": "수익추구형" if risk_appetite_val > 6 else "안전추구형",
                        "product_types": [p.value for p in suggested_products], # ProductType enum 값을 문자열로 변환
                        "special_conditions": ai_analysis.get("special_requirements", []),
                        "confidence": confidence_val,
                        "reason": ai_analysis.get("investment_goal", "AI 분석 완료")
                    }

                    return NaturalLanguageResult(
                        success=True,
                        original_query=query,
                        parsed_conditions=filters,
                        suggested_products=suggested_products,
                        confidence_score=confidence_val,
                        processing_method="Gemini AI 자연어 분석",
                        extracted_entities={
                            "investment_goal": ai_analysis.get("investment_goal"),
                            "risk_level": risk_appetite_val,
                            "target_amount": target_amount_val,
                            "urgency": urgency_level_val
                        },
                        timestamp=datetime.now(timezone.utc)
                    )

                except Exception as e:
                    print(f"❌ AI 분석 처리 오류: {e}")
                    # 오류 시 폴백 처리 (static method로 호출)
                    return RecommendationService._fallback_natural_language(query) # service. -> RecommendationService.

            else:
                # AI 비활성화 시 폴백 처리 (static method로 호출)
                return RecommendationService._fallback_natural_language(query) # service. -> RecommendationService.

        except Exception as e:
            print(f"❌ 자연어 처리 최종 실패: {e}")
            # 최종 폴백 - 반드시 올바른 NaturalLanguageResult 반환
            return NaturalLanguageResult(
                success=False,
                original_query=query,
                parsed_conditions={},
                confidence_score=0.5,
                suggested_products=[ProductType.DEPOSIT],
                processing_method="오류 발생 - 기본값 반환",
                extracted_entities={},
                timestamp=datetime.now(timezone.utc),
                error=str(e)
            )
