"""
agent_service: orchestrates the agent loop for financial analysis.

Owns:
  1. Async/sync bridge (run_in_executor for the synchronous agent loop)
  2. Timeout enforcement
  3. Conversation memory lifecycle (load → run → save)
  4. Response assembly from agent steps
  5. Structured logging
"""

from __future__ import annotations

import asyncio
import json
import uuid
from datetime import datetime

import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from app.agent.executor import AgentResult, run_agent
from app.agent.memory import PostgresBackedMemory
from app.agent.prompts import ANALYSIS_INPUT_TEMPLATE, RECOMMENDATION_INPUT_TEMPLATE
from app.config import settings
from app.exceptions import AgentTimeoutError, LLMProviderError
from app.schemas.finance import (
    AgentStep,
    AllocationBreakdown,
    AllocationItem,
    AnalysisRequest,
    AnalysisResponse,
    BudgetCategory,
    BudgetPlan,
    KPIResult,
    RecommendationRequest,
    RecommendationResponse,
    RiskProfile,
)

logger = structlog.get_logger(__name__)


def _parse_kpis(tool_outputs: dict[str, str]) -> KPIResult:
    raw = json.loads(tool_outputs.get("analyze_financial_health", "{}"))
    return KPIResult(
        savings_rate=raw.get("savings_rate", 0),
        debt_to_income_ratio=raw.get("debt_to_income_ratio", 0),
        emergency_fund_months=raw.get("emergency_fund_months", 0),
        net_worth=raw.get("net_worth", 0),
        financial_health_score=raw.get("financial_health_score", 0),
    )


def _parse_risk_profile(tool_outputs: dict[str, str]) -> RiskProfile:
    raw = json.loads(tool_outputs.get("assess_risk_profile", "{}"))
    return RiskProfile(
        level=raw.get("risk_level", "moderate"),
        score=int(raw.get("risk_score", 5)),
        rationale=raw.get("rationale", ""),
    )


def _parse_allocation(tool_outputs: dict[str, str]) -> AllocationBreakdown:
    raw = json.loads(tool_outputs.get("calculate_portfolio_allocation", "{}"))
    items = [
        AllocationItem(
            asset_class=a["asset_class"],
            percentage=a["percentage"],
            rationale=a.get("rationale", ""),
        )
        for a in raw.get("allocations", [])
    ]
    return AllocationBreakdown(
        allocations=items,
        rebalancing_frequency=raw.get("rebalancing_frequency", "Annually"),
        notes=raw.get("implementation_note", ""),
    )


def _parse_budget_plan(tool_outputs: dict[str, str]) -> BudgetPlan:
    raw = json.loads(tool_outputs.get("generate_budget_plan", "{}"))
    categories = [
        BudgetCategory(
            category=c["category"],
            current_amount=c["current_amount"],
            recommended_amount=c["recommended_amount"],
            change=c.get("change", "maintain"),
            tip=c.get("tip", ""),
        )
        for c in raw.get("categories", [])
    ]
    return BudgetPlan(
        categories=categories,
        monthly_surplus=raw.get("current_monthly_surplus", 0),
        three_month_action=raw.get("three_month_action_plan", []),
    )


def _extract_tool_outputs(result: AgentResult) -> dict[str, str]:
    """Map tool name → last output string."""
    return {step.tool_name: step.tool_output for step in result.steps}


def _build_agent_steps(result: AgentResult) -> list[AgentStep]:
    return [
        AgentStep(
            step_number=i + 1,
            tool_name=step.tool_name,
            tool_input=step.tool_input,
            tool_output_summary=step.tool_output[:300],
        )
        for i, step in enumerate(result.steps)
    ]


