# finpick-back/app/api/simulation.py

from fastapi import APIRouter, HTTPException, Depends, status
from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime
import math
import logging

from ..models.user import get_current_user
from ..services.gemini_service import GeminiService

logger = logging.getLogger(__name__)
router = APIRouter()

# 📊 Request/Response 모델들
class SimulationRequest(BaseModel):
    scenario_id: str = Field(..., description="시나리오 ID (house/retire/baby)")
    monthly_amount: int = Field(..., ge=50000, le=5000000, description="월 저축액")
    target_years: int = Field(..., ge=1, le=30, description="목표 기간(년)")
    expected_return: float = Field(..., ge=0.1, le=15.0, description="예상 수익률(%)")
    user_profile: Optional[Dict[str, Any]] = Field(None, description="사용자 프로필")

class SimulationDataPoint(BaseModel):
    year: float
    amount: int
    principal: int
    interest: int
    cumulative_interest_rate: float

class SimulationResult(BaseModel):
    scenario: Dict[str, Any]
    calculation: Dict[str, Any]
    chart_data: List[SimulationDataPoint]
    ai_analysis: Dict[str, Any]
    achievement_status: Dict[str, Any]
    recommendations: List[str]

class AIAdviceRequest(BaseModel):
    scenario_id: str
    achievement_rate: float
    shortfall: int
    monthly_amount: int
    target_years: int
    user_context: Optional[Dict[str, Any]] = None

# 🎯 시나리오 템플릿 데이터
SCENARIO_TEMPLATES = {
    "house": {
        "id": "house",
        "emoji": "🏠",
        "title": "집사기",
        "description": "3억모으기",
        "target_amount": 300000000,
        "recommended_monthly": 800000,
        "typical_timeframe": 8,
        "risk_level": "conservative",
        "category": "real_estate"
    },
    "retire": {
        "id": "retire", 
        "emoji": "💼",
        "title": "은퇴준비",
        "description": "10억모으기", 
        "target_amount": 1000000000,
        "recommended_monthly": 1500000,
        "typical_timeframe": 15,
        "risk_level": "moderate",
        "category": "retirement"
    },
    "baby": {
        "id": "baby",
        "emoji": "👶", 
        "title": "육아",
        "description": "5천만",
        "target_amount": 50000000,
        "recommended_monthly": 300000,
        "typical_timeframe": 5,
        "risk_level": "conservative", 
        "category": "education"
    }
}

