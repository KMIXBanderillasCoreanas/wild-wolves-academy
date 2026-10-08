import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        wolf: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          900: '#7c2d12',
          dark: '#070b14',
          card: '#0f172a',
          border: '#1e293b',
          accent: '#38bdf8'
        },
        surface: "#10131a",
        "surface-dim": "#10131a",
        "surface-bright": "#363941",
        "surface-variant": "#32353d",
        "surface-container-lowest": "#0b0e15",
        "surface-container-low": "#191b23",
        "surface-container": "#1d2027",
        "surface-container-high": "#272a32",
        "surface-container-highest": "#32353d",
        "on-surface": "#e0e2ec",
        "on-surface-variant": "#e2bfb2",
        primary: "#ffb599",
        "primary-container": "#f66018",
        "on-primary": "#5a1c00",
        "on-primary-container": "#4f1700",
        secondary: "#7bd0ff",
        "secondary-container": "#00a6e0",
        "on-secondary": "#00354a",
        "on-secondary-container": "#00374d",
        tertiary: "#4ae176",
        "tertiary-container": "#00a74b",
        "on-tertiary": "#003915",
        error: "#ffb4ab",
        "error-container": "#93000a",
        "on-error-container": "#ffdad6",
        outline: "#a98a7e",
      },
    },
  },
  plugins: [],
};
export default config;
