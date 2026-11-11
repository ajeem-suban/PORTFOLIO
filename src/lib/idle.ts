/**
 * Runs `cb` once the page has finished loading, an optional `delay` has
 * elapsed, AND the browser reports idle.
 *
 * Used for work that is purely decorative or below the fold (the WebGL
 * particle background, the GSAP marquee). Starting it after `load` keeps its
 * network + main-thread cost out of the window in which the hero content is
 * downloading, parsing and painting — which is what LCP / TBT measure — while
 * still running within a couple of seconds on a normal device.
 *
 * `delay` matters because the hero text fades in over ~1.1s after load; a
 * large chunk requested during that fade lands on the LCP critical path
 * (Lighthouse charges any request that starts before the LCP paint to it).
 *
 * Falls back to a short timeout where requestIdleCallback is missing (Safari).
 * Returns a cancel function for use as a useEffect cleanup.
 */
export function runWhenIdle(
  cb: () => void,
  timeout = 1500,
  delay = 0,
): () => void {
  let cancelled = false
  let idleId = 0
  let timerId = 0
  let delayId = 0

  const schedule = () => {
    if (cancelled) return
    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(
        () => {
          if (!cancelled) cb()
        },
        { timeout },
      )
    } else {
      timerId = window.setTimeout(() => {
        if (!cancelled) cb()
      }, 200)
    }
  }

  const afterLoad = () => {
    if (cancelled) return
    if (delay > 0) delayId = window.setTimeout(schedule, delay)
    else schedule()
  }

  if (document.readyState === "complete") {
    afterLoad()
  } else {
    window.addEventListener("load", afterLoad, { once: true })
  }

  return () => {
    cancelled = true
    window.removeEventListener("load", afterLoad)
    if (idleId) window.cancelIdleCallback(idleId)
    if (timerId) window.clearTimeout(timerId)
    if (delayId) window.clearTimeout(delayId)
  }
}
