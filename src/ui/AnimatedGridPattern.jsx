import React from 'react'

const AnimatedGridPattern = ({
  className = '',
  numSquares = 200,
  width = 40,
  height = 40,
  x = -1,
  y = -1,
  strokeDasharray = 0,
  maxOpacity = 0.15,
  duration = 3,
  repeatDelay = 1,
}) => {
  const squares = Array.from({ length: numSquares }, (_, i) => i)
  return (
    <svg
      className={className}
      style={{ position: 'absolute' }}
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="grid"
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path
            d={`M ${width} 0 L 0 0 0 ${height}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray={strokeDasharray}
            opacity="0.15"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
      {squares.map((i) => (
        <rect
          key={i}
          width={width}
          height={height}
          x={(i * width) % (width * 50)}
          y={Math.floor(i / 50) * height}
          fill="currentColor"
          opacity={(i % 10) / 10 * maxOpacity}
        >
          <animate
            attributeName="opacity"
            values={`0; ${maxOpacity}; 0`}
            dur={`${duration}s`}
            repeatCount="indefinite"
            begin={`${(i % 10) * (repeatDelay / 10)}s`}
          />
        </rect>
      ))}
    </svg>
  )
}

export default AnimatedGridPattern


