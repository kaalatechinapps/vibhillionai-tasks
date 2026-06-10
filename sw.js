const CACHE = 'vb-tasks-v1';
const ASSETS = ['/', '/index.html'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(()=>{}));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});

// Receive notification message from main thread
self.addEventListener('message', e => {
  if(e.data && e.data.type === 'NOTIFY'){
    self.registration.showNotification(e.data.title, {
      body: e.data.body,
      icon: 'icon-192.png',
      badge: 'icon-192.png',
      vibrate: [200, 100, 200],
      tag: 'vb-task-notif',
      renotify: true,
      actions: [
        { action: 'open', title: '📋 Open Tasks' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    });
  }
});

// Notification click
self.addEventListener('notificationclick', e => {
  e.notification.close();
  if(e.action === 'open' || !e.action){
    e.waitUntil(
      clients.matchAll({type:'window'}).then(list => {
        if(list.length) return list[0].focus();
        return clients.openWindow('/');
      })
    );
  }
});

// Background push (if using FCM in future)
self.addEventListener('push', e => {
  if(!e.data) return;
  const data = e.data.json();
  e.waitUntil(
    self.registration.showNotification(data.title || 'VibhillionAI Tasks', {
      body: data.body || '',
      icon: 'icon-192.png',
      vibrate: [200, 100, 200]
    })
  );
});