# 🧮 복리 계산 서비스 클래스
class CompoundInterestCalculator:
    @staticmethod
    def calculate_monthly_compound(
        monthly_payment: int, 
        years: int, 
        annual_rate: float,
        detail_points: int = 100
    ) -> List[Dict[str, Any]]:
        """월복리 계산 with 상세 데이터 포인트"""
        
        monthly_rate = annual_rate / 100 / 12
        total_months = years * 12
        data_points = []
        
        # 계산 포인트 간격 결정
        step = max(1, total_months // detail_points)
        
        for month in range(0, total_months + 1, step):
            if month == 0:
                data_points.append({
                    "year": 0.0,
                    "amount": 0,
                    "principal": 0, 
                    "interest": 0,
                    "cumulative_interest_rate": 0.0
                })
                continue
                
            # 복리 계산 공식: PMT * [((1 + r)^n - 1) / r]
            if monthly_rate > 0:
                future_value = monthly_payment * (
                    ((1 + monthly_rate) ** month - 1) / monthly_rate
                )
            else:
                future_value = monthly_payment * month
                
            principal = monthly_payment * month
            interest = future_value - principal
            cumulative_rate = (interest / principal * 100) if principal > 0 else 0
            
            data_points.append({
                "year": round(month / 12, 1),
                "amount": int(future_value),
                "principal": int(principal),
                "interest": int(interest),
                "cumulative_interest_rate": round(cumulative_rate, 2)
            })
        
        return data_points

    @staticmethod 
    def calculate_required_monthly(target_amount: int, years: int, annual_rate: float) -> int:
        """목표금액 달성을 위한 필요 월납입액 계산"""
        monthly_rate = annual_rate / 100 / 12
        total_months = years * 12
        
        if monthly_rate > 0:
            required_monthly = target_amount / (
                ((1 + monthly_rate) ** total_months - 1) / monthly_rate
            )
        else:
            required_monthly = target_amount / total_months
            
        return int(required_monthly)

    @staticmethod
    def calculate_required_years(target_amount: int, monthly_payment: int, annual_rate: float) -> float:
        """목표금액 달성을 위한 필요 기간 계산"""
        monthly_rate = annual_rate / 100 / 12
        
        if monthly_rate > 0:
            required_months = math.log(
                1 + (target_amount * monthly_rate) / monthly_payment
            ) / math.log(1 + monthly_rate)
        else:
            required_months = target_amount / monthly_payment
            
        return round(required_months / 12, 1)

# 🤖 AI 조언 생성 서비스
class SimulationAIService:
    def __init__(self):
        try:
            self.gemini_service = GeminiService()
            self.ai_enabled = True
        except Exception as e:
            logger.warning(f"Gemini AI 초기화 실패: {e}")
            self.ai_enabled = False

    async def generate_advice(self, request: AIAdviceRequest) -> Dict[str, Any]:
        """시뮬레이션 결과 기반 AI 조언 생성"""
        
        scenario = SCENARIO_TEMPLATES.get(request.scenario_id)
        if not scenario:
            raise ValueError(f"Unknown scenario: {request.scenario_id}")

        # 🔥 AI 활성화된 경우
        if self.ai_enabled:
            try:
                return await self._generate_ai_advice(request, scenario)
            except Exception as e:
                logger.error(f"AI 조언 생성 실패: {e}")
                # 폴백으로 규칙 기반 조언 제공
                
        # 📋 규칙 기반 조언 (폴백)
        return self._generate_rule_based_advice(request, scenario)

    async def _generate_ai_advice(self, request: AIAdviceRequest, scenario: Dict) -> Dict[str, Any]:
        """Gemini API 기반 AI 조언"""
        
        prompt = f"""
        사용자의 {scenario['title']} 목표 달성 시뮬레이션 결과를 분석해서 친근하고 실용적인 조언을 해주세요.

        ## 시뮬레이션 정보
        - 목표: {scenario['title']} ({scenario['target_amount']:,}원)
        - 현재 월 저축액: {request.monthly_amount:,}원
        - 목표 기간: {request.target_years}년
        - 달성률: {request.achievement_rate:.1f}%
        - 부족액: {request.shortfall:,}원

        ## 조언 요구사항
        1. 한 줄로 현재 상황 평가 (이모지 포함)
        2. 구체적이고 실행 가능한 개선 방안 1-2개
        3. 긍정적이고 동기부여되는 톤
        4. 100자 이내로 간결하게

        ## 응답 형식
        반드시 JSON 형태로만 응답:
        {{
            "main_comment": "메인 조언 메시지",
            "action_items": ["액션1", "액션2"],
            "motivation": "동기부여 메시지",
            "tone": "positive/warning/encouraging"
        }}
        """

        try:
            ai_response = await self.gemini_service.recommend_financial_model(
                prompt, 
                user_profile=request.user_context
            )
            
            if ai_response and ai_response.get("success"):
                # AI 응답에서 JSON 파싱
                advice_data = ai_response.get("ai_insights", {})
                return {
                    "source": "ai",
                    "main_comment": advice_data.get("main_comment", "목표 달성을 위해 계획을 조정해보세요!"),
                    "action_items": advice_data.get("action_items", []),
                    "motivation": advice_data.get("motivation", "꾸준히 하면 성공할 수 있어요!"),
                    "confidence": 0.8
                }
                
        except Exception as e:
            logger.error(f"AI 조언 파싱 실패: {e}")
            
        # AI 실패시 폴백
        return self._generate_rule_based_advice(request, scenario)

    def _generate_rule_based_advice(self, request: AIAdviceRequest, scenario: Dict) -> Dict[str, Any]:
        """규칙 기반 조언 생성 (폴백)"""
        
        achievement_rate = request.achievement_rate
        shortfall = request.shortfall
        monthly_amount = request.monthly_amount
        target_years = request.target_years
        
        if achievement_rate >= 100:
            return {
                "source": "rule_based",
                "main_comment": f"🎉 목표 달성! {achievement_rate:.0f}% 달성으로 여유있게 성공해요!",
                "action_items": [
                    "현재 계획 유지하기",
                    "추가 목표 설정 고려"
                ],
                "motivation": "완벽한 계획이에요! 🚀",
                "confidence": 1.0
            }
            
        elif achievement_rate >= 90:
            need_more = CompoundInterestCalculator.calculate_required_monthly(
                shortfall, target_years, 4.2  # 기본 수익률
            )
            return {
                "source": "rule_based", 
                "main_comment": f"⚡ 거의 다 왔어요! 월 {need_more:,}원만 더 저축하면 목표 달성!",
                "action_items": [
                    f"월 저축 {need_more:,}원 증액",
                    "부업이나 투잡 고려"
                ],
                "motivation": "조금만 더 힘내면 성공!",
                "confidence": 0.9
            }
            
        elif achievement_rate >= 70:
            required_years = CompoundInterestCalculator.calculate_required_years(
                scenario['target_amount'], monthly_amount, 4.2
            )
            extra_years = required_years - target_years
            return {
                "source": "rule_based",
                "main_comment": f"💪 현재 패턴으로는 {extra_years:.1f}년 더 필요해요. 월 저축을 늘리거나 기간을 조정해보세요!",
                "action_items": [
                    f"기간을 {extra_years:.1f}년 연장하거나",
                    "월 저축액 20% 증액 고려"
                ],
                "motivation": "조금씩 조정하면 달성 가능해요!",
                "confidence": 0.7
            }
            
        else:
            realistic_target = int(scenario['target_amount'] * 0.7)
            return {
                "source": "rule_based",
                "main_comment": f"🎯 목표가 조금 높아요. {realistic_target:,}원 정도로 조정하는 건 어떨까요?",
                "action_items": [
                    "목표 금액 현실적으로 조정",
                    "저축 기간 늘리기"
                ],
                "motivation": "현실적인 목표로 시작해봐요!",
                "confidence": 0.6
            }

# 🚀 API 엔드포인트들
@router.post("/calculate", response_model=SimulationResult)
async def calculate_simulation(
    request: SimulationRequest,
    current_user: dict = Depends(get_current_user)
):
    """시뮬레이션 계산 실행"""
    
    try:
        # 시나리오 검증
        scenario = SCENARIO_TEMPLATES.get(request.scenario_id)
        if not scenario:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"지원하지 않는 시나리오: {request.scenario_id}"
            )

        # 복리 계산
        chart_data = CompoundInterestCalculator.calculate_monthly_compound(
            request.monthly_amount,
            request.target_years, 
            request.expected_return
        )
        
        # 최종 결과 분석
        final_amount = chart_data[-1]["amount"] if chart_data else 0
        target_amount = scenario["target_amount"]
        achievement_rate = (final_amount / target_amount) * 100
        shortfall = max(0, target_amount - final_amount)
        
        # AI 조언 생성
        ai_service = SimulationAIService()
        ai_advice = await ai_service.generate_advice(AIAdviceRequest(
            scenario_id=request.scenario_id,
            achievement_rate=achievement_rate,
            shortfall=shortfall,
            monthly_amount=request.monthly_amount,
            target_years=request.target_years,
            user_context=request.user_profile
        ))

        # 추천사항 생성
        recommendations = _generate_recommendations(
            request, scenario, achievement_rate, final_amount
        )

        return SimulationResult(
            scenario=scenario,
            calculation={
                "final_amount": final_amount,
                "total_principal": request.monthly_amount * request.target_years * 12,
                "total_interest": final_amount - (request.monthly_amount * request.target_years * 12),
                "effective_return_rate": ((final_amount / (request.monthly_amount * request.target_years * 12)) - 1) * 100
            },
            chart_data=[SimulationDataPoint(**point) for point in chart_data],
            ai_analysis=ai_advice,
            achievement_status={
                "rate": round(achievement_rate, 1),
                "shortfall": shortfall,
                "surplus": max(0, final_amount - target_amount),
                "status": "achieved" if achievement_rate >= 100 else "needs_adjustment"
            },
            recommendations=recommendations
        )
        
    except Exception as e:
        logger.error(f"시뮬레이션 계산 오류: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="시뮬레이션 계산 중 오류가 발생했습니다."
        )

