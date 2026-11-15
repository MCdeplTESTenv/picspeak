/*
 * PicSpeak – Tappa 1: griglia di simboli, voce al tocco, striscia frase.
 * Modalità utente: nessun elemento modifica i dati salvati.
 */
(function () {
  'use strict';

  const { i18n, sampleData, speech } = window.PicSpeak;
  const t = i18n.t;

  // Limite di simboli nella frase, per tenerla leggibile su tablet
  const MAX_SENTENCE_LENGTH = 12;

  const state = {
    // 'child' = modalità utente (nessuna modifica possibile); 'adult' arriverà nella Tappa 2
    mode: 'child',
    pageId: sampleData.homePage,
    sentence: [], // elenco di identificativi di simboli
  };

  const el = {
    grid: document.getElementById('symbol-grid'),
    strip: document.getElementById('sentence-strip'),
    title: document.getElementById('page-title'),
    speak: document.getElementById('btn-speak'),
    backspace: document.getElementById('btn-backspace'),
    clear: document.getElementById('btn-clear'),
    home: document.getElementById('btn-home'),
    crumbs: document.getElementById('crumbs'),
  };

  // Restituisce l'etichetta nella lingua corrente (con l'italiano come riserva)
  function labelOf(item) {
    return item.label[i18n.language] ?? item.label.it;
  }

  function findItem(id) {
    return sampleData.symbols[id] || sampleData.folders[id] || null;
  }

  // Crea il contenuto visivo (immagine + etichetta) condiviso da celle e striscia
  function buildFace(item, sizeClass) {
    const fragment = document.createDocumentFragment();
    const image = document.createElement('span');
    image.className = `symbol-image ${sizeClass}`;
    image.setAttribute('aria-hidden', 'true');
    const src = sampleData.imageOf(item);
    if (src) {
      const img = document.createElement('img');
      img.src = src;
      img.alt = '';
      img.draggable = false;
      img.decoding = 'async';
      // Se l'immagine non si carica, resta l'emoji: la cella continua a funzionare
      img.addEventListener('error', () => { image.textContent = item.emoji; }, { once: true });
      image.append(img);
    } else {
      image.textContent = item.emoji;
    }
    const label = document.createElement('span');
    label.className = 'symbol-label';
    label.textContent = labelOf(item);
    fragment.append(image, label);
    return fragment;
  }

  function renderGrid() {
    const page = sampleData.pages[state.pageId];
    el.title.textContent = page.title[i18n.language] ?? page.title.it;
    // Nella Home il percorso mostra solo "HOME"; nelle altre pagine "HOME › pagina"
    const isHome = state.pageId === sampleData.homePage;
    el.crumbs.classList.toggle('is-home', isHome);
    if (isHome) el.home.setAttribute('aria-current', 'page');
    else el.home.removeAttribute('aria-current');

    const cells = page.cells.map((id) => {
      const item = findItem(id);
      if (!item) return null;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `symbol-cell type-${item.type}`;
      button.dataset.id = id;
      if (item.type === 'folder') {
        button.setAttribute('aria-label', `${t('openPage')}: ${labelOf(item)}`);
      }
      button.append(buildFace(item, 'size-cell'));
      return button;
    }).filter(Boolean);

    el.grid.replaceChildren(...cells);
    el.grid.dataset.count = String(cells.length);
    layoutGrid();
  }

  // Sceglie il numero di colonne che rende le celle più grandi possibile
  // nello spazio disponibile (poche celle = celle grandi, come chiede la logopedista)
  const MIN_COMFORT_CELL = 88;
  function layoutGrid() {
    const count = el.grid.childElementCount;
    if (!count) return;
    const style = getComputedStyle(el.grid);
    const gap = parseFloat(style.columnGap) || 0;
    const width = el.grid.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const height = el.grid.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
    let best = { cols: 1, size: 0 };
    for (let cols = 1; cols <= count; cols += 1) {
      const rows = Math.ceil(count / cols);
      const cellW = (width - gap * (cols - 1)) / cols;
      const cellH = (height - gap * (rows - 1)) / rows;
      // Conta il lato minore: celle il più possibile grandi e quadrate
      const size = Math.min(cellW, cellH);
      if (size > best.size) best = { cols, size };
    }
    const rows = Math.ceil(count / best.cols);
    el.grid.style.gridTemplateColumns = `repeat(${best.cols}, minmax(0, 1fr))`;
    // Se lo schermo è troppo piccolo, le righe restano comode e la griglia scorre
    const fitH = (height - gap * (rows - 1)) / rows;
    const cellH = Math.max(fitH, MIN_COMFORT_CELL);
    el.grid.style.gridAutoRows = `${cellH}px`;
    // Immagine ed etichetta proporzionate al lato minore della cella
    const cellW = (width - gap * (best.cols - 1)) / best.cols;
    el.grid.style.setProperty('--cell-size', `${Math.min(cellW, cellH)}px`);
    fitLabels();
  }

  // Riduce il carattere delle parole che non entrano nella cella (mai parole spezzate a metà).
  // Massimo due righe; si scende fino a 10 px, poi interviene il troncamento con i puntini.
  function fitLabels() {
    el.grid.querySelectorAll('.symbol-label').forEach((label) => {
      label.style.fontSize = '';
      if (getComputedStyle(label).position === 'absolute') return;
      let size = parseFloat(getComputedStyle(label).fontSize);
      const lineHeight = () => parseFloat(getComputedStyle(label).lineHeight) || size * 1.15;
      const overflows = () => label.scrollWidth > label.clientWidth + 1
        || label.scrollHeight > lineHeight() * 2 + 2
        || longestWordTooWide(label);
      while (overflows() && size > 10) {
        size -= 1;
        label.style.fontSize = `${size}px`;
      }
    });
  }

  // Una parola più larga della cella verrebbe spezzata: la misuriamo a parte
  const measurer = document.createElement('span');
  measurer.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;left:-9999px;top:0';
  document.body.append(measurer);
  function longestWordTooWide(label) {
    const style = getComputedStyle(label);
    measurer.style.font = style.font;
    measurer.style.letterSpacing = style.letterSpacing;
    measurer.style.textTransform = style.textTransform;
    const available = label.parentElement.clientWidth
      - parseFloat(getComputedStyle(label.parentElement).paddingLeft)
      - parseFloat(getComputedStyle(label.parentElement).paddingRight);
    return label.textContent.split(/\s+/).some((word) => {
      measurer.textContent = word;
      return measurer.offsetWidth > available + 1;
    });
  }

  function renderSentence() {
    const chips = state.sentence.map((id, index) => {
      const item = findItem(id);
      const li = document.createElement('li');
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = `sentence-chip type-${item.type}`;
      chip.dataset.index = String(index);
      chip.setAttribute('aria-label', state.mode === 'adult'
        ? `${t('removeFromSentence')}: ${labelOf(item)}`
        : labelOf(item));
      chip.append(buildFace(item, 'size-chip'));
      li.append(chip);
      return li;
    });
    el.strip.replaceChildren(...chips);
    el.strip.setAttribute('aria-label', chips.length ? '' : t('sentenceEmpty'));
    const empty = state.sentence.length === 0;
    el.speak.disabled = empty;
    el.backspace.disabled = empty;
    el.clear.disabled = empty;
    // Mantiene visibile l'ultimo simbolo aggiunto
    el.strip.scrollLeft = el.strip.scrollWidth;
  }

  function sentenceText() {
    return state.sentence.map((id) => labelOf(findItem(id))).join(' ');
  }

  function say(text) {
    speech.speak(text, i18n.speechLocale);
  }

  // Breve evidenziazione visiva del tocco (senza animazioni invasive)
  function flash(node) {
    node.classList.add('is-pressed');
    setTimeout(() => node.classList.remove('is-pressed'), 180);
  }

  function goToPage(pageId) {
    if (!sampleData.pages[pageId]) return;
    state.pageId = pageId;
    renderGrid();
    el.grid.scrollTop = 0;
  }

  function onCellTap(event) {
    const cell = event.target.closest('.symbol-cell');
    if (!cell) return;
    const item = findItem(cell.dataset.id);
    flash(cell);
    if (item.type === 'folder') {
      say(labelOf(item));
      goToPage(item.target);
      return;
    }
    say(labelOf(item));
    if (state.sentence.length < MAX_SENTENCE_LENGTH) {
      state.sentence.push(cell.dataset.id);
      renderSentence();
    }
  }

  // Striscia frase: in modalità bambino il tocco ripete solo la parola (nessuna cancellazione
  // accidentale); in modalità adulto il tocco toglie il simbolo dalla frase
  function onChipTap(event) {
    const chip = event.target.closest('.sentence-chip');
    if (!chip) return;
    const index = Number(chip.dataset.index);
    flash(chip);
    if (state.mode === 'adult') {
      state.sentence.splice(index, 1);
      renderSentence();
      return;
    }
    say(labelOf(findItem(state.sentence[index])));
  }

  function applyStaticLabels() {
    i18n.applyTo(document);
    document.title = t('appName');
  }

  // Cambio modalità: 'child' (comunicazione) o 'adult' (modifica, impostazioni)
  function setMode(mode) {
    state.mode = mode === 'adult' ? 'adult' : 'child';
    document.body.classList.toggle('mode-adult', state.mode === 'adult');
    renderSentence();
    layoutGrid();
  }

  // Ridisegna tutti i testi dopo un cambio di lingua
  function refreshTexts() {
    applyStaticLabels();
    renderGrid();
    renderSentence();
  }

  function bindEvents() {
    el.grid.addEventListener('click', onCellTap);
    el.strip.addEventListener('click', onChipTap);
    el.speak.addEventListener('click', () => {
      flash(el.speak);
      say(sentenceText());
    });
    el.backspace.addEventListener('click', () => {
      state.sentence.pop();
      renderSentence();
    });
    el.clear.addEventListener('click', () => {
      state.sentence = [];
      renderSentence();
    });
    el.home.addEventListener('click', () => goToPage(sampleData.homePage));
    // Ricalcola la griglia quando cambia la dimensione o l'orientamento dello schermo
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(layoutGrid, 100);
    });
    // Evita lo zoom con doppio tocco su iOS durante l'uso rapido delle celle
    document.addEventListener('dblclick', (event) => event.preventDefault(), { passive: false });
  }

  applyStaticLabels();
  bindEvents();
  renderGrid();
  renderSentence();

  window.PicSpeak.app = {
    setMode,
    refreshTexts,
    layoutGrid,
    get mode() { return state.mode; },
  };
})();
