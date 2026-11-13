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
          border: '#E5E7EB',
          borderDark: '#DBDBDB',
          bg: '#FAFAFA',
          secondary: '#737373',
          dark: '#262626',
          storyPink: '#E1306C',
          storyOrange: '#F77737',
          storyPurple: '#C13584',
          storyYellow: '#FCAF45',
        }
      },
      backgroundImage: {
        'instagram-gradient': 'linear-gradient(45deg, #F58529 0%, #FEDA77 20%, #DD2A7B 50%, #8134AF 80%, #515BD4 100%)',
        'instagram-subtle': 'linear-gradient(135deg, rgba(245,133,41,0.06) 0%, rgba(221,42,123,0.06) 50%, rgba(81,91,212,0.06) 100%)',
      },
      keyframes: {
        heartPop: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '50%': { transform: 'scale(1.3)', opacity: '0.9' },
          '100%': { transform: 'scale(1)', opacity: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        'heart-pop': 'heartPop 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'fade-in': 'fadeIn 0.25s ease-out forwards',
      }
    },
  },
  plugins: [],
}

