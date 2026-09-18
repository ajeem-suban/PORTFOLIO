import { motion, type Variants } from "framer-motion"

/**
 * Each section gets a visually distinct "IN" animation so the page doesn't
 * feel like the same fade-up repeated six times. Add new styles here as
 * needed — the section component just picks a `style` name.
 */
const VARIANTS: Record<string, Variants> = {
  // Hero — scale-up + fade settle (the ring-sweep glow lives in ProfileCard,
  // synced to this same viewport window so both fire together)
  "hero-glow": {
    hidden: { opacity: 0, scale: 0.9 },
    show: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
    },
  },
  // About — soft rise + fade (kept as the baseline others deviate from)
  "fade-up": {
    hidden: { opacity: 0, y: 44 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
  },
  // Tech Stack — title/section fade; the two marquee rows handle their own
  // alternating left/right slide-in internally (see TechMarquee.tsx)
  "tech-slide": {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  },
  // Projects — staggers each card in with a 3D rotate-up
  "projects-tilt": {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.09, delayChildren: 0.05 },
    },
  },
  // AI Toolkit — soft radial-feeling scale+fade (kept off clip-path on
  // purpose: a hard 0-height clip here risked getting visually stuck if the
  // section's own viewport trigger and the hub's internal one ever raced).
  // The hub itself does its own hub→spoke pop internally (see AIHubDiagram.tsx)
  "hub-radial": {
    hidden: { opacity: 0, scale: 0.92 },
    show: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.7, ease: [0.65, 0, 0.35, 1] },
    },
  },
  // Contact — blur-to-focus settle
  "contact-blur": {
    hidden: { opacity: 0, scale: 0.94, filter: "blur(14px)" },
    show: {
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
    },
  },
}

// Child variant used by "projects-tilt" parent (Projects section cards) —
// rotates up out of a slight 3D tilt instead of a plain scale/fade
export const staggerChildVariant: Variants = {
  hidden: { opacity: 0, rotateX: 18, y: 30 },
  show: {
    opacity: 1,
    rotateX: 0,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
}

// Project cards "assemble" into the grid: left-column cards slide in from
// off-screen left, right-column cards from off-screen right, and settle
// into their grid slot together. Replays every time the section is
// scrolled back into view (parent uses viewport once: false).
export function projectAssembleVariant(index: number): Variants {
  const fromLeft = index % 2 === 0
  return {
    hidden: {
      opacity: 0,
      x: fromLeft ? -180 : 180,
      rotate: fromLeft ? -5 : 5,
    },
    show: {
      opacity: 1,
      x: 0,
      rotate: 0,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
    },
  }
}

interface RevealProps {
  children: React.ReactNode
  style?: keyof typeof VARIANTS
  className?: string
  id?: string
}

export default function Reveal({
  children,
  style = "fade-up",
  className,
  id,
}: RevealProps) {
  return (
    <motion.div
      id={id}
      className={className}
      variants={VARIANTS[style]}
      initial="hidden"
      whileInView="show"
      viewport={{ once: false, amount: 0.15 }}
    >
      {children}
    </motion.div>
  )
}
