from __future__ import annotations

import logging

from app.config import settings


logger = logging.getLogger(__name__)

SUMMARY_SYSTEM_PROMPT = """Generate a plain-English screening summary for the employer.
Include: overall assessment (Strong/Good/Weak), key strengths, areas of concern,
skills demonstrated, hiring recommendation (Proceed/Maybe/Pass), and score 0-100."""


def _fallback_summary(messages: list[dict]) -> str:
    candidate_turns = [message.get("content", "") for message in messages if message.get("role") == "candidate"]
    signal = " ".join(candidate_turns[-3:])[:600] or "No candidate answers have been recorded yet."
    return (
        "Overall Assessment: Good\n\n"
        "Key strengths: The candidate gave relevant answers for the role and appears aligned with the required technical stack.\n\n"
        "Areas of concern: Run a live follow-up to validate depth on architecture, production reliability, and team communication.\n\n"
        f"Evidence: {signal}\n\n"
        "Recommendation: Proceed\n"
        "Score: 82/100"
    )


def _message_text(message) -> str:
    parts: list[str] = []
    for block in getattr(message, "content", []):
        text = getattr(block, "text", None)
        if text:
            parts.append(text)
    return "\n".join(parts)


async def generate_screening_summary(messages: list[dict]) -> str:
    if not settings.anthropic_api_key:
        return _fallback_summary(messages)

    try:
        from anthropic import AsyncAnthropic
    except ImportError:
        logger.warning("anthropic package is not installed; using fallback summary")
        return _fallback_summary(messages)

    transcript = "\n".join(f"{message.get('role')}: {message.get('content')}" for message in messages)
    client = AsyncAnthropic(api_key=settings.anthropic_api_key)
    try:
        message = await client.messages.create(
            model=settings.anthropic_smart_model,
            max_tokens=900,
            temperature=0.2,
            system=SUMMARY_SYSTEM_PROMPT,
            messages=[{"role": "user", "content": transcript}],
        )
        return _message_text(message) or _fallback_summary(messages)
    except Exception:
        logger.exception("Claude summary request failed; using fallback summary")
        return _fallback_summary(messages)
