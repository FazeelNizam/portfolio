import React, { useEffect, useMemo, useRef, useState } from 'react'
import './Banner.scss'
import { resolveHeroConfig } from '../../config/hero.config'
import { getDevice, prefersReducedMotion } from '../../lib/device'
import { onFrame, quality } from '../../lib/ticker'
import { scrollToTarget } from '../../lib/smoothScroll'
import { FaArrowDown, FaDownload } from 'react-icons/fa'
import CV from '../../cv/Fazeel Nizam - CV.pdf'


/** Static dotted portrait for browsers without WebGL. */
async function drawFallbackPortrait(canvas, cfg) {
  const { samplePortrait } = await import('../../three/portraitSampler')
  const w = canvas.clientWidth
  const h = canvas.clientHeight
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = w * dpr
  canvas.height = h * dpr
  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)
  const n = 9000
  const { home, data, aspect } = await samplePortrait(`${process.env.PUBLIC_URL}/${cfg.portrait.image}`, n)
  let size = cfg.portrait.height * h
  size = Math.min(size, (w * 0.98) / aspect)
  const cx = cfg.portrait.x * w
  const cy = cfg.portrait.bottom * h - size / 2
  const colors = cfg.particles.colors
  for (let i = 0; i < n; i++) {
    const l = data[i * 4]
    ctx.globalAlpha = 0.35 + 0.65 * l
    ctx.fillStyle = colors[Math.min(colors.length - 1, Math.floor(l * colors.length))]
    const r = (0.5 + l) * 0.9
    ctx.fillRect(cx + home[i * 3] * size - r / 2, cy - home[i * 3 + 1] * size - r / 2, r, r)
  }
}

