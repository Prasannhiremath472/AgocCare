/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // ── Agoc Care brand palette (from logo) ──────────────────
        primary: {
          DEFAULT: '#1B4B8A',   // Navy blue — main logo color
          dark:    '#133872',
          light:   '#E8F0F9',
          50:      '#E8F0F9',
          100:     '#C5D5EE',
          200:     '#9EBADF',
          300:     '#6C96CC',
          400:     '#3D74B8',
          500:     '#1B4B8A',
          600:     '#133872',
          700:     '#0D2857',
          800:     '#081A3C',
          900:     '#040E21',
        },
        cyan: {
          DEFAULT: '#00AEEF',   // Cyan arc in logo
          dark:    '#0090C9',
          light:   '#E0F6FD',
          50:      '#E0F6FD',
          400:     '#29BCEF',
          500:     '#00AEEF',
          600:     '#0090C9',
        },
        brand: {
          green:   '#39B54A',   // Green arc + tagline
          'green-dark':  '#2A8C37',
          'green-light': '#E8F6EA',
          navy:    '#1B4B8A',
          cyan:    '#00AEEF',
          gray:    '#4D4D4D',
        },
        // Keep these for component compatibility
        secondary: { DEFAULT: '#00AEEF', light: '#E0F6FD', dark: '#0090C9' },
        cta:       { DEFAULT: '#39B54A', dark: '#2A8C37', light: '#E8F6EA' },
        teal: {
          DEFAULT: '#1B3A5C',
          light:   '#EEF4FB',
          mid:     '#C5D5EE',
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
        marquee:    'marquee 30s linear infinite',
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
