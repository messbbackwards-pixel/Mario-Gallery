# mariothesmart — Gallery

A cinematic, immersive gallery website built to present the work of Mario (mariothesmart) — a collection of emotionally intense, psychologically rich paintings spanning self-portraiture, surrealism, and narrative works.

---

## 📁 Project Structure

```
public/
├── index.html          # Homepage — immersive entry with featured works
├── gallery.html        # Full masonry grid of all paintings with tag filters
├── painting.html       # Individual painting detail page (dynamic, via ?id=)
├── exhibition.html     # Curated exhibition hall with atmospheric layout
├── about.html          # biography, timeline, and influences
├── styles/
│   ├── main.css        # Global styles, CSS variables, animations
│   ├── gallery.css     # Gallery grid and painting card styles
│   └── painting.css    # Painting detail page styles
├── js/
│   ├── paintings-data.js   # All painting data — edit this to add/remove works
│   └── gallery.js          # Shared effects: particles, parallax, scroll reveals
├── paintings/
│   └── <slug>/         # One folder per painting
│       ├── main.jpg    # Primary image
│       └── data.json   # Rich metadata used by painting detail page
└── images/             # Site-wide images (e.g. artist portrait)
```

---

## 🚀 Getting Started

```bash
npm install
npm start          # http://localhost:3000
npm run dev        # with auto-reload (requires nodemon)
```

---

## 🖼 Adding a New Painting

Every painting needs **three things** kept in sync:

### 1. Create the painting folder

```
public/paintings/<slug>/
├── main.jpg       ← artwork image
└── data.json      ← detail-page metadata (see format below)
```

Use a short, lowercase, hyphenated slug that matches the `id` in `paintings-data.js` exactly.

### 2. Add an entry to `paintings-data.js`

```js
{
  id: 'your-slug',               // must match folder name
  title: 'Your Painting Title',
  year: '2024',
  medium: 'Acrylic on Paper',
  dimensions: 'A3',
  series: 'Series Name',
  tags: ['self-portrait', 'red'],  // drives gallery filter buttons
  image: 'paintings/your-slug/main.jpg',
  gradient: 'linear-gradient(145deg, #050507 0%, #141020 100%)', // fallback if no image
  icon: '👁',
  description: `<p>Shown on the gallery card hover — optional.</p>`,
  quote: 'Artist quote shown on the detail page.',
}
```

### 3. Populate `data.json`

```json
{
  "id": "your-slug",
  "title": "Your Painting Title",
  "subtitle": "Self-portrait",
  "year": "2024",
  "medium": "Acrylic on Paper",
  "dimensions": "A3",
  "series": "Series Name",
  "tags": ["self-portrait", "red"],
  "palette": { "accent": "#200808", "glow": "rgba(120,21,32,0.2)", "ice": "rgba(30,10,10,0.12)" },
  "motifs": ["👁", "🩸"],
  "images": { "main": "main.jpg", "details": [] },
  "intro": "One-sentence hook shown at the top of the detail page.",
  "story": "Full description paragraph(s) shown in the storytelling section.",
  "quote": "Artist quote shown below the image."
}
```

---

## 🗑 Removing a Painting

1. Delete its entry from `paintings-data.js`
2. Optionally delete the `public/paintings/<slug>/` folder (the site won't break if you leave it — it just won't be linked)
3. If the painting appears in the `featured` array in `index.html` (line ~685), replace its ID with another active painting's ID

---

## ✏️ Renaming a Painting

- Update `title` in `paintings-data.js`
- Update `title` in `paintings/<slug>/data.json`
- The folder name / slug does **not** need to change (it's internal only)
- Gallery cards, detail pages, metadata, and tab titles all pull from the data automatically

---

## 🎨 Customizing

**Artist name**: Search-replace `mariothesmart` across all HTML files and `paintings-data.js`

**Colors**: All color variables live in `public/styles/main.css` under `:root`

**Featured works on homepage**: Edit the array on line ~685 of `index.html`:
```js
['crowned-and-wounded', 'smiling-through-it', 'tick-tock']
```

---

## ⚠️ Naming Consistency Rules

To avoid broken links, always follow these rules:

| Thing | Rule |
|---|---|
| Painting `id` in `paintings-data.js` | Must exactly match the folder name under `public/paintings/` |
| `id` in `data.json` | Must match the `id` in `paintings-data.js` |
| `image` path in `paintings-data.js` | Must be `paintings/<slug>/main.jpg` |
| Tags | Use lowercase, hyphenated strings consistently across the array |
| Featured IDs in `index.html` | Must be valid IDs that exist in `paintings-data.js` |

---

## 🐳 Docker

```bash
docker build -t mariothesmart-portfolio .
docker run -p 3000:3000 mariothesmart-portfolio
```

---

## Pages

| Page | File | Description |
|---|---|---|
| Home | `index.html` | Immersive entry with particles, featured works, and animated sections |
| Gallery | `gallery.html` | Masonry grid of all paintings with animated tag-based filtering |
| Painting | `painting.html?id=<slug>` | Full detail view: large image frame, metadata, storytelling, zoom |
| Exhibition | `exhibition.html` | Curated atmospheric hall layout |
| About | `about.html` | Artist bio, timeline, influences, portrait |

---

*All works copyright © Mario (mariothesmart). Do not reproduce without permission.*
