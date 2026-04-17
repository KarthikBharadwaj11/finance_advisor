import uuid

import structlog
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.user import User
from app.exceptions import UserNotFoundError
from app.schemas.user import UserCreate, UserUpdate

logger = structlog.get_logger(__name__)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


async def create_user(data: UserCreate, db: AsyncSession) -> User:
    hashed = pwd_context.hash(data.password)
    user = User(
        email=str(data.email),
        full_name=data.full_name,
        hashed_password=hashed,
        age=data.age,
        annual_income=data.annual_income,
        risk_tolerance=data.risk_tolerance,
    )
    db.add(user)
    await db.flush()  # Populate user.id without committing (commit done by get_db)
    logger.info("user_created", user_id=str(user.id))
    return user


async def get_user(user_id: uuid.UUID, db: AsyncSession) -> User | None:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def get_user_or_404(user_id: uuid.UUID, db: AsyncSession) -> User:
    user = await get_user(user_id, db)
    if user is None:
        raise UserNotFoundError(f"User {user_id} not found")
    return user


async def get_by_email(email: str, db: AsyncSession) -> User | None:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def update_user(user_id: uuid.UUID, data: UserUpdate, db: AsyncSession) -> User:
    user = await get_user_or_404(user_id, db)
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(user, field, value)
    await db.flush()
    return user
