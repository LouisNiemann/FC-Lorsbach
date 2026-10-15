/*
 * Belegungsplan: zeigt das PDF aus config.js mit PDF.js an.
 * - Zoom per Pinch-Geste, +/−-Buttons oder Strg+Mausrad, „Breite“ passt an.
 * - Nach dem Zoomen wird scharf neu gerendert.
 * - Offline liefert der Service Worker die zuletzt gespeicherte Version.
 */
import * as pdfjsLib from "../vendor/pdfjs/pdf.min.js";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "../vendor/pdfjs/pdf.worker.min.js",
  import.meta.url
).href;

const C = window.FCL_CONFIG || {};
const PDF_URL = C.BELEGUNGSPLAN_PDF || "belegungsplan.pdf";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 5;
const MAX_CANVAS_PIXEL = 16e6; // iOS-Safari-Grenze pro Canvas

const container = document.getElementById("pdf-container");
const seitenEl = document.getElementById("pdf-seiten");
const statusEl = document.getElementById("pdf-status");
const zoomWert = document.getElementById("zoom-wert");
const download = document.getElementById("download");
const offlineHinweis = document.getElementById("offline-hinweis");

download.href = PDF_URL;
download.setAttribute("download", PDF_URL.split("/").pop());

let pages = [];
let canvases = [];
let fitScale = 1;
let zoom = 1; // 1 = Seitenbreite
let renderGen = 0;
let renderTasks = [];

function zeigeFehler(text) {
  statusEl.hidden = false;
  statusEl.innerHTML = "";
  const p = document.createElement("p");
  p.textContent = text;
  statusEl.appendChild(p);
  const a = document.createElement("a");
  a.className = "button";
  a.href = PDF_URL;
  a.target = "_blank";
  a.rel = "noopener";
  a.textContent = "PDF direkt öffnen";
  statusEl.appendChild(a);
}

function berechneFit() {
  const breite = container.clientWidth - 24; // Innenabstand .pdf-seiten
  const maxSeite = Math.max(...pages.map((p) => p.getViewport({ scale: 1 }).width));
  fitScale = Math.max(0.1, breite / maxSeite);
}

// Setzt sofort die Anzeigegröße (für Layout/Scrollen) und rendert danach scharf.
function render() {
  const gen = ++renderGen;
  renderTasks.forEach((t) => t.cancel());
  renderTasks = [];
  zoomWert.textContent = Math.round(zoom * 100) + " %";

  const scale = fitScale * zoom;
  const dpr = window.devicePixelRatio || 1;

  pages.forEach((page, i) => {
    const vp = page.getViewport({ scale });
    const canvas = canvases[i];
    canvas.style.width = Math.floor(vp.width) + "px";
    canvas.style.height = Math.floor(vp.height) + "px";

    const ausgabe = Math.min(dpr, Math.sqrt(MAX_CANVAS_PIXEL / (vp.width * vp.height)));
    const renderVp = page.getViewport({ scale: scale * ausgabe });

    // In eigenes Canvas rendern und erst danach tauschen – so flackert nichts.
    const ziel = document.createElement("canvas");
    ziel.width = Math.floor(renderVp.width);
    ziel.height = Math.floor(renderVp.height);
    const task = page.render({ canvasContext: ziel.getContext("2d"), viewport: renderVp });
    renderTasks.push(task);
    task.promise.then(
      () => {
        if (gen !== renderGen) return;
        canvas.width = ziel.width;
        canvas.height = ziel.height;
        canvas.getContext("2d").drawImage(ziel, 0, 0);
      },
      () => { /* abgebrochen */ }
    );
  });
}

function clampZoom(z) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));
}

// Zoomt so, dass der Punkt (clientX/clientY) an derselben Stelle bleibt.
function setZoom(neu, clientX, clientY) {
  neu = clampZoom(neu);
  const rect = container.getBoundingClientRect();
  const mx = clientX === undefined ? rect.width / 2 : clientX - rect.left;
  const my = clientY === undefined ? rect.height / 2 : clientY - rect.top;
  const px = (container.scrollLeft + mx) / zoom;
  const py = (container.scrollTop + my) / zoom;
  zoom = neu;
  render();
  container.scrollLeft = px * zoom - mx;
  container.scrollTop = py * zoom - my;
}

