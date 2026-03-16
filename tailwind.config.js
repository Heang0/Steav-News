/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#e60000',
        'primary-dark': '#cc0000',
        'primary-light': '#ff1a1a',
      },
      fontFamily: {
        khmer: ['Battambang', 'Noto Sans Khmer', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
