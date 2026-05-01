import React from 'react'
import { cn } from '../utils/cn'

const AnimatedShinyText = ({ 
  children, 
  className, 
  shimmerWidth = 100 
}) => {
  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        .shimmer-text {
          background: linear-gradient(110deg, #000103 45%, #1e2631 55%, #000103);
          background-size: 200% 100%;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 2s ease-in-out infinite;
        }
      `}</style>
      <span
        className={cn(
          "shimmer-text",
          className
        )}
      >
        {children}
      </span>
    </>
  )
}

export { AnimatedShinyText }
export default AnimatedShinyText
