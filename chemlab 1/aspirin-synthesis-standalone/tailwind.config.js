/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "chemistry-blue": {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
        "lab-amber": {
          100: "#fef3c7",
          150: "#fde68a",
          200: "#fcd34d",
          300: "#f59e0b",
        },
      },
      animation: {
        "bounce-slow": "bounce 2s infinite",
        "pulse-slow": "pulse 3s infinite",
        "spin-slow": "spin 3s linear infinite",
      },
      scale: {
        102: "1.02",
      },
    },
  },
  plugins: [],
};
