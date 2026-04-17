import { useState } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, TrendingUp, Target, User, Plus, X } from 'lucide-react'
import { Button } from './ui/Button'
import type { FinancialProfile } from '../types'

interface Props {
  onSubmit: (profile: FinancialProfile) => void
  loading: boolean
}

interface FieldProps {
  label: string
  name: string
  value: string
  onChange: (v: string) => void
  prefix?: string
  suffix?: string
  hint?: string
}

function Field({ label, name, value, onChange, prefix, suffix, hint }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{label}</label>
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-zinc-500 text-sm select-none">{prefix}</span>
        )}
        <input
          name={name}
          type="number"
          value={value}
          onChange={e => onChange(e.target.value)}
          className={`
            w-full rounded-lg border border-[#1e1e26] bg-[#0a0a0e] px-3 py-2.5 text-sm text-zinc-100
            placeholder-zinc-700 outline-none transition-all duration-200
            focus:border-violet-500/50 focus:shadow-[0_0_0_3px_rgba(124,58,237,0.12)]
            ${prefix ? 'pl-7' : ''} ${suffix ? 'pr-10' : ''}
          `}
          placeholder="0"
        />
        {suffix && (
          <span className="absolute right-3 text-zinc-500 text-xs select-none">{suffix}</span>
        )}
      </div>
      {hint && <p className="text-xs text-zinc-600">{hint}</p>}
    </div>
  )
}

const PRESET_GOALS = ['Retire early', 'Build emergency fund', 'Buy a home', 'Pay off debt', 'Invest in index funds', 'Save for education']

export function InputForm({ onSubmit, loading }: Props) {
  const [form, setForm] = useState({
    monthly_income: '',
    monthly_expenses: '',
    total_savings: '',
    total_debt: '',
    age: '',
    investment_horizon_years: '',
  })
  const [goals, setGoals] = useState<string[]>(['Retire early', 'Build emergency fund'])
  const [customGoal, setCustomGoal] = useState('')

  const set = (k: string) => (v: string) => setForm(f => ({ ...f, [k]: v }))

  const toggleGoal = (g: string) => {
    setGoals(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])
  }

  const addCustomGoal = () => {
    if (customGoal.trim() && !goals.includes(customGoal.trim())) {
      setGoals(prev => [...prev, customGoal.trim()])
      setCustomGoal('')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      monthly_income: Number(form.monthly_income),
      monthly_expenses: Number(form.monthly_expenses),
      total_savings: Number(form.total_savings),
      total_debt: Number(form.total_debt),
      age: Number(form.age),
      investment_horizon_years: Number(form.investment_horizon_years),
      financial_goals: goals,
    })
  }

  const sections = [
    {
      icon: DollarSign,
      title: 'Cash Flow',
      color: 'text-emerald-400',
      fields: [
        { label: 'Monthly Income', key: 'monthly_income', prefix: '$', suffix: undefined, hint: 'Gross monthly income' },
        { label: 'Monthly Expenses', key: 'monthly_expenses', prefix: '$', suffix: undefined, hint: 'Total monthly spending' },
      ],
    },
    {
      icon: TrendingUp,
      title: 'Wealth Snapshot',
      color: 'text-violet-400',
      fields: [
        { label: 'Total Savings', key: 'total_savings', prefix: '$', suffix: undefined, hint: 'Liquid savings & investments' },
        { label: 'Total Debt', key: 'total_debt', prefix: '$', suffix: undefined, hint: 'All outstanding debt' },
      ],
    },
    {
      icon: User,
      title: 'About You',
      color: 'text-amber-400',
      fields: [
        { label: 'Age', key: 'age', prefix: undefined, suffix: 'yrs', hint: undefined },
        { label: 'Investment Horizon', key: 'investment_horizon_years', prefix: undefined, suffix: 'yrs', hint: 'Years until you need the money' },
      ],
    },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {sections.map(({ icon: Icon, title, color, fields }, si) => (
        <motion.div
          key={title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: si * 0.08, duration: 0.4 }}
          className="rounded-xl border border-[#1e1e26] bg-[#0f0f12] p-5"
        >
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#17171c]">
              <Icon size={14} className={color} />
            </div>
            <h3 className="text-sm font-semibold text-zinc-200">{title}</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {fields.map(f => (
              <Field
                key={f.key}
                label={f.label}
                name={f.key}
                value={form[f.key as keyof typeof form]}
                onChange={set(f.key)}
                prefix={f.prefix}
                suffix={f.suffix}
                hint={f.hint}
              />
            ))}
          </div>
        </motion.div>
      ))}

      {/* Goals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24, duration: 0.4 }}
        className="rounded-xl border border-[#1e1e26] bg-[#0f0f12] p-5"
      >
        <div className="flex items-center gap-2.5 mb-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#17171c]">
            <Target size={14} className="text-rose-400" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-200">Financial Goals</h3>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {PRESET_GOALS.map(g => (
            <button
              key={g}
              type="button"
              onClick={() => toggleGoal(g)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
                goals.includes(g)
                  ? 'border-violet-500/40 bg-violet-500/10 text-violet-300'
                  : 'border-[#1e1e26] bg-[#0a0a0e] text-zinc-500 hover:text-zinc-300 hover:border-zinc-600'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={customGoal}
            onChange={e => setCustomGoal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomGoal())}
            placeholder="Add a custom goal..."
            className="flex-1 rounded-lg border border-[#1e1e26] bg-[#0a0a0e] px-3 py-2 text-xs text-zinc-300 placeholder-zinc-700 outline-none focus:border-violet-500/50"
          />
          <button type="button" onClick={addCustomGoal} className="flex items-center gap-1 rounded-lg border border-[#1e1e26] bg-[#0a0a0e] px-3 py-2 text-xs text-zinc-400 hover:text-zinc-200 transition-colors">
            <Plus size={12} />
          </button>
        </div>
        {goals.filter(g => !PRESET_GOALS.includes(g)).length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {goals.filter(g => !PRESET_GOALS.includes(g)).map(g => (
              <span key={g} className="flex items-center gap-1 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 text-xs text-emerald-400">
                {g}
                <button type="button" onClick={() => toggleGoal(g)}><X size={10} /></button>
              </span>
            ))}
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.32 }}
      >
        <Button type="submit" loading={loading} disabled={!goals.length} className="w-full justify-center py-3 text-base">
          {loading ? 'Analyzing...' : 'Run Analysis'}
        </Button>
      </motion.div>
    </form>
  )
}
