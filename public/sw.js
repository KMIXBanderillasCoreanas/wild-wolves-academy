// public/sw.js
// Service Worker Multiplataforma para Wild Wolves Performance OS
// Compatible con Android, iOS (16.4+), Windows, macOS y Linux

const CACHE_NAME = "wild-wolves-cache-v2";
const ASSETS_TO_CACHE = [
  "/",
  "/manifest.json",
  "/logo-official.png",
  "/favicon.ico"
];

// 1. Instalación y precaché mínimo
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {});
    })
  );
  self.skipWaiting();
});

// 2. Activación y limpieza de cachés viejos
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

// 3. SISTEMA NERVIOSO: Escucha de Notificaciones Push en Segundo Plano
self.addEventListener("push", (event) => {
  let data = {
    title: "🐺 Wild Wolves CDMX",
    body: "Nueva actualización en la academia",
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
    vibrate: [200, 100, 200, 100, 200], // Patrón de vibración alerta estilo WhatsApp
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

// 4. Clic en la Notificación
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const targetUrl = event.notification.data?.url || "/master-bunker-hq";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes("wild-wolves") || client.url.includes("master-bunker-hq") || client.url.includes(targetUrl)) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
