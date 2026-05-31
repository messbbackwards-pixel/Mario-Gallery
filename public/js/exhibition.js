    // ─── Enter screen ──────────────────────────────────────
    var _enterHallCalled = false;
    function enterHall() {
      if (_enterHallCalled) return;
      _enterHallCalled = true;
      const screen = document.getElementById('enter-screen');
      screen.classList.add('hidden');
      setTimeout(() => { screen.remove(); }, 1200);
    }

    // ─── Build exhibition hall ─────────────────────────────
    //
    // Layout is driven by exhibitionLayout + exhibitionOrder flags
    // in paintings-manifest.js. Paintings are resolved by ID (never by
    // array index) so reordering PAINTINGS never breaks the exhibition.
    //
    // Layout types:
    //   text-painting  → text panel left, painting right
    //   painting-text  → painting left, text panel right
    //   trio           → three paintings in a row (grouped by exhibitionOrder)
    //   solo           → single centred painting
    //
    // The trio group collects all paintings with exhibitionLayout === 'trio',
    // sorted by id to keep a stable order independent of PAINTINGS order.

    const hall = document.getElementById('exhibition-hall');
    const escapeHtml = window.htmlEscape || (value => String(value == null ? '' : value));

    // Resolve paintings by ID, never by index
    function getPaintingById(id) {
      return typeof getPainting === 'function' ? getPainting(id) : PAINTINGS.find(p => p.id === id) || null;
    }

    // Render an exhibit image or gradient fallback
    // Images get data-artwork-img / data-artwork-container for protection
    function exhibitImg(p, h) {
      const imgSrc = typeof paintingImage === 'function' ? paintingImage(p, 'display') : p.image;
      if (imgSrc) {
        return `<img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(p.title)}"
                  data-artwork-img
                  draggable="false"
                  style="width:100%;height:${h}px;object-fit:cover;display:block;
                         filter:saturate(0.78) contrast(1.06) brightness(0.88);
                         transition:filter 0.5s,transform 0.5s;" loading="lazy">`;
      }
      return `<div style="height:${h}px;background:${p.gradient};display:flex;
                           align-items:center;justify-content:center;
                           font-size:3rem;opacity:0.5;">${escapeHtml(p.icon)}</div>`;
    }

    // Get the panel intro text directly from the manifest.
    // p.intro is already available — no fetch needed.
    function fallbackIntro(p) {
      return p.intro || p.description.replace(/<[^>]+>/g, '').trim().slice(0, 200) + '…';
    }

    // Layout configuration comes from manifest.json via paintings-manifest.js.
    const layouts = typeof getExhibitionLayouts === 'function'
      ? getExhibitionLayouts()
      : [];

    layouts.forEach(layout => {

      if (layout.type === 'text-painting') {
        const p   = getPaintingById(layout.paintingId);
        if (!p) return;
        const row = document.createElement('div');
        row.className = 'exhibition-row row-2 reveal-on-scroll';
        const h = 360;
        row.innerHTML = `
          <div class="exhibit-text-panel">
            <h3 class="exhibit-panel-title">${escapeHtml(layout.seriesName)}</h3>
            <p class="exhibit-panel-body" style="font-style:italic;opacity:0.7;margin-bottom:0.5rem;">${escapeHtml(layout.seriesNote)}</p>
            <p class="exhibit-panel-body exhibit-intro" data-painting-id="${escapeHtml(p.id)}">${escapeHtml(fallbackIntro(p))}</p>
            <a href="${typeof getPaintingUrl === 'function' ? getPaintingUrl(p.id) : 'painting.html?id=' + p.id}" class="btn-gothic" style="margin-top:1.5rem;font-size:0.7rem;padding:0.7rem 1.5rem;">View Work →</a>
          </div>
          <a class="exhibit-piece" href="${typeof getPaintingUrl === 'function' ? getPaintingUrl(p.id) : 'painting.html?id=' + p.id}">
            <div class="exhibit-spotlight"></div>
            <div class="exhibit-frame">
              <div class="c tl"></div><div class="c tr"></div><div class="c bl"></div><div class="c br"></div>
              <div class="exhibit-canvas" data-artwork-container style="overflow:hidden;">${exhibitImg(p, h)}</div>
            </div>
            <div class="exhibit-label">
              <span class="exhibit-label-title">${escapeHtml(p.title)}</span>
              <span class="exhibit-label-sub">${escapeHtml(p.year)} · ${escapeHtml(p.medium)}</span>
            </div>
          </a>`;
        hall.appendChild(row);

      } else if (layout.type === 'painting-text') {
        const p   = getPaintingById(layout.paintingId);
        if (!p) return;
        const row = document.createElement('div');
        row.className = 'exhibition-row row-2 reverse reveal-on-scroll';
        const h = 340;
        row.innerHTML = `
          <a class="exhibit-piece" href="${typeof getPaintingUrl === 'function' ? getPaintingUrl(p.id) : 'painting.html?id=' + p.id}">
            <div class="exhibit-spotlight"></div>
            <div class="exhibit-frame">
              <div class="c tl"></div><div class="c tr"></div><div class="c bl"></div><div class="c br"></div>
              <div class="exhibit-canvas" data-artwork-container style="overflow:hidden;">${exhibitImg(p, h)}</div>
            </div>
            <div class="exhibit-label">
              <span class="exhibit-label-title">${escapeHtml(p.title)}</span>
              <span class="exhibit-label-sub">${escapeHtml(p.year)} · ${escapeHtml(p.medium)}</span>
            </div>
          </a>
          <div class="exhibit-text-panel">
            <h3 class="exhibit-panel-title">${escapeHtml(layout.seriesName)}</h3>
            <p class="exhibit-panel-body" style="font-style:italic;opacity:0.7;margin-bottom:0.5rem;">${escapeHtml(layout.seriesNote)}</p>
            <p class="exhibit-panel-body exhibit-intro" data-painting-id="${escapeHtml(p.id)}">${escapeHtml(fallbackIntro(p))}</p>
            <a href="${typeof getPaintingUrl === 'function' ? getPaintingUrl(p.id) : 'painting.html?id=' + p.id}" class="btn-gothic" style="margin-top:1.5rem;font-size:0.7rem;padding:0.7rem 1.5rem;">View Work →</a>
          </div>`;
        hall.appendChild(row);

      } else if (layout.type === 'trio') {
        const divider = document.createElement('div');
        divider.className = 'series-divider reveal-on-scroll';
        divider.innerHTML = `
          <div class="gothic-divider"><div class="ornament">—</div></div>
          <span class="series-name">${escapeHtml(layout.seriesLabel)}</span>
          <div class="series-count">${escapeHtml(layout.seriesNote)}</div>`;
        hall.appendChild(divider);

        const row = document.createElement('div');
        row.className = 'exhibition-row row-3 reveal-on-scroll';
        const heights = [280, 360, 300];
        layout.paintingIds.forEach((id, i) => {
          const p = getPaintingById(id);
          if (!p) return;
          row.innerHTML += `
            <a class="exhibit-piece" href="${typeof getPaintingUrl === 'function' ? getPaintingUrl(p.id) : 'painting.html?id=' + p.id}">
              <div class="exhibit-spotlight"></div>
              <div class="exhibit-frame">
                <div class="c tl"></div><div class="c tr"></div><div class="c bl"></div><div class="c br"></div>
                <div class="exhibit-canvas" data-artwork-container style="overflow:hidden;">${exhibitImg(p, heights[i])}</div>
              </div>
              <div class="exhibit-label">
                <span class="exhibit-label-title">${escapeHtml(p.title)}</span>
                <span class="exhibit-label-sub">${escapeHtml(p.year)} · ${escapeHtml(p.medium)}</span>
              </div>
            </a>`;
        });
        hall.appendChild(row);

      } else if (layout.type === 'solo') {
        const p = getPaintingById(layout.paintingId);
        if (!p) return;
        const divider = document.createElement('div');
        divider.className = 'series-divider reveal-on-scroll';
        divider.innerHTML = `
          <div class="gothic-divider"><div class="ornament">—</div></div>
          <span class="series-name">${escapeHtml(layout.seriesName)}</span>
          <div class="series-count">${escapeHtml(layout.seriesNote)}</div>`;
        hall.appendChild(divider);

        const wrapper = document.createElement('div');
        wrapper.className = 'reveal-on-scroll';
        wrapper.style.cssText = 'max-width:520px;margin:0 auto;';
        wrapper.innerHTML = `
          <a class="exhibit-piece" href="${typeof getPaintingUrl === 'function' ? getPaintingUrl(p.id) : 'painting.html?id=' + p.id}">
            <div class="exhibit-spotlight"></div>
            <div class="exhibit-frame">
              <div class="c tl"></div><div class="c tr"></div><div class="c bl"></div><div class="c br"></div>
              <div class="exhibit-canvas" data-artwork-container style="overflow:hidden;">${exhibitImg(p, 420)}</div>
            </div>
            <div class="exhibit-label" style="text-align:center;padding:1rem;">
              <span class="exhibit-label-title" style="font-size:1rem;">${escapeHtml(p.title)}</span>
              <span class="exhibit-label-sub">${escapeHtml(p.year)} · ${escapeHtml(p.medium)}</span>
            </div>
          </a>`;
        hall.appendChild(wrapper);
      }
    });

    // Apply protection to dynamically rendered images
    if (window._protectArtworkImages) window._protectArtworkImages();
