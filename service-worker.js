
const CACHE_NAME = 'cam-nang-offline-v10';

const FILES_TO_CACHE = [
  './',
  './index.html',
  './saban.html',
  './styles.css',
  './app.js',
  './manifest.json',

  './assets/sa-ban-3d.png',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/apple-touch-icon.png',
  './assets/icon-cot-moc.png.png',
  './assets/icon-luat-bien-phong.png.png',
  './assets/icon-luat-bien-gioi-quoc-gia.png',

  './pages/moc-41.html',
  './pages/moc-42.html',
  './pages/moc-44.html',
  './pages/moc-45.html',
  './pages/moc-46.html',
  './pages/moc-47.html',

  './documents/van-ban-hop-nhat-luat-bien-phong-viet-nam.pdf',
  './documents/van-ban-hop-nhat-luat-bien-gioi-quoc-gia.pdf'
];

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key =>
            key.startsWith('cam-nang-offline-') &&
            key !== CACHE_NAME
          )
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  const isLocalResource =
    url.origin === self.location.origin &&
    url.pathname.startsWith('/cam-nang-moc-quoc-gioi-offline/') &&
    !url.pathname.endsWith('/service-worker.js');

  if (!isLocalResource) return;

  event.respondWith(
    fetch(request)
      .then(response => {
        if (response && response.ok) {
          const copy = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => cache.put(request, copy))
            .catch(() => {});
        }

        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);

        if (cached) return cached;

        if (request.mode === 'navigate') {
          const home = await caches.match('./index.html');
          if (home) return home;
        }

        return new Response(
          'Tài liệu chưa được lưu để sử dụng ngoại tuyến.',
          {
            status: 503,
            headers: {
              'Content-Type': 'text/plain; charset=utf-8'
            }
          }
        );
      })
  );
});
