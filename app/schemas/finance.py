"""
Core schemas for financial analysis requests and responses.

AnalysisResponse is the primary structured output:
  - kpis: computed financial health indicators
  - risk_profile: assessed risk tolerance
  - portfolio_allocation: recommended asset mix
  - budget_plan: recommended monthly budget breakdown
  - narrative_summary: LLM-generated plain-English explanation
  - agent_steps: audit trail of every tool call made by the agent
"""

import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class FinancialProfile(BaseModel):
    """Input: the user's current financial situation."""

    monthly_income: Decimal = Field(gt=0, description="Gross monthly income in USD")
    monthly_expenses: Decimal = Field(ge=0, description="Total monthly expenses in USD")
    total_savings: Decimal = Field(ge=0, description="Total liquid savings / emergency fund")
    total_debt: Decimal = Field(ge=0, description="Total outstanding debt (excluding mortgage)")
    investment_horizon_years: int = Field(ge=1, le=50, description="Years until primary financial goal")
    age: int = Field(ge=18, le=100)
    financial_goals: list[str] = Field(
        min_length=1,
        description="e.g. ['retire at 60', 'buy a house in 5 years']",
    )
    # Optional: existing portfolio positions {asset_class: current_value}
    existing_portfolio: dict[str, Decimal] = Field(
        default_factory=dict,
        description="Map of asset class to current USD value",
    )


class AnalysisRequest(BaseModel):
    user_id: uuid.UUID
    profile: FinancialProfile
    session_id: str = Field(
        default="",
        description="Leave empty to start a new conversation session",
    )


# ── Structured outputs (populated from tool results) ─────────────────────────

class KPIResult(BaseModel):
    """Quantitative financial health indicators."""

    savings_rate: float = Field(description="Monthly savings / monthly income (0–1)")
    debt_to_income_ratio: float = Field(description="Total debt / annual income")
    emergency_fund_months: float = Field(description="Months of expenses covered by savings")
    net_worth: Decimal = Field(description="Total savings minus total debt")
    financial_health_score: float = Field(ge=0, le=100, description="Composite score 0–100")


class RiskProfile(BaseModel):
    level: str = Field(description="conservative | moderate | aggressive")
    score: int = Field(ge=1, le=10, description="1 = most conservative, 10 = most aggressive")
    rationale: str


class AllocationItem(BaseModel):
    asset_class: str
    percentage: float = Field(ge=0, le=100)
    rationale: str


class AllocationBreakdown(BaseModel):
    allocations: list[AllocationItem]
    rebalancing_frequency: str
    notes: str


class BudgetCategory(BaseModel):
    category: str
    current_amount: Decimal
    recommended_amount: Decimal
    change: str  # "increase" | "decrease" | "maintain"
    tip: str


class BudgetPlan(BaseModel):
    categories: list[BudgetCategory]
    monthly_surplus: Decimal
    three_month_action: list[str] = Field(description="Immediate action items")


class AgentStep(BaseModel):
    """Single tool invocation in the agent's reasoning chain."""

    step_number: int
    tool_name: str
    tool_input: dict
    tool_output_summary: str


class AnalysisResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: uuid.UUID
    session_id: str
    kpis: KPIResult
    risk_profile: RiskProfile
    portfolio_allocation: AllocationBreakdown
    budget_plan: BudgetPlan
    narrative_summary: str
    agent_steps: list[AgentStep]
    created_at: datetime = Field(default_factory=datetime.utcnow)


class RecommendationRequest(BaseModel):
    user_id: uuid.UUID
    question: str = Field(
        min_length=5,
        description="Specific financial question or scenario to analyze",
    )
    session_id: str = Field(default="")


class RecommendationResponse(BaseModel):
    user_id: uuid.UUID
    session_id: str
    answer: str
    sources: list[str] = Field(description="Knowledge base passages used")
    agent_steps: list[AgentStep]
    created_at: datetime = Field(default_factory=datetime.utcnow)
