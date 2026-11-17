// sketch's service worker: keeps the site (HTML, CSS, JS, font and icon) so it opens offline.
// Drawings never go through here: they live in the browser or in the files you save.

const VERSION = 'sketch-v3';
const SHELL = [
  './',
  'index.html',
  'css/styles.css',
  'css/sketch.css',
  'fonts/caveat.woff',
  'icon.svg',
  'manifest.webmanifest',
  'js/app.js',
  'js/editor.js',
  'js/render.js',
  'js/scene.js',
  'js/stroke.js',
];

self.addEventListener('install', (ev) => {
  ev.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (ev) => {
  ev.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Network first (to always get the latest version); if there is none, what was kept.
self.addEventListener('fetch', (ev) => {
  const req = ev.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  ev.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const key = req.mode === 'navigate' ? 'index.html' : req;
    try {
      const res = await Promise.race([
        fetch(req),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000)),
      ]);
      if (res.ok && res.type === 'basic') cache.put(key, res.clone());
      return res;
    } catch (e) {
      const hit = await cache.match(key, { ignoreSearch: true });
      if (hit) return hit;
      throw e;
    }
  })());
});
