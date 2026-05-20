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
        ink: "#08090d",
        coal: "#101116",
        smoke: "#1b1d24",
        bone: "#f2efe7",
        muted: "#a9a39a",
        amberline: "#c9a35b",
        signal: "#8fb8ff",
      },
      boxShadow: {
        cinematic: "0 24px 80px rgba(0, 0, 0, 0.42)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
