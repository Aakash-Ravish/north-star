// North Star Service Worker for Push Notifications
// This enables push notifications and offline capabilities

const CACHE_NAME = 'north-star-v1';
const OFFLINE_URL = '/offline.html';

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  console.log('🐧 North Star Service Worker installing...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll([
          '/',
          '/chat',
          '/activities',
          '/journal',
          '/manifest.json',
          '/icon.svg'
        ]);
      })
      .then(() => {
        console.log('📦 North Star resources cached');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('✅ North Star Service Worker activated');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached response if found
        if (response) {
          return response;
        }

        // Otherwise fetch from network
        return fetch(event.request).catch(() => {
          // If network fails, return offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }
        });
      })
  );
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('🔔 Push notification received');

  if (!event.data) {
    console.log('Push event but no data');
    return;
  }

  try {
    const data = event.data.json();
    console.log('📨 Push data:', data);

    const options = {
      body: data.body || 'Pip has a message for you! 🐧',
      icon: data.icon || '/icon.svg',
      badge: '/icon.svg',
      image: data.image,
      data: data.data || {},
      actions: [
        {
          action: 'open',
          title: 'Open North Star',
          icon: '/icon.svg'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/icon.svg'
        }
      ],
      requireInteraction: false,
      silent: false,
      tag: 'north-star-notification',
      renotify: true,
      vibrate: [200, 100, 200]
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'North Star', options)
    );
  } catch (error) {
    console.error('Error handling push notification:', error);

    // Fallback notification
    event.waitUntil(
      self.registration.showNotification('North Star', {
        body: 'Pip the penguin sent you a wellness reminder! 🐧💙',
        icon: '/icon.svg',
        badge: '/icon.svg',
        tag: 'north-star-fallback'
      })
    );
  }
});

// Notification click event - handle user interactions
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ Notification clicked:', event);

  event.notification.close();

  const action = event.action;
  const data = event.notification.data || {};

  if (action === 'dismiss') {
    // User dismissed the notification
    return;
  }

  // Default action or 'open' action - open the app
  const urlToOpen = data.url || '/chat';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        // Check if app is already open
        for (const client of clients) {
          if (client.url.includes(self.location.origin)) {
            // Focus existing window and navigate
            return client.focus().then(() => {
              if (client.navigate) {
                return client.navigate(urlToOpen);
              }
            });
          }
        }

        // Open new window
        return self.clients.openWindow(urlToOpen);
      })
  );
});

// Background sync event - for offline actions
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync:', event.tag);

  if (event.tag === 'background-mood-sync') {
    event.waitUntil(syncOfflineMoodEntries());
  }
});

// Sync offline mood entries when back online
async function syncOfflineMoodEntries() {
  try {
    // This would sync any offline mood entries
    // For now, just log that sync is available
    console.log('📊 Background mood sync available');
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Message event - communicate with main app
self.addEventListener('message', (event) => {
  console.log('💬 Service Worker message:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('🐧 North Star Service Worker loaded successfully!');
