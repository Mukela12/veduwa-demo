import pytest

from app.services.ai_parser import parse_job_description, parse_resume


@pytest.mark.asyncio
async def test_parse_job_description_fallback_extracts_skills(monkeypatch) -> None:
    monkeypatch.setattr("app.services.ai_parser.settings.anthropic_api_key", None)
    parsed = await parse_job_description("Senior Python FastAPI engineer with PostgreSQL and Redis experience.")
    assert parsed["seniority"] == "senior"
    assert "Python" in parsed["skills"]
    assert "FastAPI" in parsed["skills"]


@pytest.mark.asyncio
async def test_parse_resume_fallback_extracts_skills(monkeypatch) -> None:
    monkeypatch.setattr("app.services.ai_parser.settings.anthropic_api_key", None)
    parsed = await parse_resume("Sarah Chen\n7 years building React TypeScript and AWS systems.")
    assert parsed["name"] == "Sarah Chen"
    assert "React" in parsed["skills"]
