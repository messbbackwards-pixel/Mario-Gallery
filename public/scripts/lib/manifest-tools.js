'use strict';

const fs = require('fs');
const path = require('path');

const REQUIRED_FIELDS = ['id', 'title', 'year', 'medium', 'series', 'tags', 'image', 'quote'];
const SERIES_VALUES = ['Self-portraits', 'Time Studies', 'Narrative Works', 'Studies'];
const LAYOUT_TYPES = new Set(['text-painting', 'painting-text', 'trio', 'solo']);
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const IMAGE_EXT_RE = /\.(jpe?g|png|webp)$/i;
const SIMPLE_FILE_RE = /^[a-z0-9][a-z0-9._-]*\.(jpe?g|png|webp)$/i;
const TEXT_FIELDS = ['title', 'subtitle', 'year', 'medium', 'dimensions', 'series', 'intro', 'storyTitle', 'story', 'quote'];

function readManifest(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    const e = new Error(`Could not read manifest.json: ${err.message}`);
    e.cause = err;
    throw e;
  }
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function pushIssue(list, message) {
  list.push(message);
}

function validateNoHtml(value, label, errors) {
  if (typeof value === 'string' && /<[^>]+>/.test(value)) {
    pushIssue(errors, `${label} must be plain text, not HTML`);
  }
}

function validateDescriptionHtml(value, label, errors) {
  if (value === undefined || value === null || value === '') return;
  if (typeof value !== 'string') {
    pushIssue(errors, `${label} must be a string`);
    return;
  }
  const unsupported = value.match(/<(?!\/?p\b)[^>]+>/i);
  const pWithAttrs = value.match(/<p\s+[^>]*>/i);
  if (unsupported || pWithAttrs) {
    pushIssue(errors, `${label} may only contain plain <p>...</p> paragraphs`);
  }
}

function validatePublicImagePath(publicRoot, rel, label, errors) {
  if (!hasText(rel)) {
    pushIssue(errors, `${label} must be a non-empty path`);
    return;
  }
  if (path.isAbsolute(rel) || rel.startsWith('/') || rel.includes('\\') || rel.split('/').includes('..')) {
    pushIssue(errors, `${label} must be a safe relative public path`);
    return;
  }
  if (!IMAGE_EXT_RE.test(rel)) {
    pushIssue(errors, `${label} must point to a jpg, jpeg, png, or webp image`);
  }
  if (!fs.existsSync(path.join(publicRoot, rel))) {
    pushIssue(errors, `${label} references a missing file: ${rel}`);
  }
}

function validateSimpleImageFile(file, label, errors) {
  if (!hasText(file)) {
    pushIssue(errors, `${label} must be a non-empty image filename`);
    return;
  }
  if (file.includes('/') || file.includes('\\') || file.split('/').includes('..') || !SIMPLE_FILE_RE.test(file)) {
    pushIssue(errors, `${label} must be a simple jpg, jpeg, png, or webp filename`);
  }
}

function layoutPaintingIds(layout) {
  return layout.type === 'trio' ? layout.paintingIds : [layout.paintingId];
}

