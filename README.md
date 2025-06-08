# Thisaru Guruge's Personal Website

A modern, performant personal website and blog built with Astro, showcasing projects, thoughts, and photography.

🌐 **Live Site**: [thisaru.me](https://thisaru.me)

## ✨ Features

- 🎨 **Modern Design**: Dark theme with cyan and orange accent colors
- 📱 **Fully Responsive**: Optimized for all devices and screen sizes
- 🚀 **High Performance**: Static site generation with optimal loading speeds
- 📝 **Blog System**: Markdown-based blog with syntax highlighting
- 🔍 **SEO Optimized**: Complete meta tags, JSON-LD schemas, and sitemap
- 🖼️ **Image Optimization**: Automated image processing and WebP support
- 🌍 **Social Integration**: Open Graph and Twitter Card support
- 🦎 **Interactive 404**: Custom 404 page with randomized wildlife facts and lizard images
- 🎯 **Accessibility**: WCAG compliant with proper semantic HTML
- 📊 **Analytics Ready**: Structured data for rich snippets and search results

## 🛠️ Tech Stack

- **Framework**: [Astro](https://astro.build) v4.4.15
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **Language**: [TypeScript](https://www.typescriptlang.org)
- **Content**: Markdown with frontmatter
- **Icons**: Custom SVG icons and emojis
- **Deployment**: GitHub Pages with automated CI/CD

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/thisaruguruge/thisaruguruge.github.io.git
   cd thisaruguruge.github.io
   ```

2. **Install dependencies**:
   ```bash
   npm ci
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```
   Visit `http://localhost:4321` in your browser

4. **Build for production**:
   ```bash
   npm run build
   ```

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── schemas/         # JSON-LD structured data components
│   ├── Header.astro     # Site navigation
│   ├── Footer.astro     # Site footer
│   └── ...
├── content/             # Blog posts and content
│   └── blog/           # Markdown blog posts
├── layouts/             # Page layouts
│   ├── Layout.astro    # Base layout with schemas
│   └── BlogLayout.astro # Blog post layout
├── pages/               # File-based routing
│   ├── index.astro     # Homepage
│   ├── projects/       # Projects showcase
│   ├── thoughts/       # Blog system
│   ├── off-duty/       # Photography portfolio
│   └── 404.astro       # Custom 404 page
├── constants/           # Site constants and data
│   └── wildlifeFacts.ts # Random facts for 404 page
└── styles/              # Global styles and utilities
```

## 🔧 Key Features Explained

### JSON-LD Structured Data
- **Person Schema**: Professional profile with job title and social links
- **Website Schema**: Site information with search functionality
- **Article Schema**: Blog post metadata with publication dates and keywords
- **Breadcrumb Schema**: Navigation structure for better SEO

### Custom 404 Page
- Randomized Sri Lankan wildlife facts
- Dynamic lizard images (6 variations)
- Smooth animations and transitions
- Navigation shortcuts to main sections

### Blog System
- Markdown-based posts with frontmatter
- Automatic excerpt generation
- Publication and update date tracking
- Tag-based categorization
- Responsive image handling

## 🚀 Deployment

The site is automatically deployed to GitHub Pages using GitHub Actions:

1. **Push changes** to the `main` branch
2. **GitHub Actions** automatically builds the site
3. **Site deploys** to [thisaru.me](https://thisaru.me)

### Manual Deployment
```bash
npm run build
npm run preview  # Preview locally before deploying
```

## 🎨 Customization

### Theme Colors
Modify colors in `tailwind.config.mjs`:
```js
colors: {
  'accent-cyan': '#22d3ee',
  'accent-orange': '#fb923c',
  // ... other colors
}
```

### Content Management
- **Blog posts**: Add Markdown files to `src/content/blog/`
- **Projects**: Update `src/pages/projects/index.astro`
- **Personal info**: Modify components and schemas
- **Wildlife facts**: Edit `src/constants/wildlifeFacts.ts`

### SEO & Schema
- **Person schema**: Update `src/components/schemas/PersonSchema.astro`
- **Site metadata**: Modify `src/layouts/Layout.astro`
- **Article metadata**: Edit individual blog post frontmatter

## 📝 Commands

| Command | Action |
|---------|--------|
| `npm run dev` | Start development server at `localhost:4321` |
| `npm run build` | Build production site to `./dist/` |
| `npm run preview` | Preview build locally |
| `npm run astro check` | Check for TypeScript/Astro errors |
| `npm ci` | Clean install of exact dependencies |

## 🌟 Performance

- **Lighthouse Score**: 100/100 across all categories
- **Static Generation**: All pages pre-rendered at build time
- **Image Optimization**: Automatic WebP conversion and responsive images
- **Code Splitting**: JavaScript loaded only where needed
- **Minimal Bundle**: Essential code only, ~KB total

## 📄 License

MIT License - feel free to use this code for your own projects!

---

Built with ❤️ by [Thisaru Guruge](https://thisaru.me) using Astro
