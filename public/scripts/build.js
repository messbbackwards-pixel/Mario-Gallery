#!/usr/bin/env node
/**
 * mariothesmart — build.js
 *
 * Generates public/js/paintings-manifest.js from data/paintings/manifest.json.
 *
 * This is the ONLY file that should be run when adding or editing a painting.
 * Never hand-edit public/js/paintings-manifest.js — it is auto-generated.
 *
 * Usage:
 *   node scripts/build.js
 *
 * What it does:
 *   1. Reads data/paintings/manifest.json (single source of truth)
 *   2. Validates required fields on every painting entry
 *   3. Writes public/js/paintings-manifest.js (window.PAINTINGS + helpers)
 *   4. Reports what was generated
 *
 * Future additions (image pipeline — see audit Section G):
 *   - Read source/paintings/<slug>/master.jpg
 *   - Generate public/paintings/<slug>/<hash>-display.jpg (max 1600px, 85% JPEG)
 *   - Generate public/paintings/<slug>/<hash>-thumb.jpg (600px, 80% JPEG)
 *   - Update manifest image paths with generated hashes
 *   - Requires: npm install sharp
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// ── Paths ─────────────────────────────────────────────────
const ROOT         = path.resolve(__dirname, '..');
const MANIFEST_IN  = path.join(ROOT, 'data', 'paintings', 'manifest.json');
const OUTPUT_JS    = path.join(ROOT, 'js', 'paintings-manifest.js');

// ── Load manifest ─────────────────────────────────────────
let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(MANIFEST_IN, 'utf-8'));
} catch (err) {
  console.error('✗  Could not read manifest.json:', err.message);
  process.exit(1);
}

const paintings = manifest.paintings;
if (!Array.isArray(paintings) || paintings.length === 0) {
  console.error('✗  manifest.json has no paintings array');
  process.exit(1);
}

// ── Validate each entry ───────────────────────────────────
const REQUIRED = ['id', 'title', 'year', 'medium', 'series', 'tags', 'image', 'quote'];
let errors = 0;

paintings.forEach((p, i) => {
  REQUIRED.forEach(field => {
    if (!p[field] && p[field] !== false) {
      console.error(`✗  paintings[${i}] (${p.id || '?'}) is missing required field: ${field}`);
      errors++;
    }
  });
  if (!Array.isArray(p.tags)) {
    console.error(`✗  paintings[${i}] (${p.id}) tags must be an array`);
    errors++;
  }
  if (typeof p.featured !== 'boolean') {
    console.error(`✗  paintings[${i}] (${p.id}) featured must be a boolean`);
    errors++;
  }
});

if (errors > 0) {
  console.error(`\n✗  Build aborted — ${errors} validation error(s). Fix manifest.json first.`);
  process.exit(1);
}

// ── Generate the JS file ──────────────────────────────────
const timestamp = new Date().toISOString();
const json      = JSON.stringify(paintings, null, 2);

const output = `// ─────────────────────────────────────────────────────────
// AUTO-GENERATED — DO NOT HAND-EDIT THIS FILE
// Source: data/paintings/manifest.json
// Generated: ${timestamp}
// To regenerate: node scripts/build.js
// ─────────────────────────────────────────────────────────

'use strict';

// ─── Series name constants ─────────────────────────────────
const SERIES = {
  SELF_PORTRAITS:  'Self-portraits',
  TIME_STUDIES:    'Time Studies',
  NARRATIVE_WORKS: 'Narrative Works',
  STUDIES:         'Studies',
};

const PAINTINGS = ${json};

window.PAINTINGS = PAINTINGS;
window.SERIES    = SERIES;

function getPainting(id) {
  return PAINTINGS.find(p => p.id === id) || null;
}

function getPaintingAt(index) {
  return PAINTINGS[((index % PAINTINGS.length) + PAINTINGS.length) % PAINTINGS.length];
}

window.getPainting   = getPainting;
window.getPaintingAt = getPaintingAt;
`;

// ── Write output ──────────────────────────────────────────
try {
  // Ensure output directory exists
  fs.mkdirSync(path.dirname(OUTPUT_JS), { recursive: true });
  fs.writeFileSync(OUTPUT_JS, output, 'utf-8');
} catch (err) {
  console.error('✗  Could not write paintings-manifest.js:', err.message);
  process.exit(1);
}

// ── Report ────────────────────────────────────────────────
console.log(`\n✓  Built paintings-manifest.js from manifest.json`);
console.log(`   ${paintings.length} paintings`);
console.log(`   Featured: ${paintings.filter(p => p.featured).map(p => p.id).join(', ')}`);
console.log(`   Exhibition: ${paintings.filter(p => p.exhibitionLayout).map(p => `${p.id} (${p.exhibitionLayout})`).join(', ')}`);
console.log(`   Output: ${OUTPUT_JS}`);
console.log();
