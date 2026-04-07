from __future__ import annotations

import html
import logging

from app.config import settings


logger = logging.getLogger(__name__)


def _shell(content: str) -> str:
    return f"""
    <div style="max-width:560px;margin:0 auto;font-family:Inter,Arial,sans-serif;color:#172033;background:#ffffff;">
      <div style="padding:22px 24px;background:#172033;border-radius:10px 10px 0 0;">
        <div style="font-weight:800;color:#ffffff;letter-spacing:-0.03em;font-size:18px;">Veduwa</div>
        <div style="color:#b8c2d6;font-size:13px;margin-top:4px;">AI-powered IT talent matching</div>
      </div>
      <div style="padding:28px 24px;border:1px solid #e6e8ef;border-top:0;">
        {content}
      </div>
      <div style="padding:16px 24px;background:#f6f7fb;border:1px solid #e6e8ef;border-top:0;border-radius:0 0 10px 10px;">
        <p style="margin:0;color:#7b8497;font-size:12px;text-align:center;">Veduwa demo hiring workspace</p>
      </div>
    </div>
    """


async def send_email(to: str, subject: str, body_html: str) -> bool:
    if not settings.resend_api_key:
        logger.info("Resend not configured; skipped email to %s with subject %s", to, subject)
        return False

    try:
        import resend

        resend.api_key = settings.resend_api_key
        resend.Emails.send(
            {
                "from": settings.email_from,
                "to": [to],
                "subject": subject,
                "html": _shell(body_html),
            }
        )
        return True
    except Exception:
        logger.exception("Failed to send Resend email to %s", to)
        return False


async def send_job_posted_email(to: str, name: str, job_title: str, job_id: str) -> bool:
    safe_name = html.escape(name)
    safe_title = html.escape(job_title)
    url = f"{settings.public_app_url.rstrip('/')}/jobs/{job_id}"
    return await send_email(
        to,
        f"Veduwa is matching candidates for {safe_title}",
        f"""
        <h1 style="margin:0 0 12px;font-size:22px;color:#172033;">Your job is live</h1>
        <p style="font-size:14px;line-height:1.6;color:#455068;">Hi {safe_name}, Veduwa has started parsing and matching candidates for <strong>{safe_title}</strong>.</p>
        <p style="margin:24px 0 0;"><a href="{url}" style="background:#3B5BDB;color:#fff;text-decoration:none;padding:10px 14px;border-radius:8px;font-weight:700;font-size:13px;">Open job</a></p>
        """,
    )


async def send_application_received_email(to: str, name: str, job_title: str, score: float | None) -> bool:
    safe_name = html.escape(name)
    safe_title = html.escape(job_title)
    score_text = f" Your current AI match score is <strong>{score:.1f}%</strong>." if score is not None else ""
    return await send_email(
        to,
        f"Application received for {safe_title}",
        f"""
        <h1 style="margin:0 0 12px;font-size:22px;color:#172033;">Application received</h1>
        <p style="font-size:14px;line-height:1.6;color:#455068;">Hi {safe_name}, your application for <strong>{safe_title}</strong> is in the Veduwa pipeline.{score_text}</p>
        """,
    )


async def send_screening_summary_email(to: str, name: str, candidate_name: str, job_title: str, summary: str) -> bool:
    safe_name = html.escape(name)
    safe_candidate = html.escape(candidate_name)
    safe_title = html.escape(job_title)
    safe_summary = html.escape(summary).replace("\n", "<br/>")
    return await send_email(
        to,
        f"Screening summary: {safe_candidate}",
        f"""
        <h1 style="margin:0 0 12px;font-size:22px;color:#172033;">Screening summary is ready</h1>
        <p style="font-size:14px;line-height:1.6;color:#455068;">Hi {safe_name}, Veduwa generated a screening summary for <strong>{safe_candidate}</strong> on <strong>{safe_title}</strong>.</p>
        <div style="margin-top:18px;padding:16px;background:#f6f7fb;border:1px solid #e6e8ef;border-radius:8px;font-size:13px;line-height:1.6;color:#2b3448;">{safe_summary}</div>
        """,
    )
