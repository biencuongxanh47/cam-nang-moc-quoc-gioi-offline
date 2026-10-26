
const C = 'cam-nang-offline-v2';

const F = [
  './',
  './index.html',
  './saban.html',
  './styles.css',
  './app.js',
  './manifest.json',
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
  const isLocalPage =
    url.origin === self.location.origin &&
    (url.pathname.endsWith('.html') ||
     url.pathname.endsWith('.css') ||
     url.pathname.endsWith('.js'));

  if (!isLocalPage) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(C).then(cache => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
