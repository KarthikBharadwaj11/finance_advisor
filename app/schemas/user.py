import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.db.models.user import RiskTolerance


class UserCreate(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=1, max_length=255)
    password: str = Field(min_length=8)
    age: int | None = Field(default=None, ge=18, le=100)
    annual_income: float | None = Field(default=None, gt=0)
    risk_tolerance: RiskTolerance = RiskTolerance.moderate


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: str
    full_name: str
    age: int | None
    annual_income: float | None
    risk_tolerance: RiskTolerance
    created_at: datetime


class UserUpdate(BaseModel):
    full_name: str | None = None
    age: int | None = Field(default=None, ge=18, le=100)
    annual_income: float | None = Field(default=None, gt=0)
    risk_tolerance: RiskTolerance | None = None
