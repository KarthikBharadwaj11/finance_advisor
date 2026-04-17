import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, BarChart2, Brain, Database, Shield, ArrowRight, CheckCircle2, Zap } from 'lucide-react'
import { useAppStore } from '../store/app'

const FEATURES = [
  { icon: Brain, color: '#8b5cf6', title: 'Agentic AI', desc: 'Multi-step AI agent calls 5 tools in sequence before forming a response.' },
  { icon: Database, color: '#06b6d4', title: 'RAG Grounded', desc: 'Answers retrieved from a curated financial knowledge base, not hallucinated.' },
  { icon: BarChart2, color: '#10b981', title: 'Structured Output', desc: 'Health scores, risk profiles, portfolio allocations, 90-day action plans.' },
  { icon: Shield, color: '#f59e0b', title: 'Privacy First', desc: 'Your data stays in your session. No tracking, no brokers, no ads.' },
]

const STEPS = [
  { icon: '🔬', tool: 'analyze_financial_health', result: 'Health Score: 72/100  ·  Savings Rate: 31.2%', color: '#10b981' },
  { icon: '📚', tool: 'retrieve_financial_knowledge', result: 'Retrieved 4 relevant passages from knowledge base', color: '#8b5cf6' },
  { icon: '⚖️', tool: 'assess_risk_profile', result: 'Risk Level: Aggressive  ·  Score: 8.2 / 10', color: '#f59e0b' },
  { icon: '📊', tool: 'calculate_portfolio_allocation', result: '57% US Stocks · 23% International · 10% Bonds', color: '#06b6d4' },
  { icon: '💰', tool: 'generate_budget_plan', result: 'Monthly surplus: $2,800  ·  Gap closed: $300', color: '#f43f5e' },
]

export function LandingPage() {
  const navigate = useNavigate()
  const user = useAppStore(s => s.user)
  useEffect(() => { if (user) navigate('/dashboard') }, [user, navigate])

  return (
    <div style={{ minHeight: '100vh', background: '#06060c', color: '#f1f1f5', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── Navbar ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(6,6,12,0.85)', backdropFilter: 'blur(16px)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(124,58,237,0.5)' }}>
              <Sparkles size={13} color="#fff" />
            </div>
            <span style={{ fontWeight: 600, fontSize: 14, color: '#f1f1f5' }}>FinanceAdv</span>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '2px 6px', borderRadius: 4, border: '1px solid rgba(139,92,246,0.35)', background: 'rgba(139,92,246,0.12)', color: '#a78bfa' }}>AI</span>
          </div>
          <button onClick={() => navigate('/setup')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 8, background: '#7c3aed', border: 'none', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', boxShadow: '0 0 20px rgba(124,58,237,0.45)', fontFamily: 'inherit' }}>
            Get Started <ArrowRight size={13} />
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 32px 80px', position: 'relative', overflow: 'hidden' }}>
        {/* Glow background */}
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 900, height: 600, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(124,58,237,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', width: '100%', maxWidth: 760, textAlign: 'center' }}>
          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 999, border: '1px solid rgba(139,92,246,0.25)', background: 'rgba(139,92,246,0.08)', marginBottom: 28 }}>
            <Zap size={11} color="#a78bfa" />
            <span style={{ fontSize: 12, fontWeight: 500, color: '#c4b5fd' }}>Powered by GPT-4o + FAISS RAG</span>
          </motion.div>

          {/* Headline */}
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 20 }}>
            Your AI Financial Advisor,{' '}
            <span style={{ background: 'linear-gradient(135deg, #c4b5fd 0%, #8b5cf6 50%, #6d28d9 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Actually Intelligent
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            style={{ fontSize: 17, color: '#9898aa', lineHeight: 1.65, marginBottom: 36, maxWidth: 560, margin: '0 auto 36px' }}>
            An agentic AI that analyzes your finances using multi-step reasoning, retrieves grounded knowledge, and delivers structured — not generic — recommendations.
          </motion.p>

          {/* CTA */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 32 }}>
            <button onClick={() => navigate('/setup')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 28px', borderRadius: 12, background: '#7c3aed', border: 'none', color: '#fff', fontWeight: 600, fontSize: 15, cursor: 'pointer', boxShadow: '0 0 32px rgba(124,58,237,0.5)', fontFamily: 'inherit' }}>
              Start Free Analysis <ArrowRight size={15} />
            </button>
            <button onClick={() => navigate('/setup')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 24px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#ccccd6', fontWeight: 500, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit' }}>
              See How It Works
            </button>
          </motion.div>

          {/* Trust */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
            {['No signup required', 'No data stored externally', 'Open source'].map(t => (
              <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#555566' }}>
                <CheckCircle2 size={11} color="#22c55e" /> {t}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Agent preview card */}
        <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.6 }}
          style={{ position: 'relative', width: '100%', maxWidth: 680, marginTop: 60 }}>
          <div style={{ borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)', background: '#0d0d18', overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)' }}>
            {/* Top bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: '#08080f' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(239,68,68,0.7)' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(245,158,11,0.7)' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(34,197,94,0.7)' }} />
              <span style={{ marginLeft: 10, fontSize: 11, color: '#44444f', fontFamily: 'monospace' }}>AI Agent — Financial Analysis</span>
            </div>
            {/* Steps */}
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {STEPS.map((step, i) => (
                <motion.div key={step.tool} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 + i * 0.12 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)', background: '#0a0a14' }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{step.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 10, color: '#444456', fontFamily: 'monospace', marginBottom: 2 }}>{step.tool}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: step.color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{step.result}</div>
                  </div>
                  <CheckCircle2 size={13} color="#22c55e" style={{ flexShrink: 0 }} />
                </motion.div>
              ))}
            </div>
            {/* Footer */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,0.05)', background: '#08080f' }}>
              <span style={{ fontSize: 11, color: '#44444f' }}>5 tools · ~22s</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#22c55e' }}>Analysis complete ✓</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '80px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>Built different</h2>
            <p style={{ fontSize: 15, color: '#66667a' }}>Not a chatbot. A proper AI system with verifiable reasoning.</p>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {FEATURES.map(({ icon: Icon, color, title, desc }, i) => (
              <motion.div key={title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                style={{ padding: 24, borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', background: '#0d0d18' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: color + '18', border: `1px solid ${color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Icon size={16} color={color} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e2ec', marginBottom: 6 }}>{title}</div>
                <div style={{ fontSize: 13, color: '#66667a', lineHeight: 1.6 }}>{desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '0 32px 80px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ borderRadius: 20, border: '1px solid rgba(124,58,237,0.2)', background: 'linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(13,13,24,1) 100%)', padding: '64px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 12, position: 'relative' }}>Ready to see your financial picture?</h2>
            <p style={{ fontSize: 15, color: '#88889a', marginBottom: 32, position: 'relative' }}>Takes 2 minutes. No account required.</p>
            <button onClick={() => navigate('/setup')} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', borderRadius: 12, background: '#7c3aed', border: 'none', color: '#fff', fontWeight: 600, fontSize: 15, cursor: 'pointer', boxShadow: '0 0 40px rgba(124,58,237,0.55)', fontFamily: 'inherit' }}>
              Start Free Analysis <ArrowRight size={15} />
            </button>
          </motion.div>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '24px 32px', textAlign: 'center', fontSize: 12, color: '#33333f' }}>
        FinanceAdv AI · For educational purposes only · Not financial advice
      </footer>
    </div>
  )
}
