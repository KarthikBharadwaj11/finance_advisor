export interface User {
  id: string
  email: string
  full_name: string
  age: number | null
  annual_income: number | null
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive'
  created_at: string
}

export interface FinancialProfile {
  monthly_income: number
  monthly_expenses: number
  total_savings: number
  total_debt: number
  age: number
  investment_horizon_years: number
  financial_goals: string[]
  existing_portfolio?: Record<string, number>
}

export interface AgentStep {
  step_number: number
  tool_name: string
  tool_input: Record<string, unknown>
  tool_output_summary: string
}

export interface KPIs {
  savings_rate: number
  debt_to_income_ratio: number
  emergency_fund_months: number
  net_worth: string | number
  financial_health_score: number
}

export interface RiskProfile {
  level: 'conservative' | 'moderate' | 'aggressive'
  score: number
  rationale: string
}

export interface AllocationItem {
  asset_class: string
  percentage: number
  rationale: string
}

export interface PortfolioAllocation {
  allocations: AllocationItem[]
  rebalancing_frequency: string
  notes: string
}

export interface BudgetCategory {
  category: string
  current_amount: string | number
  recommended_amount: string | number
  change: 'increase' | 'decrease' | 'maintain'
  tip: string
}

export interface BudgetPlan {
  categories: BudgetCategory[]
  monthly_surplus: string | number
  three_month_action: string[]
}

export interface AnalysisResponse {
  user_id: string
  session_id: string
  kpis: KPIs
  risk_profile: RiskProfile
  portfolio_allocation: PortfolioAllocation
  budget_plan: BudgetPlan
  narrative_summary: string
  agent_steps: AgentStep[]
  created_at: string
}

export interface RecommendationResponse {
  user_id: string
  session_id: string
  answer: string
  sources: string[]
  agent_steps: AgentStep[]
  created_at: string
}
