/**
 * The graph from the brand film, drawn live: facts scattered in space that come home to a
 * sphere and turn slowly, over a field of dust. Plain WebGL with no library, so the landing
 * page pays for a few hundred lines rather than a 3D engine. The numbers (lens, sizes,
 * colours, timings) are the film's own, from the content machine's film stage.
 */

export const NODE_COUNT = 150
const DUST_COUNT = 900
const RADIUS = 3.4
const CAM_Z = 14
const FOV = 38
const SETTLED = 8 // seconds in, the picture reduced motion holds

const clamp = (x: number) => Math.max(0, Math.min(1, x))
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a))
const easeOut = (x: number) => 1 - Math.pow(1 - clamp(x), 3)
const easeInOut = (x: number) => {
  x = clamp(x)
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
}

export interface Graph {
  dust: Float32Array
  dustSize: Float32Array
  scatter: Float32Array
  home: Float32Array
  size: Float32Array
  /** Index pairs: each node joined to its three nearest neighbours. */
  pairs: number[]
}

/** Seeded, so every visitor and every screenshot gets the same picture. */
export function buildGraph(seed = 11): Graph {
  let s = seed
  const rnd = () => ((s = (s * 16807) % 2147483647), s / 2147483647)

  const dust = new Float32Array(DUST_COUNT * 3)
  const dustSize = new Float32Array(DUST_COUNT)
  for (let i = 0; i < DUST_COUNT; i++) {
    dust.set([(rnd() - 0.5) * 60, (rnd() - 0.5) * 34, -rnd() * 110 + 8], i * 3)
    dustSize[i] = 0.3 + rnd() * 0.8
  }

  const scatter = new Float32Array(NODE_COUNT * 3)
  const home = new Float32Array(NODE_COUNT * 3)
  const size = new Float32Array(NODE_COUNT)
  for (let i = 0; i < NODE_COUNT; i++) {
    scatter.set(
      [(rnd() - 0.5) * 44, (rnd() - 0.5) * 24, -rnd() * 46 + 4],
      i * 3
    )
    const y = 1 - (i / (NODE_COUNT - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const a = i * 2.39996
    home.set(
      [Math.cos(a) * r * RADIUS, y * RADIUS, Math.sin(a) * r * RADIUS],
      i * 3
    )
    size[i] = rnd() > 0.82 ? 3.4 : 1.9
  }

  const pairs: number[] = []
  const d2 = (i: number, j: number) =>
    (home[i * 3] - home[j * 3]) ** 2 +
    (home[i * 3 + 1] - home[j * 3 + 1]) ** 2 +
    (home[i * 3 + 2] - home[j * 3 + 2]) ** 2
  for (let i = 0; i < NODE_COUNT; i++) {
    Array.from({ length: NODE_COUNT }, (_, j) => j)
      .sort((p, q) => d2(i, p) - d2(i, q))
      .slice(1, 4)
      .forEach((j) => i < j && pairs.push(i, j))
  }
  return { dust, dustSize, scatter, home, size, pairs }
}

/** Where the sphere sits: right of the words when they are set beside it, above them otherwise. */
export function placeSphere(aspect: number, beside: boolean) {
  const halfH = CAM_Z * Math.tan((FOV * Math.PI) / 360)
  const halfW = halfH * aspect
  if (beside) {
    const scale = Math.min(1, (halfW * 0.36) / RADIUS, (halfH * 0.8) / RADIUS)
    return { x: halfW * 0.48, y: 0.1, scale }
  }
  const scale = Math.min(1, (halfW * 0.8) / RADIUS, (halfH * 0.33) / RADIUS)
  return { x: 0, y: halfH * 0.44, scale }
}

const POINT_VERT = `
precision mediump float;
attribute vec3 position; attribute float size; attribute float front;
uniform mat4 uProj; uniform float uRot, uFocus, uAperture, uPx, uHalo;
varying float vA;
void main() {
  float c = cos(uRot), s = sin(uRot);
  vec3 p = vec3(c * position.x + s * position.z, position.y, c * position.z - s * position.x);
  float d = ${CAM_Z.toFixed(1)} - p.z;
  float coc = abs(d - uFocus) * uAperture;
  gl_PointSize = (size + coc * 5.) * 60. / d * uPx * uHalo;
  gl_Position = uProj * vec4(p.xy, -d, 1.);
  vec2 n = abs(gl_Position.xy / gl_Position.w);
  vA = smoothstep(1.5, 5., d) * smoothstep(1.02, .84, max(n.x, n.y)) / (1. + coc * coc * 1.6) * front;
}`
// The film blooms its highlights in a second pass; here each point carries its own soft halo.
const POINT_FRAG = `
precision mediump float;
uniform vec3 uColor; uniform float uAlpha, uHalo, uGlow; varying float vA;
void main() {
  float r = length(gl_PointCoord - .5) * uHalo;
  float a = smoothstep(.5, .32, r) + uGlow * exp(-r * r * 5.);
  gl_FragColor = vec4(uColor, a * vA * uAlpha);
}`
const LINE_VERT = `
precision mediump float;
attribute vec3 position; attribute float front; uniform mat4 uProj; varying float vF;
void main() { vF = front; gl_Position = uProj * vec4(position.xy, position.z - ${CAM_Z.toFixed(1)}, 1.); }`
const LINE_FRAG = `
precision mediump float; uniform float uAlpha; varying float vF;
void main() { gl_FragColor = vec4(1., 1., 1., uAlpha * vF); }`

function program(gl: WebGLRenderingContext, vert: string, frag: string) {
  const p = gl.createProgram()!
  for (const [type, src] of [
    [gl.VERTEX_SHADER, vert],
    [gl.FRAGMENT_SHADER, frag],
  ] as const) {
    const sh = gl.createShader(type)!
    gl.shaderSource(sh, src)
    gl.compileShader(sh)
    gl.attachShader(p, sh)
  }
  gl.linkProgram(p)
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(p) ?? 'shader link failed')
  }
  const u = (name: string) => gl.getUniformLocation(p, name)
  const a = (name: string) => gl.getAttribLocation(p, name)
  return { p, u, a }
}

