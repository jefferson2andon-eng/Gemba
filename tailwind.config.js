/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        gemba: {
          gold:    '#c9a84c',
          'gold-light': '#e8c96a',
          'gold-dim':   '#8a6e2a',
          dark:    '#0a0a0b',
          surface: '#111114',
          card:    '#18181c',
          border:  '#2a2a30',
          'border-gold': 'rgba(201,168,76,0.25)',
          text:    '#e8e6e0',
          dim:     '#7a7870',
          muted:   '#3a3835',
        }
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        body:    ['"DM Sans"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #c9a84c 0%, #e8c96a 50%, #c9a84c 100%)',
        'dark-gradient': 'linear-gradient(180deg, #111114 0%, #0a0a0b 100%)',
      },
      boxShadow: {
        'gold': '0 0 20px rgba(201,168,76,0.15)',
        'gold-strong': '0 4px 32px rgba(201,168,76,0.25)',
        'card': '0 2px 16px rgba(0,0,0,0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease',
        'slide-up': 'slideUp 0.35s ease',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp:   { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        pulseGold: { '0%,100%': { boxShadow: '0 0 8px rgba(201,168,76,0.2)' }, '50%': { boxShadow: '0 0 24px rgba(201,168,76,0.5)' } },
      }
    }
  },
  plugins: []
}
