# FC Lorsbach – Website

Statische Vereinswebsite (HTML/CSS/JS, kein Build-Schritt). Einstellungen stehen
in `config.js`.

| Datei                  | Inhalt                                  |
| ---------------------- | --------------------------------------- |
| `index.html`           | Startseite mit den Kacheln              |
| `config.js`            | Zentrale Konfiguration                  |
| `css/style.css`        | Layout & Farben                         |
| `js/spiele-tabelle.js` | Kachel „Spiele & Tabelle“ (fussball.de) |

Lokal ansehen: `index.html` im Browser öffnen, oder z. B.
`python3 -m http.server` und `http://localhost:8000` aufrufen.

## Spielplan & Tabelle (fussball.de)

Die Kachel „Spiele & Tabelle“ bindet die **offiziellen Widgets von fussball.de**
ein. Es werden keine Daten gescrapt – fussball.de liefert Spielplan und Tabelle
selbst aus und hält sie aktuell.

### 1. Widget auf fussball.de erstellen

1. Auf **https://next.fussball.de** mit einem fussball.de-/DFBnet-Konto anmelden
   (kostenlos registrierbar).
2. **https://next.fussball.de/widgets** öffnen und auf **„Neues Widget erstellen“**
   klicken.
3. Widget-Typ wählen:
   - für den Spielplan: Mannschafts-Spielplan (Spiele einer Mannschaft),
   - für die Tabelle: **„Tabelle“**.
4. Verein bzw. Mannschaft und Wettbewerb/Staffel auswählen.
5. Bei **Website / Domain** die Adresse eintragen, unter der die Seite läuft
   (siehe unten) und speichern.
6. Für jede Mannschaft wiederholen – pro Mannschaft also je ein Widget für
   Spielplan und eines für die Tabelle.

### 2. Welche Domain muss ich eintragen?

Die Widgets werden **nur auf der eingetragenen Domain** angezeigt. Eintragen:

- die Domain, unter der die Website öffentlich erreichbar ist, als reine
  Adresse **mit `https://`, ohne Pfad und ohne Schrägstrich am Ende**, z. B.
  `https://www.fc-lorsbach.de`
- wird die Seite über **GitHub Pages** veröffentlicht (ohne eigene Domain), ist
  das `https://louisniemann.github.io`
- `www.fc-lorsbach.de` und `fc-lorsbach.de` gelten als unterschiedliche
  Adressen. Am besten die Variante eintragen, auf die die andere weiterleitet.

Hinweise:

- Bei **lokalem Testen** (`file://` oder `localhost`) bleiben die Widgets in der
  Regel leer – das ist normal. Testen auf der echten Domain.
- Ändert sich die Domain, müssen die Widgets auf fussball.de angepasst bzw. neu
  erstellt werden.
- Zum **Saisonwechsel** (manchmal auch zur Rückrunde oder bei Relegation) müssen
  Tabellen-Widgets neu erstellt und die neuen IDs eingetragen werden.

### 3. Widget-ID in `config.js` eintragen

Nach dem Speichern zeigt fussball.de einen Einbettungscode an, etwa so:

```html
<div class="fussballde_widget" data-id="1a2b3c4d-…" data-type="table"></div>
<script type="text/javascript" src="https://www.fussball.de/widgets.js"></script>
```

Benötigt wird nur der Wert von **`data-id`**. Den Code selbst nicht in die
HTML-Datei kopieren – das erledigt `js/spiele-tabelle.js`.

```js
FUSSBALLDE_WIDGET_SPIELPLAN: {
  "1. Mannschaft": "1a2b3c4d-…",
  "2. Mannschaft": "5e6f7a8b-…",
  "A-Jugend":      "9c0d1e2f-…",
},
FUSSBALLDE_WIDGET_TABELLE: {
  "1. Mannschaft": "a1b2c3d4-…",
  "2. Mannschaft": "e5f6a7b8-…",
  "A-Jugend":      "c9d0e1f2-…",
},
```

- **Mehrere Mannschaften:** beliebig viele Zeilen. Gleiche Namen in beiden
  Listen werden zu einem Tab zusammengefasst; die Reihenfolge entspricht der
  Reihenfolge der Tabs.
- Steht eine Mannschaft nur in einer der beiden Listen, wird nur dieses Widget
  gezeigt (z. B. Freundschaftsspiele ohne Tabelle).
- Werte, die mit `HIER_` beginnen, sind Platzhalter und werden nicht geladen.
- Steht im Einbettungscode ein anderes `data-type` als erwartet (Standard:
  `table` für Tabellen, `team-matches` für Spielpläne), den Eintrag als Objekt
  schreiben:
  `"1. Mannschaft": { id: "1a2b3c4d-…", type: "wert-aus-dem-code" }`

### Datenschutz

Beim Laden der Widgets werden Daten (u. a. die IP-Adresse) an fussball.de
übertragen. Deshalb lädt die Seite die Widgets erst, nachdem Besucher auf
**„Spielplan & Tabelle laden“** geklickt haben (die Entscheidung wird im Browser
gespeichert). fussball.de sollte außerdem in der Datenschutzerklärung genannt
werden.
