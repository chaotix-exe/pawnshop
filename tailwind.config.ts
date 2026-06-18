import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#10140f", panel: "#191d17", panel2: "#20261d", line: "#2c3327",
        green: "#3ddc4a", greend: "#2E7D32", red: "#e23b3b", redd: "#C62828",
        cream: "#f3f0e6", muted: "#9aa593", gold: "#f0c43c",
      },
    },
  },
  plugins: [],
} satisfies Config;
