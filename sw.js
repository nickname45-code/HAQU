const CACHE_NAME = 'haqu-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './logo.png',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('fetch', (event) => {
  // Hanya menyimpan cache untuk request tampilan UI (GET) 
  // API Data ke Google Apps Script (POST) tetap akan berjalan secara real-time
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Jika ada di cache (memori lokal), langsung gunakan!
      if (response) return response;
      
      // Jika tidak ada di cache, ambil dari internet (Network Fallback)
      return fetch(event.request).then((networkResponse) => {
        // Jangan men-cache request error atau request ke Google Apps Script
        if (!networkResponse || networkResponse.status !== 200 || event.request.url.includes('script.google')) {
          return networkResponse;
        }
        
        // Simpan library CDN, Font, dan Gambar ke memori secara dinamis untuk dipakai nanti saat offline
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      }).catch(() => {
        // Fallback tambahan jika sama sekali tidak ada koneksi internet
        console.log('Mode Offline Aktif - Beberapa data tidak dapat ditarik.');
      });
    })
  );
});