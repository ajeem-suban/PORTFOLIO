// The only script on the site (~1 KB). Everything else is static HTML + CSS.
//  1. Fills the masthead dateline with today's date.
//  2. Fades below-the-fold blocks in as they scroll into view.
// Nothing here is needed to read the page: with JavaScript off, or with
// "reduce motion" on, all content is simply visible.

const dateEl = document.getElementById("today")
if (dateEl) {
  try {
    const now = new Date()
    dateEl.textContent = new Intl.DateTimeFormat("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(now)
    dateEl.setAttribute("datetime", now.toISOString().slice(0, 10))
  } catch {
    /* keep the static fallback text */
  }
}

const blocks = Array.from(document.querySelectorAll<HTMLElement>(".reveal"))
const show = (el: Element) => el.classList.add("in")

if (
  blocks.length &&
  "IntersectionObserver" in window &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches
) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          show(entry.target)
          io.unobserve(entry.target)
        }
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
  )
  blocks.forEach((el) => io.observe(el))
  // safety net: never leave content hidden if the observer misbehaves
  window.setTimeout(() => blocks.forEach(show), 6000)
} else {
  blocks.forEach(show)
}
