import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // =====================================================
        // PORTFOLIO THEME COLORS (Matching Home Page)
        // Background: Deep Navy Purple #0e0e34
        // =====================================================
        indigo: {
          DEFAULT: "#0E0E34",
          deep: "#0E0E34",
          dark: "#090924",
          light: "#141444",
        },
        // Semantic tokens (admin panel uses these)
        background: "#0e0e34",
        foreground: "#F7F6F7",
        // Surface layers (cards, sidebars, panels)
        surface: {
          50: "#141444",   // card bg
          100: "#1a1a52",  // slightly lighter
          200: "#20205e",  // hover state
          300: "#262670",  // active border
        },
        // Primary Action Color (Purple)
        primary: {
          DEFAULT: "#8b5cf6",
          hover: "#7c3aed",
          glow: "rgba(139, 92, 246, 0.35)",
        },
        // Secondary Action Color (Cyan)
        secondary: {
          DEFAULT: "#22d3ee",
          hover: "#06b6d4",
          glow: "rgba(34, 211, 238, 0.35)",
        },
        // Accent palette
        accent: {
          purple: "#8b5cf6",
          indigo: "#6366f1",
          cyan: "#22d3ee",
          violet: "#7c3aed",
          pearl: "#F7F6F7",
        },
        // Border utilities
        border: {
          subtle: "rgba(139, 92, 246, 0.22)",
          purple: "rgba(139, 92, 246, 0.35)",
          cyan: "rgba(34, 211, 238, 0.25)",
          glow: "rgba(139, 92, 246, 0.5)",
        },
        // Typography colors
        text: {
          primary: "#F7F6F7",
          secondary: "#c4b5fd",
          muted: "#94a3b8",
          accent: "#22d3ee",
          cyan: "#22d3ee",
          plum: "#c4b5fd",
        },
        // Keep original palette names for backwards compat
        royal: {
          DEFAULT: "#6366f1",
          dark: "#4338ca",
          light: "#818cf8",
        },
        cyan: {
          DEFAULT: "#22d3ee",
          dark: "#0891b2",
          light: "#67e8f9",
        },
        plum: {
          DEFAULT: "#8b5cf6",
          dark: "#7c3aed",
          light: "#a78bfa",
        },
        periwinkle: {
          DEFAULT: "#6366f1",
          dark: "#4f46e5",
          light: "#818cf8",
        },
        pearl: {
          DEFAULT: "#F7F6F7",
          pure: "#FFFFFF",
          soft: "#e2e8f0",
          muted: "#94a3b8",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        heading: ["var(--font-poppins)", "Poppins", "sans-serif"],
        display: ["var(--font-poppins)", "Poppins", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 35px -5px rgba(139, 92, 246, 0.38)",
        "glow-purple": "0 0 35px -5px rgba(139, 92, 246, 0.45)",
        "glow-cyan": "0 0 35px -5px rgba(34, 211, 238, 0.45)",
        "glow-indigo": "0 0 45px -5px rgba(99, 102, 241, 0.5)",
        "glow-subtle": "0 10px 30px -10px rgba(14, 14, 52, 0.8)",
        "glow-plum": "0 0 35px -5px rgba(139, 92, 246, 0.45)",
        "glow-royal": "0 0 45px -5px rgba(99, 102, 241, 0.5)",
        card: "0 18px 45px -12px rgba(9, 9, 36, 0.85)",
      },
      animation: {
        "float-slow": "float 8s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "shimmer": "shimmer 2.5s linear infinite",
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-in-left": "slideInLeft 0.4s ease-out forwards",
        "spin-slow": "spin 20s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-12px) rotate(0.8deg)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        fadeIn: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          from: { opacity: "0", transform: "translateX(-20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
      },
      backgroundImage: {
        "gradient-purple-cyan":
          "linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #22d3ee 100%)",
        "gradient-hero":
          "linear-gradient(135deg, #0e0e34 0%, #141444 50%, #1a1a52 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
