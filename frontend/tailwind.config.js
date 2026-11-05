/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        instagram: {
          blue: '#0095F6',
          hoverBlue: '#1877F2',
          border: '#DBDBDB',
          bg: '#FAFAFA',
          secondary: '#737373',
          dark: '#262626'
        }
      }
    },
  },
  plugins: [],
}
