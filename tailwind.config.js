/** @type {import('tailwindcss').Config} */
export const content = ['./src/**/*.{js,jsx,ts,tsx}']
export const theme = {
  extend: {
    animation: {
      gradient: 'gradient 8s linear infinite',
      marquee: 'marquee var(--duration) linear infinite',
      'marquee-vertical': 'marquee-vertical var(--duration) linear infinite',
      spotlight: 'spotlight 2s ease .75s 1 forwards',
      shimmer: 'shimmer 2s ease-in-out infinite',
      shine: 'shine-pulse var(--duration) infinite linear',
    },
    keyframes: {
      gradient: {
        to: {
          backgroundPosition: 'var(--bg-size) 0',
        },
      },
      shimmer: {
        '0%': {
          backgroundPosition: '-200% 0',
        },
        '100%': {
          backgroundPosition: '200% 0',
        },
      },
      'shine-pulse': {
        '0%': {
          backgroundPosition: '0% 0%',
        },
        '50%': {
          backgroundPosition: '100% 100%',
        },
        to: {
          backgroundPosition: '0% 0%',
        },
      },
      marquee: {
        from: { transform: 'translateX(0)' },
        to: { transform: 'translateX(calc(-100% - var(--gap)))' },
      },
      'marquee-vertical': {
        from: { transform: 'translateY(0)' },
        to: { transform: 'translateY(calc(-100% - var(--gap)))' },
      },
      spotlight: {
        '0%': {
          opacity: 0,
          transform: 'translate(-72%, -62%) scale(0.5)',
        },
        '100%': {
          opacity: 1,
          transform: 'translate(-50%,-40%) scale(1)',
        },
      },
    },
  },
}

export const plugins = []
