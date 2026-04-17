"""
Unit tests for agent tools.

Tools are pure Python functions — test them without any mocks.
"""

import json

import pytest

from app.agent.tools.financial_health import analyze_financial_health
from app.agent.tools.risk_assessment import assess_risk_profile
from app.agent.tools.portfolio_calc import calculate_portfolio_allocation
from app.agent.tools.budget_planner import generate_budget_plan


class TestAnalyzeFinancialHealth:
    def test_healthy_profile(self):
        result = json.loads(
            analyze_financial_health.invoke({
                "monthly_income": 10000,
                "monthly_expenses": 6000,
                "total_savings": 50000,
                "total_debt": 10000,
                "age": 35,
            })
        )
        assert result["savings_rate"] == pytest.approx(0.40, abs=0.01)
        assert result["emergency_fund_months"] == pytest.approx(8.33, abs=0.1)
        assert result["net_worth"] == 40000
        assert result["financial_health_score"] > 60

    def test_struggling_profile(self):
        result = json.loads(
            analyze_financial_health.invoke({
                "monthly_income": 4000,
                "monthly_expenses": 3900,
                "total_savings": 500,
                "total_debt": 40000,
                "age": 45,
            })
        )
        assert result["savings_rate"] < 0.05
        assert result["financial_health_score"] < 30
        assert "critical" in result["interpretation"].lower()

    def test_zero_expenses_does_not_crash(self):
        result = json.loads(
            analyze_financial_health.invoke({
                "monthly_income": 5000,
                "monthly_expenses": 0,
                "total_savings": 30000,
                "total_debt": 0,
                "age": 30,
            })
        )
        assert result["emergency_fund_months"] == 0  # 0/0 → 0

    def test_health_score_bounds(self):
        result = json.loads(
            analyze_financial_health.invoke({
                "monthly_income": 20000,
                "monthly_expenses": 4000,
                "total_savings": 500000,
                "total_debt": 0,
                "age": 40,
            })
        )
        assert 0 <= result["financial_health_score"] <= 100


class TestAssessRiskProfile:
    def _base_inputs(self, **overrides) -> dict:
        base = {
            "age": 30,
            "investment_horizon_years": 30,
            "monthly_income": 10000,
            "monthly_expenses": 6000,
            "total_debt": 0,
            "total_savings": 50000,
            "financial_goals": ["retire early", "financial independence"],
            "emergency_fund_months": 8.0,
        }
        base.update(overrides)
        return base

    def test_young_long_horizon_is_aggressive(self):
        result = json.loads(assess_risk_profile.invoke(self._base_inputs()))
        assert result["risk_level"] == "aggressive"

    def test_near_retirement_is_conservative(self):
        result = json.loads(
            assess_risk_profile.invoke(
                self._base_inputs(
                    age=62,
                    investment_horizon_years=3,
                    financial_goals=["preserve capital", "safe income"],
                )
            )
        )
        assert result["risk_level"] == "conservative"

    def test_score_in_valid_range(self):
        result = json.loads(assess_risk_profile.invoke(self._base_inputs()))
        assert 1 <= result["risk_score"] <= 10


class TestCalculatePortfolioAllocation:
    def test_allocations_sum_to_100(self):
        result = json.loads(
            calculate_portfolio_allocation.invoke({
                "risk_level": "moderate",
                "risk_score": 5.5,
                "investment_horizon_years": 15,
                "total_savings": 100000,
                "monthly_surplus": 2000,
                "financial_goals": ["retirement"],
                "age": 40,
            })
        )
        total_pct = sum(a["percentage"] for a in result["allocations"])
        assert total_pct == pytest.approx(100.0, abs=0.5)

    def test_conservative_has_more_bonds(self):
        result = json.loads(
            calculate_portfolio_allocation.invoke({
                "risk_level": "conservative",
                "risk_score": 2.0,
                "investment_horizon_years": 5,
                "total_savings": 200000,
                "monthly_surplus": 1000,
                "financial_goals": ["capital preservation"],
                "age": 60,
            })
        )
        bonds = sum(
            a["percentage"]
            for a in result["allocations"]
            if "Bond" in a["asset_class"]
        )
        stocks = sum(
            a["percentage"]
            for a in result["allocations"]
            if "Stock" in a["asset_class"]
        )
        assert bonds > stocks


class TestGenerateBudgetPlan:
    def test_returns_action_plan(self):
        result = json.loads(
            generate_budget_plan.invoke({
                "monthly_income": 8000,
                "monthly_expenses": 6000,
                "total_debt": 20000,
                "total_savings": 5000,
                "financial_goals": ["pay off debt", "build emergency fund"],
                "savings_rate": 0.25,
                "emergency_fund_months": 0.8,
            })
        )
        assert len(result["three_month_action_plan"]) > 0
        assert "URGENT" in result["three_month_action_plan"][0]  # underfunded emergency fund

    def test_high_savings_rate_goal_boosts_target(self):
        low_savings = json.loads(
            generate_budget_plan.invoke({
                "monthly_income": 10000,
                "monthly_expenses": 5000,
                "total_debt": 0,
                "total_savings": 60000,
                "financial_goals": ["general savings"],
                "savings_rate": 0.50,
                "emergency_fund_months": 12,
            })
        )
        fire_savings = json.loads(
            generate_budget_plan.invoke({
                "monthly_income": 10000,
                "monthly_expenses": 5000,
                "total_debt": 0,
                "total_savings": 60000,
                "financial_goals": ["retire early", "financial independence"],
                "savings_rate": 0.50,
                "emergency_fund_months": 12,
            })
        )
        # FIRE goal should produce higher recommended savings rate
        assert (
            fire_savings["recommended_monthly_savings"]
            >= low_savings["recommended_monthly_savings"]
        )
