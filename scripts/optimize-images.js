#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, statSync, readdirSync } from 'fs';
import path from 'path';
import os from 'os';

console.log('🖼️  Starting image optimization...');

// Function to install WebP tools
function installWebPTools() {
  const platform = os.platform();
  const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';

  console.log(`🔧 Installing WebP tools for ${platform}${isCI ? ' (CI environment)' : ''}...`);

  try {
    switch (platform) {
      case 'linux':
        // Most CI environments including GitHub Actions use Ubuntu
        console.log('   📦 Updating package lists...');
        execSync('sudo apt-get update -qq', { stdio: 'pipe' });
        console.log('   📦 Installing WebP tools...');
        execSync('sudo apt-get install -y webp', { stdio: 'inherit' });
        console.log('✅ WebP tools installed successfully!');
        break;

      case 'darwin':
        // macOS
        if (isCI) {
          execSync('brew install webp', { stdio: 'inherit' });
        } else {
          console.log('🍎 Please install WebP tools manually: brew install webp');
          process.exit(1);
        }
        break;

      case 'win32':
        // Windows - harder to auto-install, provide instructions
        console.error('🪟 Please install WebP tools manually:');
        console.error('   Download from: https://developers.google.com/speed/webp/download');
        console.error('   Or use chocolatey: choco install webp');
        process.exit(1);

      default:
        console.error(`❌ Unsupported platform: ${platform}`);
        console.error('   Please install WebP tools manually');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Failed to install WebP tools:', error.message);
    console.error('   Please install manually:');
    console.error('   - Ubuntu/Debian: sudo apt-get install webp');
    console.error('   - macOS: brew install webp');
    console.error('   - Windows: https://developers.google.com/speed/webp/download');
    process.exit(1);
  }
}

// Check if cwebp is available, install if not
try {
  execSync('which cwebp', { stdio: 'ignore' });
  console.log('✅ WebP tools already available');
} catch (error) {
  console.log('⚠️  WebP tools not found, attempting to install...');
  installWebPTools();

  // Verify installation worked
  try {
    execSync('which cwebp', { stdio: 'ignore' });
    console.log('✅ WebP tools installation verified');
  } catch (verifyError) {
    console.error('❌ WebP tools installation failed');
    process.exit(1);
  }
}

// Function to optimize images in a directory
function optimizeImages(dir, maxWidth, quality) {
  if (!existsSync(dir)) {
    console.log(`⚠️  Directory ${dir} does not exist, skipping...`);
    return;
  }

  console.log(`📁 Processing directory: ${dir}`);
  console.log(`   Max width: ${maxWidth}px, Quality: ${quality}%`);

  const files = readdirSync(dir).filter(file => file.endsWith('.webp'));

  if (files.length === 0) {
    console.log('   No WebP files found, skipping...');
    return;
  }

  let totalSavings = 0;
  let processedCount = 0;

  for (const file of files) {
    const filePath = path.join(dir, file);
    const tempPath = path.join(dir, `temp_${file}`);

    try {
      console.log(`   🔧 Optimizing ${file}...`);

      // Get original size
      const originalSize = statSync(filePath).size;

      // Create optimized version
      execSync(`cwebp -resize ${maxWidth} 0 -q ${quality} -m 6 "${filePath}" -o "${tempPath}"`,
        { stdio: 'pipe' });

      // Get new size
      const newSize = statSync(tempPath).size;
      const savings = originalSize - newSize;

      if (savings > 0) {
        // Replace original with optimized version
        execSync(`mv "${tempPath}" "${filePath}"`);
        console.log(`      ✅ Saved ${formatBytes(savings)} (${Math.round((savings/originalSize)*100)}% reduction)`);
        totalSavings += savings;
        processedCount++;
      } else {
        // Remove temp file and keep original
        execSync(`rm "${tempPath}"`);
        console.log(`      ⚠️  No improvement, keeping original`);
      }
    } catch (error) {
      console.error(`      ❌ Error optimizing ${file}:`, error.message);
      // Clean up temp file if it exists
      if (existsSync(tempPath)) {
        execSync(`rm "${tempPath}"`);
      }
    }
  }

  if (processedCount > 0) {
    console.log(`   📊 Total savings in ${dir}: ${formatBytes(totalSavings)} (${processedCount} files optimized)`);
  }
}

// Helper function to format bytes
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Main optimization process
try {
  const startTime = Date.now();

  // Define optimization settings for different image types
  const optimizationSettings = [
    { dir: 'public/images/gallery', maxWidth: 800, quality: 80 },
    { dir: 'public/images/blog/tenet', maxWidth: 600, quality: 85 },
    { dir: 'public/images/blog/inception', maxWidth: 600, quality: 85 },
    { dir: 'public/images/blog/graphql-federation-with-ballerina-part-I', maxWidth: 600, quality: 85 },
    { dir: 'public/images/blog/graphql-subscriptions-with-apache-kafka-in-ballerina', maxWidth: 600, quality: 85 },
    { dir: 'public/images/lizards', maxWidth: 400, quality: 80 },
    { dir: 'public/images/logos', maxWidth: 300, quality: 90 },
  ];

  // Process all directories
  for (const setting of optimizationSettings) {
    optimizeImages(setting.dir, setting.maxWidth, setting.quality);
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log(`🎉 Image optimization complete! (${duration}s)`);
  console.log('💡 Tip: Run this script whenever you add new images to maintain optimal performance.');

} catch (error) {
  console.error('❌ Optimization failed:', error.message);
  process.exit(1);
}
