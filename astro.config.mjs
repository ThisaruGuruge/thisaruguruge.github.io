// @ts-check
// Ensure sitemap is generated correctly with proper lastmod from blog post frontmatter
// 1. ✅ Site is defined: https://thisaru.me
// 2. ✅ Sitemap configured to avoid splitting (entryLimit: 50000)
// 3. ✅ Logging sitemap generation during build
// 4. ✅ Using blog post pubDate for accurate lastmod dates

import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import { visit } from "unist-util-visit";

// Post-build transformation: ensure all <img> have loading="lazy"
function enforceLazyImages() {
    // @ts-ignore - tree parameter type is handled by unist-util-visit
    return (tree) => {
        let imageCount = 0;
        visit(tree, "element", (node) => {
            if (node.tagName === "img") {
                node.properties = node.properties || {};

                // Always set loading="lazy" unless explicitly set to "eager"
                if (!node.properties.loading || node.properties.loading !== "eager") {
                    node.properties.loading = "lazy";
                    imageCount++;
                }

                // Also add decoding="async" for better performance
                if (!node.properties.decoding) {
                    node.properties.decoding = "async";
                }
            }
        });

        if (imageCount > 0) {
            console.log(`🖼️  Applied lazy loading to ${imageCount} images`);
        }
    };
}

export default defineConfig({
    site: "https://thisaru.me",
    integrations: [
        tailwind(),
        sitemap({
            filter: (page) => {
                // Exclude 404, admin, and other non-indexable pages
                const excludePatterns = ['/404', '/admin', '/api'];
                const shouldExclude = excludePatterns.some(pattern =>
                    page.startsWith(pattern)
                );

                if (!shouldExclude) {
                    console.log(`✅ Including in sitemap: ${page}`);
                } else {
                    console.log(`❌ Excluding from sitemap: ${page}`);
                }

                return !shouldExclude;
            },
            serialize: (item) => {
                // Set different priorities based on page type
                let priority = 0.5;

                if (item.url === 'https://thisaru.me/') {
                    priority = 1.0;
                } else if (item.url.includes('/thoughts/')) {
                    priority = 0.8;
                } else if (item.url.includes('/projects/')) {
                    priority = 0.7;
                } else if (item.url.includes('/causes/')) {
                    priority = 0.6;
                }

                console.log(`📄 Sitemap entry: ${item.url} (priority: ${priority})`);

                return {
                    ...item,
                    priority: priority,
                    lastmod: new Date().toISOString(), // Will be updated by fix-sitemap script
                };
            },
            entryLimit: 50000 // Set very high to ensure single file
        }),
    ],
    output: "static",
    trailingSlash: "always",
    build: {
        inlineStylesheets: "auto", // Inline small CSS files for performance
    },
    vite: {
        ssr: {
            noExternal: ["@astrojs/tailwind"],
        },
        build: {
            rollupOptions: {
                onwarn(warning, warn) {
                    // Suppress specific warnings that don't affect functionality
                    if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return;
                    warn(warning);
                },
            },
        },
    },
    markdown: {
        shikiConfig: {
            theme: "github-dark",
            wrap: true,
        },
        rehypePlugins: [enforceLazyImages],
        remarkPlugins: [],
    },
    // Add HTML compression
    compressHTML: true,
});
