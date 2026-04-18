/**
 * OpenSea notifications service worker.
 *
 * Scope: /
 * Handles web push events from the notifications module.
 * Does NOT interfere with the /m/stock punch PWA (sw-punch.js in the
 * /m/stock scope). The two service workers coexist.
 */

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', event => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'OpenSea', body: event.data.text() };
  }

  const title = payload.title || 'OpenSea';
  const options = {
    body: payload.body || '',
    icon: '/icon.svg',
    badge: '/badge.svg',
    tag: payload.notificationId || undefined,
    renotify: Boolean(payload.notificationId),
    data: {
      notificationId: payload.notificationId,
      actionUrl: payload.actionUrl || '/notifications',
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  const target = event.notification.data?.actionUrl || '/notifications';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(list => {
        // Focus an existing tab if possible
        for (const client of list) {
          if ('focus' in client) {
            client.focus();
            if ('navigate' in client) {
              try {
                client.navigate(target);
              } catch (_) {
                // noop — cross-origin navigate rejected
              }
            }
            return;
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(target);
        }
      })
  );
});