/**
 * Draws the stage on `canvas` until the returned function is called. It runs only while the
 * canvas is on screen, and holds one settled frame for a visitor who asks for reduced
 * motion. Where WebGL is unavailable it draws nothing: the page stands without it.
 */
export function mountGraphStage(
  canvas: HTMLCanvasElement,
  /** The CSS width from which the page sets its words beside the sphere. */
  besideFrom: number
): () => void {
  const gl = canvas.getContext('webgl', { alpha: true, antialias: true })
  if (!gl) return () => {}

  const g = buildGraph()
  const points = program(gl, POINT_VERT, POINT_FRAG)
  const lines = program(gl, LINE_VERT, LINE_FRAG)
  const buffer = (data: Float32Array, usage: number = gl.STATIC_DRAW) => {
    const b = gl.createBuffer()!
    gl.bindBuffer(gl.ARRAY_BUFFER, b)
    gl.bufferData(gl.ARRAY_BUFFER, data, usage)
    return b
  }
  const bind = (
    prog: ReturnType<typeof program>,
    name: string,
    b: WebGLBuffer,
    n: number
  ) => {
    const loc = prog.a(name)
    gl.bindBuffer(gl.ARRAY_BUFFER, b)
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, n, gl.FLOAT, false, 0, 0)
  }

  const dustPos = buffer(g.dust)
  const dustSize = buffer(g.dustSize)
  const nodeSize = buffer(g.size)
  const pos = new Float32Array(NODE_COUNT * 3)
  const front = new Float32Array(NODE_COUNT)
  const edgePos = new Float32Array(g.pairs.length * 3)
  const edgeFront = new Float32Array(g.pairs.length)
  const nodePos = buffer(pos, gl.DYNAMIC_DRAW)
  const nodeFront = buffer(front, gl.DYNAMIC_DRAW)
  const edgePosBuf = buffer(edgePos, gl.DYNAMIC_DRAW)
  const edgeFrontBuf = buffer(edgeFront, gl.DYNAMIC_DRAW)

  gl.enable(gl.BLEND)
  // Light added to whatever the page puts behind the canvas, which stays transparent.
  gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE, gl.ZERO, gl.ONE)
  gl.clearColor(0, 0, 0, 0)

  const proj = new Float32Array(16)
  let place = placeSphere(1, false)
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr))
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr))
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
    }
    gl.viewport(0, 0, w, h)
    const f = 1 / Math.tan((FOV * Math.PI) / 360)
    const near = 0.1
    const far = 400
    proj.fill(0)
    proj[0] = f / (w / h)
    proj[5] = f
    proj[10] = (far + near) / (near - far)
    proj[11] = -1
    proj[14] = (2 * far * near) / (near - far)
    place = placeSphere(w / h, canvas.clientWidth >= besideFrom)
  }

  const draw = (t: number) => {
    const home = easeInOut(seg(t, 0.3, 3.2))
    // The sphere's turn: the film's tilt, then a slow spin about its own axis.
    const [ax, ay, az] = [0.28, t * 0.12, 0.12]
    const [cx, sx, cy, sy, cz, sz] = [
      Math.cos(ax),
      Math.sin(ax),
      Math.cos(ay),
      Math.sin(ay),
      Math.cos(az),
      Math.sin(az),
    ]
    for (let i = 0; i < NODE_COUNT; i++) {
      const [hx, hy, hz] = [g.home[i * 3], g.home[i * 3 + 1], g.home[i * 3 + 2]]
      const x1 = cz * hx - sz * hy
      const y1 = sz * hx + cz * hy
      const x2 = cy * x1 + sy * hz
      const z2 = cy * hz - sy * x1
      const y3 = cx * y1 - sx * z2
      const z3 = sx * y1 + cx * z2
      const target = [
        place.x + x2 * place.scale,
        place.y + y3 * place.scale,
        z3 * place.scale,
      ]
      for (let k = 0; k < 3; k++) {
        const from = g.scatter[i * 3 + k]
        pos[i * 3 + k] = from + (target[k] - from) * home
      }
      // The far side of the sphere is dimmed, so it reads as a solid without a depth pass.
      const facing = 0.16 + 0.84 * easeInOut(seg(z3 / RADIUS, -0.35, 0.5))
      front[i] = 1 + (facing - 1) * home
    }
    g.pairs.forEach((n, k) => {
      edgePos.set(pos.subarray(n * 3, n * 3 + 3), k * 3)
      edgeFront[k] = front[n]
    })

    gl.clear(gl.COLOR_BUFFER_BIT)
    const px = canvas.height / 1080

    gl.useProgram(lines.p)
    gl.uniformMatrix4fv(lines.u('uProj'), false, proj)
    gl.uniform1f(lines.u('uAlpha'), 0.5 * easeOut(seg(t, 2.4, 4)))
    gl.bindBuffer(gl.ARRAY_BUFFER, edgePosBuf)
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, edgePos)
    gl.bindBuffer(gl.ARRAY_BUFFER, edgeFrontBuf)
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, edgeFront)
    bind(lines, 'position', edgePosBuf, 3)
    bind(lines, 'front', edgeFrontBuf, 1)
    gl.drawArrays(gl.LINES, 0, g.pairs.length)

    gl.useProgram(points.p)
    gl.uniformMatrix4fv(points.u('uProj'), false, proj)
    gl.uniform1f(points.u('uFocus'), CAM_Z)

    // dust: cyan, small, drifting almost imperceptibly
    gl.uniform1f(points.u('uRot'), t * 0.004)
    gl.uniform1f(points.u('uAperture'), 0.05)
    gl.uniform1f(points.u('uPx'), px)
    gl.uniform1f(points.u('uHalo'), 1)
    gl.uniform1f(points.u('uGlow'), 0)
    gl.uniform1f(points.u('uAlpha'), 0.5)
    gl.uniform3f(points.u('uColor'), 0.133, 0.827, 0.933)
    bind(points, 'position', dustPos, 3)
    bind(points, 'size', dustSize, 1)
    gl.disableVertexAttribArray(points.a('front'))
    gl.vertexAttrib1f(points.a('front'), 1)
    gl.drawArrays(gl.POINTS, 0, DUST_COUNT)

    // the facts: white, haloed
    gl.uniform1f(points.u('uRot'), 0)
    gl.uniform1f(points.u('uAperture'), 0.06)
    gl.uniform1f(points.u('uPx'), px * (1 + (place.scale - 1) * home))
    gl.uniform1f(points.u('uHalo'), 3)
    gl.uniform1f(points.u('uGlow'), 0.22)
    gl.uniform1f(points.u('uAlpha'), 1)
    gl.uniform3f(points.u('uColor'), 1, 1, 1)
    gl.bindBuffer(gl.ARRAY_BUFFER, nodePos)
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, pos)
    gl.bindBuffer(gl.ARRAY_BUFFER, nodeFront)
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, front)
    bind(points, 'position', nodePos, 3)
    bind(points, 'size', nodeSize, 1)
    bind(points, 'front', nodeFront, 1)
    gl.drawArrays(gl.POINTS, 0, NODE_COUNT)
  }

  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  let raf = 0
  let start = 0
  let onScreen = false
  const loop = (now: number) => {
    start ||= now
    draw((now - start) / 1000)
    raf = requestAnimationFrame(loop)
  }
  const run = () => {
    cancelAnimationFrame(raf)
    if (still) draw(SETTLED)
    else if (onScreen) raf = requestAnimationFrame(loop)
  }

  const sized = new ResizeObserver(() => {
    resize()
    if (still) draw(SETTLED)
  })
  const seen = new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting
    run()
  })
  resize()
  sized.observe(canvas)
  seen.observe(canvas)

  return () => {
    cancelAnimationFrame(raf)
    sized.disconnect()
    seen.disconnect()
  }
}
