/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Light theme (default)
        background: '#ffffff',
        text: '#1a202c',
        // Accent colors (shared)
        accent: {
          cyan: '#4ECDC4',
          orange: '#FF6B6B',
        },
        'accent-orange': '#ff6b35',
        'accent-cyan': '#4ecdc4',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Fira Sans', 'system-ui', 'sans-serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#e2e8f0',
            '.prose a[href^="http"]:not(:has(img)):not(.no-external-icon)': {
              color: '#4ecdc4',
              '&:hover': {
                color: '#ff6b35',
              },
              '&::after': {
                content: '" ↗"',
                display: 'inline-block',
                marginLeft: '0.2em',
              },
            },
            strong: {
              color: '#e2e8f0',
            },
            h1: {
              color: '#e2e8f0',
            },
            h2: {
              color: '#e2e8f0',
            },
            h3: {
              color: '#e2e8f0',
            },
            h4: {
              color: '#e2e8f0',
            },
            code: {
              color: '#e2e8f0',
              backgroundColor: '#1e1e1e',
              padding: '0.2em 0.4em',
              borderRadius: '0.25em',
              fontWeight: '400',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            pre: {
              backgroundColor: '#1e1e1e',
              color: '#e2e8f0',
              padding: '1.25em',
              borderRadius: '0.5em',
              overflowX: 'auto',
              whiteSpace: 'pre',
              '&::-webkit-scrollbar': {
                height: '0.5em',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: '#2d2d2d',
                borderRadius: '0.25em',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#4d4d4d',
                borderRadius: '0.25em',
                '&:hover': {
                  backgroundColor: '#5d5d5d',
                },
              },
            },
            'pre code': {
              backgroundColor: 'transparent',
              padding: '0',
              borderRadius: '0',
              color: 'inherit',
              whiteSpace: 'pre',
            },
            blockquote: {
              color: '#94a3b8',
            },
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
