# finpick-back/app/models/recommendation.py
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any, Union
from datetime import datetime
from enum import Enum

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
    """상품 타입"""
    DEPOSIT = "정기예금"
    SAVINGS = "적금"
    LOAN = "대출"
    INVESTMENT = "투자상품"

# 기본 정보
class BasicInfo(BaseModel):
    age: str
    gender: str
    occupation: str
    residence: str
    housing_type: str
    marital_status: str

# 투자 성향
class InvestmentPersonality(BaseModel):
    risk_tolerance: RiskTolerance
    investment_experience: str
    preferred_period: str
    knowledge_level: str

# 재무 상황
class FinancialSituation(BaseModel):
    monthly_income: int
    monthly_expense: int
    current_savings: int
    debt_amount: int
    credit_score: Optional[str] = None

# 목표 설정
class GoalSetting(BaseModel):
    primary_goal: InvestmentGoal
    target_amount: int
    timeframe: str
    monthly_budget: int

# 전체 사용자 프로필
class UserProfile(BaseModel):
    basic_info: BasicInfo
    investment_personality: InvestmentPersonality
    financial_situation: FinancialSituation
    goal_setting: GoalSetting
    
    # 계산된 필드들
    surplus_funds: Optional[int] = None
    savings_rate: Optional[float] = None
    risk_level: Optional[int] = None

# 추천 요청
class RecommendationRequest(BaseModel):
    user_profile: Optional[UserProfile] = None
    natural_query: Optional[str] = None
    filters: Optional[Dict[str, Any]] = None
    preferred_products: Optional[List[ProductType]] = []
    limit: int = Field(default=5, le=20)

# 개별 상품 추천
class ProductRecommendation(BaseModel):
    product_id: str
    name: str
    type: ProductType
    bank: str
    
    # 상품 정보
    interest_rate: float
    max_interest_rate: Optional[float] = None
    minimum_amount: int
    maximum_amount: Optional[int] = None
    available_periods: List[int]
    
    # 추천 관련
    match_score: float  # 적합도 점수 (0-100)
    recommendation_reason: str
    pros: List[str]
    cons: List[str]
    
    # 가입 조건
    join_conditions: Dict[str, Any]
    special_benefits: Optional[List[str]] = []

# 추천 결과
class RecommendationResponse(BaseModel):
    user_id: str
    recommendation_id: str
    created_at: datetime
    
    # 추천 상품들
    products: List[ProductRecommendation]
    
    # 추천 요약
    summary: Dict[str, Any]
    total_count: int
    
    # AI 분석 결과
    ai_analysis: Optional[Dict[str, Any]] = None
    
    # 다음 액션 제안
    suggested_actions: List[Dict[str, str]]

# 자연어 처리 결과
class NaturalLanguageResult(BaseModel):
    original_query: str
    extracted_conditions: Dict[str, Any]
    confidence_score: float
    suggested_products: List[ProductType]

# 사용자 인사이트
class UserInsights(BaseModel):
    user_id: str
    
    # 행동 패턴
    search_patterns: Dict[str, Any]
    preference_trends: Dict[str, Any]
    
    # 개인화 추천
    personalized_suggestions: List[str]
    financial_health_score: Optional[float] = None
    
    # 목표 달성 예측
    goal_achievement_prediction: Dict[str, Any]

# 피드백 데이터
class FeedbackData(BaseModel):
    recommendation_id: str
    user_id: str
    rating: int = Field(ge=1, le=5)
    feedback_text: Optional[str] = None
    timestamp: datetime
    
    # 추가 메타데이터
    interaction_type: str  # "like", "dislike", "save", "apply"
    product_ids: List[str]