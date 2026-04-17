from app.agent.tools.budget_planner import generate_budget_plan
from app.agent.tools.budget_planner import SCHEMA as budget_schema
from app.agent.tools.financial_health import analyze_financial_health
from app.agent.tools.financial_health import SCHEMA as health_schema
from app.agent.tools.knowledge_retrieval import retrieve_financial_knowledge
from app.agent.tools.knowledge_retrieval import SCHEMA as knowledge_schema
from app.agent.tools.portfolio_calc import calculate_portfolio_allocation
from app.agent.tools.portfolio_calc import SCHEMA as portfolio_schema
from app.agent.tools.risk_assessment import assess_risk_profile
from app.agent.tools.risk_assessment import SCHEMA as risk_schema

# Maps tool name → callable. Used by the agent loop to dispatch tool calls.
TOOL_REGISTRY: dict = {
    "analyze_financial_health": analyze_financial_health,
    "retrieve_financial_knowledge": retrieve_financial_knowledge,
    "assess_risk_profile": assess_risk_profile,
    "calculate_portfolio_allocation": calculate_portfolio_allocation,
    "generate_budget_plan": generate_budget_plan,
}

# OpenAI tool schemas sent with every chat completion request.
ALL_SCHEMAS: list[dict] = [
    health_schema,
    knowledge_schema,
    risk_schema,
    portfolio_schema,
    budget_schema,
]
