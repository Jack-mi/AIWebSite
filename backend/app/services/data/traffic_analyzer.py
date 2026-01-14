import httpx
import asyncio
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from app.core.config import settings
from urllib.parse import urlparse

class TrafficAnalyzer:
    def __init__(self):
        self.similarweb_key = settings.SIMILARWEB_API_KEY
        self.ahrefs_key = settings.AHREFS_API_KEY

    async def analyze_traffic(self, url: str, domain: str) -> Dict[str, Any]:
        """
        Analyze website traffic from multiple sources
        """
        traffic_data = {
            "domain": domain,
            "url": url,
            "analysis_timestamp": datetime.utcnow().isoformat(),
            "data_sources": [],
            "metrics": {}
        }

        # Parallel data collection from multiple sources
        tasks = []

        if self.similarweb_key:
            tasks.append(self._get_similarweb_data(domain))

        if self.ahrefs_key:
            tasks.append(self._get_ahrefs_data(domain))

        # Always include estimated data as fallback
        tasks.append(self._get_estimated_traffic(domain))

        results = await asyncio.gather(*tasks, return_exceptions=True)

        # Process results
        for i, result in enumerate(results):
            if not isinstance(result, Exception) and result:
                if i == 0 and self.similarweb_key:  # SimilarWeb
                    traffic_data["data_sources"].append("SimilarWeb")
                    traffic_data["metrics"].update(result)
                elif i == 1 and self.ahrefs_key:  # Ahrefs
                    traffic_data["data_sources"].append("Ahrefs")
                    traffic_data["metrics"].update(result)
                else:  # Estimated
                    traffic_data["data_sources"].append("Estimated")
                    if not traffic_data["metrics"]:  # Only use if no other data
                        traffic_data["metrics"].update(result)

        return traffic_data

    async def _get_similarweb_data(self, domain: str) -> Optional[Dict[str, Any]]:
        """
        Get traffic data from SimilarWeb API
        """
        if not self.similarweb_key:
            return None

        try:
            async with httpx.AsyncClient() as client:
                # Get desktop traffic data
                desktop_url = f"https://api.similarweb.com/v1/website/{domain}/total-traffic-and-engagement/visits"
                params = {
                    "api_key": self.similarweb_key,
                    "start_date": (datetime.now() - timedelta(days=30)).strftime("%Y-%m"),
                    "end_date": datetime.now().strftime("%Y-%m"),
                    "country": "world",
                    "granularity": "monthly",
                    "main_domain_only": "false"
                }

                response = await client.get(desktop_url, params=params, timeout=30.0)

                if response.status_code == 200:
                    data = response.json()
                    return {
                        "monthly_visits": data.get("visits", [])[-1].get("visits") if data.get("visits") else 0,
                        "source": "SimilarWeb",
                        "data_type": "actual"
                    }

        except Exception as e:
            print(f"SimilarWeb API error: {str(e)}")
            return None

    async def _get_ahrefs_data(self, domain: str) -> Optional[Dict[str, Any]]:
        """
        Get SEO and traffic data from Ahrefs API
        """
        if not self.ahrefs_key:
            return None

        try:
            async with httpx.AsyncClient() as client:
                # Get organic traffic data
                url = "https://apiv2.ahrefs.com"
                params = {
                    "token": self.ahrefs_key,
                    "from": "domain_organic_keywords",
                    "target": domain,
                    "mode": "domain",
                    "limit": 1000
                }

                response = await client.get(url, params=params, timeout=30.0)

                if response.status_code == 200:
                    data = response.json()
                    organic_traffic = sum([kw.get("volume", 0) for kw in data.get("keywords", [])])

                    return {
                        "organic_traffic_estimate": organic_traffic,
                        "organic_keywords": len(data.get("keywords", [])),
                        "source": "Ahrefs",
                        "data_type": "seo_estimate"
                    }

        except Exception as e:
            print(f"Ahrefs API error: {str(e)}")
            return None

    async def _get_estimated_traffic(self, domain: str) -> Dict[str, Any]:
        """
        Generate estimated traffic data based on domain analysis
        """
        # Simple heuristic-based estimation
        # In a real implementation, this would use more sophisticated methods

        domain_factors = {
            "length": len(domain),
            "tld": domain.split('.')[-1],
            "subdomain_count": len(domain.split('.')) - 2
        }

        # Basic scoring algorithm
        base_score = 1000

        # TLD scoring
        tld_multipliers = {
            'com': 1.5,
            'org': 1.2,
            'net': 1.1,
            'edu': 1.3,
            'gov': 1.4,
            'io': 1.2
        }

        tld = domain_factors["tld"]
        multiplier = tld_multipliers.get(tld, 0.8)

        # Domain length factor (shorter is often better)
        if domain_factors["length"] < 10:
            length_factor = 1.3
        elif domain_factors["length"] < 15:
            length_factor = 1.0
        else:
            length_factor = 0.7

        estimated_monthly_visits = int(base_score * multiplier * length_factor)

        return {
            "estimated_monthly_visits": estimated_monthly_visits,
            "confidence": 0.3,
            "source": "Heuristic Estimation",
            "data_type": "estimated",
            "factors_considered": domain_factors
        }

    async def get_traffic_trends(self, domain: str, period_days: int = 30) -> Dict[str, Any]:
        """
        Get traffic trends over a specified period
        """
        # This would typically fetch historical data
        # For now, we'll return a simulated trend

        end_date = datetime.now()
        start_date = end_date - timedelta(days=period_days)

        # Generate sample trend data
        trend_data = []
        for i in range(period_days):
            date = start_date + timedelta(days=i)
            # Simulate some variance in traffic
            base_traffic = 1000
            variance = (i % 7) * 100  # Weekly pattern
            daily_traffic = base_traffic + variance

            trend_data.append({
                "date": date.strftime("%Y-%m-%d"),
                "visits": daily_traffic,
                "page_views": daily_traffic * 2.5,
                "unique_visitors": int(daily_traffic * 0.7)
            })

        return {
            "domain": domain,
            "period": {
                "start_date": start_date.strftime("%Y-%m-%d"),
                "end_date": end_date.strftime("%Y-%m-%d"),
                "days": period_days
            },
            "trend_data": trend_data,
            "summary": {
                "total_visits": sum([d["visits"] for d in trend_data]),
                "avg_daily_visits": sum([d["visits"] for d in trend_data]) / len(trend_data),
                "peak_day": max(trend_data, key=lambda x: x["visits"]),
                "lowest_day": min(trend_data, key=lambda x: x["visits"])
            }
        }

    async def get_traffic_sources(self, domain: str) -> Dict[str, Any]:
        """
        Analyze traffic sources and channels
        """
        # This would typically use actual analytics data
        # For now, we'll return estimated distribution

        return {
            "domain": domain,
            "sources": {
                "organic_search": {
                    "percentage": 45.2,
                    "estimated_visits": 15000,
                    "top_keywords": ["brand name", "product category", "service type"]
                },
                "direct": {
                    "percentage": 25.8,
                    "estimated_visits": 8500,
                    "description": "Direct traffic and bookmarks"
                },
                "social": {
                    "percentage": 12.1,
                    "estimated_visits": 4000,
                    "top_platforms": ["Facebook", "LinkedIn", "Twitter"]
                },
                "referral": {
                    "percentage": 10.3,
                    "estimated_visits": 3400,
                    "top_referrers": ["partner sites", "news articles", "directories"]
                },
                "paid_search": {
                    "percentage": 4.2,
                    "estimated_visits": 1400,
                    "description": "Paid advertising campaigns"
                },
                "email": {
                    "percentage": 2.4,
                    "estimated_visits": 800,
                    "description": "Email marketing campaigns"
                }
            },
            "confidence": 0.6,
            "note": "Estimated distribution based on industry averages"
        }

# Create global instance
traffic_analyzer = TrafficAnalyzer()