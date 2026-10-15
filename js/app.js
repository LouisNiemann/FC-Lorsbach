/*
 * Gemeinsamer Code für alle Seiten: Hell/Dunkel-Umschalter, Service Worker
 * und – auf der Startseite – die Kacheln aus config.js.
 */
(function () {
  "use strict";

  var C = window.FCL_CONFIG || {};

  /* ---------- Icons (inline SVG, folgen der Textfarbe) ---------- */
  function svg(path) {
    return (
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + path + "</svg>"
    );
  }
  var ICON = {
    kalender: svg('<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M8 14h2M14 14h2M8 18h2M14 18h2"/>'),
    haken: svg('<path d="M9 11l3 3 8-8"/><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9"/>'),
    shop: svg('<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0"/>'),
    ball: svg('<circle cx="12" cy="12" r="10"/><path d="M12 7l4.5 3.3-1.7 5.2H9.2l-1.7-5.2z"/><path d="M12 2v5M21.5 9.5l-5 .8M18 20l-3.2-4.5M6 20l3.2-4.5M2.5 9.5l5 .8"/>'),
    tabelle: svg('<path d="M3 3h18v18H3z"/><path d="M3 9h18M3 15h18M9 3v18"/>'),
    extern: svg('<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6M10 14L21 3"/>'),
    sonne: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
    mond: svg('<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>'),
    auto: svg('<circle cx="12" cy="12" r="9"/><path d="M12 3v18" /><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/>'),
  };
  window.FCL_ICON = ICON;

  /* ---------- Hell-/Dunkelmodus ---------- */
  var THEMES = ["auto", "light", "dark"];
  var THEME_LABEL = { auto: "Automatisch (System)", light: "Hell", dark: "Dunkel" };
  var THEME_ICON = { auto: ICON.auto, light: ICON.sonne, dark: ICON.mond };

  function getTheme() {
    try { return localStorage.getItem("fcl-theme") || "auto"; } catch (e) { return "auto"; }
  }
  function applyTheme(t) {
    if (t === "auto") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", t);
    var btn = document.getElementById("theme-btn");
    if (btn) {
      btn.innerHTML = THEME_ICON[t];
      btn.setAttribute("aria-label", "Farbmodus: " + THEME_LABEL[t]);
      btn.title = "Farbmodus: " + THEME_LABEL[t];
    }
  }
  var themeBtn = document.getElementById("theme-btn");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = THEMES[(THEMES.indexOf(getTheme()) + 1) % THEMES.length];
      try { localStorage.setItem("fcl-theme", next); } catch (e) { /* nur für diese Sitzung */ }
      applyTheme(next);
    });
  }
  applyTheme(getTheme());

  /* ---------- Vereinsname in Kopf und Titel ---------- */
  Array.prototype.forEach.call(document.querySelectorAll("[data-verein]"), function (n) {
    n.textContent = C.VEREIN || "FC Lorsbach";
  });
  Array.prototype.forEach.call(document.querySelectorAll("[data-app-titel]"), function (n) {
    n.textContent = C.APP_TITEL || "Trainer-App";
  });

  /* ---------- Service Worker (Offline & Installierbarkeit) ---------- */
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () { /* App läuft auch ohne */ });
    });
  }

  /* ---------- Kacheln (nur Startseite) ---------- */
  var grid = document.getElementById("kacheln");
  if (!grid) return;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // Link zur Trainings-App: auf Android mit Paketname direkt die installierte
  // App öffnen (Fallback: Website). Sonst die Website – iOS/Android öffnen
  // diese automatisch in der App, wenn der Anbieter das unterstützt.
  function appLink(dienst) {
    if (!dienst || !dienst.WEB_URL) return "";
    var isAndroid = /Android/i.test(navigator.userAgent);
    if (isAndroid && dienst.ANDROID_PACKAGE) {
      var u = dienst.WEB_URL.replace(/^https?:\/\//, "");
      return (
        "intent://" + u + "#Intent;scheme=https;package=" + dienst.ANDROID_PACKAGE +
        ";S.browser_fallback_url=" + encodeURIComponent(dienst.WEB_URL) + ";end"
      );
    }
    return dienst.WEB_URL;
  }

  var EXT = ' target="_blank" rel="noopener"';

  function kachelLink(o) {
    return (
      '<a class="kachel' + (o.breit ? " kachel--breit" : "") + '" href="' + esc(o.href) + '"' +
      (o.extern ? EXT : "") + ">" +
      '<span class="kachel__icon">' + o.icon + "</span>" +
      (o.extern ? '<span class="kachel__extern">' + ICON.extern + "</span>" : "") +
      "<div><h2 class=\"kachel__titel\">" + esc(o.titel) + "</h2>" +
      (o.text ? '<p class="kachel__text">' + esc(o.text) + "</p>" : "") +
      "</div></a>"
    );
  }

  function kachelButtons(o) {
    return (
      '<div class="kachel kachel--breit">' +
      '<div style="display:flex;gap:12px;align-items:center">' +
      '<span class="kachel__icon">' + o.icon + "</span>" +
      "<div><h2 class=\"kachel__titel\">" + esc(o.titel) + "</h2>" +
      (o.text ? '<p class="kachel__text">' + esc(o.text) + "</p>" : "") +
      "</div></div>" +
      '<div class="kachel__buttons">' +
      o.buttons.map(function (b, i) {
        return (
          '<a class="kachel__btn' + (i > 0 && o.zweitStil ? " kachel__btn--zweit" : "") +
          '" href="' + esc(b.href) + '"' + EXT + ">" + esc(b.label) + ICON.extern + "</a>"
        );
      }).join("") +
      "</div></div>"
    );
  }

  var html = [];

  // 1. Belegungsplan
  if (C.BELEGUNGSPLAN_PDF) {
    html.push(kachelLink({
      href: "belegungsplan.html", icon: ICON.kalender,
      titel: "Belegungsplan", text: "Plätze & Zeiten – auch offline",
    }));
  }

  // 2. Anwesenheit / Training
  var modus = String(C.TRAINING_APP || "").toLowerCase();
  var trainingButtons = [];
  if ((modus === "spielerplus" || modus === "beide") && C.SPIELERPLUS && C.SPIELERPLUS.WEB_URL) {
    trainingButtons.push({ label: "SpielerPlus", href: appLink(C.SPIELERPLUS) });
  }
  if ((modus === "teampunkt" || modus === "beide") && C.TEAMPUNKT && C.TEAMPUNKT.WEB_URL) {
    trainingButtons.push({ label: "Teampunkt", href: appLink(C.TEAMPUNKT) });
  }
  if (trainingButtons.length === 1) {
    html.push(kachelLink({
      href: trainingButtons[0].href, extern: true, icon: ICON.haken,
      titel: "Anwesenheit", text: "Training in " + trainingButtons[0].label,
    }));
  } else if (trainingButtons.length > 1) {
    html.push(kachelButtons({
      icon: ICON.haken, titel: "Anwesenheit / Training",
      text: "Trainings-App öffnen", buttons: trainingButtons,
    }));
  }

  // 3. Vereinsshop
  if (C.SHOP_URL) {
    html.push(kachelLink({
      href: C.SHOP_URL, extern: true, icon: ICON.shop,
      titel: "Vereinsshop", text: "Trikots & Fanartikel",
    }));
  }

  // 5. Spiele & Tabelle
  var hatWidgets =
    Object.keys(C.FUSSBALLDE_WIDGET_SPIELPLAN || {}).length +
    Object.keys(C.FUSSBALLDE_WIDGET_TABELLE || {}).length > 0;
  if (hatWidgets) {
    html.push(kachelLink({
      href: "spiele-tabelle.html", icon: ICON.tabelle,
      titel: "Spiele & Tabelle", text: "Spielplan und Tabelle",
    }));
  }

  // 4. DFBnet (+ optional fussball.de)
  if (C.DFBNET_URL) {
    if (C.FUSSBALLDE_URL) {
      html.push(kachelButtons({
        icon: ICON.ball, titel: "DFBnet", text: "Spielberichte, Pässe & mehr",
        zweitStil: true,
        buttons: [
          { label: "DFBnet öffnen", href: C.DFBNET_URL },
          { label: "fussball.de", href: C.FUSSBALLDE_URL },
        ],
      }));
    } else {
      html.push(kachelLink({
        href: C.DFBNET_URL, extern: true, icon: ICON.ball,
        titel: "DFBnet", text: "Spielberichte, Pässe & mehr",
      }));
    }
  }

  grid.innerHTML = html.join("");
})();
