#!/usr/bin/env node
/**
 * Watch the painting manifest and regenerate the browser manifest when it changes.
 */

'use strict';

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MANIFEST = path.join(ROOT, 'data', 'paintings', 'manifest.json');
const BUILD_SCRIPT = path.join(ROOT, 'scripts', 'build.js');

let timer = null;

function runBuild() {
  execFileSync(process.execPath, [BUILD_SCRIPT], { stdio: 'inherit' });
}

console.log(`Watching ${MANIFEST}`);
runBuild();

fs.watch(MANIFEST, () => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    console.log('manifest changed - rebuilding...');
    runBuild();
  }, 120);
});
