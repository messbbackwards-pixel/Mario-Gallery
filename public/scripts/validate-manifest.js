#!/usr/bin/env node

'use strict';

const path = require('path');
const {
  readManifest,
  validateManifest,
  printIssues,
} = require('./lib/manifest-tools');

const ROOT = path.resolve(__dirname, '..');
const MANIFEST = path.join(ROOT, 'data', 'paintings', 'manifest.json');

let manifest;
try {
  manifest = readManifest(MANIFEST);
} catch (err) {
  console.error(err.message);
  process.exit(1);
}

const result = validateManifest(manifest, { publicRoot: ROOT });
printIssues(result);

if (result.errors.length > 0) {
  console.error(`\nValidation failed: ${result.errors.length} error(s).`);
  process.exit(1);
}

console.log('Manifest validation passed');
console.log(`   Paintings: ${result.paintings.length}`);
console.log(`   Featured: ${result.paintings.filter(p => p.featured).map(p => p.id).join(', ') || '(none)'}`);
console.log(`   Exhibition layouts: ${result.exhibitionLayouts.length}`);
if (result.warnings.length > 0) {
  console.log(`   Warnings: ${result.warnings.length}`);
}
