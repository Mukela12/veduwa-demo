from __future__ import annotations

import uuid
from dataclasses import dataclass
from typing import Any

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_session
from app.models.user import User


security = HTTPBearer(auto_error=False)


@dataclass(frozen=True)
class AuthClaims:
    user_id: uuid.UUID
    email: str
    full_name: str
    role: str
    raw: dict[str, Any]


def _claim_user_metadata(payload: dict[str, Any]) -> dict[str, Any]:
    metadata = payload.get("user_metadata") or {}
    app_metadata = payload.get("app_metadata") or {}
    return {**app_metadata, **metadata}


def decode_supabase_token(token: str) -> AuthClaims:
    if not settings.supabase_jwt_secret:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Supabase JWT verification is not configured",
        )

    try:
        payload = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
        )
    except JWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid auth token") from exc

    metadata = _claim_user_metadata(payload)
    user_id = payload.get("sub")
    email = payload.get("email") or metadata.get("email")
    if not user_id or not email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token missing user identity")

    try:
        parsed_user_id = uuid.UUID(str(user_id))
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token user id is not a UUID") from exc

    role = metadata.get("role") if metadata.get("role") in {"employer", "candidate"} else "employer"
    full_name = metadata.get("full_name") or metadata.get("name") or email.split("@")[0]
    return AuthClaims(user_id=parsed_user_id, email=email, full_name=full_name, role=role, raw=payload)


async def verify_supabase_token(token: str) -> AuthClaims:
    if settings.supabase_jwt_secret:
        return decode_supabase_token(token)

    if not settings.supabase_url or not settings.supabase_anon_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Supabase auth verification is not configured",
        )

    try:
        import httpx

        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(
                f"{settings.supabase_url.rstrip('/')}/auth/v1/user",
                headers={
                    "Authorization": f"Bearer {token}",
                    "apikey": settings.supabase_anon_key,
                },
            )
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Supabase auth verification failed") from exc

    if response.status_code >= 400:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid auth token")

    payload = response.json()
    metadata = payload.get("user_metadata") or {}
    user_id = payload.get("id")
    email = payload.get("email")
    if not user_id or not email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token missing user identity")

    try:
        parsed_user_id = uuid.UUID(str(user_id))
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token user id is not a UUID") from exc

    role = metadata.get("role") if metadata.get("role") in {"employer", "candidate"} else "employer"
    full_name = metadata.get("full_name") or metadata.get("name") or email.split("@")[0]
    return AuthClaims(user_id=parsed_user_id, email=email, full_name=full_name, role=role, raw=payload)


async def get_auth_claims(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> AuthClaims:
    if credentials is None:
        if settings.demo_auth:
            return AuthClaims(
                user_id=uuid.UUID("00000000-0000-4000-8000-000000000001"),
                email="demo@veduwa.com",
                full_name="Demo Employer",
                role="employer",
                raw={"demo": True},
            )
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing auth token")

    return await verify_supabase_token(credentials.credentials)


async def ensure_user(session: AsyncSession, claims: AuthClaims) -> User:
    user = await session.get(User, claims.user_id)
    if user is None:
        result = await session.execute(select(User).where(User.email == claims.email))
        user = result.scalar_one_or_none()

    if user is None:
        user = User(
            id=claims.user_id,
            email=claims.email,
            full_name=claims.full_name,
            role=claims.role,
            company_name="Veduwa Demo" if claims.role == "employer" else None,
        )
        session.add(user)
    else:
        user.email = claims.email
        user.full_name = user.full_name or claims.full_name
        if claims.role in {"employer", "candidate"}:
            user.role = claims.role

    await session.commit()
    await session.refresh(user)
    return user


async def get_current_user(
    claims: AuthClaims = Depends(get_auth_claims),
    session: AsyncSession = Depends(get_session),
) -> User:
    return await ensure_user(session, claims)


def require_roles(*roles: str):
    async def dependency(user: User = Depends(get_current_user)) -> User:
        if user.role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient role for this action")
        return user

    return dependency
