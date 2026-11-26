/* app.js – Ablauf der App.
   Die App enthält keine KI und sendet/speichert nichts.
   Inhalte (Texte, Spuren, Start-Lautstärken) stehen in inhalte.js. */
(function () {
  'use strict';

  var I = window.INHALTE;
  var $ = function (id) { return document.getElementById(id); };

  // Über http/https (z. B. GitHub Pages) läuft die Lautstärke über Web Audio.
  // Beim Öffnen per Doppelklick (file://) blockieren Browser diesen Weg,
  // dann wird die normale Lautstärke der Audio-Elemente verwendet.
  var UEBER_HTTP = /^https?:$/.test(location.protocol);

  var ctx = null, audioBereit = false;
  var spuren = [], master = null;
  var spielt = false, zieht = false;
  var timerSync = null, timerUI = null;

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
    var a = new Audio();
    a.preload = 'auto';
    a.src = cfg.datei;
    a.addEventListener('error', function () {
      zeigeMeldung('Die Audiodatei „' + cfg.datei + '“ konnte nicht geladen werden. ' +
        'Bitte prüfen, ob alle MP3-Dateien neben index.html liegen.');
    });
    spuren.push({ cfg: cfg, wert: cfg.start, stumm: false, audio: a, gain: null });
    if (!master) master = a;
  });

  function setzeLautstaerke(s) {
    if (s.gain) s.gain.gain.value = pegel(s);
    else s.audio.volume = Math.min(1, Math.max(0, pegel(s)));
  }

  // Audio-System wird erst beim ersten Klick auf „Abspielen“ gestartet (Browser-Vorgabe).
  function audioStarten() {
    if (audioBereit) return;
    audioBereit = true;
    if (UEBER_HTTP) {
      try {
        var AC = window.AudioContext || window.webkitAudioContext;
        ctx = new AC();
        spuren.forEach(function (s) {
          var quelle = ctx.createMediaElementSource(s.audio);
          s.gain = ctx.createGain();
          quelle.connect(s.gain);
          s.gain.connect(ctx.destination);
          s.audio.volume = 1;
        });
      } catch (e) { ctx = null; }
    }
    spuren.forEach(setzeLautstaerke);
  }

  /* ---------- Wiedergabe ---------- */

  function alleAbspielen() {
    return Promise.all(spuren.map(function (s) { return s.audio.play(); }));
  }
  function alleSetzen(t) {
    spuren.forEach(function (s) { s.audio.currentTime = t; });
  }

  function timerStarten() {
    timerStop();
    timerSync = setInterval(function () {           // Spuren zusammenhalten
      spuren.forEach(function (s) {
        if (s.audio !== master && Math.abs(s.audio.currentTime - master.currentTime) > 0.06) {
          s.audio.currentTime = master.currentTime;
        }
      });
    }, 500);
    timerUI = setInterval(oberflaecheAktualisieren, 200);
  }
  function timerStop() { clearInterval(timerSync); clearInterval(timerUI); }

  function abspielen() {
    zeigeMeldung('');
    audioStarten();
    var bereit = (ctx && ctx.state === 'suspended') ? ctx.resume() : Promise.resolve();
    return bereit.then(function () {
      alleSetzen(master.currentTime);
      return alleAbspielen();
    }).then(function () {
      spielt = true;
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
    spuren.forEach(function (s) { s.audio.pause(); });
    timerStop();
    oberflaecheAktualisieren();
  }

  function zumAnfang() {
    alleSetzen(0);
    oberflaecheAktualisieren();
  }

  function oberflaecheAktualisieren() {
    var dauer = isFinite(master.duration) ? master.duration : 0;
    var pos = master.currentTime;
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
    $('bpmAnzeige').textContent = I.bpm;

    $('playKnopf').addEventListener('click', function () { if (spielt) pausieren(); else abspielen(); });
    $('stopKnopf').addEventListener('click', zumAnfang);

    var pos = $('positionRegler');
    pos.addEventListener('pointerdown', function () { zieht = true; });
    pos.addEventListener('pointerup', function () { zieht = false; });
    pos.addEventListener('input', function () {
      alleSetzen(Number(pos.value));
      oberflaecheAktualisieren();
    });

    master.addEventListener('loadedmetadata', oberflaecheAktualisieren);
    master.addEventListener('ended', function () {
      if (!spielt) return;
      if ($('schleife').checked) {
        alleSetzen(0);
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
    oberflaecheAktualisieren();
  }

  init();
})();
