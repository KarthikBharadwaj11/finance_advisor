import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AllocationSummary(BaseModel):
    asset_class: str
    percentage: float
    current_value: float


class PortfolioSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    portfolio_id: uuid.UUID
    user_id: uuid.UUID
    name: str
    total_value: float
    currency: str
    allocations: list[AllocationSummary]
    last_updated: datetime
