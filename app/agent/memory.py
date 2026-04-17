"""
PostgreSQL-backed conversation memory — no LangChain.

Stores history as plain OpenAI message dicts: {"role": "user"/"assistant", "content": str}
Loaded from DB at session start, persisted after each exchange.
"""

from __future__ import annotations

import uuid

import structlog
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.conversation import ConversationHistory, MessageRole

logger = structlog.get_logger(__name__)

WINDOW_K = 10  # Number of recent exchanges (each = 1 user + 1 assistant message)


class PostgresBackedMemory:
    def __init__(self, session_id: str, user_id: uuid.UUID, db: AsyncSession) -> None:
        self.session_id = session_id
        self.user_id = user_id
        self.db = db
        self._messages: list[dict] = []

    async def load_history(self) -> None:
        """Hydrate message list from DB on session start."""
        result = await self.db.execute(
            select(ConversationHistory)
            .where(ConversationHistory.session_id == self.session_id)
            .where(ConversationHistory.role.in_([MessageRole.human, MessageRole.ai]))
            .order_by(ConversationHistory.created_at.asc())
            .limit(WINDOW_K * 2)
        )
        rows = result.scalars().all()
        for row in rows:
            role = "user" if row.role == MessageRole.human else "assistant"
            self._messages.append({"role": role, "content": row.content})

        logger.debug("conversation_history_loaded", session_id=self.session_id, count=len(rows))

    def get_history(self) -> list[dict]:
        """Return the last WINDOW_K exchanges as OpenAI message dicts."""
        return self._messages[-(WINDOW_K * 2):]

    async def save_exchange(self, human_msg: str, ai_msg: str) -> None:
        """Persist a human/AI exchange to the DB."""
        self.db.add_all([
            ConversationHistory(
                user_id=self.user_id,
                session_id=self.session_id,
                role=MessageRole.human,
                content=human_msg,
            ),
            ConversationHistory(
                user_id=self.user_id,
                session_id=self.session_id,
                role=MessageRole.ai,
                content=ai_msg,
            ),
        ])
        logger.debug("conversation_exchange_saved", session_id=self.session_id)
