"""
Financial analysis endpoints.

POST /api/v1/finances/analyze
  - Full agent-driven analysis of user's financial profile
  - Runs all 5 tools in sequence, returns structured JSON

POST /api/v1/finances/recommendations
  - Targeted Q&A using RAG + agent reasoning
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.schemas.finance import (
    AnalysisRequest,
    AnalysisResponse,
    RecommendationRequest,
    RecommendationResponse,
)
from app.services import agent_service, user_service

router = APIRouter()


@router.post(
    "/analyze",
    response_model=AnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Full financial analysis",
    description=(
        "Runs the AI agent over the user's complete financial profile. "
        "The agent executes a multi-step workflow: compute KPIs → retrieve knowledge → "
        "assess risk → generate allocation → produce budget plan. "
        "Returns fully structured JSON output."
    ),
)
async def analyze_finances(
    request: AnalysisRequest,
    db: AsyncSession = Depends(get_db),
) -> AnalysisResponse:
    await user_service.get_user_or_404(request.user_id, db)
    return await agent_service.run_financial_analysis(request, db)


@router.post(
    "/recommendations",
    response_model=RecommendationResponse,
    status_code=status.HTTP_200_OK,
    summary="Targeted financial recommendation",
    description=(
        "Ask a specific financial question. The agent retrieves relevant knowledge "
        "from the vector store and provides a cited, evidence-based answer."
    ),
)
async def get_recommendations(
    request: RecommendationRequest,
    db: AsyncSession = Depends(get_db),
) -> RecommendationResponse:
    await user_service.get_user_or_404(request.user_id, db)
    return await agent_service.run_recommendation(request, db)
