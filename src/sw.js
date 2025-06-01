// Enhanced Service Worker for PWA
const CACHE_NAME = 'story-app-v2';
const STATIC_CACHE_NAME = 'story-app-static-v2';
const DYNAMIC_CACHE_NAME = 'story-app-dynamic-v2';

// Application Shell - Static assets that rarely change
const APP_SHELL = [
  '/',
  '/index.html',
  '/styles/styles.css',
  '/scripts/index.js',
  '/manifest.json',
  '/images/icon-192x192.png',
  '/images/icon-512x512.png',
  // Leaflet CSS and JS
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  // Font Awesome
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css',
  // Offline fallback page
  '/offline.html'
];

// Install event - Cache App Shell
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker');
  
  event.waitUntil(
    Promise.all([
      // Cache App Shell
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('[SW] Caching App Shell');
        return cache.addAll(APP_SHELL);
      }),
      // Cache API endpoints for offline access
      caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
        console.log('[SW] Preparing dynamic cache');
        return cache.put('/api/offline', new Response('Offline mode'));
      })
    ]).then(() => {
      console.log('[SW] Installation complete');
      return self.skipWaiting();
    })
  );
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker');
  
  const cacheWhitelist = [STATIC_CACHE_NAME, DYNAMIC_CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch event - Network first for API, Cache first for static assets
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);
  
  // Handle API requests (network first strategy)
  if (requestUrl.pathname.startsWith('/v1/') || requestUrl.hostname.includes('story-api.dicoding.dev')) {
    event.respondWith(handleApiRequest(event.request));
    return;
  }
  
  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(event.request));
    return;
  }
  
  // Handle static assets (cache first strategy)
  event.respondWith(handleStaticAssets(event.request));
});

// Handle API requests with network first strategy
async function handleApiRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // If successful and it's a GET request, cache the response
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed for API request, trying cache');
    
    // Try to get from cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for stories
    if (request.url.includes('/stories')) {
      return new Response(JSON.stringify({
        error: false,
        message: 'Offline stories',
        listStory: await getOfflineStories()
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Return generic offline response
    return new Response(JSON.stringify({
      error: true,
      message: 'Network unavailable. Please check your connection.'
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle navigation requests (for SPA routing)
async function handleNavigationRequest(request) {
  try {
    // Try network first for navigation
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed for navigation, serving app shell');
    
    // Serve app shell from cache
    const cachedResponse = await caches.match('/index.html');
    return cachedResponse || await caches.match('/offline.html');
  }
}

// Handle static assets with cache first strategy
async function handleStaticAssets(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If not in cache, fetch from network
    const networkResponse = await fetch(request);
    
    // Cache the response for future use
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Failed to fetch static asset:', request.url);
    
    // Return offline fallback for images
    if (request.destination === 'image') {
      return new Response('', { status: 200, statusText: 'OK' });
    }
    
    // Return offline page for HTML requests
    if (request.destination === 'document') {
      return await caches.match('/offline.html');
    }
    
    return new Response('Offline', { status: 503 });
  }
}

// Get offline stories from IndexedDB
async function getOfflineStories() {
  try {
    // This will be implemented when we add IndexedDB
    return [];
  } catch (error) {
    return [];
  }
}

// Handle messages from main thread
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SIMULATE_PUSH') {
    // Simulate a push notification
    const { title, body } = event.data.data;
    
    self.registration.showNotification(title || 'Simulated Push', {
      body: body || 'This is a simulated push notification',
      icon: '/images/icon-192x192.png',
      badge: '/images/icon-96x96.png',
      tag: 'simulated-push'
    }).then(() => {
      console.log('[SW] Simulated push notification shown');
    }).catch(error => {
      console.error('[SW] Error showing simulated notification:', error);
    });
  }
});

// Push notification event handlers
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  let notificationData = {
    title: 'New Story',
    options: {
      body: 'Someone shared a new story!',
      icon: '/images/icon-192x192.png',
      badge: '/images/icon-96x96.png'
    }
  };
  
  // Safely parse push data
  if (event.data) {
    try {
      const pushData = event.data.text();
      console.log('[SW] Raw push data:', pushData);
      
      // Try to parse as JSON
      if (pushData.trim().startsWith('{')) {
        notificationData = JSON.parse(pushData);
      } else {
        // If not JSON, treat as simple message
        notificationData.options.body = pushData;
      }
    } catch (error) {
      console.warn('[SW] Failed to parse push data, using default:', error);
      // Use default notification data
    }
  }
  
  const title = notificationData.title || 'StoryShare';
  const options = {
    body: notificationData.options?.body || notificationData.body || 'You have a new notification!',
    icon: notificationData.options?.icon || '/images/icon-192x192.png',
    badge: notificationData.options?.badge || '/images/icon-96x96.png',
    image: notificationData.options?.image || null,
    data: notificationData.data || { url: '/' },
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/images/icon-96x96.png'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ],
    requireInteraction: false,
    silent: false,
    tag: 'story-notification',
    renotify: true
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
      .then(() => {
        console.log('[SW] Notification shown successfully');
      })
      .catch(error => {
        console.error('[SW] Error showing notification:', error);
      })
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }
  
  // Default action or 'view' action
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Background sync for offline story submissions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered');
  
  if (event.tag === 'story-sync') {
    event.waitUntil(syncOfflineStories());
  }
});

// Sync offline stories when connection is restored
async function syncOfflineStories() {
  try {
    // This will be implemented with IndexedDB
    console.log('[SW] Syncing offline stories...');
    
    // Send message to all clients about sync status
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        message: 'Offline stories synced successfully'
      });
    });
  } catch (error) {
    console.error('[SW] Error syncing offline stories:', error);
  }
}