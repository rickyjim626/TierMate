import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7ee',
          100: '#fdedd6',
          200: '#f9d7ac',
          300: '#f5bb77',
          400: '#f09440',
          500: '#ec771a',
          600: '#dd5d10',
          700: '#b74610',
          800: '#923815',
          900: '#763114',
          950: '#401608',
        },
      },
    },
  },
  plugins: [],
};

export default config;