const Banner = () => {
  const sectionRef = useRef(null)
  const canvasRef = useRef(null)
  const fallbackRef = useRef(null)
  const [cfg, setCfg] = useState(() => resolveHeroConfig())
  const [roleIndex, setRoleIndex] = useState(0)
  const [glReady, setGlReady] = useState(false)
  const reduced = useMemo(() => prefersReducedMotion(), [])

  // responsive config (mobile / tablet overrides)
  useEffect(() => {
    let w = window.innerWidth
    const onResize = () => {
      const nw = window.innerWidth
      if ((nw <= 640) !== (w <= 640) || (nw < 1024) !== (w < 1024)) setCfg(resolveHeroConfig(nw))
      w = nw
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // rotating role line
  useEffect(() => {
    if (reduced) return
    const id = setInterval(() => setRoleIndex((i) => (i + 1) % cfg.name.roles.length), cfg.name.roleInterval * 1000)
    return () => clearInterval(id)
  }, [cfg.name.roles.length, cfg.name.roleInterval, reduced])

  // scroll-linked progress → CSS var (name parallax) ; only while the hero is visible
  const particlesRef = useRef(null)
  const visibleRef = useRef(true)
  useEffect(() => {
    const el = sectionRef.current
    let last = -1
    return onFrame(() => {
      if (!visibleRef.current) return
      const h = el.offsetHeight || 1
      const p = Math.min(1, Math.max(0, window.scrollY / h))
      if (Math.abs(p - last) > 0.0005) {
        el.style.setProperty('--hp', p.toFixed(4))
        last = p
      }
      const parts = particlesRef.current
      if (parts) {
        parts.setScroll(p)
        const bh = cfg.blackHole
        const vw = window.innerWidth
        const vh = window.innerHeight
        parts.setBlackHole(bh.x * vw, bh.y * vh + window.scrollY * (1 - bh.parallax))
      }
    })
  }, [cfg])

  // particle portrait (three.js loaded lazily, after first paint)
  useEffect(() => {
    const canvas = canvasRef.current
    const section = sectionRef.current
    const device = getDevice()
    quality.init()
    if (!device.webgl || device.tier === 0) {
      drawFallbackPortrait(fallbackRef.current, cfg).catch(() => {})
      return
    }
    let parts = null
    let disposed = false
    const cleanups = []
    const counts = { 1: cfg.particles.count.low, 2: cfg.particles.count.medium, 3: cfg.particles.count.high }

    const start = async () => {
      const { default: HeroParticles } = await import(/* webpackChunkName: "three-hero" */ '../../three/HeroParticles')
      if (disposed) return
      parts = new HeroParticles({ canvas, config: cfg, tier: quality.tier, reducedMotion: reduced, counts })
      try {
        await parts.init()
      } catch (e) {
        parts = null
        drawFallbackPortrait(fallbackRef.current, cfg).catch(() => {})
        return
      }
      if (disposed) {
        parts.dispose()
        return
      }
      particlesRef.current = parts
      setGlReady(true)
      quality.active++
      let counted = true

      const ro = new ResizeObserver(() => parts.resize(canvas.clientWidth, canvas.clientHeight))
      ro.observe(canvas)
      cleanups.push(() => ro.disconnect())
      cleanups.push(quality.subscribe((t) => parts.setTier(t)))

      // pause when the hero is off-screen
      const io = new IntersectionObserver(([e]) => {
        visibleRef.current = e.isIntersecting
        parts.active = e.isIntersecting
        if (e.isIntersecting && !counted) {
          quality.active++
          counted = true
        } else if (!e.isIntersecting && counted) {
          quality.active--
          counted = false
        }
      })
      io.observe(section)
      cleanups.push(() => {
        io.disconnect()
        if (counted) quality.active--
      })

      // pointer + touch (touch events keep firing while the page pans)
      const local = (x, y) => {
        const r = canvas.getBoundingClientRect()
        parts.pointerMove(x - r.left, y - r.top, performance.now())
      }
      const onMove = (e) => {
        if (e.pointerType === 'touch') return
        local(e.clientX, e.clientY)
      }
      const onTouch = (e) => {
        const t = e.touches[0]
        if (t) local(t.clientX, t.clientY)
      }
      const onLeave = () => parts.pointerLeave()
      section.addEventListener('pointermove', onMove, { passive: true })
      section.addEventListener('pointerleave', onLeave)
      section.addEventListener('touchstart', onTouch, { passive: true })
      section.addEventListener('touchmove', onTouch, { passive: true })
      section.addEventListener('touchend', onLeave, { passive: true })
      cleanups.push(() => {
        section.removeEventListener('pointermove', onMove)
        section.removeEventListener('pointerleave', onLeave)
        section.removeEventListener('touchstart', onTouch)
        section.removeEventListener('touchmove', onTouch)
        section.removeEventListener('touchend', onLeave)
      })

      if (reduced) {
        // static: render on demand only
        parts.renderOnce()
        const onScroll = () => {
          if (!visibleRef.current) return
          parts.setScroll(Math.min(1, window.scrollY / (section.offsetHeight || 1)))
          parts.renderOnce()
        }
        window.addEventListener('scroll', onScroll, { passive: true })
        cleanups.push(() => window.removeEventListener('scroll', onScroll))
        const ro2 = new ResizeObserver(() => parts.renderOnce())
        ro2.observe(canvas)
        cleanups.push(() => ro2.disconnect())
      } else {
        cleanups.push(onFrame((t, dt) => parts.update(dt)))
      }
    }

    const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 200))
    const handle = idle(() => start(), { timeout: 900 })
    return () => {
      disposed = true
      ;(window.cancelIdleCallback || clearTimeout)(handle)
      cleanups.forEach((fn) => fn())
      particlesRef.current = null
      if (parts) parts.dispose()
    }
    // the config object only changes across breakpoints; particles take it via setConfig
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced])

  useEffect(() => {
    if (particlesRef.current) particlesRef.current.setConfig(cfg)
  }, [cfg])

  const n = cfg.name
  const fullName = n.words.join(' ')
  let letterIndex = 0
  const styleFor = (wi) => {
    if (n.style === 'outline') return 'outline'
    if (n.style === 'fill') return 'fill'
    return wi === 0 ? 'outline' : 'fill'
  }

  return (
    <section
      id="home"
      ref={sectionRef}
      className={`hero hero--name-${n.layer} hero--anim-${n.animation}${reduced ? ' hero--reduced' : ''}${glReady ? ' hero--gl' : ''}`}
      style={{
        '--name-font': n.font,
        '--name-size': n.size,
        '--name-y': `${n.y * 100}%`,
        '--name-speed': n.speed,
        '--name-parallax': n.scrollParallax,
      }}
      aria-labelledby="hero-title"
    >
      <div className="hero__name-layer">
        <p className="hero__kicker" aria-hidden="true">
          {n.kicker}
        </p>
        <h1 id="hero-title" className="hero__name">
          <span className="sr-only">
            {n.kicker} {fullName}
          </span>
          <span className="hero__name-visual" aria-hidden="true">
            {n.words.map((word, wi) => (
              <span key={word + wi} className={`hero__word hero__word--${styleFor(wi)}`}>
                {word.split('').map((ch) => {
                  const i = letterIndex++
                  const drift = ((i % 3) - 1) * 0.6 + (i % 2 ? 1 : 0.4)
                  return (
                    <span key={i} className="hero__letter-wrap" style={{ '--i': i, '--d': drift.toFixed(2) }}>
                      <span className="hero__letter">{ch}</span>
                    </span>
                  )
                })}
              </span>
            ))}
          </span>
        </h1>
      </div>

      <canvas ref={canvasRef} className="hero__particles" role="img" aria-label={cfg.portrait.alt} />
      <canvas ref={fallbackRef} className="hero__fallback" aria-hidden="true" />

      <div className="hero__bar container">
        <div className="hero__intro">
          <p className="hero__role" aria-hidden="true">
            <span key={roleIndex} className="hero__role-text">
              {n.roles[roleIndex]}
            </span>
          </p>
          <p className="sr-only">{n.roles.join(', ')}</p>
          <p className="hero__tagline">Embedded systems, IoT &amp; AI — from PCB to pixels.</p>
        </div>
        <div className="hero__cta">
          <a
            className="btn btn--primary"
            href="#projects"
            onClick={(e) => {
              e.preventDefault()
              scrollToTarget('#projects')
            }}
          >
            View projects
          </a>
          <a className="btn btn--ghost" href={CV} download>
            <FaDownload aria-hidden="true" /> Résumé
          </a>
        </div>
      </div>

      <a
        className="hero__scroll"
        href="#about"
        aria-label="Scroll to About"
        onClick={(e) => {
          e.preventDefault()
          scrollToTarget('#about')
        }}
      >
        <FaArrowDown aria-hidden="true" />
      </a>
    </section>
  )
}

export default Banner
