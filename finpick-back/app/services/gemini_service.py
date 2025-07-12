# finpick-back/app/services/gemini_service.py
import os
import json
import re
from typing import Dict, List, Any, Optional
from datetime import datetime

class GeminiService:
    """Gemini API 연동 서비스"""
    
    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY')
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY 환경변수가 설정되지 않았습니다.")
    
    async def analyze_natural_language(self, user_query: str) -> Dict[str, Any]:
        """자연어 입력을 분석하여 금융 조건 추출"""
        try:
            # Gemini API 호출용 프롬프트 생성
            prompt = self._create_analysis_prompt(user_query)
            
            # TODO: 실제 Gemini API 호출 (임시 구현)
            # response = await self._call_gemini_api(prompt)
            
            # 현재는 규칙 기반 분석으로 대체
            analysis_result = self._rule_based_analysis(user_query)
            
            return {
                "success": True,
                "original_query": user_query,
                "extracted_conditions": analysis_result["conditions"],
                "confidence_score": analysis_result["confidence"],
                "recommended_products": analysis_result["product_types"],
                "analysis_reason": analysis_result["reason"],
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "original_query": user_query
            }
    
    def _create_analysis_prompt(self, user_query: str) -> str:
        """Gemini API용 분석 프롬프트 생성"""
        return f"""
당신은 금융상품 추천 전문 AI입니다. 사용자의 자연어 입력을 분석하여 다음 정보를 JSON 형태로 추출해주세요:

사용자 입력: "{user_query}"

추출해야 할 정보:
1. 투자 목적 (안전한_저축, 목돈_마련, 투자_수익, 노후_준비, 비상금_마련, 내집_마련)
2. 희망 금액 (최소금액, 목표금액, 월납입액)
3. 투자 기간 (단기, 중기, 장기 또는 구체적 기간)
4. 위험 성향 (안전, 균형, 적극)
5. 상품 유형 (정기예금, 적금, 신용대출, 주택담보대출, 투자상품)
6. 특별 조건 (청년, 시니어, 직장인 등)

응답 형식:
{{
  "investment_purpose": "목적",
  "amount": {{
    "minimum_amount": 숫자,
    "target_amount": 숫자,
    "monthly_amount": 숫자
  }},
  "investment_period": "기간",
  "risk_tolerance": "위험성향",
  "product_types": ["상품유형1", "상품유형2"],
  "special_conditions": ["조건1", "조건2"],
  "confidence": 0.8,
  "reason": "분석 근거"
}}
"""

    def _rule_based_analysis(self, user_query: str) -> Dict[str, Any]:
        """규칙 기반 자연어 분석 (Gemini API 폴백)"""
        query_lower = user_query.lower()
        
        # 1. 투자 목적 분석
        purpose = self._extract_investment_purpose(query_lower)
        
        # 2. 금액 추출
        amounts = self._extract_amounts(user_query)
        
        # 3. 기간 추출
        period = self._extract_period(query_lower)
        
        # 4. 위험 성향 분석
        risk_tolerance = self._extract_risk_tolerance(query_lower)
        
        # 5. 상품 유형 추론
        product_types = self._infer_product_types(query_lower, purpose)
        
        # 6. 특별 조건 추출
        special_conditions = self._extract_special_conditions(query_lower)
        
        # 신뢰도 계산
        confidence = self._calculate_confidence(query_lower, purpose, amounts, period)
        
        return {
            "conditions": {
                "investment_purpose": purpose,
                "amount": amounts,
                "investment_period": period,
                "risk_tolerance": risk_tolerance,
                "product_types": product_types,
                "special_conditions": special_conditions
            },
            "confidence": confidence,
            "product_types": product_types,
            "reason": f"키워드 분석: {purpose}, {period}기간, {risk_tolerance}성향"
        }
    
    def _extract_investment_purpose(self, query: str) -> str:
        """투자 목적 추출"""
        purpose_keywords = {
            "안전한_저축": ["안전", "저축", "보장", "확실", "안정"],
            "목돈_마련": ["목돈", "큰돈", "목표", "모으", "마련"],
            "투자_수익": ["투자", "수익", "이익", "돈벌", "펀드", "etf"],
            "노후_준비": ["노후", "은퇴", "노년", "시니어", "연금"],
            "비상금_마련": ["비상금", "응급", "급전", "비상", "만약"],
            "내집_마련": ["집", "주택", "아파트", "매매", "내집"]
        }
        
        for purpose, keywords in purpose_keywords.items():
            if any(keyword in query for keyword in keywords):
                return purpose
        
        return "안전한_저축"  # 기본값
    def _extract_amounts(self, query: str) -> Dict[str, Optional[int]]:
        """금액 정보 추출"""
        amounts = {
            "minimum_amount": None,
            "target_amount": None,
            "monthly_amount": None
        }
        
        # 숫자 + 단위 패턴 매칭
        patterns = [
            (r'(\d+)억', lambda x: int(x) * 100000000),
            (r'(\d+)천만', lambda x: int(x) * 10000000),
            (r'(\d+)만원?', lambda x: int(x) * 10000),
            (r'(\d+)원', lambda x: int(x)),
            (r'(\d+)', lambda x: int(x) * 10000)  # 기본 만원 단위
        ]
        
        for pattern, converter in patterns:
            matches = re.findall(pattern, query)
            if matches:
                amount = converter(matches[0])
                
                if "월" in query and "만원" in query:
                    amounts["monthly_amount"] = amount
                elif "목표" in query or "모으" in query:
                    amounts["target_amount"] = amount
                else:
                    amounts["minimum_amount"] = amount
                break
        
        return amounts
    
    def _extract_period(self, query: str) -> str:
        """투자 기간 추출"""
        period_patterns = {
            "단기": ["1년", "6개월", "단기", "짧게"],
            "중기": ["2년", "3년", "중기"],
            "장기": ["5년", "10년", "장기", "오래", "길게"],
        }
        
        for period, keywords in period_patterns.items():
            if any(keyword in query for keyword in keywords):
                return period
        
        return "중기"  # 기본값
    
    def _extract_risk_tolerance(self, query: str) -> str:
        """위험 성향 추출"""
        if any(word in query for word in ["안전", "확실", "보장", "안정"]):
            return "안전추구형"
        elif any(word in query for word in ["투자", "수익", "이익", "펀드"]):
            return "수익추구형"
        else:
            return "균형추구형"
    
    def _infer_product_types(self, query: str, purpose: str) -> List[str]:
        """상품 유형 추론"""
        # 직접 언급된 상품
        if "예금" in query:
            return ["정기예금"]
        elif "적금" in query:
            return ["적금"]
        elif "대출" in query:
            if "주택" in query or "집" in query:
                return ["주택담보대출"]
            else:
                return ["신용대출"]
        elif any(word in query for word in ["펀드", "etf", "투자"]):
            return ["투자상품"]
        
        # 목적 기반 추론
        purpose_to_products = {
            "안전한_저축": ["정기예금", "적금"],
            "목돈_마련": ["적금", "정기예금"],
            "투자_수익": ["투자상품", "적금"],
            "노후_준비": ["연금", "투자상품"],
            "비상금_마련": ["정기예금", "적금"],
            "내집_마련": ["주택담보대출", "적금"]
        }
        
        return purpose_to_products.get(purpose, ["적금"])
    
    def _extract_special_conditions(self, query: str) -> List[str]:
        """특별 조건 추출"""
        conditions = []
        
        condition_keywords = {
            "청년": ["청년", "20대", "30대", "젊은"],
            "시니어": ["시니어", "50대", "60대", "노인"],
            "직장인": ["회사원", "직장인", "월급"],
            "개인사업자": ["사업자", "자영업"],
            "주부": ["주부", "가정주부"]
        }
        
        for condition, keywords in condition_keywords.items():
            if any(keyword in query for keyword in keywords):
                conditions.append(condition)
        
        return conditions
    
    def _calculate_confidence(self, query: str, purpose: str, amounts: Dict, period: str) -> float:
        """분석 신뢰도 계산"""
        confidence = 0.5  # 기본값
        
        # 명확한 키워드가 있으면 신뢰도 증가
        if purpose != "안전한_저축":  # 기본값이 아닌 경우
            confidence += 0.2
        
        if any(amounts.values()):  # 금액 정보가 있는 경우
            confidence += 0.2
        
        if period != "중기":  # 기본값이 아닌 경우
            confidence += 0.1
        
        # 구체적인 상품명이 언급된 경우
        product_keywords = ["예금", "적금", "대출", "펀드", "etf"]
        if any(keyword in query for keyword in product_keywords):
            confidence += 0.2
        
        return min(1.0, confidence)
    
    async def enhance_recommendation_reason(self, user_profile: Dict, product: Dict, match_score: float) -> str:
        """Gemini API로 추천 이유 생성"""
        try:
            prompt = f"""
다음 사용자에게 이 금융상품을 추천하는 이유를 친근하고 이해하기 쉽게 설명해주세요:

사용자 정보:
- 나이: {user_profile.get('age', '정보없음')}
- 투자목적: {user_profile.get('goal', '정보없음')}
- 위험성향: {user_profile.get('risk_tolerance', '정보없음')}

상품 정보:
- 상품명: {product.get('name', '')}
- 금리: {product.get('interest_rate', 0)}%
- 상품타입: {product.get('type', '')}
- 은행: {product.get('provider', {}).get('name', '')}

적합도: {match_score}점

50자 이내로 추천 이유를 작성해주세요.
"""
            
            # TODO: 실제 Gemini API 호출
            # response = await self._call_gemini_api(prompt)
            
            # 임시 규칙 기반 생성
            return self._generate_simple_reason(product, match_score)
            
        except Exception as e:
            return f"안정적인 {product.get('type', '상품')}으로 추천합니다"
    
    def _generate_simple_reason(self, product: Dict, match_score: float) -> str:
        """간단한 추천 이유 생성"""
        rate = product.get('details', {}).get('interest_rate', 0)
        product_type = product.get('type', '')
        
        reasons = []
        
        if rate >= 3.5:
            reasons.append("높은 금리")
        elif rate >= 3.0:
            reasons.append("적정 금리")
        
        if match_score >= 90:
            reasons.append("맞춤 조건 부합")
        elif match_score >= 80:
            reasons.append("조건 적합")
        
        if "적금" in product_type:
            reasons.append("안정적 저축")
        elif "예금" in product_type:
            reasons.append("안전한 투자")
        elif "대출" in product_type:
            reasons.append("합리적 조건")
        
        return ", ".join(reasons[:2]) if reasons else "추천 상품"
    
    async def generate_financial_advice(self, user_profile: Dict, recommendations: List[Dict]) -> str:
        """사용자 맞춤 금융 조언 생성"""
        try:
            prompt = f"""
다음 사용자에게 맞춤형 금융 조언을 해주세요:

사용자 프로필: {json.dumps(user_profile, ensure_ascii=False)}
추천 상품 수: {len(recommendations)}

100자 이내로 친근하고 도움이 되는 조언을 해주세요.
"""
            
            # TODO: 실제 Gemini API 호출
            # response = await self._call_gemini_api(prompt)
            
            # 임시 조언 생성
            return self._generate_simple_advice(user_profile, len(recommendations))
            
        except Exception as e:
            return "다양한 상품을 비교해보시고 신중하게 선택하세요!"
    
    def _generate_simple_advice(self, user_profile: Dict, product_count: int) -> str:
        """간단한 금융 조언 생성"""
        age = user_profile.get('basic_info', {}).get('age', '정보없음')
        goal = user_profile.get('goal_setting', {}).get('primary_goal', '정보없음')
        
        if age == "20대":
            return f"{product_count}개 상품 중에서 장기 적금을 고려해보세요. 젊을수록 복리 효과가 큽니다!"
        elif age == "30대":
            return f"안정성과 수익성의 균형을 맞춘 {product_count}개 상품을 추천드려요."
        elif age == "40대":
            return f"안정적인 자산 증식을 위한 {product_count}개 상품을 확인해보세요."
        else:
            return f"{product_count}개의 맞춤 상품으로 목표를 달성해보세요!"