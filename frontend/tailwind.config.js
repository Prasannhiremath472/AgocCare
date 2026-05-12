/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // ── AgocCare brand colors ─────────────────────────────────
        // #044b99 Navy Blue | #079DDF Cyan Blue | #94A614 Olive Green
        primary: {
          DEFAULT: '#044b99',
          dark:    '#033874',
          light:   '#E6EEF8',
          50:      '#E6EEF8',
          100:     '#BACED0',
          200:     '#8AAEE0',
          300:     '#5A8ED0',
          400:     '#2A6EBF',
          500:     '#044b99',
          600:     '#033874',
          700:     '#022650',
          800:     '#01152D',
          900:     '#00080F',
        },
        secondary: {
          DEFAULT: '#079DDF',
          dark:    '#0580B8',
          light:   '#E0F5FC',
          50:      '#E0F5FC',
          100:     '#B3E5F7',
          400:     '#2DB0E8',
          500:     '#079DDF',
          600:     '#0580B8',
        },
        cta: {
          DEFAULT: '#94A614',
          dark:    '#728010',
          light:   '#F2F5E0',
        },
        brand: {
          navy:         '#044b99',
          cyan:         '#079DDF',
          olive:        '#94A614',
          'olive-dark': '#728010',
          'olive-light':'#F2F5E0',
        },
        // teal = alias used across components (mapped to primary navy)
        teal: {
          DEFAULT: '#044b99',
          light:   '#EEF4FB',
          mid:     '#BACED0',
        },
      },
      fontFamily: { sans: ['Figtree', 'Noto Sans', 'system-ui', 'sans-serif'] },
      boxShadow: {
        card:        '0 1px 4px rgba(0,0,0,.06)',
        'card-lg':   '0 8px 32px rgba(4,75,153,.14)',
        btn:         '0 2px 8px rgba(4,75,153,.35)',
        'btn-green': '0 2px 8px rgba(148,166,20,.35)',
      },
      animation: {
        'fade-up':      'fadeUp .45s ease both',
        'fade-in':      'fadeIn .35s ease both',
        marquee:        'marquee 30s linear infinite',
        'marquee-slow': 'marquee 50s linear infinite',
      },
      keyframes: {
        fadeUp:  { from: { opacity: 0, transform: 'translateY(14px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
      },
    },
  },
  plugins: [],
};
