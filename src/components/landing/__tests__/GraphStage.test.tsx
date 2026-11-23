import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import GraphStage from '../GraphStage'
import { buildGraph, NODE_COUNT, placeSphere } from '../graphStageGl'

describe('graph stage geometry', () => {
  it('builds the same graph every time', () => {
    expect(buildGraph().scatter).toEqual(buildGraph().scatter)
  })

  it('brings every node home to one sphere', () => {
    const { home } = buildGraph()
    for (let i = 0; i < NODE_COUNT; i++) {
      const r = Math.hypot(home[i * 3], home[i * 3 + 1], home[i * 3 + 2])
      expect(r).toBeCloseTo(3.4, 5)
    }
  })

  it('joins nodes in pairs, each listed once', () => {
    const { pairs } = buildGraph()
    expect(pairs.length % 2).toBe(0)
    const seen = new Set<string>()
    for (let k = 0; k < pairs.length; k += 2) {
      expect(pairs[k]).toBeLessThan(pairs[k + 1])
      seen.add(`${pairs[k]}-${pairs[k + 1]}`)
    }
    expect(seen.size).toBe(pairs.length / 2)
  })

  it('sets the sphere to the right of the words only when they sit beside it', () => {
    const beside = placeSphere(1.6, true, 900)
    const above = placeSphere(1.6, false, 900)
    expect(beside.x).toBeGreaterThan(0)
    expect(above.x).toBe(0)
    expect(above.y).toBeGreaterThan(beside.y)
  })

  it('holds the sphere level with the words however tall the window is', () => {
    const halfH = 14 * Math.tan((38 * Math.PI) / 360)
    const fromTop = (h: number) =>
      ((1 - placeSphere(1.3, true, h).y / halfH) / 2) * h
    expect(fromTop(1262)).toBeCloseTo(460, 5)
    expect(fromTop(1000)).toBeCloseTo(460, 5)
    expect(fromTop(700)).toBeCloseTo(350, 5)
  })

  it('keeps the sphere inside a narrow stage', () => {
    const halfW = 14 * Math.tan((38 * Math.PI) / 360) * (390 / 844)
    expect(placeSphere(390 / 844, false, 844).scale * 3.4).toBeLessThan(halfW)
  })
})

describe('GraphStage', () => {
  it('renders a decorative canvas and stands where WebGL is unavailable', () => {
    const { container } = render(<GraphStage />)
    const canvas = container.querySelector('canvas')
    expect(canvas).toHaveAttribute('aria-hidden', 'true')
    expect(canvas).toHaveClass('pointer-events-none')
  })
})
