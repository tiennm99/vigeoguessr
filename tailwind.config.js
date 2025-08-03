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
        primary: {
          DEFAULT: '#05A38C',
          hover: '#048a76',
        },
        background: {
          DEFAULT: '#1a1a1a',
          secondary: '#24453D',
        },
        text: {
          DEFAULT: '#e6f4e6',
          secondary: '#ccc',
        }
      },
      fontFamily: {
        'jersey': ['Jersey 15', 'cursive'],
        'courier': ['Courier', 'monospace'],
      },
    },
  },
  plugins: [],
}