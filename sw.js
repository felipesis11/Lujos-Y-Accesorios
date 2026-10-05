// ============================================
// SERVICE WORKER - Lujos y Accesorios
// ============================================
// Notas importantes:
// 1. Las rutas son RELATIVAS a propósito, para que funcione tanto en un
//    dominio propio como en un subdirectorio de GitHub Pages
//    (https://usuario.github.io/repositorio/).
// 2. addAll() falla COMPLETO si un solo recurso da error. Por eso se
//    cachea cada recurso por separado con cache.add() envuelto en su propio
//    try/catch: un 404 en una fuente ya no impide instalar el service worker.

const CACHE_NAME = 'lujos-y-accesorios-v7';
const CACHE_PREFIX = 'luja-';

// Solo recursos del propio sitio. Las fuentes externas se cachean aparte.
const STATIC_ASSETS = [
  './',
  'index.html',
  'css/styles.css',
  'css/paginas.css',
  'js/config.js',
  'js/app.js',
  'js/catalogo.js',
  'js/catalogo-extra.js',
  'js/rutas-productos.js',
  'js/tiktok-oembed.js',
  'js/catalogo-pdf.js',
  'js/buscador-repuestos.js',
  'sonido al seleccionar marcas/encendido de camion.mp3',
  'manifest.json',
  'img/favicon.png',
  'img/icon-192.png',
  'img/icon-512.png',
  'img/apple-touch-icon.png',
  'img/og-image.jpg',
  'img/tiktok/video1.jpg',
  'img/tiktok/video2.jpg',
  'img/tiktok/video3.jpg',
  'img/hero/camion-hero.png',
  'img/marcas/chevrolet.jpg',
  'img/marcas/jac.jpg',
  'img/marcas/foton.jpg',
  'img/marcas/jmc.jpg',
  'img/animaciones/chevrolet.png',
  'img/animaciones/jac.png',
  'img/animaciones/foton.png',
  'img/animaciones/jmc.png'
];

// Recursos de terceros: si fallan, el sitio sigue funcionando.
const EXTERNAL_ASSETS = [
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);

    // Cachea cada recurso por separado para tolerar errores puntuales.
    await Promise.all(STATIC_ASSETS.map(async (ruta) => {
      try {
        const url = new URL(ruta, self.registration.scope).href;
        const respuesta = await fetch(url, { cache: 'reload' });
        if (respuesta.ok || respuesta.type === 'opaque') {
          await cache.put(url, respuesta);
        }
      } catch (e) {
        console.warn('[SW] No se pudo cachear:', ruta, e.message);
      }
    }));

    await Promise.all(EXTERNAL_ASSETS.map(async (ruta) => {
      try {
        const respuesta = await fetch(ruta, { mode: 'no-cors' });
        await cache.put(ruta, respuesta);
      } catch (e) {
        console.warn('[SW] No se pudo cachear recurso externo:', ruta);
      }
    }));

    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(
      names
        .filter(n => n.startsWith(CACHE_PREFIX) && n !== CACHE_NAME)
        .map(n => caches.delete(n))
    );
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;

  // No interceptamos nada que no sea GET ni paginas/recursos del sitio.
  const esMismoOrigen = url.origin === self.location.origin;
  const esFuente = url.hostname.endsWith('fonts.googleapis.com') ||
                   url.hostname.endsWith('fonts.gstatic.com');
  if (!esMismoOrigen && !esFuente) return;

  // Navegacion: red primero, cache como respaldo (para funcionar offline).
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const respuesta = await fetch(request);
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, respuesta.clone());
        return respuesta;
      } catch (e) {
        const cache = await caches.open(CACHE_NAME);
        return (await cache.match(request)) ||
               (await cache.match('index.html')) ||
               Response.error();
      }
    })());
    return;
  }

  // CSS / JS / imagenes: cache primero, red como respaldo.
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const enCache = await cache.match(request);
    if (enCache) return enCache;

    try {
      const respuesta = await fetch(request);
      if (respuesta && (respuesta.ok || respuesta.type === 'opaque')) {
        cache.put(request, respuesta.clone());
      }
      return respuesta;
    } catch (e) {
      return Response.error();
    }
  })());
});
