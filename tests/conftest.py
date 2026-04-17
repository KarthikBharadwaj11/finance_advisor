"""
Test fixtures.

Uses an in-memory SQLite database for integration tests.
Agent tests mock OpenAI to avoid API calls in CI.
"""

import asyncio
import uuid
from collections.abc import AsyncGenerator
from unittest.mock import MagicMock, patch

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.db.base import Base
from app.db.session import get_db
from app.main import app

# In-memory SQLite for tests (swap asyncpg for aiosqlite in test config)
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="session")
async def test_engine():
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest_asyncio.fixture
async def db_session(test_engine) -> AsyncGenerator[AsyncSession, None]:
    SessionLocal = async_sessionmaker(test_engine, expire_on_commit=False)
    async with SessionLocal() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture
async def client(db_session) -> AsyncGenerator[AsyncClient, None]:
    """HTTP test client with DB dependency overridden."""

    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    # Mock FAISS and AgentExecutor for HTTP-level tests
    with patch("app.rag.vector_store._vector_store", MagicMock()):
        with patch("app.agent.executor._executor", MagicMock()):
            async with AsyncClient(
                transport=ASGITransport(app=app), base_url="http://test"
            ) as c:
                yield c

    app.dependency_overrides.clear()


@pytest.fixture
def sample_user_id() -> uuid.UUID:
    return uuid.uuid4()


@pytest.fixture
def financial_profile_payload() -> dict:
    return {
        "monthly_income": 8000.0,
        "monthly_expenses": 5000.0,
        "total_savings": 25000.0,
        "total_debt": 15000.0,
        "investment_horizon_years": 25,
        "age": 32,
        "financial_goals": ["retire at 60", "buy a house in 5 years"],
        "existing_portfolio": {},
    }
