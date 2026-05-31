#!/usr/bin/env node
/**
 * Optional image optimization pipeline.
 *
 * Requires sharp:
 *   npm install --save-dev sharp
 *
 * Generates display.jpg and thumb.jpg next to each painting's source image,
 * then updates images.display/images.thumb in the manifest.
 */

'use strict';

const fs = require('fs');
const path = require('path');

let sharp;
try {
  sharp = require('sharp');
} catch (err) {
  console.error('sharp is required for image optimization.');
  console.error('Install it with: npm install --save-dev sharp');
  process.exit(1);
}

const ROOT = path.resolve(__dirname, '..');
const MANIFEST = path.join(ROOT, 'data', 'paintings', 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));

async function optimizePainting(painting) {
  const sourceRel = painting.image || `paintings/${painting.id}/main.jpg`;
  const sourceAbs = path.join(ROOT, sourceRel);
  const dirAbs = path.dirname(sourceAbs);

  if (!fs.existsSync(sourceAbs)) {
    throw new Error(`${painting.id}: missing source image ${sourceRel}`);
  }

  const displayName = 'display.jpg';
  const thumbName = 'thumb.jpg';
  const displayAbs = path.join(dirAbs, displayName);
  const thumbAbs = path.join(dirAbs, thumbName);

  await sharp(sourceAbs)
    .rotate()
    .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85, mozjpeg: true })
    .toFile(displayAbs);

  await sharp(sourceAbs)
    .rotate()
    .resize({ width: 700, height: 900, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(thumbAbs);

  painting.images = painting.images || {};
  painting.images.display = displayName;
  painting.images.thumb = thumbName;

  return { id: painting.id, display: displayAbs, thumb: thumbAbs };
}

(async () => {
  const results = [];
  for (const painting of manifest.paintings || []) {
    results.push(await optimizePainting(painting));
  }

  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n', 'utf8');

  console.log(`Optimized ${results.length} painting image set(s).`);
  console.log('Run npm run build to regenerate public/js/paintings-manifest.js.');
})().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
