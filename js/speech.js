/*
 * Sintesi vocale con la Web Speech API del browser.
 * Nessun servizio esterno: le voci sono quelle installate sul dispositivo.
 */
(function () {
  'use strict';

  const synth = window.speechSynthesis;
  let voices = [];

  function loadVoices() {
    if (!synth) return;
    voices = synth.getVoices();
  }

  // Le voci arrivano in modo asincrono su Chrome/Edge
  if (synth) {
    loadVoices();
    if (typeof synth.addEventListener === 'function') {
      synth.addEventListener('voiceschanged', loadVoices);
    } else {
      synth.onvoiceschanged = loadVoices;
    }
  }

  // Sceglie la voce migliore per la lingua: prima corrispondenza esatta, poi solo la lingua
  function pickVoice(locale) {
    if (!voices.length) loadVoices();
    const lang = locale.split('-')[0];
    const normalize = (v) => (v.lang || '').replace('_', '-').toLowerCase();
    const exact = voices.filter((v) => normalize(v) === locale.toLowerCase());
    const sameLang = voices.filter((v) => normalize(v).startsWith(lang));
    const pool = exact.length ? exact : sameLang;
    // Preferisce le voci locali (funzionano offline) e quelle di qualità migliore
    return pool.find((v) => v.localService && /premium|enhanced|natural/i.test(v.name))
      || pool.find((v) => v.localService)
      || pool[0]
      || null;
  }

  function speak(text, locale) {
    if (!synth || !text) return false;
    // Interrompe la frase precedente: il tocco più recente ha la priorità
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = locale;
    const voice = pickVoice(locale);
    if (voice) utterance.voice = voice;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    synth.speak(utterance);
    return true;
  }

  window.PicSpeak = window.PicSpeak || {};
  window.PicSpeak.speech = {
    speak,
    get supported() { return Boolean(synth); },
  };
})();