async def _run_agent_async(input_text: str, chat_history: list[dict]) -> AgentResult:
    """Bridge the synchronous agent loop into async using a thread pool."""
    loop = asyncio.get_event_loop()
    try:
        result = await asyncio.wait_for(
            loop.run_in_executor(None, run_agent, input_text, chat_history),
            timeout=float(settings.AGENT_TIMEOUT_SECONDS),
        )
    except asyncio.TimeoutError:
        raise AgentTimeoutError(
            f"Agent exceeded {settings.AGENT_TIMEOUT_SECONDS}s timeout",
            details={"timeout_seconds": settings.AGENT_TIMEOUT_SECONDS},
        )
    except Exception as exc:
        raise LLMProviderError(f"LLM provider error: {exc}") from exc
    return result


async def run_financial_analysis(request: AnalysisRequest, db: AsyncSession) -> AnalysisResponse:
    log = logger.bind(user_id=str(request.user_id), session_id=request.session_id)
    log.info("financial_analysis_started")

    session_id = request.session_id or uuid.uuid4().hex
    memory = PostgresBackedMemory(session_id, request.user_id, db)
    await memory.load_history()

    p = request.profile
    input_text = ANALYSIS_INPUT_TEMPLATE.format(
        monthly_income=float(p.monthly_income),
        monthly_expenses=float(p.monthly_expenses),
        total_savings=float(p.total_savings),
        total_debt=float(p.total_debt),
        age=p.age,
        investment_horizon_years=p.investment_horizon_years,
        financial_goals=", ".join(p.financial_goals),
        existing_portfolio=dict(p.existing_portfolio) if p.existing_portfolio else "None",
    )

    agent_result = await _run_agent_async(input_text, memory.get_history())
    tool_outputs = _extract_tool_outputs(agent_result)
    agent_steps = _build_agent_steps(agent_result)

    try:
        raw = agent_result.final_answer.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        parsed_output = json.loads(raw)
        narrative = parsed_output.get("narrative_summary", agent_result.final_answer)
    except (json.JSONDecodeError, TypeError):
        narrative = agent_result.final_answer

    await memory.save_exchange(input_text, agent_result.final_answer)

    log.info(
        "financial_analysis_completed",
        tool_calls=len(agent_steps),
        input_tokens=agent_result.total_input_tokens,
        output_tokens=agent_result.total_output_tokens,
    )

    return AnalysisResponse(
        user_id=request.user_id,
        session_id=session_id,
        kpis=_parse_kpis(tool_outputs),
        risk_profile=_parse_risk_profile(tool_outputs),
        portfolio_allocation=_parse_allocation(tool_outputs),
        budget_plan=_parse_budget_plan(tool_outputs),
        narrative_summary=narrative,
        agent_steps=agent_steps,
        created_at=datetime.utcnow(),
    )


async def run_recommendation(request: RecommendationRequest, db: AsyncSession) -> RecommendationResponse:
    log = logger.bind(user_id=str(request.user_id), session_id=request.session_id)
    log.info("recommendation_started", question_preview=request.question[:80])

    session_id = request.session_id or uuid.uuid4().hex
    memory = PostgresBackedMemory(session_id, request.user_id, db)
    await memory.load_history()

    input_text = RECOMMENDATION_INPUT_TEMPLATE.format(question=request.question)
    agent_result = await _run_agent_async(input_text, memory.get_history())

    tool_outputs = _extract_tool_outputs(agent_result)
    agent_steps = _build_agent_steps(agent_result)

    rag_raw = tool_outputs.get("retrieve_financial_knowledge", "{}")
    try:
        rag_data = json.loads(rag_raw)
        sources = [p.get("source", "") for p in rag_data.get("passages", [])]
    except (json.JSONDecodeError, AttributeError):
        sources = []

    await memory.save_exchange(input_text, agent_result.final_answer)
    log.info("recommendation_completed", tool_calls=len(agent_steps))

    return RecommendationResponse(
        user_id=request.user_id,
        session_id=session_id,
        answer=agent_result.final_answer,
        sources=sources,
        agent_steps=agent_steps,
        created_at=datetime.utcnow(),
    )