@router.get("/scenarios")
async def get_scenarios():
    """사용 가능한 시나리오 목록 조회"""
    return {
        "scenarios": list(SCENARIO_TEMPLATES.values()),
        "total_count": len(SCENARIO_TEMPLATES)
    }

@router.post("/optimize")
async def optimize_plan(
    scenario_id: str,
    target_amount: Optional[int] = None,
    available_monthly: Optional[int] = None,
    target_years: Optional[int] = None,
    current_user: dict = Depends(get_current_user)
):
    """계획 최적화 제안"""
    
    scenario = SCENARIO_TEMPLATES.get(scenario_id)
    if not scenario:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="지원하지 않는 시나리오입니다."
        )
    
    target = target_amount or scenario["target_amount"] 
    
    optimizations = []
    
    # 가능한 월납입액이 주어진 경우
    if available_monthly:
        required_years = CompoundInterestCalculator.calculate_required_years(
            target, available_monthly, 4.2
        )
        optimizations.append({
            "type": "time_optimization",
            "monthly_amount": available_monthly,
            "required_years": required_years,
            "description": f"월 {available_monthly:,}원으로 {required_years:.1f}년 후 달성 가능"
        })
    
    # 목표 기간이 주어진 경우  
    if target_years:
        required_monthly = CompoundInterestCalculator.calculate_required_monthly(
            target, target_years, 4.2
        )
        optimizations.append({
            "type": "amount_optimization", 
            "required_monthly": required_monthly,
            "target_years": target_years,
            "description": f"{target_years}년 안에 달성하려면 월 {required_monthly:,}원 필요"
        })
    
    return {
        "scenario": scenario,
        "optimizations": optimizations,
        "recommendations": _generate_optimization_tips(scenario, target)
    }

