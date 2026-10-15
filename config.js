/*
 * Zentrale Konfiguration der FC-Lorsbach-Trainer-App.
 * Alle Links und Einstellungen stehen hier – sonst muss nichts angepasst werden.
 * Leere Werte ("") blenden die jeweilige Kachel bzw. den Button aus.
 */
window.FCL_CONFIG = {
  VEREIN: "FC Lorsbach",
  APP_TITEL: "Trainer-App",

  /* ---------- 1. Belegungsplan ---------- */
  // Datei im Projektordner. Austauschen: neue Datei mit gleichem Namen ablegen.
  BELEGUNGSPLAN_PDF: "belegungsplan.pdf",

  /* ---------- 2. Anwesenheit / Training ---------- */
  // "spielerplus", "teampunkt" oder "beide"
  TRAINING_APP: "spielerplus",

  SPIELERPLUS: {
    WEB_URL: "https://www.spielerplus.de/",
    // Optional: Paketname der Android-App (aus der Play-Store-Adresse "…?id=PAKETNAME").
    // Ist er gesetzt, öffnet Android direkt die installierte App, sonst die Website.
    ANDROID_PACKAGE: "",
  },

  TEAMPUNKT: {
    WEB_URL: "https://www.teampunkt.de/", // bitte prüfen
    ANDROID_PACKAGE: "",
  },

  /* ---------- 3. Vereinsshop ---------- */
  SHOP_URL: "https://HIER-SHOP-URL-EINTRAGEN.de",

  /* ---------- 4. DFBnet ---------- */
  DFBNET_URL: "https://www.dfbnet.org",
  // Optional: zusätzlicher Link zu fussball.de (z. B. die Vereinsseite). "" = ausblenden.
  FUSSBALLDE_URL: "https://www.fussball.de",

  /* ---------- 5. Spiele & Tabelle (fussball.de-Widgets) ---------- */
  // Pro Mannschaft eine Zeile: "Anzeigename": "Widget-ID" (siehe README).
  // Gleiche Namen in beiden Listen = ein Tab. IDs mit "HIER_" sind Platzhalter.
  FUSSBALLDE_WIDGET_SPIELPLAN: {
    "1. Mannschaft": "HIER_WIDGET_ID_SPIELPLAN_1",
    "2. Mannschaft": "HIER_WIDGET_ID_SPIELPLAN_2",
  },
  FUSSBALLDE_WIDGET_TABELLE: {
    "1. Mannschaft": "HIER_WIDGET_ID_TABELLE_1",
    "2. Mannschaft": "HIER_WIDGET_ID_TABELLE_2",
  },
};
