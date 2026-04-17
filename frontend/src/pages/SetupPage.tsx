import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { User, DollarSign, Target, ArrowRight, ArrowLeft, Sparkles, Plus, X } from 'lucide-react'
import { api } from '../api/client'
import { useAppStore } from '../store/app'
import { toast } from '../components/ui/Toast'

const GOALS = ['Retire early', 'Build emergency fund', 'Buy a home', 'Pay off debt', 'Invest in index funds', 'Save for education', 'Start a business', 'Travel fund']

function Field({ label, value, onChange, type = 'text', prefix, suffix, placeholder, hint }: {
  label: string; value: string; onChange: (v: string) => void
  type?: string; prefix?: string; suffix?: string; placeholder?: string; hint?: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#66667a' }}>{label}</label>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {prefix && <span style={{ position: 'absolute', left: 14, fontSize: 14, color: '#55556a', pointerEvents: 'none', zIndex: 1 }}>{prefix}</span>}
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder ?? '0'}
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: prefix ? '11px 14px 11px 30px' : suffix ? '11px 44px 11px 14px' : '11px 14px',
            borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)',
            background: '#0a0a14', color: '#e8e8f0', fontSize: 14,
            outline: 'none', fontFamily: 'inherit',
            transition: 'border-color 0.15s',
          }}
          onFocus={e => { e.target.style.borderColor = 'rgba(124,58,237,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)' }}
          onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none' }}
        />
        {suffix && <span style={{ position: 'absolute', right: 14, fontSize: 12, color: '#55556a', pointerEvents: 'none' }}>{suffix}</span>}
      </div>
      {hint && <span style={{ fontSize: 11, color: '#44444f' }}>{hint}</span>}
    </div>
  )
}

