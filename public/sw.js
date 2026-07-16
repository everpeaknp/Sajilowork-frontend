/**
 * Service worker for SajiloWork Web Push.
 * Kept in /public so it is served from the site origin root.
 */
/* eslint-disable no-restricted-globals */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let payload = {
    title: 'SajiloWork',
    body: 'You have a new notification',
    url: '/tasker-dashboard/notifications',
    tag: 'sajilowork-notification',
    data: {},
  };

  try {
    if (event.data) {
      const json = event.data.json();
      payload = {
        ...payload,
        ...json,
        data: { ...(payload.data || {}), ...(json.data || {}) },
        url: json.url || json.data?.url || payload.url,
      };
    }
  } catch (_err) {
    try {
      const text = event.data && event.data.text();
      if (text) payload.body = text;
    } catch {
      // ignore
    }
  }

  const options = {
    body: payload.body,
    icon: '/icon',
    badge: '/icon',
    tag: payload.tag || 'sajilowork-notification',
    renotify: true,
    data: {
      url: payload.url,
      ...(payload.data || {}),
    },
  };

  event.waitUntil(self.registration.showNotification(payload.title || 'SajiloWork', options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl =
    (event.notification.data && event.notification.data.url) ||
    '/tasker-dashboard/notifications';

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });
      for (const client of allClients) {
        if ('focus' in client) {
          await client.focus();
          if ('navigate' in client && targetUrl) {
            try {
              await client.navigate(targetUrl);
            } catch {
              // ignore navigate failures
            }
          }
          return;
        }
      }
      if (self.clients.openWindow) {
        await self.clients.openWindow(targetUrl);
      }
    })(),
  );
});
