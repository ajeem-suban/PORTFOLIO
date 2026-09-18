import { useEffect, useMemo, useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import * as THREE from "three"

const WORDS = ["AJEEM", "AI", "DEV"]
const PARTICLE_COUNT = 460
// bright white — the previous purple palette had almost no contrast
// against the (now-removed) purple gradient panel behind it
const COLORS = ["#ffffff"]
// per-word hold time — AJEEM (the name) is held noticeably longer than
// AI/DEV so it reads as the primary, most-visible formation in the loop
const HOLDS = [2.4, 1.2, 1.2]
const TRANSITION_S = 1.1
const SEGMENTS = HOLDS.map((h) => h + TRANSITION_S)
const CYCLE_S = SEGMENTS.reduce((a, b) => a + b, 0)

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}
function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/** Same soft radial glow sprite ParticleField.tsx uses, duplicated locally
 *  to keep this component self-contained and independently reusable. */
function generateGlowTexture() {
  const size = 64
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")!
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, "rgba(255,255,255,1)")
  gradient.addColorStop(0.2, "rgba(255,255,255,0.95)")
  gradient.addColorStop(0.5, "rgba(255,255,255,0.45)")
  gradient.addColorStop(1, "rgba(255,255,255,0)")
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  return new THREE.CanvasTexture(canvas)
}

/**
 * Rasterizes `word` to an offscreen canvas sized to its own bounding box,
 * then reads back every filled pixel as a candidate point. Points are
 * stride-sampled (or repeated) down/up to exactly `count`, so every word
 * maps onto the SAME fixed-size particle pool — that 1:1 index mapping is
 * what makes morphing between words possible instead of just cross-fading
 * two unrelated point clouds.
 */
function sampleWordPoints(word: string, count: number): Float32Array {
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  if (!ctx) return new Float32Array(count * 2)

  const height = 216 // supersampled render height for clean glyph edges
  const fontSpec = `800 ${height * 0.7}px Outfit, Arial, sans-serif`
  ctx.font = fontSpec
  const width = Math.ceil(ctx.measureText(word).width + height * 0.5)
  canvas.width = width
  canvas.height = height

  // re-apply font: canvas resize resets the 2D context state
  ctx.font = fontSpec
  ctx.fillStyle = "#fff"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText(word, width / 2, height / 2)

  const { data } = ctx.getImageData(0, 0, width, height)
  const candidates: number[] = []
  const step = 2 // skip pixels for perf; still dense enough at this canvas size
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      if (data[(y * width + x) * 4 + 3] > 128) {
        candidates.push(x / width - 0.5, -(y / height - 0.5))
      }
    }
  }

  const pairCount = candidates.length / 2
  const points = new Float32Array(count * 2)
  if (pairCount === 0) return points

  // world-space scale tuned to fill the camera frustum set up below
  // (fov 45 at z=3.2 gives ~±1.3 visible half-height/width)
  const SCALE = 2.5
  for (let i = 0; i < count; i++) {
    const idx = Math.floor((i / count) * pairCount)
    points[i * 2] = candidates[idx * 2] * SCALE
    points[i * 2 + 1] = candidates[idx * 2 + 1] * SCALE
  }
  return points
}

/** Waits for web fonts to finish loading before sampling glyphs, so the
 *  point clouds are built from the real "Outfit" font metrics rather than
 *  a fallback sans that would leave shapes permanently slightly off. */
function useWordTargets() {
  const [targets, setTargets] = useState<Float32Array[] | null>(null)
  useEffect(() => {
    let cancelled = false
    const compute = () => {
      if (cancelled) return
      setTargets(WORDS.map((w) => sampleWordPoints(w, PARTICLE_COUNT)))
    }
    if (document.fonts?.ready) {
      document.fonts.ready.then(compute)
    } else {
      compute()
    }
    return () => {
      cancelled = true
    }
  }, [])
  return targets
}

