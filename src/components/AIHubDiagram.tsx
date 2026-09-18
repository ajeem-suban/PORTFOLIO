import { useState } from "react"
import { motion } from "framer-motion"
import type { IconType } from "react-icons"
import AiMascot from "./AiMascot"

interface HubTool {
  name: string
  icon: IconType
  color: string
  role: string
}

interface AIHubDiagramProps {
  tools: HubTool[] // expects exactly 5 for the pentagon layout
}

const SIZE = 560
const CENTER = SIZE / 2
const SPOKE_RADIUS = 210
const NODE_SIZE = 88

export default function AIHubDiagram({ tools }: AIHubDiagramProps) {
  const [inView, setInView] = useState(false)

  // pentagon positions, starting at the top and going clockwise
  const positions = tools.map((_, i) => {
    const angle = (Math.PI * 2 * i) / tools.length - Math.PI / 2
    return {
      x: CENTER + SPOKE_RADIUS * Math.cos(angle),
      y: CENTER + SPOKE_RADIUS * Math.sin(angle),
    }
  })

  return (
    <motion.div
      className="relative mx-auto"
      style={{ width: SIZE, maxWidth: "100%", aspectRatio: "1 / 1" }}
      initial="hidden"
      whileInView="show"
      viewport={{ once: false, amount: 0.4 }}
      onViewportEnter={() => setInView(true)}
      onViewportLeave={() => setInView(false)}
    >
      {/* spokes: SVG so the dashed-line draw-in animation is a clean stroke reveal */}
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="absolute inset-0 w-full h-full"
        style={{ overflow: "visible" }}
      >
        {positions.map((p, i) => {
          return (
            <motion.line
              key={i}
              x1={CENTER}
              y1={CENTER}
              x2={p.x}
              y2={p.y}
              stroke="rgba(139,92,246,0.45)"
              strokeWidth={1.5}
              strokeDasharray="6 6"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={inView ? { pathLength: 1, opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.08, ease: "easeOut" }}
            />
          )
        })}

        {/* traveling pulse dots along each spoke, looping */}
        {positions.map((p, i) => (
          <motion.circle
            key={`pulse-${i}`}
            r={3}
            fill="#c084fc"
            initial={{ opacity: 0 }}
            animate={
              inView
                ? {
                    cx: [CENTER, p.x],
                    cy: [CENTER, p.y],
                    opacity: [0, 1, 0],
                  }
                : {}
            }
            transition={{
              duration: 1.8,
              delay: 1 + i * 0.3,
              repeat: Infinity,
              repeatDelay: tools.length * 0.3 + 0.6,
              ease: "easeInOut",
            }}
          />
        ))}
      </svg>

      {/* center hub — the mascot lives here, replacing the old <A/> text badge */}
      <motion.div
        className="absolute rounded-full flex items-center justify-center"
        style={{
          width: 140,
          height: 140,
          left: CENTER,
          top: CENTER,
          translateX: "-50%",
          translateY: "-50%",
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={inView ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <AiMascot />
      </motion.div>

      {/* tool nodes, popping in staggered along their spokes */}
      {tools.map((t, i) => {
        const p = positions[i]
        return (
          <motion.div
            key={t.name}
            className="absolute flex flex-col items-center gap-2"
            style={{
              left: p.x,
              top: p.y,
              width: NODE_SIZE,
              translateX: "-50%",
              translateY: "-50%",
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={inView ? { scale: 1, opacity: 1 } : {}}
            transition={{
              duration: 0.45,
              delay: 0.5 + i * 0.12,
              ease: [0.34, 1.56, 0.64, 1],
            }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center glass-card transition-transform duration-300 hover:scale-110"
              style={{
                border: `1px solid ${t.color}55`,
                boxShadow: `0 0 20px ${t.color}33`,
              }}
            >
              <t.icon size={24} color={t.color} />
            </div>
            <span
              className="text-xs font-medium text-gray-300 text-center"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {t.name}
            </span>
            <span
              className="text-[10px] text-gray-600 text-center leading-tight"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {t.role}
            </span>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
