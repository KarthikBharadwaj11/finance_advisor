import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, Shield, Wallet, Target, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Card } from './ui/Card'
import { Badge } from './ui/Badge'
import type { AnalysisResponse } from '../types'

const COLORS = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6']

const riskVariant = { conservative: 'emerald', moderate: 'amber', aggressive: 'rose' } as const
const riskLabel = { conservative: 'Conservative', moderate: 'Moderate', aggressive: 'Aggressive' }

function ScoreRing({ score }: { score: number }) {
  const r = 40
  const circ = 2 * Math.PI * r
  const fill = (score / 100) * circ
  const color = score >= 70 ? '#10b981' : score >= 45 ? '#f59e0b' : '#ef4444'

  return (
    <div className="relative flex items-center justify-center">
      <svg width={100} height={100} className="-rotate-90">
        <circle cx={50} cy={50} r={r} fill="none" stroke="#1e1e26" strokeWidth={8} />
        <motion.circle
          cx={50} cy={50} r={r} fill="none"
          stroke={color} strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - fill }}
          transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute text-center">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="text-xl font-bold" style={{ color }}
        >
          {score.toFixed(0)}
        </motion.div>
        <div className="text-[10px] text-zinc-500">/ 100</div>
      </div>
    </div>
  )
}

const fmt = (v: string | number) => Number(v).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const pct = (v: number) => `${(v * 100).toFixed(1)}%`

interface Props {
  data: AnalysisResponse
}

export function ResultsDashboard({ data }: Props) {
  const { kpis, risk_profile, portfolio_allocation, budget_plan, narrative_summary } = data
  const netWorth = Number(kpis.net_worth)

  const kpiCards = [
    { label: 'Savings Rate', value: pct(kpis.savings_rate), good: kpis.savings_rate >= 0.2, icon: TrendingUp },
    { label: 'Debt-to-Income', value: pct(kpis.debt_to_income_ratio), good: kpis.debt_to_income_ratio <= 0.35, icon: Shield },
    { label: 'Emergency Fund', value: `${kpis.emergency_fund_months.toFixed(1)} mo`, good: kpis.emergency_fund_months >= 3, icon: Wallet },
    { label: 'Net Worth', value: fmt(netWorth), good: netWorth >= 0, icon: Target },
  ]

  return (
    <div className="space-y-5">
      {/* Health Score + Risk */}
      <div className="grid grid-cols-2 gap-4">
        <Card delay={0} glow>
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">Financial Health</p>
          <div className="flex items-center gap-4">
            <ScoreRing score={kpis.financial_health_score} />
            <div>
              <p className="text-sm font-semibold text-zinc-200">
                {kpis.financial_health_score >= 70 ? 'Strong' : kpis.financial_health_score >= 45 ? 'Moderate' : 'Needs Work'}
              </p>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">Based on savings rate, DTI, and emergency fund</p>
            </div>
          </div>
        </Card>

        <Card delay={0.06}>
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">Risk Profile</p>
          <div className="flex flex-col gap-2">
            <Badge label={riskLabel[risk_profile.level]} variant={riskVariant[risk_profile.level]} />
            <div className="flex items-center gap-2">
              <div className="h-1.5 flex-1 rounded-full bg-[#1e1e26]">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-red-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(risk_profile.score / 10) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                />
              </div>
              <span className="text-xs text-zinc-400 shrink-0">{risk_profile.score}/10</span>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed line-clamp-3">{risk_profile.rationale}</p>
          </div>
        </Card>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-3">
        {kpiCards.map(({ label, value, good, icon: Icon }, i) => (
          <Card key={label} delay={i * 0.05}>
            <div className="flex items-start justify-between mb-2">
              <Icon size={14} className={good ? 'text-emerald-400' : 'text-amber-400'} />
              {good
                ? <CheckCircle2 size={12} className="text-emerald-500" />
                : <AlertTriangle size={12} className="text-amber-500" />}
            </div>
            <p className="text-base font-bold text-zinc-100">{value}</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">{label}</p>
          </Card>
        ))}
      </div>

      {/* Portfolio + Budget */}
      <div className="grid grid-cols-2 gap-4">
        {/* Portfolio Donut */}
        <Card delay={0.15}>
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-4">Portfolio Allocation</p>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={100} height={100}>
              <PieChart>
                <Pie data={portfolio_allocation.allocations} dataKey="percentage" cx="50%" cy="50%" innerRadius={28} outerRadius={45} strokeWidth={0}>
                  {portfolio_allocation.allocations.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#0f0f12', border: '1px solid #1e1e26', borderRadius: 8, fontSize: 11 }}
                  formatter={(v: unknown) => [`${v}%`]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1.5">
              {portfolio_allocation.allocations.slice(0, 5).map((a, i) => (
                <div key={a.asset_class} className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-[11px] text-zinc-400 flex-1 truncate">{a.asset_class}</span>
                  <span className="text-[11px] font-medium text-zinc-200">{a.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-3 text-[10px] text-zinc-600">{portfolio_allocation.rebalancing_frequency}</p>
        </Card>

        {/* Budget Surplus */}
        <Card delay={0.2}>
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">Budget Snapshot</p>
          <div className="mb-3">
            <span className="text-2xl font-bold text-emerald-400">{fmt(budget_plan.monthly_surplus)}</span>
            <span className="text-xs text-zinc-500 ml-1.5">monthly surplus</span>
          </div>
          <div className="space-y-2">
            {budget_plan.categories.slice(0, 4).map(c => {
              const curr = Number(c.current_amount)
              const rec = Number(c.recommended_amount)
              const over = curr > rec * 1.1
              return (
                <div key={c.category}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[11px] text-zinc-500 truncate max-w-[130px]">{c.category}</span>
                    <span className={`text-[11px] font-medium ${over ? 'text-amber-400' : 'text-zinc-300'}`}>{fmt(curr)}</span>
                  </div>
                  <div className="h-1 w-full rounded-full bg-[#1e1e26]">
                    <motion.div
                      className={`h-full rounded-full ${over ? 'bg-amber-500' : 'bg-violet-500'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((curr / rec) * 100, 100)}%` }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* Narrative */}
      <Card delay={0.25}>
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">AI Summary</p>
        <p className="text-sm text-zinc-300 leading-relaxed">{narrative_summary}</p>
      </Card>

      {/* Action Plan */}
      <Card delay={0.3}>
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">90-Day Action Plan</p>
        <div className="space-y-2.5">
          {budget_plan.three_month_action.map((action, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + i * 0.07 }}
              className="flex items-start gap-3 rounded-lg bg-[#0a0a0e] border border-[#1e1e26] p-3"
            >
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-violet-400 text-[10px] font-bold mt-0.5">
                {i + 1}
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">{action}</p>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  )
}
