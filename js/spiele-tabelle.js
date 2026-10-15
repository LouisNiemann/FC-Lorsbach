/*
 * Kachel "Spiele & Tabelle": bindet die offiziellen fussball.de-Widgets ein.
 * Es werden keine Daten gescrapt – fussball.de rendert die Inhalte selbst.
 *
 * Datenschutz: Das fussball.de-Skript wird erst nach einem Klick des
 * Besuchers geladen (2-Klick-Lösung), da dabei Daten an fussball.de gehen.
 */
(function () {
  "use strict";

  var WIDGET_SCRIPT = "https://www.fussball.de/widgets.js";
  var CONSENT_KEY = "fcl-fussballde-consent";

  var config = window.FCL_CONFIG || {};
  var spielplan = config.FUSSBALLDE_WIDGET_SPIELPLAN || {};
  var tabelle = config.FUSSBALLDE_WIDGET_TABELLE || {};

  var root = document.getElementById("spiele-tabelle");
  if (!root) return;

  function isPlaceholder(id) {
    return !id || /^HIER_/.test(id);
  }

  // Mannschaften aus beiden Listen zusammenführen, Reihenfolge beibehalten.
  function teamNames() {
    var names = [];
    Object.keys(spielplan).concat(Object.keys(tabelle)).forEach(function (name) {
      if (names.indexOf(name) === -1) names.push(name);
    });
    return names;
  }

  function hasConsent() {
    try {
      return window.localStorage.getItem(CONSENT_KEY) === "1";
    } catch (e) {
      return false;
    }
  }

  function storeConsent() {
    try {
      window.localStorage.setItem(CONSENT_KEY, "1");
    } catch (e) {
      /* Speichern nicht möglich – Einwilligung gilt dann nur für diesen Seitenaufruf. */
    }
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  // Ein Eintrag ist entweder nur die ID ("abc…") oder ein Objekt
  // { id: "abc…", type: "…" }, falls fussball.de einen anderen data-type vorgibt.
  function widgetBlock(title, entry, defaultType) {
    var id = typeof entry === "object" && entry ? entry.id : entry;
    var type = (typeof entry === "object" && entry && entry.type) || defaultType;
    var block = el("section", "widget-block");
    block.appendChild(el("h3", null, title));
    if (isPlaceholder(id)) {
      block.appendChild(
        el("p", "widget-hinweis", "Noch keine Widget-ID in config.js hinterlegt.")
      );
      return block;
    }
    var widget = el("div", "fussballde_widget");
    widget.setAttribute("data-id", id);
    widget.setAttribute("data-type", type);
    block.appendChild(widget);
    return block;
  }

  function loadWidgetScript() {
    // widgets.js sucht beim Laden alle .fussballde_widget-Elemente; daher
    // pro Seitenaufruf neu einfügen, nachdem die Container im DOM sind.
    var old = document.querySelector('script[src="' + WIDGET_SCRIPT + '"]');
    if (old) old.parentNode.removeChild(old);
    var script = document.createElement("script");
    script.src = WIDGET_SCRIPT;
    script.async = true;
    document.body.appendChild(script);
  }

  function renderTeam(name, panel) {
    panel.innerHTML = "";
    if (name in spielplan) panel.appendChild(widgetBlock("Spielplan", spielplan[name], "team-matches"));
    if (name in tabelle) panel.appendChild(widgetBlock("Tabelle", tabelle[name], "table"));
    if (panel.querySelector(".fussballde_widget")) loadWidgetScript();
  }

  function renderTabs(names) {
    var tabs = el("div", "team-tabs");
    tabs.setAttribute("role", "tablist");
    var panel = el("div", "team-panel");
    panel.setAttribute("role", "tabpanel");

    names.forEach(function (name, i) {
      var btn = el("button", "team-tab", name);
      btn.type = "button";
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", i === 0 ? "true" : "false");
      btn.addEventListener("click", function () {
        Array.prototype.forEach.call(tabs.children, function (b) {
          b.setAttribute("aria-selected", b === btn ? "true" : "false");
        });
        renderTeam(name, panel);
      });
      tabs.appendChild(btn);
    });

    root.innerHTML = "";
    if (names.length > 1) root.appendChild(tabs);
    root.appendChild(panel);
    renderTeam(names[0], panel);
  }

  function renderConsent(names) {
    root.innerHTML = "";
    var box = el("div", "consent-box");
    box.appendChild(
      el(
        "p",
        null,
        "Spielplan und Tabelle werden direkt von fussball.de geladen. " +
          "Dabei werden Daten (z. B. Ihre IP-Adresse) an fussball.de übertragen."
      )
    );
    var btn = el("button", "button", "Spielplan & Tabelle laden");
    btn.type = "button";
    btn.addEventListener("click", function () {
      storeConsent();
      renderTabs(names);
    });
    box.appendChild(btn);
    root.appendChild(box);
  }

  var names = teamNames();
  if (names.length === 0) {
    root.appendChild(el("p", "widget-hinweis", "Keine Mannschaften in config.js eingetragen."));
    return;
  }
  if (hasConsent()) renderTabs(names);
  else renderConsent(names);
})();
