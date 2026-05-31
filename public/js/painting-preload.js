(function() {
  if (typeof PAINTINGS === 'undefined' || !PAINTINGS.length) return;

  var id = typeof getPaintingIdFromLocation === 'function'
    ? getPaintingIdFromLocation(window.location)
    : new URLSearchParams(location.search).get('id');

  id = id || PAINTINGS[0].id;

  var idx = typeof getPaintingIndex === 'function'
    ? getPaintingIndex(id)
    : PAINTINGS.findIndex(function(x) { return x.id === id; });

  if (idx === -1) return;

  var painting = PAINTINGS[idx];
  var image = typeof paintingImage === 'function'
    ? paintingImage(painting, 'display')
    : painting.image || ('paintings/' + id + '/main.jpg');

  document.title = painting.title + ' - Mario';
  document.documentElement.dataset.paintingIdx = idx;
  document.documentElement.dataset.paintingId = id;

  function setMeta(selector, attr, value) {
    if (!value) return;
    var el = document.head.querySelector(selector);
    if (!el) {
      el = document.createElement('meta');
      if (attr === 'property') el.setAttribute('property', selector.match(/"([^"]+)"/)[1]);
      if (attr === 'name') el.setAttribute('name', selector.match(/"([^"]+)"/)[1]);
      document.head.appendChild(el);
    }
    el.setAttribute('content', value);
  }

  var plainDescription = (painting.intro || painting.quote || painting.description || '')
    .replace(/<[^>]+>/g, '')
    .trim();

  setMeta('meta[name="description"]', 'name', plainDescription);
  setMeta('meta[property="og:title"]', 'property', painting.title + ' - Mario');
  setMeta('meta[property="og:description"]', 'property', plainDescription);
  setMeta('meta[property="og:image"]', 'property', image);
  setMeta('meta[property="og:type"]', 'property', 'article');
  setMeta('meta[name="twitter:card"]', 'name', 'summary_large_image');
  setMeta('meta[name="twitter:title"]', 'name', painting.title + ' - Mario');
  setMeta('meta[name="twitter:description"]', 'name', plainDescription);
  setMeta('meta[name="twitter:image"]', 'name', image);

  var preload = document.createElement('link');
  preload.rel = 'preload';
  preload.as = 'image';
  preload.href = image;
  preload.setAttribute('fetchpriority', 'high');
  document.head.appendChild(preload);
})();
