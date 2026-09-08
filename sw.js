const CACHE_NAME = 'travel-plans-v1';
const CORE_ASSETS = ['./', './index.html', './trips.json'];

self.addEventListener('install', function (event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return Promise.all(CORE_ASSETS.map(function (url) {
        return fetch(url).then(function (res) { if (res.ok) return cache.put(url, res); }).catch(function () {});
      }));
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE_NAME; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

function networkFirst(request, cacheKey, fallbackToShell) {
  return fetch(request).then(function (res) {
    if (res && res.ok) {
      var copy = res.clone();
      // Chain the cache write into the returned promise — a fire-and-forget .then() here can
      // get the worker suspended before the write finishes, silently dropping the cache entry.
      return caches.open(CACHE_NAME).then(function (cache) { return cache.put(cacheKey, copy); }).then(function () { return res; });
    }
    return res;
  }).catch(function () {
    return caches.match(cacheKey).then(function (cached) {
      if (cached) return cached;
      return fallbackToShell ? caches.match('./index.html') : Response.error();
    });
  });
}

function cacheFirst(request) {
  return caches.match(request).then(function (cached) {
    if (cached) return cached;
    return fetch(request).then(function (res) {
      if (res && res.ok) {
        var copy = res.clone();
        return caches.open(CACHE_NAME).then(function (cache) { return cache.put(request, copy); }).then(function () { return res; });
      }
      return res;
    });
  });
}

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);

  // App shell (the page itself) — prefer the network so updates land, fall back to the
  // last cached copy when offline.
  if (req.mode === 'navigate' || url.pathname.endsWith('/index.html')) {
    event.respondWith(networkFirst(req, './index.html', true));
    return;
  }

  // Trip data changes often (family adds bookings) — always try fresh first. Cache under a
  // stable key so the app's own cache-busting query string doesn't fragment the cache.
  if (url.pathname.endsWith('/trips.json')) {
    event.respondWith(networkFirst(req, './trips.json', false));
    return;
  }

  // Boarding passes / e-receipts never change once uploaded — cache them the first time
  // they're opened so they're viewable offline later (e.g. at the gate with no signal).
  if (url.hostname === 'kmbnchjyjoudthrinkcb.supabase.co' && url.pathname.indexOf('/storage/v1/object/public/booking-attachments/') !== -1) {
    event.respondWith(cacheFirst(req));
    return;
  }
});
