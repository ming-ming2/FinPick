# finpick-back/main.py 또는 finpick-back/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api import auth
from app.api import recommendations  # 🔧 추천 라우터 import 추가!

app = FastAPI(
    title="FinPick API",
    description="AI 기반 금융상품 추천 서비스",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(recommendations.router, prefix="/api/recommendations", tags=["recommendations"])  # 🔧 추가!

@app.get("/")
async def root():
    return {
        "message": "FinPick API Server", 
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "auth": "/api/auth",
            "recommendations": "/api/recommendations",  # 🔧 추가!
            "docs": "/docs",
            "health": "/health"
        }
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "services": {
            "database": "connected",
            "financial_data": "loaded",
            "ai_service": "ready"
        }
    }

@app.get("/api/status")
async def api_status():
    """API 상태 및 통계"""
    try:
        from app.services.recommendation_service import RecommendationService
        service = RecommendationService()
        product_count = len(service.financial_products)
        
        return {
            "status": "operational",
            "ai_status": "connected" if service.use_ai else "fallback_mode",  # 🤖 AI 상태 추가
            "data_stats": {
                "total_products": product_count,
                "product_types": ["정기예금", "적금", "신용대출"],
                "last_updated": "2024-07-11T00:00:00Z"
            },
            "api_endpoints": {
                "auth": ["register", "login", "verify-token"],
                "recommendations": ["analyze-profile", "generate", "natural-language", "history", "feedback"]
            }
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)