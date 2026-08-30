import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: "#101312",
        surface: "#181D1A",
        moss: "#84CC16",
        emerald: "#22C55E",
        lime: "#BEF264",
        "off-white": "#F5F5F4",
        muted: "#A3A3A3",
        warning: "#F59E0B",
        error: "#EF4444",
      },
      transitionTimingFunction: {
        fluid: "cubic-bezier(0.25, 1, 0.5, 1)",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
