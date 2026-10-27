// public/sw.js
// Service Worker Multiplataforma para Wild Wolves Performance OS
// Compatible con Android, iOS (16.4+), Windows, macOS y Linux
// Modo Offline Total: Stale-While-Revalidate con Fallback de Red para Duela

const CACHE_NAME = "wild-wolves-cache-v3";
const PRECACHE_ASSETS = [
  "/",
  "/master-bunker-hq",
  "/dashboard-coach",
  "/dashboard-student",
  "/dashboard-guardian",
  "/manifest.json",
  "/logo-official.png",
  "/favicon.ico"
];

// 1. Instalación y Precaché de Rutas Principales
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn("Precaché parcial:", err);
      });
    })
  );
  self.skipWaiting();
});

// 2. Activación y Purga de Versiones Antiguas
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// 3. ESTRATEGIA OFFLINE: Cache First con Network Fallback para assets estáticos y páginas
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // No interceptar peticiones a la API de Supabase o Groq (deben gestionarse en IndexedDB)
  if (
    url.hostname.includes("supabase.co") ||
    url.hostname.includes("groq.com") ||
    req.method !== "GET"
  ) {
    return;
  }

  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      if (cachedResponse) {
        // En segundo plano revalidar con la red (Stale-While-Revalidate)
        fetch(req)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(req, networkResponse);
              });
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      // Si no está en caché, intentar red y luego guardar en caché
      return fetch(req)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, responseToCache);
          });
          return networkResponse;
        })
        .catch(() => {
          // Si estamos totalmente offline y piden navegar una página, entregar la home o búnker en caché
          if (req.mode === "navigate") {
            return caches.match("/master-bunker-hq") || caches.match("/");
          }
        });
    })
  );
});

// 4. NOTIFICACIONES PUSH EN SEGUNDO PLANO
self.addEventListener("push", (event) => {
  let data = {
    title: "🐺 Wild Wolves CDMX",
    body: "Actualización de cancha en Deportivo Carmen Serdán",
    icon: "/logo-official.png",
    badge: "/logo-official.png",
    tag: "wild-wolves-alert",
    url: "/master-bunker-hq",
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || "/logo-official.png",
    badge: data.badge || "/logo-official.png",
    tag: data.tag || "ww-alert",
    vibrate: [200, 100, 200, 100, 200],
    data: {
      url: data.url || "/master-bunker-hq",
    },
    actions: [
      { action: "open", title: "Abrir Búnker" },
      { action: "dismiss", title: "Cerrar" },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "dismiss") return;

  const targetUrl = event.notification.data?.url || "/master-bunker-hq";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes("master-bunker-hq") || client.url.includes(targetUrl)) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
