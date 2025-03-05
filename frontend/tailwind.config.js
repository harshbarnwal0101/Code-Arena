module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366f1',
          dark: '#4f46e5',
          light: '#818cf8'
        },
        secondary: {
          DEFAULT: '#9333ea',
          dark: '#7e22ce',
          light: '#a855f7'
        },
        background: {
          DEFAULT: '#0f172a',
          paper: '#1e293b'
        },
        text: {
          primary: '#f8fafc',
          secondary: '#94a3b8'
        }
      },
      boxShadow: {
        'neumorphic': '20px 20px 60px #0c1322, -20px -20px 60px #121b32',
      }
    }
  },
  plugins: [],
} 