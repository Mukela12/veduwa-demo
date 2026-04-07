from __future__ import annotations
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.middleware.auth import ensure_user, verify_supabase_token
from app.schemas.user import AuthVerifyRequest, AuthVerifyResponse, UserRead


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/verify", response_model=AuthVerifyResponse)
async def verify_auth_token(payload: AuthVerifyRequest, session: AsyncSession = Depends(get_session)) -> AuthVerifyResponse:
    claims = await verify_supabase_token(payload.token)
    user = await ensure_user(session, claims)
    return AuthVerifyResponse(valid=True, user=UserRead.model_validate(user))
