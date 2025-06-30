// Remove or comment out the custom colors since we're using standard Tailwind now:
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/styles/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
    
      fontFamily: {
        lato: ['Lato', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};