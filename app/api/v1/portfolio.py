import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.schemas.portfolio import PortfolioSummary
from app.services import portfolio_service, user_service

router = APIRouter()


@router.get(
    "/{user_id}/summary",
    response_model=PortfolioSummary,
    status_code=status.HTTP_200_OK,
    summary="Portfolio summary",
    description="Returns the latest AI-recommended portfolio allocation for a user.",
)
async def get_portfolio_summary(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> PortfolioSummary:
    await user_service.get_user_or_404(user_id, db)
    return await portfolio_service.get_portfolio_summary(user_id, db)
