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
        // Primary Crown Colors
        crown: {
          orange: '#EF5200',
          terracotta: '#D2691E',
          clay: '#C65D3B',
          sunset: '#E47A3B',
          sienna: '#CD853F',
          amber: '#B8733C',
          golden: '#E89A5E',
        },
        // Royal Neutrals
        royal: {
          cream: '#FAF7F2',
          beige: '#F5EFE6',
          stone: '#E8DCC8',
          taupe: '#8B7355',
          brown: '#5C4A3A',
          gray: '#D4C4B0',
          linen: '#EDE3D5',
          espresso: '#4A3F35',
          charcoal: '#3A3A3A',
        },
        // Accent Colors
        accent: {
          copper: '#B87333',
          coral: '#FD5E53',
          sage: '#87AE73',
          success: '#A67C52',
          alert: '#C85A3F',
          warning: '#E8A35D',
        },
      },
      borderRadius: {
        'sm': '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
      },
      boxShadow: {
        'warm-sm': '0 1px 2px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.06)',
        'warm': '0 1px 3px rgba(0, 0, 0, 0.07), 0 2px 6px rgba(0, 0, 0, 0.07), 0 4px 12px rgba(0, 0, 0, 0.07)',
        'warm-lg': '0 2px 4px rgba(0, 0, 0, 0.08), 0 4px 8px rgba(0, 0, 0, 0.08), 0 8px 16px rgba(0, 0, 0, 0.08)',
        'warm-xl': '0 4px 6px rgba(0, 0, 0, 0.07), 0 8px 16px rgba(0, 0, 0, 0.07), 0 12px 24px rgba(0, 0, 0, 0.07)',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      transitionDuration: {
        '250': '250ms',
      },
    },
  },
  plugins: [],
};

export default config;
