import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { cn } from "../../utils/cn"

const createRays = (count, cycle) => {
  if (count <= 0) return []

  return Array.from({ length: count }, (_, index) => {
    const left = 8 + Math.random() * 84
    const rotate = -28 + Math.random() * 56
    const width = 160 + Math.random() * 160
    const swing = 0.8 + Math.random() * 1.8
    const delay = Math.random() * cycle
    const duration = cycle * (0.75 + Math.random() * 0.5)
    const intensity = 0.6 + Math.random() * 0.5

    return {
      id: `${index}-${Math.round(left * 10)}`,
      left,
      rotate,
      width,
      swing,
      delay,
      duration,
      intensity,
    }
  })
}

const Ray = ({
  left,
  rotate,
  width,
  swing,
  delay,
  duration,
  intensity,
}) => {
  return (
    <motion.div
      className="pointer-events-none absolute -top-[12%] origin-top -translate-x-1/2 rounded-full mix-blend-screen"
      style={{
        left: `${left}%`,
        width: `${width}px`,
        height: 'var(--light-rays-length)',
        filter: 'blur(var(--light-rays-blur))',
        background: 'linear-gradient(to bottom, color-mix(in srgb, var(--light-rays-color) 70%, transparent), transparent)',
        opacity: 0,
      }}
      initial={{ rotate: rotate }}
      animate={{
        opacity: [0, intensity, 0],
        rotate: [rotate - swing, rotate + swing, rotate - swing],
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay: delay,
        repeatDelay: duration * 0.1,
      }}
    />
  )
}

export function LightRays({
  className,
  style,
  count = 7,
  color = "rgba(52, 0, 90, 0.42)", // Updated to match the site's purple theme
  blur = 36,
  speed = 14,
  length = "70vh",
  ...props
}) {
  const [rays, setRays] = useState([])
  const cycleDuration = Math.max(speed, 0.1)

  useEffect(() => {
    setRays(createRays(count, cycleDuration))
  }, [count, cycleDuration])

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 isolate overflow-hidden rounded-[inherit] z-0",
        className
      )}
      style={{
        "--light-rays-color": color,
        "--light-rays-blur": `${blur}px`,
        "--light-rays-length": length,
        ...style,
      }}
      {...props}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(circle at 20% 15%, color-mix(in srgb, var(--light-rays-color) 45%, transparent), transparent 70%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(circle at 80% 10%, color-mix(in srgb, var(--light-rays-color) 35%, transparent), transparent 75%)",
          }}
        />
        {rays.map((ray) => (
          <Ray key={ray.id} {...ray} />
        ))}
      </div>
    </div>
  )
}
