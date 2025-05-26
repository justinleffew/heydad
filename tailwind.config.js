/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dad-dark': '#2C3E50',        // Deeper, richer dark blue-gray
        'dad-white': '#FEFEFE',       // Slightly warmer white
        'dad-blue-gray': '#BDC3C7',  // Softer blue-gray
        'dad-tan-gray': '#A8A5A0',   // Warmer tan-gray
        'dad-olive': '#7F8C8D',      // More sophisticated olive
        'dad-warm': '#E8E6E3',       // Warm background tone
        'dad-accent': '#C0392B',     // Rich burgundy accent
        'dad-gold': '#D4AF37',       // Legacy gold accent
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'serif': ['Merriweather', 'Georgia', 'serif'],
        'heading': ['Merriweather', 'Georgia', 'serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 30px -5px rgba(0, 0, 0, 0.04)',
        'strong': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 20px 50px -10px rgba(0, 0, 0, 0.08)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'legacy': '0 8px 32px -8px rgba(44, 62, 80, 0.3), 0 0 0 1px rgba(44, 62, 80, 0.05)',
      },
      backgroundImage: {
        'gradient-warm': 'linear-gradient(135deg, #7F8C8D 0%, #2C3E50 100%)',
        'gradient-gold': 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)',
        'gradient-subtle': 'linear-gradient(135deg, #E8E6E3 0%, #BDC3C7 100%)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
} 