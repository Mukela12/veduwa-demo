from __future__ import annotations
from celery import Celery

from app.config import settings


celery_app = Celery("veduwa", broker=settings.redis_url, backend=settings.redis_url)
celery_app.conf.task_serializer = "json"
celery_app.conf.result_serializer = "json"
celery_app.conf.accept_content = ["json"]
celery_app.conf.timezone = "UTC"
celery_app.conf.imports = (
    "app.workers.parse_jd",
    "app.workers.parse_resume",
    "app.workers.compute_matches",
)

app = celery_app
