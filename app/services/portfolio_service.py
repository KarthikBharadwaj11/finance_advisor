import uuid

import structlog
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.models.portfolio import AssetClass, Portfolio, PortfolioAllocation
from app.exceptions import PortfolioNotFoundError
from app.schemas.finance import AllocationBreakdown
from app.schemas.portfolio import AllocationSummary, PortfolioSummary

logger = structlog.get_logger(__name__)


async def get_portfolio_summary(user_id: uuid.UUID, db: AsyncSession) -> PortfolioSummary:
    result = await db.execute(
        select(Portfolio)
        .where(Portfolio.user_id == user_id)
        .options(selectinload(Portfolio.allocations))
        .order_by(Portfolio.created_at.desc())
        .limit(1)
    )
    portfolio = result.scalar_one_or_none()
    if portfolio is None:
        raise PortfolioNotFoundError(f"No portfolio found for user {user_id}")

    allocations = [
        AllocationSummary(
            asset_class=a.asset_class.value,
            percentage=float(a.percentage),
            current_value=float(a.current_value),
        )
        for a in portfolio.allocations
    ]

    return PortfolioSummary(
        portfolio_id=portfolio.id,
        user_id=user_id,
        name=portfolio.name,
        total_value=float(portfolio.total_value),
        currency=portfolio.currency,
        allocations=allocations,
        last_updated=portfolio.updated_at,
    )


async def upsert_portfolio_allocation(
    user_id: uuid.UUID,
    allocation: AllocationBreakdown,
    total_value: float,
    db: AsyncSession,
) -> Portfolio:
    """Create or update portfolio based on agent recommendations."""
    result = await db.execute(
        select(Portfolio)
        .where(Portfolio.user_id == user_id)
        .options(selectinload(Portfolio.allocations))
    )
    portfolio = result.scalar_one_or_none()

    if portfolio is None:
        portfolio = Portfolio(user_id=user_id, total_value=total_value)
        db.add(portfolio)
        await db.flush()
    else:
        portfolio.total_value = total_value
        # Clear existing allocations — replace with new recommendations
        for alloc in portfolio.allocations:
            await db.delete(alloc)
        await db.flush()

    for item in allocation.allocations:
        # Normalize asset class name to match enum
        asset_cls_key = item.asset_class.lower().replace(" ", "_").split("_(")[0]
        try:
            asset_cls = AssetClass(asset_cls_key)
        except ValueError:
            asset_cls = AssetClass.stocks  # default fallback

        alloc = PortfolioAllocation(
            portfolio_id=portfolio.id,
            asset_class=asset_cls,
            percentage=item.percentage,
            current_value=total_value * (item.percentage / 100),
        )
        db.add(alloc)

    await db.flush()
    logger.info("portfolio_upserted", user_id=str(user_id), portfolio_id=str(portfolio.id))
    return portfolio