# 🛠️ 헬퍼 함수들
def _generate_recommendations(
    request: SimulationRequest, 
    scenario: Dict, 
    achievement_rate: float,
    final_amount: int
) -> List[str]:
    """상황별 추천사항 생성"""
    
    recommendations = []
    
    if achievement_rate >= 100:
        recommendations.extend([
            "현재 계획이 완벽합니다! 꾸준히 실행하세요",
            "여유 자금으로 추가 투자를 고려해보세요",
            "리스크를 줄이고 안정성을 높이는 것도 좋습니다"
        ])
    elif achievement_rate >= 80:
        recommendations.extend([
            "조금만 더! 월 저축액을 10-20% 늘려보세요",
            "기간을 1-2년 연장하는 것도 방법입니다",
            "부업이나 투잡을 고려해보세요"
        ])
    else:
        recommendations.extend([
            "목표를 더 현실적으로 조정해보세요",
            "저축 기간을 충분히 확보하세요", 
            "수익률이 높은 상품을 찾아보세요"
        ])
    
    # 시나리오별 특화 추천
    if request.scenario_id == "house":
        recommendations.append("주택청약이나 정부 지원 제도도 알아보세요")
    elif request.scenario_id == "retire":
        recommendations.append("개인연금이나 퇴직연금 활용을 고려하세요")
    elif request.scenario_id == "baby":
        recommendations.append("교육비 전용 적금 상품을 찾아보세요")
    
    return recommendations

def _generate_optimization_tips(scenario: Dict, target_amount: int) -> List[str]:
    """최적화 팁 생성"""
    
    tips = [
        "수익률을 0.5%만 높여도 큰 차이가 납니다",
        "세제혜택이 있는 상품을 우선 고려하세요",
        "목표 달성 후에도 계속 저축하는 습관을 만드세요"
    ]
    
    if target_amount >= 500000000:  # 5억 이상
        tips.append("큰 목표는 단계별로 나누어 달성하세요")
        
    return tips