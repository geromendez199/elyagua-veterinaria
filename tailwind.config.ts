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
        primary: '#007869',
        'primary-light': '#2A9E8C',
        'primary-dark': '#005749',
        dark: '#3D4D52',
      },
    },
  },
  plugins: [],
}
export default config
