"""
Tool: analyze_financial_health

Computes quantitative KPIs from raw financial profile data.
Pure Python — no I/O, no LLM calls. Deterministic and testable.
"""

import json
from decimal import Decimal

from pydantic import BaseModel, Field


class FinancialHealthInput(BaseModel):
    monthly_income: float = Field(gt=0, description="Gross monthly income in USD")
    monthly_expenses: float = Field(ge=0, description="Total monthly expenses in USD")
    total_savings: float = Field(ge=0, description="Total liquid savings in USD")
    total_debt: float = Field(ge=0, description="Total outstanding debt in USD")
    age: int = Field(ge=18, le=100)


def _compute_health_score(
    savings_rate: float,
    dti: float,
    emergency_months: float,
    age: int,
    net_worth: float,
    monthly_income: float,
) -> float:
    """
    Composite financial health score (0–100).

    Component weights:
    - Savings rate (25%): 0% = 0pts, 20%+ = 25pts
    - Emergency fund (25%): 0 months = 0pts, 6+ months = 25pts
    - Debt-to-income (25%): >50% DTI = 0pts, <10% DTI = 25pts
    - Age-adjusted net worth (25%): based on Fidelity benchmark
    """
    # Savings rate score: 0pts at 0%, max 25pts at 20%+ savings rate
    savings_score = min(savings_rate / 0.20, 1.0) * 25

    # Emergency fund score: max 25pts at 6+ months
    emergency_score = min(emergency_months / 6.0, 1.0) * 25

    # DTI score: max 25pts at 0% DTI, 0pts at 50%+ DTI
    dti_score = max(0, 1 - dti / 0.50) * 25

    # Age-adjusted net worth score: based on Fidelity guideline
    # Target: (age/10) × annual_income; 0pts if 0x target, 25pts if 1x+ target
    annual_income = monthly_income * 12
    fidelity_target = (age / 10) * annual_income if annual_income > 0 else 1
    net_worth_ratio = net_worth / fidelity_target if fidelity_target > 0 else 0
    net_worth_score = min(max(net_worth_ratio, 0), 1.0) * 25

    return round(savings_score + emergency_score + dti_score + net_worth_score, 1)


def analyze_financial_health(
    monthly_income: float,
    monthly_expenses: float,
    total_savings: float,
    total_debt: float,
    age: int,
) -> str:
    """
    Compute financial health KPIs from raw financial data.
    Returns JSON with: savings_rate, debt_to_income_ratio, emergency_fund_months,
    net_worth, financial_health_score (0-100), and interpretation.
    Always call this tool FIRST before any other analysis.
    """
    monthly_savings = monthly_income - monthly_expenses
    annual_income = monthly_income * 12

    savings_rate = monthly_savings / monthly_income if monthly_income > 0 else 0.0
    dti = total_debt / annual_income if annual_income > 0 else 0.0
    emergency_months = total_savings / monthly_expenses if monthly_expenses > 0 else 0.0
    net_worth = total_savings - total_debt

    health_score = _compute_health_score(
        savings_rate=savings_rate,
        dti=dti,
        emergency_months=emergency_months,
        age=age,
        net_worth=net_worth,
        monthly_income=monthly_income,
    )

    # Human-readable interpretation
    if health_score >= 75:
        interpretation = "Strong financial position — focus on optimization and wealth building."
    elif health_score >= 50:
        interpretation = "Moderate financial health — targeted improvements will accelerate progress."
    elif health_score >= 25:
        interpretation = "Financial challenges present — prioritize emergency fund and debt reduction."
    else:
        interpretation = "Critical financial situation — immediate action required on debt and cash flow."

    result = {
        "savings_rate": round(savings_rate, 4),
        "savings_rate_pct": f"{savings_rate * 100:.1f}%",
        "debt_to_income_ratio": round(dti, 4),
        "dti_pct": f"{dti * 100:.1f}%",
        "emergency_fund_months": round(emergency_months, 1),
        "net_worth": round(net_worth, 2),
        "monthly_surplus": round(monthly_savings, 2),
        "financial_health_score": health_score,
        "interpretation": interpretation,
        "benchmarks": {
            "savings_rate_target": "20% (good) / 30%+ (excellent)",
            "emergency_fund_target": "6 months expenses",
            "dti_target": "Below 20% (healthy)",
        },
    }
    return json.dumps(result)


SCHEMA = {
    "type": "function",
    "function": {
        "name": "analyze_financial_health",
        "description": (
            "Compute financial health KPIs from raw financial data. "
            "Returns savings_rate, debt_to_income_ratio, emergency_fund_months, "
            "net_worth, financial_health_score (0-100), and interpretation. "
            "Always call this tool FIRST before any other analysis."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "monthly_income": {"type": "number", "description": "Gross monthly income in USD"},
                "monthly_expenses": {"type": "number", "description": "Total monthly expenses in USD"},
                "total_savings": {"type": "number", "description": "Total liquid savings in USD"},
                "total_debt": {"type": "number", "description": "Total outstanding debt in USD"},
                "age": {"type": "integer", "description": "Client age in years"},
            },
            "required": ["monthly_income", "monthly_expenses", "total_savings", "total_debt", "age"],
        },
    },
}
