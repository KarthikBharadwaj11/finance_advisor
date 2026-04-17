import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts'
import { DollarSign, TrendingUp, Target, User, Plus, X, CheckCircle2, Brain, Database, BarChart2, PieChart as PieChartIcon, Calculator, Loader2, ArrowLeft } from 'lucide-react'
import { api } from '../api/client'
import { useAppStore } from '../store/app'
import { toast } from '../components/ui/Toast'
import type { AnalysisResponse, FinancialProfile } from '../types'

const COLORS = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6']
const riskColor = { conservative: '#10b981', moderate: '#f59e0b', aggressive: '#f43f5e' }

const TOOL_META: Record<string, { icon: typeof Brain; label: string; color: string }> = {
  analyze_financial_health: { icon: BarChart2, label: 'Financial Health', color: '#10b981' },
  retrieve_financial_knowledge: { icon: Database, label: 'Knowledge Retrieval (RAG)', color: '#8b5cf6' },
  assess_risk_profile: { icon: Brain, label: 'Risk Assessment', color: '#f59e0b' },
  calculate_portfolio_allocation: { icon: PieChartIcon, label: 'Portfolio Allocation', color: '#06b6d4' },
  generate_budget_plan: { icon: Calculator, label: 'Budget Plan', color: '#f43f5e' },
}

const GOALS = ['Retire early', 'Build emergency fund', 'Buy a home', 'Pay off debt', 'Invest in index funds', 'Save for education']

const card: React.CSSProperties = { borderRadius: 14, border: '1px solid rgba(255,255,255,0.07)', background: '#0d0d18', padding: 20 }

