import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00BFA5',
        'primary-light': '#4DD0C4',
        'primary-dark': '#00897B',
        dark: '#3D4D52',
      },
    },
  },
  plugins: [],
}
export default config
