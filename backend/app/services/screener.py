from __future__ import annotations

import asyncio
import logging
from collections.abc import AsyncIterator
from typing import Any

from app.config import settings


logger = logging.getLogger(__name__)


def _build_system_prompt(job_data: dict[str, Any], candidate_data: dict[str, Any]) -> str:
    return f"""You are an AI interviewer for the role: {job_data.get("title", "this role")}.
The candidate has these skills: {candidate_data.get("skills", [])}.
Ask structured technical questions relevant to the role. Be professional,
specific, and conversational. Keep each turn concise."""


def _normalize_messages(messages: list[dict]) -> list[dict[str, str]]:
    normalized: list[dict[str, str]] = []
    for message in messages:
        role = message.get("role")
        content = message.get("content")
        if not content or role == "system":
            continue
        normalized.append({"role": "assistant" if role == "ai" else "user", "content": content})
    if not normalized:
        normalized.append({"role": "user", "content": "Please begin the screening interview."})
    return normalized


async def _fallback_stream(job_data: dict[str, Any], candidate_data: dict[str, Any]) -> AsyncIterator[str]:
    text = (
        f"Thanks for joining. For the {job_data.get('title', 'role')} position, "
        f"I see experience with {', '.join(candidate_data.get('skills', [])[:4]) or 'the relevant stack'}. "
        "Can you walk me through a recent project where you used these skills and explain the tradeoffs you made?"
    )
    for index in range(0, len(text), 18):
        await asyncio.sleep(0.01)
        yield text[index : index + 18]


async def stream_screening(job_data: dict[str, Any], candidate_data: dict[str, Any], messages: list[dict]) -> AsyncIterator[str]:
    if not settings.anthropic_api_key:
        async for chunk in _fallback_stream(job_data, candidate_data):
            yield chunk
        return

    try:
        from anthropic import AsyncAnthropic
    except ImportError:
        logger.warning("anthropic package is not installed; using fallback screener")
        async for chunk in _fallback_stream(job_data, candidate_data):
            yield chunk
        return

    client = AsyncAnthropic(api_key=settings.anthropic_api_key)
    try:
        async with client.messages.stream(
            model=settings.anthropic_smart_model,
            max_tokens=1024,
            temperature=0.4,
            system=_build_system_prompt(job_data, candidate_data),
            messages=_normalize_messages(messages),
        ) as stream:
            async for text in stream.text_stream:
                yield text
    except Exception:
        logger.exception("Claude screening stream failed; using fallback screener")
        async for chunk in _fallback_stream(job_data, candidate_data):
            yield chunk
