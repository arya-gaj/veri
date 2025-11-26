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
        wicked: {
          black: "#0a0a0a",
          green: "#00ff88",
          "green-dark": "#00cc6a",
          pink: "#ff6b9d",
          "pink-soft": "#ffb3d9",
          gray: "#1a1a1a",
          "gray-light": "#2a2a2a",
        },
      },
      fontFamily: {
        wicked: ["Wicked", "serif"],
        heading: ["Inter", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Courier New", "monospace"],
      },
      boxShadow: {
        "glow-green": "0 0 20px rgba(0, 255, 136, 0.3)",
        "glow-pink": "0 0 20px rgba(255, 107, 157, 0.3)",
      },
    },
  },
  plugins: [],
};
export default config;
