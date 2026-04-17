"""
Tool: calculate_portfolio_allocation

Generates a recommended asset allocation based on risk profile,
investment horizon, and goals. Produces specific percentage targets
per asset class with rebalancing guidance.
"""

import json

from pydantic import BaseModel, Field


class PortfolioCalcInput(BaseModel):
    risk_level: str = Field(
        description="conservative | moderate | aggressive (from assess_risk_profile output)"
    )
    risk_score: float = Field(ge=1, le=10)
    investment_horizon_years: int = Field(ge=1, le=50)
    total_savings: float = Field(ge=0, description="Total investable assets in USD")
    monthly_surplus: float = Field(description="Monthly amount available to invest")
    financial_goals: list[str]
    age: int = Field(ge=18, le=100)


# Base allocations by risk level
_BASE_ALLOCATIONS = {
    "conservative": {
        "US Stocks (Index Funds)": 20,
        "International Stocks": 10,
        "US Bonds": 40,
        "International Bonds": 10,
        "Cash / Money Market": 15,
        "REITs": 5,
    },
    "moderate": {
        "US Stocks (Index Funds)": 40,
        "International Stocks": 15,
        "US Bonds": 25,
        "International Bonds": 10,
        "Cash / Money Market": 5,
        "REITs": 5,
    },
    "aggressive": {
        "US Stocks (Index Funds)": 55,
        "International Stocks": 20,
        "US Bonds": 10,
        "International Bonds": 5,
        "Cash / Money Market": 3,
        "REITs": 7,
    },
}

_ALLOCATION_RATIONALE = {
    "US Stocks (Index Funds)": "Core growth engine. VTI or SPY for broad US market exposure.",
    "International Stocks": "Geographic diversification. VXUS or VEA for developed market exposure.",
    "US Bonds": "Portfolio stability and income. BND for broad US bond market.",
    "International Bonds": "Additional diversification. BNDX for international fixed income.",
    "Cash / Money Market": "Liquidity reserve and sequence-of-returns buffer.",
    "REITs": "Real estate exposure and inflation hedge via REIT index funds.",
}


def _adjust_for_horizon(
    allocations: dict[str, int], horizon_years: int, age: int
) -> dict[str, int]:
    """Fine-tune allocations based on horizon and age."""
    adjusted = dict(allocations)

    # Shift bonds/cash down if very long horizon (<35 years to retirement) for younger investors
    if horizon_years >= 20 and age < 40:
        bond_keys = ["US Bonds", "International Bonds", "Cash / Money Market"]
        stock_keys = ["US Stocks (Index Funds)", "International Stocks"]
        for key in bond_keys:
            if adjusted[key] > 3:
                adjusted[key] = max(adjusted[key] - 3, 3)
        for key in stock_keys:
            adjusted[key] += 3  # Redistribute to stocks

    # Shift more to bonds/cash if horizon is short (approaching goal)
    if horizon_years <= 5:
        adjusted["Cash / Money Market"] = min(adjusted["Cash / Money Market"] + 10, 30)
        adjusted["US Stocks (Index Funds)"] = max(
            adjusted["US Stocks (Index Funds)"] - 7, 10
        )
        adjusted["International Stocks"] = max(
            adjusted["International Stocks"] - 3, 5
        )

    return adjusted


def calculate_portfolio_allocation(
    risk_level: str,
    risk_score: float,
    investment_horizon_years: int,
    total_savings: float,
    monthly_surplus: float,
    financial_goals: list[str],
    age: int,
) -> str:
    """
    Generate recommended portfolio allocation percentages by asset class.
    Returns JSON with allocation breakdown, dollar amounts, rationale per asset class,
    and rebalancing guidance. Call after assess_risk_profile.
    """
    if risk_level not in _BASE_ALLOCATIONS:
        risk_level = "moderate"

    base = _BASE_ALLOCATIONS[risk_level]
    adjusted = _adjust_for_horizon(base, investment_horizon_years, age)

    # Normalize so allocations sum to exactly 100
    total = sum(adjusted.values())
    normalized = {k: round(v / total * 100, 1) for k, v in adjusted.items()}

    allocations_detail = []
    for asset_class, pct in normalized.items():
        dollar_value = total_savings * (pct / 100)
        monthly_contribution = monthly_surplus * (pct / 100)
        allocations_detail.append({
            "asset_class": asset_class,
            "percentage": pct,
            "current_dollar_target": round(dollar_value, 2),
            "monthly_contribution": round(monthly_contribution, 2),
            "rationale": _ALLOCATION_RATIONALE.get(asset_class, ""),
        })

    # Annual savings projection
    annual_surplus = monthly_surplus * 12
    projected_10yr = total_savings * (1.07 ** 10) + annual_surplus * ((1.07 ** 10 - 1) / 0.07)

    result = {
        "risk_level": risk_level,
        "allocations": allocations_detail,
        "total_investable": total_savings,
        "rebalancing_frequency": "Annually or when any allocation drifts more than 5% from target",
        "rebalancing_method": "Rebalance by directing new contributions to underweight asset classes first",
        "projected_value_10yr": round(projected_10yr, 2),
        "projection_assumptions": "7% avg annual return (historical stock/bond blended), no fees",
        "implementation_note": (
            "Open accounts in this priority: 1) 401k (up to employer match), "
            "2) HSA (if eligible), 3) Roth IRA, 4) Max 401k, 5) Taxable brokerage"
        ),
    }
    return json.dumps(result)


SCHEMA = {
    "type": "function",
    "function": {
        "name": "calculate_portfolio_allocation",
        "description": (
            "Generate recommended portfolio allocation percentages by asset class. "
            "Returns allocation breakdown, dollar amounts, and rebalancing guidance. "
            "Call after assess_risk_profile."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "risk_level": {
                    "type": "string",
                    "enum": ["conservative", "moderate", "aggressive"],
                    "description": "From assess_risk_profile output",
                },
                "risk_score": {"type": "number"},
                "investment_horizon_years": {"type": "integer"},
                "total_savings": {"type": "number"},
                "monthly_surplus": {"type": "number"},
                "financial_goals": {"type": "array", "items": {"type": "string"}},
                "age": {"type": "integer"},
            },
            "required": [
                "risk_level", "risk_score", "investment_horizon_years",
                "total_savings", "monthly_surplus", "financial_goals", "age",
            ],
        },
    },
}
