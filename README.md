# Annäherung an dein Drum-Solo: Einen Rhythmus vortragen

Eine kleine Übungsseite: Ein Swing-Playback aus vier Spuren (Metronom, Walking-Bass, Klavier, Saxofon-Solo) im festen Tempo 128 BPM.
Jede Spur hat eine eigene Lautstärke und einen Stumm-Schalter.
Die Seite enthält keine KI, speichert nichts und sendet nichts.

## Benutzen
- **Lokal:** Ordner entpacken, `index.html` doppelklicken.
- **GitHub Pages:** Repository hochladen, unter *Settings → Pages* die Branch `main` und den Ordner `/ (root)` wählen.

## Änderungsanleitung
Wenn du Texte oder die Start-Lautstärken ändern willst, öffne `inhalte.js` und ändere die Werte (Kommentare erklären jede Zeile).
Wenn du andere Aufnahmen verwenden willst, ersetze die MP3-Dateien (gleiche Dateinamen oder Namen in `inhalte.js` anpassen); alle Dateien müssen gleich lang sein und gleichzeitig beginnen.

## Aufbau
Alle Dateien liegen nebeneinander in einem Ordner:
```
index.html          Struktur
style.css           Aussehen
app.js              Ablauf (Wiedergabe, Lautstärke)
inhalte.js          Alle Texte und Einstellungen
metronom.mp3, walking-bass.mp3, klavier.mp3, saxofon-solo.mp3   die vier Audiospuren
LIZENZEN.md         Urhebervermerk und Lizenztext der Sounddatei
```

## Bekannte Grenzen
- Das Tempo ist fest und lässt sich nicht ändern.
- Beim Öffnen per Doppelklick (ohne Webserver) läuft die Lautstärke über die einfache Browser-Lautstärke. Auf iPhone und iPad wirkt diese nicht; dort die Seite über GitHub Pages öffnen.
- Die Instrumente sind am Computer erzeugt (Synthesizer), kein echtes Spiel.
- Die Seite hört nicht zu und bewertet das Spiel nicht.

## Tonmaterial und Lizenz
Die Audiodateien wurden für diese Seite am Computer erzeugt (eigene Akkordfolge in B-Dur, 128 BPM).
Für die Instrumentenklänge wurde die Sounddatei Fluid R3 GM verwendet, Copyright (c) 2000-2002, 2008 Frank Wen, MIT-Lizenz.
Der Urhebervermerk und der Lizenztext stehen in `LIZENZEN.md` und in der Fußzeile der Seite. Bitte beim Weitergeben beibehalten.
