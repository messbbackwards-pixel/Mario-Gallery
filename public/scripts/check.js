#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const {
  readManifest,
  validateManifest,
  generateBrowserManifest,
  printIssues,
} = require('./lib/manifest-tools');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const PUBLIC_ROOT = path.join(PROJECT_ROOT, 'public');
const MANIFEST = path.join(PUBLIC_ROOT, 'data', 'paintings', 'manifest.json');
const GENERATED = path.join(PUBLIC_ROOT, 'js', 'paintings-manifest.js');
const JS_DIRS = [
  path.join(PROJECT_ROOT, 'src'),
  path.join(PUBLIC_ROOT, 'js'),
  path.join(PUBLIC_ROOT, 'scripts'),
];

let failures = 0;

function fail(message) {
  console.error(`Error: ${message}`);
  failures++;
}

function walkJsFiles(dir, out) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkJsFiles(fullPath, out);
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      out.push(fullPath);
    }
  });
}

let manifest;
try {
  manifest = readManifest(MANIFEST);
} catch (err) {
  fail(err.message);
}

let validation;
if (manifest) {
  validation = validateManifest(manifest, { publicRoot: PUBLIC_ROOT });
  printIssues(validation);
  failures += validation.errors.length;
}

if (validation && validation.errors.length === 0) {
  if (!fs.existsSync(GENERATED)) {
    fail('public/js/paintings-manifest.js is missing. Run npm run build.');
  } else {
    const actual = fs.readFileSync(GENERATED, 'utf8');
    const timestampMatch = actual.match(/^\/\/ Generated: (.+)$/m);
    const timestamp = timestampMatch ? timestampMatch[1] : 'check';
    const expected = generateBrowserManifest({
      timestamp,
      paintings: validation.paintings,
      exhibitionLayouts: validation.exhibitionLayouts,
    });
    if (actual !== expected) {
      fail('public/js/paintings-manifest.js is stale. Run npm run build.');
    }
  }
}

const jsFiles = [];
JS_DIRS.forEach(dir => walkJsFiles(dir, jsFiles));
jsFiles.forEach(file => {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) {
    fail(`${path.relative(PROJECT_ROOT, file)} has a syntax error`);
    if (result.stderr) process.stderr.write(result.stderr);
  }
});

if (failures > 0) {
  console.error(`\nProject check failed: ${failures} issue(s).`);
  process.exit(1);
}

console.log('Project check passed');
console.log(`   JS files checked: ${jsFiles.length}`);
console.log(`   Paintings checked: ${validation ? validation.paintings.length : 0}`);
