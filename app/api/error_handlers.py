import structlog
from fastapi import Request
from fastapi.responses import JSONResponse
from pydantic import ValidationError

from app.exceptions import FinanceAdvisorError

logger = structlog.get_logger(__name__)


async def finance_advisor_exception_handler(
    request: Request, exc: FinanceAdvisorError
) -> JSONResponse:
    logger.error(
        "application_error",
        error_code=exc.error_code,
        message=exc.message,
        details=exc.details,
    )
    return JSONResponse(
        status_code=exc.http_status,
        content={
            "error_code": exc.error_code,
            "message": exc.message,
            "details": exc.details,
            "request_id": structlog.contextvars.get_contextvars().get("request_id"),
        },
    )


async def validation_exception_handler(
    request: Request, exc: ValidationError
) -> JSONResponse:
    logger.warning("pydantic_validation_error", errors=exc.errors())
    return JSONResponse(
        status_code=422,
        content={
            "error_code": "validation_error",
            "message": "Request validation failed",
            "details": exc.errors(),
        },
    )


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("unhandled_exception", exc_info=exc)
    return JSONResponse(
        status_code=500,
        content={
            "error_code": "internal_error",
            "message": "An unexpected error occurred",
            "request_id": structlog.contextvars.get_contextvars().get("request_id"),
        },
    )
