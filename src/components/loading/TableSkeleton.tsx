export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse">
      <div className="mb-4 h-10 rounded-sm bg-gray-200 dark:bg-zinc-700"></div>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="mb-2 h-16 rounded-sm bg-gray-100 dark:bg-zinc-800"
        ></div>
      ))}
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-700 dark:bg-zinc-800">
      <div className="mb-4 h-6 w-1/3 rounded-sm bg-gray-200 dark:bg-zinc-700"></div>
      <div className="space-y-3">
        <div className="h-4 rounded-sm bg-gray-200 dark:bg-zinc-700"></div>
        <div className="h-4 w-5/6 rounded-sm bg-gray-200 dark:bg-zinc-700"></div>
        <div className="h-4 w-4/6 rounded-sm bg-gray-200 dark:bg-zinc-700"></div>
      </div>
    </div>
  )
}
