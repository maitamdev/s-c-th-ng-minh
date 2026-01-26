import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [
    { size: 180, name: 'apple-touch-icon-180x180.png' },
    { size: 152, name: 'apple-touch-icon-152x152.png' },
    { size: 120, name: 'apple-touch-icon-120x120.png' },
    { size: 192, name: 'icon-192x192.png' },
    { size: 512, name: 'icon-512x512.png' },
];

const inputPath = path.join(__dirname, '../public/logo.jpg');
const outputDir = path.join(__dirname, '../public/icons');

// Create icons directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

console.log('🎨 Generating PWA icons for iOS...\n');

// Generate icons
Promise.all(
    sizes.map(({ size, name }) => {
        const outputPath = path.join(outputDir, name);
        return sharp(inputPath)
            .resize(size, size, {
                fit: 'cover',
                position: 'center',
            })
            .png()
            .toFile(outputPath)
            .then(() => {
                console.log(`✅ Generated ${name} (${size}x${size})`);
            })
            .catch((err) => {
                console.error(`❌ Failed to generate ${name}:`, err.message);
            });
    })
)
    .then(() => {
        console.log('\n🎉 All icons generated successfully!');
    })
    .catch((err) => {
        console.error('❌ Error generating icons:', err);
        process.exit(1);
    });
