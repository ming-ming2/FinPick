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
        print("✅ GeminiService 초기화 성공")
    
    async def recommend_products(
        self, 
        user_query: str, 
        user_profile: Optional[Dict] = None,
        available_products: List[Dict] = None,
        limit: int = 5
    ) -> Dict[str, Any]:
        try:
            print(f"🤖 Gemini 추천 시작: {user_query}")
            
            # 1단계: 도메인 분류
            domain = await self.classify_user_domain(user_query)
            
            # 2단계: 해당 도메인 상품만 필터링
            domain_products = self.filter_products_by_domain(available_products, domain)
            
            if not domain_products:
                print(f"⚠️ {domain} 도메인에 상품이 없어서 전체 상품 사용")
                domain_products = available_products[:50]
            
            # 3단계: 사용자 분석 (기존과 동일)
            user_analysis = await self._analyze_user_requirements(user_query, user_profile)
            
            # 4단계: 도메인 상품 데이터 준비
            product_summaries = self._prepare_domain_product_data(domain_products)
            
            # 5단계: AI가 해당 도메인 상품들을 정밀 분석
            recommendations = await self._evaluate_domain_products(
                user_analysis, product_summaries, domain_products, domain, limit
            )
            
            # 6단계: 결과 정리
            final_result = await self._finalize_recommendations(
                user_query, user_analysis, recommendations
            )
            
            # 도메인 정보 추가
            final_result["classified_domain"] = domain
            final_result["domain_products_count"] = len(domain_products)
            
            return final_result
            
        except Exception as e:
            print(f"❌ Gemini 추천 오류: {e}")
            return {
                "success": False,
                "error": str(e),
                "fallback_message": "AI 추천에 실패했습니다."
            }
    
    async def _analyze_user_requirements(self, user_query: str, user_profile: Optional[Dict]) -> Dict[str, Any]:
        profile_info = ""
        if user_profile:
            profile_info = f"""
사용자 프로필:
- 나이: {user_profile.get('age', '정보없음')}
- 직업: {user_profile.get('occupation', '정보없음')}
- 월 소득: {user_profile.get('monthly_income', '정보없음')}
- 투자 경험: {user_profile.get('investment_experience', '정보없음')}
- 위험 성향: {user_profile.get('risk_tolerance', '정보없음')}
"""
        
        prompt = f"""
사용자 입력: "{user_query}"
{profile_info}

다음 JSON 형식으로 분석 결과를 반환:
{{
    "investment_goal": "구체적인 투자 목표",
    "risk_appetite": "위험선호도 (1-10점)",
    "investment_period": "선호 투자기간 (단기/중기/장기)",
    "target_amount": "목표 금액 (원)",
    "monthly_budget": "월 가능 투자금액 (원)",
    "product_preferences": ["선호하는 상품 유형들"],
    "special_requirements": ["특별 요구사항들"],
    "urgency_level": "긴급도 (1-10점)",
    "analysis_confidence": "분석 신뢰도 (0.0-1.0)"
}}
"""
        
        try:
            response = self.model.generate_content(prompt)
            print(f"🔍 Gemini 원본 응답: {response.text[:200]}...")
            
            # JSON 코드 블록 제거
            response_text = response.text.strip()
            if response_text.startswith('```json'):
                response_text = response_text[7:]  # '```json' 제거
            if response_text.endswith('```'):
                response_text = response_text[:-3]  # '```' 제거
            response_text = response_text.strip()
            
            result = json.loads(response_text)
            print(f"✅ JSON 파싱 성공!")
            return result
        except Exception as e:
            print(f"⚠️ 사용자 분석 실패: {e}")
            print(f"🔍 Gemini 응답 타입: {type(response.text) if 'response' in locals() else 'No response'}")
            print(f"🔍 Gemini 응답 내용: '{response.text}'" if 'response' in locals() else 'No response')
            return self._fallback_user_analysis(user_query)
    
    def _prepare_product_data(self, products: List[Dict]) -> List[Dict]:
        summaries = []
        
        for product in products[:50]:
            summary = {
                "id": product.get('id', ''),
                "name": product.get('name', ''),
                "type": product.get('type', ''),
                "bank": product.get('provider', {}).get('name', ''),
                "interest_rate": product.get('details', {}).get('interest_rate', 0),
                "minimum_amount": product.get('details', {}).get('minimum_amount', 0),
                "maximum_amount": product.get('details', {}).get('maximum_amount', 0),
                "subscription_period": product.get('details', {}).get('subscription_period', ''),
                "maturity_period": product.get('details', {}).get('maturity_period', ''),
                "join_conditions": product.get('conditions', {}).get('join_member', ''),
                "join_ways": product.get('conditions', {}).get('join_way', []),
                "special_conditions": product.get('conditions', {}).get('special_conditions', ''),
                "key_features": product.get('details', {}).get('description', '')[:100]
            }
            summaries.append(summary)
        
        return summaries
    
    async def _evaluate_products(
        self, 
        user_analysis: Dict, 
        product_summaries: List[Dict], 
        full_products: List[Dict],
        limit: int
    ) -> List[Dict]:
        
        products_json = json.dumps(product_summaries, ensure_ascii=False, indent=2)
        
        prompt = f"""
사용자 분석 결과:
{json.dumps(user_analysis, ensure_ascii=False, indent=2)}

사용가능한 금융상품들:
{products_json}

위 상품들을 분석해서 사용자에게 가장 적합한 상위 {limit}개 상품을 추천해주세요.

다음 JSON 형식으로 응답:
{{
    "recommendations": [
        {{
            "product_id": "상품 ID",
            "product_name": "상품명",
            "ai_score": "AI 추천 점수 (0-100)",
            "match_reason": "추천 이유 (50자 이내)",
            "pros": ["장점1", "장점2", "장점3"],
            "cons": ["단점1", "단점2"],
            "risk_assessment": "위험도 평가 (낮음/보통/높음)",
            "expected_return": "예상 수익률 또는 설명",
            "recommendation_priority": "우선순위 (1-{limit})"
        }}
    ],
    "overall_analysis": "전체적인 추천 분석 (100자 이내)",
    "investment_advice": "투자 조언 (100자 이내)"
}}
"""
        
        try:
            response = self.model.generate_content(prompt)
            print(f"🔍 Gemini 상품평가 응답: {response.text[:200]}...")
            
            # JSON 코드 블록 제거
            response_text = response.text.strip()
            if response_text.startswith('```json'):
                response_text = response_text[7:]
            if response_text.endswith('```'):
                response_text = response_text[:-3]
            response_text = response_text.strip()
            
            result = json.loads(response_text)
            print(f"✅ 상품평가 JSON 파싱 성공!")
            
            enhanced_recommendations = []
            for rec in result.get("recommendations", []):
                original_product = None
                for product in full_products:
                    if (product.get('id') == rec.get('product_id') or 
                        product.get('name') == rec.get('product_name')):
                        original_product = product
                        break
                
                if original_product:
                    enhanced_rec = {
                        **rec,
                        "original_product": original_product,
                        "ai_generated": True,
                        "analysis_timestamp": datetime.now().isoformat()
                    }
                    enhanced_recommendations.append(enhanced_rec)
            
            result["recommendations"] = enhanced_recommendations
            return result
            
        except Exception as e:
            print(f"⚠️ AI 상품 평가 실패: {e}")
            print(f"🔍 상품평가 응답: '{response.text}'" if 'response' in locals() else 'No response')
            return self._fallback_evaluation(product_summaries, user_analysis, limit)
    
    async def _finalize_recommendations(
        self, 
        original_query: str, 
        user_analysis: Dict, 
        ai_recommendations: Dict
    ) -> Dict[str, Any]:
        
        return {
            "success": True,
            "original_query": original_query,
            "user_analysis": user_analysis,
            "ai_recommendations": ai_recommendations.get("recommendations", []),
            "overall_analysis": ai_recommendations.get("overall_analysis", "AI 분석 완료"),
            "investment_advice": ai_recommendations.get("investment_advice", "신중한 투자 결정을 권장합니다"),
            "recommendation_method": "Gemini AI 기반 종합 분석",
            "confidence_score": user_analysis.get("analysis_confidence", 0.8),
            "timestamp": datetime.now().isoformat(),
            "total_products_analyzed": len(ai_recommendations.get("recommendations", [])),
            "processing_time": "AI 실시간 분석"
        }
    
    def _fallback_user_analysis(self, user_query: str) -> Dict[str, Any]:
        risk_keywords = {
            "안전": 2, "보수": 2, "위험": 8, "공격": 9, "거칠게": 9, "마구": 8
        }
        
        amount_patterns = [
            (r'(\d+)만원', lambda x: int(x) * 10000),
            (r'(\d+)원', lambda x: int(x))
        ]
        
        risk_score = 5
        for keyword, score in risk_keywords.items():
            if keyword in user_query:
                risk_score = score
                break
        
        target_amount = 0
        for pattern, converter in amount_patterns:
            import re
            match = re.search(pattern, user_query)
            if match:
                target_amount = converter(match.group(1))
                break
        
        return {
            "investment_goal": "수익 추구" if risk_score > 6 else "안전한 저축",
            "risk_appetite": risk_score,
            "investment_period": "단기" if "빨리" in user_query or "단기" in user_query else "중기",
            "target_amount": target_amount,
            "monthly_budget": target_amount,
            "product_preferences": ["투자상품"] if risk_score > 6 else ["예금", "적금"],
            "special_requirements": [],
            "urgency_level": 7 if "빨리" in user_query else 5,
            "analysis_confidence": 0.6
        }
    
    def _fallback_evaluation(self, products: List[Dict], user_analysis: Dict, limit: int) -> Dict:
        scored_products = []
        
        for product in products[:limit*2]:
            score = 50
            
            rate = product.get('interest_rate', 0)
            if rate >= 4.0:
                score += 30
            elif rate >= 3.0:
                score += 20
            elif rate >= 2.0:
                score += 10
            
            user_risk = user_analysis.get('risk_appetite', 5)
            product_type = product.get('type', '')
            
            if user_risk <= 3:
                if '예금' in product_type or '적금' in product_type:
                    score += 20
            elif user_risk >= 7:
                if '투자' in product_type:
                    score += 20
            
            min_amount = product.get('minimum_amount', 0)
            user_budget = user_analysis.get('monthly_budget', float('inf'))
            
            if min_amount <= user_budget:
                score += 15
            
            scored_products.append({
                "product_id": product.get('id', ''),
                "product_name": product.get('name', ''),
                "ai_score": min(100, score),
                "match_reason": f"금리 {rate}%, 조건 적합",
                "pros": ["규칙 기반 매칭"],
                "cons": ["AI 분석 불가"],
                "risk_assessment": "보통",
                "expected_return": f"예상 수익률 {rate}%",
                "recommendation_priority": 1,
                "original_product": product
            })
        
        scored_products.sort(key=lambda x: x['ai_score'], reverse=True)
        
        return {
            "recommendations": scored_products[:limit],
            "overall_analysis": "규칙 기반 분석으로 처리되었습니다",
            "investment_advice": "상품을 자세히 비교해보세요"
        }

    async def analyze_natural_language(self, user_query: str) -> Dict[str, Any]:
        try:
            prompt = self._create_analysis_prompt(user_query)
            
            try:
                response = self.model.generate_content(prompt)
                
                try:
                    response_text = response.text
                    if '{' in response_text and '}' in response_text:
                        # JSON 코드 블록 제거
                        if response_text.strip().startswith('```json'):
                            response_text = response_text.strip()[7:]
                        if response_text.strip().endswith('```'):
                            response_text = response_text.strip()[:-3]
                        
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
                        print("⚠️ Gemini 응답을 JSON으로 파싱할 수 없음, 규칙 기반으로 폴백")
                        raise ValueError("JSON 파싱 실패")
                        
                except (json.JSONDecodeError, ValueError) as e:
                    print(f"⚠️ Gemini 응답 파싱 실패: {e}, 규칙 기반으로 폴백")
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
        return f"""
사용자 입력: "{user_query}"

다음 JSON 형식으로 분석 결과를 반환하세요:
{{
    "investment_goal": "구체적인 투자 목표",
    "risk_appetite": 5,
    "investment_period": "단기/중기/장기",
    "target_amount": 500000,
    "monthly_budget": 100000,
    "product_preferences": ["예금", "적금", "대출"],
    "special_requirements": ["특별 요구사항"],
    "urgency_level": 7,
    "analysis_confidence": 0.8
}}

중요한 규칙:
1. risk_appetite는 1-10 숫자만 사용 (문자열 금지)
2. target_amount는 숫자만 사용 (단위: 원)
3. monthly_budget는 숫자 또는 null만 사용
4. urgency_level은 1-10 숫자만 사용
5. analysis_confidence는 0.0-1.0 소수점 사용
6. 알 수 없는 값은 기본값 사용: risk_appetite=5, urgency_level=5
7. JSON 형식만 반환하고 다른 설명 금지
"""
    
    def _rule_based_analysis(self, user_query: str) -> Dict[str, Any]:
        import re
        
        purpose_keywords = {
            "불리": "투자_수익", "수익": "투자_수익", "벌": "투자_수익", "거칠게": "투자_수익",
            "안전": "안전한_저축", "보수": "안전한_저축", "저축": "안전한_저축",
            "비상": "비상금_마련", "급할": "비상금_마련",
            "집": "내집_마련", "주택": "내집_마련", "아파트": "내집_마련"
        }
        
        risk_keywords = {
            "안전": "안전추구형", "보수": "안전추구형",
            "위험": "수익추구형", "공격": "수익추구형", "거칠게": "수익추구형", "마구": "수익추구형"
        }
        
        period_keywords = {
            "빨리": "단기", "단기": "단기", "급": "단기",
            "장기": "장기", "오래": "장기",
        }
        
        purpose = "안전한_저축"
        for keyword, p in purpose_keywords.items():
            if keyword in user_query:
                purpose = p
                break
        
        risk_tolerance = "안정추구형"
        for keyword, r in risk_keywords.items():
            if keyword in user_query:
                risk_tolerance = r
                break
        
        period = "중기"
        for keyword, p in period_keywords.items():
            if keyword in user_query:
                period = p
                break
        
        amounts = {"minimum_amount": None, "target_amount": None, "monthly_amount": None}
        
        amount_patterns = [
            (r'(\d+)만원', lambda x: int(x) * 10000),
            (r'(\d+)원', lambda x: int(x))
        ]
        
        for pattern, converter in amount_patterns:
            match = re.search(pattern, user_query)
            if match:
                amount = converter(match.group(1))
                amounts["minimum_amount"] = amount
                amounts["target_amount"] = amount
                break
        
        product_types = []
        if purpose == "투자_수익" or risk_tolerance == "수익추구형":
            product_types = ["투자상품"]
        else:
            product_types = ["예금상품", "적금상품"]
        
        confidence = self._calculate_confidence(user_query, purpose, amounts, period)
        
        return {
            "conditions": {
                "investment_purpose": purpose,
                "amount": amounts,
                "investment_period": period,
                "risk_tolerance": risk_tolerance,
                "product_types": product_types,
                "special_conditions": [],
                "confidence": confidence,
                "reason": f"키워드 기반 분석: {purpose}, {risk_tolerance}, {period}"
            },
            "confidence": confidence,
            "product_types": product_types
        }
    
    def _calculate_confidence(self, query: str, purpose: str, amounts: Dict, period: str) -> float:
        confidence = 0.5
        
        if purpose != "안전한_저축":
            confidence += 0.2
        
        if any(amounts.values()):
            confidence += 0.2
        
        if period != "중기":
            confidence += 0.1
        
        product_keywords = ["예금", "적금", "대출", "펀드", "etf"]
        if any(keyword in query for keyword in product_keywords):
            confidence += 0.2
        
        return min(1.0, confidence)

    async def classify_user_domain(self, user_query: str) -> str:
        """사용자 요청을 도메인별로 분류"""
        
        prompt = f"""
사용자 입력: "{user_query}"

위 요청이 다음 중 어떤 금융 도메인에 해당하는지 하나만 선택하세요:

1. "예금" - 안전한 저축, 목돈 보관, 이자 수익 등
2. "적금" - 매월 적립, 목돈 만들기, 장기 저축 등  
3. "대출" - 돈 빌리기, 급전, 자금 필요, 융자 등

응답은 "예금", "적금", "대출" 중 하나만 반환하세요.
"""
        
        try:
            response = self.model.generate_content(prompt)
            domain = response.text.strip().replace('"', '')
            
            if domain in ["예금", "적금", "대출"]:
                print(f"🎯 도메인 분류: {user_query} → {domain}")
                return domain
            else:
                print(f"⚠️ 알 수 없는 도메인: {domain}, 기본값 '예금' 사용")
                return "예금"
                
        except Exception as e:
            print(f"❌ 도메인 분류 실패: {e}, 기본값 '예금' 사용")
            return "예금"

    def filter_products_by_domain(self, products: List[Dict], domain: str) -> List[Dict]:
        """도메인별로 상품 필터링"""
        
        domain_keywords = {
            "예금": ["예금", "deposit"],
            "적금": ["적금", "savings"],  
            "대출": ["대출", "loan", "credit"]
        }
        
        keywords = domain_keywords.get(domain, ["예금"])
        filtered = []
        
        for product in products:
            product_type = product.get('type', '').lower()
            if any(keyword in product_type for keyword in keywords):
                filtered.append(product)
        
        print(f"📊 {domain} 도메인 상품: {len(filtered)}개")
        return filtered

    def _prepare_domain_product_data(self, products: List[Dict]) -> List[Dict]:
        """도메인 특화 상품 데이터 준비 (기존보다 더 자세히)"""
        summaries = []
        
        for product in products:  # 전체 도메인 상품 모두 사용
            summary = {
                "id": product.get('id', ''),
                "name": product.get('name', ''),
                "type": product.get('type', ''),
                "bank": product.get('provider', {}).get('name', ''),
                "interest_rate": product.get('details', {}).get('interest_rate', 0),
                "minimum_amount": product.get('details', {}).get('minimum_amount', 0),
                "maximum_amount": product.get('details', {}).get('maximum_amount', 0),
                "subscription_period": product.get('details', {}).get('subscription_period', ''),
                "maturity_period": product.get('details', {}).get('maturity_period', ''),
                "join_conditions": product.get('conditions', {}).get('join_member', ''),
                "join_ways": product.get('conditions', {}).get('join_way', []),
                "special_conditions": product.get('conditions', {}).get('special_conditions', ''),
                "key_features": product.get('details', {}).get('description', '')[:150]
            }
            summaries.append(summary)
        
        return summaries

    async def _evaluate_domain_products(
        self, 
        user_analysis: Dict, 
        product_summaries: List[Dict], 
        full_products: List[Dict],
        domain: str,
        limit: int
    ) -> List[Dict]:
        """도메인별 전문 상품 평가"""
        
        products_json = json.dumps(product_summaries, ensure_ascii=False, indent=2)
        
        domain_specific_instructions = {
            "예금": "안전성과 금리를 중심으로 평가하고, 예금자보호 여부와 은행 신뢰도를 고려하세요.",
            "적금": "적립 조건, 만기 혜택, 중도해지 조건을 중심으로 평가하세요.",
            "대출": "금리, 한도, 상환 조건, 담보 여부를 중심으로 평가하고 사용자의 급박함을 고려하세요."
        }
        
        instruction = domain_specific_instructions.get(domain, "종합적으로 평가하세요.")
        
        prompt = f"""
당신은 {domain} 전문 금융 분석가입니다.

사용자 분석 결과:
{json.dumps(user_analysis, ensure_ascii=False, indent=2)}

{domain} 전문 상품들:
{products_json}

{instruction}

상위 {limit}개 상품을 추천해주세요.

응답 형식:
{{
    "recommendations": [
        {{
            "product_id": "상품 ID",
            "product_name": "상품명",
            "ai_score": 95,
            "match_reason": "{domain} 전문 분석 이유 (50자 이내)",
            "pros": ["장점1", "장점2", "장점3"],
            "cons": ["단점1", "단점2"],
            "risk_assessment": "낮음/보통/높음",
            "expected_return": "예상 결과",
            "recommendation_priority": 1
        }}
    ],
    "domain_analysis": "{domain} 도메인 전문 분석 (100자 이내)",
    "investment_advice": "해당 도메인 맞춤 조언 (100자 이내)"
}}
"""
        
        try:
            response = self.model.generate_content(prompt)
            
            response_text = response.text.strip()
            if response_text.startswith('```json'):
                response_text = response_text[7:]
            if response_text.endswith('```'):
                response_text = response_text[:-3]
            response_text = response_text.strip()
            
            result = json.loads(response_text)
            print(f"✅ {domain} 도메인 상품평가 성공!")
            
            enhanced_recommendations = []
            for rec in result.get("recommendations", []):
                original_product = None
                for product in full_products:
                    if (product.get('id') == rec.get('product_id') or 
                        product.get('name') == rec.get('product_name')):
                        original_product = product
                        break
                
                if original_product:
                    enhanced_rec = {
                        **rec,
                        "original_product": original_product,
                        "domain": domain,
                        "ai_generated": True,
                        "analysis_timestamp": datetime.now().isoformat()
                    }
                    enhanced_recommendations.append(enhanced_rec)
            
            result["recommendations"] = enhanced_recommendations
            return result
            
        except Exception as e:
            print(f"⚠️ {domain} 도메인 상품 평가 실패: {e}")
            return self._fallback_evaluation(product_summaries, user_analysis, limit)