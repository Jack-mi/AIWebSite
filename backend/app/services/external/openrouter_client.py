import httpx
import asyncio
from typing import Dict, List, Optional, Any
from app.core.config import settings
import json

class OpenRouterClient:
    def __init__(self):
        self.api_key = settings.OPENROUTER_API_KEY
        self.base_url = settings.OPENROUTER_BASE_URL
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://insighteye.ai",  # Replace with your domain
            "X-Title": "InsightEye"
        }

    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        model: str = "anthropic/claude-3.5-sonnet",
        max_tokens: int = 4000,
        temperature: float = 0.7,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Send a chat completion request to OpenRouter
        """
        payload = {
            "model": model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
            **kwargs
        }

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=self.headers,
                    json=payload,
                    timeout=120.0
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                raise Exception(f"OpenRouter API error: {str(e)}")

    async def analyze_website_content(
        self,
        content: str,
        url: str,
        analysis_type: str = "comprehensive"
    ) -> Dict[str, Any]:
        """
        Analyze website content using AI
        """
        system_prompt = """You are an expert website analyst. Analyze the provided website content and extract insights about:

1. Core functionality and features
2. User intent and target audience
3. Business model and value proposition
4. User experience and design patterns
5. Content strategy and messaging

Provide your analysis in structured JSON format."""

        user_prompt = f"""
Analyze this website content from {url}:

Analysis Type: {analysis_type}

Website Content:
{content[:10000]}  # Truncate to avoid token limits

Please provide a comprehensive analysis in the following JSON structure:
{{
    "core_functions": [
        {{
            "name": "function name",
            "description": "detailed description",
            "user_intent": "what user need this addresses",
            "priority": "high/medium/low"
        }}
    ],
    "target_audience": {{
        "primary": "primary user type",
        "secondary": ["secondary user types"],
        "characteristics": ["key user characteristics"]
    }},
    "business_model": {{
        "type": "business model type",
        "revenue_streams": ["revenue sources"],
        "value_proposition": "main value proposition"
    }},
    "user_experience": {{
        "design_patterns": ["observed patterns"],
        "user_journey": ["key journey steps"],
        "pain_points": ["potential issues"]
    }},
    "content_strategy": {{
        "tone": "content tone",
        "messaging": ["key messages"],
        "call_to_actions": ["main CTAs"]
    }},
    "confidence_score": 0.85
}}
"""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        try:
            response = await self.chat_completion(messages)
            content = response["choices"][0]["message"]["content"]

            # Try to parse JSON from the response
            try:
                # Extract JSON from markdown code blocks if present
                if "```json" in content:
                    json_start = content.find("```json") + 7
                    json_end = content.find("```", json_start)
                    json_content = content[json_start:json_end].strip()
                else:
                    json_content = content.strip()

                return json.loads(json_content)
            except json.JSONDecodeError:
                # If JSON parsing fails, return raw content
                return {
                    "raw_analysis": content,
                    "confidence_score": 0.5,
                    "error": "Failed to parse structured response"
                }

        except Exception as e:
            raise Exception(f"Failed to analyze website content: {str(e)}")

    async def extract_user_intents(
        self,
        content: str,
        url: str
    ) -> List[Dict[str, Any]]:
        """
        Extract user intents from website content
        """
        system_prompt = """You are an expert UX researcher specializing in user intent analysis.
        Analyze website content to identify the core user intents and motivations that the website addresses.

        Focus on:
        - What problems users are trying to solve
        - What goals they want to achieve
        - What needs the website fulfills
        - How the website guides users through their journey"""

        user_prompt = f"""
Analyze this website content from {url} and identify the core user intents:

Content:
{content[:8000]}

Return a JSON array of user intents in this format:
[
    {{
        "intent": "brief intent description",
        "description": "detailed explanation of this user intent",
        "evidence": ["specific content/features that support this intent"],
        "user_journey_stage": "awareness/consideration/decision/retention",
        "priority": "primary/secondary/tertiary",
        "confidence": 0.9
    }}
]
"""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        try:
            response = await self.chat_completion(messages)
            content = response["choices"][0]["message"]["content"]

            # Extract and parse JSON
            if "```json" in content:
                json_start = content.find("```json") + 7
                json_end = content.find("```", json_start)
                json_content = content[json_start:json_end].strip()
            else:
                json_content = content.strip()

            return json.loads(json_content)

        except Exception as e:
            raise Exception(f"Failed to extract user intents: {str(e)}")

    async def identify_features(
        self,
        content: str,
        url: str
    ) -> List[Dict[str, Any]]:
        """
        Identify website features and functionality
        """
        system_prompt = """You are a product analyst expert at identifying website features and functionality.
        Analyze the content and identify all the features, tools, and capabilities the website offers."""

        user_prompt = f"""
Analyze this website content from {url} and identify all features:

Content:
{content[:8000]}

Return a JSON array of features in this format:
[
    {{
        "feature_name": "name of the feature",
        "category": "core/secondary/supporting",
        "description": "what this feature does",
        "user_benefit": "how this benefits users",
        "implementation_complexity": "low/medium/high",
        "evidence": ["specific content that indicates this feature"],
        "confidence": 0.9
    }}
]
"""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        try:
            response = await self.chat_completion(messages)
            content = response["choices"][0]["message"]["content"]

            # Extract and parse JSON
            if "```json" in content:
                json_start = content.find("```json") + 7
                json_end = content.find("```", json_start)
                json_content = content[json_start:json_end].strip()
            else:
                json_content = content.strip()

            return json.loads(json_content)

        except Exception as e:
            raise Exception(f"Failed to identify features: {str(e)}")

# Create a global instance
openrouter_client = OpenRouterClient()