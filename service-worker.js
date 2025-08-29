const CACHE_NAME = "todo-cache-v1";
const urlsToCache = [
        "/",               // root
          "/index.html",     // main html
            "/index.css",      // your css
              "/index.js",       // your js
                "/manifest.json",  // manifest
];

// Install Service Worker and cache files
self.addEventListener("install", (event) => {
        event.waitUntil(
                caches.open(CACHE_NAME).then((cache) => {
                        return cache.addAll(urlsToCache);
                })
            );
      });

      // Serve files from cache first
      self.addEventListener("fetch", (event) => {
              event.respondWith(
                      caches.match(event.request).then((response) => {
                              return response || fetch(event.request);
                      })
                  );
            });

            // Update cache when new version is deployed
            self.addEventListener("activate", (event) => {
                    event.waitUntil(
                            caches.keys().then((cacheNames) =>
                              Promise.all(
                                            cacheNames.map((name) => {
                                                          if (name !== CACHE_NAME) {
                                                                        return caches.delete(name);
                                                          }
                                                      })
                                                )
                                          )
                                    );
                              });
                                                          
