/* Offline cache. build.py stamps the version so each release installs a fresh cache. */
const CACHE = 'rainphil-fsr-1.1.0-m2-20261030063402';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png'];

self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))));
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('rainphil-fsr-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
));
// The page asks to activate only when the engineer taps "Update", never mid-edit
self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request)));
});