function MorphingGlyphs({
  wordTargets,
  reducedMotion,
}: {
  wordTargets: Float32Array[]
  reducedMotion: boolean
}) {
  const pointsRef = useRef<THREE.Points>(null)
  const texture = useMemo(() => generateGlowTexture(), [])
  const positions = useMemo(() => new Float32Array(PARTICLE_COUNT * 3), [])

  const colors = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3)
    const c = new THREE.Color()
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      c.set(COLORS[i % COLORS.length])
      arr[i * 3] = c.r
      arr[i * 3 + 1] = c.g
      arr[i * 3 + 2] = c.b
    }
    return arr
  }, [])

  // fixed per-particle scatter offset used mid-transition, so the
  // "explode then reform" reads as organic rather than every particle
  // retracing an identical straight line to its next letter
  const seeds = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 2.2
      arr[i * 3 + 1] = (Math.random() - 0.5) * 2.2
      arr[i * 3 + 2] = Math.random() * 0.6
    }
    return arr
  }, [])

  useFrame((state) => {
    if (!pointsRef.current) return
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute
    const t = state.clock.getElapsedTime()

    if (reducedMotion) {
      // static formation only — no morphing loop for reduced-motion users
      const from = wordTargets[0]
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        posAttr.setXYZ(i, from[i * 2], from[i * 2 + 1], 0)
      }
      posAttr.needsUpdate = true
      return
    }

    // Everything below is derived directly from elapsed clock time (no
    // mutable "phase" refs) so the cycle is deterministic and immune to
    // drift or remount glitches. Each word gets its own hold duration
    // (see HOLDS), so we walk the segment list to find which word is
    // active instead of assuming a fixed-length cycle.
    const cycleT = t % CYCLE_S
    let acc = 0
    let wordIdx = 0
    let localT = cycleT
    for (let i = 0; i < SEGMENTS.length; i++) {
      if (cycleT < acc + SEGMENTS[i]) {
        wordIdx = i
        localT = cycleT - acc
        break
      }
      acc += SEGMENTS[i]
    }
    const nextIdx = (wordIdx + 1) % WORDS.length
    const hold = HOLDS[wordIdx]
    const progress = localT > hold ? Math.min((localT - hold) / TRANSITION_S, 1) : 0

    const from = wordTargets[wordIdx]
    const to = wordTargets[nextIdx]

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const fx = from[i * 2]
      const fy = from[i * 2 + 1]
      let x: number, y: number, z: number

      if (progress === 0) {
        // holding the current word: gentle per-particle breathing jitter
        const jt = t * 1.4 + i
        x = fx + Math.sin(jt) * 0.015
        y = fy + Math.cos(jt * 1.3) * 0.015
        z = Math.sin(jt * 0.6) * 0.06
      } else if (progress < 0.5) {
        // first half: scatter outward from the current word
        const e = easeOutCubic(progress / 0.5)
        x = fx + seeds[i * 3] * e
        y = fy + seeds[i * 3 + 1] * e
        z = seeds[i * 3 + 2] * e
      } else {
        // second half: converge from the scattered point into the next word
        const e = easeInOutCubic((progress - 0.5) / 0.5)
        const sx = fx + seeds[i * 3]
        const sy = fy + seeds[i * 3 + 1]
        const sz = seeds[i * 3 + 2]
        const tx = to[i * 2]
        const ty = to[i * 2 + 1]
        x = sx + (tx - sx) * e
        y = sy + (ty - sy) * e
        z = sz - sz * e
      }
      posAttr.setXYZ(i, x, y, z)
    }
    posAttr.needsUpdate = true
    pointsRef.current.rotation.y = Math.sin(t * 0.12) * 0.04

    // whole-field twinkle pulse — same technique as ParticleField.tsx.
    // AJEEM (wordIdx 0) also gets a base scale boost so the name reads
    // larger/more prominent than the AI/DEV formations.
    const nameBoost = wordIdx === 0 ? 1.15 : 1.0
    const pulse = nameBoost * (1 + Math.sin(t * 2.2) * 0.06)
    pointsRef.current.scale.set(pulse, pulse, pulse)
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={PARTICLE_COUNT} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} count={PARTICLE_COUNT} />
      </bufferGeometry>
      <pointsMaterial
        size={0.075}
        map={texture}
        vertexColors
        transparent
        opacity={1}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  )
}

/**
 * Replaces the static SVG avatar placeholder in the About section.
 * A small, minimal cloud of glowing particles assembles into "AJEEM",
 * holds briefly, scatters, and reforms into "AI", then "DEVELOPER",
 * looping continuously. Uses the same particle/glow-texture conventions
 * as ParticleField.tsx so it reads as part of the same visual system
 * rather than a bolted-on effect.
 *
 * Deliberately scoped to this one card — no page-wide takeover, no
 * postprocessing pipeline (bloom/DOF) added, since a 224px card doesn't
 * need it and it would be a meaningful perf/dependency cost for a small
 * decorative element.
 */
export default function NameMorphParticles() {
  const wordTargets = useWordTargets()
  const [visible, setVisible] = useState(true)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReducedMotion(mq.matches)
    const onMotionChange = () => setReducedMotion(mq.matches)
    mq.addEventListener("change", onMotionChange)

    // pause rendering when the tab isn't visible, same as ParticleField —
    // avoids burning GPU on a hidden background layer
    const onVisibility = () => setVisible(document.visibilityState === "visible")
    document.addEventListener("visibilitychange", onVisibility)

    return () => {
      mq.removeEventListener("change", onMotionChange)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [])

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {wordTargets && visible ? (
        <Canvas
          camera={{ position: [0, 0, 3.2], fov: 45 }}
          gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
          dpr={[1, 1.5]}
        >
          <MorphingGlyphs wordTargets={wordTargets} reducedMotion={reducedMotion} />
        </Canvas>
      ) : (
        // brief placeholder shown only while fonts confirm ready and the
        // first glyph sample runs — prevents an empty flash on mount
        <span
          className="font-display font-black text-2xl text-white tracking-wide"
          style={{ opacity: 0.4, fontFamily: "Outfit, sans-serif" }}
        >
          AJEEM
        </span>
      )}
    </div>
  )
}
