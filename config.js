/*
 * Zentrale Konfiguration der FC-Lorsbach-Website.
 * Nur diese Datei muss angepasst werden – kein Build-Schritt nötig.
 */
window.FCL_CONFIG = {
  /*
   * fussball.de-Widgets (Spielplan & Tabelle)
   *
   * Pro Mannschaft eine Zeile: "Anzeigename": "Widget-ID".
   * Die Widget-ID ist der Wert aus dem fussball.de-Einbettungscode
   * (siehe README, Abschnitt "Spielplan & Tabelle").
   *
   * - Gleiche Mannschaftsnamen in beiden Listen werden zu einem Tab zusammengefasst.
   * - Fehlt eine Mannschaft in einer Liste, wird dort nur das vorhandene Widget gezeigt.
   * - IDs, die mit "HIER_" beginnen, gelten als Platzhalter und werden nicht geladen.
   * - Reihenfolge der Einträge = Reihenfolge der Tabs.
   */
  FUSSBALLDE_WIDGET_SPIELPLAN: {
    "1. Mannschaft": "HIER_WIDGET_ID_SPIELPLAN_1",
    "2. Mannschaft": "HIER_WIDGET_ID_SPIELPLAN_2",
  },

  FUSSBALLDE_WIDGET_TABELLE: {
    "1. Mannschaft": "HIER_WIDGET_ID_TABELLE_1",
    "2. Mannschaft": "HIER_WIDGET_ID_TABELLE_2",
  },
};
