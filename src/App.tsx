import { useEffect, useRef, useState, useCallback } from "react"
import ProfileCard from "./components/ProfileCard"
import ParticleField from "./components/ParticleField"
import NameMorphParticles from "./components/NameMorphParticles"
import TechMarquee from "./components/TechMarquee"
import AIHubDiagram from "./components/AIHubDiagram"
import Reveal, { projectAssembleVariant } from "./components/Reveal"
import { motion } from "framer-motion"
import {
  SiPython,
  SiFastapi,
  SiPytorch,
  SiHuggingface,
  SiLangchain,
  SiReact,
  SiOpencv,
  SiDocker,
  SiGithub,
  SiClaude,
  SiGooglegemini,
  SiPerplexity,
  SiDeepseek,
} from "react-icons/si"
import { FaLinkedin } from "react-icons/fa6"
import logo from "@/assets/logo.svg"
import { Database, Languages, Mail } from "lucide-react"
import OpenAiIcon from "./components/OpenAiIcon"

// ─── Cursor Trail ─────────────────────────────────────────────────────────────
function Cursor() {
  const spotRef = useRef<HTMLDivElement>(null)
  const pillRef = useRef<HTMLDivElement>(null)
  const pos = useRef({ x: 0, y: 0 })
  const lastSpawn = useRef(0)
  const trailId = useRef(0)
  const [pill, setPill] = useState(false)
  const [trail, setTrail] = useState<{ id: number; x: number; y: number }[]>(
    [],
  )

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY }
      if (spotRef.current) {
        spotRef.current.style.left = e.clientX + "px"
        spotRef.current.style.top = e.clientY + "px"
      }
      if (pillRef.current) {
        pillRef.current.style.left = e.clientX + "px"
        pillRef.current.style.top = e.clientY + "px"
      }

      // spawn a trail dot every ~35ms, self-removes after its fade animation
      const now = performance.now()
      if (now - lastSpawn.current > 35) {
        lastSpawn.current = now
        trailId.current += 1
        const id = trailId.current
        setTrail((t) => [...t.slice(-18), { id, x: e.clientX, y: e.clientY }])
        window.setTimeout(() => {
          setTrail((t) => t.filter((p) => p.id !== id))
        }, 550)
      }
    }

    const onEnterCard = (e: Event) => {
      const t = e.target as HTMLElement
      if (t.closest("[data-project-card]")) setPill(true)
    }
    const onLeaveCard = () => setPill(false)

    document.querySelectorAll("a,button,[data-project-card]").forEach((el) => {
      el.addEventListener("mouseenter", onEnterCard)
      el.addEventListener("mouseleave", onLeaveCard)
    })

    document.addEventListener("mousemove", onMove)
    return () => document.removeEventListener("mousemove", onMove)
  }, [])

  return (
    <>
      {/* ambient spotlight that follows the pointer across the page */}
      <div
        ref={spotRef}
        className="pointer-events-none fixed z-[9998] -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 600,
          height: 600,
          background:
            "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)",
          borderRadius: "50%",
        }}
      />

      {/* fading glow trail along the cursor's path */}
      {trail.map((p) => (
        <div
          key={p.id}
          className="pointer-events-none fixed z-[9997] rounded-full"
          style={{
            left: p.x - 4,
            top: p.y - 4,
            width: 8,
            height: 8,
            background:
              "radial-gradient(circle, rgba(167,139,250,0.9), rgba(139,92,246,0.3) 60%, transparent 75%)",
            boxShadow: "0 0 10px rgba(139,92,246,0.6)",
            animation: "cursor-trail 0.55s ease-out forwards",
          }}
        />
      ))}

      {/* pill label on project-card hover */}
      <div
        ref={pillRef}
        className="pointer-events-none fixed z-[9999]"
        style={{
          transform: "translate(16px, -50%)",
          background: "rgba(139,92,246,0.9)",
          color: "#fff",
          fontSize: 11,
          fontFamily: "Inter, sans-serif",
          fontWeight: 600,
          letterSpacing: "0.04em",
          padding: "4px 10px",
          borderRadius: 20,
          opacity: pill ? 1 : 0,
          transition: "opacity 0.2s ease",
          whiteSpace: "nowrap",
        }}
      >
        View Project →
      </div>
    </>
  )
}

