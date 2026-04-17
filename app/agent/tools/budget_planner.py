"""
Tool: generate_budget_plan

Produces a structured monthly budget recommendation based on
the user's income, current expenses, and financial goals.
Uses the 50/30/20 framework as the baseline, adjusted for
the user's specific situation.
"""

import json

from pydantic import BaseModel, Field


class BudgetPlanInput(BaseModel):
    monthly_income: float = Field(gt=0)
    monthly_expenses: float = Field(ge=0)
    total_debt: float = Field(ge=0)
    total_savings: float = Field(ge=0)
    financial_goals: list[str]
    savings_rate: float = Field(
        ge=0,
        le=1,
        description="Current savings rate from analyze_financial_health output",
    )
    emergency_fund_months: float = Field(
        ge=0,
        description="Emergency fund coverage months from analyze_financial_health output",
    )


# Benchmark percentages (of take-home income) for each category
_BENCHMARKS = {
    "Housing (Rent/Mortgage)": (0.25, 0.35),
    "Food (Groceries + Dining)": (0.10, 0.15),
    "Transportation": (0.10, 0.15),
    "Healthcare & Insurance": (0.05, 0.10),
    "Utilities & Subscriptions": (0.05, 0.08),
    "Personal Care & Clothing": (0.03, 0.05),
    "Entertainment & Leisure": (0.05, 0.08),
    "Emergency Fund Contribution": (0.05, 0.10),
    "Debt Repayment (extra)": (0.05, 0.15),
    "Investments & Savings": (0.15, 0.25),
}


def _determine_savings_target(
    savings_rate: float,
    emergency_fund_months: float,
    total_debt: float,
    monthly_income: float,
    goals: list[str],
) -> float:
    """Compute recommended savings rate based on situation."""
    goal_text = " ".join(goals).lower()
    is_fire_goal = any(kw in goal_text for kw in ["retire early", "fire", "financial independence"])

    annual_income = monthly_income * 12
    dti = total_debt / annual_income if annual_income > 0 else 0

    # Start from 20% baseline
    target = 0.20

    # Boost if emergency fund is underfunded
    if emergency_fund_months < 3:
        target += 0.05
    # Boost for FIRE goals
    if is_fire_goal:
        target += 0.10
    # Reduce if high debt load requires focus
    if dti > 0.40:
        target = max(target - 0.05, 0.10)

    return round(target, 2)


def generate_budget_plan(
    monthly_income: float,
    monthly_expenses: float,
    total_debt: float,
    total_savings: float,
    financial_goals: list[str],
    savings_rate: float,
    emergency_fund_months: float,
) -> str:
    """
    Generate a structured monthly budget plan with category-level recommendations.
    Returns JSON with current vs recommended allocations, monthly surplus,
    and a 90-day action plan. Call after analyze_financial_health.
    """
    recommended_savings_rate = _determine_savings_target(
        savings_rate, emergency_fund_months, total_debt, monthly_income, financial_goals
    )

    monthly_surplus = monthly_income - monthly_expenses
    current_savings_dollars = monthly_surplus

    # Derive approximate current category breakdown (simplified)
    # In production, users would input per-category actuals
    current_breakdown = {
        "Housing (Rent/Mortgage)": monthly_expenses * 0.35,
        "Food (Groceries + Dining)": monthly_expenses * 0.15,
        "Transportation": monthly_expenses * 0.15,
        "Healthcare & Insurance": monthly_expenses * 0.10,
        "Utilities & Subscriptions": monthly_expenses * 0.08,
        "Personal Care & Clothing": monthly_expenses * 0.05,
        "Entertainment & Leisure": monthly_expenses * 0.07,
        "Debt Repayment (extra)": monthly_expenses * 0.05,
    }

    # Recommended amounts based on benchmarks
    categories = []
    for category, (low_pct, high_pct) in _BENCHMARKS.items():
        if category in ("Emergency Fund Contribution", "Investments & Savings"):
            # Handle savings categories separately
            continue

        current_amt = current_breakdown.get(category, 0)
        mid_pct = (low_pct + high_pct) / 2
        recommended_amt = monthly_income * mid_pct

        if current_amt > recommended_amt * 1.15:
            change = "decrease"
            tip = f"Reducing this by ${current_amt - recommended_amt:.0f}/month frees up capital for savings."
        elif current_amt < recommended_amt * 0.85:
            change = "maintain"
            tip = "Within healthy range — no action needed."
        else:
            change = "maintain"
            tip = "Within the recommended range for your income level."

        categories.append({
            "category": category,
            "current_amount": round(current_amt, 2),
            "recommended_amount": round(recommended_amt, 2),
            "benchmark_range": f"{low_pct*100:.0f}–{high_pct*100:.0f}% of income",
            "change": change,
            "tip": tip,
        })

    # Savings allocation
    savings_dollars = monthly_income * recommended_savings_rate
    ef_priority = emergency_fund_months < 6

    three_month_actions = []
    if emergency_fund_months < 3:
        three_month_actions.append(
            f"URGENT: Build emergency fund to 3 months (${monthly_expenses * 3:,.0f}). "
            "Open a high-yield savings account and auto-transfer on payday."
        )
    if total_debt > monthly_income * 6:
        three_month_actions.append(
            "Implement debt avalanche: list all debts by interest rate and direct "
            "all extra cash to the highest-rate debt first."
        )
    three_month_actions.append(
        f"Automate savings: set up auto-transfer of ${savings_dollars:,.0f}/month to "
        "investment accounts on payday."
    )
    three_month_actions.append(
        "Review and eliminate at least one recurring subscription you don't actively use."
    )
    if monthly_income * 12 >= 150_000:
        three_month_actions.append(
            "At your income level, consult a CPA about tax-loss harvesting and back-door Roth IRA."
        )

    result = {
        "framework": "50/30/20 adapted to your situation",
        "recommended_savings_rate_pct": f"{recommended_savings_rate * 100:.0f}%",
        "recommended_monthly_savings": round(savings_dollars, 2),
        "current_monthly_surplus": round(monthly_surplus, 2),
        "surplus_gap": round(savings_dollars - monthly_surplus, 2),
        "categories": categories,
        "savings_breakdown": {
            "Emergency Fund (if underfunded)": round(savings_dollars * 0.4, 2) if ef_priority else 0,
            "Debt Repayment Acceleration": round(savings_dollars * 0.3, 2) if total_debt > 0 else 0,
            "Investments (401k/IRA/Brokerage)": round(savings_dollars * (0.3 if ef_priority else 1.0), 2),
        },
        "three_month_action_plan": three_month_actions,
    }
    return json.dumps(result)


SCHEMA = {
    "type": "function",
    "function": {
        "name": "generate_budget_plan",
        "description": (
            "Generate a structured monthly budget plan with category-level recommendations. "
            "Returns current vs recommended allocations, monthly surplus, and 90-day action plan. "
            "Call after analyze_financial_health."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "monthly_income": {"type": "number"},
                "monthly_expenses": {"type": "number"},
                "total_debt": {"type": "number"},
                "total_savings": {"type": "number"},
                "financial_goals": {"type": "array", "items": {"type": "string"}},
                "savings_rate": {
                    "type": "number",
                    "description": "From analyze_financial_health output (0-1 decimal)",
                },
                "emergency_fund_months": {
                    "type": "number",
                    "description": "From analyze_financial_health output",
                },
            },
            "required": [
                "monthly_income", "monthly_expenses", "total_debt", "total_savings",
                "financial_goals", "savings_rate", "emergency_fund_months",
            ],
        },
    },
}
