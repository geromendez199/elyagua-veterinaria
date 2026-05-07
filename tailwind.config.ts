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
        primary: '#1BA098',
        'primary-light': '#6EBDB3',
        'primary-dark': '#4A8D89',
        dark: '#3D4D52',
      },
    },
  },
  plugins: [],
}
export default config
