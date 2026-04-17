"""
Custom exception hierarchy for the AI Financial Advisor.

Each exception carries:
  - error_code: machine-readable slug (e.g. "user_not_found")
  - message: human-readable description
  - details: optional structured payload (e.g. field-level validation errors)

error_handlers.py maps each class to its HTTP status code.
"""


class FinanceAdvisorError(Exception):
    """Base for all application errors."""

    error_code: str = "internal_error"
    http_status: int = 500

    def __init__(self, message: str, details: dict | None = None) -> None:
        super().__init__(message)
        self.message = message
        self.details = details or {}


# ── Validation / input errors (422) ──────────────────────────────────────────

class ValidationError(FinanceAdvisorError):
    error_code = "validation_error"
    http_status = 422


class InsufficientDataError(FinanceAdvisorError):
    """Raised when the user profile lacks enough data for analysis."""
    error_code = "insufficient_data"
    http_status = 422


# ── Resource not found (404) ──────────────────────────────────────────────────

class ResourceNotFoundError(FinanceAdvisorError):
    error_code = "not_found"
    http_status = 404


class UserNotFoundError(ResourceNotFoundError):
    error_code = "user_not_found"


class PortfolioNotFoundError(ResourceNotFoundError):
    error_code = "portfolio_not_found"


# ── Agent / LLM errors ────────────────────────────────────────────────────────

class AgentError(FinanceAdvisorError):
    error_code = "agent_error"
    http_status = 500


class AgentTimeoutError(AgentError):
    """Agent exceeded its configured execution timeout."""
    error_code = "agent_timeout"
    http_status = 504


class AgentToolError(AgentError):
    """A specific tool raised an unhandled exception during agent execution."""
    error_code = "agent_tool_error"
    http_status = 500


class LLMProviderError(AgentError):
    """OpenAI API returned an error or was unreachable."""
    error_code = "llm_provider_error"
    http_status = 502


# ── Database errors (503) ─────────────────────────────────────────────────────

class DatabaseError(FinanceAdvisorError):
    error_code = "database_error"
    http_status = 503


class DatabaseConnectionError(DatabaseError):
    error_code = "database_connection_error"