/* ---------- Buttons ---------- */
document.getElementById("zoom-in").addEventListener("click", () => setZoom(zoom * 1.25));
document.getElementById("zoom-out").addEventListener("click", () => setZoom(zoom / 1.25));
document.getElementById("zoom-fit").addEventListener("click", () => {
  zoom = 1;
  render();
  container.scrollLeft = 0;
});

/* ---------- Pinch-Zoom (zwei Finger) ---------- */
let pinch = null;

function abstand(t) {
  return Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
}
function mitte(t) {
  return { x: (t[0].clientX + t[1].clientX) / 2, y: (t[0].clientY + t[1].clientY) / 2 };
}

container.addEventListener("touchstart", (e) => {
  if (e.touches.length !== 2) return;
  const m = mitte(e.touches);
  const rect = seitenEl.getBoundingClientRect();
  pinch = {
    d0: abstand(e.touches),
    // Pinch-Mittelpunkt relativ zum (ungezoomten) Seiten-Element
    ox: m.x - rect.left,
    oy: m.y - rect.top,
    mx: m.x,
    my: m.y,
    faktor: 1,
  };
}, { passive: true });

container.addEventListener("touchmove", (e) => {
  if (!pinch || e.touches.length !== 2) return;
  e.preventDefault();
  const f = clampZoom((zoom * abstand(e.touches)) / pinch.d0) / zoom;
  pinch.faktor = f;
  // Vorschau per CSS, Mittelpunkt bleibt unter den Fingern
  seitenEl.style.transform =
    `translate(${pinch.ox * (1 - f)}px, ${pinch.oy * (1 - f)}px) scale(${f})`;
}, { passive: false });

function pinchEnde() {
  if (!pinch) return;
  const p = pinch;
  pinch = null;
  seitenEl.style.transform = "";
  if (Math.abs(p.faktor - 1) > 0.01) setZoom(zoom * p.faktor, p.mx, p.my);
}
container.addEventListener("touchend", (e) => { if (e.touches.length < 2) pinchEnde(); });
container.addEventListener("touchcancel", pinchEnde);

/* ---------- Strg + Mausrad / Trackpad-Pinch am Computer ---------- */
container.addEventListener("wheel", (e) => {
  if (!e.ctrlKey) return;
  e.preventDefault();
  setZoom(zoom * Math.exp(-e.deltaY * 0.01), e.clientX, e.clientY);
}, { passive: false });

/* ---------- Drehen / Fenstergröße ---------- */
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (!pages.length) return;
    berechneFit();
    render();
  }, 200);
});

/* ---------- Laden ---------- */
async function laden() {
  let antwort;
  try {
    antwort = await fetch(PDF_URL, { cache: "no-cache" });
  } catch (e) {
    zeigeFehler("Der Belegungsplan konnte nicht geladen werden. Bitte Internetverbindung prüfen.");
    return;
  }
  if (!antwort.ok) {
    zeigeFehler(`Die Datei „${PDF_URL}“ wurde nicht gefunden.`);
    return;
  }
  if (antwort.headers.get("X-FCL-Offline") === "1") offlineHinweis.hidden = false;

  try {
    const daten = new Uint8Array(await antwort.arrayBuffer());
    const pdf = await pdfjsLib.getDocument({
      data: daten,
      standardFontDataUrl: new URL("../vendor/pdfjs/standard_fonts/", import.meta.url).href,
    }).promise;

    for (let i = 1; i <= pdf.numPages; i++) pages.push(await pdf.getPage(i));
    canvases = pages.map(() => {
      const c = document.createElement("canvas");
      seitenEl.appendChild(c);
      return c;
    });
    statusEl.hidden = true;
    berechneFit();
    render();
  } catch (e) {
    console.error(e);
    zeigeFehler("Das PDF konnte nicht angezeigt werden.");
  }
}

laden();
