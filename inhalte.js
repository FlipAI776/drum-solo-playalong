/* ==========================================================================
   inhalte.js – ALLE Inhalte und Einstellungen der App an einer Stelle.
   Hier kannst du Texte, Tempo-Bereich und Spuren ändern, ohne Programmieren.
   Wichtig: Jede Zeile endet mit einem Komma, Texte stehen in "Anführungszeichen".
   ========================================================================== */

window.INHALTE = {

  // Überschrift und kurzer Hinweis unter der Überschrift
  titel: "Annäherung an dein Drum-Solo: Einen Rhythmus vortragen",
  hinweis: "Stelle ein Tempo ein, das du sicher spielen kannst, und mische die Spuren so, wie du sie brauchst.",

  // Tempo der Audiodateien im Original (so wurden sie aufgenommen). NICHT ändern,
  // außer du tauschst die Audiodateien gegen Aufnahmen mit einem anderen Tempo aus.
  originalBpm: 128,

  // Kleinstes und größtes Tempo, das der Regler zulässt
  minBpm: 60,
  maxBpm: 128,

  // Schnellwahl-Knöpfe für das Tempo (beliebig viele Zahlen zwischen min und max)
  schnellwahl: [60, 80, 100, 128],

  // Taktart: Anzahl der Schläge pro Takt (4 = 4/4). Schlag 1 klingt beim Metronom höher.
  taktart: 4,

  // Die vier Spuren. Reihenfolge = Reihenfolge auf dem Bildschirm.
  //   name:  so heißt die Spur auf dem Bildschirm
  //   datei: Name der MP3-Datei, die neben index.html liegt (beim Metronom entfällt die Datei)
  //   typ:   "klick" = Metronom wird von der App selbst erzeugt, immer genau im eingestellten Tempo
  //   start: Start-Lautstärke in Prozent (0 bis 100)
  // Wichtig: Alle Audiodateien müssen gleich lang sein und gleichzeitig beginnen.
  spuren: [
    { id: "metronom", name: "Metronom",       typ: "klick",                             start: 50 },
    { id: "bass",     name: "Walking-Bass",   datei: "walking-bass.mp3",           start: 80 },
    { id: "klavier",  name: "Klavier",        datei: "klavier.mp3",                start: 80 },
    { id: "saxofon",  name: "Saxofon-Solo",   datei: "saxofon-solo.mp3",           start: 80 }
  ]
};