// ─── Background Orbs ──────────────────────────────────────────────────────────
function BackgroundOrbs() {
  const wrap1 = useRef<HTMLDivElement>(null)
  const wrap2 = useRef<HTMLDivElement>(null)
  const wrap3 = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const wraps = [wrap1.current, wrap2.current, wrap3.current]
    const depths = [18, 30, 12] // px of parallax travel per orb, varies for depth
    const onMove = (e: MouseEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5
      const ny = e.clientY / window.innerHeight - 0.5
      wraps.forEach((w, i) => {
        if (!w) return
        w.style.transform = `translate(${nx * depths[i]}px, ${ny * depths[i]}px)`
      })
    }
    window.addEventListener("mousemove", onMove)
    return () => window.removeEventListener("mousemove", onMove)
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* each orb sits in its own parallax wrapper (JS-driven translate) so it
          doesn't fight with the orb's own CSS drift animation on the same element */}
      <div
        ref={wrap1}
        className="absolute"
        style={{ left: "-15%", top: "-10%", transition: "transform 0.6s ease-out" }}
      >
        <div
          className="animate-orb"
          style={{
            width: 700,
            height: 700,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(109,40,217,0.12) 0%, transparent 70%)",
            animationDuration: "25s",
          }}
        />
      </div>
      <div
        ref={wrap2}
        className="absolute"
        style={{ right: "-10%", top: "30%", transition: "transform 0.6s ease-out" }}
      >
        <div
          className="animate-orb"
          style={{
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)",
            animationDuration: "30s",
            animationDelay: "-8s",
          }}
        />
      </div>
      <div
        ref={wrap3}
        className="absolute"
        style={{ left: "30%", bottom: "-10%", transition: "transform 0.6s ease-out" }}
      >
        <div
          className="animate-orb"
          style={{
            width: 600,
            height: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)",
            animationDuration: "35s",
            animationDelay: "-15s",
          }}
        />
      </div>
    </div>
  )
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const links = [
    { label: "About", id: "about" },
    { label: "Stack", id: "stack" },
    { label: "Projects", id: "projects" },
    { label: "AI Toolkit", id: "ai-toolkit" },
    { label: "Contact", id: "contact" },
  ]

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={scrolled ? {} : {}}
    >
      <div
        className={`transition-all duration-300 ${scrolled ? "nav-blur" : ""}`}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="#hero" className="flex items-center">
            <img src={logo} alt="AS logo" className="h-9 w-9" />
          </a>
          <div className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <a
                key={l.id}
                href={`#${l.id}`}
                className="text-sm font-medium text-gray-400 hover:text-purple-300 transition-colors duration-200"
                style={{
                  fontFamily: "Inter, sans-serif",
                  letterSpacing: "0.04em",
                }}
              >
                {l.label}
              </a>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300"
              style={{
                border: "1px solid rgba(139,92,246,0.4)",
                color: "#c4b5fd",
                fontFamily: "Inter, sans-serif",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(139,92,246,0.8)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(139,92,246,0.4)")}
            >
              Resume
            </a>
            <a
              href="#contact"
              className="px-5 py-2 rounded-full text-sm font-semibold text-white transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                boxShadow: "0 0 20px rgba(139,92,246,0.3)",
                fontFamily: "Inter, sans-serif",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 0 30px rgba(139,92,246,0.6)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 0 20px rgba(139,92,246,0.3)")
              }
            >
              Hire Me
            </a>
          </div>
        </div>
      </div>
    </nav>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* grid lines */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
          linear-gradient(rgba(139,92,246,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(139,92,246,0.03) 1px, transparent 1px)
        `,
          backgroundSize: "80px 80px",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        {/* left */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs font-mono font-medium text-purple-300"
            style={{
              background: "rgba(139,92,246,0.1)",
              border: "1px solid rgba(139,92,246,0.3)",
              letterSpacing: "0.1em",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse inline-block" />
            Available for collaboration
          </div>

          <h1
            className="font-display font-black leading-none mb-4"
            style={{ letterSpacing: "-0.03em" }}
          >
            <span
              className="text-white block"
              style={{ fontSize: "clamp(1.3rem,2.6vw,1.75rem)", fontWeight: 700 }}
            >
              Hi, I'm
            </span>
            <span
              className="text-gradient"
              style={{ fontSize: "clamp(3rem,7vw,5.5rem)" }}
            >
              AJEEM
            </span>
            <span
              className="text-gradient"
              style={{ fontSize: "clamp(1.8rem,4.2vw,3.3rem)" }}
            >
              .
            </span>
            <span
              className="text-white"
              style={{ fontSize: "clamp(1.8rem,4.2vw,3.3rem)" }}
            >
              S
            </span>
          </h1>


          <p
            className="text-lg text-gray-300 mb-2 font-medium"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            AI & Data Science Developer · Founder, TAMIL-AI
          </p>
          <p
            className="text-base text-gray-400 mb-8 leading-relaxed max-w-md"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            I build AI/ML and NLP systems — RAG pipelines, LLM applications,
            and OCR tools. My flagship project, <strong className="text-gray-300 font-medium">TAMIL-AI</strong>, is a
            Tamil-first NLP platform bridging Chola-era inscriptions with
            modern language AI. 3rd-year B.Tech AI &amp; Data Science student
            at Dhanalakshmi Srinivasan University.
          </p>

          <div className="flex flex-wrap gap-4">
            <a
              href="#projects"
              className="px-7 py-3 rounded-full font-semibold text-white text-sm transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                boxShadow: "0 0 24px rgba(139,92,246,0.35)",
                fontFamily: "Inter, sans-serif",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.03)"
                e.currentTarget.style.boxShadow =
                  "0 0 40px rgba(139,92,246,0.6)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)"
                e.currentTarget.style.boxShadow =
                  "0 0 24px rgba(139,92,246,0.35)"
              }}
            >
              View Projects
            </a>
            <a
              href="#contact"
              className="px-7 py-3 rounded-full font-semibold text-sm transition-all duration-300"
              style={{
                border: "1px solid rgba(139,92,246,0.4)",
                color: "#c4b5fd",
                background: "rgba(139,92,246,0.05)",
                fontFamily: "Inter, sans-serif",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(139,92,246,0.12)"
                e.currentTarget.style.borderColor = "rgba(139,92,246,0.7)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(139,92,246,0.05)"
                e.currentTarget.style.borderColor = "rgba(139,92,246,0.4)"
              }}
            >
              Contact Me
            </a>
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="px-7 py-3 rounded-full font-semibold text-sm transition-all duration-300 flex items-center gap-2"
              style={{
                border: "1px solid rgba(139,92,246,0.4)",
                color: "#c4b5fd",
                background: "rgba(139,92,246,0.05)",
                fontFamily: "Inter, sans-serif",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(139,92,246,0.12)"
                e.currentTarget.style.borderColor = "rgba(139,92,246,0.7)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(139,92,246,0.05)"
                e.currentTarget.style.borderColor = "rgba(139,92,246,0.4)"
              }}
            >
              Resume ↓
            </a>
          </div>

          {/* stats */}
          <div className="flex gap-8 mt-10">
            {[
              { value: "B.Tech", label: "AI & DS" },
              { value: "TAMIL-AI", label: "FLAGSHIP PROJECT" },
            ].map((s) => (
              <div key={s.label}>
                <div className="font-display font-black text-2xl text-gradient-white">
                  {s.value}
                </div>
                <div
                  className="text-xs text-gray-400 mt-0.5"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    letterSpacing: "0.08em",
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* right */}
        <div className="flex justify-center items-center">
          <ProfileCard imageUrl="/profile.jpg" />
        </div>
      </div>

      {/* scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-xs text-gray-400 font-mono tracking-widest">
          SCROLL
        </span>
        <div className="w-px h-8 bg-gradient-to-b from-transparent via-purple-600 to-transparent" />
      </div>
    </section>
  )
}

// ─── About ────────────────────────────────────────────────────────────────────
function About() {
  const skillGroups = [
    { label: "AI / ML", items: ["Tamil NLP", "RAG Systems", "LLM Infra", "OCR/CV"] },
    { label: "Backend", items: ["FastAPI", "REST APIs", "SQLite", "Docker"] },
    { label: "AI Infra", items: ["ChromaDB", "Ollama", "Hugging Face"] },
    { label: "Frontend", items: ["React", "TypeScript", "Vite"] },
  ]

  return (
    <section id="about" className="relative py-28 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-5 gap-12 items-center">
        {/* avatar */}
        <div className="md:col-span-2 flex justify-center">
          <div className="relative" style={{ perspective: 1000 }}>
            {/* particle name-morph: AJEEM -> AI -> DEVELOPER, looping.
                No card/box around it on purpose — it renders straight
                onto the section background so the glow isn't clipped
                or muddied by a panel behind it. */}
            <div className="w-80 h-48 md:w-[26rem] md:h-56">
              <NameMorphParticles />
            </div>
            {/* floating badge */}
            <div
              className="absolute -bottom-4 -right-4 px-4 py-2 rounded-xl text-xs font-mono font-medium text-purple-300 glass-card"
              style={{ border: "1px solid rgba(139,92,246,0.3)" }}
            >
              Tamil AI
            </div>
          </div>
        </div>

        {/* text */}
        <div className="md:col-span-3">
          <div className="text-xs font-mono text-purple-400 tracking-widest mb-3">
            ABOUT ME
          </div>
          <h2
            className="font-display font-black text-4xl md:text-5xl text-white mb-6"
            style={{ letterSpacing: "-0.02em", lineHeight: 1.1 }}
          >
            Ajeem Suban — AI &amp; Data
            <br />
            <span className="text-gradient">Science Developer</span>
          </h2>
          <p
            className="text-gray-400 leading-relaxed mb-6"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            I'm a 3rd-year B.Tech AI &amp; Data Science student at
            Dhanalakshmi Srinivasan University and the founder/creator of{" "}
            <strong className="text-purple-300 font-medium">TAMIL-AI</strong>,
            a Tamil-first NLP/RAG platform. I design and build AI/ML systems —
            translation pipelines, retrieval-augmented generation, and OCR —
            with a focus on closing the gap between modern LLM capability and
            underrepresented languages like Tamil.
          </p>
          <p
            className="text-gray-400 leading-relaxed mb-8"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Beyond TAMIL-AI, I build agentic and applied-AI systems: TITAN, a
            personal AI workspace; VCH-AGENT, a predictive content-intelligence
            system; and smaller tools like an emergency-dispatch prototype and
            a computer-vision eye-care daemon. Code and write-ups for all of
            these are on{" "}
            <a
              href="https://github.com/ajeem-suban"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-300 hover:text-purple-200 underline underline-offset-2"
            >
              GitHub
            </a>
            .
          </p>

          <div className="flex flex-col gap-3">
            {skillGroups.map((g) => (
              <div key={g.label} className="flex flex-wrap items-center gap-2">
                <span
                  className="text-[10px] font-mono text-gray-400 tracking-widest w-20 flex-shrink-0"
                  style={{ letterSpacing: "0.08em" }}
                >
                  {g.label.toUpperCase()}
                </span>
                {g.items.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1.5 rounded-full text-xs font-medium text-purple-300"
                    style={{
                      background: "rgba(139,92,246,0.1)",
                      border: "1px solid rgba(139,92,246,0.25)",
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Tech Stack ───────────────────────────────────────────────────────────────
function TechStack() {
  const tech = [
    { name: "Python", icon: SiPython, color: "#3776ab" },
    { name: "FastAPI", icon: SiFastapi, color: "#009688" },
    { name: "PyTorch", icon: SiPytorch, color: "#ee4c2c" },
    { name: "HuggingFace", icon: SiHuggingface, color: "#ffcc4d" },
    { name: "LangChain", icon: SiLangchain, color: "#1c3c3c" },
    // ChromaDB has no simple-icons brand logo — using a neutral DB icon
    { name: "ChromaDB", icon: Database, color: "#f97316" },
    { name: "React", icon: SiReact, color: "#61dafb" },
    // IndicTrans2 has no brand logo — using a neutral translation icon
    { name: "IndicTrans2", icon: Languages, color: "#8b5cf6" },
    { name: "OpenCV", icon: SiOpencv, color: "#5c3ee8" },
    { name: "Docker", icon: SiDocker, color: "#2496ed" },
  ]

  return (
    <section id="stack" className="relative py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-xs font-mono text-purple-400 tracking-widest mb-3">
            TECH STACK
          </div>
          <h2
            className="font-display font-black text-4xl md:text-5xl text-white"
            style={{ letterSpacing: "-0.02em" }}
          >
            Tools of the <span className="text-gradient">trade</span>
          </h2>
        </div>

        <TechMarquee items={tech} />
      </div>
    </section>
  )
}

// ─── TiltCard ─────────────────────────────────────────────────────────────────
function TiltCard({
  children,
  className = "",
  intensity = 8,
  showPill = false,
  rounded = "rounded-2xl",
}: {
  children: React.ReactNode
  className?: string
  intensity?: number
  showPill?: boolean
  rounded?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  const onMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      el.style.transform = `perspective(800px) rotateY(${x * intensity}deg) rotateX(${-y * intensity}deg) scale(1.015) translateZ(10px)`
      el.style.boxShadow = `${x * -20}px ${y * -20}px 40px rgba(139,92,246,0.2), 0 0 60px rgba(139,92,246,0.1)`
    },
    [intensity],
  )

  const onLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.transform =
      "perspective(800px) rotateY(0deg) rotateX(0deg) scale(1) translateZ(0px)"
    el.style.boxShadow = ""
  }, [])

  return (
    <div
      ref={ref}
      data-project-card={showPill ? "true" : undefined}
      className={`tilt-card glass-card ${rounded} transition-shadow duration-300 ${className}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ transformStyle: "preserve-3d" }}
    >
      {children}
    </div>
  )
}

