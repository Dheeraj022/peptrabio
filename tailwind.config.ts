import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#672CAE",
          dark: "#57239A",
          light: "#F2EAFA",
          subtle: "#FAF8FD",
          border: "#E7E2EC",
          "border-strong": "#D7CDE1",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          soft: "#FAFAFC",
          muted: "#F4F2F7",
        },
        content: {
          primary: "#111111",
          secondary: "#5F5F6B",
          muted: "#858591",
        },
        accent: {
          success: "#2E7D5B",
          warning: "#B7791F",
          danger: "#B42318",
        }
      },
      fontFamily: {
        orbitron: ["'Orbitron'", "var(--font-orbitron)", "sans-serif"],
        sans: ["var(--font-inter)", "'Inter'", "system-ui", "-apple-system", "sans-serif"],
        secondary: ["var(--font-inter)", "'Inter'", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        'purple-glow': '0 0 25px -5px rgba(103, 44, 174, 0.25)',
        'purple-sm': '0 4px 14px 0 rgba(103, 44, 174, 0.15)',
        'card-hover': '0 12px 28px -4px rgba(103, 44, 174, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        '2xl': '18px',
      }
    },
  },
  plugins: [],
};
export default config;
