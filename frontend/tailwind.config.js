/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // ── AgocCare brand palette — extracted from logo ──────────
        // Logo colors: Navy #1A3A6B | Cyan #00AEEF | Green #39B54A | White #FFFFFF
        primary: {
          DEFAULT: '#1A3A6B',   // Navy blue — logo ring & "PVT. LTD."
          dark:    '#122B52',
          light:   '#E8EFF9',
          50:      '#E8EFF9',
          100:     '#C3D2EC',
          200:     '#96B0D9',
          300:     '#638DC3',
          400:     '#3868AE',
          500:     '#1A3A6B',
          600:     '#122B52',
          700:     '#0C1E3A',
          800:     '#071224',
          900:     '#030810',
        },
        secondary: {
          DEFAULT: '#00AEEF',   // Cyan blue — logo "AGOC" text & icon arc
          dark:    '#0090C9',
          light:   '#E0F6FD',
          50:      '#E0F6FD',
          400:     '#29BCEF',
          500:     '#00AEEF',
          600:     '#0090C9',
        },
        cta: {
          DEFAULT: '#39B54A',   // Green — logo "CARE" text & "empowering life"
          dark:    '#2A8C37',
          light:   '#E8F6EA',
        },
        brand: {
          navy:          '#1A3A6B',
          cyan:          '#00AEEF',
          green:         '#39B54A',
          'green-dark':  '#2A8C37',
          'green-light': '#E8F6EA',
          gray:          '#4D4D4D',
        },
        // teal = alias for body text/bg (navy-based for consistency)
        teal: {
          DEFAULT: '#1A3A6B',
          light:   '#EEF4FB',
          mid:     '#C3D2EC',
        },
      },
      fontFamily: { sans: ['Figtree', 'Noto Sans', 'system-ui', 'sans-serif'] },
      boxShadow: {
        card:      '0 1px 4px rgba(0,0,0,.06)',
        'card-lg': '0 8px 32px rgba(27,75,138,.14)',
        btn:       '0 2px 8px rgba(27,75,138,.30)',
        'btn-green': '0 2px 8px rgba(57,181,74,.30)',
      },
      animation: {
        'fade-up':  'fadeUp .45s ease both',
        'fade-in':  'fadeIn .35s ease both',
        marquee:      'marquee 30s linear infinite',
        'marquee-slow':'marquee 50s linear infinite',
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
