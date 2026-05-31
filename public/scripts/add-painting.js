#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const {
  SERIES_VALUES,
  readManifest,
  validateManifest,
  printIssues,
} = require('./lib/manifest-tools');

const ROOT = path.resolve(__dirname, '..');
const MANIFEST = path.join(ROOT, 'data', 'paintings', 'manifest.json');

function usage() {
  console.log([
    'Usage:',
    '  node public/scripts/add-painting.js "Painting Title" [options]',
    '',
    'Options:',
    '  --id <slug>             Use a specific lowercase kebab-case id',
    '  --year <year>           Default: current year',
    '  --series <series>       Default: Studies',
    '  --subtitle <subtitle>   Default: Study',
    '  --medium <medium>       Default: Acrylic & Coloured Pencil',
    '  --dimensions <size>     Default: A3',
    '  --tags <a,b,c>          Comma-separated tags',
    '  --featured             Mark as featured on the homepage',
  ].join('\n'));
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function parseArgs(argv) {
  const args = argv.slice(2);
  const options = {};
  const titleParts = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg.startsWith('--')) {
      titleParts.push(arg);
      continue;
    }

    const key = arg.slice(2);
    if (key === 'help') {
      options.help = true;
      continue;
    }
    if (key === 'featured') {
      options.featured = true;
      continue;
    }

    const value = args[i + 1];
    if (!value || value.startsWith('--')) {
      throw new Error(`Missing value for --${key}`);
    }
    options[key] = value;
    i++;
  }

  options.title = titleParts.join(' ').trim();
  return options;
}

function makeEntry(options) {
  const title = options.title;
  const id = options.id || slugify(title);
  const series = options.series || 'Studies';
  const year = options.year || String(new Date().getFullYear());
  const tags = options.tags
    ? options.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    : [];

  if (!title) throw new Error('Painting title is required');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
    throw new Error(`Invalid id "${id}". Use lowercase kebab-case, like the-weight-of-blue.`);
  }
  if (!SERIES_VALUES.includes(series)) {
    throw new Error(`Invalid series "${series}". Use one of: ${SERIES_VALUES.join(', ')}`);
  }

  return {
    id,
    title,
    subtitle: options.subtitle || 'Study',
    year,
    medium: options.medium || 'Acrylic & Coloured Pencil',
    dimensions: options.dimensions || 'A3',
    series,
    tags,
    featured: Boolean(options.featured),
    exhibitionLayout: null,
    exhibitionOrder: null,
    image: `paintings/${id}/main.jpg`,
    gradient: 'linear-gradient(145deg, #050507 0%, #0e0e18 30%, #1a1030 55%, #0a0810 100%)',
    icon: '?',
    description: '<p>Short description coming soon.</p>',
    palette: {
      accent: '#0a0810',
      glow: 'rgba(40,30,60,0.15)',
      ice: 'rgba(20,15,40,0.1)',
    },
    motifs: [],
    intro: 'Short intro coming soon.',
    story: 'Longer story coming soon.',
    quote: 'Quote coming soon.',
    images: {
      display: 'main.jpg',
      thumb: 'main.jpg',
      details: [],
    },
  };
}

let options;
try {
  options = parseArgs(process.argv);
  if (options.help) {
    usage();
    process.exit(0);
  }
} catch (err) {
  console.error(err.message);
  usage();
  process.exit(1);
}

let entry;
try {
  entry = makeEntry(options);
} catch (err) {
  console.error(err.message);
  usage();
  process.exit(1);
}

const manifest = readManifest(MANIFEST);
const validation = validateManifest(manifest, { publicRoot: ROOT });
printIssues(validation);
if (validation.errors.length > 0) {
  console.error('\nRefusing to add a painting until the existing manifest is valid.');
  process.exit(1);
}

if (manifest.paintings.some(p => p.id === entry.id)) {
  console.error(`A painting with id "${entry.id}" already exists.`);
  process.exit(1);
}

const paintingDir = path.join(ROOT, 'paintings', entry.id);
fs.mkdirSync(paintingDir, { recursive: true });
manifest.paintings.push(entry);
fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n', 'utf8');

console.log(`Added manifest entry: ${entry.id}`);
console.log(`Created folder: ${paintingDir}`);
console.log(`Next: add ${path.join(paintingDir, 'main.jpg')}`);
console.log('Then run: npm run build');
