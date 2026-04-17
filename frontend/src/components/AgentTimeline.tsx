import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Database, BarChart2, PieChart, Calculator, CheckCircle2, Loader2 } from 'lucide-react'
import type { AgentStep } from '../types'

const TOOL_META: Record<string, { icon: typeof Brain; label: string; color: string; bg: string }> = {
  analyze_financial_health: { icon: BarChart2, label: 'Analyzing financial health', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  retrieve_financial_knowledge: { icon: Database, label: 'Retrieving knowledge base', color: 'text-violet-400', bg: 'bg-violet-500/10' },
  assess_risk_profile: { icon: Brain, label: 'Assessing risk profile', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  calculate_portfolio_allocation: { icon: PieChart, label: 'Calculating portfolio allocation', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  generate_budget_plan: { icon: Calculator, label: 'Generating budget plan', color: 'text-rose-400', bg: 'bg-rose-500/10' },
}

interface Props {
  steps: AgentStep[]
  isComplete: boolean
}

export function AgentTimeline({ steps, isComplete }: Props) {
  const [revealed, setRevealed] = useState(0)

  useEffect(() => {
    if (steps.length === 0) return
    const timer = setInterval(() => {
      setRevealed(prev => {
        if (prev >= steps.length) { clearInterval(timer); return prev }
        return prev + 1
      })
    }, 600)
    return () => clearInterval(timer)
  }, [steps.length])

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" />
        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
          {isComplete ? 'Analysis complete' : 'Agent reasoning...'}
        </p>
      </div>

      <AnimatePresence>
        {steps.slice(0, revealed).map((step, i) => {
          const meta = TOOL_META[step.tool_name] || { icon: Brain, label: step.tool_name, color: 'text-zinc-400', bg: 'bg-zinc-800' }
          const Icon = meta.icon
          const isDone = i < revealed

          return (
            <motion.div
              key={step.step_number}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="flex items-start gap-3"
            >
              {/* Timeline line */}
              <div className="flex flex-col items-center gap-1 pt-0.5">
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${meta.bg}`}>
                  <Icon size={14} className={meta.color} />
                </div>
                {i < steps.length - 1 && (
                  <div className="w-px flex-1 bg-[#1e1e26] min-h-[16px]" />
                )}
              </div>

              <div className="flex-1 pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-zinc-200">{meta.label}</span>
                  {isDone ? (
                    <CheckCircle2 size={13} className="text-emerald-500" />
                  ) : (
                    <Loader2 size={13} className="text-zinc-500 animate-spin" />
                  )}
                </div>
                <p className="text-xs text-zinc-600 font-mono leading-relaxed line-clamp-2">
                  {step.tool_output_summary}
                </p>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>

      {/* Processing indicator while waiting */}
      {!isComplete && revealed >= steps.length && steps.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 py-2"
        >
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-violet-500"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
          <span className="text-sm text-zinc-500">Sending to AI agent...</span>
        </motion.div>
      )}
    </div>
  )
}
