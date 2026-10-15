# FC Lorsbach – Trainer-App

Mobile Web-App (PWA) für die Trainer des FC Lorsbach (Hofheim am Taunus).
Reines HTML, CSS und JavaScript – kein Framework, kein Backend, kein Build-Schritt.

**Kacheln auf der Startseite**

1. **Belegungsplan**: zeigt `belegungsplan.pdf` an (Zoom, Download, offline verfügbar)
2. **Anwesenheit / Training**: öffnet SpielerPlus und/oder Teampunkt
3. **Vereinsshop**: öffnet den Online-Shop
4. **DFBnet**: optional zusätzlich mit einem Button zu fussball.de
5. **Spiele & Tabelle**: offizielle fussball.de-Widgets je Mannschaft

## Projektstruktur

| Datei / Ordner        | Inhalt                                                     |
| --------------------- | ---------------------------------------------------------- |
| `config.js`           | **Alle Links und Einstellungen** – nur hier ändern         |
| `belegungsplan.pdf`   | Der Belegungsplan (einfach austauschen)                    |
| `logo.png`            | Vereinswappen (Platzhalter)                                |
| `icons/`              | App-Icons für den Homescreen (Platzhalter)                 |
| `css/style.css`       | Design, **Vereinsfarben** ganz oben                        |
| `index.html`          | Startseite mit den Kacheln                                 |
| `belegungsplan.html`  | PDF-Ansicht                                                |
| `spiele-tabelle.html` | fussball.de-Widgets                                        |
| `js/`                 | Programmlogik                                              |
| `sw.js`               | Service Worker (Offline-Funktion)                          |
| `manifest.json`       | PWA-Angaben (Name, Icons, Farben)                          |
| `vendor/pdfjs/`       | PDF.js 4.10.38 (Mozilla, Apache-2.0), lokal für Offline    |

## App lokal starten

Die App braucht einen kleinen lokalen Webserver. Ein Doppelklick auf
`index.html` reicht nicht: Der PDF-Viewer und die Offline-Funktion
funktionieren nur über `http://`.

Im Projektordner ein Terminal öffnen und **eine** der Varianten starten:

```bash
python3 -m http.server 8000      # Python (macOS/Linux vorinstalliert)
npx serve .                      # oder mit Node.js
```

Dann im Browser **http://localhost:8000** öffnen.

**Handy-Ansicht am Computer:** In Chrome mit `F12` die Entwicklertools öffnen.
Dann mit `Strg+Umschalt+M` (Mac: `Cmd+Umschalt+M`) die Geräteansicht
einschalten, z. B. „iPhone 12 Pro“.

**Auf dem eigenen Handy testen** (im selben WLAN): Statt `localhost` die
IP-Adresse des Computers verwenden, z. B. `http://192.168.178.20:8000`.
Installieren und Offline funktionieren erst über `https://`, also nach dem
Online-Stellen (siehe unten).

## Belegungsplan austauschen

Neue Datei **genau `belegungsplan.pdf`** nennen und die alte im Projektordner
ersetzen (bzw. online hochladen). Fertig.

Die App lädt das PDF bei bestehender Internetverbindung immer neu. Offline
zeigt sie die zuletzt geladene Version mit einem Hinweis an.

Soll die Datei anders heißen, in `config.js` `BELEGUNGSPLAN_PDF` ändern und in
`sw.js` den Eintrag in der Liste `PRECACHE` anpassen.

> Die mitgelieferte `belegungsplan.pdf` ist nur ein **Beispiel**.

## Links & Einstellungen ändern (`config.js`)

| Einstellung                   | Bedeutung                                                     |
| ----------------------------- | ------------------------------------------------------------- |
| `TRAINING_APP`                | `"spielerplus"`, `"teampunkt"` oder `"beide"` (zwei Buttons) |
| `SPIELERPLUS.WEB_URL`         | Adresse von SpielerPlus                                       |
| `TEAMPUNKT.WEB_URL`           | Adresse von Teampunkt – **bitte prüfen**                      |
| `…ANDROID_PACKAGE`            | optional, siehe unten                                         |
| `SHOP_URL`                    | Vereinsshop – **Platzhalter, bitte eintragen**                |
| `DFBNET_URL`                  | DFBnet (`https://www.dfbnet.org`)                             |
| `FUSSBALLDE_URL`              | optionaler fussball.de-Button, `""` blendet ihn aus           |
| `FUSSBALLDE_WIDGET_SPIELPLAN` | Widget-IDs Spielplan je Mannschaft (siehe unten)              |
| `FUSSBALLDE_WIDGET_TABELLE`   | Widget-IDs Tabelle je Mannschaft                              |

Ein leerer Wert (`""`) blendet die jeweilige Kachel aus.

**Trainings-App direkt öffnen:** SpielerPlus und Teampunkt haben keine offene
Schnittstelle, die App verlinkt deshalb nur dorthin. Ist die App des Anbieters
installiert und unterstützt sie das, öffnet das Handy den Link direkt in der
App, sonst die Website. Für Android lässt sich das erzwingen: In
`ANDROID_PACKAGE` den Paketnamen eintragen. Er steht in der Play-Store-Adresse
der App hinter `?id=`, z. B. `play.google.com/store/apps/details?id=`**`paket.name`**.

### Vereinsfarben & Wappen

- Farben: oben in `css/style.css` die Werte `--verein-primaer`,
  `--verein-sekundaer` und `--verein-text` ersetzen. Die aktuellen Werte sind
  **Platzhalter**. Dieselbe Hauptfarbe auch in `manifest.json`
  (`theme_color`, `background_color`) und in den `<meta name="theme-color">`
  der HTML-Dateien eintragen.
