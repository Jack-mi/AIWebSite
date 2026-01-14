import asyncio
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import httpx
from typing import Dict, List, Optional, Any
import re

class WebScraper:
    def __init__(self):
        self.timeout = 30000  # 30 seconds
        self.user_agent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

    async def scrape_website(self, url: str) -> Dict[str, Any]:
        """
        Scrape website content using Playwright
        """
        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                page = await browser.new_page(user_agent=self.user_agent)

                # Set viewport
                await page.set_viewport_size({"width": 1920, "height": 1080})

                # Navigate to the page
                response = await page.goto(url, wait_until="networkidle", timeout=self.timeout)

                if response.status >= 400:
                    raise Exception(f"HTTP {response.status}: Failed to load page")

                # Wait for dynamic content
                await page.wait_for_timeout(3000)

                # Extract basic information
                title = await page.title()
                html_content = await page.content()

                # Get meta information
                meta_description = await page.get_attribute('meta[name="description"]', 'content') or ""
                meta_keywords = await page.get_attribute('meta[name="keywords"]', 'content') or ""

                # Get all text content
                text_content = await page.evaluate("""
                    () => {
                        // Remove script and style elements
                        const scripts = document.querySelectorAll('script, style');
                        scripts.forEach(el => el.remove());

                        return document.body.innerText;
                    }
                """)

                # Extract links
                links = await page.evaluate("""
                    () => {
                        const links = Array.from(document.querySelectorAll('a[href]'));
                        return links.map(link => ({
                            text: link.innerText.trim(),
                            href: link.href,
                            title: link.title || ''
                        })).filter(link => link.text && link.href);
                    }
                """)

                # Extract images
                images = await page.evaluate("""
                    () => {
                        const images = Array.from(document.querySelectorAll('img[src]'));
                        return images.map(img => ({
                            src: img.src,
                            alt: img.alt || '',
                            title: img.title || ''
                        }));
                    }
                """)

                # Extract forms
                forms = await page.evaluate("""
                    () => {
                        const forms = Array.from(document.querySelectorAll('form'));
                        return forms.map(form => ({
                            action: form.action || '',
                            method: form.method || 'GET',
                            inputs: Array.from(form.querySelectorAll('input, select, textarea')).map(input => ({
                                type: input.type || input.tagName.toLowerCase(),
                                name: input.name || '',
                                placeholder: input.placeholder || '',
                                required: input.required || false
                            }))
                        }));
                    }
                """)

                await browser.close()

                # Parse HTML with BeautifulSoup for additional analysis
                soup = BeautifulSoup(html_content, 'html.parser')

                return {
                    "url": url,
                    "title": title,
                    "meta_description": meta_description,
                    "meta_keywords": meta_keywords,
                    "html_content": html_content,
                    "text_content": text_content,
                    "links": links,
                    "images": images,
                    "forms": forms,
                    "domain": urlparse(url).netloc,
                    "status_code": response.status,
                    "content_length": len(html_content),
                    "text_length": len(text_content)
                }

        except Exception as e:
            raise Exception(f"Failed to scrape website {url}: {str(e)}")

    async def detect_technologies(self, html_content: str, url: str) -> List[Dict[str, Any]]:
        """
        Detect technologies used on the website
        """
        technologies = []
        soup = BeautifulSoup(html_content, 'html.parser')

        # Frontend frameworks
        if 'react' in html_content.lower() or '_next' in html_content:
            technologies.append({
                "category": "frontend",
                "technology": "React/Next.js",
                "confidence": 0.8,
                "evidence": "React/Next.js patterns detected"
            })

        if 'vue' in html_content.lower() or '__vue__' in html_content:
            technologies.append({
                "category": "frontend",
                "technology": "Vue.js",
                "confidence": 0.8,
                "evidence": "Vue.js patterns detected"
            })

        if 'angular' in html_content.lower() or 'ng-' in html_content:
            technologies.append({
                "category": "frontend",
                "technology": "Angular",
                "confidence": 0.8,
                "evidence": "Angular patterns detected"
            })

        # CSS frameworks
        if 'bootstrap' in html_content.lower():
            technologies.append({
                "category": "css",
                "technology": "Bootstrap",
                "confidence": 0.9,
                "evidence": "Bootstrap classes detected"
            })

        if 'tailwind' in html_content.lower() or 'tw-' in html_content:
            technologies.append({
                "category": "css",
                "technology": "Tailwind CSS",
                "confidence": 0.9,
                "evidence": "Tailwind CSS classes detected"
            })

        # Analytics and tracking
        if 'google-analytics' in html_content or 'gtag' in html_content:
            technologies.append({
                "category": "analytics",
                "technology": "Google Analytics",
                "confidence": 0.95,
                "evidence": "Google Analytics code detected"
            })

        if 'mixpanel' in html_content.lower():
            technologies.append({
                "category": "analytics",
                "technology": "Mixpanel",
                "confidence": 0.95,
                "evidence": "Mixpanel tracking code detected"
            })

        # CDNs
        cdn_patterns = {
            "Cloudflare": r"cloudflare",
            "AWS CloudFront": r"cloudfront",
            "Fastly": r"fastly",
            "KeyCDN": r"keycdn"
        }

        for tech, pattern in cdn_patterns.items():
            if re.search(pattern, html_content, re.IGNORECASE):
                technologies.append({
                    "category": "cdn",
                    "technology": tech,
                    "confidence": 0.7,
                    "evidence": f"{tech} patterns detected"
                })

        # Payment processors
        payment_patterns = {
            "Stripe": r"stripe",
            "PayPal": r"paypal",
            "Square": r"square"
        }

        for tech, pattern in payment_patterns.items():
            if re.search(pattern, html_content, re.IGNORECASE):
                technologies.append({
                    "category": "payment",
                    "technology": tech,
                    "confidence": 0.8,
                    "evidence": f"{tech} integration detected"
                })

        # Server detection from headers would require actual HTTP requests
        # This is a simplified version

        return technologies

    async def extract_structured_data(self, html_content: str) -> Dict[str, Any]:
        """
        Extract structured data from the website
        """
        soup = BeautifulSoup(html_content, 'html.parser')
        structured_data = {}

        # Extract JSON-LD structured data
        json_ld_scripts = soup.find_all('script', type='application/ld+json')
        if json_ld_scripts:
            structured_data['json_ld'] = []
            for script in json_ld_scripts:
                try:
                    import json
                    data = json.loads(script.string)
                    structured_data['json_ld'].append(data)
                except:
                    pass

        # Extract Open Graph data
        og_tags = soup.find_all('meta', property=lambda x: x and x.startswith('og:'))
        if og_tags:
            structured_data['open_graph'] = {}
            for tag in og_tags:
                property_name = tag.get('property', '').replace('og:', '')
                content = tag.get('content', '')
                if property_name and content:
                    structured_data['open_graph'][property_name] = content

        # Extract Twitter Card data
        twitter_tags = soup.find_all('meta', attrs={'name': lambda x: x and x.startswith('twitter:')})
        if twitter_tags:
            structured_data['twitter'] = {}
            for tag in twitter_tags:
                name = tag.get('name', '').replace('twitter:', '')
                content = tag.get('content', '')
                if name and content:
                    structured_data['twitter'][name] = content

        return structured_data

# Create a global instance
web_scraper = WebScraper()