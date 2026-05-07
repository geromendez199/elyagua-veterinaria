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
        primary: '#009f8d',
        'primary-light': '#75c6bd',
        'primary-dark': '#3d6171',
        accent: '#47868f',
        'gray-brand': '#606163',
      },
    },
  },
  plugins: [],
}
export default config
