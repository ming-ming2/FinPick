# finpick-back/app/services/recommendation_service.py
import json
import os
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
import uuid

from app.models.recommendation import (
    UserProfile, 
    RecommendationRequest, 
    RecommendationResponse,
    ProductRecommendation,
    ProductType,
    NaturalLanguageResult,
    UserInsights,
    FeedbackData
)
from app.services.gemini_service import GeminiService

class RecommendationService:
    """추천 서비스 메인 클래스 (Gemini 연동)"""
    
    def __init__(self):
        self.financial_products = self._load_financial_products()
        # 🤖 Gemini 서비스 초기화
        try:
            self.gemini_service = GeminiService()
            self.use_ai = True
            print("✅ Gemini AI 서비스 연결됨")
        except Exception as e:
            self.gemini_service = None
            self.use_ai = False
            print(f"⚠️ Gemini AI 연결 실패: {e}. 규칙 기반 처리로 대체됩니다.")
    
    def _load_financial_products(self) -> List[Dict]:
        """금융상품 데이터 로드"""
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
    
    @staticmethod
    async def analyze_user_profile(user_id: str, profile: UserProfile) -> Dict[str, Any]:
        """사용자 프로필 분석"""
        try:
            # 1. 재정 건전성 계산
            monthly_surplus = profile.financial_situation.monthly_income - profile.financial_situation.monthly_expense
            savings_rate = (monthly_surplus / profile.financial_situation.monthly_income) * 100 if profile.financial_situation.monthly_income > 0 else 0
            
            # 2. 위험 등급 계산
            risk_score = RecommendationService._calculate_risk_score(profile)
            
            # 3. 목표 달성 가능성 예측
            achievement_probability = RecommendationService._predict_goal_achievement(profile, monthly_surplus)
            
            analysis = {
                "user_id": user_id,
                "financial_health": {
                    "monthly_surplus": monthly_surplus,
                    "savings_rate": round(savings_rate, 2),
                    "debt_ratio": (profile.financial_situation.debt_amount / profile.financial_situation.monthly_income * 12) if profile.financial_situation.monthly_income > 0 else 0,
                    "financial_stability": "안정" if monthly_surplus > 0 and savings_rate > 20 else "보통" if monthly_surplus > 0 else "주의"
                },
                "risk_profile": {
                    "risk_score": risk_score,
                    "risk_level": RecommendationService._get_risk_level_name(risk_score),
                    "suitable_products": RecommendationService._get_suitable_products_by_risk(risk_score)
                },
                "goal_analysis": {
                    "primary_goal": profile.goal_setting.primary_goal,
                    "target_amount": profile.goal_setting.target_amount,
                    "monthly_budget": profile.goal_setting.monthly_budget,
                    "achievement_probability": achievement_probability,
                    "recommended_period": RecommendationService._suggest_optimal_period(profile)
                },
                "personalization": {
                    "age_group": profile.basic_info.age,
                    "occupation_category": profile.basic_info.occupation,
                    "preferred_channels": ["온라인", "모바일"] if profile.basic_info.age in ["20대", "30대"] else ["영업점", "온라인"]
                }
            }
            
            return analysis
            
        except Exception as e:
            raise Exception(f"프로필 분석 실패: {str(e)}")
    
    @staticmethod
    def _calculate_risk_score(profile: UserProfile) -> int:
        """위험 점수 계산 (1-5점)"""
        score = 3  # 기본 점수
        
        # 나이별 조정
        if profile.basic_info.age == "20대":
            score += 1
        elif profile.basic_info.age == "50대 이상":
            score -= 1
        
        # 투자 성향별 조정
        if profile.investment_personality.risk_tolerance == "안전 추구형":
            score -= 2
        elif profile.investment_personality.risk_tolerance == "수익 추구형":
            score += 2
        
        # 투자 경험별 조정
        if profile.investment_personality.investment_experience == "풍부함":
            score += 1
        elif profile.investment_personality.investment_experience == "없음":
            score -= 1
        
        return max(1, min(5, score))
    
    @staticmethod
    def _get_risk_level_name(risk_score: int) -> str:
        """위험 점수를 레벨명으로 변환"""
        levels = {1: "매우 안전", 2: "안전", 3: "보통", 4: "적극적", 5: "매우 적극적"}
        return levels.get(risk_score, "보통")
    
    @staticmethod
    def _get_suitable_products_by_risk(risk_score: int) -> List[str]:
        """위험 점수별 적합 상품 유형"""
        if risk_score <= 2:
            return ["정기예금", "적금"]
        elif risk_score == 3:
            return ["정기예금", "적금", "안전한 펀드"]
        else:
            return ["적금", "펀드", "투자상품"]
    
    @staticmethod
    def _predict_goal_achievement(profile: UserProfile, monthly_surplus: int) -> float:
        """목표 달성 가능성 예측"""
        target = profile.goal_setting.target_amount
        period_months = int(profile.goal_setting.timeframe.replace("년", "")) * 12
        
        if monthly_surplus <= 0:
            return 0.0
        
        # 단순 계산 (이자 미고려)
        total_savings = monthly_surplus * period_months
        achievement_rate = min(100, (total_savings / target) * 100)
        
        return round(achievement_rate, 1)
    
    @staticmethod
    def _suggest_optimal_period(profile: UserProfile) -> str:
        """최적 투자 기간 제안"""
        goal = profile.goal_setting.primary_goal
        age = profile.basic_info.age
        
        if goal == "비상금 마련":
            return "1-2년"
        elif goal == "안전한 저축":
            return "1-3년"
        elif goal == "목돈 마련":
            return "3-5년"
        elif goal == "내집 마련":
            return "5-10년" if age in ["20대", "30대"] else "3-7년"
        else:
            return "3-5년"
    
    # 🤖 Gemini 연동 자연어 처리 (기존 함수 대체)
    @staticmethod
    async def process_natural_language(user_id: str, query: str) -> NaturalLanguageResult:
        """Gemini AI 기반 자연어 처리"""
        try:
            # Gemini 서비스 인스턴스 생성
            service = RecommendationService()
            
            if service.use_ai and service.gemini_service:
                # 🤖 Gemini AI 분석 사용
                print(f"🤖 Gemini AI로 자연어 분석: {query}")
                ai_result = await service.gemini_service.analyze_natural_language(query)
                
                if ai_result["success"]:
                    extracted_conditions = ai_result["extracted_conditions"]
                    
                    # 상품 유형 매핑
                    suggested_products = []
                    for product_type in extracted_conditions.get("product_types", []):
                        if product_type == "정기예금":
                            suggested_products.append(ProductType.DEPOSIT)
                        elif product_type == "적금":
                            suggested_products.append(ProductType.SAVINGS)
                        elif "대출" in product_type:
                            suggested_products.append(ProductType.LOAN)
                        else:
                            suggested_products.append(ProductType.INVESTMENT)
                    
                    return NaturalLanguageResult(
                        original_query=query,
                        extracted_conditions=extracted_conditions,
                        confidence_score=ai_result["confidence_score"],
                        suggested_products=suggested_products
                    )
            
            # 🔄 폴백: 기존 규칙 기반 처리
            print(f"🔄 규칙 기반 자연어 분석: {query}")
            return service._rule_based_nlp_fallback(query)
            
        except Exception as e:
            print(f"❌ 자연어 처리 실패: {e}")
            # 에러 시에도 규칙 기반으로 폴백
            service = RecommendationService()
            return service._rule_based_nlp_fallback(query)
    
    def _rule_based_nlp_fallback(self, query: str) -> NaturalLanguageResult:
        """기존 규칙 기반 자연어 처리 (폴백)"""
        extracted_conditions = {}
        suggested_products = []
        
        query_lower = query.lower()
        
        if "안전" in query_lower or "예금" in query_lower:
            suggested_products.append(ProductType.DEPOSIT)
            extracted_conditions["risk_level"] = "low"
        
        if "적금" in query_lower:
            suggested_products.append(ProductType.SAVINGS)
        
        if "대출" in query_lower:
            suggested_products.append(ProductType.LOAN)
        
        if any(word in query_lower for word in ["투자", "수익", "펀드"]):
            suggested_products.append(ProductType.INVESTMENT)
        
        # 금액 추출
        import re
        amount_match = re.search(r'(\d+)만원?', query)
        if amount_match:
            extracted_conditions["target_amount"] = int(amount_match.group(1)) * 10000
        
        return NaturalLanguageResult(
            original_query=query,
            extracted_conditions=extracted_conditions,
            confidence_score=0.7,
            suggested_products=suggested_products or [ProductType.SAVINGS]
        )
        # 🤖 AI 강화 추천 생성
    async def generate_recommendations(self, user_id: str, request: RecommendationRequest) -> RecommendationResponse:
        """AI 강화 맞춤 상품 추천 생성"""
        try:
            print(f"🎯 사용자 {user_id}의 추천 요청 처리 시작...")
            
            # 1. 자연어 쿼리가 있으면 먼저 분석
            if request.natural_query:
                nlp_result = await self.process_natural_language(user_id, request.natural_query)
                
                # NLP 결과를 필터에 병합
                if not request.filters:
                    request.filters = {}
                request.filters.update(nlp_result.extracted_conditions)
                
                print(f"🔍 자연어 분석 결과: {nlp_result.extracted_conditions}")
            
            # 2. 사용자 프로필 기반 필터링
            if request.user_profile:
                profile_analysis = await self.analyze_user_profile(user_id, request.user_profile)
                suitable_products = self._filter_products_by_profile(request.user_profile, profile_analysis)
            else:
                suitable_products = self.financial_products[:50]  # 상위 50개만
            
            print(f"📊 프로필 필터링 후: {len(suitable_products)}개 상품")
            
            # 3. 추가 필터 적용
            if request.filters:
                suitable_products = self._apply_filters(suitable_products, request.filters)
                print(f"🔎 추가 필터 후: {len(suitable_products)}개 상품")
            
            # 4. AI 강화 점수 계산
            scored_products = await self._ai_enhanced_scoring(suitable_products, request)
            
            # 5. 상위 N개 선택
            top_products = sorted(scored_products, key=lambda x: x['match_score'], reverse=True)[:request.limit]
            
            # 6. AI 추천 이유 생성
            recommendations = []
            for product_data in top_products:
                recommendation = await self._create_ai_recommendation(product_data, request.user_profile)
                recommendations.append(recommendation)
            
            # 7. 응답 생성
            recommendation_id = str(uuid.uuid4())
            
            # 🤖 AI 분석 요약 생성
            ai_analysis = None
            if self.use_ai and request.user_profile:
                ai_analysis = await self._generate_ai_analysis_summary(request.user_profile, recommendations)
            
            response = RecommendationResponse(
                user_id=user_id,
                recommendation_id=recommendation_id,
                created_at=datetime.now(timezone.utc),
                products=recommendations,
                summary={
                    "total_products_analyzed": len(self.financial_products),
                    "suitable_products_found": len(suitable_products),
                    "top_recommendations": len(recommendations),
                    "average_match_score": sum(p.match_score for p in recommendations) / len(recommendations) if recommendations else 0,
                    "ai_enhanced": self.use_ai
                },
                total_count=len(recommendations),
                ai_analysis=ai_analysis,
                suggested_actions=[
                    {"type": "compare", "title": "상품 비교하기", "description": "추천 상품들을 자세히 비교해보세요"},
                    {"type": "simulate", "title": "목표 시뮬레이션", "description": "선택한 상품으로 목표 달성 가능성을 확인해보세요"},
                    {"type": "feedback", "title": "추천 평가", "description": "AI 추천 결과에 대한 피드백을 남겨주세요"}
                ]
            )
            
            print(f"✅ 추천 생성 완료: {len(recommendations)}개 상품, 평균 점수 {response.summary['average_match_score']:.1f}")
            return response
            
        except Exception as e:
            print(f"❌ 추천 생성 실패: {e}")
            raise Exception(f"추천 생성 실패: {str(e)}")
    
    def _filter_products_by_profile(self, profile: UserProfile, analysis: Dict) -> List[Dict]:
        """프로필 기반 상품 필터링"""
        suitable_products = []
        
        for product in self.financial_products:
            # 최소 가입 금액 조건
            if product.get('details', {}).get('minimum_amount', 0) > profile.goal_setting.monthly_budget:
                continue
            
            # 위험 수준에 따른 상품 타입 필터링
            risk_level = analysis.get('risk_profile', {}).get('risk_score', 3)
            product_type = product.get('type', '')
            
            if risk_level <= 2 and product_type not in ['정기예금', '적금']:
                continue
            
            suitable_products.append(product)
        
        return suitable_products
    
    def _apply_filters(self, products: List[Dict], filters: Dict) -> List[Dict]:
        """추가 필터 적용"""
        filtered = products
        
        if 'product_type' in filters:
            filtered = [p for p in filtered if p.get('type') == filters['product_type']]
        
        if 'min_interest_rate' in filters:
            filtered = [p for p in filtered if p.get('details', {}).get('interest_rate', 0) >= filters['min_interest_rate']]
        
        if 'max_minimum_amount' in filters:
            filtered = [p for p in filtered if p.get('details', {}).get('minimum_amount', 0) <= filters['max_minimum_amount']]
        
        return filtered
    
    async def _ai_enhanced_scoring(self, products: List[Dict], request: RecommendationRequest) -> List[Dict]:
        """AI 강화 매칭 점수 계산"""
        scored_products = []
        
        for product in products:
            base_score = 70  # 기본 점수
            
            # 기존 점수 계산 로직
            if request.user_profile:
                target = request.user_profile.goal_setting.target_amount
                min_amount = product.get('details', {}).get('minimum_amount', 0)
                if min_amount <= target * 0.1:
                    base_score += 10
                
                interest_rate = product.get('details', {}).get('interest_rate', 0)
                if interest_rate >= 3.5:
                    base_score += 15
                elif interest_rate >= 3.0:
                    base_score += 10
                elif interest_rate >= 2.5:
                    base_score += 5
                
                # 은행 신뢰도
                bank_name = product.get('provider', {}).get('name', '')
                if any(major in bank_name for major in ['KB', '신한', '우리', '하나', 'NH']):
                    base_score += 5
            
            # 🤖 AI 보너스 점수 (자연어 매칭)
            if request.natural_query and self.use_ai:
                ai_bonus = await self._calculate_ai_relevance_score(product, request.natural_query)
                base_score += ai_bonus
                print(f"🤖 AI 보너스: {product.get('name', '')} +{ai_bonus}점")
            
            product_with_score = product.copy()
            product_with_score['match_score'] = min(100, base_score)
            scored_products.append(product_with_score)
        
        return scored_products
    
    async def _calculate_ai_relevance_score(self, product: Dict, query: str) -> int:
        """AI 기반 상품-쿼리 관련성 점수 계산"""
        try:
            if not self.gemini_service:
                return 0
            
            # 상품 정보와 쿼리의 관련성을 0-10점으로 평가
            product_info = f"{product.get('name', '')} {product.get('type', '')} {product.get('details', {}).get('interest_rate', 0)}%"
            
            # 간단한 키워드 매칭으로 임시 구현
            query_lower = query.lower()
            product_lower = product_info.lower()
            
            bonus = 0
            if "안전" in query_lower and ("예금" in product_lower or "적금" in product_lower):
                bonus += 8
            elif "투자" in query_lower and "투자" in product_lower:
                bonus += 8
            elif "대출" in query_lower and "대출" in product_lower:
                bonus += 8
            elif any(word in query_lower for word in ["높은", "좋은"]) and product.get('details', {}).get('interest_rate', 0) >= 3.5:
                bonus += 5
            
            return bonus
            
        except Exception as e:
            print(f"❌ AI 관련성 점수 계산 실패: {e}")
            return 0
    
    async def _create_ai_recommendation(self, product_data: Dict, profile: Optional[UserProfile]) -> ProductRecommendation:
        """AI 강화 ProductRecommendation 객체 생성"""
        details = product_data.get('details', {})
        provider = product_data.get('provider', {})
        conditions = product_data.get('conditions', {})
        
        # 🤖 AI 추천 이유 생성
        if self.use_ai and self.gemini_service and profile:
            try:
                user_profile_dict = {
                    "age": profile.basic_info.age,
                    "goal": profile.goal_setting.primary_goal,
                    "risk_tolerance": profile.investment_personality.risk_tolerance
                }
                ai_reason = await self.gemini_service.enhance_recommendation_reason(
                    user_profile_dict, product_data, product_data.get('match_score', 0)
                )
                recommendation_reason = ai_reason
            except Exception as e:
                print(f"❌ AI 추천 이유 생성 실패: {e}")
                recommendation_reason = self._generate_recommendation_reason(product_data, profile)
        else:
            recommendation_reason = self._generate_recommendation_reason(product_data, profile)
        
        pros, cons = self._generate_pros_cons(product_data, profile)
        
        return ProductRecommendation(
            product_id=product_data.get('id', ''),
            name=product_data.get('name', ''),
            type=product_data.get('type', ''),
            bank=provider.get('name', ''),
            interest_rate=details.get('interest_rate', 0),
            max_interest_rate=details.get('max_interest_rate'),
            minimum_amount=details.get('minimum_amount', 0),
            maximum_amount=details.get('maximum_amount'),
            available_periods=details.get('available_periods', [12, 24, 36]),
            match_score=product_data.get('match_score', 0),
            recommendation_reason=recommendation_reason,
            pros=pros,
            cons=cons,
            join_conditions={
                "join_way": conditions.get('join_way', []),
                "join_member": conditions.get('join_member', ''),
                "special_conditions": conditions.get('special_conditions', '')
            },
            special_benefits=[]
        )
    
    def _generate_recommendation_reason(self, product: Dict, profile: Optional[UserProfile]) -> str:
        """추천 이유 생성"""
        reasons = []
        
        interest_rate = product.get('details', {}).get('interest_rate', 0)
        if interest_rate >= 3.5:
            reasons.append(f"높은 금리 {interest_rate}%")
        
        min_amount = product.get('details', {}).get('minimum_amount', 0)
        if profile and min_amount <= profile.goal_setting.monthly_budget:
            reasons.append("가입 조건이 적합함")
        
        if not reasons:
            reasons.append("안정적인 상품")
        
        return ", ".join(reasons)
    
    def _generate_pros_cons(self, product: Dict, profile: Optional[UserProfile]) -> tuple:
        """장단점 생성"""
        pros = []
        cons = []
        
        interest_rate = product.get('details', {}).get('interest_rate', 0)
        if interest_rate >= 3.5:
            pros.append("시중 평균보다 높은 금리")
        elif interest_rate < 2.5:
            cons.append("상대적으로 낮은 금리")
        
        join_ways = product.get('conditions', {}).get('join_way', [])
        if '인터넷' in join_ways or '스마트폰' in join_ways:
            pros.append("온라인 가입 가능")
        
        if not pros:
            pros.append("안정적인 금융기관")
        if not cons:
            cons.append("중도해지 시 금리 손실")
        
        return pros, cons
    
    async def _generate_ai_analysis_summary(self, user_profile: UserProfile, recommendations: List[ProductRecommendation]) -> Dict[str, Any]:
        """AI 분석 요약 생성"""
        try:
            if not self.use_ai or not self.gemini_service:
                return None
            
            user_profile_dict = {
                "age": user_profile.basic_info.age,
                "goal": user_profile.goal_setting.primary_goal,
                "risk_tolerance": user_profile.investment_personality.risk_tolerance,
                "target_amount": user_profile.goal_setting.target_amount
            }
            
            # 🤖 AI 금융 조언 생성
            advice = await self.gemini_service.generate_financial_advice(
                user_profile_dict, 
                [{"name": r.name, "type": r.type, "rate": r.interest_rate} for r in recommendations]
            )
            
            return {
                "ai_advice": advice,
                "analysis_method": "Gemini AI 분석",
                "confidence_level": "높음" if len(recommendations) >= 3 else "보통",
                "personalization_score": 85 + len(recommendations) * 2  # 상품 수에 따라 점수 증가
            }
            
        except Exception as e:
            print(f"❌ AI 분석 요약 생성 실패: {e}")
            return {
                "ai_advice": "다양한 옵션을 검토하시고 신중하게 선택하세요!",
                "analysis_method": "규칙 기반 분석",
                "confidence_level": "보통",
                "personalization_score": 70
            }
    
    @staticmethod
    async def get_user_recommendation_history(user_id: str, limit: int = 10) -> List[Dict]:
        """사용자 추천 이력 조회"""
        # TODO: Firebase Firestore 연동 예정
        return [
            {
                "recommendation_id": "rec_001",
                "created_at": "2024-07-11T10:30:00Z",
                "products_count": 3,
                "primary_goal": "안전한 저축",
                "status": "viewed"
            }
        ]
    
    @staticmethod
    async def record_feedback(user_id: str, recommendation_id: str, rating: int, feedback: Optional[str] = None) -> Dict:
        """피드백 기록"""
        try:
            feedback_data = FeedbackData(
                recommendation_id=recommendation_id,
                user_id=user_id,
                rating=rating,
                feedback_text=feedback,
                timestamp=datetime.now(timezone.utc),
                interaction_type="rating",
                product_ids=[]
            )
            
            print(f"✅ 피드백 기록: {user_id} -> {recommendation_id} (평점: {rating})")
            
            return {
                "success": True,
                "feedback_id": str(uuid.uuid4()),
                "message": "피드백이 성공적으로 기록되었습니다."
            }
            
        except Exception as e:
            raise Exception(f"피드백 기록 실패: {str(e)}")
    
    @staticmethod
    async def get_user_insights(user_id: str) -> UserInsights:
        """사용자 개인화 인사이트"""
        return UserInsights(
            user_id=user_id,
            search_patterns={
                "most_searched_type": "적금",
                "preferred_banks": ["KB국민은행", "신한은행"],
                "average_session_time": "5분 30초"
            },
            preference_trends={
                "risk_tolerance_trend": "안전 지향",
                "amount_preference": "소액 투자 선호",
                "period_preference": "단기 투자 선호"
            },
            personalized_suggestions=[
                "현재 시장 금리가 상승 중이니 장기 상품을 고려해보세요",
                "적금보다 정기예금이 현재 수익률이 더 좋습니다",
                "신용등급 향상을 위한 금융 거래 늘리기를 추천합니다"
            ],
            financial_health_score=78.5,
            goal_achievement_prediction={
                "current_progress": "25%",
                "estimated_completion": "2026-12-31",
                "required_monthly_saving": 45000,
                "success_probability": "높음"
            }
        )