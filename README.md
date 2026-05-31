# Mario Gallery

An artist portfolio and virtual gallery for Mario's paintings. The site is a small Express-served static app with a manifest-driven content system for paintings, exhibition layouts, featured work, image details, and story text.

## Project Shape

```text
src/server.js                         Express server and routes
public/*.html                         Static page shells
public/js/*.js                        Page behavior and generated painting data
public/styles/*.css                   Shared and page-specific styles
public/data/paintings/manifest.json   Source of truth for painting content
public/paintings/<painting-id>/       Artwork images and detail crops
public/scripts/*.js                   Build, validation, and content tools
```

## Source Of Truth

Edit painting content in:

```text
public/data/paintings/manifest.json
```

Do not hand-edit:

```text
public/js/paintings-manifest.js
```

That file is generated from the manifest so the browser can load the painting data without a build framework.

## Commands

```bash
npm install
npm start
```

Runs the local site at:

```text
http://localhost:3000
```

```bash
npm run build
```

Validates `manifest.json` and regenerates `public/js/paintings-manifest.js`.

```bash
npm run validate
```

Checks only the painting manifest.

```bash
npm run check
```

Runs the full sanity check: manifest validation, generated manifest freshness, and JavaScript syntax checks.

```bash
npm run ci
```

Runs the same build/check sequence used by GitHub Actions.

## Adding Paintings

Use the helper:

```bash
npm run add:painting -- "Painting Title"
```

Then place the main image here:

```text
public/paintings/<painting-id>/main.jpg
```

Edit the new manifest entry, then run:

```bash
npm run build
npm run check
```

More detail lives in [ADDING-A-PAINTING.md](ADDING-A-PAINTING.md).

## Image Policy

Painting folders keep source images and optional detail crops. Detail files should use simple names such as:

```text
detail-1.jpg
detail-2.jpg
```

The optional optimization script can generate `display.jpg` and `thumb.jpg` later:

```bash
npm install --save-dev sharp
npm run optimize:images
npm run build
npm run check
```

## Quality Gate

GitHub Actions runs on pushes and pull requests to `main`. It installs dependencies, rebuilds generated data, and runs the project check so broken manifests or stale generated files are caught early.

Before important structure changes, create a backup tag:

```bash
git tag backup-before-change-name
git push origin backup-before-change-name
```
