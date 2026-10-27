
const C = 'cam-nang-offline-v3';

const F = [
  './',
  './index.html',
  './saban.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './assets/sa-ban-3d.png',
  './pages/moc-41.html',
  './pages/moc-42.html',
  './pages/moc-44.html',
  './pages/moc-45.html',
  './pages/moc-46.html',
  './pages/moc-47.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(C)
      .then(cache => cache.addAll(F))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== C)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isLocalResource =
    url.origin === self.location.origin &&
    url.pathname.startsWith('/cam-nang-moc-quoc-gioi-offline/') &&
    (
      url.pathname.endsWith('.html') ||
      url.pathname.endsWith('.css') ||
      url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.png') ||
      url.pathname.endsWith('.jpg') ||
      url.pathname.endsWith('.jpeg') ||
      url.pathname.endsWith('.webp') ||
      url.pathname.endsWith('.svg') ||
      url.pathname.endsWith('.json')
    );

  if (!isLocalResource) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(C).then(cache => cache.put(event.request, copy));
        }
        return response;
      });
    })
  );
});
