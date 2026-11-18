/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#111113',
        paper: '#fafafa',
        card: '#ffffff',
        line: '#e8e8ea',
        soft: '#6b6b72',
      },
      fontFamily: {
        display: ['"Inter Tight"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(17,17,19,0.04), 0 8px 24px -12px rgba(17,17,19,0.1)',
        lift: '0 2px 4px rgba(17,17,19,0.06), 0 20px 44px -20px rgba(17,17,19,0.18)',
      },
    },
  },
  plugins: [],
};
