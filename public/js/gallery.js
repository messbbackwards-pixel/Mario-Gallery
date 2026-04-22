/**
 * Mario's Gallery — Shared page effects
 * Included on every page.
 *
 * Handles: particles, spotlight, scroll-reveal, parallax.
 * Does NOT handle gallery filtering — that lives in gallery.html.
 */

// ─── Artwork Image Protection ──────────────────────────────
// Blocks casual right-click save and drag-off on all artwork images.
//
// Approach:
//   - CSS sets pointer-events:none on every artwork <img>, so
//     right-click events land on the container element, not the img.
//   - We intercept contextmenu on those containers to prevent the
//     browser "Save Image As" menu from appearing.
//   - dragstart is blocked at the document level as a fallback.
//   - draggable="false" is set on every artwork img element.
//
// Containers covered:
//   .hero-img-container  — painting page main artwork
//   .masonry-canvas      — gallery cards
//   .detail-img-wrap     — painting page detail images
//   .exhibit-canvas      — exhibition page
//   .featured-img        — homepage featured cards
//   #zoom-overlay        — full-view zoom modal
(function () {
  var ARTWORK_SEL = [
    '.hero-img',
    '.masonry-img',
    '.detail-img-wrap img',
    '.exhibit-canvas img',
    '.featured-img img',
    '#zoom-img',
  ].join(',');

  var CONTAINER_SEL = [
    '.hero-img-container',
    '.masonry-canvas',
    '.detail-img-wrap',
    '.exhibit-canvas',
    '.featured-img',
    '#zoom-overlay',
  ].join(',');

  function protectImages() {
    document.querySelectorAll(ARTWORK_SEL).forEach(function (img) {
      if (img.dataset.protected) return;
      img.setAttribute('draggable', 'false');
      img.dataset.protected = '1';
    });
  }

  // With pointer-events:none on the <img>, right-click events land
  // on the container. Block them there.
  document.addEventListener('contextmenu', function (e) {
    var t = e.target;
    if (t.matches(CONTAINER_SEL) || t.closest(CONTAINER_SEL)) {
      e.preventDefault();
    }
  });

  // Belt-and-suspenders: also block dragstart in case pointer-events
  // behaves differently across browsers.
  document.addEventListener('dragstart', function (e) {
    if (e.target.matches(ARTWORK_SEL)) {
      e.preventDefault();
    }
  });

  document.addEventListener('DOMContentLoaded', function () {
    protectImages();
    setTimeout(protectImages, 800);
    setTimeout(protectImages, 2000);
  });

  window._protectArtworkImages = protectImages;
}());
// ─── Particles ────────────────────────────────────────────
function createParticles(container, count = 25) {
  for (let i = 0; i < count; i++) {
    const p       = document.createElement('div');
    p.className   = 'particle';
    p.style.left  = Math.random() * 100 + '%';
    p.style.animationDuration = (32 + Math.random() * 22) + 's';
    p.style.animationDelay    = (Math.random() * 10) + 's';
    const size    = (1 + Math.random() * 2) + 'px';
    p.style.width  = size;
    p.style.height = size;
    p.style.opacity = (0.04 + Math.random() * 0.12).toFixed(2);
    if (Math.random() > 0.6) p.style.background = 'var(--purple-light)';
    container.appendChild(p);
  }
}


// ─── Spotlight on Painting Cards (painting.html) ──────────
// Only used on pages that have .painting-card + .painting-spotlight
function initSpotlight() {
  document.querySelectorAll('.painting-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect      = card.getBoundingClientRect();
      const x         = ((e.clientX - rect.left) / rect.width)  * 100;
      const y         = ((e.clientY - rect.top)  / rect.height) * 100;
      const spotlight = card.querySelector('.painting-spotlight');
      if (spotlight) {
        spotlight.style.setProperty('--mx', x + '%');
        spotlight.style.setProperty('--my', y + '%');
      }
    });
  });
}


// ─── Scroll-triggered Reveal ──────────────────────────────
//
// Targets any element with class "reveal-on-scroll".
// On the gallery page this is .masonry-motion (the inner wrapper),
// NOT .masonry-card, so reveal is isolated from both filtering
// and hover. On other pages it works on any element as before.
//
// Process:
//  1. Read data-stagger delay before adding .revealed so the
//     transition fires with the correct delay.
//  2. Use a single rAF to ensure the delay style is painted
//     before the class triggers the transition.
//  3. After reveal, clear transitionDelay and will-change so
//     the element doesn't hold a compositor layer indefinitely.
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const el      = entry.target;
      const stagger = parseFloat(el.dataset.stagger || 0);

      // Apply delay before the class so the transition picks it up
      el.style.transitionDelay = stagger + 's';

      requestAnimationFrame(() => {
        el.classList.add('revealed');

        // Once the reveal transition completes, tidy up:
        // clear the inline delay and release the will-change layer.
        // Delay = transition duration (1.3s) + stagger + small buffer.
        const clearAfter = (1300 + stagger * 1000 + 100);
        setTimeout(() => {
          el.style.transitionDelay = '';
          // will-change is already reset to 'auto' by the .revealed
          // rule in CSS, but this is a belt-and-suspenders clear.
          el.style.willChange = '';
        }, clearAfter);
      });

      observer.unobserve(el);
    });
  }, {
    threshold:  0.12,
    rootMargin: '0px 0px -60px 0px'
  });

  document.querySelectorAll('.reveal-on-scroll').forEach(el => {
    observer.observe(el);
  });
}


// ─── Parallax Background ──────────────────────────────────
function initParallax() {
  const layers = document.querySelectorAll('[data-parallax]');
  if (!layers.length) return;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    layers.forEach(layer => {
      const speed = parseFloat(layer.dataset.parallax) || 0.3;
      layer.style.transform = `translateY(${scrollY * speed}px)`;
    });
  }, { passive: true });
}


// ─── Init All ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initSpotlight();
  initScrollReveal();
  initParallax();

  const particleContainer = document.querySelector('.particles-container');
  if (particleContainer) createParticles(particleContainer, 30);
});
