// Common technology tags that might be used across projects and blog posts
export const TECH_TAGS = {
  BALLERINA: 'Ballerina',
  JAVA: 'Java',
  JAVASCRIPT: 'JavaScript',
  TYPESCRIPT: 'TypeScript',
  HTML: 'HTML',
  CSS: 'CSS',
  PYTHON: 'Python',
  GRAPHQL: 'GraphQL',
  ASTRO: 'Astro',
  KAFKA: 'Apache Kafka',
  GITOPS: 'GitOps',
};

// Blog post category tags
export const BLOG_CATEGORIES = {
  TECH: 'Tech',
  MOVIE_REVIEWS: 'movie reviews',
  PHILOSOPHY: 'philosophy',
  SCIFI: 'scifi',
  CRITICISM: 'criticism',
  ENVIRONMENTALISM: 'environmentalism',
  POLITICS: 'politics',
};

// Date formatting options used across the site
export const DATE_FORMAT_OPTIONS = {
  FULL: {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  } as const,
  YEAR_ONLY: {
    year: 'numeric',
  } as const
};
