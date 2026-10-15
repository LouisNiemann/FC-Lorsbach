/*
 * Service Worker der FC-Lorsbach-Trainer-App.
 *
 * - Eigene Dateien: erst Netzwerk (damit Änderungen an config.js oder ein neuer
 *   Belegungsplan sofort ankommen), offline aus dem Cache.
 * - PDF.js (vendor/): aus dem Cache, ändert sich nie.
 * - Fremde Seiten (fussball.de, Shop …) werden nicht angefasst.
 *
 * Nach größeren Änderungen an der App die Versionsnummer erhöhen.
 */
const VERSION = "fcl-v1";

const PRECACHE = [
  "./",
  "index.html",
  "belegungsplan.html",
  "spiele-tabelle.html",
  "config.js",
  "css/style.css",
  "js/app.js",
  "js/belegungsplan.js",
  "js/spiele-tabelle.js",
  "manifest.json",
  "logo.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/apple-touch-icon.png",
  "belegungsplan.pdf",
  "vendor/pdfjs/pdf.min.js",
  "vendor/pdfjs/pdf.worker.min.js",
];

const NETZ_TIMEOUT_MS = 4000;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(VERSION)
      .then((cache) => cache.addAll(PRECACHE.map((u) => new Request(u, { cache: "reload" }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Kennzeichnet Antworten aus dem Cache, damit die Seite „offline“ anzeigen kann.
function alsOffline(antwort) {
  const headers = new Headers(antwort.headers);
  headers.set("X-FCL-Offline", "1");
  return new Response(antwort.body, { status: antwort.status, statusText: antwort.statusText, headers });
}

async function netzZuerst(request) {
  const cache = await caches.open(VERSION);
  try {
    const antwort = await Promise.race([
      fetch(request),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), NETZ_TIMEOUT_MS)),
    ]);
    if (antwort.ok) cache.put(request, antwort.clone());
    return antwort;
  } catch (e) {
    const treffer = await cache.match(request, { ignoreSearch: true });
    if (treffer) return alsOffline(treffer);
    if (request.mode === "navigate") {
      const start = await cache.match("index.html");
      if (start) return start;
    }
    throw e;
  }
}

async function cacheZuerst(request) {
  const cache = await caches.open(VERSION);
  const treffer = await cache.match(request, { ignoreSearch: true });
  if (treffer) return treffer;
  const antwort = await fetch(request);
  if (antwort.ok) cache.put(request, antwort.clone());
  return antwort;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.includes("/vendor/")) {
    event.respondWith(cacheZuerst(request));
  } else {
    event.respondWith(netzZuerst(request));
  }
});