function Field({ label, value, onChange, prefix, suffix, hint }: { label: string; value: string; onChange: (v: string) => void; prefix?: string; suffix?: string; hint?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#44444f' }}>{label}</label>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {prefix && <span style={{ position: 'absolute', left: 12, fontSize: 13, color: '#55556a', pointerEvents: 'none' }}>{prefix}</span>}
        <input type="number" value={value} onChange={e => onChange(e.target.value)} placeholder="0"
          style={{ width: '100%', boxSizing: 'border-box', padding: prefix ? '9px 12px 9px 26px' : suffix ? '9px 36px 9px 12px' : '9px 12px', borderRadius: 9, border: '1px solid rgba(255,255,255,0.07)', background: '#0a0a14', color: '#e8e8f0', fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
          onFocus={e => { e.target.style.borderColor = 'rgba(124,58,237,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.08)' }}
          onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.07)'; e.target.style.boxShadow = 'none' }} />
        {suffix && <span style={{ position: 'absolute', right: 10, fontSize: 11, color: '#55556a', pointerEvents: 'none' }}>{suffix}</span>}
      </div>
      {hint && <span style={{ fontSize: 10, color: '#33333f' }}>{hint}</span>}
    </div>
  )
}

export function AnalysisPage() {
  const { user, setLastAnalysis } = useAppStore()
  const [stage, setStage] = useState<'form' | 'loading' | 'results'>('form')
  const [result, setResult] = useState<AnalysisResponse | null>(null)
  const [revealedSteps, setRevealedSteps] = useState(0)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ monthly_income: '', monthly_expenses: '', total_savings: '', total_debt: '', age: '', investment_horizon_years: '' })
  const [goals, setGoals] = useState<string[]>(['Retire early', 'Build emergency fund'])
  const [customGoal, setCustomGoal] = useState('')
  const set = (k: string) => (v: string) => setForm(f => ({ ...f, [k]: v }))
  const toggleGoal = (g: string) => setGoals(p => p.includes(g) ? p.filter(x => x !== g) : [...p, g])

  const handleSubmit = async () => {
    if (!user) return
    setLoading(true); setStage('loading')
    try {
      const profile: FinancialProfile = {
        monthly_income: Number(form.monthly_income), monthly_expenses: Number(form.monthly_expenses),
        total_savings: Number(form.total_savings), total_debt: Number(form.total_debt),
        age: Number(form.age) || 30, investment_horizon_years: Number(form.investment_horizon_years) || 20,
        financial_goals: goals,
      }
      const res = await api.analyze(user.id, profile)
      setResult(res); setLastAnalysis(res)
      let i = 0
      const interval = setInterval(() => { i++; setRevealedSteps(i); if (i >= res.agent_steps.length) { clearInterval(interval); setTimeout(() => setStage('results'), 600) } }, 500)
    } catch (e: unknown) {
      toast('error', e instanceof Error ? e.message : 'Analysis failed'); setStage('form')
    } finally { setLoading(false) }
  }

  const fmt = (v: string | number) => Number(v).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

  return (
    <div style={{ padding: '36px', fontFamily: 'Inter, system-ui, sans-serif', color: '#e8e8f0' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: '#f1f1f5' }}>Financial Analysis</div>
          <div style={{ fontSize: 13, color: '#44444f', marginTop: 4 }}>AI agent reasoning with 5 specialized tools</div>
        </div>
        {stage === 'results' && (
          <button onClick={() => { setStage('form'); setResult(null); setRevealedSteps(0) }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 9, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#88889a', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
            <ArrowLeft size={14} /> New analysis
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* ── FORM ── */}
        {stage === 'form' && (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { title: 'Cash Flow', color: '#10b981', icon: DollarSign, fields: [{ label: 'Monthly Income', key: 'monthly_income', prefix: '$', hint: 'Gross monthly' }, { label: 'Monthly Expenses', key: 'monthly_expenses', prefix: '$', hint: 'Total spending' }] },
                { title: 'Wealth Snapshot', color: '#8b5cf6', icon: TrendingUp, fields: [{ label: 'Total Savings', key: 'total_savings', prefix: '$' }, { label: 'Total Debt', key: 'total_debt', prefix: '$' }] },
                { title: 'About You', color: '#f59e0b', icon: User, fields: [{ label: 'Age', key: 'age', suffix: 'yrs' }, { label: 'Investment Horizon', key: 'investment_horizon_years', suffix: 'yrs' }] },
              ].map(({ title, color, icon: Icon, fields }) => (
                <div key={title} style={card}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: color + '18', border: `1px solid ${color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={13} color={color} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#ccccdc' }}>{title}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {fields.map(f => <Field key={f.key} label={f.label} value={form[f.key as keyof typeof form]} onChange={set(f.key)} prefix={'prefix' in f ? f.prefix : undefined} suffix={'suffix' in f ? f.suffix : undefined} hint={'hint' in f ? f.hint : undefined} />)}
                  </div>
                </div>
              ))}

              {/* Goals */}
              <div style={card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Target size={13} color="#f43f5e" />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#ccccdc' }}>Financial Goals</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 12 }}>
                  {GOALS.map(g => (
                    <button key={g} onClick={() => toggleGoal(g)} style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', border: goals.includes(g) ? '1px solid rgba(139,92,246,0.4)' : '1px solid rgba(255,255,255,0.07)', background: goals.includes(g) ? 'rgba(139,92,246,0.1)' : 'rgba(255,255,255,0.03)', color: goals.includes(g) ? '#c4b5fd' : '#66667a' }}>
                      {g}
                    </button>
                  ))}
                  {goals.filter(g => !GOALS.includes(g)).map(g => (
                    <span key={g} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(34,197,94,0.2)', background: 'rgba(34,197,94,0.06)', fontSize: 12, color: '#4ade80' }}>
                      {g} <button onClick={() => toggleGoal(g)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, display: 'flex' }}><X size={10} /></button>
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="text" value={customGoal} onChange={e => setCustomGoal(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && customGoal.trim() && (toggleGoal(customGoal.trim()), setCustomGoal(''))}
                    placeholder="Add custom goal..." style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.07)', background: '#0a0a14', color: '#e8e8f0', fontSize: 12, outline: 'none', fontFamily: 'inherit' }} />
                  <button onClick={() => customGoal.trim() && (toggleGoal(customGoal.trim()), setCustomGoal(''))} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.04)', color: '#88889a', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                    <Plus size={12} /> Add
                  </button>
                </div>
              </div>

              <button onClick={handleSubmit} disabled={!form.monthly_income || !goals.length || loading}
                style={{ padding: '13px', borderRadius: 12, background: form.monthly_income && goals.length ? '#7c3aed' : 'rgba(124,58,237,0.3)', border: 'none', color: '#fff', fontSize: 14, fontWeight: 600, cursor: form.monthly_income && goals.length ? 'pointer' : 'not-allowed', fontFamily: 'inherit', boxShadow: form.monthly_income && goals.length ? '0 0 24px rgba(124,58,237,0.4)' : 'none' }}>
                {loading ? 'Running...' : 'Run AI Analysis'}
              </button>
            </div>

            {/* Sidebar: what agent does */}
            <div>
              <div style={{ ...card, position: 'sticky', top: 36 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#44444f', marginBottom: 16 }}>What the agent does</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {Object.entries(TOOL_META).map(([, meta], i) => {
                    const Icon = meta.icon
                    return (
                      <div key={i} style={{ display: 'flex', gap: 10 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: meta.color + '12', border: `1px solid ${meta.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                          <Icon size={13} color={meta.color} />
                        </div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#ccccdc', marginBottom: 2 }}>{meta.label}</div>
                          <div style={{ fontSize: 11, color: '#44444f', lineHeight: 1.5 }}>
                            {['Computes KPIs: savings rate, DTI, emergency fund', 'Queries FAISS for relevant financial knowledge', 'Scores risk tolerance from age, horizon, goals', 'Maps risk profile to asset class percentages', 'Applies 50/30/20 adapted to your situation'][i]}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div style={{ marginTop: 16, padding: '10px 12px', borderRadius: 10, background: 'rgba(251,146,60,0.05)', border: '1px solid rgba(251,146,60,0.15)', fontSize: 11, color: 'rgba(251,146,60,0.75)', lineHeight: 1.5 }}>
                  Takes 20–30 seconds. All outputs are grounded in tool results.
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── LOADING ── */}
        {stage === 'loading' && result === null && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: 20 }}>
            <div style={card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#8b5cf6', animation: 'pulse 1.5s infinite' }} />
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#44444f' }}>Agent reasoning live</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {Object.entries(TOOL_META).map(([key, meta], i) => {
                  const Icon = meta.icon
                  return (
                    <div key={key} style={{ display: 'flex', gap: 10 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: 32, height: 32, borderRadius: 10, background: meta.color + '12', border: `1px solid ${meta.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon size={13} color={meta.color} />
                        </div>
                        {i < 4 && <div style={{ width: 1, flex: 1, background: 'rgba(255,255,255,0.05)', minHeight: 20, margin: '3px 0' }} />}
                      </div>
                      <div style={{ paddingBottom: i < 4 ? 16 : 0, paddingTop: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 12, fontWeight: 500, color: '#88889a' }}>{meta.label}</span>
                          <Loader2 size={10} color="#44444f" style={{ animation: 'spin 1s linear infinite' }} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 16 }}>
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#7c3aed' }}
                      animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
                      transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }} />
                  ))}
                </div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#88889a', marginBottom: 6 }}>Running analysis...</div>
                <div style={{ fontSize: 12, color: '#44444f' }}>The AI agent is calling tools and reasoning through your data</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── RESULTS ── */}
        {((stage === 'loading' && result) || stage === 'results') && result && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: 20 }}>
            {/* Agent trace */}
            <div style={{ ...card, position: 'sticky', top: 36, alignSelf: 'start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 18 }}>
                <CheckCircle2 size={13} color="#22c55e" />
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#44444f' }}>Agent trace · {result.agent_steps.length} tools</span>
              </div>
              {result.agent_steps.map((step, i) => {
                const meta = TOOL_META[step.tool_name] || { icon: Brain, label: step.tool_name, color: '#88889a' }
                const Icon = meta.icon
                const revealed = i < revealedSteps
                return (
                  <motion.div key={step.step_number} initial={{ opacity: 0, x: -8 }} animate={{ opacity: revealed ? 1 : 0.3, x: 0 }} transition={{ duration: 0.3 }}
                    style={{ display: 'flex', gap: 10 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: 30, height: 30, borderRadius: 9, background: meta.color + '15', border: `1px solid ${meta.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={13} color={meta.color} />
                      </div>
                      {i < result.agent_steps.length - 1 && <div style={{ width: 1, flex: 1, background: 'rgba(255,255,255,0.05)', minHeight: 16, margin: '3px 0' }} />}
                    </div>
                    <div style={{ paddingBottom: i < result.agent_steps.length - 1 ? 14 : 0, paddingTop: 4, flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: revealed ? 4 : 0 }}>
                        <span style={{ fontSize: 12, fontWeight: 500, color: '#ccccdc' }}>{meta.label}</span>
                        {revealed ? <CheckCircle2 size={11} color="#22c55e" /> : <Loader2 size={11} color="#44444f" style={{ animation: 'spin 1s linear infinite' }} />}
                      </div>
                      {revealed && <p style={{ fontSize: 10, color: '#44444f', fontFamily: 'monospace', lineHeight: 1.5, margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{step.tool_output_summary}</p>}
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Results */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Health Score', value: `${result.kpis.financial_health_score.toFixed(0)}/100`, color: '#8b5cf6', icon: TrendingUp },
                  { label: 'Savings Rate', value: `${(result.kpis.savings_rate * 100).toFixed(1)}%`, color: '#10b981', icon: Target },
                  { label: 'Emergency Fund', value: `${result.kpis.emergency_fund_months.toFixed(1)} mo`, color: '#f59e0b', icon: DollarSign },
                  { label: 'Net Worth', value: fmt(result.kpis.net_worth), color: '#06b6d4', icon: TrendingUp },
                ].map(({ label: lbl, value, color, icon: Icon }, i) => (
                  <motion.div key={lbl} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.06 }}
                    style={{ ...card, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: -16, right: -16, width: 64, height: 64, borderRadius: '50%', background: color + '18', filter: 'blur(16px)', pointerEvents: 'none' }} />
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: color + '20', border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                      <Icon size={13} color={color} />
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#f1f1f5', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
                    <div style={{ fontSize: 11, color: '#44444f', marginTop: 2 }}>{lbl}</div>
                  </motion.div>
                ))}
              </div>

              {/* Risk + Portfolio */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={card}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#44444f', marginBottom: 12 }}>Risk Profile</div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: riskColor[result.risk_profile.level] + '15', border: `1px solid ${riskColor[result.risk_profile.level]}25`, color: riskColor[result.risk_profile.level], marginBottom: 12 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: riskColor[result.risk_profile.level] }} />
                    {result.risk_profile.level.charAt(0).toUpperCase() + result.risk_profile.level.slice(1)}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <div style={{ flex: 1, height: 5, borderRadius: 999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(result.risk_profile.score / 10) * 100}%` }} transition={{ duration: 0.8, delay: 0.5 }}
                        style={{ height: '100%', borderRadius: 999, background: 'linear-gradient(to right, #10b981, #f59e0b, #f43f5e)' }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#88889a', flexShrink: 0 }}>{result.risk_profile.score}/10</span>
                  </div>
                  <p style={{ fontSize: 11, color: '#44444f', lineHeight: 1.6, margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{result.risk_profile.rationale}</p>
                </div>
                <div style={card}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#44444f', marginBottom: 8 }}>Allocation</div>
                  <ResponsiveContainer width="100%" height={90}>
                    <PieChart>
                      <Pie data={result.portfolio_allocation.allocations} dataKey="percentage" cx="50%" cy="50%" innerRadius={24} outerRadius={40} strokeWidth={0} paddingAngle={2}>
                        {result.portfolio_allocation.allocations.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#0d0d18', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 10 }} formatter={(v: unknown) => [`${v}%`]} />
                    </PieChart>
                  </ResponsiveContainer>
                  {result.portfolio_allocation.allocations.slice(0, 3).map((a, i) => (
                    <div key={a.asset_class} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: COLORS[i], flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: 11, color: '#55556a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.asset_class.split('(')[0].trim()}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#88889a', fontVariantNumeric: 'tabular-nums' }}>{a.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Budget chart */}
              <div style={card}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#44444f', marginBottom: 14 }}>Budget: Current vs Recommended</div>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={result.budget_plan.categories.slice(0, 6).map(c => ({ name: c.category.split(' ')[0], current: Number(c.current_amount), recommended: Number(c.recommended_amount) }))} barSize={12} barGap={3}>
                    <XAxis dataKey="name" tick={{ fill: '#44444f', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#44444f', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={{ background: '#0d0d18', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 11 }} formatter={(v: unknown) => [`$${Number(v).toLocaleString()}`]} />
                    <Bar dataKey="current" fill="#7c3aed" radius={[3, 3, 0, 0]} name="Current" />
                    <Bar dataKey="recommended" fill="rgba(255,255,255,0.06)" radius={[3, 3, 0, 0]} name="Recommended" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Summary */}
              <div style={card}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#44444f', marginBottom: 12 }}>AI Summary</div>
                <p style={{ fontSize: 13, color: '#aaaabc', lineHeight: 1.7, margin: 0 }}>{result.narrative_summary}</p>
              </div>

              {/* Action plan */}
              <div style={card}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#44444f', marginBottom: 14 }}>90-Day Action Plan</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {result.budget_plan.three_month_action.map((action, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.08 }}
                      style={{ display: 'flex', gap: 10, padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#a78bfa', flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                      <p style={{ fontSize: 12, color: '#88889a', lineHeight: 1.6, margin: 0 }}>{action}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
