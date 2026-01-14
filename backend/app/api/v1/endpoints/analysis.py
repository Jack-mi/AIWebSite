from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends, Query
from pydantic import BaseModel, HttpUrl
from typing import Dict, List, Optional, Any
from uuid import UUID
import asyncio

from app.services.ai.website_analyzer import website_analyzer
from app.core.database import get_db
from app.models.website import Website, Analysis
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

router = APIRouter()

class AnalysisRequest(BaseModel):
    url: HttpUrl
    analysis_types: List[str] = ["intent", "tech_stack", "traffic"]

class AnalysisResponse(BaseModel):
    analysis_id: str
    website_id: str
    status: str
    message: str

class WebsiteAnalysisResult(BaseModel):
    website_id: str
    url: str
    domain: str
    title: str
    meta_description: str
    analysis_timestamp: str
    processing_time_ms: int
    status: str
    intent_analysis: Optional[Dict[str, Any]] = None
    technology_stack: Optional[Dict[str, Any]] = None
    user_experience: Optional[Dict[str, Any]] = None

@router.post("/analyze", response_model=AnalysisResponse)
async def submit_analysis(
    request: AnalysisRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """
    Submit a website for analysis
    """
    try:
        url_str = str(request.url)

        # Check if analysis is already in progress
        result = await db.execute(
            select(Website).where(Website.url == url_str)
        )
        existing_website = result.scalar_one_or_none()

        if existing_website and existing_website.analysis_status == "in_progress":
            return AnalysisResponse(
                analysis_id=str(existing_website.id),
                website_id=str(existing_website.id),
                status="in_progress",
                message="Analysis already in progress for this website"
            )

        # Start analysis in background
        background_tasks.add_task(website_analyzer.analyze_website, url_str)

        # Create or get website record
        if existing_website:
            website_id = existing_website.id
        else:
            # This will be created in the analyzer, so we'll return a temporary response
            return AnalysisResponse(
                analysis_id="pending",
                website_id="pending",
                status="submitted",
                message="Analysis submitted successfully"
            )

        return AnalysisResponse(
            analysis_id=str(website_id),
            website_id=str(website_id),
            status="submitted",
            message="Analysis submitted successfully"
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit analysis: {str(e)}")

@router.get("/analyze/{analysis_id}")
async def get_analysis_status(
    analysis_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Get analysis status and results
    """
    try:
        # Get website record
        result = await db.execute(
            select(Website).where(Website.id == analysis_id)
        )
        website = result.scalar_one_or_none()

        if not website:
            raise HTTPException(status_code=404, detail="Analysis not found")

        # Get analysis results
        analysis_result = await db.execute(
            select(Analysis).where(Analysis.website_id == analysis_id)
            .order_by(Analysis.created_at.desc())
        )
        analyses = analysis_result.scalars().all()

        response = {
            "analysis_id": str(analysis_id),
            "website_id": str(website.id),
            "url": website.url,
            "domain": website.domain,
            "title": website.title,
            "status": website.analysis_status,
            "last_analyzed": website.last_analyzed.isoformat() if website.last_analyzed else None,
            "analyses": []
        }

        for analysis in analyses:
            if analysis.result:
                response["analyses"].append({
                    "id": str(analysis.id),
                    "type": analysis.analysis_type,
                    "status": analysis.status,
                    "result": analysis.result,
                    "confidence_score": float(analysis.confidence_score) if analysis.confidence_score else None,
                    "processing_time_ms": analysis.processing_time_ms,
                    "created_at": analysis.created_at.isoformat()
                })

        return response

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get analysis: {str(e)}")

@router.get("/websites/{website_id}")
async def get_website_details(
    website_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Get website details and all analyses
    """
    try:
        # Get website record
        result = await db.execute(
            select(Website).where(Website.id == website_id)
        )
        website = result.scalar_one_or_none()

        if not website:
            raise HTTPException(status_code=404, detail="Website not found")

        # Get all analyses for this website
        analysis_result = await db.execute(
            select(Analysis).where(Analysis.website_id == website_id)
            .order_by(Analysis.created_at.desc())
        )
        analyses = analysis_result.scalars().all()

        return {
            "website": {
                "id": str(website.id),
                "url": website.url,
                "domain": website.domain,
                "title": website.title,
                "description": website.description,
                "analysis_status": website.analysis_status,
                "last_analyzed": website.last_analyzed.isoformat() if website.last_analyzed else None,
                "created_at": website.created_at.isoformat(),
                "updated_at": website.updated_at.isoformat()
            },
            "analyses": [
                {
                    "id": str(analysis.id),
                    "type": analysis.analysis_type,
                    "status": analysis.status,
                    "result": analysis.result,
                    "confidence_score": float(analysis.confidence_score) if analysis.confidence_score else None,
                    "processing_time_ms": analysis.processing_time_ms,
                    "created_at": analysis.created_at.isoformat()
                }
                for analysis in analyses
            ]
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get website details: {str(e)}")

@router.get("/websites/{website_id}/tech-stack")
async def get_website_tech_stack(
    website_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Get technology stack analysis for a website
    """
    try:
        from app.models.website import TechnologyStack

        # Get technology stack records
        result = await db.execute(
            select(TechnologyStack).where(TechnologyStack.website_id == website_id)
            .order_by(TechnologyStack.category, TechnologyStack.technology)
        )
        tech_stacks = result.scalars().all()

        if not tech_stacks:
            raise HTTPException(status_code=404, detail="Technology stack analysis not found")

        # Group by category
        tech_by_category = {}
        for tech in tech_stacks:
            category = tech.category
            if category not in tech_by_category:
                tech_by_category[category] = []

            tech_by_category[category].append({
                "technology": tech.technology,
                "version": tech.version,
                "confidence": float(tech.confidence) if tech.confidence else None,
                "detection_method": tech.detection_method,
                "created_at": tech.created_at.isoformat()
            })

        return {
            "website_id": str(website_id),
            "technologies_by_category": tech_by_category,
            "total_technologies": len(tech_stacks)
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get tech stack: {str(e)}")

@router.get("/websites")
async def list_websites(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    status: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    List all analyzed websites with pagination
    """
    try:
        # Build query
        query = select(Website).order_by(Website.created_at.desc())

        if status:
            query = query.where(Website.analysis_status == status)

        query = query.offset(skip).limit(limit)

        result = await db.execute(query)
        websites = result.scalars().all()

        return {
            "websites": [
                {
                    "id": str(website.id),
                    "url": website.url,
                    "domain": website.domain,
                    "title": website.title,
                    "description": website.description,
                    "analysis_status": website.analysis_status,
                    "last_analyzed": website.last_analyzed.isoformat() if website.last_analyzed else None,
                    "created_at": website.created_at.isoformat()
                }
                for website in websites
            ],
            "pagination": {
                "skip": skip,
                "limit": limit,
                "total": len(websites)
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list websites: {str(e)}")

@router.delete("/websites/{website_id}")
async def delete_website(
    website_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a website and all its analyses
    """
    try:
        # Get website record
        result = await db.execute(
            select(Website).where(Website.id == website_id)
        )
        website = result.scalar_one_or_none()

        if not website:
            raise HTTPException(status_code=404, detail="Website not found")

        # Delete website (cascading deletes will handle analyses)
        await db.delete(website)
        await db.commit()

        return {"message": "Website deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete website: {str(e)}")