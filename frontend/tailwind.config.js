/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        clinic: {
          bg: "#F2F4EE",
          surface: "#FFFFFF",
          ink: "#23211D",
          "ink-soft": "#55584C",
          primary: "#2F5233",
          "primary-deep": "#1D3A22",
          accent: "#B9832A",
          "accent-deep": "#8C631D",
          line: "#D9D3B8",
          danger: "#A6402F",
          "danger-bg": "#F7E9E6",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Noto Serif Thai", "serif"],
        body: ["var(--font-body)", "Noto Sans Thai", "sans-serif"],
      },
      borderRadius: {
        card: "14px",
        control: "8px",
      },
    },
  },
  plugins: [],
};
