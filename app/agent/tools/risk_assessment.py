"""
Tool: assess_risk_profile

Determines an investor's risk tolerance using a multi-factor scoring model.
Inputs: age, investment horizon, income stability, debt level, goals.
Output: risk level (conservative/moderate/aggressive), score 1–10, rationale.
"""

import json

from pydantic import BaseModel, Field


class RiskAssessmentInput(BaseModel):
    age: int = Field(ge=18, le=100)
    investment_horizon_years: int = Field(ge=1, le=50)
    monthly_income: float = Field(gt=0)
    monthly_expenses: float = Field(ge=0)
    total_debt: float = Field(ge=0)
    total_savings: float = Field(ge=0)
    financial_goals: list[str]
    emergency_fund_months: float = Field(
        ge=0,
        description="Months of expenses covered by savings (from analyze_financial_health output)"
    )


def _score_age(age: int) -> float:
    """Younger investors can bear more risk. Max 3 pts."""
    if age < 35:
        return 3.0
    elif age < 45:
        return 2.5
    elif age < 55:
        return 2.0
    elif age < 65:
        return 1.0
    else:
        return 0.5


def _score_horizon(years: int) -> float:
    """Longer horizon allows more risk. Max 3 pts."""
    if years >= 20:
        return 3.0
    elif years >= 10:
        return 2.0
    elif years >= 5:
        return 1.0
    else:
        return 0.5


def _score_financial_cushion(
    emergency_months: float,
    monthly_income: float,
    monthly_expenses: float,
    total_debt: float,
) -> float:
    """Better financial cushion = more capacity for risk. Max 2 pts."""
    score = 0.0
    if emergency_months >= 6:
        score += 1.0
    elif emergency_months >= 3:
        score += 0.5

    annual_income = monthly_income * 12
    dti = total_debt / annual_income if annual_income > 0 else 1.0
    if dti < 0.15:
        score += 1.0
    elif dti < 0.35:
        score += 0.5

    return score


def _detect_goal_risk_preference(goals: list[str]) -> float:
    """Scan goals text for risk-relevant signals. Max 2 pts."""
    goal_text = " ".join(goals).lower()
    aggressive_keywords = {"retire early", "fire", "wealth", "grow", "aggressive", "maximum"}
    conservative_keywords = {"preserve", "safe", "protect", "house", "education", "emergency"}

    aggressive_count = sum(1 for kw in aggressive_keywords if kw in goal_text)
    conservative_count = sum(1 for kw in conservative_keywords if kw in goal_text)

    if aggressive_count > conservative_count:
        return 2.0
    elif conservative_count > aggressive_count:
        return 0.5
    return 1.0


def assess_risk_profile(
    age: int,
    investment_horizon_years: int,
    monthly_income: float,
    monthly_expenses: float,
    total_debt: float,
    total_savings: float,
    financial_goals: list[str],
    emergency_fund_months: float,
) -> str:
    """
    Assess investor risk tolerance from financial and demographic factors.
    Returns JSON with risk level (conservative/moderate/aggressive),
    risk score (1-10), component breakdown, and rationale.
    Call after analyze_financial_health (pass emergency_fund_months from its output).
    """
    age_score = _score_age(age)
    horizon_score = _score_horizon(investment_horizon_years)
    cushion_score = _score_financial_cushion(
        emergency_fund_months, monthly_income, monthly_expenses, total_debt
    )
    goal_score = _detect_goal_risk_preference(financial_goals)

    raw_score = age_score + horizon_score + cushion_score + goal_score
    # Normalize to 1–10 scale (max raw = 10)
    normalized_score = round((raw_score / 10.0) * 9 + 1, 1)

    if normalized_score <= 3.5:
        level = "conservative"
        typical_allocation = "30% stocks / 50% bonds / 20% cash"
        expected_return = "3–5% annually"
        max_drawdown = "10–15%"
    elif normalized_score <= 6.5:
        level = "moderate"
        typical_allocation = "60% stocks / 35% bonds / 5% cash"
        expected_return = "5–7% annually"
        max_drawdown = "20–30%"
    else:
        level = "aggressive"
        typical_allocation = "85% stocks / 10% bonds / 5% cash"
        expected_return = "7–10% annually"
        max_drawdown = "40–50%"

    result = {
        "risk_level": level,
        "risk_score": normalized_score,
        "score_components": {
            "age_score": age_score,
            "horizon_score": horizon_score,
            "financial_cushion_score": cushion_score,
            "goal_alignment_score": goal_score,
        },
        "typical_allocation": typical_allocation,
        "expected_annual_return": expected_return,
        "max_comfortable_drawdown": max_drawdown,
        "rationale": (
            f"Age {age} with {investment_horizon_years}-year horizon and "
            f"{emergency_fund_months:.1f} months emergency fund. "
            f"Debt-to-income, savings cushion, and goal signals indicate a {level} risk profile."
        ),
    }
    return json.dumps(result)


SCHEMA = {
    "type": "function",
    "function": {
        "name": "assess_risk_profile",
        "description": (
            "Assess investor risk tolerance from financial and demographic factors. "
            "Returns risk level (conservative/moderate/aggressive), risk score (1-10), "
            "and rationale. Call after analyze_financial_health."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "age": {"type": "integer"},
                "investment_horizon_years": {"type": "integer"},
                "monthly_income": {"type": "number"},
                "monthly_expenses": {"type": "number"},
                "total_debt": {"type": "number"},
                "total_savings": {"type": "number"},
                "financial_goals": {"type": "array", "items": {"type": "string"}},
                "emergency_fund_months": {
                    "type": "number",
                    "description": "From analyze_financial_health output",
                },
            },
            "required": [
                "age", "investment_horizon_years", "monthly_income", "monthly_expenses",
                "total_debt", "total_savings", "financial_goals", "emergency_fund_months",
            ],
        },
    },
}
