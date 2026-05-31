    // ─── Build filter buttons from painting tags ─────────────
    const allTags = [...new Set(PAINTINGS.flatMap(p => p.tags))];
    const filtersEl = document.getElementById('filters');

    allTags.forEach(tag => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn';
      btn.dataset.filter = tag;
      btn.textContent = tag.charAt(0).toUpperCase() + tag.slice(1);
      filtersEl.appendChild(btn);
    });


    // ════════════════════════════════════════════════════════
    //  FILTER SYSTEM
    // ════════════════════════════════════════════════════════
    //
    //  Class states on .masonry-card:
    //    (none)         — stable visible
    //    .card-hiding   — fading out, 220ms ease-in
    //    .card-hidden   — display:none, out of layout
    //    .card-showing  — fading in, 380ms ease-out
    //
    //  Staying cards: zero class changes. Completely inert.
    //
    //  Exit uses transitionend (not setTimeout) so display:none
    //  fires at the exact moment opacity reaches 0 — no timer
    //  drift, no ghost frames, no lingering.
    // ════════════════════════════════════════════════════════

    let activeFilter = 'all';

    // Cards currently mid-exit, keyed by card element.
    // Allows rapid-switch to snap them instantly.
    const exitingCards = new Set();

    filtersEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;

      const filter = btn.dataset.filter;
      if (filter === activeFilter) return;
      activeFilter = filter;

      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // ── Rapid-switch: snap in-flight exits to hidden now ──
      // Any card still fading out gets collapsed immediately so
      // the new pass starts from a clean, resolved state.
      if (exitingCards.size > 0) {
        exitingCards.forEach(card => {
          card.classList.remove('card-hiding');
          card.classList.add('card-hidden');
          card.setAttribute('aria-hidden', 'true');
          card.setAttribute('tabindex', '-1');
        });
        exitingCards.clear();
      }

      // ── Classify every card ───────────────────────────────
      document.querySelectorAll('.masonry-card').forEach(card => {
        const tags    = card.dataset.tags.split(',');
        const match   = filter === 'all' || tags.includes(filter);
        const hiding  = card.classList.contains('card-hiding');
        const hidden  = card.classList.contains('card-hidden');
        const showing = card.classList.contains('card-showing');
        const stable  = !hiding && !hidden && !showing;

        // Nothing to do for already-correct states
        if (match && stable)  return;
        if (!match && hidden) return;

        // ── Visible card that needs to leave ─────────────────
        if (!match && stable) {
          card.classList.add('card-hiding');
          exitingCards.add(card);

          card.addEventListener('transitionend', function onExit(ev) {
            // Guard: only react to opacity on the card itself,
            // not to transitions on child elements (img scale etc.)
            if (ev.target !== card || ev.propertyName !== 'opacity') return;
            card.removeEventListener('transitionend', onExit);
            exitingCards.delete(card);
            // Guard: rapid switch may have already snapped this
            if (card.classList.contains('card-hiding')) {
              card.classList.remove('card-hiding');
              card.classList.add('card-hidden');
              card.setAttribute('aria-hidden', 'true');
              card.setAttribute('tabindex', '-1');
            }
          }, { once: false });
          return;
        }

        // ── Hidden card that needs to appear ─────────────────
        if (match && hidden) {
          // Step 1: restore display:block at opacity:0 with the
          //   slow enter transition active (.card-showing).
          card.classList.remove('card-hidden');
          card.classList.add('card-showing');
          card.removeAttribute('aria-hidden');
          card.removeAttribute('tabindex');

          // Step 2: two rAFs ensure the browser has fully painted
          //   the display:block + opacity:0 state before we trigger
          //   the transition by removing .card-showing.
          //   rAF 1: layout restores. rAF 2: mutate opacity.
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              if (card.classList.contains('card-showing')) {
                card.classList.remove('card-showing');
              }
            });
          });
          return;
        }

        // ── Edge cases for rapid switching ───────────────────

        // Was entering but shouldn't be anymore → snap to hidden
        if (!match && showing) {
          card.classList.remove('card-showing');
          card.classList.add('card-hidden');
          card.setAttribute('aria-hidden', 'true');
          card.setAttribute('tabindex', '-1');
          return;
        }

        // Was exiting but now matches again → cancel exit
        if (match && hiding) {
          card.classList.remove('card-hiding');
          exitingCards.delete(card);
          // Falls back to stable — no extra class needed
        }
      });
    });


    // ════════════════════════════════════════════════════════
    //  RENDER PAINTINGS
    // ════════════════════════════════════════════════════════

    const masonryEl = document.getElementById('gallery-masonry');
    const countEl   = document.getElementById('painting-count');
    countEl.textContent = `${PAINTINGS.length} paintings`;
    const escapeHtml = window.htmlEscape || (value => String(value == null ? '' : value));

    const heights  = [300, 370, 320, 400, 280, 350, 310, 360, 340, 390, 300];
    const colCount = window.innerWidth > 1000 ? 3 : window.innerWidth > 600 ? 2 : 1;

    PAINTINGS.forEach((p, i) => {
      const card = document.createElement('a');
      card.className    = 'masonry-card';
      card.href         = typeof getPaintingUrl === 'function' ? getPaintingUrl(p.id) : `painting.html?id=${p.id}`;
      card.dataset.tags = p.tags.join(',');

      const col        = i % colCount;
      const staggerSec = (col * 0.12).toFixed(2);
      const h          = heights[i % heights.length];
      const loadStrat  = i < 6 ? 'eager' : 'lazy';

      const imgSrc = typeof paintingImage === 'function' ? paintingImage(p, 'thumb') : p.image;
      const imgContent = imgSrc
        ? `<img
              class="masonry-img"
              src="${escapeHtml(imgSrc)}"
              alt="${escapeHtml(p.title)}"
              style="height:${h}px;"
              loading="${loadStrat}"
              draggable="false"
              data-artwork-img
              decoding="async">`
        : `<div
              class="masonry-placeholder"
              style="height:${h}px;background:${p.gradient};"
            >${escapeHtml(p.icon)}</div>`;

      card.innerHTML = `
        <div class="masonry-motion reveal-on-scroll" data-stagger="${staggerSec}">
          <div class="masonry-frame">
            <div class="masonry-canvas" data-artwork-container>
              ${imgContent}
            </div>
          </div>
          <div class="masonry-info">
            <span class="masonry-tag-count">${escapeHtml(p.year)}</span>
            <div class="masonry-title">${escapeHtml(p.title)}</div>
            <div class="masonry-meta">${escapeHtml(p.medium)}</div>
            <span class="masonry-badge">${escapeHtml(p.series)}</span>
          </div>
        </div>
      `;

      masonryEl.appendChild(card);
    });
