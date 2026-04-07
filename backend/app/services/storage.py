from __future__ import annotations

import logging
import re
from dataclasses import dataclass
from io import BytesIO
from pathlib import Path

from app.config import settings


logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class StoredFile:
    file_key: str | None
    file_url: str
    filename: str
    content_type: str
    size_bytes: int
    provider: str


def _safe_filename(filename: str) -> str:
    return re.sub(r"[^A-Za-z0-9_.-]", "_", filename).strip("._") or "upload"


def _cloudinary_configured() -> bool:
    if settings.cloudinary_url:
        return True
    return bool(settings.cloudinary_cloud_name and settings.cloudinary_api_key and settings.cloudinary_api_secret)


def _configure_cloudinary():
    import cloudinary

    if settings.cloudinary_url:
        cloudinary.config(cloudinary_url=settings.cloudinary_url, secure=True)
    else:
        cloudinary.config(
            cloud_name=settings.cloudinary_cloud_name,
            api_key=settings.cloudinary_api_key,
            api_secret=settings.cloudinary_api_secret,
            secure=True,
        )


async def store_upload(
    contents: bytes,
    filename: str,
    content_type: str,
    folder: str | None = None,
) -> StoredFile:
    safe_name = _safe_filename(filename)
    folder_name = folder or settings.cloudinary_folder

    if _cloudinary_configured():
        try:
            import cloudinary.uploader

            _configure_cloudinary()
            result = cloudinary.uploader.upload(
                BytesIO(contents),
                folder=folder_name,
                resource_type="auto",
                public_id=Path(safe_name).stem,
                overwrite=False,
            )
            return StoredFile(
                file_key=result.get("public_id"),
                file_url=result["secure_url"],
                filename=safe_name,
                content_type=content_type,
                size_bytes=int(result.get("bytes") or len(contents)),
                provider="cloudinary",
            )
        except Exception:
            logger.exception("Cloudinary upload failed; falling back to local storage")

    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)
    path = upload_dir / safe_name
    if path.exists():
        path = upload_dir / f"{Path(safe_name).stem}-{abs(hash(contents))}{Path(safe_name).suffix}"
    path.write_bytes(contents)
    return StoredFile(
        file_key=str(path),
        file_url=str(path),
        filename=safe_name,
        content_type=content_type,
        size_bytes=len(contents),
        provider="local",
    )


async def delete_upload(file_key: str | None, provider: str | None = None) -> None:
    if not file_key:
        return

    if provider == "cloudinary" or (provider is None and _cloudinary_configured() and not Path(file_key).exists()):
        try:
            import cloudinary.uploader

            _configure_cloudinary()
            cloudinary.uploader.destroy(file_key, resource_type="auto")
            return
        except Exception:
            logger.exception("Cloudinary delete failed")

    path = Path(file_key)
    if path.exists():
        path.unlink()
