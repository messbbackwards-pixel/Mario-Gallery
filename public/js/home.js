    /* ─── Melting Clock (real time) ───────────────────── */
    /* ─── Candle Clock (real time, no seconds hand) ───────────────────── */
    const R = 183, cx = 200, cy = 200;
    const ticksG = document.getElementById('ticks');
    const numG = document.getElementById('numerals');

    for (let i = 0; i < 60; i++) {
      const angle = (i / 60) * Math.PI * 2 - Math.PI / 2;
      const isHour = i % 5 === 0;
      const inner = R - (isHour ? 14 : 6);

      const x1 = cx + Math.cos(angle) * inner;
      const y1 = cy + Math.sin(angle) * inner;
      const x2 = cx + Math.cos(angle) * R;
      const y2 = cy + Math.sin(angle) * R;

      const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      l.setAttribute('x1', x1);
      l.setAttribute('y1', y1);
      l.setAttribute('x2', x2);
      l.setAttribute('y2', y2);
      l.setAttribute('stroke-width', isHour ? '1.25' : '0.45');
      l.setAttribute('opacity', isHour ? '0.6' : '0.35');
      ticksG.appendChild(l);
    }

    const romans = ['XII','I','II','III','IV','V','VI','VII','VIII','IX','X','XI'];
    romans.forEach((r, i) => {
      const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(angle) * 160;
      const y = cy + Math.sin(angle) * 160;

      const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      t.setAttribute('x', x);
      t.setAttribute('y', y);
      t.textContent = r;
      numG.appendChild(t);
    });

    function polarPoint(deg, len) {
      const rad = (deg - 90) * Math.PI / 180;
      return {
        x: cx + Math.cos(rad) * len,
        y: cy + Math.sin(rad) * len,
        rad
      };
    }

    function makeCandlePath(deg, len, tail, wobble) {
      const start = polarPoint(deg, -tail);
      const tip = polarPoint(deg, len);

      const midLen = len * 0.6;
      const mid = polarPoint(deg, midLen);

      const px = -Math.sin(tip.rad);
      const py = Math.cos(tip.rad);

      const c1x = cx + Math.cos(tip.rad) * (len * 0.24) + px * wobble * 0.35;
      const c1y = cy + Math.sin(tip.rad) * (len * 0.24) + py * wobble * 0.35;

      const c2x = mid.x + px * wobble;
      const c2y = mid.y + py * wobble;

      return {
        d: `
          M ${start.x.toFixed(2)} ${start.y.toFixed(2)}
          L ${cx.toFixed(2)} ${cy.toFixed(2)}
          C ${c1x.toFixed(2)} ${c1y.toFixed(2)},
            ${c2x.toFixed(2)} ${c2y.toFixed(2)},
            ${tip.x.toFixed(2)} ${tip.y.toFixed(2)}
        `,
        tip,
        px,
        py
      };
    }

    function makeDripPath(baseX, baseY, length, sway) {
      return `
        M ${baseX.toFixed(2)} ${baseY.toFixed(2)}
        Q ${(baseX + sway * 0.45).toFixed(2)} ${(baseY + length * 0.45).toFixed(2)},
          ${(baseX + sway).toFixed(2)} ${(baseY + length).toFixed(2)}
      `;
    }

    function makeFlamePath(x, y, size, flickerX, flickerY) {
      const topX = x + flickerX;
      const topY = y - size - flickerY;

      const leftX = x - size * 0.48;
      const leftY = y - size * 0.2;

      const rightX = x + size * 0.48;
      const rightY = y - size * 0.2;

      const bottomX = x;
      const bottomY = y + size * 0.28;

      return `
        M ${bottomX.toFixed(2)} ${bottomY.toFixed(2)}
        C ${(x - size * 0.7).toFixed(2)} ${(y + size * 0.05).toFixed(2)},
          ${leftX.toFixed(2)} ${leftY.toFixed(2)},
          ${topX.toFixed(2)} ${topY.toFixed(2)}
        C ${rightX.toFixed(2)} ${rightY.toFixed(2)},
          ${(x + size * 0.7).toFixed(2)} ${(y + size * 0.05).toFixed(2)},
          ${bottomX.toFixed(2)} ${bottomY.toFixed(2)}
      `;
    }

    function updateClock() {
      const now = new Date();
      const t = Date.now() * 0.001;

      const m = now.getMinutes() + now.getSeconds() / 60;
      const h = (now.getHours() % 12) + m / 60;

      const hourDeg = (h / 12) * 360;
      const minuteDeg = (m / 60) * 360;

      const hourWobble = Math.sin(t * 0.55) * 4.5;
      const minuteWobble = Math.cos(t * 0.9) * 6.2;

      const hour = makeCandlePath(hourDeg, 82, 8, hourWobble);
      const minute = makeCandlePath(minuteDeg, 138, 10, minuteWobble);

      document.getElementById('hour-candle').setAttribute('d', hour.d);
      document.getElementById('minute-candle').setAttribute('d', minute.d);

      const hourBase1X = hour.tip.x - Math.cos(hour.tip.rad) * 18 + hour.px * 2.2;
      const hourBase1Y = hour.tip.y - Math.sin(hour.tip.rad) * 18;
      const hourBase2X = hour.tip.x - Math.cos(hour.tip.rad) * 32 - hour.px * 2.6;
      const hourBase2Y = hour.tip.y - Math.sin(hour.tip.rad) * 32;

      const minuteBase1X = minute.tip.x - Math.cos(minute.tip.rad) * 24 + minute.px * 1.8;
      const minuteBase1Y = minute.tip.y - Math.sin(minute.tip.rad) * 24;
      const minuteBase2X = minute.tip.x - Math.cos(minute.tip.rad) * 42 - minute.px * 2.1;
      const minuteBase2Y = minute.tip.y - Math.sin(minute.tip.rad) * 42;

      document.getElementById('hour-drip-1').setAttribute(
        'd',
        makeDripPath(hourBase1X, hourBase1Y, 10 + Math.sin(t * 1.1) * 2.5, Math.sin(t * 0.9) * 2)
      );
      document.getElementById('hour-drip-2').setAttribute(
        'd',
        makeDripPath(hourBase2X, hourBase2Y, 7 + Math.cos(t * 0.8) * 2, Math.cos(t * 1.2) * 1.8)
      );

      document.getElementById('minute-drip-1').setAttribute(
        'd',
        makeDripPath(minuteBase1X, minuteBase1Y, 12 + Math.sin(t * 1.4) * 3, Math.sin(t * 1.1) * 2.4)
      );
      document.getElementById('minute-drip-2').setAttribute(
        'd',
        makeDripPath(minuteBase2X, minuteBase2Y, 8 + Math.cos(t * 1.2) * 2.4, Math.cos(t * 1.35) * 1.9)
      );

      const hourFlameX = hour.tip.x;
      const hourFlameY = hour.tip.y - 2;
      const minuteFlameX = minute.tip.x;
      const minuteFlameY = minute.tip.y - 2;

      const hourFlickerX = Math.sin(t * 4.2) * 1.4;
      const hourFlickerY = Math.cos(t * 3.6) * 1.2;
      const minuteFlickerX = Math.cos(t * 5.0) * 1.2;
      const minuteFlickerY = Math.sin(t * 4.3) * 1.0;

      document.getElementById('hour-flame').setAttribute(
        'd',
        makeFlamePath(hourFlameX, hourFlameY, 9, hourFlickerX, hourFlickerY)
      );
      document.getElementById('minute-flame').setAttribute(
        'd',
        makeFlamePath(minuteFlameX, minuteFlameY, 7.2, minuteFlickerX, minuteFlickerY)
      );

      const hourHalo = document.getElementById('hour-flame-halo');
      hourHalo.setAttribute('cx', (hourFlameX + hourFlickerX * 0.35).toFixed(2));
      hourHalo.setAttribute('cy', (hourFlameY - 2 + hourFlickerY * 0.2).toFixed(2));
      hourHalo.setAttribute('rx', (8 + Math.sin(t * 3.8) * 0.9).toFixed(2));
      hourHalo.setAttribute('ry', (14 + Math.cos(t * 3.2) * 1.2).toFixed(2));

      const minuteHalo = document.getElementById('minute-flame-halo');
      minuteHalo.setAttribute('cx', (minuteFlameX + minuteFlickerX * 0.35).toFixed(2));
      minuteHalo.setAttribute('cy', (minuteFlameY - 2 + minuteFlickerY * 0.2).toFixed(2));
      minuteHalo.setAttribute('rx', (6.5 + Math.sin(t * 4.5) * 0.7).toFixed(2));
      minuteHalo.setAttribute('ry', (11 + Math.cos(t * 3.9) * 0.9).toFixed(2));
    }

    updateClock();
    let clockInterval = setInterval(updateClock, 90);

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        clearInterval(clockInterval);
      } else {
        updateClock();
        clockInterval = setInterval(updateClock, 90);
      }
    });

    /* ─── Dust motes ─────────────────────────────────── */
    const starsEl = document.getElementById('stars');
    for (let i = 0; i < 80; i++) {
      const s = document.createElement('div');
      s.className = 'star';
      const sz = Math.random() * 1.5 + 0.4;
      s.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*80}%;
        width:${sz}px;height:${sz}px;
        animation-duration:${3+Math.random()*5}s;
        animation-delay:${Math.random()*6}s;`;
      starsEl.appendChild(s);
    }

    /* ─── Floating motifs ────────────────────────────── */
    const motifContainer = document.getElementById('floating-motifs');

    const motifSVGs = {
      eye: `<svg viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 12 C7 4, 29 4, 34 12 C29 20, 7 20, 2 12 Z" stroke="currentColor" stroke-width="1" fill="none"/><circle cx="18" cy="12" r="4.5" stroke="currentColor" stroke-width="0.9" fill="none"/><circle cx="18" cy="12" r="1.8" fill="currentColor" opacity="0.7"/></svg>`,
      hourglass: `<svg viewBox="0 0 22 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 2 L19 2 L19 4 C19 10 12 16 12 16 C12 16 19 22 19 28 L19 30 L3 30 L3 28 C3 22 10 16 10 16 C10 16 3 10 3 4 Z" stroke="currentColor" stroke-width="1" fill="none"/><line x1="3" y1="2" x2="19" y2="2" stroke="currentColor" stroke-width="1.2"/><line x1="3" y1="30" x2="19" y2="30" stroke="currentColor" stroke-width="1.2"/></svg>`,
      blooddrop: `<svg viewBox="0 0 20 30" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 2 C10 2, 18 13, 18 19 C18 24.5 14.4 28 10 28 C5.6 28 2 24.5 2 19 C2 13 10 2 10 2 Z" stroke="currentColor" stroke-width="0.9" fill="none"/></svg>`,
      ring: `<svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="14" cy="14" r="11" stroke="currentColor" stroke-width="1" fill="none"/><circle cx="14" cy="14" r="5.5" stroke="currentColor" stroke-width="0.7" fill="none" opacity="0.5"/></svg>`,
    };

    const motifTypes = ['eye','hourglass','blooddrop','ring','eye','hourglass'];
    motifTypes.forEach((type) => {
      const el = document.createElement('div');
      el.className = 'float-motif';
      el.innerHTML = motifSVGs[type] || motifSVGs.eye;
      const sz = 0.7 + Math.random() * 0.6;
      el.style.cssText = `
        left: ${10 + Math.random()*80}%;
        bottom: ${Math.random()*60}%;
        width: ${sz * 22}px;
        height: ${sz * 22}px;
        color: rgba(216,207,196,0.55);
        animation-duration: ${18 + Math.random()*14}s;
        animation-delay: ${Math.random()*12}s;
        opacity: 0;
      `;
      motifContainer.appendChild(el);
    });

    /* ─── Featured works — driven by featured:true in paintings-manifest.js ── */
    const featuredGrid = document.getElementById('featured-grid');
    const featuredPaintings = typeof getFeaturedPaintings === 'function'
      ? getFeaturedPaintings(3)
      : PAINTINGS.filter(p => p.featured).slice(0, 3);
    const escapeHtml = window.htmlEscape || (value => String(value == null ? '' : value));

    featuredPaintings.forEach(p => {
        const card = document.createElement('a');
        card.className = 'featured-card';
        card.href = typeof getPaintingUrl === 'function' ? getPaintingUrl(p.id) : `painting.html?id=${p.id}`;
        const imgSrc = typeof paintingImage === 'function' ? paintingImage(p, 'thumb') : p.image;
        card.innerHTML = `
          <div class="featured-img" data-artwork-container>
            <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(p.title)}" loading="eager" draggable="false" data-artwork-img>
          </div>
          <div class="featured-label">
            <span class="featured-label-title">${escapeHtml(p.title)}</span>
            <span class="featured-label-year">${escapeHtml(p.year)} · ${escapeHtml(p.medium)}</span>
          </div>`;
        featuredGrid.appendChild(card);
      });

    /* ─── Scroll animations ──────────────────────────── */
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const t = entry.target;
        if (t.id === 'gallery-link-wrap') {
          t.style.opacity = '1';
          t.style.transform = 'translateY(0)';
        } else {
          t.classList.add('in-view');
        }
        io.unobserve(t);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

    [
      document.getElementById('section-head-1'),
      document.getElementById('statement-strip'),
      document.getElementById('gallery-link-wrap'),
      ...document.querySelectorAll('.featured-card'),
    ].forEach(el => { if (el) io.observe(el); });

    /* ─── Clock parallax ─────────────────────────────── */
    window.addEventListener('scroll', () => {
      const clock = document.querySelector('.bg-clock');
      if (clock) {
        clock.style.transform =
          `translate(-50%, calc(-50% + ${window.scrollY * 0.18}px))`;
      }
    }, { passive: true });
