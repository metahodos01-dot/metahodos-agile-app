/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        metahodos: {
          // Colori dal sito originale metahodos.com
          red: {
            DEFAULT: '#E77566',
            dark: '#d65e50',
            light: '#ef8e81',
          },
          orange: {
            DEFAULT: '#F5A962',
            dark: '#e69448',
            light: '#f7b877',
          },
          green: {
            DEFAULT: '#8FBC5A',
            dark: '#7aa847',
            light: '#a3c976',
          },
          gray: {
            DEFAULT: '#5A5A5A',
            50: '#f9fafb',
            100: '#f3f4f6',
            200: '#e5e7eb',
            300: '#d1d5db',
            400: '#9ca3af',
            500: '#6b7280',
            600: '#5A5A5A',
            700: '#4a4a4a',
            800: '#3a3a3a',
            900: '#2a2a2a',
          },
          text: {
            primary: '#2c2c2c',
            secondary: '#5A5A5A',
            muted: '#9ca3af',
          },
        },
        success: '#8FBC5A',
        warning: '#F5A962',
        error: '#E77566',
        info: '#0693e3',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        'natural': '6px 6px 9px rgba(0, 0, 0, 0.2)',
        'deep': '12px 12px 50px rgba(0, 0, 0, 0.4)',
        'sharp': '6px 6px 0px rgba(0, 0, 0, 0.2)',
        'crisp': '6px 6px 0px rgba(0, 0, 0, 1)',
      },
      spacing: {
        'container-content': '800px',
        'container-wide': '1200px',
        'container-full': '1400px',
      },
      maxWidth: {
        'content': '800px',
        'wide': '1200px',
        'full': '1400px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
