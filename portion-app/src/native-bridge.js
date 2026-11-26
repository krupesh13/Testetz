/* Portion – native bridge.
   Loaded after the website's own script. On the web it does nothing.
   Inside the iOS / Android app it routes the four browser features the
   website uses to real native APIs, so they behave the same on both phones:
     navigator.vibrate   -> Haptics          (tap feedback)
     navigator.wakeLock  -> KeepAwake        (Cook mode "Stay awake")
     speechSynthesis     -> TextToSpeech     (Cook mode "Voice coach")
     Android back button -> the app's own Back / close-sheet logic
   The website's code, colors and screens are not modified. */
(function () {
  var Cap = window.Capacitor;
  if (!Cap || !Cap.isNativePlatform || !Cap.isNativePlatform()) return;
  var plug = function (n) { return (Cap.Plugins && Cap.Plugins[n]) || null; };
  var Haptics = plug('Haptics'), KeepAwake = plug('KeepAwake'),
      TTS = plug('TextToSpeech'), App = plug('App'), Bars = plug('SystemBars');

  /* 1. Tap feedback */
  if (Haptics) {
    try {
      Object.defineProperty(navigator, 'vibrate', {
        configurable: true,
        value: function () { Haptics.impact({ style: 'LIGHT' }).catch(function () {}); return true; }
      });
    } catch (e) {}
  }

  /* 2. Keep the screen on in Cook mode */
  if (KeepAwake) {
    try {
      Object.defineProperty(navigator, 'wakeLock', {
        configurable: true,
        value: {
          request: function () {
            return KeepAwake.keepAwake().then(function () {
              return { released: false, release: function () { this.released = true; return KeepAwake.allowSleep(); } };
            });
          }
        }
      });
    } catch (e) {}
  }

  /* 3. Voice coach (Android WebView has no working speechSynthesis) */
  if (TTS) {
    try {
      var Utter = function (text) { this.text = String(text || ''); };
      var synth = {
        speaking: false,
        speak: function (u) {
          var self = this; self.speaking = true;
          TTS.speak({ text: u && u.text || '', lang: navigator.language || 'en-US', rate: 1.0, pitch: 1.0, volume: 1.0, category: 'playback' })
            .catch(function () {}).then(function () { self.speaking = false; });
        },
        cancel: function () { this.speaking = false; TTS.stop().catch(function () {}); },
        getVoices: function () { return []; }
      };
      Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, writable: true, value: Utter });
      Object.defineProperty(window, 'speechSynthesis', { configurable: true, writable: true, value: synth });
    } catch (e) {}
  }

  /* 4. Light status-bar text over the dark olive top, as the site looks in a phone browser */
  if (Bars && Bars.setStyle) { Bars.setStyle({ style: 'DARK' }).catch(function () {}); }

  /* 5. Android hardware / gesture back */
  if (App) {
    App.addListener('backButton', function () {
      try {
        if (document.getElementById('seal')) return;                 // sealing animation finishes by itself
        if (document.getElementById('sheet')) { closeSheet(); return; }
        var intro = document.getElementById('intro');
        if (intro && !intro.classList.contains('gone')) { App.exitApp(); return; }
        if (hist.length) { A.back(); return; }
        if (cur !== 'home') { go('home', true); return; }
        App.exitApp();
      } catch (e) { App.exitApp(); }
    });
  }
})();
