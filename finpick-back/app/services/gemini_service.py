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
    
    async def is_financial_related_query(self, user_query: str) -> Dict[str, Any]:
        """사용자 질문이 금융 상품(대출/예금/적금)과 관련있는지 AI가 판단"""
        
        try:
            prompt = f"""
사용자의 질문이 금융 상품(대출, 예금, 적금)과 관련이 있는지 판단해주세요.

사용자 질문: "{user_query}"

**금융 관련 키워드 예시:**
- 대출: 대출, 빌리기, 자금조달, 융자, 신용대출, 주택담보대출, 마이너스대출
- 예금: 예금, 저축, 정기예금, 자유예금, 목돈 만들기, 안전하게 보관
- 적금: 적금, 정기적금, 자유적금, 매월 넣기, 목표 달성, 적립

**관련 없는 예시:**
- 일반 대화: 안녕, 날씨, 음식, 연예인, 스포츠, 게임
- 다른 금융: 주식, 펀드, 부동산, 보험, 카드
- 기타: 여행, 쇼핑, 취미, 일상 대화

**응답 형식 (JSON만):**
{{
    "is_related": true/false,
    "confidence": 0.0-1.0,
    "reason": "판단 이유",
    "suggested_response": "관련 없을 때 사용자에게 보낼 안내 메시지"
}}

관련 없다고 판단되면 suggested_response에 친근하고 자연스러운 안내 메시지를 포함해주세요.
"""

            response = await self.model.generate_content_async(prompt)
            response_text = response.text.strip()
            
            # JSON 파싱
            try:
                if '```json' in response_text:
                    response_text = response_text.split('```json')[1].split('```')[0]
                elif '```' in response_text:
                    response_text = response_text.split('```')[1]
                
                result = json.loads(response_text)
                
                print(f"🤖 AI 관련성 판단: {result.get('is_related')} (신뢰도: {result.get('confidence', 0)})")
                
                return {
                    "is_related": result.get("is_related", False),
                    "confidence": result.get("confidence", 0.0),
                    "reason": result.get("reason", ""),
                    "suggested_response": result.get("suggested_response", 
                        "죄송해요, 저는 대출, 예금, 적금 상품 추천을 도와드리는 AI입니다. 금융 상품에 대해 궁금한 점이 있으시면 언제든 말씀해 주세요! 😊")
                }
                
            except json.JSONDecodeError as e:
                print(f"❌ AI 응답 JSON 파싱 실패: {e}")
                print(f"원본 응답: {response_text}")
                
                # 폴백: 키워드 기반 간단 판단
                return self._fallback_relevance_check(user_query)
                
        except Exception as e:
            print(f"❌ AI 관련성 판단 실패: {e}")
            # 폴백: 키워드 기반 간단 판단
            return self._fallback_relevance_check(user_query)
    
    def _fallback_relevance_check(self, user_query: str) -> Dict[str, Any]:
        """AI 실패 시 폴백: 키워드 기반 관련성 판단"""
        
        financial_keywords = [
            # 대출 관련
            "대출", "빌리", "융자", "신용대출", "주택담보", "마이너스대출",
            # 예금 관련  
            "예금", "저축", "정기예금", "자유예금", "목돈", "보관",
            # 적금 관련
            "적금", "정기적금", "자유적금", "매월", "적립", "목표",
            # 일반 금융
            "금리", "이자", "은행", "금융", "투자", "수익"
        ]
        
        query_lower = user_query.lower()
        is_related = any(keyword in query_lower for keyword in financial_keywords)
        
        return {
            "is_related": is_related,
            "confidence": 0.7 if is_related else 0.3,
            "reason": f"키워드 기반 판단: {'관련 키워드 발견' if is_related else '관련 키워드 없음'}",
            "suggested_response": "죄송해요, 저는 대출, 예금, 적금 상품 추천을 도와드리는 AI입니다. 금융 상품에 대해 궁금한 점이 있으시면 언제든 말씀해 주세요! 😊"
        }

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

    async def recommend_financial_model(
        self, 
        user_query: str, 
        user_profile: Optional[Dict] = None, 
        available_products: List[Dict] = None, 
        limit: int = 5
    ) -> Dict:
        """금융모델 기반 추천 - 관련성 체크 추가"""
        
        try:
            print(f"🚀 금융모델 추천 시작: {user_query}")
            
            # 🔥 1단계: 금융 관련성 검증
            relevance_check = await self.is_financial_related_query(user_query)
            
            if not relevance_check.get("is_related", False):
                print(f"❌ 금융 관련 없는 요청 감지: {relevance_check.get('reason')}")
                return {
                    "success": False,
                    "is_financial_related": False,
                    "suggested_response": relevance_check.get("suggested_response"),
                    "confidence": relevance_check.get("confidence", 0),
                    "reason": relevance_check.get("reason", "")
                }
            
            print("✅ 금융 관련 요청 확인됨, 추천 진행")
            
            # 기존 로직 그대로 유지하되 user_profile 전달
            domain = await self.classify_financial_domain(user_query)
            dataset = self.prepare_domain_dataset(available_products or [], domain)
            user_analysis = await self._analyze_user_requirements_v2(user_query, user_profile, domain)
            
            # 🔥 user_profile 전달
            recommendations = await self._recommend_products_v2(user_analysis, dataset, limit, user_profile)
            
            result = {
                "success": True,
                "is_financial_related": True,
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

    async def _recommend_products_v2(self, user_analysis: Dict, dataset: Dict, limit: int, user_profile: Optional[Dict] = None) -> List[Dict]:
        """AI가 전체 상품을 보고 실제로 추천하는 개선된 버전 - 사용자 프로필 적용"""
        
        products = dataset["products"]
        domain = dataset["domain"]
        
        if not products:
            print("❌ 추천할 상품이 없습니다")
            return []
        
        print(f"🤖 AI가 {len(products)}개 {domain} 상품 전체 분석 시작...")
        
        # 🔥 AI에게 전체 상품 데이터를 보여주고 추천받기
        try:
            # 상품 데이터를 AI가 이해할 수 있는 형태로 요약
            products_summary = []
            for i, product in enumerate(products):
                summary = {
                    "index": i,
                    "id": product.get('id', f'product_{i}'),
                    "name": product.get('name', ''),
                    "bank": product.get('provider', {}).get('name', ''),
                    "type": product.get('type', ''),
                    "interest_rate": self._extract_product_interest_rate(product),
                    "min_amount": product.get('details', {}).get('minimum_amount', 0),
                    "join_ways": product.get('conditions', {}).get('join_way', []),
                    "special_conditions": product.get('conditions', {}).get('special_conditions', '')
                }
                products_summary.append(summary)
            
            # AI 프롬프트 구성
            prompt = f"""
당신은 금융 전문가입니다. 사용자의 요구사항을 분석하여 가장 적합한 {limit}개의 상품을 추천해주세요.

**사용자 분석 결과:**
- 금융 목표: {user_analysis.get('financial_goal', '')}
- 우선순위: {', '.join(user_analysis.get('priority_factors', []))}
- 핵심 요구사항: {', '.join(user_analysis.get('domain_specific', {}).get('key_requirements', []))}

**분석할 전체 상품 목록 ({len(products)}개):**
{self._format_products_for_ai(products_summary)}

**추천 기준:**
1. 사용자 요구사항과의 적합성
2. 금리 경쟁력 
3. 은행별 다양성 (같은 은행 중복 최소화)
4. 가입 조건의 접근성
5. 상품 타입의 다양성

**응답 형식 (정확한 JSON만):**
{{
    "selected_products": [
        {{
            "index": 상품_인덱스_번호,
            "score": 0-100점_적합도,
            "reason": "추천_이유",
            "strengths": ["장점1", "장점2"],
            "considerations": ["고려사항1", "고려사항2"]
        }}
    ]
}}

반드시 {limit}개를 선택하고, 다양한 은행과 조건의 상품을 포함하여 추천해주세요.
"""
            
            # AI 호출
            response = self.model.generate_content(prompt)
            response_text = self._clean_json_response(response.text)
            ai_recommendation = json.loads(response_text)
            
            # AI 추천 결과를 원본 상품과 매칭
            final_recommendations = []
            selected_products = ai_recommendation.get("selected_products", [])
            
            print(f"✅ AI가 선택한 상품 수: {len(selected_products)}")
            
            for selection in selected_products:
                try:
                    index = selection.get("index", 0)
                    if 0 <= index < len(products):
                        original_product = products[index]
                        
                        recommendation = {
                            "product_id": original_product.get('id', ''),
                            "name": original_product.get('name', ''),
                            "bank_name": original_product.get('provider', {}).get('name', ''),
                            "type": original_product.get('type', ''),
                            "interest_rate": self._extract_product_interest_rate(original_product),
                            "conditions": original_product.get('conditions', {}),
                            "features": original_product.get('benefits', []),
                            "ai_analysis": {
                                "suitability_score": selection.get("score", 75) / 100,
                                "match_reasons": selection.get("strengths", []),
                                "risk_assessment": "보통",
                                "expected_benefit": selection.get("reason", "AI 추천 상품")
                            },
                            # 🔥 사용자 프로필 기반 맞춤 정보 계산
                            "user_specific": self._calculate_user_specific_info(original_product, user_profile)
                        }
                        
                        final_recommendations.append(recommendation)
                        print(f"✅ 선택됨: {original_product.get('name', '')} (점수: {selection.get('score', 0)})")
                        
                except Exception as e:
                    print(f"❌ 상품 매칭 오류: {e}")
                    continue
            
            return final_recommendations
            
        except Exception as e:
            print(f"❌ AI 추천 실패: {e}")
            # 🔥 폴백에도 user_profile 전달
            return self._fallback_diverse_selection(products, limit, user_profile)
    
    def _format_products_for_ai(self, products_summary: List[Dict]) -> str:
        """AI가 읽기 쉬운 형태로 상품 정보 포맷팅"""
        
        formatted_text = ""
        for product in products_summary[:50]:  # 토큰 제한으로 50개까지만
            formatted_text += f"""
{product['index']}. {product['name']} ({product['bank']})
   - 타입: {product['type']}
   - 금리: {product['interest_rate']}%
   - 최소금액: {product['min_amount']:,}원
   - 가입방법: {', '.join(product['join_ways'])}
"""
        
        if len(products_summary) > 50:
            formatted_text += f"\n... 및 {len(products_summary) - 50}개 추가 상품"
            
        return formatted_text
    
    def _fallback_diverse_selection(self, products: List[Dict], limit: int, user_profile: Optional[Dict] = None) -> List[Dict]:
        """AI 실패시 폴백: 다양성을 고려한 선택 - 사용자 프로필 적용"""
        
        print(f"🔄 폴백 모드: 다양성 기반 선택")
        
        # 은행별로 그룹화
        bank_groups = {}
        for i, product in enumerate(products):
            bank = product.get('provider', {}).get('name', 'Unknown')
            if bank not in bank_groups:
                bank_groups[bank] = []
            bank_groups[bank].append((i, product))
        
        # 각 은행에서 1개씩 선택
        selected = []
        banks_used = set()
        
        # 1차: 서로 다른 은행에서 선택
        for bank, bank_products in bank_groups.items():
            if len(selected) >= limit:
                break
            if bank not in banks_used:
                product_index, product = bank_products[0]  # 각 은행의 첫 번째 상품
                selected.append(self._create_fallback_recommendation(product, 85 - len(selected) * 3, user_profile))
                banks_used.add(bank)
        
        # 2차: 부족하면 추가 선택
        while len(selected) < limit and len(selected) < len(products):
            remaining_products = [p for i, p in enumerate(products) if i >= len(selected)]
            if remaining_products:
                product = remaining_products[0]
                selected.append(self._create_fallback_recommendation(product, 85 - len(selected) * 3, user_profile))
            else:
                break
        
        return selected
    
    def _create_fallback_recommendation(self, product: Dict, score: int, user_profile: Optional[Dict] = None) -> Dict:
        """폴백 추천 객체 생성 - 사용자 프로필 기반"""
        return {
            "product_id": product.get('id', ''),
            "name": product.get('name', ''),
            "bank_name": product.get('provider', {}).get('name', ''),
            "type": product.get('type', ''),
            "interest_rate": self._extract_product_interest_rate(product),
            "conditions": product.get('conditions', {}),
            "features": [],
            "ai_analysis": {
                "suitability_score": score / 100,
                "match_reasons": ["다양성 기반 선택"],
                "risk_assessment": "보통",
                "expected_benefit": "균형잡힌 선택"
            },
            "user_specific": self._calculate_user_specific_info(product, user_profile)
        }

    def _calculate_user_specific_info(self, product: Dict, user_profile: Optional[Dict] = None) -> Dict:
        """사용자 프로필 기반 맞춤 정보 계산"""
        
        if not user_profile:
            # 프로필이 없으면 기본값 반환
            return {
                "recommended_monthly_amount": 300000,
                "risk_compatibility": "적합",
                "age_appropriateness": "적합"
            }
        
        # 사용자 기본 정보 추출
        basic_info = user_profile.get("basic_info", {})
        investment_profile = user_profile.get("investment_profile", {})
        financial_status = user_profile.get("financial_status", {})
        
        age = basic_info.get("age", "")
        occupation = basic_info.get("occupation", "")
        risk_score = investment_profile.get("total_score", 0)
        
        # 1. 추천 월 납입액 계산
        monthly_amount = self._calculate_recommended_monthly_amount(
            product, basic_info, financial_status, investment_profile
        )
        
        # 2. 위험도 적합성 평가
        risk_compatibility = self._assess_risk_compatibility(
            product, risk_score, investment_profile
        )
        
        # 3. 연령 적합성 평가
        age_appropriateness = self._assess_age_appropriateness(
            product, age, basic_info
        )
        
        return {
            "recommended_monthly_amount": monthly_amount,
            "risk_compatibility": risk_compatibility,
            "age_appropriateness": age_appropriateness
        }

    def _calculate_recommended_monthly_amount(self, product: Dict, basic_info: Dict, financial_status: Dict, investment_profile: Dict) -> int:
        """추천 월 납입액 계산"""
        
        # 기본 최소 금액
        min_amount = product.get('details', {}).get('minimum_amount', 100000)
        base_amount = max(100000, min_amount)
        
        # 직업 기반 소득 추정
        occupation = basic_info.get("occupation", "").lower()
        income_multiplier = 1.0
        
        if any(job in occupation for job in ["의사", "변호사", "회계사"]):
            income_multiplier = 2.5
        elif any(job in occupation for job in ["공무원", "교사", "대기업"]):
            income_multiplier = 1.8
        elif any(job in occupation for job in ["자영업", "프리랜서"]):
            income_multiplier = 1.2
        elif any(job in occupation for job in ["학생", "무직"]):
            income_multiplier = 0.5
        
        # 연령 기반 조정
        age = basic_info.get("age", "")
        age_multiplier = 1.0
        
        if "20" in age:
            age_multiplier = 0.7  # 20대는 소득이 낮을 가능성
        elif "30" in age:
            age_multiplier = 1.2  # 30대는 소득 증가
        elif "40" in age:
            age_multiplier = 1.5  # 40대는 소득 정점
        elif "50" in age:
            age_multiplier = 1.3  # 50대는 여전히 높은 소득
        
        # 투자 성향 기반 조정
        risk_score = investment_profile.get("total_score", 0)
        risk_multiplier = 1.0
        
        if risk_score <= 20:  # 보수적
            risk_multiplier = 0.8
        elif risk_score >= 40:  # 공격적
            risk_multiplier = 1.3
        
        # 상품 타입별 조정
        product_type = product.get('type', '').lower()
        type_multiplier = 1.0
        
        if "적금" in product_type:
            type_multiplier = 1.0  # 적금은 기본
        elif "예금" in product_type:
            type_multiplier = 3.0  # 예금은 목돈이므로 더 큰 금액
        elif "대출" in product_type:
            return 0  # 대출은 월 납입액 개념이 없음
        
        # 최종 계산
        calculated_amount = int(base_amount * income_multiplier * age_multiplier * risk_multiplier * type_multiplier)
        
        # 범위 제한 (10만원 ~ 500만원)
        return max(100000, min(5000000, calculated_amount))

    def _assess_risk_compatibility(self, product: Dict, risk_score: int, investment_profile: Dict) -> str:
        """위험도 적합성 평가"""
        
        product_type = product.get('type', '').lower()
        
        # 상품별 위험도 정의
        if any(keyword in product_type for keyword in ["예금", "정기예금"]):
            product_risk = "낮음"  # 예금은 안전
        elif any(keyword in product_type for keyword in ["적금", "정기적금"]):
            product_risk = "낮음"  # 적금도 안전
        elif any(keyword in product_type for keyword in ["신용대출"]):
            product_risk = "중간"  # 신용대출은 중간 위험
        elif any(keyword in product_type for keyword in ["주택담보대출"]):
            product_risk = "낮음"  # 담보대출은 상대적으로 안전
        else:
            product_risk = "중간"
        
        # 사용자 위험 성향
        if risk_score <= 20:
            user_risk = "보수적"
        elif risk_score <= 40:
            user_risk = "중도적"
        else:
            user_risk = "공격적"
        
        # 적합성 매칭
        if product_risk == "낮음":
            if user_risk == "보수적":
                return "매우 적합"
            elif user_risk == "중도적":
                return "적합"
            else:
                return "다소 보수적"
        
        elif product_risk == "중간":
            if user_risk == "보수적":
                return "신중히 검토"
            elif user_risk == "중도적":
                return "적합"
            else:
                return "적합"
        
        else:  # 높음
            if user_risk == "보수적":
                return "부적합"
            elif user_risk == "중도적":
                return "신중히 검토"
            else:
                return "적합"

    def _assess_age_appropriateness(self, product: Dict, age: str, basic_info: Dict) -> str:
        """연령 적합성 평가"""
        
        product_type = product.get('type', '').lower()
        product_name = product.get('name', '').lower()
        
        # 연령대 구분
        if "20" in age:
            age_group = "20대"
        elif "30" in age:
            age_group = "30대"
        elif "40" in age:
            age_group = "40대"
        elif "50" in age:
            age_group = "50대"
        elif "60" in age or "70" in age:
            age_group = "시니어"
        else:
            age_group = "일반"
        
        # 상품별 연령 적합성
        if any(keyword in product_type for keyword in ["예금", "적금"]):
            if age_group == "20대":
                return "목돈 마련에 적합"
            elif age_group == "30대":
                return "자산 형성에 적합"
            elif age_group == "40대":
                return "안정적 저축에 적합"
            elif age_group in ["50대", "시니어"]:
                return "안전 자산 운용에 적합"
            else:
                return "적합"
        
        elif "대출" in product_type:
            if age_group == "20대":
                if "주택담보" in product_type:
                    return "신중한 검토 필요"
                else:
                    return "적합"
            elif age_group in ["30대", "40대"]:
                return "적합"
            elif age_group == "50대":
                if "주택담보" in product_type:
                    return "적합"
                else:
                    return "상환 계획 신중히 검토"
            elif age_group == "시니어":
                return "신중한 검토 필요"
            else:
                return "적합"
        
        return "적합"
    
    def _extract_product_interest_rate(self, product: Dict) -> float:
        """상품에서 금리 정보 추출"""
        # 1. details에서 직접 추출
        details = product.get('details', {})
        if details.get('interest_rate'):
            return float(details['interest_rate'])
        
        # 2. rates 배열에서 추출
        rates = product.get('rates', [])
        if rates and len(rates) > 0:
            # 가장 높은 금리 선택
            max_rate = max(rate.get('max_rate', 0) for rate in rates)
            return float(max_rate) if max_rate else 0.0
        
        return 0.0
    
    def _estimate_monthly_amount(self, product: Dict) -> int:
        """월 납입액 추정"""
        min_amount = product.get('details', {}).get('minimum_amount', 100000)
        return max(100000, min_amount // 10)  # 최소 10만원

    def _clean_json_response(self, response_text: str) -> str:
        """AI 응답에서 JSON 부분만 추출"""
        try:
            # JSON 블록 찾기
            start_idx = response_text.find('{')
            end_idx = response_text.rfind('}') + 1
            
            if start_idx != -1 and end_idx != -1:
                json_text = response_text[start_idx:end_idx]
                return json_text
            else:
                print(f"⚠️ JSON 형식을 찾을 수 없음: {response_text}")
                return "{}"
                
        except Exception as e:
            print(f"❌ JSON 정리 실패: {e}")
            return "{}"