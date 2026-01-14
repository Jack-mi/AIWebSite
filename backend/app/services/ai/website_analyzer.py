import asyncio
from typing import Dict, List, Optional, Any
from datetime import datetime
import time
from urllib.parse import urlparse

from app.services.external.openrouter_client import openrouter_client
from app.services.external.web_scraper import web_scraper
from app.models.website import Website, Analysis, TechnologyStack, AnalysisStatus
from app.core.database import AsyncSessionLocal
from sqlalchemy import select

class WebsiteAnalyzer:
    def __init__(self):
        self.openrouter = openrouter_client
        self.scraper = web_scraper

    async def analyze_website(self, url: str, user_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Perform comprehensive website analysis
        """
        start_time = time.time()

        try:
            # Step 1: Validate and normalize URL
            normalized_url = self._normalize_url(url)
            domain = urlparse(normalized_url).netloc

            # Step 2: Check if website exists in database
            async with AsyncSessionLocal() as session:
                result = await session.execute(
                    select(Website).where(Website.url == normalized_url)
                )
                existing_website = result.scalar_one_or_none()

                if existing_website:
                    website_id = existing_website.id
                    # Check if recent analysis exists (within last 24 hours)
                    if (existing_website.last_analyzed and
                        (datetime.utcnow() - existing_website.last_analyzed).total_seconds() < 86400):
                        # Return cached results
                        return await self._get_cached_analysis(website_id, session)
                else:
                    # Create new website record
                    website = Website(
                        url=normalized_url,
                        domain=domain,
                        analysis_status=AnalysisStatus.IN_PROGRESS
                    )
                    session.add(website)
                    await session.commit()
                    await session.refresh(website)
                    website_id = website.id

            # Step 3: Scrape website content
            scrape_result = await self.scraper.scrape_website(normalized_url)

            # Step 4: Perform parallel analysis
            analysis_tasks = [
                self._analyze_intent_and_features(scrape_result),
                self._detect_technology_stack(scrape_result),
                self._analyze_user_experience(scrape_result)
            ]

            results = await asyncio.gather(*analysis_tasks, return_exceptions=True)

            # Step 5: Consolidate results
            analysis_result = {
                "website_id": str(website_id),
                "url": normalized_url,
                "domain": domain,
                "title": scrape_result.get("title", ""),
                "meta_description": scrape_result.get("meta_description", ""),
                "analysis_timestamp": datetime.utcnow().isoformat(),
                "processing_time_ms": int((time.time() - start_time) * 1000),
                "status": "completed"
            }

            # Process each analysis result
            if not isinstance(results[0], Exception):
                analysis_result["intent_analysis"] = results[0]

            if not isinstance(results[1], Exception):
                analysis_result["technology_stack"] = results[1]

            if not isinstance(results[2], Exception):
                analysis_result["user_experience"] = results[2]

            # Step 6: Save results to database
            await self._save_analysis_results(website_id, analysis_result)

            # Step 7: Update website status
            async with AsyncSessionLocal() as session:
                result = await session.execute(
                    select(Website).where(Website.id == website_id)
                )
                website = result.scalar_one()
                website.analysis_status = AnalysisStatus.COMPLETED
                website.last_analyzed = datetime.utcnow()
                website.title = scrape_result.get("title", "")
                website.description = scrape_result.get("meta_description", "")
                await session.commit()

            return analysis_result

        except Exception as e:
            # Update website status to failed
            if 'website_id' in locals():
                async with AsyncSessionLocal() as session:
                    result = await session.execute(
                        select(Website).where(Website.id == website_id)
                    )
                    website = result.scalar_one_or_none()
                    if website:
                        website.analysis_status = AnalysisStatus.FAILED
                        await session.commit()

            raise Exception(f"Website analysis failed: {str(e)}")

    async def _analyze_intent_and_features(self, scrape_result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze user intents and website features using AI
        """
        content = scrape_result.get("text_content", "")
        url = scrape_result.get("url", "")

        # Parallel AI analysis
        intent_task = self.openrouter.extract_user_intents(content, url)
        features_task = self.openrouter.identify_features(content, url)
        comprehensive_task = self.openrouter.analyze_website_content(content, url)

        intents, features, comprehensive = await asyncio.gather(
            intent_task, features_task, comprehensive_task,
            return_exceptions=True
        )

        result = {
            "analysis_type": "intent_and_features",
            "confidence_score": 0.8
        }

        if not isinstance(intents, Exception):
            result["user_intents"] = intents

        if not isinstance(features, Exception):
            result["features"] = features

        if not isinstance(comprehensive, Exception):
            result["comprehensive_analysis"] = comprehensive
            if "confidence_score" in comprehensive:
                result["confidence_score"] = comprehensive["confidence_score"]

        return result

    async def _detect_technology_stack(self, scrape_result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Detect technology stack used by the website
        """
        html_content = scrape_result.get("html_content", "")
        url = scrape_result.get("url", "")

        technologies = await self.scraper.detect_technologies(html_content, url)

        # Group technologies by category
        tech_by_category = {}
        for tech in technologies:
            category = tech.get("category", "other")
            if category not in tech_by_category:
                tech_by_category[category] = []
            tech_by_category[category].append(tech)

        return {
            "analysis_type": "technology_stack",
            "technologies_by_category": tech_by_category,
            "total_technologies_detected": len(technologies),
            "confidence_score": 0.9
        }

    async def _analyze_user_experience(self, scrape_result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze user experience aspects of the website
        """
        content = scrape_result.get("text_content", "")
        links = scrape_result.get("links", [])
        forms = scrape_result.get("forms", [])
        images = scrape_result.get("images", [])

        # Basic UX metrics
        ux_analysis = {
            "analysis_type": "user_experience",
            "navigation": {
                "total_links": len(links),
                "internal_links": len([l for l in links if scrape_result.get("domain", "") in l.get("href", "")]),
                "external_links": len([l for l in links if scrape_result.get("domain", "") not in l.get("href", "")])
            },
            "content": {
                "total_words": len(content.split()),
                "readability_score": self._calculate_readability_score(content)
            },
            "interactivity": {
                "forms_count": len(forms),
                "images_count": len(images),
                "has_search": any("search" in form.get("action", "").lower() for form in forms)
            },
            "confidence_score": 0.7
        }

        return ux_analysis

    def _calculate_readability_score(self, text: str) -> float:
        """
        Simple readability score calculation
        """
        words = text.split()
        sentences = text.split('.')

        if len(sentences) == 0 or len(words) == 0:
            return 0.0

        avg_words_per_sentence = len(words) / len(sentences)

        # Simple scoring: prefer 10-20 words per sentence
        if 10 <= avg_words_per_sentence <= 20:
            score = 1.0
        elif avg_words_per_sentence < 10:
            score = avg_words_per_sentence / 10
        else:
            score = max(0.1, 1.0 - (avg_words_per_sentence - 20) / 50)

        return min(1.0, max(0.0, score))

    def _normalize_url(self, url: str) -> str:
        """
        Normalize URL for consistent storage
        """
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url

        # Remove trailing slash
        url = url.rstrip('/')

        return url

    async def _get_cached_analysis(self, website_id: str, session) -> Dict[str, Any]:
        """
        Retrieve cached analysis results
        """
        result = await session.execute(
            select(Analysis).where(Analysis.website_id == website_id)
            .order_by(Analysis.created_at.desc())
        )
        analyses = result.scalars().all()

        cached_result = {
            "website_id": str(website_id),
            "status": "cached",
            "analyses": []
        }

        for analysis in analyses:
            if analysis.result:
                cached_result["analyses"].append({
                    "type": analysis.analysis_type,
                    "result": analysis.result,
                    "confidence_score": float(analysis.confidence_score) if analysis.confidence_score else None,
                    "created_at": analysis.created_at.isoformat()
                })

        return cached_result

    async def _save_analysis_results(self, website_id: str, analysis_result: Dict[str, Any]) -> None:
        """
        Save analysis results to database
        """
        async with AsyncSessionLocal() as session:
            # Save main analysis
            main_analysis = Analysis(
                website_id=website_id,
                analysis_type="comprehensive",
                status=AnalysisStatus.COMPLETED,
                result=analysis_result,
                confidence_score=analysis_result.get("confidence_score", 0.8),
                processing_time_ms=analysis_result.get("processing_time_ms", 0)
            )
            session.add(main_analysis)

            # Save technology stack details
            if "technology_stack" in analysis_result:
                tech_data = analysis_result["technology_stack"]
                for category, technologies in tech_data.get("technologies_by_category", {}).items():
                    for tech in technologies:
                        tech_stack = TechnologyStack(
                            website_id=website_id,
                            category=category,
                            technology=tech.get("technology", ""),
                            confidence=tech.get("confidence", 0.0),
                            detection_method="automated"
                        )
                        session.add(tech_stack)

            await session.commit()

# Create global instance
website_analyzer = WebsiteAnalyzer()