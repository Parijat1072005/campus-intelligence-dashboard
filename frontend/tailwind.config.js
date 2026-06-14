/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        campus: {
          bg:           "#F0F2F5",   // page background — light gray like Amazon
          surface:      "#FFFFFF",   // sidebar, header, nav — pure white
          card:         "#FFFFFF",   // card backgrounds — white
          border:       "#D5D9D9",   // borders — warm light gray
          accent:       "#2563EB",   // primary actions — rich blue
          "accent-soft":"#1D4ED8",   // button hover
          indigo:       "#4F46E5",   // secondary accent
          teal:         "#0D9488",   // teal highlights
          amber:        "#D97706",   // amber highlights
          rose:         "#E11D48",   // error/rose
          text:         "#0F1111",   // primary text — near black
          muted:        "#565959",   // secondary text — Amazon gray
          dim:          "#8D9096",   // placeholder / very subtle text
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "system-ui", "sans-serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "slide-up": "slideUp 0.3s ease-out",
        "fade-in": "fadeIn 0.4s ease-out",
        "typing": "typing 1.2s steps(3, end) infinite",
      },
      keyframes: {
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        typing: {
          "0%, 100%": { content: "'.'" },
          "33%": { content: "'..'" },
          "66%": { content: "'...'" },
        },
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(59,130,246,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.05) 1px, transparent 1px)",
      },
      backgroundSize: {
        "grid": "40px 40px",
      },
    },
  },
  plugins: [],
};
