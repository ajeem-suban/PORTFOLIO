import { useMemo, useRef, useEffect, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import * as THREE from "three"

const PARTICLE_COUNT = 700
// palette matches the rest of the site (hero glow / accent colors)
const COLORS = ["#a78bfa", "#8b5cf6", "#c084fc", "#06b6d4"]

function generateGlowTexture() {
  const size = 64
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")!
  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  )
  gradient.addColorStop(0, "rgba(255,255,255,1)")
  gradient.addColorStop(0.35, "rgba(255,255,255,0.6)")
  gradient.addColorStop(1, "rgba(255,255,255,0)")
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  return new THREE.CanvasTexture(canvas)
}

function Glitter({ mouse }: { mouse: React.RefObject<{ x: number; y: number }> }) {
  const pointsRef = useRef<THREE.Points>(null)
  const texture = useMemo(() => generateGlowTexture(), [])

  const { positions, colors, speeds } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const colors = new Float32Array(PARTICLE_COUNT * 3)
    const speeds = new Float32Array(PARTICLE_COUNT)
    const color = new THREE.Color()

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 12

      color.set(COLORS[i % COLORS.length])
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b

      speeds[i] = Math.random() * 0.3 + 0.08
    }
    return { positions, colors, speeds }
  }, [])

  useFrame((state) => {
    if (!pointsRef.current) return
    const t = state.clock.getElapsedTime()
    const posAttr = pointsRef.current.geometry.attributes
      .position as THREE.BufferAttribute

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // gentle upward drift + per-particle sideways sway, wraps around
      const baseY = posAttr.getY(i)
      let y = baseY + speeds[i] * 0.01
      if (y > 10) y = -10
      posAttr.setY(i, y)

      const swayX = Math.sin(t * 0.15 + i) * 0.003
      posAttr.setX(i, posAttr.getX(i) + swayX)
    }
    posAttr.needsUpdate = true

    // whole field drifts subtly toward the cursor (parallax), spring-lerped
    if (mouse.current) {
      pointsRef.current.rotation.y = THREE.MathUtils.lerp(
        pointsRef.current.rotation.y,
        mouse.current.x * 0.08,
        0.02,
      )
      pointsRef.current.rotation.x = THREE.MathUtils.lerp(
        pointsRef.current.rotation.x,
        -mouse.current.y * 0.05,
        0.02,
      )
    }

    // twinkle: opacity handled per-material globally, size pulse via scale
    const pulse = 1 + Math.sin(t * 1.2) * 0.04
    pointsRef.current.scale.set(pulse, pulse, pulse)
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={PARTICLE_COUNT}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
          count={PARTICLE_COUNT}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.14}
        map={texture}
        vertexColors
        transparent
        opacity={0.75}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  )
}

export default function ParticleField() {
  const mouse = useRef({ x: 0, y: 0 })
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX / window.innerWidth - 0.5
      mouse.current.y = e.clientY / window.innerHeight - 0.5
    }
    // pause rendering when the tab isn't visible — biggest perf risk on a
    // background layer that runs continuously on every page
    const onVisibility = () => setVisible(document.visibilityState === "visible")

    window.addEventListener("mousemove", onMove)
    document.addEventListener("visibilitychange", onVisibility)
    return () => {
      window.removeEventListener("mousemove", onMove)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [])

  if (!visible) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
        dpr={[1, 1.5]}
      >
        <Glitter mouse={mouse} />
      </Canvas>
    </div>
  )
}
