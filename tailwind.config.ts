// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['var(--font-bangers)'],
        body: ['var(--font-poppins)'],
      },
      colors: {
        'electric-blue': '#00BFFF',
        'cyber-magenta': '#FF00FF',
        'space-deep': '#0D0C12',
      },
      boxShadow: {
        'neon-glow': '0 0 20px rgba(0, 191, 255, 0.7)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(-4%)' },
          '50%': { transform: 'translateY(4%)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
export default config