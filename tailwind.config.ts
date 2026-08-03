import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#060A12",
          900: "#0A0F1D",
          800: "#111827",
          700: "#1F2937",
          600: "#374151",
        },
        teal: {
          500: "#14B8A6",
          600: "#0D9488",
          700: "#0F766E",
        },
        electric: {
          500: "#3B82F6",
          600: "#2563EB",
        },
      },
    },
  },
  plugins: [],
};
export default config;
