import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

// Blog post utilities
export async function getSortedBlogPosts(limit?: number): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getCollection('blog');
  const sortedPosts = posts.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
  return limit ? sortedPosts.slice(0, limit) : sortedPosts;
}

export async function getRecentBlogPosts(count: number = 3): Promise<CollectionEntry<'blog'>[]> {
  return getSortedBlogPosts(count);
}

// Project utilities
export async function getAllProjects(): Promise<CollectionEntry<'projects'>[]> {
  return getCollection('projects');
}

export async function getFeaturedProjects(): Promise<CollectionEntry<'projects'>[]> {
  const projects = await getCollection('projects');
  return projects.filter(project => project.data.featured);
}

// Causes utilities
export async function getSortedCauses(limit?: number): Promise<CollectionEntry<'causes'>[]> {
  const causes = await getCollection('causes');
  const sortedCauses = causes.sort((a, b) => b.data.fromYear - a.data.fromYear);
  return limit ? sortedCauses.slice(0, limit) : sortedCauses;
}

export async function getRecentCauses(count: number = 3): Promise<CollectionEntry<'causes'>[]> {
  return getSortedCauses(count);
}

// Photo utilities
export async function getAllPhotos(): Promise<CollectionEntry<'photos'>[]> {
  const photos = await getCollection('photos');
  return photos.sort((a, b) => (a.data.order || 99) - (b.data.order || 99));
}

export async function getFeaturedPhotos(count?: number): Promise<CollectionEntry<'photos'>[]> {
  const photos = await getCollection('photos');
  const featured = photos.filter(photo => photo.data.featured);
  return count ? featured.slice(0, count) : featured;
}

// Gallery image transformation utility
export function transformPhotosForGallery(photos: CollectionEntry<'photos'>[]) {
  return photos.map(photo => ({
    src: photo.data.image,
    alt: photo.data.title,
    caption: photo.data.caption,
    categories: photo.data.categories,
    featured: photo.data.featured
  }));
}