#!/usr/bin/env python
"""
Initialize the database: create all tables directly from SQLAlchemy models.
Use for development/testing. In production, always use Alembic migrations.

Usage:
    python scripts/init_db.py
"""

import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.db.base import Base
from app.db.models import ConversationHistory, Portfolio, PortfolioAllocation, User  # noqa: F401
from app.db.session import engine
from app.logging_config import configure_structlog

import structlog


async def init_db() -> None:
    configure_structlog()
    log = structlog.get_logger()
    log.info("creating_tables")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await engine.dispose()
    log.info("tables_created")


if __name__ == "__main__":
    asyncio.run(init_db())
