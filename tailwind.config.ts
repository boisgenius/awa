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
        // 背景色
        'bg-primary': '#000000',
        'bg-secondary': '#0D0D0D',
        'bg-tertiary': '#1A1A1A',
        'bg-hover': '#252525',
        'bg-card': 'rgba(13, 13, 13, 0.9)',
        'bg-sidebar': '#0E0E12',

        // 主题色
        'crimson': '#E40F3A',
        'crimson-light': '#FF4757',
        'burgundy': '#770524',

        // 功能色
        'accent-secondary': '#00FF88',
        'accent-warning': '#FFD93D',
        'accent-danger': '#FF4757',
        'accent-info': '#7C3AED',
        'accent-teal': '#00D9A0',

        // 文字色
        'text-primary': '#FFFFFF',
        'text-secondary': '#A0A0A0',
        'text-muted': '#6B7280',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'monospace'],
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
      },
      spacing: {
        'sidebar': '220px',
      },
    },
  },
  plugins: [],
};

export default config;
