/* Offline cache. build.py stamps the build id here and in index.html so each release installs a fresh, matching cache. */
const BUILD = '1.3.0-20261030153509';
const CACHE = 'rainphil-fsr-' + BUILD;
const FILES = ['manifest.webmanifest', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png'];

// Skip the browser's HTTP cache, and refuse a page from another build: GitHub's CDN can serve the old
// index.html for a few minutes after a deploy. A refused install is retried the next time the app opens.
self.addEventListener('install', e => e.waitUntil((async () => {
  const page = await fetch('index.html', { cache: 'reload' });
  if (!page.ok || !(await page.clone().text()).includes(`<meta name="fsr-build" content="${BUILD}">`)) throw new Error('index.html is not from build ' + BUILD + ' yet');
  const c = await caches.open(CACHE);
  await c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })));
  await c.put('index.html', page.clone());
  await c.put('./', page);
})()));
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('rainphil-fsr-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
));
// The page asks to activate only when the engineer taps "Update", never mid-edit
self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request)));
});
