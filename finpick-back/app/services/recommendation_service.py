# finpick-back/app/services/recommendation_service.py

import json
import logging
import os
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime

from ..models.recommendation import RecommendationRequest, ProductRecommendation, ProductType
from .gemini_service import GeminiService

logger = logging.getLogger(__name__)

class RecommendationService:
    def __init__(self):
        """추천 서비스 초기화 - 금융모델 중심으로 개편"""
        self.financial_products = self._load_financial_products()
        
        # 🔥 새로운 Gemini 서비스 통합
        try:
            self.gemini_service = GeminiService()
            self.use_ai = True
            print("✅ Gemini AI 서비스 연결됨")
        except Exception as e:
            self.gemini_service = None
            self.use_ai = False
            print(f"⚠️ Gemini AI 연결 실패: {e}. 규칙 기반으로 처리됩니다.")
        
        print(f"✅ RecommendationService 초기화 완료 - {len(self.financial_products)}개 상품 로드됨")
        print("🎯 금융모델 기반 추천 시스템 활성화")

    def _load_financial_products(self) -> List[Dict]:
        """금융상품 데이터 로드 (금감원 API 데이터)"""
        try:
            # financial_products.json 파일 경로 찾기
            current_dir = os.path.dirname(__file__)
            possible_paths = [
                os.path.join(current_dir, "../../financial_products.json"),
                os.path.join(current_dir, "../financial_products.json"),
                os.path.join(current_dir, "financial_products.json"),
                "financial_products.json"
            ]
            
            file_path = None
            for path in possible_paths:
                if os.path.exists(path):
                    file_path = path
                    break
            
            if not file_path:
                print("❌ financial_products.json 파일을 찾을 수 없습니다.")
                print("📁 검색한 경로들:")
                for path in possible_paths:
                    print(f"   - {os.path.abspath(path)}")
                return self._get_sample_products()
            
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
                return self._get_sample_products()
                
        except Exception as e:
            print(f"❌ 금융상품 데이터 로드 실패: {e}")
            print("🔄 샘플 데이터로 대체합니다...")
            return self._get_sample_products()

    def _get_sample_products(self) -> List[Dict]:
        """샘플 금융상품 데이터 (테스트용)"""
        return [
            {
                "id": "sample_001",
                "name": "KB Star 정기예금",
                "type": "정기예금",
                "provider": {"name": "KB국민은행"},
                "details": {
                    "interest_rate": 3.2,
                    "minimum_amount": 100000,
                    "maximum_amount": 100000000,
                    "subscription_period": "1개월",
                    "maturity_period": "12개월"
                },
                "conditions": {
                    "join_member": "개인",
                    "join_way": ["온라인", "영업점"],
                    "special_conditions": "신규고객 우대"
                },
                "benefits": ["신규고객 금리우대", "자동이체 시 추가혜택"]
            },
            {
                "id": "sample_002", 
                "name": "신한 S드림 적금",
                "type": "적금",
                "provider": {"name": "신한은행"},
                "details": {
                    "interest_rate": 3.5,
                    "minimum_amount": 50000,
                    "maximum_amount": 1000000,
                    "subscription_period": "1개월",
                    "maturity_period": "24개월"
                },
                "conditions": {
                    "join_member": "개인",
                    "join_way": ["온라인", "모바일"],
                    "special_conditions": "만 19세 이상"
                },
                "benefits": ["연 3.5% 고금리", "중도해지 시 90% 금리 보장"]
            },
            {
                "id": "sample_003",
                "name": "하나 직장인 신용대출",
                "type": "신용대출",
                "provider": {"name": "하나은행"},
                "details": {
                    "interest_rate": 4.8,
                    "minimum_amount": 1000000,
                    "maximum_amount": 100000000,
                    "subscription_period": "",
                    "maturity_period": "60개월"
                },
                "conditions": {
                    "join_member": "재직자",
                    "join_way": ["온라인", "영업점", "모바일"],
                    "special_conditions": "재직기간 6개월 이상"
                },
                "benefits": ["신용등급별 차등금리", "중도상환수수료 면제"]
            }
        ]

    async def get_ai_recommendations(self, request: RecommendationRequest) -> Dict[str, Any]:
        """AI 기반 추천 - 새로운 금융모델 중심 로직"""
        
        try:
            print(f"🤖 AI 추천 요청: {request.natural_query}")
            
            if not self.use_ai or not self.gemini_service:
                print("⚠️ AI 서비스 비활성화 상태")
                return None
            
            # 🚀 핵심: Gemini 서비스의 새로운 금융모델 추천 사용
            ai_result = await self.gemini_service.recommend_financial_model(
                user_query=request.natural_query,
                user_profile=request.user_profile,
                available_products=self.financial_products,
                limit=request.limit
            )
            
            if ai_result.get("success"):
                print("✅ 금융모델 기반 AI 추천 성공")
                
                # AI 결과를 ProductRecommendation 객체들로 변환
                recommendations = []
                
                for product_data in ai_result.get("recommended_products", []):
                    original_product = product_data.get("original_product")
                    
                    if original_product:
                        # ProductType 정규화
                        product_type = ProductType.normalize(original_product.get('type', ''))
                        
                        rec_result = ProductRecommendation(
                            product_id=original_product.get('id', ''),
                            name=original_product.get('name', ''),
                            type=product_type,
                            provider=original_product.get('provider', {}).get('name', ''),
                            interest_rate=original_product.get('details', {}).get('interest_rate', 0.0),
                            minimum_amount=original_product.get('details', {}).get('minimum_amount', 0),
                            maximum_amount=original_product.get('details', {}).get('maximum_amount', 0),
                            
                            # AI 분석 결과
                            match_score=float(product_data.get("model_fit_score", 0)),
                            recommendation_reason=product_data.get("contribution", "AI 추천"),
                            pros=product_data.get("match_reasons", ["AI 분석 완료"]),
                            cons=["상세 조건 확인 필요"],
                            
                            join_conditions={
                                "join_way": original_product.get('conditions', {}).get('join_way', []),
                                "join_member": original_product.get('conditions', {}).get('join_member', ''),
                                "special_conditions": original_product.get('conditions', {}).get('special_conditions', '')
                            },
                            special_benefits=original_product.get('benefits', []),
                            
                            # 🆕 AI 분석 정보 확장
                            ai_analysis={
                                "financial_model_based": True,
                                "model_fit_score": product_data.get("model_fit_score", 0),
                                "role_in_model": product_data.get("role_in_model", ""),
                                "match_reasons": product_data.get("match_reasons", []),
                                "contribution": product_data.get("contribution", ""),
                                "synergy_effect": product_data.get("synergy_effect", ""),
                                "implementation_priority": product_data.get("implementation_priority", 1)
                            }
                        )
                        recommendations.append(rec_result)
                
                # 🎯 확장된 AI 인사이트 구성
                enhanced_ai_insights = {
                    "method": "Gemini AI 금융모델 분석",
                    "confidence": ai_result.get("ai_insights", {}).get("confidence_score", 0.8),
                    "user_analysis": ai_result.get("user_analysis", {}),
                    "financial_model": ai_result.get("financial_model", {}),
                    "portfolio_analysis": ai_result.get("portfolio_analysis", {}),
                    "classified_domain": ai_result.get("classified_domain", ""),
                    "next_steps": ai_result.get("next_steps", []),
                    "products_analyzed": len(self.financial_products),
                    "note": f"AI가 {ai_result.get('classified_domain', '')} 도메인에서 맞춤 금융모델을 설계하고 최적 상품 {len(recommendations)}개를 추천했습니다."
                }
                
                return type('AIRecommendationResult', (), {
                    'success': True,
                    'recommendations': recommendations,
                    'ai_insights': enhanced_ai_insights,
                    'filters_applied': ["AI 금융모델 기반", f"도메인: {ai_result.get('classified_domain', '')}"],
                    'created_at': datetime.now(),
                    'recommendation_type': 'financial_model_based'
                })()
                
            else:
                print("⚠️ AI 추천 실패, 폴백 모드 활성화")
                return None
                
        except Exception as e:
            print(f"❌ AI 추천 중 오류 발생: {e}")
            logger.error(f"AI 추천 오류: {e}")
            return None

    async def _fallback_recommendations(self, request: RecommendationRequest) -> Dict[str, Any]:
        """폴백 추천 시스템 - 기존 로직 기반"""
        
        try:
            print("🔄 폴백 추천 시스템 활성화")
            
            # 기본 필터링
            filtered_products = self._apply_basic_filters(self.financial_products, request)
            
            # 단순 점수 기반 추천
            scored_products = self._calculate_basic_scores(filtered_products, request)
            
            # 상위 N개 선택
            top_products = sorted(scored_products, key=lambda x: x['score'], reverse=True)[:request.limit]
            
            # ProductRecommendation 객체로 변환
            recommendations = []
            for i, product_data in enumerate(top_products):
                product = product_data['product']
                score = product_data['score']
                
                # ProductType 정규화
                product_type = ProductType.normalize(product.get('type', ''))
                
                rec_result = ProductRecommendation(
                    product_id=product.get('id', ''),
                    name=product.get('name', ''),
                    type=product_type,
                    provider=product.get('provider', {}).get('name', ''),
                    interest_rate=product.get('details', {}).get('interest_rate', 0.0),
                    minimum_amount=product.get('details', {}).get('minimum_amount', 0),
                    maximum_amount=product.get('details', {}).get('maximum_amount', 0),
                    
                    match_score=score,
                    recommendation_reason="기본 점수 기반 추천",
                    pros=["안정성 확보", "조건 적합"],
                    cons=["상세 검토 필요"],
                    
                    join_conditions={
                        "join_way": product.get('conditions', {}).get('join_way', []),
                        "join_member": product.get('conditions', {}).get('join_member', ''),
                        "special_conditions": product.get('conditions', {}).get('special_conditions', '')
                    },
                    special_benefits=product.get('benefits', []),
                    
                    ai_analysis={
                        "fallback_mode": True,
                        "basic_score": score,
                        "ranking": i + 1,
                        "note": "기본 점수 기반 추천"
                    }
                )
                recommendations.append(rec_result)
            
            # 폴백 응답 구성
            return {
                "success": True,
                "recommendation_type": "fallback",
                "recommendations": [
                    {
                        "product_id": rec.product_id,
                        "product_name": rec.name,
                        "product_type": rec.type.value,  # Enum을 문자열로
                        "provider_name": rec.provider,
                        "interest_rate": rec.interest_rate,
                        "minimum_amount": rec.minimum_amount,
                        "maximum_amount": rec.maximum_amount,
                        "match_score": rec.match_score,
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
                    "method": "기본 규칙 기반 추천",
                    "confidence": 0.6,
                    "products_analyzed": len(filtered_products),
                    "note": f"기본 추천 시스템으로 {len(recommendations)}개 상품을 추천했습니다."
                },
                "metadata": {
                    "filters_applied": ["기본 필터링"],
                    "timestamp": datetime.now().isoformat(),
                    "api_version": "3.0-fallback"
                }
            }
            
        except Exception as e:
            print(f"❌ 폴백 추천도 실패: {e}")
            logger.error(f"폴백 추천 오류: {e}")
            
            # 최종 응급 처리
            return {
                "success": False,
                "error": "추천 시스템에 일시적인 문제가 발생했습니다.",
                "recommendations": [],
                "ai_insights": {
                    "method": "응급 처리",
                    "confidence": 0.0,
                    "note": "시스템 오류로 인해 추천을 생성할 수 없습니다."
                }
            }

    def _apply_basic_filters(self, products: List[Dict], request: RecommendationRequest) -> List[Dict]:
        """기본 필터링 로직"""
        
        filtered = []
        
        for product in products:
            # 기본 유효성 검사
            if not product.get('name') or not product.get('type'):
                continue
            
            # 사용자 필터 적용
            filters = request.filters or {}
            
            # 상품 타입 필터
            if filters.get('product_type'):
                if filters['product_type'].lower() not in product.get('type', '').lower():
                    continue
            
            # 금리 범위 필터
            if filters.get('min_interest_rate'):
                rate = product.get('details', {}).get('interest_rate', 0)
                if rate < filters['min_interest_rate']:
                    continue
            
            # 최소 금액 필터
            if filters.get('max_minimum_amount'):
                min_amount = product.get('details', {}).get('minimum_amount', 0)
                if min_amount > filters['max_minimum_amount']:
                    continue
            
            filtered.append(product)
        
        print(f"📊 기본 필터링: {len(products)} → {len(filtered)}개 상품")
        return filtered

    def _calculate_basic_scores(self, products: List[Dict], request: RecommendationRequest) -> List[Dict]:
        """기본 점수 계산 로직"""
        
        scored_products = []
        
        for product in products:
            score = 50.0  # 기본 점수
            
            # 금리 점수 (높을수록 좋음)
            interest_rate = product.get('details', {}).get('interest_rate', 0)
            if interest_rate > 0:
                score += min(interest_rate * 10, 30)  # 최대 30점
            
            # 은행 신뢰도 점수
            bank_name = product.get('provider', {}).get('name', '').lower()
            major_banks = ['국민', '신한', '하나', '우리', 'kb']
            if any(bank in bank_name for bank in major_banks):
                score += 10
            
            # 상품명 키워드 점수
            product_name = product.get('name', '').lower()
            query_keywords = request.natural_query.lower().split() if request.natural_query else []
            
            for keyword in query_keywords:
                if keyword in product_name:
                    score += 5
            
            # 가입 조건 간소함 점수
            join_ways = product.get('conditions', {}).get('join_way', [])
            if 'online' in str(join_ways).lower() or '온라인' in str(join_ways):
                score += 5
            
            scored_products.append({
                'product': product,
                'score': score
            })
        
        return scored_products

    # 🧪 테스트/개발용 메서드들
    async def test_domain_classification(self, query: str) -> str:
        """도메인 분류 테스트"""
        if self.gemini_service:
            return await self.gemini_service.classify_financial_domain(query)
        return "중장기_목돈마련"  # 기본값

    def test_dataset_preparation(self, domain: str) -> Dict:
        """데이터셋 준비 테스트"""
        if self.gemini_service:
            return self.gemini_service.prepare_domain_dataset(self.financial_products, domain)
        return {"error": "AI 서비스 비활성화"}

    # 📊 서비스 상태 및 통계
    def get_service_stats(self) -> Dict[str, Any]:
        """서비스 상태 및 통계 정보"""
        
        product_stats = {}
        for product in self.financial_products:
            product_type = product.get('type', 'unknown')
            product_stats[product_type] = product_stats.get(product_type, 0) + 1
        
        return {
            "total_products": len(self.financial_products),
            "product_types": product_stats,
            "domains_available": list(self.gemini_service.domain_datasets.keys()) if self.gemini_service else [],
            "service_status": "active",
            "ai_status": "enabled" if self.use_ai else "disabled",
            "last_updated": datetime.now().isoformat()
        }

    # 🔄 데이터 리프레시
    async def refresh_product_data(self):
        """상품 데이터 리프레시"""
        try:
            print("🔄 상품 데이터 리프레시 시작...")
            self.financial_products = self._load_financial_products()
            print(f"✅ 상품 데이터 리프레시 완료: {len(self.financial_products)}개 상품")
            
        except Exception as e:
            print(f"❌ 상품 데이터 리프레시 실패: {e}")
            logger.error(f"상품 데이터 리프레시 오류: {e}")

    # 기존 코드와의 호환성을 위한 메서드들
    async def generate_recommendations(self, request: RecommendationRequest) -> Dict[str, Any]:
        """추천 생성 (메인 엔트리 포인트)"""
        
        # AI 추천 시도
        ai_result = await self.get_ai_recommendations(request)
        
        if ai_result and ai_result.success:
            return ai_result
        else:
            # 폴백 추천
            return await self._fallback_recommendations(request)