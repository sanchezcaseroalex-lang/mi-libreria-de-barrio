// Service worker: la aplicación funciona sin conexión tras la primera carga.
// Cambia VERSION al publicar una versión nueva para forzar la actualización.
const VERSION = 'v32-2026-11-06';
const SHELL = 'shell-' + VERSION, ASSETS = 'assets-' + VERSION;
const PRECACHE = ["index.html","manifest.webmanifest","styles.css","styles3d.css","styles-phone.css","styles-loading.css","icons/icon-maskable-512.png","icons/icon-96.png","arte/logo/icono-pantalla.webp","icons/icon-192.png","icons/icon-512.png","icons/icon-180.png","arte/pantallas/carga.jpg","vendor/three.module.js","vendor/addons/geometries/RoundedBoxGeometry.js","src/app.js","src/art.js","src/audio.js","src/books.js","src/boot.js","src/boxscene.js","src/cast.js","src/furniture3d.js","src/game.js","src/kit3d.js","src/layout.js","src/pass.js","src/photo3d.js","src/people3d.js","src/rodeos.js","src/store.js","src/story.js","src/town3d.js","src/van3d.js","src/viewer.js","src/world.js","fonts/caveat-latin-600-normal.woff2","fonts/cinzel-latin-700-normal.woff2","fonts/fraunces-latin-600-normal.woff2","fonts/fraunces-latin-700-normal.woff2","fonts/nunito-latin-400-normal.woff2","fonts/nunito-latin-700-normal.woff2","fonts/oswald-latin-500-normal.woff2"];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(SHELL);
    await Promise.all(PRECACHE.map((u) => c.add(new Request(u, { cache: 'reload' })).catch(() => {})));
    try {
      const a = await caches.open(ASSETS);
      const lista = await (await fetch('audio/musica/lista.json', { cache: 'no-store' })).json();
      await a.add('audio/musica/lista.json');
      await Promise.all(lista.map((n) => a.add('audio/musica/' + encodeURIComponent(n)).catch(() => {})));
    } catch (err) { /* sin música todavía */ }
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== SHELL && k !== ASSETS) await caches.delete(k);
    await self.clients.claim();
  })());
});

// El audio se pide por trozos (Range): se sirve desde la caché recortando el trozo pedido
async function audioDeCache(req) {
  const hit = await caches.match(req.url.split('#')[0], { ignoreSearch: true });
  if (!hit) return fetch(req);
  const buf = await hit.arrayBuffer(), m = /bytes=(\d+)-(\d*)/.exec(req.headers.get('range') || '');
  if (!m) return new Response(buf, { status: 200, headers: { 'Content-Type': hit.headers.get('Content-Type') || 'audio/mpeg', 'Content-Length': buf.byteLength } });
  const ini = +m[1], fin = m[2] ? Math.min(+m[2], buf.byteLength - 1) : buf.byteLength - 1;
  return new Response(buf.slice(ini, fin + 1), { status: 206, headers: { 'Content-Type': hit.headers.get('Content-Type') || 'audio/mpeg', 'Content-Range': 'bytes ' + ini + '-' + fin + '/' + buf.byteLength, 'Content-Length': fin - ini + 1, 'Accept-Ranges': 'bytes' } });
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (/\.(mp3|ogg|m4a|wav)$/i.test(url.pathname)) { e.respondWith(audioDeCache(req)); return; }
  const codigo = req.mode === 'navigate' || /\.(html|js|css|json|webmanifest)$/i.test(url.pathname);
  if (codigo) {
    // red primero (siempre la versión más nueva) y, sin conexión, la guardada
    e.respondWith((async () => {
      try {
        const res = await fetch(req, { cache: 'no-cache' });   // siempre revalidar: así una actualización llega en cuanto se abre la app
        if (res.ok) { const c = await caches.open(SHELL); c.put(req, res.clone()); }
        return res;
      } catch (err) {
        return (await caches.match(req, { ignoreSearch: true })) || (await caches.match('index.html')) || Response.error();
      }
    })());
    return;
  }
  // imágenes, fuentes…: caché primero
  e.respondWith((async () => {
    const hit = await caches.match(req);
    if (hit) return hit;
    const res = await fetch(req);
    if (res.ok) { const c = await caches.open(ASSETS); c.put(req, res.clone()); }
    return res;
  })());
});
