// Common CSS classes used across multiple components
export const CSS_CLASSES = {
  // Button variants
  BUTTON: {
    PRIMARY: 'bg-accent-cyan hover:bg-accent-cyan-dark text-background font-medium py-2 px-4 rounded-lg transition-colors',
    SECONDARY: 'bg-background-card hover:bg-background-section text-text border border-accent-cyan py-2 px-4 rounded-lg transition-colors',
    OUTLINE: 'bg-transparent hover:bg-background-section text-accent-cyan border border-accent-cyan py-2 px-4 rounded-lg transition-colors',
  },

  // Tag styles
  TAG: {
    DEFAULT: 'px-3 py-1 text-sm bg-background rounded-full text-accent-cyan',
    BLOG: 'text-sm text-accent-orange underline hover:text-accent-cyan',
  },

  // Headings
  HEADING: {
    H1: 'heading-1',
    H2: 'heading-2',
    H3: 'heading-3',
  },

  // Card styles
  CARD: {
    DEFAULT: 'bg-background-card rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300',
    INTERACTIVE: 'bg-background-card rounded-xl overflow-hidden hover:transform hover:scale-[1.02] transition-transform',
  },
};

// Common breakpoint values
export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
};

// Grid column configurations
export const GRID_COLUMNS = {
  PROJECTS: {
    MOBILE: 1,
    TABLET: 2,
    DESKTOP: 3,
  },
  GALLERY: {
    MOBILE: 1,
    TABLET: 2,
    DESKTOP: 3,
  },
};
