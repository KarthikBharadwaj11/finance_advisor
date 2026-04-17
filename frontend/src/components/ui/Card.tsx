import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  glow?: boolean
  delay?: number
  onClick?: () => void
  hover?: boolean
}

export function Card({ children, className = '', glow = false, delay = 0, onClick, hover = false }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      onClick={onClick}
      className={`
        relative rounded-xl border border-[#15151f] card-gradient p-5 overflow-hidden
        ${glow ? 'shadow-[0_0_40px_rgba(124,58,237,0.08)] border-violet-500/10' : ''}
        ${hover ? 'cursor-pointer hover:border-[#2a2a3f] hover:bg-[#0f0f1a] transition-all duration-200' : ''}
        ${className}
      `}
    >
      {glow && (
        <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-violet-600/5 blur-2xl" />
      )}
      {children}
    </motion.div>
  )
}
