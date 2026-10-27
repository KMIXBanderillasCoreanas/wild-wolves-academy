// public/sw.js
// Service Worker Multiplataforma para Wild Wolves Performance OS
// Compatible con Android, iOS (16.4+), Windows, macOS y Linux
// Modo Offline Total: Stale-While-Revalidate con Fallback de Red para Duela

const CACHE_NAME = "wild-wolves-cache-v4";
const PRECACHE_ASSETS = [
  "/",
  "/login",
  "/master-bunker-hq",
  "/dashboard-coach",
  "/dashboard-student",
  "/dashboard-guardian",
  "/planilla_pruebas_deportivas_offline.html",
  "/manifest.json",
  "/logo-official.png",
  "/favicon.ico"
];

// 1. Instalación y Precaché de Rutas Principales
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Intentar cachear individualmente para que si uno falla no rompa los demás
      for (const asset of PRECACHE_ASSETS) {
        try {
          await cache.add(asset);
        } catch (e) {
          console.warn("No se pudo precachear:", asset, e);
        }
      }
    })
  );
  self.skipWaiting();
});

// 2. Activación y Purga Inmediata de Versiones Anteriores
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

// 3. ESTRATEGIA OFFLINE: Network-First con Fallback a Caché para Navegación
// Garantiza que cuando haya internet descargue la versión más reciente sin dar 404,
// y si NO hay internet, entregue la versión guardada en caché.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // No interceptar llamadas API externas (Supabase, Groq)
  if (
    url.hostname.includes("supabase.co") ||
    url.hostname.includes("groq.com") ||
    url.pathname.startsWith("/api/") ||
    req.method !== "GET"
  ) {
    return;
  }

  // A. Si es navegación de páginas (HTML)
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return networkResponse;
        })
        .catch(async () => {
          // OFFLINE: Entregar la página solicitada desde caché, o el Búnker o la Home
          const cached = await caches.match(req);
          if (cached) return cached;
          return (
            (await caches.match("/master-bunker-hq")) ||
            (await caches.match("/dashboard-coach")) ||
            (await caches.match("/planilla_pruebas_deportivas_offline.html")) ||
            (await caches.match("/"))
          );
        })
    );
    return;
  }

  // B. Si son assets estáticos (_next/static, imágenes, css, js)
  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      if (cachedResponse) {
        // Stale-While-Revalidate en segundo plano
        fetch(req)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(req, networkResponse));
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      // No está en caché: ir a la red y guardar copia
      return fetch(req)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return networkResponse;
        })
        .catch(() => {
          // Fallback silencioso si no hay red
          return new Response("", { status: 408, headers: { "Content-Type": "text/plain" } });
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
