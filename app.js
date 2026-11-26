/* app.js – Ablauf der App.
   Die App enthält keine KI und sendet/speichert nichts.
   Inhalte (Texte, Tempo-Bereich, Spuren) stehen in inhalte.js. */
(function () {
  'use strict';

  var I = window.INHALTE;
  var $ = function (id) { return document.getElementById(id); };

  // Über http/https (z. B. GitHub Pages) läuft die Lautstärke über Web Audio.
  // Beim Öffnen per Doppelklick (file://) blockieren Browser diesen Weg,
  // dann wird die normale Lautstärke der Audio-Elemente verwendet.
  var UEBER_HTTP = /^https?:$/.test(location.protocol);

  var beatLaenge = 60 / I.originalBpm;   // Länge eines Schlags in den Originaldateien (Sekunden)
  var ctx = null, metGain = null, audioBereit = false;
  var spuren = [], master = null;
  var spielt = false, bpm = I.originalBpm;
  var timerSync = null, timerBeat = null, timerUI = null;
  var letzterSchlag = -1, refM = 0, refC = 0, refGesetzt = false, zieht = false;

  /* ---------- Hilfsfunktionen ---------- */

  function zeigeMeldung(text) {
    var m = $('meldung');
    m.textContent = text;
    m.hidden = !text;
  }

  function zeit(s) {
    s = Math.max(0, Math.floor(s || 0));
    var min = Math.floor(s / 60), sek = s % 60;
    return min + ':' + (sek < 10 ? '0' : '') + sek;
  }

  function pegel(s) {            // Regler 0–100 % -> Lautstärke (quadratisch, klingt gleichmäßiger)
    return s.stumm ? 0 : Math.pow(s.wert / 100, 2);
  }

  /* ---------- Spuren aufbauen ---------- */

  I.spuren.forEach(function (cfg) {
    var s = { cfg: cfg, wert: cfg.start, stumm: false, audio: null, gain: null };
    if (cfg.datei) {
      var a = new Audio();
      a.preload = 'auto';
      a.src = cfg.datei;
      a.preservesPitch = true;           // Tonhöhe bleibt beim langsameren Tempo gleich
      a.mozPreservesPitch = true;
      a.webkitPreservesPitch = true;
      a.addEventListener('error', function () {
        zeigeMeldung('Die Audiodatei „' + cfg.datei + '“ konnte nicht geladen werden. ' +
          'Bitte prüfen, ob alle MP3-Dateien neben index.html liegen.');
      });
      s.audio = a;
      if (!master) master = a;
    }
    spuren.push(s);
  });

  function setzeLautstaerke(s) {
    if (s.cfg.typ === 'klick') {
      if (metGain) metGain.gain.value = pegel(s) * 0.8;
    } else if (s.gain) {
      s.gain.gain.value = pegel(s);
    } else if (s.audio) {
      s.audio.volume = Math.min(1, Math.max(0, pegel(s)));
    }
  }

  // Audio-System wird erst beim ersten Klick auf „Abspielen“ gestartet (Browser-Vorgabe).
  function audioStarten() {
    if (audioBereit) return;
    audioBereit = true;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
      metGain = ctx.createGain();
      metGain.connect(ctx.destination);
      if (UEBER_HTTP) {
        spuren.forEach(function (s) {
          if (!s.audio) return;
          var quelle = ctx.createMediaElementSource(s.audio);
          s.gain = ctx.createGain();
          quelle.connect(s.gain);
          s.gain.connect(ctx.destination);
          s.audio.volume = 1;
        });
      }
    } catch (e) {
      ctx = null;
      zeigeMeldung('Das Metronom steht in diesem Browser nicht zur Verfügung. Die anderen Spuren laufen.');
    }
    spuren.forEach(setzeLautstaerke);
  }

  /* ---------- Metronom (wird live erzeugt, daher bei jedem Tempo sauber) ---------- */

  function klick(t, betont) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'triangle';
    o.frequency.value = betont ? 1500 : 1000;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(betont ? 1.0 : 0.7, t + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
    o.connect(g);
    g.connect(metGain);
    o.start(t);
    o.stop(t + 0.08);
  }

  // Aktuelle Position in den Originaldateien (Sekunden), geglättet zwischen den Browser-Zeitstempeln
  function medienZeit() {
    var m = master.currentTime;
    if (!refGesetzt || m !== refM) { refM = m; refC = ctx.currentTime; refGesetzt = true; }
    return refM + (ctx.currentTime - refC) * master.playbackRate;
  }

  function schlagPlanen() {
    if (!ctx || !spielt) return;
    var rate = master.playbackRate;
    var m = medienZeit();
    var n = letzterSchlag + 1;
    var frueh = Math.ceil((m - 0.02) / beatLaenge);
    if (n < frueh) n = frueh;
    for (;;) {
      var dt = (n * beatLaenge - m) / rate;       // Sekunden bis zum Schlag (echte Zeit)
      if (dt > 0.12) break;
      klick(ctx.currentTime + Math.max(0, dt), n % I.taktart === 0);
      letzterSchlag = n;
      n++;
    }
  }

  function schlaegeZuruecksetzen() { letzterSchlag = -1; refGesetzt = false; }

  /* ---------- Tempo ---------- */

  function setzeBpm(v) {
    v = Math.round(Number(v));
    if (isNaN(v)) return;
    v = Math.min(I.maxBpm, Math.max(I.minBpm, v));
    bpm = v;
    var rate = v / I.originalBpm;
    spuren.forEach(function (s) {
      if (s.audio) {
        s.audio.playbackRate = rate;
        s.audio.preservesPitch = true;
        s.audio.mozPreservesPitch = true;
        s.audio.webkitPreservesPitch = true;
      }
    });
    refGesetzt = false;
    $('bpmRegler').value = v;
    $('bpmRegler').setAttribute('aria-valuetext', v + ' BPM');
    $('bpmAnzeige').textContent = v;
    $('bpmProzent').textContent = v === I.originalBpm
      ? 'Originaltempo'
      : Math.round(rate * 100) + ' % des Originaltempos (' + I.originalBpm + ' BPM)';
    document.querySelectorAll('#schnellwahl button').forEach(function (b) {
      b.classList.toggle('aktiv', Number(b.dataset.bpm) === v);
      b.setAttribute('aria-pressed', Number(b.dataset.bpm) === v ? 'true' : 'false');
    });
    $('bpmMinus').disabled = v <= I.minBpm;
    $('bpmPlus').disabled = v >= I.maxBpm;
  }

  /* ---------- Wiedergabe ---------- */

  function alleAbspielen() {
    return Promise.all(spuren.filter(function (s) { return s.audio; })
      .map(function (s) { return s.audio.play(); }));
  }
  function alleSetzen(t) {
    spuren.forEach(function (s) { if (s.audio) s.audio.currentTime = t; });
  }

  function timerStarten() {
    timerStop();
    timerSync = setInterval(function () {           // Spuren zusammenhalten
      spuren.forEach(function (s) {
        if (s.audio && s.audio !== master && Math.abs(s.audio.currentTime - master.currentTime) > 0.06) {
          s.audio.currentTime = master.currentTime;
        }
      });
    }, 500);
    timerBeat = setInterval(schlagPlanen, 25);
    timerUI = setInterval(oberflaecheAktualisieren, 200);
  }
  function timerStop() {
    clearInterval(timerSync); clearInterval(timerBeat); clearInterval(timerUI);
  }

  function abspielen() {
    zeigeMeldung('');
    audioStarten();
    var bereit = (ctx && ctx.state === 'suspended') ? ctx.resume() : Promise.resolve();
    return bereit.then(function () {
      alleSetzen(master.currentTime);
      return alleAbspielen();
    }).then(function () {
      spielt = true;
      schlaegeZuruecksetzen();
      timerStarten();
      oberflaecheAktualisieren();
    }).catch(function () {
      spielt = false;
      oberflaecheAktualisieren();
      zeigeMeldung('Die Wiedergabe konnte nicht gestartet werden. Bitte erneut auf „Abspielen“ drücken.');
    });
  }

  function pausieren() {
    spielt = false;
    spuren.forEach(function (s) { if (s.audio) s.audio.pause(); });
    timerStop();
    oberflaecheAktualisieren();
  }

  function zumAnfang() {
    var warAktiv = spielt;
    alleSetzen(0);
    schlaegeZuruecksetzen();
    if (!warAktiv) oberflaecheAktualisieren();
  }

  function oberflaecheAktualisieren() {
    var dauer = master && isFinite(master.duration) ? master.duration : 0;
    var pos = master ? master.currentTime : 0;
    $('playKnopf').innerHTML = spielt ? '&#10074;&#10074; Pause' : '&#9654; Abspielen';
    $('positionRegler').max = dauer || 1;
    if (!zieht) $('positionRegler').value = pos;
    $('positionRegler').setAttribute('aria-valuetext', zeit(pos) + ' von ' + zeit(dauer));
    $('positionText').textContent = zeit(pos) + ' / ' + zeit(dauer);
  }

  /* ---------- Mischpult aufbauen ---------- */

  function mischpultBauen() {
    var mixer = $('mixer');
    spuren.forEach(function (s) {
      var box = document.createElement('div');
      box.className = 'spur';

      var kopf = document.createElement('div');
      kopf.className = 'spur-kopf';
      var h = document.createElement('h3');
      h.textContent = s.cfg.name;
      var ausgabe = document.createElement('output');
      kopf.appendChild(h); kopf.appendChild(ausgabe);

      var reihe = document.createElement('div');
      reihe.className = 'reihe';
      var regler = document.createElement('input');
      regler.type = 'range'; regler.min = 0; regler.max = 100; regler.step = 1;
      regler.value = s.wert;
      regler.setAttribute('aria-label', 'Lautstärke ' + s.cfg.name);
      var stumm = document.createElement('button');
      stumm.type = 'button';
      stumm.textContent = 'Stumm';
      stumm.setAttribute('aria-pressed', 'false');
      stumm.setAttribute('aria-label', s.cfg.name + ' stumm schalten');
      reihe.appendChild(regler); reihe.appendChild(stumm);

      function anzeigen() {
        ausgabe.textContent = s.stumm ? 'aus' : s.wert + ' %';
        regler.setAttribute('aria-valuetext', s.stumm ? 'stumm' : s.wert + ' Prozent');
        stumm.setAttribute('aria-pressed', s.stumm ? 'true' : 'false');
        box.classList.toggle('stumm', s.stumm);
      }
      regler.addEventListener('input', function () {
        s.wert = Number(regler.value);
        if (s.wert > 0) s.stumm = false;      // Wer den Regler bewegt, will etwas hören
        anzeigen(); setzeLautstaerke(s);
      });
      stumm.addEventListener('click', function () {
        s.stumm = !s.stumm;
        anzeigen(); setzeLautstaerke(s);
      });

      box.appendChild(kopf); box.appendChild(reihe);
      mixer.appendChild(box);
      anzeigen();
    });
  }

  /* ---------- Start ---------- */

  function init() {
    document.title = I.titel;
    $('titel').textContent = I.titel;
    $('hinweis').textContent = I.hinweis;

    var regler = $('bpmRegler');
    regler.min = I.minBpm; regler.max = I.maxBpm; regler.step = 1;

    I.schnellwahl.forEach(function (b) {
      var k = document.createElement('button');
      k.type = 'button';
      k.textContent = b;
      k.dataset.bpm = b;
      k.setAttribute('aria-label', b + ' BPM');
      k.addEventListener('click', function () { setzeBpm(b); });
      $('schnellwahl').appendChild(k);
    });

    regler.addEventListener('input', function () { setzeBpm(regler.value); });
    $('bpmMinus').addEventListener('click', function () { setzeBpm(bpm - 1); });
    $('bpmPlus').addEventListener('click', function () { setzeBpm(bpm + 1); });

    $('playKnopf').addEventListener('click', function () { if (spielt) pausieren(); else abspielen(); });
    $('stopKnopf').addEventListener('click', zumAnfang);

    var pos = $('positionRegler');
    pos.addEventListener('pointerdown', function () { zieht = true; });
    pos.addEventListener('pointerup', function () { zieht = false; });
    pos.addEventListener('input', function () {
      alleSetzen(Number(pos.value));
      schlaegeZuruecksetzen();
      oberflaecheAktualisieren();
    });

    master.addEventListener('loadedmetadata', oberflaecheAktualisieren);
    master.addEventListener('ended', function () {
      if (!spielt) return;
      if ($('schleife').checked) {
        alleSetzen(0);
        schlaegeZuruecksetzen();
        alleAbspielen();
      } else {
        pausieren();
        alleSetzen(0);
        oberflaecheAktualisieren();
      }
    });

    // Schriftgröße (wird nicht gespeichert)
    var stufen = [16, 18, 20, 22, 24], stufe = 1;
    function schrift() {
      document.documentElement.style.fontSize = stufen[stufe] + 'px';
      $('schriftKlein').disabled = stufe === 0;
      $('schriftGross').disabled = stufe === stufen.length - 1;
    }
    $('schriftKlein').addEventListener('click', function () { if (stufe > 0) { stufe--; schrift(); } });
    $('schriftGross').addEventListener('click', function () { if (stufe < stufen.length - 1) { stufe++; schrift(); } });
    schrift();

    mischpultBauen();
    setzeBpm(I.originalBpm);
    oberflaecheAktualisieren();
  }

  init();
})();
