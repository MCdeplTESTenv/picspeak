/*
 * Previsione della parola successiva (basi): tutto calcolato sul dispositivo.
 *
 * Raccolta: ogni volta che il bambino aggiunge una tessera alla frase si registra la coppia
 * «parola precedente → parola» (bigramma; "^" = inizio della frase) e la parola da sola.
 * Ogni conteggio sbiadisce nel tempo (dimezza ogni 30 giorni): le abitudini recenti pesano di più,
 * quelle vecchie si spengono da sole senza essere cancellate. Si tiene anche la fascia oraria
 * e se l'uso è avvenuto in un giorno feriale o nel fine settimana.
 *
 * Suggerimento: le parole più probabili dopo l'ultima della frase vengono EVIDENZIATE nella
 * pagina (o si evidenzia la cartella che le contiene). Le tessere non si spostano mai:
 * la posizione stabile è la base della memoria motoria.
 *
 * Privacy: nessun dato esce dal dispositivo; niente rete, niente servizi esterni.
 * Archivio IndexedDB "usage" (vedi docs/FORMATO-DATI.md).
 */
(function () {
  'use strict';

  const { storage } = window.PicSpeak;

  const START = '^'; // inizio della frase
  const HALF_LIFE_DAYS = 30;
  const DAY_MS = 24 * 60 * 60 * 1000;
  const MIN_SCORE = 1.5; // sotto questo valore (circa due usi recenti) non si suggerisce nulla
  const SETTINGS_KEY = 'prediction';
  const DEFAULTS = { collect: true, suggest: false, count: 2 };

  let settings = { ...DEFAULTS };
  let profileId = null;
  const records = new Map(); // id → record
  const dirty = new Set();
  let saveTimer = null;
  let ready = null;

  // Parola normalizzata: la stessa parola in schede diverse conta come una sola
  function wordKey(label) {
    return String(label || '').trim().toLowerCase().replace(/\s+/g, ' ').slice(0, 60);
  }

  function recordId(prev, word) {
    return `u_${profileId}_${encodeURIComponent(prev || '')}_${encodeURIComponent(word)}`;
  }

  // Valore attuale di un conteggio che sbiadisce nel tempo
  function decayed(record, at = Date.now()) {
    const age = Math.max(0, at - Date.parse(record.lastUsed || 0)) / DAY_MS;
    return record.count * 0.5 ** (age / HALF_LIFE_DAYS);
  }

  function isHoliday(date) {
    const day = date.getDay();
    return day === 0 || day === 6;
  }

  async function init(activeProfileId) {
    profileId = activeProfileId;
    const saved = await storage.get(SETTINGS_KEY);
    settings = { ...DEFAULTS, ...(saved && typeof saved === 'object' ? saved : {}) };
    settings.collect = settings.collect !== false;
    settings.suggest = settings.suggest === true;
    settings.count = [1, 2, 3].includes(settings.count) ? settings.count : DEFAULTS.count;
    records.clear();
    const all = await storage.getAllRecords('usage');
    all.filter((r) => r && r.profileId === profileId && typeof r.word === 'string' && Number.isFinite(r.count))
      .forEach((r) => records.set(r.id, r));
  }

  function load(activeProfileId) {
    ready = init(activeProfileId);
    return ready;
  }

  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(flush, 1500);
  }

  async function flush() {
    clearTimeout(saveTimer);
    if (!dirty.size) return;
    const list = [...dirty].map((id) => records.get(id)).filter(Boolean);
    dirty.clear();
    await storage.putRecords('usage', list);
  }

  function bump(prev, word, cellId, prevCellId, when) {
    const id = recordId(prev, word);
    const nowIso = when.toISOString();
    let record = records.get(id);
    if (!record) {
      record = {
        id, profileId, contextId: null, word, prevWord: prev, cellId, prevCellId: prevCellId || null,
        count: 0, lastUsed: nowIso, byHour: new Array(24).fill(0), weekday: 0, holiday: 0,
      };
      records.set(id, record);
    }
    // Prima si fa sbiadire il valore accumulato, poi si aggiunge l'uso di adesso
    const factor = record.count ? decayed(record, when.getTime()) / record.count : 1;
    record.count = record.count * factor + 1;
    record.byHour = record.byHour.map((v, h) => v * factor + (h === when.getHours() ? 1 : 0));
    record.weekday = record.weekday * factor + (isHoliday(when) ? 0 : 1);
    record.holiday = record.holiday * factor + (isHoliday(when) ? 1 : 0);
    record.lastUsed = nowIso;
    record.cellId = cellId;
    dirty.add(id);
  }

  /*
   * Registra una tessera aggiunta alla frase. prevItem = tessera precedente nella frase (o null).
   */
  function record(item, prevItem) {
    if (!settings.collect || !profileId || !item) return;
    const word = wordKey(item.label);
    if (!word) return;
    const prev = prevItem ? wordKey(prevItem.label) : START;
    const when = new Date();
    bump(prev, word, item.cellId, prevItem ? prevItem.cellId : null, when);
    bump(null, word, item.cellId, null, when); // frequenza della parola da sola
    scheduleSave();
  }

  // Peso per l'ora e il tipo di giorno: le abitudini di questo momento contano un po' di più
  function contextWeight(rec, when) {
    const total = rec.byHour.reduce((a, b) => a + b, 0) || 1;
    const hourShare = (rec.byHour[when.getHours()] || 0) / total;
    const dayTotal = (rec.weekday + rec.holiday) || 1;
    const dayShare = (isHoliday(when) ? rec.holiday : rec.weekday) / dayTotal;
    return 1 + 0.5 * hourShare + 0.25 * dayShare;
  }

  /*
   * Parole probabili dopo la tessera indicata (null = inizio della frase), in ordine.
   * Restituisce [{ word, score }].
   */
  function candidates(prevItem) {
    const prev = prevItem ? wordKey(prevItem.label) : START;
    const now = new Date();
    const list = [];
    records.forEach((rec) => {
      if (rec.prevWord !== prev) return;
      const score = decayed(rec, now.getTime()) * contextWeight(rec, now);
      if (score >= MIN_SCORE) list.push({ word: rec.word, score });
    });
    return list.sort((a, b) => b.score - a.score);
  }

  function stats() {
    const now = Date.now();
    let uses = 0;
    let pairs = 0;
    const top = [];
    records.forEach((rec) => {
      if (rec.prevWord === null || rec.prevWord === undefined) {
        uses += Math.round(rec.count);
        return;
      }
      pairs += 1;
      if (rec.prevWord !== START) top.push({ from: rec.prevWord, to: rec.word, score: decayed(rec, now) });
    });
    top.sort((a, b) => b.score - a.score);
    return { uses, pairs, top: top.slice(0, 5) };
  }

  async function clearAll() {
    clearTimeout(saveTimer);
    dirty.clear();
    const ids = [...records.keys()];
    records.clear();
    await Promise.all(ids.map((id) => storage.deleteRecord('usage', id)));
  }

  async function setSettings(changes) {
    settings = { ...settings, ...changes };
    await storage.set(SETTINGS_KEY, settings);
  }

  // Salva subito quando la pagina viene nascosta (chiusura dell'app, cambio di scheda)
  document.addEventListener('visibilitychange', () => { if (document.hidden) flush(); });

  window.PicSpeak.predict = {
    load,
    record,
    candidates,
    wordKey,
    stats,
    clearAll,
    setSettings,
    get settings() { return { ...settings }; },
    get ready() { return ready; },
  };
})();
