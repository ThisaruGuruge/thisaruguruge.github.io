# Scripts

This directory contains utility scripts for maintaining and building the website.

## Available Scripts

### `optimize-images.js`
Optimizes WebP images across the website for better performance.

**Features:**
- Resizes images to appropriate dimensions for different content types
- Compresses images while maintaining quality
- Provides detailed feedback on file size savings
- Gracefully handles missing directories
- Automatically integrates with the build process

**Usage:**
```bash
npm run optimize-images
```

**Requirements:**
- WebP tools (auto-installed in CI environments):
  - GitHub Actions: Automatically installed ✅
  - Local macOS: `brew install webp`
  - Local Ubuntu: `sudo apt-get install webp`
  - Windows: Download from [Google WebP](https://developers.google.com/speed/webp/download)

**Optimization Settings:**
- Gallery images: 800px width, 80% quality
- Blog images: 600px width, 85% quality
- Lizard images: 400px width, 80% quality
- Logo images: 300px width, 90% quality

### `fix-sitemap.js`
Fixes sitemap.xml generation issues after the build process.

**Usage:**
```bash
npm run fix-sitemap
```

## Build Integration

The `optimize-images` script is automatically run as part of the build process:

```bash
npm run build
```

This ensures all images are optimized before deployment, maintaining optimal website performance.
