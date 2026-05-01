"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const DEFAULT_COLORS = ["#c679c4", "#fa3d1d", "#ffb005", "#e1e1fe", "#0358f7"];

export function DiaTextReveal({
  text,
  colors = DEFAULT_COLORS,
  textColor = "#ffffff",
  duration = 1.2,
  delay = 0,
  className = "",
  startOnView = true,
  once = true,
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: "-10% 0px" });
  const [shouldAnimate, setShouldAnimate] = useState(!startOnView);

  useEffect(() => {
    if (startOnView && isInView) setShouldAnimate(true);
  }, [isInView, startOnView]);

  // Build gradient stops string from colors array
  const gradientStops = colors
    .map((c, i) => `${c} ${(i / (colors.length - 1)) * 100}%`)
    .join(", ");

  const bandWidth = 120; // px width of the traveling color band

  return (
    <span ref={ref} className={`relative inline-block overflow-hidden ${className}`}>
      {/* Base text — always white/textColor but starts transparent */}
      <motion.span
        style={{ color: "transparent" }}
        animate={shouldAnimate ? { color: textColor } : {}}
        transition={{ duration: 0.01, delay: delay + duration * 0.85 }}
        className="relative z-10"
      >
        {text}
      </motion.span>

      {/* Color band overlay */}
      {shouldAnimate && (
        <motion.span
          className="pointer-events-none absolute inset-y-0 z-20"
          style={{
            width: `${bandWidth}px`,
            background: `linear-gradient(to right, transparent, ${gradientStops}, transparent)`,
            mixBlendMode: "lighten",
            filter: "blur(2px)",
          }}
          initial={{ left: "-120px" }}
          animate={{ left: "110%" }}
          transition={{
            duration,
            delay,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        />
      )}
    </span>
  );
}
