import React, { useEffect, useRef, useState } from 'react'
import './SpaceCanvas.scss'
import { getDevice, prefersReducedMotion } from '../../lib/device'
import { onFrame, quality } from '../../lib/ticker'
import { setBackground } from '../../three/backgroundStore'
import { resolveHeroConfig } from '../../config/hero.config'

/** Static Canvas2D starfield for browsers without WebGL. Drawn once per resize. */
function drawFallbackStars(canvas) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const w = canvas.clientWidth
  const h = canvas.clientHeight
  canvas.width = w * dpr
  canvas.height = h * dpr
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.scale(dpr, dpr)
  let seed = 3
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
  const n = Math.round((w * h) / 2500)
  for (let i = 0; i < n; i++) {
    const r = rnd() * rnd() * 1.4 + 0.3
    ctx.globalAlpha = 0.25 + rnd() * 0.6
    ctx.fillStyle = rnd() > 0.75 ? '#c9a6ff' : '#e9e6ff'
    ctx.beginPath()
    ctx.arc(rnd() * w, rnd() * h, r, 0, Math.PI * 2)
    ctx.fill()
  }
}

/**
 * Fixed, full-viewport space background shared by every section.
 * Three.js is code-split and only loaded after the page is idle.
 */
export default function SpaceCanvas() {
  const canvasRef = useRef(null)
  const [mode, setMode] = useState('pending') // pending | webgl | fallback

  useEffect(() => {
    const canvas = canvasRef.current
    const device = getDevice()
    if (!device.webgl || device.tier === 0) {
      setMode('fallback')
      drawFallbackStars(canvas)
      const onResize = () => drawFallbackStars(canvas)
      window.addEventListener('resize', onResize)
      return () => window.removeEventListener('resize', onResize)
    }

    let bg = null
    let disposed = false
    const cleanups = []
    const reduced = prefersReducedMotion()
    quality.init()

    const start = async () => {
      const { default: SpaceBackground } = await import(/* webpackChunkName: "three-space" */ '../../three/SpaceBackground')
      if (disposed) return
      bg = new SpaceBackground({
        canvas,
        tier: quality.tier,
        reducedMotion: reduced,
        blackHole: resolveHeroConfig().blackHole,
      })
      try {
        bg.init()
      } catch (e) {
        setMode('fallback')
        drawFallbackStars(canvas)
        return
      }
      setMode('webgl')
      setBackground(bg)
      quality.active++

      const measureSections = () => {
        const a = document.getElementById('experience')
        const b = document.getElementById('education')
        if (a && b) {
          const top = a.getBoundingClientRect().top + window.scrollY
          const bottom = b.getBoundingClientRect().bottom + window.scrollY
          bg.setMedusaeRange([top, bottom])
        }
      }
      measureSections()
      const ro = new ResizeObserver(() => {
        bg.setBlackHoleConfig(resolveHeroConfig().blackHole)
        bg.resize()
        measureSections()
      })
      ro.observe(document.body)
      ro.observe(canvas)
      cleanups.push(() => ro.disconnect())

      const onPointer = (e) => bg.setPointer(e.clientX, e.clientY)
      window.addEventListener('pointermove', onPointer, { passive: true })
      cleanups.push(() => window.removeEventListener('pointermove', onPointer))
      cleanups.push(quality.subscribe((t) => bg.setTier(t)))
      cleanups.push(
        onFrame((time, dt) => {
          bg.setScroll(window.scrollY)
          bg.update(dt)
        })
      )
    }

    // wait for the page to settle so three.js never competes with first paint
    const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 400))
    const handle = idle(() => start(), { timeout: 2000 })

    return () => {
      disposed = true
      ;(window.cancelIdleCallback || clearTimeout)(handle)
      cleanups.forEach((fn) => fn())
      if (bg) {
        quality.active--
        setBackground(null)
        bg.dispose()
      }
    }
  }, [])

  return (
    <div className={`space-bg space-bg--${mode}`} aria-hidden="true">
      <canvas ref={canvasRef} className="space-bg__canvas" />
    </div>
  )
}
