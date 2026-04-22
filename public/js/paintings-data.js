/**
 * mariothesmart — Paintings Data
 * Real works by Mario (mariothesmart)
 */

const PAINTINGS = [
  {
    id: 'whos-watching-whom',
    title: "Who's Watching Whom",
    year: '2022–2023',
    medium: 'Acrylic on Paper',
    dimensions: 'Mixed',
    series: 'Self-portraits',
    tags: ['self-portrait', 'memory', 'third eye'],
    image: 'paintings/whos-watching-whom/main.jpg',
    gradient: 'linear-gradient(145deg, #050507 0%, #0e0e18 30%, #1a1030 55%, #0a0810 100%)',
    icon: '🕐',
    description: `
      <p>A self-portrait built around memory and the things that play on repeat. There's an old TV screen showing a photo of the artist and her brother — a relationship that shaped a lot of who she became. The blood on her mouth isn't just blood. The question marks on her forehead aren't just decoration.</p>
      <p>The sparkling white eyes were a mistake first — the paper ripped. Then it became one of the truest things in the painting. That's how most of the best parts happened.</p>
    `,
    quote: "I didn't even tell future-me the meaning behind any of it. I only feel my meanings. If I were able to say them, I wouldn't have painted them.",
  },
  {
    id: 'the-end-is-near',
    title: 'The End Is Near',
    year: '2021',
    medium: 'Acrylic & Coloured Pencil',
    dimensions: 'A3',
    series: 'Self-portraits',
    tags: ['self-portrait', 'third eye', 'ritual', 'corruption'],
    image: 'paintings/the-end-is-near/main.jpg',
    gradient: 'linear-gradient(145deg, #0a0305 0%, #200808 35%, #3a0a0a 60%, #0a0305 100%)',
    icon: '👁',
    description: `
      <p>The third eye appears again — bleeding this time, not open. One eye white, one eye present, neither quite looking at you. The halo is fiery orange, not holy. The hands at the edges hold things that belong to someone else.</p>
      <p>Red lips, a horn, a held eyeball. The figure is simultaneously sacred and unravelling. Made in 2021.</p>
    `,
    quote: "You'll always find the meaning behind the mistakes.",
  },
  {
    id: 'wake-me-up-when-its-over',
    title: 'Wake Me Up When It\'s Over',
    year: '2022',
    medium: 'Coloured Pencil & Acrylic',
    dimensions: 'A3',
    series: 'Studies',
    tags: ['rage', 'masking', 'melancholy', 'dissociation'],
    image: 'paintings/wake-me-up-when-its-over/main.jpg',
    gradient: 'linear-gradient(160deg, #050818 0%, #0a1535 40%, #1a2d50 60%, #050818 100%)',
    icon: '🔥',
    description: `
      <p>The head is on fire — not metaphorically. Orange and red flames erupt from the top of the skull while the face below stays completely still. Glasses. Bruises. A detached hand with a cigarette. A phone face-down on the floor.</p>
      <p>The blue around everything is electric, not peaceful. This blue shows up a lot in the work.</p>
    `,
    quote: "Many thoughts she thought were normal but really aren't.",
  },
  {
    id: 'goddess-of-death',
    title: 'Goddess of Death',
    year: '2022',
    medium: 'Acrylic & Pencil',
    dimensions: 'A3',
    series: 'Self-portraits',
    tags: ['self-portrait', 'decay', 'ritual', 'third eye', 'masking'],
    image: 'paintings/goddess-of-death/main.jpg',
    gradient: 'linear-gradient(145deg, #060202 0%, #180808 30%, #3d0c0c 55%, #0a0202 100%)',
    icon: '◈',
    description: `
      <p>She's smiling. That's the most unsettling part. The face is partially decomposed, the mouth still full of blood and teeth, a third eye weeping down the forehead. The halo behind the head is dark red — almost black at its edges.</p>
      <p>Small green leaves fall around her like she's still outside, still alive enough for seasons to happen around her.</p>
    `,
    quote: "As a human you'll always find the meaning behind the mistakes.",
  },
  {
    id: 'tick-tock',
    title: 'Tick, Tock',
    year: '2022',
    medium: 'Acrylic & Coloured Pencil',
    dimensions: 'A3',
    series: 'Time Studies',
    tags: ['clock', 'surveillance', 'melancholy', 'masking'],
    image: 'paintings/tick-tock/main.jpg',
    gradient: 'linear-gradient(160deg, #030818 0%, #081228 35%, #102040 60%, #030818 100%)',
    icon: '◎',
    description: `
      <p>Eyes everywhere in the background. A clock floats among them. Speech bubbles say "tick, tock, tick, tock" like it's the only thing left to say. The figure in the foreground has been stripped of features — just glasses, a red brooch, a hooded shape.</p>
      <p>The hatching in the background is frantic. Every line feels like it was made quickly, like the watching couldn't be paused.</p>
    `,
    quote: "It was always the younger sister.",
  },
  {
    id: 'guilt',
    title: "Guilt",
    year: '2022',
    medium: 'Acrylic & Coloured Pencil',
    dimensions: 'A3',
    series: 'Narrative Works',
    tags: ['control', 'psyche', 'confession', 'clock'],
    image: 'paintings/guilt/main.jpg',
    gradient: 'linear-gradient(145deg, #080810 0%, #101018 30%, #181820 55%, #080810 100%)',
    icon: '⬡',
    description: `
      <p>"I'm sorry I made you feel like you're in a maze in your own mind." A speech bubble. A blindfolded figure. An exposed brain on the side of the head. A blue clock floats in the upper right. The background is black and white checkerboard.</p>
      <p>The second speech bubble asks "what did I do wrong?" to nobody specific.</p>
    `,
    quote: "She would get used all the time by everyone, even by the person she thought would understand the struggle.",
  },
  {
    id: 'the-devils-death',
    title: "The Devil's Death",
    year: '2021–2022',
    medium: 'Acrylic & Coloured Pencil',
    dimensions: 'A3',
    series: 'Self-portraits',
    tags: ['self-portrait', 'snakes', 'decay', 'masking', 'ritual'],
    image: 'paintings/the-devils-death/main.jpg',
    gradient: 'linear-gradient(145deg, #050508 0%, #0c0c16 30%, #10101e 55%, #050508 100%)',
    icon: '🐍',
    description: `
      <p>Everything crowds into this one. Skulls in the upper left. A snake on the right. A strange creature that's also a face. Roses. Hands. Waves at the bottom. Blood running from the eyes and the forehead wound. The silver tinfoil crown catches the light differently every time.</p>
      <p>This painting is dense in the way a very full day feels when you're trying to sleep — everything present at once, refusing to quiet down.</p>
    `,
    quote: "As I grow up I see different meanings and new details in my art that I don't remember even making them on purpose.",
  },
  {
    id: 'feelings',
    title: 'Feelings',
    year: '2021–2022',
    medium: 'Acrylic & Coloured Pencil',
    dimensions: 'A3',
    series: 'Self-portraits',
    tags: ['self-portrait', 'snakes', 'sovereignty', 'ritual'],
    image: 'paintings/feelings/main.jpg',
    gradient: 'linear-gradient(145deg, #050507 0%, #0a0810 30%, #141020 55%, #050507 100%)',
    icon: '🐦',
    description: `
      <p>A raven perches on the left shoulder. A snake wraps around the right arm below. The figure wears a gold laurel crown and a black hooded cloak with gold embroidery. The third eye runs blood down the centre of the forehead. The right eye has a single tear.</p>
      <p>This is one of the most formally composed works in the collection — despite everything in it, there is a stillness here.</p>
    `,
    quote: "I remember begging God to let us be friends.",
  },
];

window.PAINTINGS = PAINTINGS;

function getPainting(id) {
  return PAINTINGS.find(p => p.id === id) || null;
}
function getPaintingAt(index) {
  return PAINTINGS[((index % PAINTINGS.length) + PAINTINGS.length) % PAINTINGS.length];
}
window.getPainting = getPainting;
window.getPaintingAt = getPaintingAt;