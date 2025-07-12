# finpick-back/test_recommendations.py
import asyncio
import json
from app.services.recommendation_service import RecommendationService
from app.models.recommendation import (
    UserProfile, BasicInfo, InvestmentPersonality, 
    FinancialSituation, GoalSetting, RecommendationRequest
)

async def test_recommendation_service():
    """추천 서비스 테스트"""
    print("🧪 FinPick 추천 시스템 테스트 시작\n")
    
    # 1. 서비스 초기화
    service = RecommendationService()
    print(f"✅ 금융상품 데이터 로드: {len(service.financial_products)}개")
    
    # 2. 테스트 사용자 프로필 생성
    test_profile = UserProfile(
        basic_info=BasicInfo(
            age="30대",
            gender="남성", 
            occupation="회사원",
            residence="서울",
            housing_type="전세",
            marital_status="미혼"
        ),
        investment_personality=InvestmentPersonality(
            risk_tolerance="균형 추구형",
            investment_experience="보통",
            preferred_period="2-3년",
            knowledge_level="보통"
        ),
        financial_situation=FinancialSituation(
            monthly_income=4500000,
            monthly_expense=3200000,
            current_savings=15000000,
            debt_amount=0
        ),
        goal_setting=GoalSetting(
            primary_goal="목돈 마련",
            target_amount=50000000,
            timeframe="3년",
            monthly_budget=1000000
        )
    )
    
    # 3. 프로필 분석 테스트
    print("\n📊 사용자 프로필 분석 중...")
    analysis = await RecommendationService.analyze_user_profile("test_user_001", test_profile)
    
    print("분석 결과:")
    print(f"  월 잉여자금: {analysis['financial_health']['monthly_surplus']:,}원")
    print(f"  저축률: {analysis['financial_health']['savings_rate']}%")
    print(f"  위험 등급: {analysis['risk_profile']['risk_level']} (점수: {analysis['risk_profile']['risk_score']})")
    print(f"  목표 달성률: {analysis['goal_analysis']['achievement_probability']}%")
    
    # 4. 추천 생성 테스트
    print("\n🎯 맞춤 상품 추천 생성 중...")
    
    recommendation_request = RecommendationRequest(
        user_profile=test_profile,
        limit=5
    )
    
    recommendations = await service.generate_recommendations("test_user_001", recommendation_request)
    
    print(f"✅ 추천 생성 완료! (ID: {recommendations.recommendation_id})")
    print(f"📈 분석된 상품 수: {recommendations.summary['total_products_analyzed']}")
    print(f"🎯 적합 상품 수: {recommendations.summary['suitable_products_found']}")
    print(f"⭐ 평균 적합도: {recommendations.summary['average_match_score']:.1f}점")
    
    print("\n🏆 추천 상품 목록:")
    for i, product in enumerate(recommendations.products[:3], 1):
        print(f"\n{i}. {product.name} ({product.bank})")
        print(f"   💰 금리: {product.interest_rate}%")
        print(f"   📊 적합도: {product.match_score}점")
        print(f"   💡 추천 이유: {product.recommendation_reason}")
        print(f"   ✅ 장점: {', '.join(product.pros[:2])}")
    
    # 5. 자연어 처리 테스트
    print("\n🗣️ 자연어 처리 테스트...")
    
    test_queries = [
        "월 50만원씩 2년간 안전하게 저축하고 싶어요",
        "1000만원 목돈 마련을 위한 적금 추천해주세요",
        "금리 좋은 예금상품 알려주세요"
    ]
    
    for query in test_queries:
        result = await RecommendationService.process_natural_language("test_user_001", query)
        print(f"\n질문: {query}")
        print(f"추출된 조건: {result.extracted_conditions}")
        print(f"추천 상품 유형: {result.suggested_products}")
    
    print("\n🎉 테스트 완료!")

def test_data_loading():
    """데이터 로딩 테스트"""
    print("📁 금융상품 데이터 로딩 테스트\n")
    
    service = RecommendationService()
    raw_data = service.financial_products
    
    if not raw_data:
        print("❌ 데이터 로딩 실패!")
        return
    
    # 데이터가 딕셔너리인지 확인하고 모든 상품을 하나의 리스트로 합치기
    if isinstance(raw_data, dict):
        all_products = []
        category_counts = {}
        
        for category, products in raw_data.items():
            if isinstance(products, list):
                all_products.extend(products)
                category_counts[category] = len(products)
        
        print("📊 카테고리별 상품 통계:")
        for category, count in category_counts.items():
            print(f"  {category}: {count}개")
        
        # 상품 타입별 통계
        type_counts = {}
        for product in all_products:
            if isinstance(product, dict):
                product_type = product.get('type', 'Unknown')
                type_counts[product_type] = type_counts.get(product_type, 0) + 1
        
        print(f"\n📈 총 상품 수: {len(all_products)}개")
        print("📊 타입별 통계:")
        for ptype, count in type_counts.items():
            print(f"  {ptype}: {count}개")
        
        # 샘플 상품 출력
        print("\n📋 샘플 상품:")
        for i, product in enumerate(all_products[:3], 1):
            if isinstance(product, dict):
                print(f"\n{i}. {product.get('name', 'Unknown')}")
                print(f"   은행: {product.get('provider', {}).get('name', 'Unknown')}")
                print(f"   타입: {product.get('type', 'Unknown')}")
                print(f"   금리: {product.get('details', {}).get('interest_rate', 0)}%")
    else:
        print(f"❌ 예상과 다른 데이터 형식: {type(raw_data)}")
        print(f"데이터 내용: {raw_data}")

if __name__ == "__main__":
    print("=" * 60)
    print("🏦 FinPick 추천 시스템 테스트")
    print("=" * 60)
    
    # 데이터 로딩 테스트
    test_data_loading()
    
    print("\n" + "=" * 60)
    
    # 추천 서비스 테스트
    asyncio.run(test_recommendation_service())