import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        kira: {
          gold: '#C9A84C',
          'gold-light': '#E8C97A',
          'gold-dark': '#8B6914',
          obsidian: '#0A0A0F',
          'obsidian-2': '#111118',
          'obsidian-3': '#1A1A24',
          slate: '#2A2A3A',
          'slate-light': '#3A3A50',
          cream: '#F5F0E8',
          'cream-dim': '#C8C0B0',
          teal: '#2DD4BF',
          'teal-dim': '#0F7A70',
          red: '#FF4444',
          green: '#22C55E',
          amber: '#F59E0B',
        },
      },
      backgroundImage: {
        'kira-gradient': 'linear-gradient(135deg, #0A0A0F 0%, #111118 50%, #0D0D15 100%)',
        'gold-gradient': 'linear-gradient(135deg, #C9A84C 0%, #E8C97A 50%, #C9A84C 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(26,26,36,0.8) 0%, rgba(17,17,24,0.9) 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'slide-in': 'slideIn 0.4s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(201, 168, 76, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(201, 168, 76, 0.6)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
