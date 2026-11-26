/* ==========================================================================
   inhalte.js – ALLE Inhalte und Einstellungen der App an einer Stelle.
   Hier kannst du Texte und Start-Lautstärken ändern, ohne Programmieren.
   Wichtig: Jede Zeile endet mit einem Komma, Texte stehen in "Anführungszeichen".
   ========================================================================== */

window.INHALTE = {

  // Überschrift und kurzer Hinweis unter der Überschrift
  titel: "Annäherung an dein Drum-Solo: Einen Rhythmus vortragen",
  hinweis: "Mische die Spuren so, wie du sie brauchst, und trage deinen Rhythmus vor.",

  // Tempo des Tracks (wird nur angezeigt, nicht verändert)
  bpm: 128,

  // Die vier Spuren. Reihenfolge = Reihenfolge auf dem Bildschirm.
  //   name:  so heißt die Spur auf dem Bildschirm
  //   datei: Name der MP3-Datei, die neben index.html liegt
  //   start: Start-Lautstärke in Prozent (0 bis 100)
  // Wichtig: Alle Audiodateien müssen gleich lang sein und gleichzeitig beginnen.
  spuren: [
    { id: "metronom", name: "Metronom",      datei: "metronom.mp3",      start: 100 },
    { id: "bass",     name: "Walking-Bass",  datei: "walking-bass.mp3",  start: 80 },
    { id: "klavier",  name: "Klavier",       datei: "klavier.mp3",       start: 80 },
    { id: "saxofon",  name: "Saxofon-Solo",  datei: "saxofon-solo.mp3",  start: 80 }
  ]
};
