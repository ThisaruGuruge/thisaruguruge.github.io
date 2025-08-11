/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
    './public/**/*.html'
  ],
  safelist: [
    // Gallery grid columns
    'lg:grid-cols-2',
    'lg:grid-cols-3', 
    'lg:grid-cols-4',
    // Mobile menu classes
    'translate-x-full',
    'backdrop-blur-sm',
    'bg-black/40'
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-bg)',
        'background-card': 'var(--color-bg-card)',
        'background-section': 'var(--color-bg-section)',
        'background-accent': 'var(--color-bg-accent)',
        text: 'var(--color-text)',
        'text-light': 'var(--color-text-light)',
        'text-muted': 'var(--color-text-muted)',
        'text-muted-dark': 'var(--color-text-muted-dark)',
        'accent-cyan': 'var(--color-accent-cyan)',
        'accent-orange': 'var(--color-accent-orange)',
        'border-accent': 'var(--color-border-accent)',
        'gray-400': 'var(--color-gray-400)',
        'gray-500': 'var(--color-gray-500)',
        'gray-700': 'var(--color-gray-700)',
        'gray-300': 'var(--color-gray-300)',
        'gray-100': 'var(--color-gray-100)',
        'gray-50': 'var(--color-gray-50)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Fira Sans', 'system-ui', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            color: 'var(--color-text)',
            '.prose a[href^="http"]:not(:has(img)):not(.no-external-icon)': {
              color: 'var(--color-accent-cyan)',
              '&:hover': {
                color: 'var(--color-accent-orange)',
              },
              '&::after': {
                content: '" ↗"',
                display: 'inline-block',
                marginLeft: '0.2em',
              },
            },
            strong: {
              color: 'var(--color-text)',
            },
            h1: {
              color: 'var(--color-text)',
            },
            h2: {
              color: 'var(--color-text)',
            },
            h3: {
              color: 'var(--color-text)',
            },
            h4: {
              color: 'var(--color-text)',
            },
            code: {
              color: 'var(--color-text)',
              backgroundColor: 'var(--color-bg-card)',
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
              backgroundColor: 'var(--color-bg-card)',
              color: 'var(--color-text)',
              padding: '1.25em',
              borderRadius: '0.5em',
              overflowX: 'auto',
              whiteSpace: 'pre',
              '&::-webkit-scrollbar': {
                height: '0.5em',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'var(--color-bg-section)',
                borderRadius: '0.25em',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'var(--color-gray-500)',
                borderRadius: '0.25em',
                '&:hover': {
                  backgroundColor: 'var(--color-gray-400)',
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
              color: 'var(--color-text-muted)',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography')({
      modifiers: [], // Remove extra modifiers like prose-lg, prose-xl etc.
    }),
  ],
};
