import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

function useCountUp(target: number, duration = 1200, delay = 0) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    const timeout = setTimeout(() => {
      const start = performance.now()
      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1)
        const ease = 1 - Math.pow(1 - progress, 3)
        setValue(target * ease)
        if (progress < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, delay)
    return () => clearTimeout(timeout)
  }, [target, duration, delay])
  return value
}

interface Props {
  label: string
  value: number
  format?: 'currency' | 'percent' | 'number' | 'months'
  icon: ReactNode
  iconBg: string
  trend?: 'up' | 'down' | 'neutral'
  trendLabel?: string
  delay?: number
}

export function StatCard({ label, value, format = 'number', icon, iconBg, trend = 'neutral', trendLabel, delay = 0 }: Props) {
  const animated = useCountUp(value, 1000, delay * 1000 + 200)

  const display = () => {
    if (format === 'currency') return `$${Math.round(animated).toLocaleString()}`
    if (format === 'percent') return `${(animated * 100).toFixed(1)}%`
    if (format === 'months') return `${animated.toFixed(1)} mo`
    return animated.toFixed(1)
  }

  const trendColor = trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-rose-400' : 'text-zinc-500'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative rounded-xl border border-[#15151f] card-gradient p-5 overflow-hidden"
    >
      <div className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full opacity-40 blur-2xl" style={{ background: iconBg }} />
      <div className="flex items-start justify-between mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: iconBg + '22', border: `1px solid ${iconBg}30` }}>
          <span style={{ color: iconBg }}>{icon}</span>
        </div>
        {trendLabel && (
          <span className={`text-[11px] font-medium ${trendColor}`}>{trendLabel}</span>
        )}
      </div>
      <p className="font-num text-2xl font-bold text-zinc-100 tracking-tight">{display()}</p>
      <p className="mt-1 text-xs text-zinc-500">{label}</p>
    </motion.div>
  )
}
