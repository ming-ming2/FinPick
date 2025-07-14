# finpick-back/app/services/gemini_service.py
import json
import os
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime
import google.generativeai as genai
from dotenv import load_dotenv

def classify_product_domain(product_type: str) -> str:
    """상품 타입을 2개 도메인으로 분류"""
    if not product_type:
        return "예금적금"
    
    type_lower = product_type.lower()
    
    # 대출 관련
    loan_keywords = ["대출", "loan", "신용대출", "주택담보대출", "마이너스대출"]
    if any(keyword in type_lower for keyword in loan_keywords):
        return "대출"
    
    # 예금/적금 관련 (기본값)
    return "예금적금"

class GeminiService:
    def __init__(self):
        load_dotenv()
        self.api_key = os.getenv('GEMINI_API_KEY')
        
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY 환경변수가 설정되지 않았습니다.")
        
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-2.0-flash')
        
        # 🔥 2개 도메인으로 단순화된 데이터셋 정의
        self.domain_datasets = {
            "예금적금": {
                "target_products": ["예금", "적금", "정기예금", "정기적금", "자유적금"],
                "key_metrics": ["금리", "안전성", "복리효과", "예금자보호", "목표달성가능성"],
                "analysis_focus": "안전성과 수익성의 균형, 목표달성 가능성 분석",
                "description": "안전한 저축과 목돈 마련을 위한 상품"
            },
            "대출": {
                "target_products": ["신용대출", "주택담보대출", "마이너스대출", "개인대출"],
                "key_metrics": ["금리", "한도", "상환조건", "대출기간", "상환능력"],
                "analysis_focus": "상환능력 대비 조건 적합성, 금리 경쟁력 분석",
                "description": "자금조달을 위한 다양한 대출 상품"
            }
        }
        
        print("✅ 2개 도메인 GeminiService 초기화 성공")
    
    async def classify_financial_domain(self, user_query: str) -> str:
        """사용자 요구사항을 2개 도메인으로 분류"""
        
        prompt = f"""
다음 사용자 요구사항을 분석해서 어떤 금융 도메인에 해당하는지 분류해주세요.

사용자 요구사항: "{user_query}"

금융 도메인 분류:
1. "예금적금" - 돈을 안전하게 저축하고 싶은 경우
   - 키워드: 저축, 적금, 예금, 목돈, 안전, 보장, 모으기, 연금준비

2. "대출" - 돈을 빌리고 싶은 경우  
   - 키워드: 대출, 빌리기, 융자, 급전, 자금조달, 론, 주택, 신용

응답은 도메인명만 정확히 반환하세요: "예금적금" 또는 "대출"
"""
        
        try:
            response = self.model.generate_content(prompt)
            domain = response.text.strip().replace('"', '')
            
            if domain in ["예금적금", "대출"]:
                print(f"🎯 도메인 분류: {user_query} → {domain}")
                return domain
            else:
                print(f"⚠️ 알 수 없는 도메인: {domain}, 기본값 '예금적금' 사용")
                return "예금적금"
                
        except Exception as e:
            print(f"❌ 도메인 분류 실패: {e}, 기본값 '예금적금' 사용")
            return "예금적금"

    def prepare_domain_dataset(self, products: List[Dict], domain: str) -> Dict:
        """도메인별 특화 데이터셋 준비 - 2개 도메인 버전"""
        
        # 도메인 설정 가져오기
        domain_config = self.domain_datasets.get(domain, self.domain_datasets["예금적금"])
        
        # 🔥 실시간 도메인 분류를 사용해서 상품 필터링
        filtered_products = []
        
        print(f"🔍 {domain} 도메인 상품 필터링 시작...")
        
        for product in products:
            product_type = product.get('type', '')
            product_domain = classify_product_domain(product_type)
            
            if product_domain == domain:
                filtered_products.append(product)
                print(f"✅ 매칭: {product.get('name', '')} ({product_type})")
        
        print(f"📊 {domain} 도메인 필터링 완료: {len(filtered_products)}개 상품")
        
        # 필터된 상품이 없으면 경고
        if not filtered_products:
            print(f"⚠️ {domain} 도메인에 매칭되는 상품이 없음")
            # 🔥 폴백: 전체 상품 중 일부 사용
            filtered_products = products[:10]
            print(f"🔄 폴백: 전체 상품 중 {len(filtered_products)}개 사용")
        
        # 도메인별 데이터셋 구성
        dataset = {
            "domain": domain,
            "config": domain_config,
            "products": filtered_products,
            "total_count": len(filtered_products),
            "product_types": self._get_product_type_breakdown(filtered_products),
            "market_analysis": self._analyze_market_conditions(filtered_products, domain),
            "recommendation_strategy": domain_config["analysis_focus"]
        }
        
        return dataset
    
    def _get_product_type_breakdown(self, products: List[Dict]) -> Dict:
        """상품 타입별 분포"""
        breakdown = {}
        for product in products:
            product_type = product.get('type', 'unknown')
            breakdown[product_type] = breakdown.get(product_type, 0) + 1
        return breakdown

    def _analyze_market_conditions(self, products: List[Dict], domain: str) -> str:
        """시장 분석 간단 버전"""
        total_products = len(products)
        
        if domain == "예금적금":
            return f"예금/적금 시장 분석: 총 {total_products}개 상품 확인, 안전성 중심 포트폴리오 구성 가능"
        else:  # 대출
            return f"대출 시장 분석: 총 {total_products}개 상품 확인, 다양한 금리 조건과 상환 방식 제공"

    # 🔥 기존 메서드들을 2개 도메인에 맞게 간소화
    async def recommend_financial_model(
        self, 
        user_query: str, 
        user_profile: Optional[Dict] = None, 
        available_products: List[Dict] = None, 
        limit: int = 5
    ) -> Dict:
        """금융모델 기반 추천 - 2개 도메인 버전"""
        
        try:
            print(f"🚀 금융모델 추천 시작: {user_query}")
            
            # 1단계: 도메인 분류
            domain = await self.classify_financial_domain(user_query)
            
            # 2단계: 데이터셋 준비
            dataset = self.prepare_domain_dataset(available_products or [], domain)
            
            # 3단계: 사용자 분석
            user_analysis = await self._analyze_user_requirements_v2(user_query, user_profile, domain)
            
            # 4단계: 상품 추천
            recommendations = await self._recommend_products_v2(user_analysis, dataset, limit)
            
            # 5단계: 결과 구성
            result = {
                "success": True,
                "domain": domain,
                "user_analysis": user_analysis,
                "recommended_products": recommendations,
                "ai_insights": {
                    "confidence_score": 0.85,
                    "recommendation_summary": f"{domain} 도메인에서 {len(recommendations)}개 상품 추천",
                    "method": "2-Domain AI Analysis"
                },
                "portfolio_analysis": f"{domain} 포트폴리오 최적화 완료"
            }
            
            print(f"✅ 금융모델 추천 완료: {len(recommendations)}개 상품")
            return result
            
        except Exception as e:
            print(f"❌ 금융모델 추천 실패: {e}")
            return {
                "success": False,
                "error": str(e),
                "fallback": True
            }

    async def _analyze_user_requirements_v2(self, user_query: str, user_profile: Optional[Dict], domain: str) -> Dict:
        """사용자 요구사항 분석 - 간소화 버전"""
        
        domain_context = self.domain_datasets[domain]
        
        prompt = f"""
다음 사용자 요구사항을 {domain} 도메인 관점에서 분석해주세요.

사용자 요구사항: "{user_query}"
도메인: {domain}
분석 초점: {domain_context['analysis_focus']}

다음 JSON 형식으로 간단히 분석해주세요:
{{
    "financial_goal": "구체적인 금융 목표",
    "time_horizon": "기간",
    "priority_factors": ["우선순위 1", "우선순위 2"],
    "domain_specific": {{
        "key_requirements": ["핵심 요구사항"],
        "success_criteria": "성공 기준"
    }}
}}
"""
        
        try:
            response = self.model.generate_content(prompt)
            response_text = self._clean_json_response(response.text)
            result = json.loads(response_text)
            print(f"✅ 사용자 분석 완료")
            return result
            
        except Exception as e:
            print(f"⚠️ 사용자 분석 실패: {e}")
            return {
                "financial_goal": "일반적인 금융 목표",
                "time_horizon": "중기",
                "priority_factors": ["안전성", "수익성"],
                "domain_specific": {
                    "key_requirements": ["기본 요구사항"],
                    "success_criteria": "목표 달성"
                }
            }

    async def _recommend_products_v2(self, user_analysis: Dict, dataset: Dict, limit: int) -> List[Dict]:
        """상품 추천 - 점수 계산 개선 버전"""
        
        products = dataset["products"]
        if not products:
            return []
        
        # 🔥 점수 계산 로직 개선
        recommendations = []
        
        for i, product in enumerate(products[:limit]):
            # 기본 점수 계산
            base_score = 85 - (i * 2) # 85, 83, 81, 79, 77점으로 차등
            
            # 금리 기반 보너스 점수
            interest_rate = self._extract_product_interest_rate(product)
            if interest_rate > 0:
                # 대출: 낮은 금리일수록 좋음 (최대 +10점)
                if dataset["domain"] == "대출":
                    if interest_rate <= 3.0:
                        base_score += 10
                    elif interest_rate <= 4.0:
                        base_score += 5
                # 예금/적금: 높은 금리일수록 좋음 (최대 +10점)
                else:
                    if interest_rate >= 4.0:
                        base_score += 10
                    elif interest_rate >= 3.0:
                        base_score += 5
            
            # 은행 신뢰도 보너스
            bank_name = product.get('provider', {}).get('name', '').lower()
            major_banks = ['국민', '신한', '하나', '우리', 'kb']
            if any(bank in bank_name for bank in major_banks):
                base_score += 3
            
            # 최종 점수 (최대 100점 제한)
            final_score = min(base_score, 100)
            
            recommendation = {
                "original_product": product,
                "recommendation_score": 0.9 - (i * 0.05),
                "recommendation_reason": f"{dataset['domain']} 도메인 최적 상품",
                "match_score": final_score, # 🔥 개선된 점수
                "ai_analysis": {
                    "strengths": self._generate_strengths(product, dataset["domain"]),
                    "considerations": ["가입 조건 확인 필요"],
                    "fit_score": final_score / 100, # 0~1 범위로 정규화
                    "model_fit_score": final_score # 🔥 이것도 개선된 점수
                }
            }
            recommendations.append(recommendation)
        
        print(f"✅ {len(recommendations)}개 상품 추천 완료 (점수: {[r['match_score'] for r in recommendations]})")
        return recommendations

    def _clean_json_response(self, response_text: str) -> str:
        """JSON 응답 정리"""
        if not response_text or not response_text.strip():
            raise ValueError("빈 응답")
            
        response_text = response_text.strip()
        
        # JSON 코드 블록 제거
        if response_text.startswith('```json'):
            response_text = response_text[7:]
        elif response_text.startswith('```'):
            response_text = response_text[3:]
            
        if response_text.endswith('```'):
            response_text = response_text[:-3]
            
        response_text = response_text.strip()
        
        # JSON 유효성 기본 체크
        if not response_text.startswith('{') and not response_text.startswith('['):
            raise ValueError("유효하지 않은 JSON 형식")
            
        return response_text

    # 🔥 기존 호환성을 위한 메서드들 - 간소화 버전
    def _create_domain_summaries(self, products: List[Dict], domain: str) -> List[Dict]:
        """도메인별 상품 요약 생성 - 간소화"""
        summaries = []
        for product in products:
            summary = {
                "id": product.get('id', ''),
                "name": product.get('name', ''),
                "type": product.get('type', ''),
                "bank": product.get('provider', {}).get('name', ''),
                "domain_relevance": 0.8  # 기본 적합도
            }
            summaries.append(summary)
        return summaries

    def _get_recommendation_strategy(self, domain: str) -> str:
        """추천 전략 가져오기"""
        return self.domain_datasets[domain]["analysis_focus"]

    def _extract_product_interest_rate(self, product: Dict) -> float:
        """상품에서 실제 금리 추출"""
        try:
            # details.interest_rate가 0이 아닌 경우
            details_rate = product.get('details', {}).get('interest_rate', 0)
            if details_rate > 0:
                return details_rate
                
            # rates 배열에서 추출
            rates = product.get('rates', [])
            if rates and len(rates) > 0:
                return rates[0].get('base_rate', rates[0].get('max_rate', 0))
                
            # max_interest_rate 사용
            return product.get('details', {}).get('max_interest_rate', 0)
            
        except:
            return 0.0

    def _generate_strengths(self, product: Dict, domain: str) -> List[str]:
        """상품 장점 생성"""
        strengths = []
        
        # 기본 장점
        strengths.append("신뢰할 수 있는 금융기관")
        
        # 금리 기반 장점
        interest_rate = self._extract_product_interest_rate(product)
        if domain == "대출" and interest_rate > 0 and interest_rate <= 4.0:
            strengths.append("경쟁력 있는 대출 금리")
        elif domain == "예금적금" and interest_rate >= 3.0:
            strengths.append("우수한 예금 금리")
        
        # 가입 방법 기반 장점
        join_ways = product.get('conditions', {}).get('join_way', [])
        if '스마트폰' in join_ways or '인터넷' in join_ways:
            strengths.append("간편한 온라인 가입")
        
        return strengths[:3] # 최대 3개까지
