# Adding a New Painting

## The complete workflow

### 1. Place the image

```
public/paintings/<new-slug>/main.jpg
```

Use a descriptive slug that matches the painting title (e.g., `the-weight-of-blue`).

---

### 2. Edit the manifest — one file, one place

Open `data/paintings/manifest.json` and add a new entry to the `paintings` array.

Copy this template and fill in every field:

```json
{
  "id": "your-slug-here",
  "title": "Your Painting Title",
  "subtitle": "Self-portrait",
  "year": "2024",
  "medium": "Acrylic & Coloured Pencil",
  "dimensions": "A3",
  "series": "Self-portraits",
  "tags": ["self-portrait", "eye", "blue"],
  "featured": false,
  "exhibitionLayout": null,
  "exhibitionOrder": null,
  "image": "paintings/your-slug-here/main.jpg",
  "gradient": "linear-gradient(145deg, #050507 0%, #0e0e18 30%, #1a1030 55%, #0a0810 100%)",
  "icon": "👁",
  "description": "<p>Short HTML description used as fallback.</p>",
  "palette": {
    "accent": "#0a0810",
    "glow": "rgba(40,30,60,0.15)",
    "ice": "rgba(20,15,40,0.1)"
  },
  "motifs": ["👁", "🩸"],
  "intro": "A single sentence that opens the painting's story.",
  "story": "The longer prose story.\n\nNew paragraphs are separated by a blank line.",
  "quote": "A quote about this painting.",
  "images": {
    "display": "main.jpg",
    "thumb": "main.jpg",
    "details": []
  }
}
```

---

### 3. Run the build

```bash
node scripts/build.js
```

or

```bash
npm run build
```

This regenerates `public/js/paintings-manifest.js` from the manifest. That file is auto-generated — **never hand-edit it**.

---

### 4. Done

The painting now appears:
- **Gallery** — automatically included, with the correct tags
- **Painting detail page** — `painting.html?id=your-slug-here`
- **Prev/Next navigation** — in the position it sits in the manifest array

---

## Optional: Exhibition

To include the painting in the exhibition, two things are required:

**1. Set the manifest fields** (for documentation and build reporting):

```json
"exhibitionLayout": "solo",
"exhibitionOrder": 5
```

**2. Add an entry to the `layouts` array in `exhibition.html`** — this is what actually controls what appears. The manifest fields alone do nothing to the exhibition page.

Open `exhibition.html` and find the `const layouts = [...]` array. Add your painting in the appropriate position:

```js
{
  type:       'solo',
  paintingId: 'your-slug',
  seriesName: 'Self-portraits',
  seriesNote:  'a note about this work',
},
```

Layout type options:
- `text-painting` — text panel left, painting right
- `painting-text` — painting left, text panel right
- `trio` — three paintings in a row; use `paintingIds: ['slug-a', 'slug-b', 'slug-c']`
- `solo` — centred, standalone

For `trio`, the layout looks like:

```js
{
  type:        'trio',
  paintingIds: ['slug-a', 'slug-b', 'slug-c'],
  seriesLabel: 'Series Label',
  seriesNote:  'a note',
},
```

---

## Optional: Featured on homepage

To feature the painting in the "Selected Works" grid on the homepage:

```json
"featured": true
```

The homepage shows the first 3 paintings with `featured: true` in manifest order.

---

## Optional: Story title

If the painting's story section should have a named heading:

```json
"storyTitle": "The question behind this one"
```

---

## Optional: Detail images (close-ups)

Place detail images in the same folder:

```
public/paintings/your-slug-here/detail-01.jpg
public/paintings/your-slug-here/detail-02.jpg
```

Then add them to the manifest:

```json
"images": {
  "display": "main.jpg",
  "thumb": "main.jpg",
  "details": [
    { "file": "detail-01.jpg", "caption": "The eye, close up" },
    { "file": "detail-02.jpg", "caption": "The crown, close up" }
  ]
}
```

Run `npm run build` again. The painting detail page will show the detail sections automatically.

---

## Series values

Use one of the existing series names exactly (case-sensitive):

| Value | Meaning |
|---|---|
| `"Self-portraits"` | The main series |
| `"Time Studies"` | Clock, time, watching |
| `"Narrative Works"` | Story-driven works |
| `"Studies"` | Experimental / studies |

---

## The file you never hand-edit

`public/js/paintings-manifest.js` is auto-generated. Every time you run `npm run build` it is overwritten. Changes made directly to it will be lost.

**The manifest is:** `data/paintings/manifest.json`
