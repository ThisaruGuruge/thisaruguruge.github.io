import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    author: z.string().default('Thisaru'),
    image: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    image: z.string().optional(),
    tags: z.array(z.string()).optional(),
    githubUrl: z.string().optional(),
    demoUrl: z.string().optional(),
    featured: z.boolean().optional(),
  }),
});

const causes = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    position: z.string(),
    fromYear: z.number(),
    toYear: z.number().optional(),
    description: z.string(),
    icon: z.string(),
  }),
});

const photos = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    caption: z.string(),
    image: z.string(),
    categories: z.array(z.enum(['Wildlife Photography', 'Music', 'Hiking', 'Reptiles'])),
    featured: z.boolean().optional().default(false),
    order: z.number().optional(),
  }),
});

export const collections = {
  blog,
  projects,
  causes,
  photos,
};