function validateManifest(manifest, options) {
  const publicRoot = options && options.publicRoot ? options.publicRoot : path.resolve(__dirname, '..', '..');
  const errors = [];
  const warnings = [];

  if (!isPlainObject(manifest)) {
    return { errors: ['manifest.json must contain a JSON object'], warnings, paintings: [], exhibitionLayouts: [] };
  }

  const paintings = manifest.paintings;
  if (!Array.isArray(paintings) || paintings.length === 0) {
    pushIssue(errors, 'manifest.json must contain a non-empty paintings array');
    return { errors, warnings, paintings: [], exhibitionLayouts: [] };
  }

  const exhibitionLayouts = manifest.exhibition && Array.isArray(manifest.exhibition.layouts)
    ? manifest.exhibition.layouts
    : [];

  const paintingById = new Map();
  const exhibitionById = new Map();
  const exhibitionIds = new Set();

  paintings.forEach((p, i) => {
    const label = `paintings[${i}] (${p && p.id ? p.id : '?'})`;

    if (!isPlainObject(p)) {
      pushIssue(errors, `paintings[${i}] must be an object`);
      return;
    }

    REQUIRED_FIELDS.forEach(field => {
      if (!p[field] && p[field] !== false) {
        pushIssue(errors, `${label} is missing required field: ${field}`);
      }
    });

    if (!hasText(p.id) || !SLUG_RE.test(p.id)) {
      pushIssue(errors, `${label} id must be a lowercase kebab-case slug`);
    } else if (paintingById.has(p.id)) {
      pushIssue(errors, `duplicate painting id: ${p.id}`);
    } else {
      paintingById.set(p.id, p);
    }

    TEXT_FIELDS.forEach(field => {
      if (p[field] !== undefined && p[field] !== null && typeof p[field] !== 'string') {
        pushIssue(errors, `${label}.${field} must be a string`);
      }
      validateNoHtml(p[field], `${label}.${field}`, errors);
    });

    validateDescriptionHtml(p.description, `${label}.description`, errors);

    if (!SERIES_VALUES.includes(p.series)) {
      pushIssue(errors, `${label}.series must be one of: ${SERIES_VALUES.join(', ')}`);
    }

    if (!Array.isArray(p.tags)) {
      pushIssue(errors, `${label}.tags must be an array`);
    } else {
      const seenTags = new Set();
      p.tags.forEach((tag, tagIndex) => {
        if (!hasText(tag)) {
          pushIssue(errors, `${label}.tags[${tagIndex}] must be a non-empty string`);
          return;
        }
        if (tag.includes(',')) {
          pushIssue(errors, `${label}.tags[${tagIndex}] must not contain commas`);
        }
        if (!/^[a-z0-9][a-z0-9 -]*[a-z0-9]$|^[a-z0-9]$/.test(tag)) {
          pushIssue(errors, `${label}.tags[${tagIndex}] must be lowercase words, spaces, or hyphens`);
        }
        if (seenTags.has(tag)) {
          pushIssue(errors, `${label}.tags contains duplicate tag: ${tag}`);
        }
        seenTags.add(tag);
        validateNoHtml(tag, `${label}.tags[${tagIndex}]`, errors);
      });
    }

    if (typeof p.featured !== 'boolean') {
      pushIssue(errors, `${label}.featured must be a boolean`);
    }

    if (p.exhibitionLayout !== undefined && p.exhibitionLayout !== null && !LAYOUT_TYPES.has(p.exhibitionLayout)) {
      pushIssue(errors, `${label}.exhibitionLayout must be null or one of: ${Array.from(LAYOUT_TYPES).join(', ')}`);
    }

    if (
      p.exhibitionOrder !== undefined &&
      p.exhibitionOrder !== null &&
      (!Number.isInteger(p.exhibitionOrder) || p.exhibitionOrder < 1)
    ) {
      pushIssue(errors, `${label}.exhibitionOrder must be null or a positive integer`);
    }

    validatePublicImagePath(publicRoot, p.image, `${label}.image`, errors);
    if (hasText(p.id) && hasText(p.image) && !p.image.startsWith(`paintings/${p.id}/`)) {
      pushIssue(errors, `${label}.image must live under paintings/${p.id}/`);
    }

    if (!isPlainObject(p.images)) {
      pushIssue(errors, `${label}.images must be an object with display, thumb, and details`);
    } else {
      ['display', 'thumb'].forEach(kind => {
        validateSimpleImageFile(p.images[kind], `${label}.images.${kind}`, errors);
        if (hasText(p.id) && hasText(p.images[kind])) {
          validatePublicImagePath(publicRoot, `paintings/${p.id}/${p.images[kind]}`, `${label}.images.${kind}`, errors);
        }
      });

      if (!Array.isArray(p.images.details)) {
        pushIssue(errors, `${label}.images.details must be an array`);
      } else {
        p.images.details.forEach((detail, detailIndex) => {
          const detailLabel = `${label}.images.details[${detailIndex}]`;
          if (!isPlainObject(detail)) {
            pushIssue(errors, `${detailLabel} must be an object`);
            return;
          }
          validateSimpleImageFile(detail.file, `${detailLabel}.file`, errors);
          validateNoHtml(detail.caption, `${detailLabel}.caption`, errors);
          if (detail.caption !== undefined && typeof detail.caption !== 'string') {
            pushIssue(errors, `${detailLabel}.caption must be a string`);
          }
          if (hasText(p.id) && hasText(detail.file)) {
            validatePublicImagePath(publicRoot, `paintings/${p.id}/${detail.file}`, `${detailLabel}.file`, errors);
          }
        });
      }
    }

    if (p.palette !== undefined) {
      if (!isPlainObject(p.palette)) {
        pushIssue(errors, `${label}.palette must be an object`);
      } else {
        ['accent', 'glow', 'ice'].forEach(key => {
          if (!hasText(p.palette[key])) {
            pushIssue(errors, `${label}.palette.${key} must be a non-empty string`);
          }
        });
      }
    }

    if (p.motifs !== undefined) {
      if (!Array.isArray(p.motifs)) {
        pushIssue(errors, `${label}.motifs must be an array`);
      } else {
        p.motifs.forEach((motif, motifIndex) => {
          if (!hasText(motif)) {
            pushIssue(errors, `${label}.motifs[${motifIndex}] must be a non-empty string`);
          }
        });
      }
    }
  });

  const featuredIds = paintings.filter(p => p && p.featured).map(p => p.id);
  if (featuredIds.length > 3) {
    pushIssue(warnings, `homepage shows only the first 3 featured paintings: ${featuredIds.join(', ')}`);
  }

  exhibitionLayouts.forEach((layout, i) => {
    const label = `exhibition.layouts[${i}]`;

    if (!isPlainObject(layout)) {
      pushIssue(errors, `${label} must be an object`);
      return;
    }

    if (!LAYOUT_TYPES.has(layout.type)) {
      pushIssue(errors, `${label} has an invalid type`);
      return;
    }

    if (layout.type === 'trio') {
      if (!Array.isArray(layout.paintingIds) || layout.paintingIds.length !== 3) {
        pushIssue(errors, `${label}.paintingIds must contain exactly 3 painting ids`);
        return;
      }
      if (!hasText(layout.seriesLabel)) pushIssue(errors, `${label}.seriesLabel is required for trio layouts`);
      if (!hasText(layout.seriesNote)) pushIssue(errors, `${label}.seriesNote is required for trio layouts`);
    } else {
      if (!hasText(layout.paintingId)) {
        pushIssue(errors, `${label}.paintingId is required`);
        return;
      }
      if (!hasText(layout.seriesName)) pushIssue(errors, `${label}.seriesName is required`);
      if (!hasText(layout.seriesNote)) pushIssue(errors, `${label}.seriesNote is required`);
    }

    const expectedOrder = i + 1;
    const ids = layoutPaintingIds(layout);
    if (ids.some(id => !hasText(id))) {
      pushIssue(errors, `${label} must reference non-empty painting id(s)`);
      return;
    }

    ids.forEach(id => {
      const painting = paintingById.get(id);
      if (!painting) {
        pushIssue(errors, `${label} references missing painting: ${id}`);
        return;
      }

      if (exhibitionIds.has(id)) {
        pushIssue(errors, `painting appears more than once in exhibition layouts: ${id}`);
      }
      exhibitionIds.add(id);
      exhibitionById.set(id, { layout: layout.type, order: expectedOrder });

      if (painting.exhibitionLayout !== undefined && painting.exhibitionLayout !== null && painting.exhibitionLayout !== layout.type) {
        pushIssue(errors, `${id} has exhibitionLayout=${painting.exhibitionLayout}, but layout expects ${layout.type}`);
      }

      if (painting.exhibitionOrder !== undefined && painting.exhibitionOrder !== null && painting.exhibitionOrder !== expectedOrder) {
        pushIssue(errors, `${id} has exhibitionOrder=${painting.exhibitionOrder}, but layout position is ${expectedOrder}`);
      }
    });
  });

  paintings
    .filter(p => p && p.exhibitionLayout)
    .forEach(p => {
      if (!exhibitionIds.has(p.id)) {
        pushIssue(errors, `${p.id} has exhibitionLayout but is missing from exhibition.layouts`);
      }
    });

  const normalizedPaintings = paintings.map(p => {
    if (!isPlainObject(p)) return p;
    const normalized = Object.assign({}, p);
    const exhibition = exhibitionById.get(p.id);
    normalized.exhibitionLayout = exhibition ? exhibition.layout : null;
    normalized.exhibitionOrder = exhibition ? exhibition.order : null;
    return normalized;
  });

  return {
    errors,
    warnings,
    paintings: normalizedPaintings,
    exhibitionLayouts,
    seriesValues: SERIES_VALUES.slice(),
  };
}

