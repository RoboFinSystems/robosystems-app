/**
 * The brand film's sphere as a section backdrop: a ball of linked points with a soft glow for
 * its body, large and dim, half off one edge of the section, floating and turning slowly.
 * An inline SVG moved by CSS: no script and no canvas. Decorative.
 */

const COUNT = 150

// The film's sphere: points spread evenly over a ball, each joined to its three nearest,
// then tilted and flattened onto the page. A point's depth decides how bright it is.
const POINTS = Array.from({ length: COUNT }, (_, i) => {
  const y = 1 - (i / (COUNT - 1)) * 2
  const r = Math.sqrt(1 - y * y)
  const a = i * 2.39996
  const [x, z] = [Math.cos(a) * r, Math.sin(a) * r]
  // tilt about the upright axis, then toward the viewer
  const [x1, z1] = [x * 0.88 + z * 0.47, z * 0.88 - x * 0.47]
  const [y1, z2] = [y * 0.96 - z1 * 0.28, z1 * 0.96 + y * 0.28]
  return { x: x1, y: y1, z: z2, big: i % 6 === 0 }
})
const LINKS = POINTS.flatMap((p, i) =>
  POINTS.map((q, j) => ({ j, d: Math.hypot(p.x - q.x, p.y - q.y, p.z - q.z) }))
    .sort((m, n) => m.d - n.d)
    .slice(1, 4)
    .filter(({ j }) => i < j)
    .map(({ j }) => [i, j])
)
const lit = (z: number) => 0.14 + 0.86 * Math.max(0, Math.min(1, (z + 0.4) / 1))
const n = (v: number) => v.toFixed(3)

const TINT = {
  cyan: ['text-secondary-300', 'rgba(34,211,238,0.16), rgba(37,99,235,0.08)'],
  blue: ['text-primary-300', 'rgba(59,122,245,0.18), rgba(99,102,241,0.08)'],
  indigo: ['text-accent-300', 'rgba(99,102,241,0.18), rgba(34,211,238,0.07)'],
} as const

export default function GraphOrb({
  side,
  tint = 'cyan',
  className = '',
}: {
  /** The edge of the section the orb hangs off. */
  side: 'left' | 'right'
  tint?: keyof typeof TINT
  /** Size and vertical place, e.g. "top-10 h-[640px] w-[640px]". */
  className?: string
}) {
  const [ink, glow] = TINT[tint]
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div
        className={`absolute motion-reduce:animate-none ${side === 'left' ? 'animate-float-slower -left-56' : 'animate-float-slow -right-56'} ${className}`}
      >
        <div
          className="absolute inset-0 rounded-full blur-2xl"
          style={{
            backgroundImage: `radial-gradient(circle at 38% 32%, ${glow} 48%, transparent 70%)`,
          }}
        />
        <svg
          viewBox="-1.06 -1.06 2.12 2.12"
          className={`absolute inset-0 h-full w-full animate-[spin_280s_linear_infinite] opacity-60 motion-reduce:animate-none ${ink}`}
        >
          <g stroke="currentColor" strokeWidth="0.004">
            {LINKS.map(([a, b]) => (
              <line
                key={`${a}-${b}`}
                x1={n(POINTS[a].x)}
                y1={n(POINTS[a].y)}
                x2={n(POINTS[b].x)}
                y2={n(POINTS[b].y)}
                opacity={n(lit((POINTS[a].z + POINTS[b].z) / 2) * 0.6)}
              />
            ))}
          </g>
          <g fill="#fff">
            {POINTS.map((p, i) => (
              <circle
                key={i}
                cx={n(p.x)}
                cy={n(p.y)}
                r={p.big ? 0.02 : 0.012}
                opacity={n(lit(p.z))}
              />
            ))}
          </g>
        </svg>
      </div>
    </div>
  )
}
