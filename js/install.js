/*
 * Installazione come app (PWA) e registrazione del service worker.
 * Chrome/Edge (PC e Android) permettono un pulsante "Installa";
 * Safari (iPad/iPhone/Mac) richiede pochi passaggi manuali, che mostriamo all'adulto.
 */
(function () {
  'use strict';

  let deferredPrompt = null;
  const listeners = new Set();

  function notify() {
    listeners.forEach((fn) => fn());
  }

  // Chrome/Edge annunciano che l'app è installabile: teniamo l'evento per il pulsante
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    notify();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    notify();
  });

  function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches
      || window.matchMedia('(display-mode: fullscreen)').matches
      || window.navigator.standalone === true;
  }

  function platform() {
    const ua = navigator.userAgent;
    // iPadOS si presenta come Mac: lo riconosciamo dal tocco
    const isIos = /iPad|iPhone|iPod/.test(ua)
      || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (isIos) return 'ios';
    if (/Android/i.test(ua)) return 'android';
    if (/Firefox\//.test(ua)) return 'firefox';
    const isSafari = /Safari\//.test(ua) && !/Chrome|Chromium|Edg\/|OPR\//.test(ua);
    if (isSafari) return 'mac-safari';
    return 'chromium';
  }

  async function prompt() {
    if (!deferredPrompt) return false;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    deferredPrompt = null;
    notify();
    return choice.outcome === 'accepted';
  }

  // Il service worker funziona solo da indirizzo web (https o localhost), non da file aperto con doppio clic
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {
        // Senza service worker il tool funziona lo stesso, solo non offline
      });
    });
  }

  window.PicSpeak = window.PicSpeak || {};
  window.PicSpeak.install = {
    isStandalone,
    platform,
    prompt,
    canPrompt: () => Boolean(deferredPrompt),
    onChange: (fn) => listeners.add(fn),
  };
})();