function generateBrowserManifest(options) {
  const timestamp = options.timestamp;
  const paintingsJson = JSON.stringify(options.paintings, null, 2);
  const layoutsJson = JSON.stringify(options.exhibitionLayouts, null, 2);

  return `// ---------------------------------------------------------
// AUTO-GENERATED - DO NOT HAND-EDIT THIS FILE
// Source: data/paintings/manifest.json
// Generated: ${timestamp}
// To regenerate from project root: npm run build
// ---------------------------------------------------------

'use strict';

const SERIES = {
  SELF_PORTRAITS:  'Self-portraits',
  TIME_STUDIES:    'Time Studies',
  NARRATIVE_WORKS: 'Narrative Works',
  STUDIES:         'Studies',
};

const PAINTINGS = ${paintingsJson};
const EXHIBITION_LAYOUTS = ${layoutsJson};

window.PAINTINGS = PAINTINGS;
window.SERIES = SERIES;
window.EXHIBITION_LAYOUTS = EXHIBITION_LAYOUTS;

function getPainting(id) {
  return PAINTINGS.find(p => p.id === id) || null;
}

function getPaintingIndex(id) {
  return PAINTINGS.findIndex(p => p.id === id);
}

function getPaintingAt(index) {
  return PAINTINGS[((index % PAINTINGS.length) + PAINTINGS.length) % PAINTINGS.length];
}

function getPaintingUrl(id) {
  return '/painting/' + encodeURIComponent(id);
}

function getPaintingIdFromLocation(loc) {
  loc = loc || window.location;
  const params = new URLSearchParams(loc.search || '');
  const queryId = params.get('id');
  if (queryId) return queryId;

  const parts = (loc.pathname || '').split('/').filter(Boolean);
  const marker = parts.indexOf('painting');
  if (marker !== -1 && parts[marker + 1]) {
    return decodeURIComponent(parts[marker + 1]);
  }

  return null;
}

function paintingImage(painting, kind) {
  if (!painting) return '';
  const images = painting.images || {};
  const file = images[kind] || images.display || images.thumb;
  return file ? 'paintings/' + painting.id + '/' + file : painting.image;
}

function getFeaturedPaintings(limit) {
  const featured = PAINTINGS.filter(p => p.featured);
  return typeof limit === 'number' ? featured.slice(0, limit) : featured;
}

function getExhibitionLayouts() {
  return EXHIBITION_LAYOUTS.slice();
}

window.getPainting = getPainting;
window.getPaintingIndex = getPaintingIndex;
window.getPaintingAt = getPaintingAt;
window.getPaintingUrl = getPaintingUrl;
window.getPaintingIdFromLocation = getPaintingIdFromLocation;
window.paintingImage = paintingImage;
window.getFeaturedPaintings = getFeaturedPaintings;
window.getExhibitionLayouts = getExhibitionLayouts;
`;
}

function printIssues(result) {
  result.warnings.forEach(message => console.warn(`Warning: ${message}`));
  result.errors.forEach(message => console.error(`Error: ${message}`));
}

module.exports = {
  REQUIRED_FIELDS,
  SERIES_VALUES,
  LAYOUT_TYPES,
  readManifest,
  validateManifest,
  generateBrowserManifest,
  printIssues,
};
