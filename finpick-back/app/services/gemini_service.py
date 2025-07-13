# finpick-back/app/services/gemini_service.py
import json
import os
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime
import google.generativeai as genai
from dotenv import load_dotenv

class GeminiService:
    def __init__(self):
        load_dotenv()
        self.api_key = os.getenv('GEMINI_API_KEY')
        
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY 환경변수가 설정되지 않았습니다.")
        
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-2.0-flash')
        
        # 도메인별 특화 데이터셋 정의
        self.domain_datasets = {
            "단기_안전자산": {
                "target_products": ["예금", "단기적금", "CMA", "MMF"],
                "key_metrics": ["금리", "안전성", "유동성", "예금자보호"],
                "analysis_focus": "원금보장과 유동성 중심 분석"
            },
            "중장기_목돈마련": {
                "target_products": ["적금", "정기예금", "청약통장", "연금저축"],
                "key_metrics": ["복리효과", "세제혜택", "목표달성가능성", "인플레이션대응"],
                "analysis_focus": "목표 달성과 수익성 중심 분석"
            },
            "자금조달": {
                "target_products": ["신용대출", "담보대출", "전세자금대출", "사업자대출"],
                "key_metrics": ["금리", "한도", "상환조건", "대출기간"],
                "analysis_focus": "상환능력과 조건 적합성 중심 분석"
            },
            "투자성향": {
                "target_products": ["펀드연계예금", "ELS", "DLS", "구조화상품"],
                "key_metrics": ["수익률", "위험도", "만기", "수수료"],
                "analysis_focus": "위험-수익 프로필 중심 분석"
            },
            "절세_혜택": {
                "target_products": ["ISA", "연금저축", "퇴직연금", "세금우대저축"],
                "key_metrics": ["세제혜택", "한도", "가입조건", "장기수익"],
                "analysis_focus": "세제 최적화 중심 분석"
            },
            "특수목적": {
                "target_products": ["주택청약", "내집마련", "교육비", "의료비"],
                "key_metrics": ["목적적합성", "정부지원", "우대조건", "기간조건"],
                "analysis_focus": "목적 달성 효율성 중심 분석"
            }
        }
        
        print("✅ 개선된 GeminiService 초기화 성공")
    
    async def classify_financial_domain(self, user_query: str) -> str:
        """사용자 요구사항을 세밀한 금융 도메인으로 분류"""
        
        domains_description = """
        1. "단기_안전자산" - 3개월~1년 이내, 안전한 보관, 급할 때 찾을 수 있는
        2. "중장기_목돈마련" - 1년 이상, 목돈 모으기, 결혼자금, 내집마련
        3. "자금조달" - 돈 빌리기, 대출, 융자, 급전, 사업자금
        4. "투자성향" - 더 높은 수익, 투자, 위험 감수, 적극적 운용
        5. "절세_혜택" - 세금 절약, 연금 준비, 노후 대비, ISA
        6. "특수목적" - 청약, 주택, 교육비, 의료비, 특별한 목적
        """
        
        prompt = f"""
다음 사용자 요구사항을 분석해서 어떤 금융 도메인에 해당하는지 분류해주세요.

사용자 요구사항: "{user_query}"

금융 도메인 분류:
{domains_description}

응답은 도메인명만 정확히 반환하세요: "단기_안전자산", "중장기_목돈마련", "자금조달", "투자성향", "절세_혜택", "특수목적" 중 하나
"""
        
        try:
            response = self.model.generate_content(prompt)
            domain = response.text.strip().replace('"', '')
            
            if domain in self.domain_datasets.keys():
                print(f"🎯 도메인 분류: {user_query} → {domain}")
                return domain
            else:
                print(f"⚠️ 알 수 없는 도메인: {domain}, 기본값 '중장기_목돈마련' 사용")
                return "중장기_목돈마련"
                
        except Exception as e:
            print(f"❌ 도메인 분류 실패: {e}, 기본값 '중장기_목돈마련' 사용")
            return "중장기_목돈마련"

    def prepare_domain_dataset(self, products: List[Dict], domain: str) -> Dict:
        """도메인별 특화 데이터셋 준비 - 개선된 버전"""
        
        domain_config = self.domain_datasets.get(domain, self.domain_datasets["중장기_목돈마련"])
        target_products = domain_config["target_products"]
        
        # 도메인에 맞는 상품 필터링
        filtered_products = []
        
        print(f"🔍 {domain} 도메인 상품 매칭 시작...")
        print(f"📋 찾을 상품 타입: {target_products}")
        
        for product in products:
            product_type = product.get('type', '').lower()
            product_name = product.get('name', '').lower()
            
            matched = False
            
            # 더 정교한 매칭 로직
            for target in target_products:
                if self._is_product_match(product, target):
                    filtered_products.append(product)
                    matched = True
                    print(f"✅ 매칭: {product.get('name', '')} → {target}")
                    break
            
            # 🔥 투자성향 도메인 특별 처리 (포괄적 매칭)
            if domain == "투자성향" and not matched:
                # 투자 관련 키워드가 하나라도 있으면 포함
                investment_keywords = ["투자", "펀드", "주식", "채권", "파생", "연계", "변동", "수익", "리츠"]
                if any(keyword in product_name or keyword in product_type for keyword in investment_keywords):
                    filtered_products.append(product)
                    print(f"🎯 투자성향 포괄 매칭: {product.get('name', '')}")
        
        # 🔥 필터된 상품이 없으면 전체 상품의 일부를 사용
        if not filtered_products:
            print(f"⚠️ {domain} 도메인에 매칭되는 상품이 없어서 전체 상품 중 일부 사용")
            filtered_products = products[:20]  # 상위 20개 상품 사용
        
        # 도메인별 데이터셋 구성
        dataset = {
            "domain": domain,
            "config": domain_config,
            "products": filtered_products,
            "product_summaries": self._create_domain_summaries(filtered_products, domain),
            "market_analysis": self._analyze_market_conditions(filtered_products, domain),
            "recommendation_strategy": self._get_recommendation_strategy(domain)
        }
        
        print(f"📊 {domain} 데이터셋 준비 완료: {len(filtered_products)}개 상품")
        return dataset

    def _is_product_match(self, product: Dict, target: str) -> bool:
        """상품과 타겟의 정교한 매칭 로직 - 개선된 버전"""
        
        product_type = product.get('type', '').lower()
        product_name = product.get('name', '').lower()
        
        # 🔥 더 포괄적인 매칭 규칙
        matching_rules = {
            "예금": lambda p: any(keyword in product_type for keyword in ["예금", "deposit"]) and "적금" not in product_type,
            "단기적금": lambda p: any(keyword in product_type for keyword in ["적금", "savings"]) and self._is_short_term(p),
            "적금": lambda p: any(keyword in product_type for keyword in ["적금", "savings"]),
            "CMA": lambda p: any(keyword in product_name for keyword in ["cma", "종합자산", "머니마켓"]),
            "신용대출": lambda p: any(keyword in product_type for keyword in ["신용대출", "마이너스", "개인대출"]),
            "담보대출": lambda p: any(keyword in product_type for keyword in ["담보대출", "주택", "전세"]),
            "연금저축": lambda p: any(keyword in product_name for keyword in ["연금", "irp", "퇴직"]),
            "ISA": lambda p: any(keyword in product_name for keyword in ["isa", "개인종합자산"]),
            
            # 🆕 투자성향 상품들 추가
            "펀드연계예금": lambda p: any(keyword in product_name for keyword in ["펀드", "fund", "투자"]) or "펀드" in product_type,
            "ELS": lambda p: any(keyword in product_name for keyword in ["els", "주가연계", "파생결합"]),
            "DLS": lambda p: any(keyword in product_name for keyword in ["dls", "금리연계"]),
            "구조화상품": lambda p: any(keyword in product_name for keyword in ["구조화", "파생", "연계"]),
            
            # 🆕 일반 투자 상품들 (포괄적)
            "투자상품": lambda p: any(keyword in product_name or keyword in product_type for keyword in ["투자", "펀드", "주식", "채권", "리츠"])
        }
        
        rule = matching_rules.get(target)
        if rule and rule(product):
            return True
            
        # 🔥 폴백: 키워드 직접 매칭
        target_lower = target.lower()
        if (target_lower in product_type or 
            target_lower in product_name or
            any(word in product_type for word in target_lower.split()) or
            any(word in product_name for word in target_lower.split())):
            return True
            
        return False

    def _is_short_term(self, product: Dict) -> bool:
        """단기 상품 여부 판단"""
        maturity = product.get('details', {}).get('maturity_period', '')
        if '개월' in maturity:
            try:
                months = int(''.join(filter(str.isdigit, maturity)))
                return months <= 12
            except:
                pass
        return False

    def _create_domain_summaries(self, products: List[Dict], domain: str) -> List[Dict]:
        """도메인별 특화 상품 요약 생성"""
        
        domain_config = self.domain_datasets[domain]
        key_metrics = domain_config["key_metrics"]
        
        summaries = []
        for product in products:
            summary = {
                "id": product.get('id', ''),
                "name": product.get('name', ''),
                "type": product.get('type', ''),
                "bank": product.get('provider', {}).get('name', ''),
                "domain_relevance": self._calculate_domain_relevance(product, domain)
            }
            
            # 도메인별 핵심 지표 추가
            for metric in key_metrics:
                summary[f"metric_{metric}"] = self._extract_metric(product, metric)
            
            summaries.append(summary)
        
        return summaries

    def _calculate_domain_relevance(self, product: Dict, domain: str) -> float:
        """상품의 도메인 적합도 계산"""
        
        relevance_score = 0.5  # 기본 점수
        
        domain_weights = {
            "단기_안전자산": {"금리": 0.3, "유동성": 0.4, "안전성": 0.3},
            "중장기_목돈마련": {"금리": 0.4, "복리효과": 0.3, "세제혜택": 0.3},
            "자금조달": {"금리": 0.5, "한도": 0.3, "상환조건": 0.2},
            "투자성향": {"수익률": 0.4, "위험도": 0.3, "수수료": 0.3},
            "절세_혜택": {"세제혜택": 0.5, "장기수익": 0.3, "가입조건": 0.2},
            "특수목적": {"목적적합성": 0.4, "정부지원": 0.3, "우대조건": 0.3}
        }
        
        weights = domain_weights.get(domain, {})
        
        # 실제 계산 로직은 상품 데이터에 따라 구현
        for factor, weight in weights.items():
            if self._has_factor(product, factor):
                relevance_score += weight * 0.3
        
        return min(1.0, relevance_score)

    def _extract_metric(self, product: Dict, metric: str) -> Any:
        """상품에서 특정 지표 추출"""
        
        metric_extractors = {
            "금리": lambda p: p.get('details', {}).get('interest_rate', 0),
            "안전성": lambda p: 1.0 if "예금자보호" in str(p) else 0.8,
            "유동성": lambda p: 1.0 if "수시입출금" in str(p) else 0.5,
            "세제혜택": lambda p: 0.8 if any(x in str(p) for x in ["ISA", "연금", "우대"]) else 0.0,
            "한도": lambda p: p.get('details', {}).get('maximum_amount', 0),
            "수수료": lambda p: p.get('details', {}).get('fee', 0)
        }
        
        extractor = metric_extractors.get(metric)
        return extractor(product) if extractor else None

    def _has_factor(self, product: Dict, factor: str) -> bool:
        """상품이 특정 요소를 가지고 있는지 확인"""
        product_str = str(product).lower()
        factor_keywords = {
            "금리": ["금리", "이자"],
            "안전성": ["예금자보호", "원금보장"],
            "유동성": ["수시", "자유", "입출금"],
            "세제혜택": ["세금우대", "ISA", "연금"]
        }
        
        keywords = factor_keywords.get(factor, [factor.lower()])
        return any(keyword in product_str for keyword in keywords)

    def _analyze_market_conditions(self, products: List[Dict], domain: str) -> Dict:
        """시장 상황 분석"""
        
        if not products:
            return {"analysis": "분석할 상품이 없습니다"}
        
        analysis = {
            "product_count": len(products),
            "avg_interest_rate": self._calculate_avg_rate(products),
            "rate_range": self._get_rate_range(products),
            "top_banks": self._get_top_banks(products),
            "market_trend": self._assess_market_trend(products, domain)
        }
        
        return analysis

    def _calculate_avg_rate(self, products: List[Dict]) -> float:
        """평균 금리 계산"""
        rates = []
        for product in products:
            rate = product.get('details', {}).get('interest_rate', 0)
            if rate and rate > 0:
                rates.append(rate)
        
        return sum(rates) / len(rates) if rates else 0

    def _get_rate_range(self, products: List[Dict]) -> Dict:
        """금리 범위 계산"""
        rates = [p.get('details', {}).get('interest_rate', 0) for p in products if p.get('details', {}).get('interest_rate', 0) > 0]
        
        if rates:
            return {"min": min(rates), "max": max(rates)}
        return {"min": 0, "max": 0}

    def _get_top_banks(self, products: List[Dict]) -> List[str]:
        """주요 은행 목록"""
        banks = {}
        for product in products:
            bank = product.get('provider', {}).get('name', '')
            if bank:
                banks[bank] = banks.get(bank, 0) + 1
        
        return sorted(banks.keys(), key=lambda x: banks[x], reverse=True)[:5]

    def _assess_market_trend(self, products: List[Dict], domain: str) -> str:
        """시장 트렌드 평가"""
        
        avg_rate = self._calculate_avg_rate(products)
        
        trend_analysis = {
            "단기_안전자산": f"현재 단기 금리 평균 {avg_rate:.2f}%, 안전성 중심 선택 권장",
            "중장기_목돈마련": f"중장기 적금 평균 {avg_rate:.2f}%, 복리 효과 극대화 전략 유리",
            "자금조달": f"대출 평균 금리 {avg_rate:.2f}%, 신용도별 차등 적용",
            "투자성향": f"변동성 상품 수익률 {avg_rate:.2f}%, 위험 관리 필수",
            "절세_혜택": f"세제 우대 상품 평균 {avg_rate:.2f}%, 한도 활용 극대화 권장",
            "특수목적": f"목적성 상품 평균 {avg_rate:.2f}%, 조건 충족 시 높은 효율성"
        }
        
        return trend_analysis.get(domain, f"평균 금리 {avg_rate:.2f}%")

    def _get_recommendation_strategy(self, domain: str) -> Dict:
        """도메인별 추천 전략 정의"""
        
        strategies = {
            "단기_안전자산": {
                "priority": ["안전성", "유동성", "금리"],
                "approach": "원금보장 우선, 필요시 즉시 인출 가능한 상품 중심",
                "risk_level": "최저위험",
                "time_horizon": "3개월~1년"
            },
            "중장기_목돈마련": {
                "priority": ["복리효과", "금리", "세제혜택"],
                "approach": "목표 금액 달성을 위한 체계적 적립 전략",
                "risk_level": "저위험",
                "time_horizon": "1년~10년"
            },
            "자금조달": {
                "priority": ["금리", "한도", "상환조건"],
                "approach": "상환능력 범위 내 최적 조건 확보",
                "risk_level": "중위험",
                "time_horizon": "즉시~10년"
            },
            "투자성향": {
                "priority": ["수익률", "위험관리", "포트폴리오"],
                "approach": "위험-수익 프로필에 맞는 다변화 전략",
                "risk_level": "중고위험",
                "time_horizon": "1년~장기"
            },
            "절세_혜택": {
                "priority": ["세제혜택", "장기수익", "한도활용"],
                "approach": "세제 최적화를 통한 실질 수익 극대화",
                "risk_level": "저중위험",
                "time_horizon": "장기"
            },
            "특수목적": {
                "priority": ["목적적합성", "우대조건", "정부지원"],
                "approach": "특정 목적 달성을 위한 맞춤형 설계",
                "risk_level": "변동",
                "time_horizon": "목적별 상이"
            }
        }
        
        return strategies.get(domain, strategies["중장기_목돈마련"])

    # 메인 API 메서드 - 기존 recommend_products 대체
    async def recommend_financial_model(
        self, 
        user_query: str,
        user_profile: Optional[Dict] = None,
        available_products: List[Dict] = None,
        limit: int = 5
    ) -> Dict[str, Any]:
        """금융모델 추천 메인 로직 - 네가 원하는 정확한 흐름"""
        
        try:
            print(f"🤖 금융모델 추천 시작: {user_query}")
            
            # 1단계: 정교한 도메인 분류
            domain = await self.classify_financial_domain(user_query)
            
            # 2단계: 도메인별 특화 데이터셋 구성
            dataset = self.prepare_domain_dataset(available_products, domain)
            
            # 3단계: 사용자 요구사항 심층 분석
            user_analysis = await self._analyze_user_requirements_v2(user_query, user_profile, domain)
            
            # 4단계: 금융모델 생성 (이게 핵심!)
            financial_model = await self._generate_financial_model(user_analysis, dataset)
            
            # 5단계: 모델에 맞는 상품 매칭
            matched_products = await self._match_products_to_model(financial_model, dataset, limit)
            
            # 6단계: 최종 추천 결과 구성
            final_result = await self._finalize_model_recommendation(
                user_query, user_analysis, financial_model, matched_products, domain
            )
            
            return final_result
            
        except Exception as e:
            print(f"❌ 금융모델 추천 오류: {e}")
            return {
                "success": False,
                "error": str(e),
                "fallback_message": "금융모델 추천에 실패했습니다."
            }

    # 나머지 헬퍼 메서드들은 다음 파일에서...
    def _clean_json_response(self, response_text: str) -> str:
        """JSON 응답 정리 - 개선된 버전"""
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
            
        # 추가 정리
        response_text = response_text.strip()
        
        # JSON이 아닌 것 같으면 기본 구조 생성
        if not response_text.startswith('{') and not response_text.startswith('['):
            print(f"⚠️ JSON이 아닌 응답: {response_text[:100]}...")
            raise ValueError("유효하지 않은 JSON 형식")
            
        return response_text

    def _fallback_user_analysis(self, user_query: str, domain: str) -> Dict:
        """사용자 분석 폴백"""
        return {
            "financial_goal": "일반적인 금융 목표",
            "time_horizon": "중기",
            "risk_tolerance": 3,
            "amount_capacity": "보통",
            "priority_factors": ["안전성", "수익성"],
            "constraints": [],
            "domain_specific": {
                "key_requirements": ["기본 요구사항"],
                "success_criteria": "목표 달성",
                "optimization_target": "균형"
            },
            "urgency_level": 3,
            "complexity_score": 3
        }
        # GeminiService 클래스의 나머지 핵심 메서드들

    async def _analyze_user_requirements_v2(self, user_query: str, user_profile: Optional[Dict], domain: str) -> Dict:
        """사용자 요구사항 심층 분석 (도메인 특화)"""
        
        domain_context = self.domain_datasets[domain]
        
        prompt = f"""
다음 사용자 요구사항을 {domain} 도메인 관점에서 심층 분석해주세요.

사용자 요구사항: "{user_query}"
도메인: {domain}
분석 초점: {domain_context['analysis_focus']}
핵심 지표: {domain_context['key_metrics']}

사용자 프로필: {json.dumps(user_profile, ensure_ascii=False) if user_profile else "정보 없음"}

다음 JSON 형식으로 분석해주세요:
{{
    "financial_goal": "구체적인 금융 목표",
    "time_horizon": "투자/저축 기간",
    "risk_tolerance": "위험 감수 수준 (1-5)",
    "amount_capacity": "투자/저축 가능 금액",
    "priority_factors": ["우선순위 요소1", "요소2", "요소3"],
    "constraints": ["제약사항1", "제약사항2"],
    "domain_specific": {{
        "key_requirements": ["도메인별 핵심 요구사항"],
        "success_criteria": "성공 기준",
        "optimization_target": "최적화 대상"
    }},
    "urgency_level": "긴급도 (1-5)",
    "complexity_score": "복잡도 (1-5)"
}}
"""
        
        try:
            response = self.model.generate_content(prompt)
            response_text = self._clean_json_response(response.text)
            result = json.loads(response_text)
            print(f"✅ 사용자 요구사항 심층 분석 완료")
            return result
            
        except Exception as e:
            print(f"⚠️ 사용자 분석 실패: {e}")
            return self._fallback_user_analysis(user_query, domain)

    async def _generate_financial_model(self, user_analysis: Dict, dataset: Dict) -> Dict:
        """핵심! 사용자 맞춤 금융모델 생성 - 개선된 오류 처리"""
        
        domain = dataset["domain"]
        strategy = dataset["recommendation_strategy"]
        market_analysis = dataset["market_analysis"]
        
        prompt = f"""
당신은 {domain} 분야 최고 전문가입니다. 
다음 정보를 바탕으로 사용자에게 최적화된 금융모델을 설계해주세요.

사용자 분석:
{json.dumps(user_analysis, ensure_ascii=False, indent=2)}

시장 현황:
{json.dumps(market_analysis, ensure_ascii=False, indent=2)}

추천 전략:
{json.dumps(strategy, ensure_ascii=False, indent=2)}

다음 JSON 형식으로만 응답해주세요 (다른 텍스트 없이):
{{
    "model_name": "{domain} 맞춤 전략",
    "model_type": "{domain}",
    "target_achievement": "구체적인 목표 달성 방법",
    "investment_strategy": {{
        "core_principle": "핵심 투자 원칙",
        "allocation_method": "자금 배분 방법",
        "risk_management": "리스크 관리 방안",
        "timeline_strategy": "시간대별 전략"
    }},
    "expected_outcomes": {{
        "primary_benefit": "주요 기대효과",
        "timeline": "예상 달성 시기",
        "success_probability": "80%",
        "backup_plan": "대안 계획"
    }},
    "implementation_steps": [
        "1단계: 상품 선택 및 가입",
        "2단계: 포트폴리오 구성",
        "3단계: 정기적 모니터링"
    ],
    "required_products": {{
        "primary": "주력 상품 유형",
        "secondary": "보조 상품 유형",
        "criteria": ["안전성", "수익성", "유동성"]
    }},
    "monitoring_metrics": ["수익률", "위험도", "달성률"],
    "model_confidence": 4
}}
"""
        
        try:
            response = self.model.generate_content(prompt)
            
            if not response or not response.text:
                print("⚠️ Gemini에서 빈 응답")
                return self._fallback_financial_model(user_analysis, domain)
                
            response_text = self._clean_json_response(response.text)
            result = json.loads(response_text)
            
            # 모델 메타데이터 추가
            result["generated_at"] = datetime.now().isoformat()
            result["domain"] = domain
            result["user_id"] = user_analysis.get("user_id", "anonymous")
            
            print(f"🎯 금융모델 생성 완료: {result.get('model_name', 'Unknown')}")
            return result
            
        except Exception as e:
            print(f"⚠️ 금융모델 생성 실패: {e}")
            return self._fallback_financial_model(user_analysis, domain)

    async def _match_products_to_model(self, financial_model: Dict, dataset: Dict, limit: int) -> Dict:
        """금융모델에 최적화된 상품 매칭 - 개선된 오류 처리"""
        
        products = dataset["product_summaries"]
        required_criteria = financial_model.get("required_products", {}).get("criteria", [])
        
        if not products:
            print("⚠️ 매칭할 상품이 없음")
            return self._fallback_product_matching([], limit)
        
        prompt = f"""
다음 금융모델에 가장 적합한 상품들을 매칭해주세요.

금융모델: {financial_model.get('model_name', 'Unknown')}
선택 기준: {required_criteria}

상품 목록:
{json.dumps(products[:10], ensure_ascii=False, indent=2)}

다음 JSON 형식으로만 응답해주세요:
{{
    "matched_products": [
        {{
            "product_id": "{products[0].get('id', 'sample_001') if products else 'sample_001'}",
            "product_name": "상품명",
            "model_fit_score": 85,
            "role_in_model": "주력",
            "match_reasons": ["이유1", "이유2"],
            "contribution": "모델 기여도",
            "synergy_effect": "시너지 효과",
            "implementation_priority": 1
        }}
    ],
    "portfolio_balance": "균형잡힘",
    "model_completion": "80%"
}}
"""
        
        try:
            response = self.model.generate_content(prompt)
            
            if not response or not response.text:
                print("⚠️ 상품 매칭에서 빈 응답")
                return self._fallback_product_matching(products, limit)
                
            response_text = self._clean_json_response(response.text)
            result = json.loads(response_text)
            
            # 원본 상품 정보 매칭
            enhanced_products = []
            for matched in result.get("matched_products", []):
                original_product = self._find_original_product(matched.get("product_id"), dataset["products"])
                if original_product:
                    enhanced_product = {
                        **matched,
                        "original_product": original_product,
                        "financial_model_optimized": True
                    }
                    enhanced_products.append(enhanced_product)
            
            result["matched_products"] = enhanced_products
            print(f"✅ 상품 매칭 완료: {len(enhanced_products)}개")
            return result
            
        except Exception as e:
            print(f"⚠️ 상품 매칭 실패: {e}")
            return self._fallback_product_matching(products, limit)

    def _find_original_product(self, product_id: str, original_products: List[Dict]) -> Optional[Dict]:
        """원본 상품 정보 찾기"""
        for product in original_products:
            if product.get('id') == product_id:
                return product
        return None

    async def _finalize_model_recommendation(
        self, 
        user_query: str, 
        user_analysis: Dict, 
        financial_model: Dict, 
        matched_products: Dict,
        domain: str
    ) -> Dict[str, Any]:
        """최종 추천 결과 구성"""
        
        return {
            "success": True,
            "recommendation_type": "financial_model",
            "user_query": user_query,
            "classified_domain": domain,
            "financial_model": {
                "model_name": financial_model.get("model_name"),
                "model_type": financial_model.get("model_type"),
                "strategy": financial_model.get("investment_strategy"),
                "expected_outcomes": financial_model.get("expected_outcomes"),
                "implementation_steps": financial_model.get("implementation_steps"),
                "confidence": financial_model.get("model_confidence")
            },
            "recommended_products": matched_products.get("matched_products", []),
            "portfolio_analysis": {
                "balance": matched_products.get("portfolio_balance"),
                "completion": matched_products.get("model_completion"),
                "total_products": len(matched_products.get("matched_products", []))
            },
            "user_analysis": user_analysis,
            "ai_insights": {
                "method": "Gemini AI 금융모델 분석",
                "domain_specialized": True,
                "model_based_recommendation": True,
                "confidence_score": financial_model.get("model_confidence", 3) / 5.0,
                "analysis_timestamp": datetime.now().isoformat()
            },
            "next_steps": self._generate_next_steps(financial_model, user_analysis)
        }

    def _generate_next_steps(self, financial_model: Dict, user_analysis: Dict) -> List[str]:
        """다음 실행 단계 생성"""
        
        steps = financial_model.get("implementation_steps", [])
        
        # 기본 단계가 없으면 생성
        if not steps:
            urgency = user_analysis.get("urgency_level", 3)
            if urgency >= 4:
                steps = [
                    "1단계: 즉시 주력 상품 가입 진행",
                    "2단계: 24시간 내 추가 상품 검토",
                    "3단계: 1주일 내 전체 포트폴리오 완성"
                ]
            else:
                steps = [
                    "1단계: 추천 상품 상세 정보 확인",
                    "2단계: 각 은행별 조건 비교 검토",
                    "3단계: 우선순위에 따라 단계적 가입"
                ]
        
        return steps

    # 폴백 메서드들
    def _fallback_financial_model(self, user_analysis: Dict, domain: str) -> Dict:
        """금융모델 생성 폴백"""
        return {
            "model_name": f"{domain} 기본 모델",
            "model_type": domain,
            "target_achievement": "안정적인 목표 달성",
            "investment_strategy": {
                "core_principle": "안전성과 수익성의 균형",
                "allocation_method": "분산 투자",
                "risk_management": "보수적 관리",
                "timeline_strategy": "단계적 실행"
            },
            "expected_outcomes": {
                "primary_benefit": "안정적인 수익",
                "timeline": "중기",
                "success_probability": "80%",
                "backup_plan": "대안 상품 활용"
            },
            "implementation_steps": [
                "1단계: 상품 비교 검토",
                "2단계: 조건 확인 후 가입",
                "3단계: 정기적 성과 모니터링"
            ],
            "required_products": {
                "primary": "주요 상품",
                "secondary": "보조 상품",
                "criteria": ["안전성", "수익성", "유동성"]
            },
            "monitoring_metrics": ["수익률", "위험도", "만족도"],
            "model_confidence": 3
        }

    def _fallback_product_matching(self, products: List[Dict], limit: int) -> Dict:
        """상품 매칭 폴백 - 개선된 버전"""
        
        # 상위 N개 상품 선택 (기본 점수 기반)
        selected_products = []
        for i, product in enumerate(products[:limit]):
            selected_products.append({
                "product_id": product.get("id", f"product_{i}"),
                "product_name": product.get("name", f"상품 {i+1}"),
                "model_fit_score": 75 - (i * 5),  # 점수 차등
                "role_in_model": "주력" if i == 0 else "보조",
                "match_reasons": ["기본 조건 부합", "안정성 확보"],
                "contribution": "포트폴리오 균형",
                "synergy_effect": "상호 보완",
                "implementation_priority": i + 1,
                "original_product": product,
                "financial_model_optimized": False
            })
        
        return {
            "matched_products": selected_products,
            "portfolio_balance": "보통",
            "model_completion": "75%"
        }

    # 기존 호환성을 위한 메서드 (기존 API가 이걸 호출할 경우)
    async def recommend_products(
        self, 
        user_query: str, 
        user_profile: Optional[Dict] = None,
        available_products: List[Dict] = None,
        limit: int = 5
    ) -> Dict[str, Any]:
        """기존 호환성을 위한 래퍼 메서드"""
        print("⚠️ 기존 recommend_products 호출됨, 새로운 recommend_financial_model로 리다이렉트")
        return await self.recommend_financial_model(user_query, user_profile, available_products, limit)