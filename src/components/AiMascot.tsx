import { useEffect, useRef, useState } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"

/**
 * Vector redraw of the uploaded robot mascot, built as separate SVG layers
 * (not a flat image) so it can genuinely emote:
 * - Pupils track the cursor with real travel range (parallax, clamped)
 * - Eyebrows tilt with vertical cursor position (curious look up/down)
 * - Three reaction states as the cursor approaches: idle -> near (smile
 *   widens) -> excited (eyes widen, mouth opens, cheeks blush) when the
 *   cursor is right on top of it
 * - Eyelids blink on a randomized loop, independent of cursor state
 * - Click gives it a happy bounce + wink
 */
export default function AiMascot() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [blink, setBlink] = useState(false)
  const [wink, setWink] = useState(false)
  const [proximity, setProximity] = useState<"idle" | "near" | "excited">("idle")
  const [bounce, setBounce] = useState(false)

  // cursor offset relative to mascot center, clamped -1..1
  const mvX = useMotionValue(0)
  const mvY = useMotionValue(0)
  const springX = useSpring(mvX, { stiffness: 130, damping: 13, mass: 0.5 })
  const springY = useSpring(mvY, { stiffness: 130, damping: 13, mass: 0.5 })

  // wider pupil travel + head tilt + eyebrow tilt, all cursor-driven
  const pupilX = useTransform(springX, [-1, 1], [-7, 7])
  const pupilY = useTransform(springY, [-1, 1], [-6, 6])
  const tiltY = useTransform(springX, [-1, 1], [-12, 12])
  const tiltX = useTransform(springY, [-1, 1], [9, -9])
  const browTilt = useTransform(springY, [-1, 1], [3, -5])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const el = wrapRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = (e.clientX - cx) / (rect.width * 2.2)
      const dy = (e.clientY - cy) / (rect.height * 2.2)
      const clamp = (v: number) => Math.max(-1, Math.min(1, v))
      mvX.set(clamp(dx))
      mvY.set(clamp(dy))

      const dist = Math.hypot(e.clientX - cx, e.clientY - cy)
      if (dist < rect.width * 0.55) setProximity("excited")
      else if (dist < rect.width * 1.8) setProximity("near")
      else setProximity("idle")
    }
    window.addEventListener("mousemove", onMove)
    return () => window.removeEventListener("mousemove", onMove)
  }, [mvX, mvY])

  // randomized blink loop — paused mid-wink so they don't fight
  useEffect(() => {
    let timer: number
    const scheduleBlink = () => {
      const delay = 2500 + Math.random() * 3500
      timer = window.setTimeout(() => {
        if (!wink) {
          setBlink(true)
          window.setTimeout(() => setBlink(false), 140)
        }
        scheduleBlink()
      }, delay)
    }
    scheduleBlink()
    return () => window.clearTimeout(timer)
  }, [wink])

  const handleClick = () => {
    setWink(true)
    setBounce(true)
    window.setTimeout(() => setWink(false), 260)
    window.setTimeout(() => setBounce(false), 400)
  }

  const excited = proximity === "excited"
  const near = proximity !== "idle"
  const eyeScale = excited ? 1.22 : 1

  return (
    <motion.div
      ref={wrapRef}
      onClick={handleClick}
      className="relative cursor-pointer"
      style={{ width: 130, height: 130, perspective: 600 }}
      animate={{
        y: [0, -6, 0],
        scale: bounce ? [1, 1.16, 0.96, 1.04, 1] : 1,
      }}
      transition={{
        y: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
        scale: { duration: 0.4, ease: "easeOut" },
      }}
    >
      <motion.div
        style={{ rotateX: tiltX, rotateY: tiltY, transformStyle: "preserve-3d" }}
        className="w-full h-full"
      >
        <svg viewBox="0 0 200 200" width="100%" height="100%">
          <defs>
            <radialGradient id="mascot-body" cx="35%" cy="30%" r="80%">
              <stop offset="0%" stopColor="#f4f5f8" />
              <stop offset="100%" stopColor="#c9cdd8" />
            </radialGradient>
            <radialGradient id="mascot-earglow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* outer ambient glow — brightens when excited */}
          <motion.ellipse
            cx="100"
            cy="110"
            rx="92"
            ry="86"
            fill="url(#mascot-earglow)"
            animate={{ opacity: excited ? 0.6 : 0.35 }}
            transition={{ duration: 0.3 }}
          />

          {/* ears */}
          <circle cx="24" cy="108" r="16" fill="#9095a3" />
          <circle cx="176" cy="108" r="18" fill="url(#mascot-earglow)" />
          <circle cx="176" cy="108" r="10" fill="#0a0a12" stroke="#22d3ee" strokeWidth="2" />

          {/* head */}
          <circle cx="100" cy="105" r="82" fill="url(#mascot-body)" stroke="#e4e6ec" strokeWidth="1.5" />
          {/* antenna — pulses brighter when excited */}
          <rect x="88" y="10" width="24" height="16" rx="8" fill="#3b3f4c" />
          <motion.rect
            x="94"
            y="4"
            width="12"
            height="10"
            rx="5"
            fill="#22d3ee"
            animate={{ opacity: excited ? 1 : 0.8 }}
          />

          {/* screen/face */}
          <rect x="34" y="58" width="132" height="106" rx="40" fill="#07070d" />

          {/* blush — only shows up when excited */}
          <motion.circle
            cx="52"
            cy="130"
            r="9"
            fill="#f472b6"
            animate={{ opacity: excited ? 0.55 : 0 }}
            transition={{ duration: 0.25 }}
          />
          <motion.circle
            cx="148"
            cy="130"
            r="9"
            fill="#f472b6"
            animate={{ opacity: excited ? 0.55 : 0 }}
            transition={{ duration: 0.25 }}
          />

          {/* eyebrows — tilt with cursor Y, raise together when excited */}
          <motion.path
            d="M62 92 Q72 84 84 90"
            stroke="#67e8f9"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.85"
            style={{ rotate: browTilt, y: excited ? -4 : 0, transformOrigin: "73px 88px" }}
          />
          <motion.path
            d="M116 90 Q128 84 138 92"
            stroke="#67e8f9"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.85"
            style={{ rotate: browTilt, y: excited ? -4 : 0, transformOrigin: "127px 88px" }}
          />

          {/* left eye */}
          <g>
            <motion.ellipse
              cx="73"
              cy="112"
              rx="17"
              ry="22"
              fill="#22d3ee"
              animate={{ opacity: excited ? 0.3 : 0.18, scale: eyeScale }}
              style={{ transformOrigin: "73px 112px" }}
            />
            <motion.ellipse
              cx="73"
              cy="112"
              rx="13"
              ry="18"
              fill="#38e0ff"
              animate={{ scaleY: blink || wink ? 0.06 : eyeScale, scaleX: eyeScale }}
              transition={{ duration: 0.12, ease: "easeInOut" }}
              style={{ transformOrigin: "73px 112px" }}
            />
            <motion.circle
              cx={73}
              cy={112}
              r="5"
              fill="#031017"
              style={{ x: pupilX, y: pupilY, opacity: blink || wink ? 0 : 1 }}
            />
          </g>

          {/* right eye — this is the one that winks on click */}
          <g>
            <motion.ellipse
              cx="127"
              cy="112"
              rx="17"
              ry="22"
              fill="#22d3ee"
              animate={{ opacity: excited ? 0.3 : 0.18, scale: eyeScale }}
              style={{ transformOrigin: "127px 112px" }}
            />
            <motion.ellipse
              cx="127"
              cy="112"
              rx="13"
              ry="18"
              fill="#38e0ff"
              animate={{ scaleY: blink ? 0.06 : wink ? 0.08 : eyeScale, scaleX: eyeScale }}
              transition={{ duration: 0.12, ease: "easeInOut" }}
              style={{ transformOrigin: "127px 112px" }}
            />
            <motion.circle
              cx={127}
              cy={112}
              r="5"
              fill="#031017"
              style={{ x: pupilX, y: pupilY, opacity: blink || wink ? 0 : 1 }}
            />
          </g>

          {/* mouth — flat idle -> gentle smile near -> open happy smile excited */}
          <motion.path
            stroke="#38e0ff"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            animate={{
              d: excited
                ? "M68 140 Q100 172 132 140 Q100 158 68 140 Z"
                : near
                  ? "M72 141 Q100 163 128 141"
                  : "M78 142 Q100 155 122 142",
              fill: excited ? "#0891b2" : "rgba(0,0,0,0)",
              fillOpacity: excited ? 0.5 : 0,
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </svg>
      </motion.div>
    </motion.div>
  )
}
