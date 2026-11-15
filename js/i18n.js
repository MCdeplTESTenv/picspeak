/*
 * Dizionari dei testi dell'interfaccia, uno per lingua.
 * Nessun testo dell'interfaccia va scritto direttamente nel codice:
 * aggiungere una lingua significa aggiungere un dizionario qui.
 */
(function () {
  'use strict';

  const dictionaries = {
    it: {
      appName: 'PicSpeak',
      speakSentence: 'Leggi la frase',
      deleteLast: 'Cancella l’ultimo simbolo',
      clearSentence: 'Cancella tutta la frase',
      goHome: 'Torna alla pagina principale',
      sentenceEmpty: 'Frase vuota',
      openPage: 'Apri la pagina',
      removeFromSentence: 'Togli dalla frase',
    },
    en: {
      appName: 'PicSpeak',
      speakSentence: 'Read the sentence',
      deleteLast: 'Delete the last symbol',
      clearSentence: 'Clear the whole sentence',
      goHome: 'Back to the main page',
      sentenceEmpty: 'Empty sentence',
      openPage: 'Open page',
      removeFromSentence: 'Remove from sentence',
    },
  };

  // Codici BCP 47 usati per la sintesi vocale
  const speechLocales = { it: 'it-IT', en: 'en-US' };

  const supported = Object.keys(dictionaries);
  let current = 'it';

  // Lingua iniziale: italiano di default; in futuro arriverà dalle impostazioni adulto
  function detectInitialLanguage() {
    const fromUrl = new URLSearchParams(location.search).get('lang');
    if (fromUrl && supported.includes(fromUrl)) return fromUrl;
    return 'it';
  }

  function t(key) {
    const dict = dictionaries[current] || dictionaries.it;
    return dict[key] ?? dictionaries.it[key] ?? key;
  }

  function setLanguage(lang) {
    if (!supported.includes(lang)) return;
    current = lang;
    document.documentElement.lang = lang;
  }

  setLanguage(detectInitialLanguage());

  window.PicSpeak = window.PicSpeak || {};
  window.PicSpeak.i18n = {
    t,
    setLanguage,
    get language() { return current; },
    get speechLocale() { return speechLocales[current]; },
    supported,
  };
})();
