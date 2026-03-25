const CACHE_NAME = 'minesweeper-v1';
const urlsToCache = [
  '/catchpenny-colonnade.github.io/minesweeper/',
  '/catchpenny-colonnade.github.io/minesweeper/index.html',
  '/catchpenny-colonnade.github.io/minesweeper/styles.css',
  '/catchpenny-colonnade.github.io/minesweeper/minesweeper.js',
  '/catchpenny-colonnade.github.io/minesweeper/settings.js',
  '/catchpenny-colonnade.github.io/minesweeper/digitalDisplay.js',
  '/catchpenny-colonnade.github.io/minesweeper/stopwatchDisplay.js',
  '/catchpenny-colonnade.github.io/minesweeper/timeDisplay.js',
  '/catchpenny-colonnade.github.io/minesweeper/manifest.json',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css',
  'https://unpkg.com/react@18/umd/react.development.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.development.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://gizmo-atheneum.github.io/structure/importnamespace/script.js'
];

// Install event: cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache).catch((error) => {
          console.warn('Cache addAll error:', error);
          // Some resources may not be available, continue anyway
          return Promise.resolve();
        });
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event: serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests and certain protocols
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached response if available
        if (response) {
          return response;
        }

        return fetch(event.request)
          .then((response) => {
            // Don't cache if not a success response
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache successful responses for GET requests only
            if (event.request.method === 'GET') {
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }

            return response;
          })
          .catch(() => {
            // Return cached fallback or error response
            return caches.match(event.request)
              .then((cachedResponse) => {
                if (cachedResponse) {
                  return cachedResponse;
                }
                // You could return a custom offline page here
                return new Response('Offline - resource not available', {
                  status: 503,
                  statusText: 'Service Unavailable',
                  headers: new Headers({
                    'Content-Type': 'text/plain'
                  })
                });
              });
          });
      })
  );
});
