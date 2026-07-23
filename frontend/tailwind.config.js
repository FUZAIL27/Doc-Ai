/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    screens: {
      'xs': '480px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        brand: {
          50:'#eef2ff', 100:'#e0e7ff', 200:'#c7d2fe', 300:'#a5b4fc',
          400:'#818cf8', 500:'#6366f1', 600:'#4f46e5', 700:'#4338ca',
          800:'#3730a3', 900:'#312e81',
        },
        dark: {
          100:'#1e1e2e', 200:'#181825', 300:'#11111b',
          card:'#1e1e2e', border:'#2e2e4a', hover:'#2a2a3e',
        },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      keyframes: {
        shimmer: { '0%':{ backgroundPosition:'-200% 0' }, '100%':{ backgroundPosition:'200% 0' } },
        fadeIn:  { '0%':{ opacity:'0' }, '100%':{ opacity:'1' } },
        slideUp: { '0%':{ opacity:'0', transform:'translateY(16px)' }, '100%':{ opacity:'1', transform:'translateY(0)' } },
      },
      animation: {
        shimmer:   'shimmer 2s linear infinite',
        'fade-in': 'fadeIn 0.25s ease-out',
        'slide-up':'slideUp 0.35s ease-out',
      },
      height: {
        'dvh': '100dvh',
      },
      minHeight: {
        'dvh': '100dvh',
      },
    },
  },
  plugins: [
    // Scrollbar hide utility
    function ({ addUtilities }) {
      addUtilities({
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        },
        '.h-dvh':     { height: '100dvh' },
        '.min-h-dvh': { 'min-height': '100dvh' },
      })
    }
  ],
}
