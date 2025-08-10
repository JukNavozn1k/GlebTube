const CACHE_NAME = "glebtube-pwa-v1";
const urlsToCache = [
  "/", // главная страница
//   "/static/css/style.css", 
//   "/static/js/app.js"     
];

// Установка (кэшируем нужные файлы)
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Обработка запросов
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

// Обновление Service Worker
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      );
    })
  );
});
