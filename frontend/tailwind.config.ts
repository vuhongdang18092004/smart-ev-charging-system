import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,jsx,ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        workspace: "var(--color-slate-50)",
        sidebar: "var(--color-slate-950)",
        ink: "var(--color-slate-900)",
        line: "var(--color-slate-200)",
        brand: "var(--color-blue-700)",
      },
    },
  },
} satisfies Config;
