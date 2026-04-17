import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface Props {
  children: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  variant?: Variant
  size?: Size
  disabled?: boolean
  loading?: boolean
  className?: string
  icon?: ReactNode
}

const variants: Record<Variant, string> = {
  primary: 'bg-violet-600 hover:bg-violet-500 text-white glow-violet border border-violet-500/0 hover:border-violet-400/30',
  secondary: 'bg-[#13131f] hover:bg-[#1a1a2e] text-zinc-200 border border-[#1e1e30] hover:border-[#2e2e48]',
  ghost: 'bg-transparent hover:bg-[#0f0f1a] text-zinc-400 hover:text-zinc-200 border border-transparent',
  danger: 'bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-600/20 hover:border-rose-500/40',
}

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-6 py-3.5 text-sm gap-2',
}

export function Button({ children, onClick, type = 'button', variant = 'primary', size = 'md', disabled, loading, className = '', icon }: Props) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.1 }}
      className={`
        inline-flex items-center justify-center rounded-lg font-medium
        transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
    >
      {loading ? (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current/30 border-t-current" />
      ) : icon}
      {children}
    </motion.button>
  )
}
