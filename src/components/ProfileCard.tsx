import { useEffect, useRef, useState } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"

interface ProfileCardProps {
  imageUrl: string
}

/**
 * Hero centerpiece: a single large profile card.
 * - Cursor-driven 3D tilt (spring-damped so it feels physical, not twitchy)
 * - A light-reactive glow that shifts direction with the tilt
 * - IN animation is mount-triggered (not whileInView) so it slides in
 *   left-to-right exactly once per page load/refresh, and does NOT replay
 *   on scroll-away/scroll-back — that's a deliberate contrast with the rest
 *   of the site's repeat-on-scroll sections. The ring-sweep fires once on
 *   mount, in sync with the slide finishing.
 */
export default function ProfileCard({ imageUrl }: ProfileCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [sweepKey, setSweepKey] = useState(0)

  // fire the ring-sweep once the slide-in settles
  useEffect(() => {
    const t = window.setTimeout(() => setSweepKey((k) => k + 1), 900)
    return () => window.clearTimeout(t)
  }, [])

  // raw cursor offset from card center, -0.5..0.5
  const mvX = useMotionValue(0)
  const mvY = useMotionValue(0)

  // spring-smoothed so the tilt settles instead of snapping to the cursor
  const springX = useSpring(mvX, { stiffness: 150, damping: 18, mass: 0.6 })
  const springY = useSpring(mvY, { stiffness: 150, damping: 18, mass: 0.6 })

  const rotateX = useTransform(springY, [-0.5, 0.5], [12, -12])
  const rotateY = useTransform(springX, [-0.5, 0.5], [-12, 12])

  // glow position follows the same offset, so the "light source" tracks the tilt
  const glowX = useTransform(springX, [-0.5, 0.5], ["20%", "80%"])
  const glowY = useTransform(springY, [-0.5, 0.5], ["20%", "80%"])

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    mvX.set((e.clientX - rect.left) / rect.width - 0.5)
    mvY.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  const handleLeave = () => {
    mvX.set(0)
    mvY.set(0)
  }

  return (
    <motion.div
      // IN animation: slides in from the LEFT EDGE OF THE SCREEN (not just a
      // nearby offset) into the card's natural position on mount only.
      initial={{ opacity: 0, x: "-110vw", rotate: -6 }}
      animate={{ opacity: 1, x: 0, rotate: 0 }}
      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
      style={{ perspective: 1200 }}
      className="relative"
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        className="profile-card relative rounded-[2rem] overflow-hidden glass-card"
        style={{
          width: "min(90vw, 400px)",
          height: "min(90vw, 480px)",
          rotateX,
          rotateY,
        }}
      >
        {/* glow layer that tracks tilt direction like a light source */}
        <motion.div
          className="profile-card-glow"
          style={{
            background: useTransform(
              [glowX, glowY],
              ([gx, gy]) =>
                `radial-gradient(circle at ${gx} ${gy}, rgba(139,92,246,0.55), rgba(6,182,212,0.25) 45%, transparent 70%)`,
            ),
          }}
        />

        {/* ambient breathing ring behind the photo (continuous, unrelated to entrance) */}
        <div
          className="absolute inset-4 rounded-[1.6rem] animate-pulse-glow pointer-events-none"
          style={{ border: "1px solid rgba(139,92,246,0.35)" }}
        />

        {/* one-shot conic sweep around the card edge — key change forces a
            remount so the CSS animation restarts on every re-entrance */}
        <div key={sweepKey} className="profile-ring-sweep" />

        <img
          src={imageUrl}
          alt="Ajeem Suban, AI & Data Science Developer and founder of TAMIL-AI"
          className="w-full h-full object-cover"
          style={{ transform: "translateZ(30px)" }}
        />

        {/* bottom label plate, sits slightly forward in Z */}
        <div
          className="absolute bottom-0 left-0 right-0 px-6 py-5"
          style={{
            transform: "translateZ(40px)",
            background:
              "linear-gradient(to top, rgba(10,10,15,0.9), transparent)",
          }}
        >
          <div className="font-display font-bold text-white text-lg">
            Ajeem
          </div>
          <div
            className="text-xs text-purple-300 tracking-wide mt-0.5"
            style={{ fontFamily: "JetBrains Mono, monospace" }}
          >
            AI/ML Engineer &middot; Tamil-first AI
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