- Wappen: `logo.png` ersetzen (quadratisch, transparent, ca. 256×256 px).
- Homescreen-Icon: die Dateien in `icons/` mit gleichem Namen und gleicher
  Größe ersetzen. Beim `icon-maskable-512.png` das Wappen mit etwa 20 % Rand
  platzieren.

Hell- und Dunkelmodus folgen der Handy-Einstellung. Der Button oben rechts
schaltet um: Automatisch → Hell → Dunkel.

## App online stellen (kostenlos)

Für Installation und Offline-Betrieb braucht die App **HTTPS**. Beide
folgenden Dienste bieten das kostenlos an.

### Variante A: GitHub Pages

1. Den Code in das GitHub-Repository hochladen (Branch `main`).
2. Auf GitHub: **Settings → Pages → Build and deployment**.
   Als „Source“ **Deploy from a branch** wählen, dann Branch `main` und
   Ordner `/ (root)`, speichern.
3. Nach 1–2 Minuten ist die App erreichbar unter
   `https://louisniemann.github.io/FC-Lorsbach/`.

Änderungen (neues PDF, neue Links) werden mit jedem Push automatisch
veröffentlicht.

### Variante B: Netlify

1. Auf https://app.netlify.com kostenlos anmelden.
2. **Add new site → Deploy manually** und den kompletten Projektordner
   in das Fenster ziehen.
   Oder **Import from Git** wählen und das GitHub-Repository verbinden. Dann
   wird bei jeder Änderung automatisch veröffentlicht.
3. Unter **Domain settings** lässt sich der Name ändern, z. B.
   `fc-lorsbach-trainer.netlify.app`.

### Auf dem Handy installieren

- **iPhone (Safari):** Seite öffnen → Teilen-Symbol → **„Zum Home-Bildschirm“**.
- **Android (Chrome):** Seite öffnen → Menü ⋮ → **„App installieren“** bzw.
  „Zum Startbildschirm hinzufügen“.

Danach den Belegungsplan einmal mit Internet öffnen. Ab dann ist er auch
offline verfügbar.

### Updates der App

Inhalte (`config.js`, PDF, Texte) kommen automatisch an, sobald das Handy
online ist. Nach größeren Änderungen an den App-Dateien in `sw.js` die
`VERSION` erhöhen, z. B. `"fcl-v2"`. Dann wird der Offline-Speicher erneuert.

## Spiele & Tabelle (fussball.de)

Die Kachel bindet die **offiziellen Widgets von fussball.de** ein. Es werden
keine Daten gescrapt: fussball.de liefert Spielplan und Tabelle selbst aus und
hält sie aktuell. Diese Kachel braucht eine Internetverbindung.

### 1. Widget auf fussball.de erstellen

1. Auf **https://next.fussball.de** mit einem fussball.de-/DFBnet-Konto anmelden.
2. **https://next.fussball.de/widgets** öffnen und auf **„Neues Widget erstellen“**
   klicken.
3. Den Typ wählen: Spielplan der Mannschaft bzw. **„Tabelle“**.
4. Mannschaft und Wettbewerb/Staffel auswählen.
5. Bei **Website / Domain** die Adresse der App eintragen (siehe unten) und
   speichern.
6. Für jede Mannschaft je ein Widget für Spielplan und eines für die Tabelle anlegen.

### 2. Welche Domain muss ich eintragen?

Die Widgets erscheinen **nur auf der eingetragenen Domain**. Einzutragen ist
die Adresse, unter der die App online läuft. Sie wird **mit `https://`, ohne
Pfad und ohne `/` am Ende** angegeben:

- GitHub Pages: `https://louisniemann.github.io`
- Netlify: z. B. `https://fc-lorsbach-trainer.netlify.app`
- eigene Domain: z. B. `https://trainer.fc-lorsbach.de`.
  `www.` und die Variante ohne `www.` sind dabei verschiedene Adressen.

Lokal (`localhost`) bleiben die Widgets in der Regel leer, das ist normal.
Zum **Saisonwechsel** (teils auch zur Rückrunde oder bei Relegation) müssen
die Widgets neu erstellt und die neuen IDs eingetragen werden.

### 3. Widget-ID in `config.js` eintragen

Nach dem Speichern zeigt fussball.de einen Einbettungscode an, etwa so:

```html
<div class="fussballde_widget" data-id="1a2b3c4d-…" data-type="table"></div>
<script type="text/javascript" src="https://www.fussball.de/widgets.js"></script>
```

Benötigt wird nur der Wert von **`data-id`**:

```js
FUSSBALLDE_WIDGET_SPIELPLAN: {
  "1. Mannschaft": "1a2b3c4d-…",
  "A-Jugend":      "9c0d1e2f-…",
},
FUSSBALLDE_WIDGET_TABELLE: {
  "1. Mannschaft": "a1b2c3d4-…",
  "A-Jugend":      "c9d0e1f2-…",
},
```

- Es sind beliebig viele Mannschaften möglich. Gleiche Namen in beiden Listen
  ergeben einen gemeinsamen Tab.
- Steht eine Mannschaft nur in einer der beiden Listen, wird nur dieses
  Widget gezeigt.
- Werte, die mit `HIER_` beginnen, sind Platzhalter und werden nicht geladen.
- Nennt der Einbettungscode einen anderen `data-type` als erwartet, den Eintrag
  als Objekt schreiben. Standard ist `table` für Tabellen und `team-matches`
  für Spielpläne:
  `"1. Mannschaft": { id: "1a2b3c4d-…", type: "wert-aus-dem-code" }`

**Datenschutz:** Beim Laden der Widgets werden Daten (u. a. die IP-Adresse)
an fussball.de übertragen. Die App lädt sie deshalb erst nach einem Klick auf
„Spielplan & Tabelle laden“.
