/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        clinic: {
          bg: "#F6F4EE",
          surface: "#FFFFFF",
          ink: "#262422",
          "ink-soft": "#5C564F",
          "ink-muted": "#8A847C",
          primary: "#1F3A2B",
          "primary-deep": "#14271C",
          "primary-soft": "#EAF2ED",
          accent: "#A4523B",
          "accent-deep": "#7E3B27",
          "accent-soft": "#F9EDE9",
          terracotta: "#A4523B",
          "terracotta-deep": "#7E3B27",
          "terracotta-soft": "#F9EDE9",
          line: "#E2DDD2",
          "line-dark": "#CDC6B8",
          danger: "#A63A2E",
          "danger-bg": "#F9EBEA",
          success: "#2D6A4F",
          "success-bg": "#EAF4EE",
          warning: "#B36B24",
          "warning-bg": "#FAF0E3",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Noto Serif Thai", "serif"],
        body: ["var(--font-body)", "Noto Sans Thai", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        card: "14px",
        control: "8px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
};
