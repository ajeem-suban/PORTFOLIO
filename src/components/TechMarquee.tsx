import { useRef, useEffect } from "react"
// GSAP itself is loaded on demand inside the effect below, so its ~68 KiB
// (minified) stays out of the entry bundle that gates first paint. The
// `gsap.core.Tween` type used for the refs comes from GSAP's global typings.
import { motion } from "framer-motion"
import type { IconType } from "react-icons"
import { runWhenIdle } from "../lib/idle"

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

    let cancelled = false
    let started = false

    const start = () => {
      if (started || cancelled) return
      started = true
      import("gsap").then(({ gsap: g }) => {
        if (cancelled) return

        const halfWidthA = trackA.scrollWidth / 2
        const halfWidthB = trackB.scrollWidth / 2

        // row A: right-to-left
        tweenRefA.current = g.fromTo(
          trackA,
          { x: 0 },
          { x: -halfWidthA, duration: items.length * 3.2, ease: "none", repeat: -1 },
        )

        // row B: left-to-right (starts pre-offset so it enters seamlessly)
        tweenRefB.current = g.fromTo(
          trackB,
          { x: -halfWidthB },
          { x: 0, duration: items.length * 3.6, ease: "none", repeat: -1 },
        )
      })
    }

    // The marquee is well below the fold, so its tweens don't need to exist
    // during first paint. GSAP is loaded and the rows are started by whichever
    // happens first:
    //   • the page has loaded, 1.5s have passed and the browser is idle, or
    //   • the marquee comes within ~1200px of the viewport (so a fast scroller
    //     never sees the rows sitting un-animated, or row B jump into place).
    const cancelIdle = runWhenIdle(start, 2500, 1500)

    let io: IntersectionObserver | undefined
    const host = trackA.parentElement
    if (host && typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) start()
        },
        { rootMargin: "1200px 0px" },
      )
      io.observe(host)
    } else {
      start()
    }

    return () => {
      cancelled = true
      cancelIdle()
      io?.disconnect()
      tweenRefA.current?.kill()
      tweenRefB.current?.kill()
    }
    // Depend on the length, not the array identity: the parent rebuilds `items`
    // on every render, and re-running this effect would kill the tweens and
    // restart both rows from their start offset (a visible snap) whenever an
    // unrelated App state change re-rendered the page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length])

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
            {/* purely decorative — the name label right below already
                conveys the same info to assistive tech */}
            <t.icon size={26} color={t.color} aria-hidden="true" focusable="false" />
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
