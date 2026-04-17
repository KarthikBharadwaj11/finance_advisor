from fastapi import APIRouter

from app.api.v1 import finances, health, portfolio, users

v1_router = APIRouter()

v1_router.include_router(health.router, tags=["Health"])
v1_router.include_router(users.router, prefix="/users", tags=["Users"])
v1_router.include_router(finances.router, prefix="/finances", tags=["Financial Analysis"])
v1_router.include_router(portfolio.router, prefix="/portfolio", tags=["Portfolio"])