export function SetupPage() {
  const navigate = useNavigate()
  const setUser = useAppStore(s => s.setUser)
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    full_name: '', email: '', password: '', age: '',
    monthly_income: '', monthly_expenses: '', total_savings: '', total_debt: '',
    investment_horizon_years: '',
  })
  const [goals, setGoals] = useState<string[]>(['Build emergency fund', 'Invest in index funds'])
  const [customGoal, setCustomGoal] = useState('')
  const set = (k: string) => (v: string) => setForm(f => ({ ...f, [k]: v }))
  const toggleGoal = (g: string) => setGoals(p => p.includes(g) ? p.filter(x => x !== g) : [...p, g])

  const handleFinish = async () => {
    if (!goals.length) { toast('error', 'Add at least one goal'); return }
    setLoading(true)
    try {
      const user = await api.createUser({ email: form.email, full_name: form.full_name, password: form.password, age: form.age ? Number(form.age) : undefined })
      setUser(user)
      toast('success', 'Account created! Taking you to your dashboard...')
      setTimeout(() => navigate('/dashboard'), 800)
    } catch (e: unknown) {
      toast('error', e instanceof Error ? e.message : 'Setup failed')
      setLoading(false)
    }
  }

  const stepColors = ['#8b5cf6', '#10b981', '#f59e0b']
  const stepIcons = [User, DollarSign, Target]
  const stepTitles = ['Create your profile', 'Your financial snapshot', 'What are your goals?']
  const stepSubs = ['This takes 2 minutes', 'Approximate figures are fine', 'Select all that apply']

  const canContinue = [
    form.full_name.trim() && form.email.includes('@') && form.password.length >= 8,
    Number(form.monthly_income) > 0,
    goals.length > 0,
  ][step]

  const StepIcon = stepIcons[step]
  const color = stepColors[step]

  const stepContent = [
    /* Step 0: Profile */
    <div key="profile" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Field label="Full name" value={form.full_name} onChange={set('full_name')} placeholder="Jane Smith" type="text" />
      <Field label="Email" value={form.email} onChange={set('email')} type="email" placeholder="jane@example.com" />
      <Field label="Password" value={form.password} onChange={set('password')} type="password" placeholder="Min 8 characters" />
      <Field label="Age" value={form.age} onChange={set('age')} type="number" suffix="yrs" hint="Optional — improves risk assessment" />
    </div>,

    /* Step 1: Financials */
    <div key="fin" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Field label="Monthly income" value={form.monthly_income} onChange={set('monthly_income')} prefix="$" hint="Gross monthly" />
        <Field label="Monthly expenses" value={form.monthly_expenses} onChange={set('monthly_expenses')} prefix="$" hint="Total spending" />
        <Field label="Total savings" value={form.total_savings} onChange={set('total_savings')} prefix="$" hint="Liquid savings" />
        <Field label="Total debt" value={form.total_debt} onChange={set('total_debt')} prefix="$" hint="Excl. mortgage" />
      </div>
      <Field label="Investment horizon" value={form.investment_horizon_years} onChange={set('investment_horizon_years')} suffix="years" hint="Years until your primary goal" />
    </div>,

    /* Step 2: Goals */
    <div key="goals" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {GOALS.map(g => (
          <button key={g} type="button" onClick={() => toggleGoal(g)} style={{
            padding: '8px 14px', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
            border: goals.includes(g) ? '1px solid rgba(139,92,246,0.45)' : '1px solid rgba(255,255,255,0.08)',
            background: goals.includes(g) ? 'rgba(139,92,246,0.12)' : 'rgba(255,255,255,0.03)',
            color: goals.includes(g) ? '#c4b5fd' : '#88889a',
            transition: 'all 0.15s',
          }}>{g}</button>
        ))}
      </div>
      {goals.filter(g => !GOALS.includes(g)).length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {goals.filter(g => !GOALS.includes(g)).map(g => (
            <span key={g} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 10, border: '1px solid rgba(34,197,94,0.2)', background: 'rgba(34,197,94,0.06)', fontSize: 13, color: '#4ade80' }}>
              {g}
              <button onClick={() => toggleGoal(g)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, display: 'flex' }}><X size={11} /></button>
            </span>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text" value={customGoal} onChange={e => setCustomGoal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), customGoal.trim() && (toggleGoal(customGoal.trim()), setCustomGoal('')))}
          placeholder="Add a custom goal..."
          style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', background: '#0a0a14', color: '#e8e8f0', fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
        />
        <button onClick={() => customGoal.trim() && (toggleGoal(customGoal.trim()), setCustomGoal(''))}
          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '10px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#aaaabc', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
          <Plus size={14} /> Add
        </button>
      </div>
    </div>,
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#06060c', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 480 }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 40 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(124,58,237,0.5)' }}>
            <Sparkles size={13} color="#fff" />
          </div>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#e8e8f0' }}>FinanceAdv</span>
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 32 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 999, background: i <= step ? '#7c3aed' : 'rgba(255,255,255,0.08)', transition: 'background 0.4s' }} />
          ))}
        </div>

        {/* Card */}
        <div style={{ borderRadius: 20, border: '1px solid rgba(255,255,255,0.07)', background: '#0d0d18', padding: 32, boxShadow: '0 32px 64px rgba(0,0,0,0.5)' }}>
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.22 }}>
              {/* Step header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: color + '18', border: `1px solid ${color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <StepIcon size={16} color={color} />
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#e8e8f0' }}>{stepTitles[step]}</div>
                  <div style={{ fontSize: 13, color: '#55556a', marginTop: 2 }}>{stepSubs[step]}</div>
                </div>
              </div>

              {stepContent[step]}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 28 }}>
            <button onClick={() => step === 0 ? navigate('/') : setStep(s => s - 1)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 9, border: '1px solid rgba(255,255,255,0.07)', background: 'transparent', color: '#66667a', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
              <ArrowLeft size={14} /> {step === 0 ? 'Back to home' : 'Back'}
            </button>

            {step < 2 ? (
              <button onClick={() => setStep(s => s + 1)} disabled={!canContinue}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px', borderRadius: 9, background: canContinue ? '#7c3aed' : 'rgba(124,58,237,0.3)', border: 'none', color: canContinue ? '#fff' : 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: 600, cursor: canContinue ? 'pointer' : 'not-allowed', fontFamily: 'inherit', transition: 'all 0.15s', boxShadow: canContinue ? '0 0 20px rgba(124,58,237,0.35)' : 'none' }}>
                Continue <ArrowRight size={14} />
              </button>
            ) : (
              <button onClick={handleFinish} disabled={!canContinue || loading}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px', borderRadius: 9, background: canContinue ? '#7c3aed' : 'rgba(124,58,237,0.3)', border: 'none', color: canContinue ? '#fff' : 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: 600, cursor: canContinue ? 'pointer' : 'not-allowed', fontFamily: 'inherit', transition: 'all 0.15s', boxShadow: canContinue ? '0 0 20px rgba(124,58,237,0.35)' : 'none' }}>
                {loading ? <span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite' }} /> : <><ArrowRight size={14} /> Create account</>}
              </button>
            )}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#33333f' }}>Step {step + 1} of 3</div>
      </div>
    </div>
  )
}
