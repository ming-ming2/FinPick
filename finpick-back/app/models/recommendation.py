# finpick-back/app/models/recommendation.py
from pydantic import BaseModel, Field # Field 임포트 추가
from typing import List, Dict, Any, Optional,Union 
from datetime import datetime, timezone # timezone 임포트 추가
from enum import Enum
import uuid # uuid 임포트 추가

class InvestmentGoal(str, Enum):
    """투자 목표"""
    SAFETY = "안전한 저축"
    GROWTH = "목돈 마련"
    INVESTMENT = "투자 수익"
    RETIREMENT = "노후 준비"
    EMERGENCY = "비상금 마련"
    HOUSE = "내집 마련"

class RiskTolerance(str, Enum):
    """위험 성향"""
    CONSERVATIVE = "안전 추구형"
    MODERATE = "균형 추구형"
    AGGRESSIVE = "수익 추구형"

class ProductType(str, Enum):
    """상품 타입 - 🔥 더 많은 타입 지원"""
    DEPOSIT = "정기예금"
    SAVINGS = "적금"  
    LOAN = "대출"
    INVESTMENT = "투자상품"
    
    # 🔥 추가 타입들 (데이터에서 실제로 사용되는 타입들)
    DEPOSIT_ALT = "예금"          # 대안 표현
    CREDIT_LOAN = "신용대출"        # 세부 대출 타입
    MORTGAGE_LOAN = "주택담보대출"   # 주택담보대출
    MINUS_LOAN = "마이너스대출"      # 마이너스대출
    FUND = "펀드"                  # 펀드
    ETF = "ETF"                   # ETF
    
    @classmethod
    def normalize(cls, value: str) -> "ProductType":
        """문자열을 표준 ProductType으로 변환"""
        if not value:
            return cls.DEPOSIT # 기본값
            
        value_lower = value.lower()
        
        # 직접 매칭
        for member in cls:
            if member.value == value or member.value.lower() == value_lower:
                return member
        
        # 키워드 기반 매칭 (더 포괄적)
        if '예금' in value_lower:
            return cls.DEPOSIT
        elif '적금' in value_lower:
            return cls.SAVINGS
        elif '신용대출' in value_lower:
            return cls.CREDIT_LOAN
        elif '주택담보대출' in value_lower:
            return cls.MORTGAGE_LOAN
        elif '마이너스대출' in value_lower:
            return cls.MINUS_LOAN
        elif '대출' in value_lower: # 일반적인 '대출'은 LOAN으로
            return cls.LOAN
        elif '펀드' in value_lower:
            return cls.FUND
        elif 'etf' in value_lower:
            return cls.ETF
        elif '투자' in value_lower: # 일반적인 '투자'는 INVESTMENT로
            return cls.INVESTMENT
        else:
            # 기본값
            return cls.DEPOSIT

# 기본 정보
class BasicInfo(BaseModel):
    age: Optional[int] = None # Optional 및 타입 힌트 추가
    gender: Optional[str] = None
    occupation: Optional[str] = None
    residence: Optional[str] = None
    housing_type: Optional[str] = None
    marital_status: Optional[str] = None

# 투자 성향
class InvestmentPersonality(BaseModel):
    risk_tolerance: Optional[RiskTolerance] = None
    investment_experience: Optional[str] = None
    preferred_period: Optional[str] = None
    knowledge_level: Optional[str] = None

# 재무 상황
class FinancialSituation(BaseModel):
    monthly_income: Optional[int] = None
    monthly_expense: Optional[int] = None
    debt_amount: Optional[int] = None
    assets_amount: Optional[int] = None
    credit_score: Optional[int] = None

# 목표 설정
class GoalSetting(BaseModel):
    primary_goal: Optional[InvestmentGoal] = None
    target_amount: Optional[int] = None
    timeframe: Optional[str] = None
    monthly_budget: Optional[int] = None

# 사용자 전체 프로필
class UserProfile(BaseModel):
    basic_info: Optional[BasicInfo] = Field(default_factory=BasicInfo) # 기본값 추가
    investment_personality: Optional[InvestmentPersonality] = Field(default_factory=InvestmentPersonality) # 기본값 추가
    financial_situation: Optional[FinancialSituation] = Field(default_factory=FinancialSituation) # 기본값 추가
    goal_setting: Optional[GoalSetting] = Field(default_factory=GoalSetting) # 기본값 추가


# 추천 요청
class RecommendationRequest(BaseModel):
    user_id: str
    natural_query: Optional[str] = None
    user_profile: Optional[UserProfile] = None
    filters: Optional[Dict[str, Any]] = None
    limit: int = 5

# 개별 상품 추천
class ProductRecommendation(BaseModel):
    product_id: str
    name: str
    type: ProductType # ProductType Enum으로 고정
    provider: str # bank 대신 provider로 통일
    interest_rate: float
    max_interest_rate: Optional[float] = None
    minimum_amount: int
    maximum_amount: Optional[int] = None
    available_periods: Optional[List[int]] = [] # 가용 기간 (예: 12, 24, 36개월)
    
    # 추천 관련
    match_score: float  # 적합도 점수 (0-100)
    recommendation_reason: str
    pros: List[str]
    cons: List[str]
    
    # 가입 조건
    join_conditions: Dict[str, Any]
    special_benefits: Optional[List[str]] = []

    # AI 특화 필드 (백엔드에서 AI 분석 결과를 직접 담을 수 있도록)
    ai_analysis: Optional[Dict[str, Any]] = None


# 추천 결과
class RecommendationResponse(BaseModel):
    user_id: str
    recommendation_id: str = Field(default_factory=lambda: str(uuid.uuid4())) # 기본값 추가
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc)) # 기본값 추가
    
    # 추천 상품들
    recommendations: List[ProductRecommendation] # products 대신 recommendations로 통일
    
    # 추천 요약
    total_count: int
    filters_applied: Optional[Dict[str, Any]] = {} # 어떤 필터가 적용되었는지
    processing_time: float # 처리 시간
    success: bool = True # 성공 여부
    error: Optional[str] = None # 오류 메시지

    # AI 분석 결과
    ai_insights: Optional[Dict[str, Any]] = None
    
    # 다음 액션 제안 (프론트엔드에서 활용)
    suggested_actions: Optional[List[Dict[str, str]]] = []

# 자연어 처리 결과 (기존 모델 확장)
class NaturalLanguageResult(BaseModel):
    success: bool = True
    original_query: str
    parsed_conditions: Optional[Dict[str, Any]] = {}  
    confidence_score: float
    suggested_products: List[ProductType]
    processing_method: Optional[str] = "AI 분석"
    extracted_entities: Optional[Dict[str, Any]] = {}
    timestamp: Optional[datetime] = None
    error: Optional[str] = None

# 사용자 인사이트
class UserInsights(BaseModel):
    user_id: str
    
    # 행동 패턴
    search_patterns: Dict[str, Any]
    preference_trends: Dict[str, Any]
    
    # 개인화 추천
    personalized_suggestions: List[str]
    financial_health_score: float
    goal_achievement_prediction: Dict[str, Any]

# 피드백 데이터
class FeedbackData(BaseModel):
    recommendation_id: str
    user_id: str
    rating: int
    feedback_text: Optional[str] = None
    timestamp: datetime
    interaction_type: str # 'rating', 'click', 'comparison', 'signup' 등
    product_ids: List[str] # 피드백과 관련된 상품 ID 목록

# NaturalLanguageRequest 모델 추가 (recommendations.py에서 사용)
class NaturalLanguageRequest(BaseModel):
    natural_query: str
