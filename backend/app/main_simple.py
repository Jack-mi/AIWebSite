"""
Simplified FastAPI application for InsightEye
Minimal version without complex dependencies
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import uvicorn

# Simple request/response models
class WebsiteAnalysisRequest(BaseModel):
    url: str
    analysis_types: List[str] = ["basic"]

class WebsiteAnalysisResponse(BaseModel):
    id: str
    url: str
    status: str
    results: Dict[str, Any]

# Create FastAPI app
app = FastAPI(
    title="InsightEye API",
    description="AI-powered website analysis tool - Simplified Version",
    version="1.0.0-simple"
)

# Set CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "InsightEye API - Simplified Version",
        "version": "1.0.0-simple",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "mode": "simplified"}

@app.get("/api/v1/status")
async def api_status():
    return {
        "api_version": "v1",
        "status": "operational",
        "features": ["basic_analysis"],
        "database": "supabase_rest_api"
    }

@app.post("/api/v1/analysis/analyze")
async def analyze_website(request: WebsiteAnalysisRequest):
    """
    AI-powered website analysis using Gemini 2.5 Flash
    """
    import uuid
    import time

    # Basic URL validation
    if not request.url.startswith(("http://", "https://")):
        raise HTTPException(status_code=400, detail="Invalid URL format")

    # Generate analysis ID
    analysis_id = str(uuid.uuid4())

    try:
        # 使用Gemini分析器（已修复，使用真实的OpenRouter AI，无需数据库）
        from app.services.ai.gemini_analyzer import gemini_analyzer
        from app.services.external.web_scraper import web_scraper
        
        # 抓取网站内容
        scrape_result = await web_scraper.scrape_website(request.url)
        html_content = scrape_result.get("text_content", "")
        
        # 使用真实AI分析
        analysis_results = await gemini_analyzer.analyze_website(request.url, html_content)
    except Exception as e:
        error_msg = f"Analysis failed: {str(e)}"
        print(error_msg)
        # 返回错误信息，不使用模拟数据
        raise HTTPException(status_code=500, detail=error_msg)

    # Return the full analysis results
    # The website_analyzer returns: intent_analysis, technology_stack, user_experience
    return WebsiteAnalysisResponse(
        id=analysis_id,
        url=request.url,
        status=analysis_results.get("status", "completed"),
        results=analysis_results
    )

@app.get("/api/v1/analysis/analyze/{analysis_id}")
async def get_analysis(analysis_id: str):
    """
    Get analysis results by ID
    Returns mock data for now
    """
    return {
        "id": analysis_id,
        "status": "completed",
        "url": "https://example.com",
        "created_at": "2024-01-14T16:00:00Z",
        "results": {
            "basic": {
                "title": "Sample Analysis Results",
                "description": "This is a mock analysis result",
                "technologies": ["React", "FastAPI", "Supabase"],
                "performance_score": 88
            }
        }
    }

@app.get("/api/v1/websites")
async def list_websites(limit: int = 10, offset: int = 0):
    """
    List analyzed websites
    Returns mock data for now
    """
    mock_websites = [
        {
            "id": "1",
            "url": "https://example.com",
            "domain": "example.com",
            "title": "Example Website",
            "last_analyzed": "2024-01-14T16:00:00Z",
            "status": "completed"
        },
        {
            "id": "2",
            "url": "https://demo.com",
            "domain": "demo.com",
            "title": "Demo Site",
            "last_analyzed": "2024-01-14T15:30:00Z",
            "status": "completed"
        }
    ]

    # Simple pagination
    start = offset
    end = offset + limit
    paginated_results = mock_websites[start:end]

    return {
        "websites": paginated_results,
        "total": len(mock_websites),
        "limit": limit,
        "offset": offset
    }

if __name__ == "__main__":
    uvicorn.run(
        "main_simple:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )