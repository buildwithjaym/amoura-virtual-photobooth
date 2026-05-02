const CACHE_NAME = "amoreframe-v1"

const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/favicon.ico",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-icon.png",
  "/images/amoreframe-og.png"
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )

  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      )
    })
  )

  self.clients.claim()
})

self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url)

  if (event.request.method !== "GET") {
    return
  }

  if (requestUrl.pathname.startsWith("/auth")) {
    return
  }

  if (requestUrl.pathname.startsWith("/dashboard")) {
    return
  }

  if (requestUrl.pathname.startsWith("/login")) {
    return
  }

  if (requestUrl.pathname.startsWith("/create-account")) {
    return
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }

      return fetch(event.request).then((networkResponse) => {
        return networkResponse
      })
    })
  )
})