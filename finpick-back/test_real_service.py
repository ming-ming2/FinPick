# finpick-back/test_real_service.py - 실제 서비스 테스트

import asyncio
import os
from dotenv import load_dotenv
from app.services.recommendation_service import RecommendationService
from app.models.recommendation import RecommendationRequest

# .env 파일 로드
load_dotenv()

async def test_real_recommendation():
    """실제 추천 서비스 테스트"""
    try:
        print("🧪 실제 추천 서비스 테스트 시작")
        print("=" * 60)
        
        # 1. 서비스 초기화
        service = RecommendationService()
        print(f"✅ 서비스 초기화: {len(service.financial_products)}개 상품 로드")
        print(f"🤖 AI 모드: {'ON' if service.use_ai else 'OFF (폴백 모드)'}")
        
        # 2. 자연어 처리 테스트
        print("\n🔍 자연어 처리 테스트:")
        test_queries = [
            "50만원 대출받고싶어",
            "안전한 예금 상품 추천해줘",
            "월 30만원씩 2년간 적금하고 싶어"
        ]
        
        for query in test_queries:
            print(f"\n📝 테스트 쿼리: '{query}'")
            try:
                nlp_result = await RecommendationService.process_natural_language(
                    user_id="test_user",
                    query=query
                )
                print(f"   ✅ 추출된 조건: {nlp_result.extracted_conditions}")
                print(f"   📊 신뢰도: {nlp_result.confidence_score}")
                print(f"   🎯 추천 상품 타입: {[str(p.value) for p in nlp_result.suggested_products]}")
            except Exception as e:
                print(f"   ❌ 오류: {e}")
        
        # 3. 추천 생성 테스트
        print(f"\n🎯 추천 생성 테스트:")
        try:
            # 🔥 RecommendationRequest 객체 생성 (user_id 제외)
            request = RecommendationRequest(
                user_profile=None,
                natural_query="50만원 대출받고싶어", 
                filters={"target_amount": 500000},
                limit=3
            )
            
            # 🔥 user_id는 별도로 전달
            recommendations = await service.generate_recommendations(
                user_id="test_user_123",  # 여기서 user_id 전달
                request=request
            )
            
            print(f"   ✅ 추천 ID: {recommendations.recommendation_id}")
            print(f"   📊 추천 상품 수: {len(recommendations.products)}")
            print(f"   ⭐ 평균 적합도: {recommendations.summary.get('average_match_score', 'N/A')}")
            
            # 추천 상품 상세 정보
            for i, product in enumerate(recommendations.products[:2], 1):
                print(f"\n   {i}. {product.name} ({product.bank})")
                print(f"      💰 금리: {product.interest_rate}%")
                print(f"      📈 적합도: {product.match_score}점")
                print(f"      💡 이유: {product.recommendation_reason[:50]}...")
                
        except Exception as e:
            print(f"   ❌ 추천 생성 오류: {e}")
            import traceback
            print(f"   📋 상세 오류:\n{traceback.format_exc()}")
        
        print("\n" + "=" * 60)
        print("🏁 테스트 완료!")
        
    except Exception as e:
        print(f"❌ 전체 테스트 실패: {e}")
        import traceback
        print(f"📋 상세 오류:\n{traceback.format_exc()}")

if __name__ == "__main__":
    asyncio.run(test_real_recommendation())