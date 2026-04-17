"""
FastAPI application factory.

Lifespan manages:
1. structlog configuration
2. FAISS vector store initialization (load from disk or build from corpus)
3. LangChain AgentExecutor construction
4. SQLAlchemy engine disposal on shutdown
"""

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.error_handlers import (
    finance_advisor_exception_handler,
    unhandled_exception_handler,
)
from app.api.middleware import RequestContextMiddleware
from app.api.v1.router import v1_router
from app.config import settings
from app.db.session import engine
from app.exceptions import FinanceAdvisorError
from app.logging_config import configure_structlog
from app.rag.vector_store import initialize_vector_store

__version__ = "0.1.0"


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    # ── STARTUP ──────────────────────────────────────────────────────────────
    configure_structlog()
    log = structlog.get_logger(__name__)
    log.info("application_starting", version=__version__)

    await initialize_vector_store()
    log.info("application_ready", version=__version__)
    yield

    # ── SHUTDOWN ─────────────────────────────────────────────────────────────
    await engine.dispose()
    log.info("application_stopped")


def create_app() -> FastAPI:
    app = FastAPI(
        title="AI Financial Advisor",
        description=(
            "Production-grade AI Financial Advisor powered by LangChain agents, "
            "RAG retrieval, and structured financial analysis."
        ),
        version=__version__,
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # Middleware (order matters: CORS runs before request context)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS or ["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(RequestContextMiddleware)

    # Exception handlers
    app.add_exception_handler(FinanceAdvisorError, finance_advisor_exception_handler)  # type: ignore[arg-type]
    app.add_exception_handler(Exception, unhandled_exception_handler)  # type: ignore[arg-type]

    # Routes
    app.include_router(v1_router, prefix="/api/v1")

    return app


app = create_app()
