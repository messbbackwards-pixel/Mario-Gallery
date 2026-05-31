#!/usr/bin/env node
/**
 * mariothesmart - build.js
 *
 * Validates data/paintings/manifest.json and generates
 * public/js/paintings-manifest.js.
 *
 * Never hand-edit public/js/paintings-manifest.js.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const {
  readManifest,
  validateManifest,
  generateBrowserManifest,
  printIssues,
} = require('./lib/manifest-tools');

const ROOT = path.resolve(__dirname, '..');
const MANIFEST_IN = path.join(ROOT, 'data', 'paintings', 'manifest.json');
const OUTPUT_JS = path.join(ROOT, 'js', 'paintings-manifest.js');

let manifest;
try {
  manifest = readManifest(MANIFEST_IN);
} catch (err) {
  console.error(err.message);
  process.exit(1);
}

const result = validateManifest(manifest, { publicRoot: ROOT });
printIssues(result);

if (result.errors.length > 0) {
  console.error(`\nBuild aborted: ${result.errors.length} validation error(s). Fix manifest.json first.`);
  process.exit(1);
}

const output = generateBrowserManifest({
  timestamp: new Date().toISOString(),
  paintings: result.paintings,
  exhibitionLayouts: result.exhibitionLayouts,
});

try {
  fs.mkdirSync(path.dirname(OUTPUT_JS), { recursive: true });
  fs.writeFileSync(OUTPUT_JS, output, 'utf8');
} catch (err) {
  console.error('Could not write paintings-manifest.js:', err.message);
  process.exit(1);
}

console.log('\nBuilt paintings-manifest.js from manifest.json');
console.log(`   Paintings: ${result.paintings.length}`);
console.log(`   Featured: ${result.paintings.filter(p => p.featured).map(p => p.id).join(', ')}`);
console.log(`   Exhibition layouts: ${result.exhibitionLayouts.length}`);
console.log(`   Output: ${OUTPUT_JS}`);
console.log();
