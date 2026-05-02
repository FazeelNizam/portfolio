import React from "react";

/**
 * Shine Border
 *
 * An animated background border effect component with configurable properties.
 *
 * Fixed to provide a smooth, non-aliased, glowing border.
 */
export function ShineBorder({
  borderWidth = 2, // Slightly thicker for a better visual effect
  duration = 14,
  shineColor = ["#7c3aed", "transparent", "#7c3aed"], // A cleaner gradient pattern
  glowColor = "#7c3aed", // Add a prop for the overall glow color
  className = "",
  style,
  ...props
}) {
  return (
    <div
      style={{
        "--border-width": `${borderWidth}px`,
        "--duration": `${duration}s`,
        backgroundImage: `radial-gradient(transparent, ${
          Array.isArray(shineColor) ? shineColor.join(",") : shineColor
        }, transparent)`,
        backgroundSize: "300% 300%",
        mask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
        WebkitMask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
        WebkitMaskComposite: "xor",
        maskComposite: "exclude",
        padding: "var(--border-width)",
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",

        /* Key fixes for a smooth, glowing line: */
        // 1. A tiny blur smooths the jagged mask edges (the saw-tooth).
        filter: "blur(10px)", 
        // 2. A separate, soft box-shadow creates the bloom (the glowing light),
        //    making the overall line look much softer and smoother.
        boxShadow: `0 0 calc(var(--border-width) * 16) 0 ${glowColor}`, 

        ...style,
      }}
      className={`shine-border-animation pointer-events-none absolute inset-0 size-full rounded-[inherit] will-change-[background-position,transform] ${className}`.trim()}
      {...props}
    />
  );
}