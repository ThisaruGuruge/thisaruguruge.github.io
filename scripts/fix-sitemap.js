#!/usr/bin/env node

import { readFileSync, existsSync, unlinkSync, writeFileSync, readdirSync } from 'fs';
import { join, extname } from 'path';
import matter from 'gray-matter';

const distDir = './dist';
const contentDir = './src/content/blog';
const sitemapIndex = join(distDir, 'sitemap-index.xml');
const sitemap0 = join(distDir, 'sitemap-0.xml');
const sitemapFinal = join(distDir, 'sitemap.xml');

console.log('🔧 Fixing sitemap files and updating blog post dates...');

// Function to get blog post dates
function getBlogPostDates() {
  const blogDates = new Map();

  if (!existsSync(contentDir)) {
    console.log('⚠️  No blog content directory found');
    return blogDates;
  }

  try {
    const files = readdirSync(contentDir);

    files.forEach(file => {
      if (extname(file) === '.md' || extname(file) === '.mdx') {
        const filePath = join(contentDir, file);
        const content = readFileSync(filePath, 'utf8');
        const { data } = matter(content);

        if (data.pubDate) {
          const slug = file.replace(/\.(md|mdx)$/, '');
          const url = `https://thisaru.me/thoughts/${slug}/`;
          blogDates.set(url, new Date(data.pubDate).toISOString());
          console.log(`📅 Found blog post: ${slug} -> ${data.pubDate}`);
        }
      }
    });
  } catch (error) {
    console.log('⚠️  Error reading blog posts:', error.message);
  }

  return blogDates;
}

try {
  // Get blog post dates
  const blogDates = getBlogPostDates();

  // Check if sitemap-0.xml exists (this is the actual sitemap content)
  if (existsSync(sitemap0)) {
    // Read and update sitemap content
    let sitemapContent = readFileSync(sitemap0, 'utf8');

    // Update lastmod dates for blog posts
    blogDates.forEach((date, url) => {
      const urlPattern = new RegExp(`(<loc>${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</loc>\\s*<lastmod>)[^<]+(</lastmod>)`, 'g');
      sitemapContent = sitemapContent.replace(urlPattern, `$1${date}$2`);
      console.log(`🔄 Updated lastmod for ${url} to ${date}`);
    });

    // Write updated content to final sitemap
    writeFileSync(sitemapFinal, sitemapContent);

    // Remove the original sitemap-0.xml
    unlinkSync(sitemap0);
    console.log('✅ Updated sitemap.xml with blog post dates');

  } else if (existsSync(sitemapFinal)) {
    console.log('✅ sitemap.xml already exists');
  } else {
    console.log('⚠️  No sitemap files found');
  }

  // Remove sitemap-index.xml if it exists
  if (existsSync(sitemapIndex)) {
    unlinkSync(sitemapIndex);
    console.log('✅ Removed sitemap-index.xml');
  }

  // Verify final sitemap exists and count URLs
  if (existsSync(sitemapFinal)) {
    const content = readFileSync(sitemapFinal, 'utf8');
    const urlCount = (content.match(/<url>/g) || []).length;
    const blogCount = blogDates.size;
    console.log(`✅ Single sitemap.xml created with ${urlCount} URLs (${blogCount} with blog dates)`);
  } else {
    console.error('❌ Failed to create sitemap.xml');
    process.exit(1);
  }

} catch (error) {
  console.error('❌ Error fixing sitemap:', error.message);
  process.exit(1);
}
