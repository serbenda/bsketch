// Service worker de sketch: guarda la web (HTML, CSS, JS, letra e icono) para abrirla sin conexión.
// Los dibujos no pasan por aquí: viven en el navegador o en los ficheros que guardas.

const VERSION = 'sketch-v1';
const SHELL = [
  './',
  'index.html',
  'css/estilos.css',
  'css/sketch.css',
  'fonts/caveat.woff',
  'icon.svg',
  'manifest.webmanifest',
  'js/app.js',
  'js/editor.js',
  'js/escena.js',
  'js/pintar.js',
  'js/trazo.js',
];

self.addEventListener('install', (ev) => {
  ev.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (ev) => {
  ev.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Primero la red (para tener siempre la última versión); si no hay, lo guardado.
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
