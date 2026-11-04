// Converts the original photos in /images into responsive WebP files under /assets/images.
// Run: npm run images
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const SOURCES = [
  ['1.jpg', 'hero/mijan-portrait'],
  ['7.jpg', 'hero/sea-voyage'],
  ['2.jpg', 'profile/beach-sunset'],
  ['3.jpg', 'profile/hill-bridge'],
  ['4.jpg', 'profile/studio-portrait'],
  ['5.jpg', 'profile/green-fields'],
  ['6.jpg', 'profile/office-portrait'],
  ['8.jpg', 'profile/editing-desk'],
  ['11.jpg', 'profile/recording-studio'],
  ['12.jpg', 'profile/mangrove-coast'],
  ['9.jpg', 'achievements/cplus-gold-award'],
  ['10.jpg', 'achievements/book-presentation'],
];
const WIDTHS = [800, 1600];

for (const [file, out] of SOURCES) {
  const src = path.join('images', file);
  await mkdir(path.dirname(path.join('assets/images', out)), { recursive: true });
  for (const w of WIDTHS) {
    await sharp(src).rotate().resize({ width: w, withoutEnlargement: true })
      .webp({ quality: 78 }).toFile(`assets/images/${out}-${w}.webp`);
  }
  console.log('✓', out);
}

// Social share image (JPEG for widest crawler support)
await sharp('images/1.jpg').resize(1200, 630, { fit: 'cover', position: 'attention' })
  .jpeg({ quality: 80, mozjpeg: true }).toFile('assets/images/og-image.jpg');
console.log('✓ og-image');
