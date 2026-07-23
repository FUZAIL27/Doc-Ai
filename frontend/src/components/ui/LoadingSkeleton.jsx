export function Skeleton({ className = '' }) {
  return <div className={`shimmer rounded-lg ${className}`} />
}

export function CardSkeleton() {
  return (
    <div className="glass-card p-4 sm:p-5 space-y-3">
      <Skeleton className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg" />
      <Skeleton className="h-6 sm:h-7 w-20 sm:w-24" />
      <Skeleton className="h-3 sm:h-4 w-32 sm:w-40" />
    </div>
  )
}

export function DocumentSkeleton() {
  return (
    <div className="glass-card p-3 sm:p-4">
      <div className="flex items-center gap-3 mb-2">
        <Skeleton className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 sm:h-4 w-3/4" />
          <Skeleton className="h-2.5 sm:h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-2.5 sm:h-3 w-full" />
    </div>
  )
}

export function ChatSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {[1, 2, 3].map(i => (
        <div key={i} className={`flex gap-3 ${i % 2 === 0 ? 'flex-row-reverse' : ''}`}>
          <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
          <Skeleton className={`h-14 sm:h-16 rounded-xl ${i % 2 === 0 ? 'w-40 sm:w-48' : 'w-56 sm:w-64'}`} />
        </div>
      ))}
    </div>
  )
}
