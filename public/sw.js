// Taxccount PWA Service Worker
// Provides offline document capture, caching, and background sync

const CACHE_NAME = 'taxccount-v1';
const OFFLINE_URL = '/offline.html';

// Static assets to pre-cache for offline shell
const PRECACHE_URLS = [
  '/',
  '/portal',
  '/offline.html',
  '/manifest.json',
];

// Install: pre-cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching app shell');
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: network-first with offline fallback
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET and API requests (handle API offline separately via background sync)
  if (event.request.method !== 'GET') return;
  if (url.pathname.startsWith('/api/')) return;

  // For navigation requests, try network first, fall back to offline page
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful navigation responses
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request).then((r) => r || caches.match(OFFLINE_URL)))
    );
    return;
  }

  // For static assets: stale-while-revalidate
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});

// Background Sync: queued document uploads
self.addEventListener('sync', (event) => {
  if (event.tag === 'document-upload-sync') {
    event.waitUntil(syncPendingUploads());
  }
});

// Process queued uploads from IndexedDB
async function syncPendingUploads() {
  try {
    const db = await openUploadDB();
    const tx = db.transaction('pending-uploads', 'readonly');
    const store = tx.objectStore('pending-uploads');
    const allUploads = await getAllFromStore(store);

    for (const upload of allUploads) {
      try {
        const formData = new FormData();
        formData.append('file', upload.file);
        formData.append('client_id', upload.client_id);
        if (upload.engagement_id) formData.append('engagement_id', upload.engagement_id);
        if (upload.document_category) formData.append('document_category', upload.document_category);
        if (upload.financial_year) formData.append('financial_year', upload.financial_year);

        const response = await fetch('/api/documents', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          // Remove from pending queue
          const deleteTx = db.transaction('pending-uploads', 'readwrite');
          deleteTx.objectStore('pending-uploads').delete(upload.id);
          console.log(`[SW] Synced upload: ${upload.file.name}`);

          // Notify the client
          self.clients.matchAll().then((clients) => {
            clients.forEach((client) => {
              client.postMessage({
                type: 'UPLOAD_SYNCED',
                fileName: upload.file.name,
                status: 'success',
              });
            });
          });
        }
      } catch (err) {
        console.error(`[SW] Failed to sync upload:`, err);
      }
    }
  } catch (err) {
    console.error('[SW] Sync error:', err);
  }
}

// IndexedDB helpers for upload queue
function openUploadDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('taxccount-uploads', 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore('pending-uploads', { keyPath: 'id', autoIncrement: true });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getAllFromStore(store) {
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Push Notifications (future: connect to reminder system)
self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || 'Taxccount', {
      body: data.body || 'You have a new notification',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: data.tag || 'default',
      data: { url: data.url || '/portal' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/portal';
  event.waitUntil(self.clients.openWindow(url));
});
