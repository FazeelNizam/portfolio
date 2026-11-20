import React, { useCallback, useEffect, useRef, useState } from 'react'
import { FaGithub, FaExternalLinkAlt, FaChevronLeft, FaChevronRight, FaExpandAlt } from 'react-icons/fa'
import { getMedia, ResponsivePicture } from '../../lib/media'
import { onBackground } from '../../three/backgroundStore'
import { onFrame, quality } from '../../lib/ticker'
import { getDevice, prefersReducedMotion } from '../../lib/device'
import { useMediaQuery } from '../../hooks/useMedia'

const statusTone = (s = '') => (/progress|ongoing/i.test(s) ? 'live' : /planned/i.test(s) ? 'planned' : 'done')

function Links({ project, onDetails, compact }) {
  return (
    <div className="pj-links">
      <button type="button" className="btn btn--primary" onClick={onDetails}>
        <FaExpandAlt aria-hidden="true" /> Details<span className="sr-only">: {project.title}</span>
      </button>
      {project.githubUrl && (
        <a className={`btn btn--ghost${compact ? ' btn--icon' : ''}`} href={project.githubUrl} target="_blank" rel="noopener noreferrer" aria-label={compact ? `Source code of ${project.title}` : undefined}>
          <FaGithub aria-hidden="true" />
          {!compact && <span>Code</span>}
        </a>
      )}
      {project.liveUrl && (
        <a className={`btn btn--ghost${compact ? ' btn--icon' : ''}`} href={project.liveUrl} target="_blank" rel="noopener noreferrer" aria-label={compact ? `Live demo of ${project.title}` : undefined}>
          <FaExternalLinkAlt aria-hidden="true" />
          {!compact && <span>Live</span>}
        </a>
      )}
    </div>
  )
}

