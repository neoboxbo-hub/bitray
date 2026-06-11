/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Paleta dark, limpia y profesional
        ink: {
          900: '#0a0b0f', // fondo app
          800: '#111319', // superficies
          700: '#1a1d27', // tarjetas
          600: '#262a37', // bordes
        },
        brand: {
          DEFAULT: '#f7931a', // naranja Bitcoin (acento principal)
          soft: '#ffb454',
        },
        profit: '#16c784',
        loss: '#ea3943',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 24px -8px rgba(0,0,0,0.6)',
      },
    },
  },
  plugins: [],
}
