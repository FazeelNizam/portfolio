"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useSpring, useMotionValue } from "motion/react"

const DefaultCursorSVG = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={50}
    height={54}
    viewBox="0 0 50 54"
    fill="none"
    style={{ scale: 0.5 }}
  >
    <g filter="url(#f0)">
      <path
        d="M42.68 41.15L27.51 6.80c-.78-1.77-3.3-1.77-4.12 0L7.60 41.15c-.84 1.83.93 3.75 2.81 3.05l13.96-5.15c.51-.18 1.07-.18 1.57 0l13.87 5.15c1.87.7 3.67-1.22 2.81-3.05Z"
        fill="black"
      />
      <path
        d="M43.71 40.69L28.54 6.34c-1.19-2.69-4.96-2.65-6.18-.02L6.57 40.68c-1.26 2.74 1.40 5.62 4.23 4.58l13.96-5.15c.26-.1.54-.1.79 0l13.87 5.15c2.80 1.04 5.50-1.82 4.30-4.56Z"
        stroke="white"
        strokeWidth={2.25}
      />
    </g>
    <defs>
      <filter id="f0" x={0} y={0} width={50} height={54} filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.08" />
      </filter>
    </defs>
  </svg>
)

export function SmoothCursor({
  cursor = <DefaultCursorSVG />,
  springConfig = { stiffness: 400, damping: 45 }
}) {
  const [isMoving, setIsMoving] = useState(false)
  const lastMouse = useRef({ x: 0, y: 0 })
  const vel = useRef({ x: 0, y: 0 })
  const lastTime = useRef(Date.now())
  const prevAngle = useRef(0)
  const accumRot = useRef(0)

  // Motion values
  const x = useSpring(0, springConfig)
  const y = useSpring(0, springConfig)
  const rot = useSpring(0, { ...springConfig, damping: 60, stiffness: 300 })
  const scl = useSpring(1, { ...springConfig, damping: 35, stiffness: 500 })

  useEffect(() => {
    const updateVelocity = (pos) => {
      const now = Date.now()
      const dt = now - lastTime.current
      if (dt > 0) {
        vel.current = {
          x: (pos.x - lastMouse.current.x) / dt,
          y: (pos.y - lastMouse.current.y) / dt
        }
      }
      lastTime.current = now
      lastMouse.current = pos
    }

    const handleMove = (e) => {
      const pos = { x: e.clientX, y: e.clientY }
      updateVelocity(pos)

      const speed = Math.hypot(vel.current.x, vel.current.y)
      x.set(pos.x)
      y.set(pos.y)

      if (speed > 0.1) {
        const ang =
          Math.atan2(vel.current.y, vel.current.x) * (180 / Math.PI) + 90
        let diff = ang - prevAngle.current
        if (diff > 180) diff -= 360
        if (diff < -180) diff += 360
        accumRot.current += diff
        rot.set(accumRot.current)
        prevAngle.current = ang

        scl.set(0.95)
        setIsMoving(true)
        const t = setTimeout(() => {
          scl.set(1)
          setIsMoving(false)
        }, 150)
        return () => clearTimeout(t)
      }
    }

    let raf = 0
    const throttled = (e) => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        handleMove(e)
        raf = 0
      })
    }

    document.body.style.cursor = "none"
    window.addEventListener("mousemove", throttled)
    return () => {
      window.removeEventListener("mousemove", throttled)
      document.body.style.cursor = "auto"
      if (raf) cancelAnimationFrame(raf)
    }
  }, [x, y, rot, scl])

  return (
    <motion.div
      style={{
        position: "fixed",
        x,
        y,
        translateX: "-50%",
        translateY: "-50%",
        rotate: rot,
        scale: scl,
        zIndex: 100,
        pointerEvents: "none",
        willChange: "transform"
      }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      {cursor}
    </motion.div>
  )
}
