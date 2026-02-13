import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      colors: {
        ink: {
          DEFAULT: '#0a0a0f',
          50: '#f0f0f5',
          100: '#e2e2ed',
          200: '#c5c5db',
          300: '#a8a8c9',
          400: '#7b7ba8',
          500: '#4e4e87',
          600: '#3d3d6e',
          700: '#2c2c55',
          800: '#1b1b3c',
          900: '#0a0a1f',
        },
        neon: {
          cyan: '#00f5d4',
          blue: '#4361ee',
          purple: '#7209b7',
          green: '#06d6a0',
          yellow: '#ffd60a',
          red: '#ef233c',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px #00f5d4, 0 0 10px #00f5d4' },
          '100%': { boxShadow: '0 0 20px #00f5d4, 0 0 40px #00f5d4' },
        }
      }
    },
  },
  plugins: [],
}
export default config
