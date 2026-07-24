/* Carnet Muscu — service worker v4
   Stratégie :
   - installation : re-télécharge tout en ignorant le cache HTTP
     (indispensable sur GitHub Pages, qui met les fichiers en cache 10 min)
   - navigation : réseau d'abord → toujours la dernière version quand on est en ligne,
     cache en secours → fonctionnement hors-ligne garanti
   - polices : mises en cache à la volée
   Pour publier une mise à jour : incrémenter SHELL ci-dessous. */

const SHELL = "cm-shell-v4";
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
    caches.open(SHELL).then((c) =>
      Promise.all(ASSETS.map((u) =>
        fetch(new Request(u, { cache: "reload" }))
          .then((r) => { if (!r.ok) throw new Error("fetch " + u); return c.put(u, r); })
      ))
    ).then(() => self.skipWaiting())
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

  /* Polices Google : cache à la première visite, puis hors-ligne */
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

  /* Navigation : réseau d'abord, cache en secours */
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request, { cache: "no-store" })
        .then((r) => {
          const copy = r.clone();
          caches.open(SHELL).then((c) => c.put("./index.html", copy));
          return r;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  /* Le reste : cache d'abord, réseau en secours */
  e.respondWith(
    caches.match(e.request).then((r) => r || fetch(e.request))
  );
});
