// Define a type for photo categories
export type PhotoCategory = {
  id: string;
  name: string;
  icon: string;
};

// Define all available photo categories
export const PHOTO_CATEGORIES: PhotoCategory[] = [
  { id: 'Wildlife Photography', name: 'Wildlife', icon: '🦁' },
  { id: 'Music', name: 'Music', icon: '🎸' },
  { id: 'Hiking', name: 'Hiking', icon: '🥾' },
  { id: 'Reptiles', name: 'Reptiles', icon: '🐍' }
];

// Define the category IDs as a tuple with at least one element for Zod schema
export const PHOTO_CATEGORY_IDS = [
  'Wildlife Photography',
  'Music',
  'Hiking',
  'Reptiles'
] as const;

// Create the "All" category for filtering (not included in content schema)
export const ALL_PHOTO_CATEGORIES = [
  { id: 'All', name: 'All Photos', icon: '📷' },
  ...PHOTO_CATEGORIES
];
