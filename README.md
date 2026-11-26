# Annäherung an dein Drum-Solo: Einen Rhythmus vortragen

Eine kleine Übungsseite: Ein Swing-Playback aus vier Spuren (Metronom, Walking-Bass, Klavier, Saxofon-Solo).
Das Tempo ist von 60 bis 128 BPM einstellbar, jede Spur hat eine eigene Lautstärke und einen Stumm-Schalter.
Die Seite enthält keine KI, speichert nichts und sendet nichts.

## Benutzen
- **Lokal:** Ordner entpacken, `index.html` doppelklicken.
- **GitHub Pages:** Repository hochladen, unter *Settings → Pages* die Branch `main` und den Ordner `/ (root)` wählen.

## Änderungsanleitung
Wenn du Texte, den Tempo-Bereich, die Schnellwahl-Tempi oder die Start-Lautstärken ändern willst, öffne `inhalte.js` und ändere die Werte (Kommentare erklären jede Zeile).
Wenn du andere Aufnahmen verwenden willst, ersetze die MP3-Dateien (gleiche Dateinamen oder Namen in `inhalte.js` anpassen); alle Dateien müssen gleich lang sein, gleichzeitig beginnen und im Tempo `originalBpm` aufgenommen sein.

## Aufbau
Alle Dateien liegen nebeneinander in einem Ordner:
```
index.html          Struktur
style.css           Aussehen
app.js              Ablauf (Wiedergabe, Tempo, Lautstärke, Metronom)
inhalte.js          Alle Texte und Einstellungen
walking-bass.mp3, klavier.mp3, saxofon-solo.mp3   die drei Audiospuren
LIZENZEN.md         Urhebervermerk und Lizenztext der Sounddatei
```

## Bekannte Grenzen
- Das Tempo wird im Browser durch Dehnen der Aufnahme geändert. Bei sehr langsamem Tempo (60 BPM ≈ 47 % des Originals) klingen Bass, Klavier und Saxofon etwas weicher als im Originaltempo.
- Das Metronom wird von der Seite live erzeugt und klingt deshalb bei jedem Tempo gleich scharf. Es folgt der Position der Audiospuren; ein winziger Versatz von wenigen Hundertstelsekunden ist möglich.
- Beim Öffnen per Doppelklick (ohne Webserver) läuft die Lautstärke über die einfache Browser-Lautstärke. Auf iPhone und iPad wirkt diese nicht; dort die Seite über GitHub Pages öffnen.
- Die Instrumente sind am Computer erzeugt (Synthesizer), kein echtes Spiel.
- Die Seite hört nicht zu und bewertet das Spiel nicht.

## Tonmaterial und Lizenz
Die Audiodateien wurden für diese Seite am Computer erzeugt (eigene Akkordfolge in B-Dur, 128 BPM).
Für die Instrumentenklänge wurde die Sounddatei Fluid R3 GM verwendet, Copyright (c) 2000-2002, 2008 Frank Wen, MIT-Lizenz.
Der Urhebervermerk und der Lizenztext stehen in `LIZENZEN.md` und in der Fußzeile der Seite. Bitte beim Weitergeben beibehalten.
