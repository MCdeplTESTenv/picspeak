/*
 * Archivio locale chiave-valore per le impostazioni (IndexedDB).
 * Database "picspeak", archivio "settings". Il modello dati completo
 * (profili, pagine, celle, contesti) arriverà nella Tappa 2 con un aggiornamento di versione.
 * Se IndexedDB non è disponibile (es. alcune modalità private), usa la memoria
 * della sessione: il tool funziona, ma le impostazioni non restano salvate.
 */
(function () {
  'use strict';

  const DB_NAME = 'picspeak';
  const DB_VERSION = 1;
  const STORE = 'settings';

  const memory = new Map();
  let dbPromise = null;

  function openDb() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        reject(new Error('IndexedDB non disponibile'));
        return;
      }
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return dbPromise;
  }

  async function get(key) {
    try {
      const db = await openDb();
      return await new Promise((resolve, reject) => {
        const request = db.transaction(STORE, 'readonly').objectStore(STORE).get(key);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      return memory.get(key);
    }
  }

  async function set(key, value) {
    memory.set(key, value);
    try {
      const db = await openDb();
      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).put(value, key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (error) {
      // Resta solo in memoria per questa sessione
    }
  }

  window.PicSpeak = window.PicSpeak || {};
  window.PicSpeak.storage = { get, set };
})();
