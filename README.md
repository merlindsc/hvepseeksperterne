# Hvepseeksperterne · Die Wespenexperten

Homepage von Jürgen Hanika — Wespen, Hornissen und Hummeln umsiedeln statt töten,
in Sønderjylland (DK) und Nordschleswig-Holstein (DE).

Live: <https://hvepseeksperterne.eu/> (auch <https://wespenexperten.eu/>)

## Wie die Seite aufgebaut ist

Gepflegt wird **eine einzige Datei**: `src/index.html`. Darin stehen alle drei
Sprachen nebeneinander, markiert mit `data-de`, `data-da` und `data-en` — genau
wie früher.

Daraus macht `build.js` drei getrennte, fertige Seiten:

| Datei           | Sprache  | URL                                 |
| --------------- | -------- | ----------------------------------- |
| `index.html`    | Deutsch  | `https://hvepseeksperterne.eu/`     |
| `da/index.html` | Dansk    | `https://hvepseeksperterne.eu/da/`  |
| `en/index.html` | English  | `https://hvepseeksperterne.eu/en/`  |

Dazu erzeugt der Build die `sitemap.xml`.

**Warum getrennte Seiten?** Vorher lagen alle drei Sprachen in einer Datei und
wurden per CSS ein- und ausgeblendet. Google bewertet aber nur, was nach dem
Rendern sichtbar ist — und Googles Renderer läuft mit englischer Browsersprache.
Der deutsche und der dänische Text galten damit als versteckt. Für dänische
Suchanfragen war die Seite praktisch unsichtbar. Jetzt hat jede Sprache eine
eigene URL mit eigenem Titel, eigener Beschreibung und eigenen Strukturdaten,
und die Sprachen verweisen per `hreflang` aufeinander.

## Ändern und veröffentlichen

```bash
# 1. Inhalt bearbeiten
#    -> nur src/index.html anfassen, nie index.html / da/ / en/ direkt!

# 2. Seiten neu bauen (braucht nur Node, kein npm install)
node build.js

# 3. Prüfen: irgendeine der drei Dateien im Browser öffnen

# 4. Veröffentlichen
git add -A && git commit -m "…" && git push
```

Die drei erzeugten Dateien liegen bewusst mit im Repo. So funktioniert sowohl
ein automatischer Netlify-Build (`netlify.toml`) als auch ein manueller Deploy
über das Netlify-Dashboard.

### Was in `build.js` konfiguriert wird

* `META` — Titel, Beschreibung und Open-Graph-Texte je Sprache
* `ALT` — Bild-Alternativtexte je Sprache

Bilder liegen als WebP (mit JPG-Fallback im `<picture>`) vor; neue Bilder mit
`ffmpeg -i bild.jpg -c:v libwebp -quality 80 bild.webp` erzeugen. Die Hero-Skizze
hat zusätzlich einen 3:2-Ausschnitt (`-m-480`, `-m-824`) fürs Handy.
* `ATTR_I18N` — Texte, die in Attributen stecken (z. B. `placeholder`)
* `structuredData()` — Firmendaten für Google (Adresse, Telefon, Preise, Gebiet)

Adresse, Telefonnummern oder Preise ändern sich? Dann an **zwei** Stellen
nachziehen: im Seitentext (`src/index.html`) und in `structuredData()`.

## Weitere Dateien

| Datei             | Zweck                                                        |
| ----------------- | ------------------------------------------------------------ |
| `netlify.toml`    | Build-Befehl für Netlify                                      |
| `_redirects`      | alte `?lang=`-Links, Kurzlinks `/dansk`, `/dk`, `/english`     |
| `_headers`        | Sicherheits-Header und Caching für Bilder/Video                |
| `robots.txt`      | Freigabe für Suchmaschinen + Verweis auf die Sitemap           |
| `site.webmanifest`| Icons/Startbildschirm auf dem Handy                            |
