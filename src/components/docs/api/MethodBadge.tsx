import type { HttpMethod } from '@/lib/openapi'

// Full class strings per method: Tailwind only keeps classes it can see written out.
const STYLES: Record<HttpMethod, string> = {
  get: 'bg-cyan-500/10 text-cyan-300 ring-cyan-500/30',
  post: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/30',
  put: 'bg-amber-500/10 text-amber-300 ring-amber-500/30',
  patch: 'bg-amber-500/10 text-amber-300 ring-amber-500/30',
  delete: 'bg-rose-500/10 text-rose-300 ring-rose-500/30',
}

export function MethodBadge({
  method,
  className = '',
}: {
  method: HttpMethod
  className?: string
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded px-1.5 py-0.5 font-mono text-[11px] font-semibold tracking-wide uppercase ring-1 ring-inset ${STYLES[method]} ${className}`}
    >
      {method}
    </span>
  )
}
