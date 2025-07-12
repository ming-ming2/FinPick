# finpick-back/app/services/gemini_service.py
import os
import json
import re
from typing import Dict, List, Any, Optional
from datetime import datetime
from dotenv import load_dotenv  # 🔥 추가

class GeminiService:
    """Gemini API 연동 서비스"""
    
    def __init__(self):
        # 🔥 환경변수 명시적 로딩
        load_dotenv()
        
        self.api_key = os.getenv('GEMINI_API_KEY')
        print(f"🔍 GeminiService에서 API 키 확인: {self.api_key[:10] if self.api_key else 'NOT_FOUND'}...")
        
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY 환경변수가 설정되지 않았습니다.")
            
        print("✅ GeminiService 초기화 성공")
    
    async def analyze_natural_language(self, user_query: str) -> Dict[str, Any]:
        """자연어 입력을 분석하여 금융 조건 추출"""
        try:
            # Gemini API 호출용 프롬프트 생성
            prompt = self._create_analysis_prompt(user_query)
            
            # 🔥 실제 Gemini API 호출 구현
            try:
                import google.generativeai as genai
                
                genai.configure(api_key=self.api_key)
                model = genai.GenerativeModel('gemini-2.0-flash')
                
                response = model.generate_content(prompt)
                
                # JSON 응답 파싱 시도
                try:
                    # 응답에서 JSON 부분만 추출
                    response_text = response.text
                    if '{' in response_text and '}' in response_text:
                        json_start = response_text.find('{')
                        json_end = response_text.rfind('}') + 1
                        json_str = response_text[json_start:json_end]
                        
                        ai_result = json.loads(json_str)
                        
                        return {
                            "success": True,
                            "original_query": user_query,
                            "extracted_conditions": ai_result,
                            "confidence_score": ai_result.get("confidence", 0.8),
                            "recommended_products": ai_result.get("product_types", []),
                            "analysis_reason": ai_result.get("reason", "AI 분석 완료"),
                            "timestamp": datetime.now().isoformat()
                        }
                    else:
                        # JSON 파싱 실패 시 규칙 기반으로 폴백
                        print("⚠️ Gemini 응답을 JSON으로 파싱할 수 없음, 규칙 기반으로 폴백")
                        raise ValueError("JSON 파싱 실패")
                        
                except (json.JSONDecodeError, ValueError) as e:
                    print(f"⚠️ Gemini 응답 파싱 실패: {e}, 규칙 기반으로 폴백")
                    # 규칙 기반 분석으로 폴백
                    analysis_result = self._rule_based_analysis(user_query)
                    
                    return {
                        "success": True,
                        "original_query": user_query,
                        "extracted_conditions": analysis_result["conditions"],
                        "confidence_score": analysis_result["confidence"],
                        "recommended_products": analysis_result["product_types"],
                        "analysis_reason": "Gemini + 규칙 기반 분석",
                        "timestamp": datetime.now().isoformat()
                    }
                    
            except ImportError:
                print("⚠️ google-generativeai 패키지가 설치되지 않음, 규칙 기반으로 폴백")
                # 규칙 기반 분석으로 폴백
                analysis_result = self._rule_based_analysis(user_query)
                
                return {
                    "success": True,
                    "original_query": user_query,
                    "extracted_conditions": analysis_result["conditions"],
                    "confidence_score": analysis_result["confidence"],
                    "recommended_products": analysis_result["product_types"],
                    "analysis_reason": "규칙 기반 분석",
                    "timestamp": datetime.now().isoformat()
                }
            except Exception as e:
                print(f"⚠️ Gemini API 호출 실패: {e}, 규칙 기반으로 폴백")
                # 규칙 기반 분석으로 폴백
                analysis_result = self._rule_based_analysis(user_query)
                
                return {
                    "success": True,
                    "original_query": user_query,
                    "extracted_conditions": analysis_result["conditions"],
                    "confidence_score": analysis_result["confidence"],
                    "recommended_products": analysis_result["product_types"],
                    "analysis_reason": "규칙 기반 분석 (Gemini 오류)",
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
4. 위험 성향 (안전추구형, 균형추구형, 수익추구형)
5. 상품 유형 (정기예금, 적금, 신용대출, 주택담보대출, 투자상품)
6. 특별 조건 (청년, 시니어, 직장인 등)

반드시 다음 JSON 형식으로만 응답해주세요:
{{
  "investment_purpose": "목적",
  "amount": {{
    "minimum_amount": 숫자또는null,
    "target_amount": 숫자또는null,
    "monthly_amount": 숫자또는null
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
        
        # 7. 신뢰도 계산
        confidence = self._calculate_confidence(user_query, purpose, amounts, period)
        
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
            "reason": "규칙 기반 키워드 분석"
        }
    
    def _extract_investment_purpose(self, query: str) -> str:
        """투자 목적 추출"""
        purpose_keywords = {
            "안전한_저축": ["안전", "보장", "확실", "리스크없", "위험없"],
            "목돈_마련": ["목돈", "목표", "모으", "적립", "저축"],
            "투자_수익": ["수익", "벌", "이익", "투자", "수익률"],
            "노후_준비": ["노후", "은퇴", "연금", "나이"],
            "비상금_마련": ["비상", "응급", "예비", "비상금"],
            "내집_마련": ["집", "주택", "아파트", "부동산", "내집"]
        }
        
        for purpose, keywords in purpose_keywords.items():
            if any(keyword in query for keyword in keywords):
                return purpose
        
        return "안전한_저축"  # 기본값
    
    def _extract_amounts(self, query: str) -> Dict[str, Optional[int]]:
        """금액 정보 추출"""
        import re
        
        amounts = {
            "minimum_amount": None,
            "target_amount": None,
            "monthly_amount": None
        }
        
        # 숫자 + 단위 패턴 매칭
        patterns = [
            (r'(\d+)만원?', 10000),
            (r'(\d+)천만원?', 10000000),
            (r'(\d+)억', 100000000),
            (r'(\d+)원', 1)
        ]
        
        for pattern, multiplier in patterns:
            matches = re.findall(pattern, query)
            if matches:
                amount = int(matches[0]) * multiplier
                
                # 문맥에 따라 분류
                if "월" in query or "매월" in query:
                    amounts["monthly_amount"] = amount
                elif "목표" in query or "총" in query:
                    amounts["target_amount"] = amount
                else:
                    amounts["minimum_amount"] = amount
                break
        
        return amounts
    
    def _extract_period(self, query: str) -> str:
        """투자 기간 추출"""
        if any(word in query for word in ["1년", "12개월", "단기"]):
            return "단기"
        elif any(word in query for word in ["2년", "3년", "24개월", "36개월"]):
            return "중기"
        elif any(word in query for word in ["5년", "장기", "오래"]):
            return "장기"
        else:
            return "중기"  # 기본값
    
    def _extract_risk_tolerance(self, query: str) -> str:
        """위험 성향 추출"""
        if any(word in query for word in ["안전", "보장", "확실", "위험없"]):
            return "안전추구형"
        elif any(word in query for word in ["수익", "벌", "이익", "높은"]):
            return "수익추구형"
        else:
            return "균형추구형"  # 기본값
    
    def _infer_product_types(self, query: str, purpose: str) -> List[str]:
        """상품 유형 추론"""
        product_types = []
        
        # 직접적인 상품명 언급
        if "예금" in query:
            product_types.append("정기예금")
        if "적금" in query:
            product_types.append("적금")
        if "대출" in query:
            product_types.append("신용대출")
        if any(word in query for word in ["투자", "펀드", "주식"]):
            product_types.append("투자상품")
        
        # 목적 기반 추론
        if not product_types:
            if purpose == "안전한_저축":
                product_types = ["정기예금", "적금"]
            elif purpose == "목돈_마련":
                product_types = ["적금"]
            elif purpose == "투자_수익":
                product_types = ["투자상품"]
            elif purpose == "내집_마련":
                product_types = ["적금", "주택담보대출"]
            else:
                product_types = ["적금"]  # 기본값
        
        return product_types
    
    def _extract_special_conditions(self, query: str) -> List[str]:
        """특별 조건 추출"""
        conditions = []
        
        condition_keywords = {
            "청년": ["청년", "젊은", "20대", "30대"],
            "시니어": ["시니어", "중년", "50대", "60대"],
            "직장인": ["직장", "회사원", "근로자"],
            "자영업": ["자영업", "사업자", "프리랜서"]
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
            # 🔥 실제 Gemini API 사용 시도
            try:
                import google.generativeai as genai
                
                genai.configure(api_key=self.api_key)
                model = genai.GenerativeModel('gemini-2.0-flash')
                
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
                
                response = model.generate_content(prompt)
                ai_reason = response.text.strip()
                
                # 50자 제한
                if len(ai_reason) > 50:
                    ai_reason = ai_reason[:47] + "..."
                
                return ai_reason
                
            except Exception as e:
                print(f"⚠️ Gemini 추천 이유 생성 실패: {e}, 규칙 기반으로 폴백")
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
            # 🔥 실제 Gemini API 사용 시도
            try:
                import google.generativeai as genai
                
                genai.configure(api_key=self.api_key)
                model = genai.GenerativeModel('gemini-2.0-flash')
                
                prompt = f"""
다음 사용자에게 맞춤형 금융 조언을 해주세요:

사용자 프로필: {json.dumps(user_profile, ensure_ascii=False)}
추천 상품 수: {len(recommendations)}

100자 이내로 친근하고 도움이 되는 조언을 해주세요.
"""
                
                response = model.generate_content(prompt)
                advice = response.text.strip()
                
                # 100자 제한
                if len(advice) > 100:
                    advice = advice[:97] + "..."
                
                return advice
                
            except Exception as e:
                print(f"⚠️ Gemini 조언 생성 실패: {e}, 규칙 기반으로 폴백")
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