/* ─────────────── lightweight 2D layout (mobile / low-end / no WebGL / reduced motion) ─────────────── */
function ProjectCards({ projects, onOpen }) {
  const trackRef = useRef(null)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const track = trackRef.current
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const w = track.firstElementChild ? track.firstElementChild.offsetWidth : 1
        setIndex(Math.round(track.scrollLeft / (w + 16)))
      })
    }
    track.addEventListener('scroll', onScroll, { passive: true })
    return () => track.removeEventListener('scroll', onScroll)
  }, [])

  const go = (i) => {
    const track = trackRef.current
    const el = track.children[Math.max(0, Math.min(projects.length - 1, i))]
    if (el) track.scrollTo({ left: el.offsetLeft - track.offsetLeft, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }

  return (
    <div className="pj-cards">
      <ol className="pj-cards__track" ref={trackRef} aria-label="Projects">
        {projects.map((p, i) => (
          <li key={p.id} className="pj-card" aria-label={`${i + 1} of ${projects.length}`}>
            <button type="button" className="pj-card__media" onClick={() => onOpen(p)} aria-label={`Open details: ${p.title}`}>
              <ResponsivePicture src={p.image} alt="" sizes="(max-width: 767px) 86vw, 420px" />
              <span className="pj-card__status" data-tone={statusTone(p.status)}>
                {p.status}
              </span>
            </button>
            <div className="pj-card__body">
              <p className="pj-card__cat">{p.category}</p>
              <h3 className="pj-card__title">{p.title}</h3>
              <p className="pj-card__desc">{p.description}</p>
              <ul className="pj-pills" aria-label="Technologies">
                {p.technologies.slice(0, 4).map((t) => (
                  <li key={t} className="pill">
                    {t}
                  </li>
                ))}
              </ul>
              <Links project={p} onDetails={() => onOpen(p)} compact />
            </div>
          </li>
        ))}
      </ol>
      <div className="pj-cards__nav">
        <button type="button" className="btn btn--ghost btn--icon" onClick={() => go(index - 1)} disabled={index <= 0} aria-label="Previous project">
          <FaChevronLeft aria-hidden="true" />
        </button>
        <span className="pj-count" aria-live="polite">
          {String(index + 1).padStart(2, '0')} <span aria-hidden="true">/</span>
          <span className="sr-only">of</span> {String(projects.length).padStart(2, '0')}
        </span>
        <button type="button" className="btn btn--ghost btn--icon" onClick={() => go(index + 1)} disabled={index >= projects.length - 1} aria-label="Next project">
          <FaChevronRight aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

/* ─────────────── WebGL curved gallery ─────────────── */
function ProjectStage({ projects, onOpen, onFail }) {
  const stageRef = useRef(null)
  const state = useRef({ target: 0, current: 0, velocity: 0, hover: -1, drag: null, wheelT: 0, docTop: 0, h: 0, w: 0, left: 0, inView: false })
  const glRef = useRef(null)
  const [active, setActive] = useState(0)
  const n = projects.length
  const clamp = useCallback((v) => Math.max(0, Math.min(n - 1, v)), [n])

  const goTo = useCallback(
    (i) => {
      state.current.target = clamp(i)
    },
    [clamp]
  )

  // set up the GL view inside the shared background renderer
  useEffect(() => {
    const stage = stageRef.current
    const st = state.current
    let gl = null
    let removeView = null
    let disposed = false
    const measure = () => {
      const r = stage.getBoundingClientRect()
      st.docTop = r.top + window.scrollY
      st.left = r.left
      st.w = r.width
      st.h = r.height
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(stage)
    ro.observe(document.body)
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !st.inView) quality.active++
      if (!e.isIntersecting && st.inView) quality.active--
      st.inView = e.isIntersecting
    }, { rootMargin: '100px' })
    io.observe(stage)

    const unsub = onBackground(async (bg) => {
      if (gl || disposed) return
      try {
        const { default: ProjectCarouselGL } = await import(/* webpackChunkName: "three-projects" */ '../../three/ProjectCarouselGL')
        if (disposed) return
        const tier = quality.tier
        gl = new ProjectCarouselGL({
          projects,
          imageFor: (p) => {
            const m = getMedia(p.image)
            return m ? { url: m.pick(tier >= 3 ? 1280 : 640), ratio: m.ratio } : { url: p.image }
          },
        })
        glRef.current = gl
        removeView = bg.addView({
          isActive: () => st.inView,
          getRect: () => {
            const top = st.docTop - window.scrollY
            return { left: st.left, top, width: st.w, height: st.h, bottom: top + st.h }
          },
          render: (renderer, dt, rect) => gl.render(renderer, dt, rect),
        })
      } catch (e) {
        onFail()
      }
    })

    const stopFrame = onFrame((t, dt) => {
      if (!st.inView) return
      const prev = st.current
      if (!st.drag) {
        const k = prefersReducedMotion() ? 1 : 1 - Math.exp(-dt * 7)
        st.current += (st.target - st.current) * k
      }
      st.velocity += ((st.current - prev) / Math.max(dt, 1 / 120) - st.velocity) * 0.2
      if (gl) gl.setState(st.current, st.velocity * 0.6, st.hover)
      const idx = Math.round(st.current)
      setActive((a) => (a === idx ? a : idx))
    })

    return () => {
      disposed = true
      unsub()
      stopFrame()
      ro.disconnect()
      io.disconnect()
      if (st.inView) quality.active--
      if (removeView) removeView()
      if (gl) gl.dispose()
      glRef.current = null
    }
  }, [projects, onFail])

  // pointer: drag to rotate, click to select/open, hover highlight
  const local = (e) => {
    const r = stageRef.current.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top, w: r.width, h: r.height }
  }
  const onPointerDown = (e) => {
    if (e.button !== 0) return
    const st = state.current
    st.drag = { x: e.clientX, start: st.current, moved: 0, id: e.pointerId }
  }
  const onPointerMove = (e) => {
    const st = state.current
    if (st.drag) {
      const dx = e.clientX - st.drag.x
      st.drag.moved = Math.max(st.drag.moved, Math.abs(dx))
      if (st.drag.moved > 6 && !stageRef.current.hasPointerCapture(e.pointerId)) stageRef.current.setPointerCapture(e.pointerId)
      st.current = Math.max(-0.4, Math.min(n - 0.6, st.drag.start - dx / (st.w * 0.42)))
      st.target = st.current
    } else if (e.pointerType === 'mouse' && glRef.current) {
      const p = local(e)
      st.hover = glRef.current.hit(p.x, p.y, p.w, p.h)
      stageRef.current.style.cursor = st.hover >= 0 ? 'pointer' : 'grab'
    }
  }
  const onPointerUp = (e) => {
    const st = state.current
    const drag = st.drag
    st.drag = null
    if (!drag) return
    if (drag.moved > 6) {
      st.target = clamp(Math.round(st.current - st.velocity * 0.12))
      return
    }
    const p = local(e)
    const i = glRef.current ? glRef.current.hit(p.x, p.y, p.w, p.h) : -1
    if (i < 0) return
    if (i === Math.round(st.current)) onOpen(projects[i])
    else goTo(i)
  }
  const onWheel = (e) => {
    // horizontal intent only (trackpad swipe / shift+wheel); vertical wheel keeps scrolling the page
    const dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.shiftKey ? e.deltaY : 0
    if (!dx) return
    e.preventDefault()
    const st = state.current
    st.target = Math.max(-0.3, Math.min(n - 0.7, st.target + dx / 600))
    clearTimeout(st.wheelT)
    st.wheelT = setTimeout(() => (st.target = clamp(Math.round(st.target))), 140)
  }
  useEffect(() => {
    const el = stageRef.current
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  })
  const onKeyDown = (e) => {
    const st = state.current
    const cur = Math.round(st.target)
    if (e.key === 'ArrowRight') goTo(cur + 1)
    else if (e.key === 'ArrowLeft') goTo(cur - 1)
    else if (e.key === 'Home') goTo(0)
    else if (e.key === 'End') goTo(n - 1)
    else if (e.key === 'Enter' || e.key === ' ') onOpen(projects[cur])
    else return
    e.preventDefault()
  }

  const p = projects[active] || projects[0]
  return (
    <div className="pj-stage-wrap">
      <div
        ref={stageRef}
        className="pj-stage"
        tabIndex={0}
        role="group"
        aria-roledescription="carousel"
        aria-label="Projects gallery. Use left and right arrow keys to browse, Enter to open details."
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (state.current.drag = null)}
        onPointerLeave={() => (state.current.hover = -1)}
        onKeyDown={onKeyDown}
      >
        <span className="pj-stage__hint" aria-hidden="true">
          Drag · Click
        </span>
      </div>

      <div className="pj-info" aria-live="polite">
        <div key={p.id} className="pj-info__content">
          <p className="pj-info__meta">
            <span className="pj-info__index">
              {String(active + 1).padStart(2, '0')}
              <span aria-hidden="true"> / </span>
              <span className="sr-only"> of </span>
              {String(n).padStart(2, '0')}
            </span>
            <span className="pj-info__cat">{p.category}</span>
            <span className="pj-card__status" data-tone={statusTone(p.status)}>
              {p.status}
            </span>
          </p>
          <h3 className="pj-info__title">{p.title}</h3>
          <p className="pj-info__desc">{p.description}</p>
          <ul className="pj-pills" aria-label="Technologies">
            {p.technologies.slice(0, 6).map((t) => (
              <li key={t} className="pill">
                {t}
              </li>
            ))}
          </ul>
          <Links project={p} onDetails={() => onOpen(p)} />
        </div>
        <div className="pj-info__nav">
          <button type="button" className="btn btn--ghost btn--icon" onClick={() => goTo(active - 1)} disabled={active <= 0} aria-label="Previous project">
            <FaChevronLeft aria-hidden="true" />
          </button>
          <ol className="pj-dots">
            {projects.map((q, i) => (
              <li key={q.id}>
                <button type="button" className={i === active ? 'is-active' : ''} aria-label={q.title} aria-current={i === active ? 'true' : undefined} onClick={() => goTo(i)} />
              </li>
            ))}
          </ol>
          <button type="button" className="btn btn--ghost btn--icon" onClick={() => goTo(active + 1)} disabled={active >= n - 1} aria-label="Next project">
            <FaChevronRight aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* full, non-visual list so assistive tech gets every project, not just the active one */}
      <ul className="sr-only" aria-label="All projects">
        {projects.map((q) => (
          <li key={q.id}>
            <h4>{q.title}</h4>
            <p>{q.description}</p>
            {q.githubUrl && (
              <a href={q.githubUrl} tabIndex={-1}>
                Source code
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function ProjectShowcase({ projects, onOpen }) {
  const wide = useMediaQuery('(min-width: 768px)')
  const [failed, setFailed] = useState(false)
  const [tier, setTier] = useState(() => quality.tier || getDevice().tier)
  useEffect(() => quality.subscribe(setTier), [])
  const onFail = useCallback(() => setFailed(true), [])
  const useGL = wide && !failed && tier >= 2 && getDevice().webgl && !prefersReducedMotion()
  return useGL ? <ProjectStage projects={projects} onOpen={onOpen} onFail={onFail} /> : <ProjectCards projects={projects} onOpen={onOpen} />
}
