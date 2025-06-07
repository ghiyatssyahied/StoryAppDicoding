// Enhanced Service Worker for StoryShare PWA
const CACHE_NAME = 'storyshare-v1';
const STATIC_CACHE_NAME = 'storyshare-static-v1';
const DYNAMIC_CACHE_NAME = 'storyshare-dynamic-v1';

// Application Shell - Static assets that rarely change
const APP_SHELL = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  // CSS files - sesuai struktur yang terlihat
  '/src/styles/index.css',
  // JS files - sesuai struktur dari gambar
  '/src/scripts/index.js',
  '/src/scripts/config.js',
  '/src/scripts/routes.js',
  // Data layer
  '/src/scripts/data/api.js',
  // Pages
  '/src/scripts/pages/about.js',
  '/src/scripts/pages/auth.js',
  '/src/scripts/pages/favorites.js',
  '/src/scripts/pages/home.js',
  '/src/scripts/pages/home-page.js',
  '/src/scripts/pages/not-found.js',
  '/src/scripts/pages/stories.js',
  // Presenters
  '/src/scripts/presenters/add-presenter.js',
  '/src/scripts/presenters/home-presenter.js',
  '/src/scripts/presenters/story-presenter.js',
  // Routes
  '/src/scripts/routes/routes.js',
  '/src/scripts/routes/url-parser.js',
  // Utils
  '/src/scripts/utils/accessibility-helper.js',
  '/src/scripts/utils/auth.js',
  '/src/scripts/utils/index.js',
  '/src/scripts/utils/indexed-db-helper.js',
  '/src/scripts/utils/push-notification.js',
  '/src/scripts/utils/sw-registration.js',
  // Icons - sesuai dengan yang ada
  '/src/public/images/favicon.png',
  '/src/public/images/logo.png',
  // External dependencies
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css'
];

