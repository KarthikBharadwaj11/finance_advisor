import time
import uuid

import structlog
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


class RequestContextMiddleware(BaseHTTPMiddleware):
    """
    Binds a unique request_id to structlog context for every request.
    All downstream loggers automatically include request_id, path, method.
    Adds X-Request-ID to the response headers.
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = uuid.uuid4().hex
        structlog.contextvars.clear_contextvars()
        structlog.contextvars.bind_contextvars(
            request_id=request_id,
            path=str(request.url.path),
            method=request.method,
        )

        start = time.perf_counter()
        response = None
        try:
            response = await call_next(request)
        finally:
            duration_ms = round((time.perf_counter() - start) * 1000, 2)
            structlog.get_logger().info(
                "http_request",
                status_code=response.status_code if response else 500,
                duration_ms=duration_ms,
            )
            structlog.contextvars.clear_contextvars()

        response.headers["X-Request-ID"] = request_id
        return response
