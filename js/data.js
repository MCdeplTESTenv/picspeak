/*
 * Modello dei dati di PicSpeak (vedi docs/FORMATO-DATI.md).
 * Carica il profilo attivo con le sue schede e immagini; al primo avvio crea il profilo
 * predefinito "bambino" a partire dalle schede di prova (sample-data.js).
 * Tutto resta sul dispositivo (IndexedDB tramite storage.js).
 */
(function () {
  'use strict';

  const { storage, sampleData, i18n } = window.PicSpeak;

  const DEFAULT_COLS = 4;
  const WORD_TYPES = ['pronoun', 'verb', 'noun', 'adjective', 'social', 'negation'];

  const model = {
    profile: null,
    pages: new Map(),
    images: new Map(),
  };
  const objectUrls = new Map(); // id immagine → URL temporaneo del blob

  // Identificativo casuale, stabile per tutta la vita dell'elemento
  function newId(prefix) {
    const bytes = crypto.getRandomValues(new Uint8Array(8));
    return `${prefix}_${Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')}`;
  }

  function now() {
    return new Date().toISOString();
  }

  // ---------- Primo avvio: profilo predefinito dalle schede di prova ----------

  function arasaacImage(id, labelIt, labelEn) {
    return {
      id: `img_ar_${id}`,
      source: 'arasaac',
      sourceId: String(id),
      author: 'Sergio Palao',
      owner: 'Gobierno de Aragón',
      license: 'CC BY-NC-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
      mime: 'image/png',
      path: `symbols/arasaac/${id}.png`, // immagine inclusa nel tool (nessun blob da salvare)
      keywords: { it: [labelIt], en: [labelEn] },
      addedAt: now(),
    };
  }

  async function seedDefaultProfile() {
    const lang = i18n.language;
    const profileId = newId('p');
    const images = new Map();
    const pageIds = {};
    Object.keys(sampleData.pages).forEach((key) => { pageIds[key] = newId('pg'); });

    const pages = Object.entries(sampleData.pages).map(([key, page]) => {
      const cells = page.cells.map((symbolKey, index) => {
        const item = sampleData.symbols[symbolKey] || sampleData.folders[symbolKey];
        let imageId = null;
        if (item.arasaac) {
          const image = arasaacImage(item.arasaac, item.label.it, item.label.en);
          images.set(image.id, image);
          imageId = image.id;
        }
        const isFolder = item.type === 'folder';
        return {
          id: newId('c'),
          row: Math.floor(index / DEFAULT_COLS),
          col: index % DEFAULT_COLS,
          kind: isFolder ? 'folder' : 'symbol',
          label: item.label[lang] ?? item.label.it,
          speak: null,
          imageId,
          wordType: isFolder ? null : item.type,
          color: null,
          targetPageId: isFolder ? pageIds[item.target] : null,
          hidden: false,
          locked: false,
          audioId: null,
        };
      });
      return {
        id: pageIds[key],
        profileId,
        title: page.title[lang] ?? page.title.it,
        grid: { rows: Math.ceil(cells.length / DEFAULT_COLS), cols: DEFAULT_COLS },
        contextIds: [],
        cells,
        updatedAt: now(),
      };
    });

    const profile = {
      id: profileId,
      name: '',
      kind: 'child',
      language: lang,
      homePageId: pageIds[sampleData.homePage],
      activeContextIds: [],
      createdAt: now(),
      updatedAt: now(),
    };

    await storage.putRecords('images', [...images.values()]);
    await storage.putRecords('pages', pages);
    await storage.putRecord('profiles', profile);
    await storage.set('activeProfileId', profileId);
    return profile;
  }

  // ---------- Caricamento ----------

  async function load() {
    let profileId = await storage.get('activeProfileId');
    let profile = profileId ? await storage.getRecord('profiles', profileId) : null;
    if (!profile) profile = await seedDefaultProfile();
    profileId = profile.id;
    const [pages, images] = await Promise.all([
      storage.getAllRecords('pages'),
      storage.getAllRecords('images'),
    ]);
    model.profile = profile;
    model.pages = new Map(pages.filter((p) => p.profileId === profileId).map((p) => [p.id, p]));
    model.images = new Map(images.map((img) => [img.id, img]));
    return model;
  }

  // ---------- Lettura ----------

  function page(id) {
    return model.pages.get(id) || null;
  }

  // Celle in ordine di lettura (riga, poi colonna)
  function orderedCells(pageRecord, { includeHidden = false } = {}) {
    return [...pageRecord.cells]
      .filter((cell) => includeHidden || !cell.hidden)
      .sort((a, b) => (a.row - b.row) || (a.col - b.col));
  }

  function findCell(cellId) {
    for (const p of model.pages.values()) {
      const cell = p.cells.find((c) => c.id === cellId);
      if (cell) return { page: p, cell };
    }
    return null;
  }

  // URL da usare in <img>: file incluso nel tool oppure blob salvato sul dispositivo
  function imageUrl(imageId) {
    if (!imageId) return null;
    const image = model.images.get(imageId);
    if (!image) return null;
    if (image.path) return image.path;
    if (image.blob) {
      if (!objectUrls.has(imageId)) objectUrls.set(imageId, URL.createObjectURL(image.blob));
      return objectUrls.get(imageId);
    }
    return null;
  }

  // ---------- Modifica ----------

  async function savePage(pageRecord) {
    pageRecord.updatedAt = now();
    model.pages.set(pageRecord.id, pageRecord);
    await storage.putRecord('pages', pageRecord);
  }

  // Ricompatta le posizioni in ordine di lettura (dopo spostamenti o cancellazioni)
  function renumber(pageRecord) {
    const cols = pageRecord.grid.cols || DEFAULT_COLS;
    const ordered = [...pageRecord.cells].sort((a, b) => (a.row - b.row) || (a.col - b.col));
    ordered.forEach((cell, index) => {
      cell.row = Math.floor(index / cols);
      cell.col = index % cols;
    });
    pageRecord.grid.rows = Math.max(1, Math.ceil(ordered.length / cols));
  }

  async function updateCell(pageId, cellId, changes) {
    const p = page(pageId);
    const cell = p && p.cells.find((c) => c.id === cellId);
    if (!cell) return null;
    Object.assign(cell, changes);
    await savePage(p);
    return cell;
  }

  async function addCell(pageId, fields) {
    const p = page(pageId);
    if (!p) return null;
    const cols = p.grid.cols || DEFAULT_COLS;
    const index = p.cells.length;
    const cell = {
      id: newId('c'),
      row: Math.floor(index / cols),
      col: index % cols,
      kind: 'symbol',
      label: '',
      speak: null,
      imageId: null,
      wordType: 'noun',
      color: null,
      targetPageId: null,
      hidden: false,
      locked: false,
      audioId: null,
      ...fields,
    };
    p.cells.push(cell);
    renumber(p);
    await savePage(p);
    return cell;
  }

  async function addFolder(pageId, title) {
    const folderPage = {
      id: newId('pg'),
      profileId: model.profile.id,
      title,
      grid: { rows: 1, cols: DEFAULT_COLS },
      contextIds: [],
      cells: [],
      updatedAt: now(),
    };
    await savePage(folderPage);
    const cell = await addCell(pageId, {
      kind: 'folder', label: title, wordType: null, targetPageId: folderPage.id,
    });
    return { cell, page: folderPage };
  }

  async function deleteCell(pageId, cellId) {
    const p = page(pageId);
    if (!p) return;
    p.cells = p.cells.filter((c) => c.id !== cellId);
    renumber(p);
    await savePage(p);
  }

  // Sposta una cella di una posizione (in ordine di lettura): -1 prima, +1 dopo
  async function moveCell(pageId, cellId, delta) {
    const p = page(pageId);
    if (!p) return;
    const ordered = [...p.cells].sort((a, b) => (a.row - b.row) || (a.col - b.col));
    const index = ordered.findIndex((c) => c.id === cellId);
    const target = index + delta;
    if (index < 0 || target < 0 || target >= ordered.length) return;
    [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
    const cols = p.grid.cols || DEFAULT_COLS;
    ordered.forEach((cell, i) => {
      cell.row = Math.floor(i / cols);
      cell.col = i % cols;
    });
    await savePage(p);
  }

  async function addImage(fields) {
    const image = { id: newId('img'), addedAt: now(), ...fields };
    model.images.set(image.id, image);
    await storage.putRecord('images', image);
    return image;
  }

  // Salva un'immagine con id stabile (es. img_ar_2462): se esiste già sul dispositivo la riusa
  async function saveImage(record) {
    if (model.images.has(record.id)) return model.images.get(record.id);
    const image = { addedAt: now(), ...record };
    model.images.set(image.id, image);
    await storage.putRecord('images', image);
    return image;
  }

  window.PicSpeak.data = {
    WORD_TYPES,
    load,
    get profile() { return model.profile; },
    get homePageId() { return model.profile ? model.profile.homePageId : null; },
    page,
    orderedCells,
    findCell,
    imageUrl,
    image: (id) => model.images.get(id) || null,
    updateCell,
    addCell,
    addFolder,
    deleteCell,
    moveCell,
    addImage,
    saveImage,
    allImages: () => [...model.images.values()],
  };
})();
