/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dad-dark': '#353535',
        'dad-white': '#FFFFFF',
        'dad-blue-gray': '#D2D7DF',
        'dad-tan-gray': '#BDBBB0',
        'dad-olive': '#8A897C',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 