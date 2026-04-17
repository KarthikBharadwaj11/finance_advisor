interface Props { className?: string }

export function Skeleton({ className = '' }: Props) {
  return <div className={`skeleton rounded-lg ${className}`} />
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-[#15151f] card-gradient p-5 space-y-3">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-7 w-28" />
      <Skeleton className="h-2 w-full" />
    </div>
  )
}
