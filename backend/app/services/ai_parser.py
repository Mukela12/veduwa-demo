from __future__ import annotations

import json
import logging
import re
from typing import Any

from app.config import settings


logger = logging.getLogger(__name__)

KNOWN_SKILLS = [
    "React",
    "TypeScript",
    "Next.js",
    "Node.js",
    "Python",
    "FastAPI",
    "Django",
    "PostgreSQL",
    "Redis",
    "MongoDB",
    "AWS",
    "GCP",
    "Docker",
    "Kubernetes",
    "Terraform",
    "CI/CD",
    "Go",
    "Rust",
    "Java",
    "Spring Boot",
    "PyTorch",
    "TensorFlow",
    "Transformers",
    "NLP",
    "Computer Vision",
    "Tailwind CSS",
    "Figma",
    "GraphQL",
    "gRPC",
    "Celery",
    "Elasticsearch",
    "Kafka",
    "RabbitMQ",
    "Microservices",
    "REST API",
]


JOB_SYSTEM_PROMPT = """Extract structured data from this job description.
Return only JSON with: title, skills (array), seniority (junior/mid/senior/lead),
domain, salary_range (object with min/max), requirements (array of strings)."""

RESUME_SYSTEM_PROMPT = """Extract structured data from this resume.
Return only JSON with: name, title, location, skills (array), experience (array of objects
with company/role/duration/description), education (array), summary (string),
experience_years (integer)."""


def _extract_json(text: str) -> dict[str, Any]:
    try:
        parsed = json.loads(text)
        return parsed if isinstance(parsed, dict) else {}
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", text, flags=re.DOTALL)
        if not match:
            return {}
        try:
            parsed = json.loads(match.group(0))
            return parsed if isinstance(parsed, dict) else {}
        except json.JSONDecodeError:
            return {}


def _message_text(message: Any) -> str:
    parts: list[str] = []
    for block in getattr(message, "content", []):
        text = getattr(block, "text", None)
        if text:
            parts.append(text)
    return "\n".join(parts)


async def _call_claude_json(system_prompt: str, user_text: str) -> dict[str, Any]:
    if not settings.anthropic_api_key:
        return {}

    try:
        from anthropic import AsyncAnthropic
    except ImportError:
        logger.warning("anthropic package is not installed; using fallback parser")
        return {}

    client = AsyncAnthropic(api_key=settings.anthropic_api_key)
    try:
        message = await client.messages.create(
            model=settings.anthropic_fast_model,
            max_tokens=1000,
            temperature=0,
            system=system_prompt,
            messages=[{"role": "user", "content": user_text}],
        )
        return _extract_json(_message_text(message))
    except Exception:
        logger.exception("Claude parsing request failed; using fallback parser")
        return {}


def _extract_skills(text: str) -> list[str]:
    lowered = text.lower()
    return [skill for skill in KNOWN_SKILLS if skill.lower() in lowered]


def _extract_seniority(text: str) -> str:
    lowered = text.lower()
    if any(term in lowered for term in ["lead", "principal", "staff"]):
        return "lead"
    if "senior" in lowered or "sr." in lowered:
        return "senior"
    if any(term in lowered for term in ["junior", "entry", "intern"]):
        return "junior"
    return "mid"


def _extract_salary_range(text: str) -> dict[str, int | None]:
    amounts = [int(match.replace(",", "")) for match in re.findall(r"\$?\b(\d{2,3},?\d{3})\b", text)]
    if not amounts:
        return {"min": None, "max": None}
    return {"min": min(amounts), "max": max(amounts)}


def _extract_requirements(text: str) -> list[str]:
    lines = [line.strip(" -*\t") for line in text.splitlines()]
    requirements = [line for line in lines if len(line) > 20 and any(word in line.lower() for word in ["experience", "build", "design", "deploy", "manage", "develop"])]
    if requirements:
        return requirements[:8]
    sentences = re.split(r"(?<=[.!?])\s+", text)
    return [sentence.strip() for sentence in sentences if len(sentence.strip()) > 30][:5]


def _fallback_job_parse(description: str) -> dict[str, Any]:
    lines = [line.strip() for line in description.splitlines() if line.strip()]
    title = lines[0][:120] if lines else "Untitled role"
    return {
        "title": title,
        "skills": _extract_skills(description),
        "seniority": _extract_seniority(description),
        "domain": "Software Engineering",
        "salary_range": _extract_salary_range(description),
        "requirements": _extract_requirements(description),
        "source": "fallback",
    }


def _fallback_resume_parse(resume_text: str) -> dict[str, Any]:
    lines = [line.strip() for line in resume_text.splitlines() if line.strip()]
    name = lines[0][:120] if lines else "Candidate"
    skills = _extract_skills(resume_text)
    years = re.findall(r"(\d+)\+?\s+years?", resume_text, flags=re.IGNORECASE)
    experience_years = int(years[0]) if years else None
    return {
        "name": name,
        "title": "Software Engineer",
        "location": None,
        "skills": skills,
        "experience": [],
        "education": [],
        "summary": "Candidate profile parsed with deterministic fallback extraction.",
        "experience_years": experience_years,
        "source": "fallback",
    }


async def parse_job_description(description: str) -> dict[str, Any]:
    parsed = await _call_claude_json(JOB_SYSTEM_PROMPT, description)
    fallback = _fallback_job_parse(description)
    return {**fallback, **{key: value for key, value in parsed.items() if value not in (None, "", [])}}


async def parse_resume(resume_text: str) -> dict[str, Any]:
    parsed = await _call_claude_json(RESUME_SYSTEM_PROMPT, resume_text)
    fallback = _fallback_resume_parse(resume_text)
    return {**fallback, **{key: value for key, value in parsed.items() if value not in (None, "", [])}}
