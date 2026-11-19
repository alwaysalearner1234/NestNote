/**
 * TailwindCSS Configuration — Airbnb-inspired design system
 * 
 * Color palette:
 *   #FFFFFF — Canvas (background)
 *   #222222 — Ink (text)
 *   #FF385C — Coral CTA buttons
 *   #111827 — Secondary text
 *   #D1D5DB — Border/gray-300
 *   #F3F4F6 — Gray-100
 *   #EF4444 — Red-500 (error states)
 *   #10B981 — Green-500 (success states)
 *   #F59E0B — Amber-500 (warnings)
 * 
 * Font: Plus Jakarta Sans / Inter (fallback to system UI)
 * Radius: 16px rounded cards
 * Spacing: 4px base scale
 */

module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#FFFFFF',
        ink: '#222222',
        coral: '#FF385C',
        coralLight: '#FF6B7A',
        border: '#D1D5DB',
        grayLight: '#F3F4F6',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      fontFamily: {
        display: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        btn: '12px',
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-height)' },
          to: { height: 0 },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [],
};