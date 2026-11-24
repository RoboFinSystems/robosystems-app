'use client'

import { type CSSProperties, useState, useSyncExternalStore } from 'react'
import { buildGalaxy, type Galaxy } from './graphGalaxy'

interface Placed {
  galaxy: Galaxy
  style: CSSProperties
  spin: CSSProperties
  float: string
}

const subscribeNever = () => () => {}

/** Galaxies scattered toward the edges of a section, smaller ones dimmer, as if further off. */
function scatter(count: number, keepClear?: 'left' | 'right'): Placed[] {
  const rnd = Math.random
  const firstLeft = rnd() < 0.5
  return Array.from({ length: count }, (_, i) => {
    const left = keepClear ? keepClear === 'right' : firstLeft === (i % 2 === 0)
    const size = 260 + rnd() * 400
    const edge = `${-(size * (0.1 + rnd() * 0.28)).toFixed(0)}px`
    return {
      galaxy: buildGalaxy(rnd),
      style: {
        width: size,
        height: size,
        top: `${(4 + ((i + rnd()) / count) * 78).toFixed(1)}%`,
        [left ? 'left' : 'right']: edge,
        opacity: 0.42 + ((size - 260) / 400) * 0.45,
      },
      spin: {
        animationDuration: `${(220 + rnd() * 260).toFixed(0)}s`,
        animationDirection: rnd() < 0.5 ? 'normal' : 'reverse',
      },
      float: i % 2 ? 'animate-float-slower' : 'animate-float-slow',
    }
  })
}

/**
 * Knowledge graphs in the distance behind a section: a few galaxies of clustered nodes,
 * different on every visit, each floating and turning slowly. Decorative, drawn only in the
 * browser (the server sends nothing, so nothing random has to match), and still for a
 * visitor who asks for reduced motion.
 */
export default function GraphGalaxies({
  count = 2,
  keepClear,
}: {
  count?: number
  /** A side to leave empty, for a section that has something else there. */
  keepClear?: 'left' | 'right'
}) {
  const inBrowser = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false
  )
  const [placed] = useState(() => scatter(count, keepClear))
  if (!inBrowser) return null

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {placed.map(({ galaxy, style, spin, float }, i) => (
        <div
          key={i}
          className={`absolute motion-reduce:animate-none ${float}`}
          style={style}
        >
          <svg
            viewBox="-1.05 -1.05 2.1 2.1"
            className="h-full w-full animate-[spin_300s_linear_infinite] motion-reduce:animate-none"
            style={spin}
          >
            {galaxy.links.map(({ a, b, lit, hue }) => (
              <line
                key={`${a}-${b}`}
                x1={galaxy.nodes[a].x}
                y1={galaxy.nodes[a].y}
                x2={galaxy.nodes[b].x}
                y2={galaxy.nodes[b].y}
                stroke={hue}
                strokeWidth={0.004}
                opacity={lit * 0.5}
              />
            ))}
            {galaxy.nodes.map(({ x, y, r, lit, hue }, n) => (
              <circle key={n} cx={x} cy={y} r={r} fill={hue} opacity={lit} />
            ))}
            {/* each hub wears a ring: a ball in its own right, with a graph inside it */}
            {galaxy.nodes
              .filter(({ hue }) => hue === '#ffffff')
              .map(({ x, y, r, lit }, n) => (
                <circle
                  key={`ring-${n}`}
                  cx={x}
                  cy={y}
                  r={r * 2.1}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth={0.004}
                  opacity={lit * 0.45}
                />
              ))}
          </svg>
        </div>
      ))}
    </div>
  )
}