// Install event - Cache App Shell
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker v1');
  
  event.waitUntil(
    Promise.all([
      // Cache App Shell dengan error handling yang lebih baik
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('[SW] Caching App Shell');
        // Cache critical files first
        const criticalFiles = [
          '/',
          '/index.html',
          '/offline.html',
          '/manifest.json',
          '/src/styles/index.css',
          '/src/scripts/index.js'
        ];
        
        return cache.addAll(criticalFiles)
          .then(() => {
            // Then cache remaining files with error handling
            return Promise.allSettled(
              APP_SHELL.filter(url => !criticalFiles.includes(url))
                .map(url => {
                  try {
                    return cache.add(new Request(url, { mode: 'no-cors' }));
                  } catch (error) {
                    console.warn(`[SW] Failed to cache ${url}:`, error);
                    return Promise.resolve();
                  }
                })
            );
          });
      }),
      // Initialize dynamic cache
      caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
        console.log('[SW] Preparing dynamic cache');
        return cache.put('/api/offline', new Response(JSON.stringify({
          error: false,
          message: 'Offline mode active',
          listStory: []
        }), { headers: { 'Content-Type': 'application/json' } }));
      })
    ]).then(() => {
      console.log('[SW] Installation complete');
      return self.skipWaiting();
    }).catch(error => {
      console.error('[SW] Installation failed:', error);
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

// Fetch event - Handle different types of requests
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);
  
  // Skip non-GET requests and chrome-extension requests
  if (event.request.method !== 'GET' || 
      requestUrl.protocol === 'chrome-extension:' ||
      requestUrl.protocol === 'moz-extension:') {
    return;
  }
  
  // Handle API requests (network first strategy)
  if (requestUrl.pathname.includes('/v1/') || 
      requestUrl.hostname.includes('story-api.dicoding.dev') ||
      requestUrl.pathname.includes('/api/')) {
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
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // If successful, cache the response for GET requests
    if (networkResponse.ok && request.method === 'GET') {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed for API request, trying cache');
    
    // Try to get from cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return appropriate offline response based on endpoint
    if (request.url.includes('/stories')) {
      return new Response(JSON.stringify({
        error: false,
        message: 'Showing cached stories (offline mode)',
        listStory: await getOfflineStories()
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (request.url.includes('/login') || request.url.includes('/register')) {
      return new Response(JSON.stringify({
        error: true,
        message: 'Authentication requires internet connection. Please check your network and try again.'
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Return generic offline response
    return new Response(JSON.stringify({
      error: true,
      message: 'This feature requires internet connection. Please check your network and try again.'
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
    const cache = await caches.open(STATIC_CACHE_NAME);
    
    // Try to get the main page
    let cachedResponse = await cache.match('/index.html');
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback to root
    cachedResponse = await cache.match('/');
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Last resort: offline page
    cachedResponse = await cache.match('/offline.html');
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Ultimate fallback
    return new Response(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>StoryShare - Offline</title>
        <style>
          body { 
            font-family: 'Segoe UI', sans-serif;
            text-align: center; 
            padding: 50px 20px;
            background: #FFFDF6;
            color: #333;
            margin: 0;
          }
          .container {
            max-width: 400px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .icon { font-size: 64px; margin-bottom: 20px; }
          .title { color: #A0C878; margin-bottom: 10px; }
          .message { color: #666; margin-bottom: 30px; line-height: 1.5; }
          .button {
            background: #A0C878;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">📱</div>
          <h1 class="title">StoryShare</h1>
          <div class="message">
            <p>You're currently offline.</p>
            <p>Please check your internet connection.</p>
          </div>
          <button class="button" onclick="window.location.reload()">
            Try Again
          </button>
        </div>
      </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// Handle static assets with cache first strategy
async function handleStaticAssets(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  
  try {
    // Try cache first
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If not in cache, fetch from network
    const networkResponse = await fetch(request);
    
    // Cache the response for future use if successful
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Failed to fetch static asset:', request.url);
    
    // Return appropriate fallbacks
    if (request.destination === 'image') {
      // Return a simple transparent GIF for failed images
      const transparentGif = 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      const buffer = Uint8Array.from(atob(transparentGif), c => c.charCodeAt(0));
      return new Response(buffer, { 
        headers: { 'Content-Type': 'image/gif' } 
      });
    }
    
    if (request.destination === 'script') {
      return new Response('console.log("Script not available offline");', {
        headers: { 'Content-Type': 'application/javascript' }
      });
    }
    
    if (request.destination === 'style') {
      return new Response('/* Styles not available offline */', {
        headers: { 'Content-Type': 'text/css' }
      });
    }
    
    return new Response('Resource not available offline', { 
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Get offline stories from IndexedDB or cache
async function getOfflineStories() {
  try {
    // Try to get stories from IndexedDB if available
    if ('indexedDB' in window) {
      // This would integrate with your existing indexed-db-helper.js
      // For now, return empty array
      return [];
    }
    
    // Fallback: try to get from cache
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedStories = await cache.match('/v1/stories');
    
    if (cachedStories) {
      const data = await cachedStories.json();
      return data.listStory || [];
    }
    
    return [];
  } catch (error) {
    console.error('[SW] Error getting offline stories:', error);
    return [];
  }
}

// Push notification event handlers
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  let notificationData = {
    title: 'StoryShare',
    options: {
      body: 'You have a new notification!',
      icon: '/images/icon-192x192.png',
      badge: '/images/icon-96x96.png',
      tag: 'storyshare-notification',
      data: { url: '/' },
      actions: [
        {
          action: 'view',
          title: 'View Story',
          icon: '/images/icon-96x96.png'
        },
        {
          action: 'close',
          title: 'Close'
        }
      ],
      requireInteraction: false,
      silent: false,
      renotify: true,
      vibrate: [200, 100, 200]
    }
  };
  
  // Parse push data if available
  if (event.data) {
    try {
      const pushText = event.data.text();
      console.log('[SW] Push data received:', pushText);
      
      // Try to parse as JSON
      if (pushText.trim().startsWith('{')) {
        const parsedData = JSON.parse(pushText);
        notificationData.title = parsedData.title || notificationData.title;
        notificationData.options.body = parsedData.body || parsedData.message || notificationData.options.body;
        notificationData.options.data = { 
          ...notificationData.options.data, 
          ...(parsedData.data || {}) 
        };
        
        // Handle different notification types
        if (parsedData.type === 'new_story') {
          notificationData.title = 'New Story Shared! 📖';
          notificationData.options.body = `${parsedData.author || 'Someone'} shared: ${parsedData.title || 'Check it out!'}`;
          notificationData.options.data.url = parsedData.storyId ? `/#/stories/${parsedData.storyId}` : '/#/stories';
        } else if (parsedData.type === 'story_liked') {
          notificationData.title = 'Your Story Got a Like! ❤️';
          notificationData.options.body = parsedData.message || 'Someone liked your story!';
        }
      } else {
        // Treat as simple text message
        notificationData.options.body = pushText;
      }
    } catch (error) {
      console.warn('[SW] Failed to parse push data:', error);
    }
  }
  
  const showNotificationPromise = self.registration.showNotification(
    notificationData.title,
    notificationData.options
  );
  
  event.waitUntil(
    showNotificationPromise
      .then(() => console.log('[SW] Notification shown successfully'))
      .catch(error => console.error('[SW] Error showing notification:', error))
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }
  
  // Handle click action
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            if (urlToOpen !== '/') {
              client.navigate(urlToOpen);
            }
            return client.focus();
          }
        }
        
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
      .catch(error => console.error('[SW] Error handling notification click:', error))
  );
});

// Background sync for offline functionality
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'story-sync') {
    event.waitUntil(syncOfflineStories());
  } else if (event.tag === 'background-sync') {
    event.waitUntil(syncOfflineData());
  }
});

// Sync offline stories when connection is restored
async function syncOfflineStories() {
  try {
    console.log('[SW] Syncing offline stories...');
    
    // This would integrate with your IndexedDB helper
    // For now, just notify clients
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        message: 'Stories synced successfully'
      });
    });
    
    return Promise.resolve();
  } catch (error) {
    console.error('[SW] Error syncing offline stories:', error);
    return Promise.reject(error);
  }
}

// General offline data sync
async function syncOfflineData() {
  try {
    console.log('[SW] Syncing offline data...');
    
    // Notify all clients about sync completion
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        message: 'All offline data synced'
      });
    });
    
    return Promise.resolve();
  } catch (error) {
    console.error('[SW] Error syncing offline data:', error);
    return Promise.reject(error);
  }
}

// Handle messages from main thread
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SIMULATE_PUSH') {
    // Simulate a push notification for testing
    const { title, body } = event.data.data || {};
    
    const notificationPromise = self.registration.showNotification(
      title || 'Test Notification', 
      {
        body: body || 'This is a test push notification from StoryShare',
        icon: '/images/icon-192x192.png',
        badge: '/images/icon-96x96.png',
        tag: 'test-push',
        data: { url: '/' }
      }
    );
    
    event.waitUntil(
      notificationPromise
        .then(() => console.log('[SW] Test notification shown'))
        .catch(error => console.error('[SW] Error showing test notification:', error))
    );
  }
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});