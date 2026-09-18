import { useRef, useEffect } from "react"
import { gsap } from "gsap"
import { motion } from "framer-motion"
import type { IconType } from "react-icons"

interface TechItem {
  name: string
  icon: IconType
  color: string
}

interface TechMarqueeProps {
  items: TechItem[]
}

/**
 * Two infinite horizontal rows moving in opposite directions. Each row's
 * item list is duplicated once so the loop can reset seamlessly
 * (translateX(-50%) lands exactly back on the start of the duplicate set —
 * no visible jump). Each row also slides in from its own side (row 1 from
 * the left, row 2 from the right) and replays that entrance every time the
 * section scrolls back into view.
 */
export default function TechMarquee({ items }: TechMarqueeProps) {
  const trackRefA = useRef<HTMLDivElement>(null)
  const trackRefB = useRef<HTMLDivElement>(null)
  const tweenRefA = useRef<gsap.core.Tween | null>(null)
  const tweenRefB = useRef<gsap.core.Tween | null>(null)

  // second row shown in reverse order purely so the two rows don't look
  // like a mirrored copy of each other at a glance
  const itemsB = [...items].reverse()

  useEffect(() => {
    const trackA = trackRefA.current
    const trackB = trackRefB.current
    if (!trackA || !trackB) return

    const halfWidthA = trackA.scrollWidth / 2
    const halfWidthB = trackB.scrollWidth / 2

    // row A: right-to-left
    tweenRefA.current = gsap.fromTo(
      trackA,
      { x: 0 },
      { x: -halfWidthA, duration: items.length * 3.2, ease: "none", repeat: -1 },
    )

    // row B: left-to-right (starts pre-offset so it enters seamlessly)
    tweenRefB.current = gsap.fromTo(
      trackB,
      { x: -halfWidthB },
      { x: 0, duration: items.length * 3.6, ease: "none", repeat: -1 },
    )

    return () => {
      tweenRefA.current?.kill()
      tweenRefB.current?.kill()
    }
  }, [items])

  const renderSet = (list: TechItem[], keyPrefix: string) => (
    <>
      {list.map((t) => (
        <div
          key={`${keyPrefix}-${t.name}`}
          className="flex flex-col items-center gap-3 px-6 shrink-0"
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 hover:scale-110"
            style={{
              background: `${t.color}22`,
              border: `1px solid ${t.color}44`,
              boxShadow: `0 0 0 rgba(0,0,0,0)`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = `0 0 24px ${t.color}66`
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 0 0 rgba(0,0,0,0)"
            }}
          >
            <t.icon size={26} color={t.color} />
          </div>
          <span
            className="text-xs font-medium text-gray-400 whitespace-nowrap"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            {t.name}
          </span>
        </div>
      ))}
    </>
  )

  return (
    <div className="flex flex-col gap-2">
      {/* row 1 — slides in from the left, scrolls right-to-left */}
      <motion.div
        className="marquee-viewport"
        initial={{ opacity: 0, x: -70 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: false, amount: 0.4 }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        onMouseEnter={() => tweenRefA.current?.pause()}
        onMouseLeave={() => tweenRefA.current?.resume()}
      >
        <div ref={trackRefA} className="flex py-4" style={{ willChange: "transform" }}>
          {renderSet(items, "a1")}
          {renderSet(items, "a2")}
        </div>
      </motion.div>

      {/* row 2 — slides in from the right, scrolls left-to-right */}
      <motion.div
        className="marquee-viewport"
        initial={{ opacity: 0, x: 70 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: false, amount: 0.4 }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
        onMouseEnter={() => tweenRefB.current?.pause()}
        onMouseLeave={() => tweenRefB.current?.resume()}
      >
        <div ref={trackRefB} className="flex py-4" style={{ willChange: "transform" }}>
          {renderSet(itemsB, "b1")}
          {renderSet(itemsB, "b2")}
        </div>
      </motion.div>
    </div>
  )
}
