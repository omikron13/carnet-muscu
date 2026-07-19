/* Carnet Muscu — service worker
   Au premier chargement en ligne, toute l'app est mise en cache.
   Ensuite : fonctionnement 100 % hors-ligne, indépendant de l'hébergement.
   Pour publier une mise à jour de l'app : incrémenter SHELL ci-dessous. */

const SHELL = "cm-shell-v2";
const FONTS = "cm-fonts";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(SHELL).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== SHELL && k !== FONTS).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  /* Polices Google : cache à la première visite, puis servies hors-ligne */
  if (url.hostname.indexOf("fonts.g") !== -1) {
    e.respondWith(
      caches.open(FONTS).then(async (c) => {
        const hit = await c.match(e.request);
        const net = fetch(e.request)
          .then((r) => { c.put(e.request, r.clone()); return r; })
          .catch(() => hit);
        return hit || net;
      })
    );
    return;
  }

  /* Navigation : toujours servir l'app depuis le cache (offline-first) */
  if (e.request.mode === "navigate") {
    e.respondWith(
      caches.match("./index.html").then((r) => r || fetch(e.request))
    );
    return;
  }

  /* Le reste : cache d'abord, réseau en secours */
  e.respondWith(
    caches.match(e.request).then((r) => r || fetch(e.request))
  );
});
