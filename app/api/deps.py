from collections.abc import AsyncGenerator

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db

# Re-export for convenience import in route files
__all__ = ["get_db", "AsyncSession", "Depends"]
