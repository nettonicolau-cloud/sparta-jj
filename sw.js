// Sparta JJ — Service Worker v1
var CACHE = 'sparta-jj-v1';
var ASSETS = [
  './',
  './index.html',
  'https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Cinzel:wght@400;600;700&family=Raleway:wght@300;400;500;600&display=swap'
];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e){
  // Always fetch the Google Sheet live — never cache it
  if(e.request.url.includes('docs.google.com')){
    e.respondWith(fetch(e.request).catch(function(){ return new Response('', {status: 503}); }));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(function(cached){
      return cached || fetch(e.request).then(function(response){
        // Cache new static assets on the fly
        if(response && response.status === 200 && response.type !== 'opaque'){
          var clone = response.clone();
          caches.open(CACHE).then(function(c){ c.put(e.request, clone); });
        }
        return response;
      });
    }).catch(function(){
      return caches.match('./index.html');
    })
  );
});
