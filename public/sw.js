// Service Worker para Wild Wolves Basketball Academy CDMX
const CACHE_NAME = 'wild-wolves-cache-v2';
const STATIC_ASSETS = [
  '/',
  '/login',
  '/master-bunker-hq',
  '/dashboard-coach',
  '/dashboard-student',
  '/manifest.json',
  '/logo-official.png',
  '/icon.svg',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Solo interceptar peticiones GET dentro del mismo origen
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Ignorar llamadas de API dinámicas o autenticación
  if (event.request.url.includes('/api/') || event.request.url.includes('/auth/')) {
    return;
  }

  // Estrategia Network First con fallback a Cache y navegación offline resiliente
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        if (event.request.mode === 'navigate') {
          // Intentar coincidir la ruta solicitada o fallback a la página principal en caché
          const fallback = await caches.match(event.request.url) || await caches.match('/master-bunker-hq') || await caches.match('/dashboard-coach') || await caches.match('/');
          if (fallback) return fallback;
        }
        return new Response('Sin conexión a red. Wild Wolves PWA Cache activa.', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' },
        });
      })
  );
});
