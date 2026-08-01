/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f4f6fe',
          100: '#e9edfe',
          200: '#d7dffd',
          300: '#b8c6fa',
          400: '#94a5f6',
          500: '#6d7df1',
          600: '#5460e7',
          700: '#434cd1',
          800: '#373ea9',
          900: '#313788',
        },
        dark: {
          50: '#f6f6f7',
          100: '#eef0f2',
          200: '#d9dde3',
          300: '#b7bfc9',
          400: '#8e9aa8',
          500: '#6f7c8d',
          600: '#596575',
          700: '#4a5360',
          800: '#3f4651',
          900: '#1e293b', // Slate-900 (nice deep dark)
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
