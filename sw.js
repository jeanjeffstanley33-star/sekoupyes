// Service Worker pou notifikasyon push SekouPyès
self.addEventListener("push", function (event) {
  let data = { title: "SekouPyès", body: "Ou gen yon nouvo notifikasyon." };
  try { data = event.data.json(); } catch (e) { /* itilize valè pa def\u00f2 yo */ }
  event.waitUntil(
    self.registration.showNotification(data.title || "SekouPyès", {
      body: data.body || "",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: { url: data.url || "/" },
    })
  );
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    clients.matchAll({ type: "window" }).then(function (clientList) {
      for (const client of clientList) {
        if (client.url.indexOf(self.location.origin) === 0 && "focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
