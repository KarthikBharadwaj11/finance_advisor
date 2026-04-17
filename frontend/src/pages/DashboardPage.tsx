import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { BarChart2, MessageSquare, TrendingUp, Shield, Wallet, Target, ArrowRight, Sparkles, AlertTriangle } from 'lucide-react'
import { useAppStore } from '../store/app'

const COLORS = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6']

const card: React.CSSProperties = {
  borderRadius: 14, border: '1px solid rgba(255,255,255,0.07)',
  background: '#0d0d18', padding: 20,
}

const label: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, letterSpacing: '0.07em',
  textTransform: 'uppercase', color: '#44444f', marginBottom: 12,
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { user, lastAnalysis: a } = useAppStore()

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const fmt = (v: string | number) => Number(v).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
  const pct = (v: number) => `${(v * 100).toFixed(1)}%`

  return (
    <div style={{ padding: '36px 36px', fontFamily: 'Inter, system-ui, sans-serif', color: '#e8e8f0' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: '#f1f1f5' }}>
            {greeting()}, {user?.full_name?.split(' ')[0]}
          </div>
          <div style={{ fontSize: 13, color: '#44444f', marginTop: 4 }}>
            {a ? `Last analysis · ${new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : 'No analysis yet — run one to get started'}
          </div>
        </motion.div>
        <button onClick={() => navigate('/analysis')} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 10, background: '#7c3aed', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 0 20px rgba(124,58,237,0.35)' }}>
          <BarChart2 size={14} /> {a ? 'New Analysis' : 'Run Analysis'}
        </button>
      </div>

      {!a ? (
        /* Empty state */
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, textAlign: 'center', gap: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={26} color="#8b5cf6" />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#e8e8f0', marginBottom: 8 }}>No analysis yet</div>
            <div style={{ fontSize: 14, color: '#55556a', maxWidth: 380, lineHeight: 1.6 }}>
              Run your first AI-powered financial analysis. The agent will call 5 specialized tools and generate a full financial report.
            </div>
          </div>
          <button onClick={() => navigate('/analysis')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 28px', borderRadius: 12, background: '#7c3aed', border: 'none', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 0 28px rgba(124,58,237,0.45)', marginTop: 8 }}>
            Run first analysis <ArrowRight size={15} />
          </button>
        </motion.div>
      ) : (
        <>
          {/* KPI grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
            {[
              { label: 'Health Score', value: `${a.kpis.financial_health_score.toFixed(0)}/100`, icon: TrendingUp, color: '#8b5cf6', good: a.kpis.financial_health_score >= 70, sub: a.kpis.financial_health_score >= 70 ? 'Strong' : 'Moderate' },
              { label: 'Savings Rate', value: pct(a.kpis.savings_rate), icon: Target, color: '#10b981', good: a.kpis.savings_rate >= 0.2, sub: a.kpis.savings_rate >= 0.2 ? 'On target' : 'Below 20%' },
              { label: 'Emergency Fund', value: `${a.kpis.emergency_fund_months.toFixed(1)} mo`, icon: Shield, color: '#f59e0b', good: a.kpis.emergency_fund_months >= 3, sub: a.kpis.emergency_fund_months >= 6 ? 'Fully funded' : 'Partial' },
              { label: 'Net Worth', value: fmt(a.kpis.net_worth), icon: Wallet, color: '#06b6d4', good: Number(a.kpis.net_worth) >= 0, sub: '' },
            ].map(({ label: lbl, value, icon: Icon, color, good, sub }, i) => (
              <motion.div key={lbl} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                style={{ ...card, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: color + '18', filter: 'blur(20px)', pointerEvents: 'none' }} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: color + '20', border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={14} color={color} />
                  </div>
                  {sub && <span style={{ fontSize: 11, fontWeight: 600, color: good ? '#4ade80' : '#fb923c' }}>{sub}</span>}
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#f1f1f5', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
                <div style={{ fontSize: 12, color: '#44444f', marginTop: 3 }}>{lbl}</div>
              </motion.div>
            ))}
          </div>

          {/* Middle row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, marginBottom: 20 }}>
            {/* Portfolio */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }} style={card}>
              <div style={{ ...label }}>Portfolio</div>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={a.portfolio_allocation.allocations} dataKey="percentage" cx="50%" cy="50%" innerRadius={38} outerRadius={58} strokeWidth={0} paddingAngle={2}>
                    {a.portfolio_allocation.allocations.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0d0d18', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 11 }} formatter={(v: unknown) => [`${v}%`]} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 8 }}>
                {a.portfolio_allocation.allocations.slice(0, 4).map((item, i) => (
                  <div key={item.asset_class} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: COLORS[i], flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: 11, color: '#66667a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.asset_class}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#ccccdc', fontVariantNumeric: 'tabular-nums' }}>{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* AI Summary */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={card}>
              <div style={{ ...label }}>AI Summary</div>
              <p style={{ fontSize: 13, color: '#aaaabc', lineHeight: 1.7, marginBottom: 16 }}>
                {a.narrative_summary.length > 400 ? a.narrative_summary.slice(0, 400) + '...' : a.narrative_summary}
              </p>
              <button onClick={() => navigate('/analysis')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', padding: '9px', borderRadius: 9, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#88889a', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                View full analysis <ArrowRight size={13} />
              </button>
            </motion.div>
          </div>

          {/* Bottom row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Action plan */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 }} style={card}>
              <div style={{ ...label }}>90-Day Action Plan</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {a.budget_plan.three_month_action.map((action, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#a78bfa', flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                    <p style={{ fontSize: 12, color: '#88889a', lineHeight: 1.6, margin: 0 }}>{action}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick actions */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }} style={card}>
              <div style={{ ...label }}>Quick Actions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { icon: BarChart2, label: 'Run new analysis', sub: 'Update with latest figures', color: '#8b5cf6', to: '/analysis' },
                  { icon: MessageSquare, label: 'Ask AI Advisor', sub: 'RAG-powered Q&A', color: '#06b6d4', to: '/advisor' },
                ].map(({ icon: Icon, label: lbl, sub, color, to }) => (
                  <button key={to} onClick={() => navigate(to)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', width: '100%', transition: 'all 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = color + '0a'; (e.currentTarget as HTMLElement).style.borderColor = color + '25' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.05)' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: color + '18', border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={14} color={color} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#ccccdc' }}>{lbl}</div>
                      <div style={{ fontSize: 11, color: '#44444f', marginTop: 2 }}>{sub}</div>
                    </div>
                    <ArrowRight size={13} color="#33333f" />
                  </button>
                ))}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', borderRadius: 10, background: 'rgba(251,146,60,0.05)', border: '1px solid rgba(251,146,60,0.15)' }}>
                  <AlertTriangle size={14} color="#fb923c" style={{ flexShrink: 0, marginTop: 1 }} />
                  <p style={{ fontSize: 12, color: 'rgba(251,146,60,0.8)', lineHeight: 1.6, margin: 0 }}>
                    {a.kpis.emergency_fund_months < 3
                      ? `Emergency fund is only ${a.kpis.emergency_fund_months.toFixed(1)} months — aim for 6.`
                      : a.kpis.debt_to_income_ratio > 0.35
                      ? `DTI is ${(a.kpis.debt_to_income_ratio * 100).toFixed(0)}% — above the 35% threshold.`
                      : 'Savings rate is strong. Focus on portfolio rebalancing.'}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  )
}
