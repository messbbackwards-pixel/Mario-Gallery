# Adding A Painting

This project is manifest-driven. The browser reads generated data from:

```text
public/js/paintings-manifest.js
```

Do not hand-edit that generated file. Edit the source data instead:

```text
public/data/paintings/manifest.json
```

## Quick Workflow

From the project root:

```bash
npm run add:painting -- "Your Painting Title"
```

That command:

1. Creates a new manifest entry.
2. Creates the folder at `public/paintings/<slug>/`.
3. Points the new entry at `public/paintings/<slug>/main.jpg`.

Then place the image here:

```text
public/paintings/<slug>/main.jpg
```

Then run:

```bash
npm run build
npm run check
```

The site will not silently accept broken data. The build/check scripts validate slugs, duplicate IDs, required fields, series names, exhibition layouts, and every referenced image file.

## Useful Commands

```bash
npm run validate
```

Checks only `manifest.json`.

```bash
npm run build
```

Validates the manifest and regenerates `public/js/paintings-manifest.js`.

```bash
npm run check
```

Runs the full project sanity check: manifest validation, generated manifest freshness, and JavaScript syntax checks.

```bash
npm run add:painting -- "The Weight of Blue" --series "Self-portraits" --year 2026 --tags "self-portrait,blue"
```

Creates a more specific starter entry.

## Gallery-Only Painting

To add a normal gallery painting:

1. Run `npm run add:painting -- "Title"`.
2. Put `main.jpg` inside the created folder.
3. Edit the generated starter text in `manifest.json`.
4. Run `npm run build`.
5. Run `npm run check`.

Keep these values as `null`:

```json
"exhibitionLayout": null,
"exhibitionOrder": null
```

## Featured On Homepage

Set:

```json
"featured": true
```

The homepage displays the first three featured paintings in manifest order. If more than three paintings are featured, `npm run validate` warns you.

## Exhibition

The exhibition is driven by:

```json
"exhibition": {
  "layouts": []
}
```

Add a painting to `exhibition.layouts`, then run `npm run build`. The generated browser manifest fills `exhibitionLayout` and `exhibitionOrder` for the site.

The old per-painting fields are still allowed as a safety check:

```json
"exhibitionLayout": "solo",
"exhibitionOrder": 4
```

If those fields disagree with `exhibition.layouts`, the build fails.

## Exhibition Layout Types

### Text Left, Painting Right

```json
{
  "type": "text-painting",
  "paintingId": "your-slug",
  "seriesName": "Self-portraits",
  "seriesNote": "short note"
}
```

### Painting Left, Text Right

```json
{
  "type": "painting-text",
  "paintingId": "your-slug",
  "seriesName": "Self-portraits",
  "seriesNote": "short note"
}
```

### Three Paintings In One Row

```json
{
  "type": "trio",
  "paintingIds": ["slug-a", "slug-b", "slug-c"],
  "seriesLabel": "Series Label",
  "seriesNote": "short note"
}
```

`trio` must contain exactly three painting IDs.

### One Centered Painting

```json
{
  "type": "solo",
  "paintingId": "your-slug",
  "seriesName": "Self-portraits",
  "seriesNote": "short note"
}
```

## Detail Images

Place detail images in the painting folder:

```text
public/paintings/your-slug/detail-1.jpg
public/paintings/your-slug/detail-2.jpg
```

Then add them to the painting entry:

```json
"images": {
  "display": "main.jpg",
  "thumb": "main.jpg",
  "details": [
    {
      "file": "detail-1.jpg",
      "caption": "The eye, close up"
    },
    {
      "file": "detail-2.jpg",
      "caption": "The crown, close up"
    }
  ]
}
```

Run:

```bash
npm run build
npm run check
```

## Required Series Values

Use one of these exactly:

| Value | Meaning |
|---|---|
| `"Self-portraits"` | Main self-portrait works |
| `"Time Studies"` | Clock, time, watching |
| `"Narrative Works"` | Story-driven works |
| `"Studies"` | Experiments and studies |

## Image Optimization

The optional optimization script still requires `sharp`:

```bash
npm install --save-dev sharp
npm run optimize:images
npm run build
npm run check
```

It creates optimized display/thumb files and updates the manifest.
