// Converts the original photos in /images into responsive WebP files under /assets/images.
// Run: npm run images
import sharp from 'sharp';
import { mkdir, readdir } from 'node:fs/promises';
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

// Video covers: images/reels/<video id>.jpg → assets/images/reels/<video id>.webp
// (picked up automatically by js/data.js; a video without one shows a designed poster)
await mkdir('assets/images/reels', { recursive: true });
for (const file of (await readdir('images/reels')).filter((f) => /\.(jpe?g|png|webp)$/i.test(f))) {
  const id = path.parse(file).name;
  await sharp(path.join('images/reels', file)).resize(960, 540, { fit: 'cover' })
    .webp({ quality: 80 }).toFile(`assets/images/reels/${id}.webp`);
  console.log('✓ reels/' + id);
}

// Social share card, 1200×630 (JPEG for widest crawler support): portrait on the
// right, name + roles on the left. Fonts are system fonts (Georgia, Nirmala UI for
// Bengali) because the SVG is rendered by sharp, not a browser.
const OG_W = 1200, OG_H = 630, PHOTO_W = 470;
const portrait = await sharp('images/1.jpg').resize(PHOTO_W, OG_H, { fit: 'cover', position: 'top' }).toBuffer();
const ogText = `
<svg xmlns="http://www.w3.org/2000/svg" width="${OG_W}" height="${OG_H}">
  <defs><linearGradient id="fade" x1="0" x2="1">
    <stop offset="0" stop-color="#151515"/><stop offset="1" stop-color="#151515" stop-opacity="0"/>
  </linearGradient></defs>
  <rect x="${OG_W - PHOTO_W}" width="140" height="${OG_H}" fill="url(#fade)"/>
  <rect x="72" y="150" width="48" height="2" fill="#C9A774"/>
  <text x="136" y="158" font-family="Georgia" font-size="20" letter-spacing="5" fill="#C9A774">PORTFOLIO</text>
  <text x="68" y="290" font-family="Georgia" font-size="132" letter-spacing="10" fill="#F5F2EB">MIJAN</text>
  <text x="74" y="350" font-family="Nirmala UI" font-size="34" fill="#F5F2EB" fill-opacity="0.7">মিজান — আলোকচিত্রী ও আবৃত্তিশিল্পী</text>
  <text x="74" y="430" font-family="Georgia" font-size="30" fill="#F5F2EB">Photographer &amp; Bangla Reciter</text>
  <text x="74" y="478" font-family="Georgia" font-style="italic" font-size="26" fill="#C9A774">Capturing Moments. Expressing Emotions.</text>
</svg>`;
await sharp({ create: { width: OG_W, height: OG_H, channels: 3, background: '#151515' } })
  .composite([{ input: portrait, left: OG_W - PHOTO_W, top: 0 }, { input: Buffer.from(ogText), left: 0, top: 0 }])
  .jpeg({ quality: 85, mozjpeg: true }).toFile('assets/images/og-image.jpg');
console.log('✓ og-image');
