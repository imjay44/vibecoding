/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#0F172A",
          dark: "#1E293B",
          teal: "#0D9488",
          tealLight: "#14B8A6",
          orange: "#F97316",
          orangeHover: "#EA580C",
          bgLight: "#F8FAFC",
          cardBg: "#FFFFFF",
          muted: "#64748B",
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
