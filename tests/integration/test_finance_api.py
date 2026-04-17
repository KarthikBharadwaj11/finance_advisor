"""
Integration tests for the /finances/* endpoints.

The AgentExecutor is mocked so tests don't hit the OpenAI API.
The DB is a real (in-memory SQLite) to validate the full service layer.
"""

import json
import uuid
from datetime import datetime
from unittest.mock import MagicMock, patch

import pytest
from httpx import AsyncClient

from app.agent.tools.financial_health import analyze_financial_health
from app.agent.tools.risk_assessment import assess_risk_profile


@pytest.mark.asyncio
async def test_health_endpoint(client: AsyncClient):
    resp = await client.get("/api/v1/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_create_user(client: AsyncClient):
    resp = await client.post(
        "/api/v1/users",
        json={
            "email": "test@example.com",
            "full_name": "Test User",
            "password": "securepass123",
            "age": 32,
            "annual_income": 96000,
            "risk_tolerance": "moderate",
        },
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["email"] == "test@example.com"
    assert "id" in data
    return data["id"]


@pytest.mark.asyncio
async def test_analyze_finances_404_for_unknown_user(client: AsyncClient):
    resp = await client.post(
        "/api/v1/finances/analyze",
        json={
            "user_id": str(uuid.uuid4()),
            "profile": {
                "monthly_income": 8000,
                "monthly_expenses": 5000,
                "total_savings": 25000,
                "total_debt": 10000,
                "investment_horizon_years": 20,
                "age": 30,
                "financial_goals": ["retire at 60"],
            },
        },
    )
    assert resp.status_code == 404
    assert resp.json()["error_code"] == "user_not_found"


@pytest.mark.asyncio
async def test_duplicate_email_returns_409(client: AsyncClient):
    payload = {
        "email": "dupe@example.com",
        "full_name": "Dupe User",
        "password": "securepass123",
    }
    await client.post("/api/v1/users", json=payload)
    resp = await client.post("/api/v1/users", json=payload)
    assert resp.status_code == 409
