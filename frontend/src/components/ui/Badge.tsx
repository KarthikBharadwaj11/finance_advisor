type Variant = 'violet' | 'emerald' | 'amber' | 'rose' | 'blue' | 'zinc'

interface Props {
  label: string
  variant?: Variant
  dot?: boolean
}

const styles: Record<Variant, string> = {
  violet: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  amber: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  rose: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
  blue: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  zinc: 'bg-zinc-800/60 text-zinc-400 border-zinc-700/50',
}

const dotColors: Record<Variant, string> = {
  violet: 'bg-violet-400', emerald: 'bg-emerald-400', amber: 'bg-amber-400',
  rose: 'bg-rose-400', blue: 'bg-blue-400', zinc: 'bg-zinc-500',
}

export function Badge({ label, variant = 'zinc', dot = false }: Props) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium ${styles[variant]}`}>
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dotColors[variant]}`} />}
      {label}
    </span>
  )
}