// ─── Projects ─────────────────────────────────────────────────────────────────
function Projects() {
  const projects = [
    {
      name: "TAMIL-AI.ME",
      tagline: "Flagship — Tamil-first NLP/RAG platform",
      role: "Founder & Developer",
      desc: "Problem: Tamil has no first-class NLP/RAG stack comparable to English. Approach: a FastAPI + ChromaDB retrieval pipeline over a Thirukkural/Sangam-literature corpus, using IndicTrans2 for translation. Includes KalVettu, an OCR sub-module (TrOCR + OpenCV) aimed at digitizing Chola-era stone inscriptions.",
      tags: ["FastAPI", "ChromaDB", "React", "IndicTrans2", "OCR", "RAG"],
      color: "#8b5cf6",
      status: "In Progress",
      featured: true,
      github: "https://github.com/ajeem-suban/Project-TAMIL-AI.ME",
      demo: "", // TODO(Ajeem): add live demo URL or a short demo GIF path here
    },
    {
      name: "TITAN",
      tagline: "Featured — Personal AI workspace",
      role: "Creator & Developer",
      desc: "Problem: coordinating multiple personal AI projects needs one control surface. Approach: a React/TypeScript frontend acting as a system control hub and notification center for agentic projects, with SECRAIN as its intelligence/memory layer over a WebSocket + REST backend.",
      tags: ["React", "TypeScript", "WebSocket", "AI Agents"],
      color: "#06b6d4",
      status: "Active",
      featured: true,
      github: "https://github.com/ajeem-suban/Project-Assistant",
      demo: "", // TODO(Ajeem): add live demo URL or a short demo GIF path here
    },
    {
      name: "VCH-AGENT",
      tagline: "Featured — Predictive content intelligence",
      role: "Creator & Developer",
      desc: "Problem: trending-content tools report what's already popular, too late to act on. Approach: a local-first pipeline that extracts early engagement-velocity signals from fresh Reddit/YouTube posts, uses a local LLM for content understanding, and ranks predicted viral score before peak performance.",
      tags: ["Python", "Predictive ML", "SQLite", "Reddit API", "YouTube API"],
      color: "#f97316",
      status: "In Progress",
      featured: true,
      github: "https://github.com/ajeem-suban/VCH-AGENT",
      demo: "", // TODO(Ajeem): add live demo URL or a short demo GIF path here
    },
    {
      name: "SECRAIN",
      tagline: "Local-first AI second brain",
      role: "Creator & Developer",
      desc: "Problem: chat-first AI tools don't retain or reason over a user's own knowledge. Approach: a FastAPI + SQLAlchemy backend with a memory engine, ChromaDB vector search, and local inference via Ollama — built as the shared intelligence layer behind TITAN.",
      tags: ["FastAPI", "Ollama", "ChromaDB", "SQLite"],
      color: "#06b6d4",
      status: "In Progress",
      github: "https://github.com/ajeem-suban/SECRAIN",
      demo: "", // TODO(Ajeem): add live demo URL or a short demo GIF path here
    },
    {
      name: "AIRES",
      tagline: "AI emergency-dispatch prototype",
      role: "Developer",
      desc: "Problem: emergency ambulance dispatch/routing is often manual and slow. Approach: a FastAPI + React prototype for real-time re-routing and hospital coordination, built as a college hackathon-qualifier project.",
      tags: ["Python", "FastAPI", "React", "Real-time"],
      color: "#ef4444",
      status: "In Progress",
      github: "https://github.com/ajeem-suban/AIRES-AI",
      demo: "", // TODO(Ajeem): add live demo URL or a short demo GIF path here
    },
    {
      name: "ROGERS",
      tagline: "AI Student Project Orchestrator",
      role: "Creator & Developer",
      desc: "Problem: students have raw project ideas but no structured path from concept to a research-backed, buildable spec. Approach: a hybrid web + CLI platform that orchestrates multiple local and cloud LLMs to turn a one-line idea into a structured project plan, with support for code generation and debugging.",
      tags: ["FastAPI", "React", "TypeScript", "Tailwind", "LLM Orchestration"],
      color: "#3b82f6",
      status: "In Progress",
      github: "https://github.com/ajeem-suban/ROGERS",
      demo: "", // TODO(Ajeem): add live demo URL or a short demo GIF path here
    },
    {
      name: "Eye-Care-Tool",
      tagline: "Context-aware 20-20-20 daemon",
      role: "Developer",
      desc: "Problem: the 20-20-20 eye-care rule is easy to forget during long screen sessions. Approach: a Python desktop daemon (v1.0.0, shipped) using OpenCV/MediaPipe webcam-based fatigue detection to time reminders, with Tamil/Indic notification support.",
      tags: ["OpenCV", "MediaPipe", "Python", "CV"],
      color: "#10b981",
      status: "v1.0.0",
      github: "https://github.com/ajeem-suban/Eye-Care-Tool",
      demo: "", // TODO(Ajeem): add live demo URL or a short demo GIF path here
    },
    {
      name: "news-bot",
      tagline: "Automated Telegram news digest",
      role: "Developer",
      desc: "Problem: staying current across many news categories takes manual effort. Approach: a multi-category RSS ingestion pipeline with Gemini-based summarization, scheduled via GitHub Actions cron, delivering digests to Telegram.",
      tags: ["Telegram API", "Gemini", "RSS", "GitHub Actions"],
      color: "#f59e0b",
      status: "Running",
      github: "https://github.com/ajeem-suban/news-bot",
      demo: "", // TODO(Ajeem): add live demo URL or a short demo GIF path here
    },
    {
      name: "TimeTamil",
      tagline: "Historical Tamil reconstruction",
      role: "Developer",
      desc: "Problem: no accessible tool shows how a modern Tamil name would have appeared in an earlier historical stage of the language. Approach: a rule-based historical-linguistics engine (not a translator) reconstructing Sangam-era forms — early research-stage.",
      tags: ["NLP", "Tamil", "Linguistics", "Python"],
      color: "#ec4899",
      status: "Research",
      github: "#", // TODO: add repo link once pushed
    },
  ]

  return (
    <section id="projects" className="relative py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-xs font-mono text-purple-400 tracking-widest mb-3">
            SELECTED WORK
          </div>
          <h2
            className="font-display font-black text-4xl md:text-5xl text-white"
            style={{ letterSpacing: "-0.02em" }}
          >
            Projects that <span className="text-gradient">matter</span>
          </h2>
        </div>

        <motion.div
          className="grid md:grid-cols-2 gap-5"
          style={{ perspective: 1000 }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.1 }}
          variants={{ show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } } }}
        >
          {projects.map((p, i) => (
            <motion.div
              key={i}
              variants={projectAssembleVariant(i)}
              className={p.featured ? "md:col-span-2" : ""}
            >
            <TiltCard showPill>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3
                        className="project-title-pop font-display font-bold text-xl text-white"
                        style={{ letterSpacing: "-0.01em" }}
                      >
                        {p.name.split("").map((ch, ci) => (
                          <span
                            key={ci}
                            className="letter"
                            style={{ transitionDelay: `${ci * 12}ms` }}
                          >
                            {ch === " " ? "\u00A0" : ch}
                          </span>
                        ))}
                      </h3>
                      {p.featured && (
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold tracking-wider text-white flex-shrink-0"
                          style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
                        >
                          FEATURED
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-purple-300">{p.tagline}</p>
                    {p.role && (
                      <p
                        className="text-xs text-gray-400 mt-0.5"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        {p.role}
                      </p>
                    )}
                  </div>
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-mono font-medium flex-shrink-0"
                    style={{
                      background: `${p.color}22`,
                      color: p.color,
                      border: `1px solid ${p.color}44`,
                    }}
                  >
                    {p.status}
                  </span>
                </div>

                <p
                  className="text-sm text-gray-400 leading-relaxed mb-5"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {p.desc}
                </p>

                <div className="flex flex-wrap gap-2 mb-5">
                  {p.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 rounded-md text-xs text-gray-400"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        fontFamily: "JetBrains Mono, monospace",
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="flex gap-3">
                  <a
                    href={p.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-medium text-purple-300 transition-colors hover:text-purple-200"
                    style={{ fontFamily: "Inter, sans-serif" }}
                    onClick={(e) => {
                      if (p.github === "#") e.preventDefault()
                    }}
                  >
                    <span>{p.github === "#" ? "Repo (soon)" : "GitHub"}</span>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                    </svg>
                  </a>
                  {p.demo && (
                    <a
                      href={p.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-medium transition-colors"
                      style={{ fontFamily: "Inter, sans-serif", color: p.color }}
                    >
                      <span>Live Demo</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </TiltCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ─── AI Toolkit ───────────────────────────────────────────────────────────────
function AIToolkit() {
  const tools = [
    { name: "Claude", icon: SiClaude, color: "#D97757", role: "Architecture & code" },
    { name: "ChatGPT", icon: OpenAiIcon, color: "#74AA9C", role: "Ideation & drafting" },
    { name: "Gemini", icon: SiGooglegemini, color: "#8E75B2", role: "Research & summarization" },
    { name: "Perplexity", icon: SiPerplexity, color: "#20808D", role: "Sourced research" },
    { name: "DeepSeek", icon: SiDeepseek, color: "#4D6BFE", role: "Reasoning & study" },
  ]

  const skills = [
    {
      title: "Build",
      detail:
        "Scaffold, debug, and ship production code faster by pairing with AI on architecture decisions and implementation.",
    },
    {
      title: "Develop",
      detail:
        "Iterate on system design and RAG pipelines with AI as a sounding board for trade-offs and edge cases.",
    },
    {
      title: "Research",
      detail:
        "Pull sourced, current information across tools to ground decisions instead of relying on stale assumptions.",
    },
    {
      title: "Study",
      detail:
        "Turn dense papers and docs into working understanding — using AI to explain, quiz, and stress-test what I know.",
    },
  ]

  return (
    <section id="ai-toolkit" className="relative py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-xs font-mono text-purple-400 tracking-widest mb-3">
            AI-AUGMENTED WORKFLOW
          </div>
          <h2
            className="font-display font-black text-4xl md:text-5xl text-white"
            style={{ letterSpacing: "-0.02em" }}
          >
            Building <span className="text-gradient">with AI</span>
          </h2>
          <p
            className="text-gray-400 mt-4 max-w-xl mx-auto"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            I connect multiple AI tools into my actual workflow — not as a
            gimmick, but as leverage to build, research, and learn faster.
          </p>
        </div>

        {/* hub-and-spoke tool diagram */}
        <div className="mb-14">
          <AIHubDiagram tools={tools} />
        </div>

        {/* skill grid */}
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
          {skills.map((s) => (
            <TiltCard
              key={s.title}
              intensity={8}
              rounded="rounded-xl"
              className="p-6"
            >
              <h3 className="font-display font-bold text-white mb-2">
                {s.title}
              </h3>
              <p
                className="text-sm text-gray-400 leading-relaxed"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {s.detail}
              </p>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Contact ──────────────────────────────────────────────────────────────────
function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" })

  const links = [
    {
      label: "GitHub",
      icon: SiGithub,
      href: "https://github.com/ajeem-suban",
      desc: "@ajeem-suban",
    },
    {
      label: "LinkedIn",
      icon: FaLinkedin,
      href: "https://www.linkedin.com/in/ajeem-suban/",
      desc: "ajeem-suban",
    },
    {
      label: "Hugging Face",
      icon: SiHuggingface,
      href: "https://huggingface.co/AJEEM-SUBAN",
      desc: "AJEEM-SUBAN",
    },
    {
      label: "Email",
      icon: Mail,
      href: "mailto:ajeemsuban060@gmail.com",
      desc: "ajeemsuban060@gmail.com",
    },
  ]

  const mailtoHref = () => {
    const subject = encodeURIComponent(`Portfolio contact from ${form.name || "..."}`)
    const bodyLines = [
      form.email ? `From: ${form.email}` : "",
      "",
      form.message || "",
    ].filter(Boolean)
    const body = encodeURIComponent(bodyLines.join("\n"))
    return `mailto:ajeemsuban060@gmail.com?subject=${subject}&body=${body}`
  }

  return (
    <section id="contact" className="relative py-28 px-6">
      {/* spotlight intensified */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-96 h-96 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-xs font-mono text-purple-400 tracking-widest mb-3">
            GET IN TOUCH
          </div>
          <h2
            className="font-display font-black text-4xl md:text-5xl text-white"
            style={{ letterSpacing: "-0.02em" }}
          >
            Let's build something{" "}
            <span className="text-gradient">together</span>
          </h2>
          <p
            className="text-gray-400 mt-4 max-w-md mx-auto"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Open to collaborations, research partnerships, and interesting
            problems in Indic AI.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          {/* form */}
          <div className="md:col-span-3 glass-card rounded-2xl p-8">
            <form className="flex flex-col gap-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label
                    className="text-xs text-gray-400 font-medium block mb-2"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    required
                    placeholder="Your name"
                    className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all duration-200"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(139,92,246,0.2)",
                      fontFamily: "Inter, sans-serif",
                    }}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor =
                        "rgba(139,92,246,0.6)")
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor =
                        "rgba(139,92,246,0.2)")
                    }
                  />
                </div>
                <div>
                  <label
                    className="text-xs text-gray-400 font-medium block mb-2"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    required
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all duration-200"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(139,92,246,0.2)",
                      fontFamily: "Inter, sans-serif",
                    }}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor =
                        "rgba(139,92,246,0.6)")
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor =
                        "rgba(139,92,246,0.2)")
                    }
                  />
                </div>
              </div>
              <div>
                <label
                  className="text-xs text-gray-400 font-medium block mb-2"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Message
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, message: e.target.value }))
                  }
                  required
                  rows={5}
                  placeholder="Tell me about your project or idea..."
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all duration-200 resize-none"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(139,92,246,0.2)",
                    fontFamily: "Inter, sans-serif",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "rgba(139,92,246,0.6)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "rgba(139,92,246,0.2)")
                  }
                />
              </div>
              <a
                href={mailtoHref()}
                className="py-3.5 rounded-xl font-semibold text-white text-sm text-center transition-all duration-300"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                  boxShadow: "0 0 24px rgba(139,92,246,0.3)",
                  fontFamily: "Inter, sans-serif",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 0 40px rgba(139,92,246,0.5)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 0 24px rgba(139,92,246,0.3)"
                }}
              >
                Send Message →
              </a>
            </form>
          </div>

          {/* links */}
          <div className="md:col-span-2 flex flex-col gap-4">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="glass-card rounded-xl p-5 flex items-center gap-4 transition-shadow duration-300"
                style={{ transformStyle: "preserve-3d" }}
                onMouseMove={(e) => {
                  const el = e.currentTarget
                  const rect = el.getBoundingClientRect()
                  const x = (e.clientX - rect.left) / rect.width - 0.5
                  const y = (e.clientY - rect.top) / rect.height - 0.5
                  el.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateZ(4px)`
                  el.style.borderColor = "rgba(139,92,246,0.4)"
                  el.style.boxShadow = `0 12px 30px rgba(139,92,246,0.15)`
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget
                  el.style.transform = ""
                  el.style.borderColor = "rgba(139,92,246,0.2)"
                  el.style.boxShadow = ""
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-purple-300 font-mono text-lg flex-shrink-0"
                  style={{
                    background: "rgba(139,92,246,0.1)",
                    border: "1px solid rgba(139,92,246,0.25)",
                  }}
                >
                  <l.icon size={18} />
                </div>
                <div>
                  <div className="font-display font-semibold text-white text-sm">
                    {l.label}
                  </div>
                  <div
                    className="text-xs text-gray-400 mt-0.5"
                    style={{ fontFamily: "JetBrains Mono, monospace" }}
                  >
                    {l.desc}
                  </div>
                </div>
              </a>
            ))}

            <div
              className="glass-card rounded-xl p-5 mt-2"
              style={{ border: "1px solid rgba(139,92,246,0.2)" }}
            >
              <div className="text-xs font-mono text-purple-400 tracking-widest mb-3">
                STATUS
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
                <span
                  className="text-sm text-gray-300"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Available for opportunities
                </span>
              </div>
              <p
                className="text-xs text-gray-400 mt-2 leading-relaxed"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Open to internships, research collaborations, and freelance
                Tamil AI projects.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="relative py-8 px-6 border-t border-purple-950/50">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="font-display font-bold text-lg text-gradient">
          &lt;Ajeem Suban/&gt;
        </span>
        <p
          className="text-xs text-gray-400"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          © 2026 Ajeem Suban · AI &amp; Data Science Developer · Founder, TAMIL-AI
        </p>
        <p
          className="text-xs text-gray-400 font-mono"
          style={{ fontFamily: "JetBrains Mono, monospace" }}
        >
          Built with React + Vite
        </p>
      </div>
    </footer>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <div className="relative min-h-screen bg-[#0A0A0F] noise-bg overflow-x-hidden">
      <BackgroundOrbs />
      <ParticleField />
      <Cursor />
      <Nav />

      <main>
        <Hero />
        <Reveal style="fade-up">
          <About />
        </Reveal>
        <Reveal style="tech-slide">
          <TechStack />
        </Reveal>
        <Reveal style="projects-tilt">
          <Projects />
        </Reveal>
        <Reveal style="hub-radial">
          <AIToolkit />
        </Reveal>
        <Reveal style="contact-blur">
          <Contact />
        </Reveal>
      </main>

      <Footer />
    </div>
  )
}
