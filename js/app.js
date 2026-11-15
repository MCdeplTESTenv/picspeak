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
  const MIN_COMFORT_WIDTH = 76;
  const MIN_ZOOM_WIDTH = 90; // con − non si scende sotto questa larghezza di tessera

  function gridMetrics() {
    const style = getComputedStyle(el.grid);
    return {
      count: el.grid.childElementCount,
      gap: parseFloat(style.columnGap) || 0,
      width: el.grid.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight),
      height: el.grid.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom),
    };
  }

  // Numero di colonne "automatico": celle il più possibile grandi e quadrate nello spazio disponibile
  function autoColumns() {
    const { count, gap, width, height } = gridMetrics();
    if (!count) return 1;
    let best = { cols: 1, size: 0 };
    for (let cols = 1; cols <= count; cols += 1) {
      const rows = Math.ceil(count / cols);
      const cellW = (width - gap * (cols - 1)) / cols;
      const cellH = (height - gap * (rows - 1)) / rows;
      // Celle mai più strette di una misura comoda: su schermi bassi la griglia scorre invece di stringersi
      if (cols > 1 && cellW < MIN_COMFORT_WIDTH) continue;
      // Se le righe non entrano senza scorrere, la soluzione vale un po' meno (si preferisce vedere tutto)
      const size = cellH >= MIN_COMFORT_CELL
        ? Math.min(cellW, cellH)
        : Math.min(cellW, MIN_COMFORT_CELL) * 0.85;
      // A parità di misura si preferiscono più colonne (meno righe da scorrere)
      if (size > best.size || (size === best.size && cols > best.cols)) best = { cols, size };
    }
    return best.cols;
  }

  // Massimo di colonne che lo schermo permette senza tessere troppo strette per le parole
  function maxColumns() {
    const { count, gap, width } = gridMetrics();
    return Math.max(1, Math.min(count || 1, Math.floor((width + gap) / (MIN_ZOOM_WIDTH + gap))));
  }

  // Colonne effettive: quelle scelte con lo zoom (data-columns su <html>) oppure automatiche
  function currentColumns() {
    const fixed = parseInt(document.documentElement.dataset.columns, 10);
    if (fixed > 0) return Math.max(1, Math.min(fixed, maxColumns()));
    return autoColumns();
  }

  function layoutGrid() {
    const { count, gap, width, height } = gridMetrics();
    if (!count) return;
    const cols = currentColumns();
    const zoomed = parseInt(document.documentElement.dataset.columns, 10) > 0;
    const rows = Math.ceil(count / cols);
    el.grid.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
    const cellW = (width - gap * (cols - 1)) / cols;
    const fitH = (height - gap * (rows - 1)) / rows;
    // Con lo zoom le tessere restano quasi quadrate (la griglia scorre); in automatico riempiono lo spazio
    const cellH = zoomed ? Math.max(fitH, Math.min(cellW, height), MIN_COMFORT_CELL * 0.8)
      : Math.max(fitH, MIN_COMFORT_CELL);
    el.grid.style.gridAutoRows = `${cellH}px`;
    // Immagine ed etichetta proporzionate al lato minore della cella
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
      label.classList.remove('is-hyphenated');
      while (overflows() && size > 10) {
        size -= 1;
        label.style.fontSize = `${size}px`;
      }
      // Ultima risorsa su tessere molto strette: sillabazione con il trattino (es. COSTRU-ZIONI),
      // mai parole che escono dal bordo o restano tagliate
      if (overflows()) label.classList.add('is-hyphenated');
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

  // "Scuoti per tornare alla Home" (opzione in Impostazioni → Aspetto → Disposizione e tocco).
  // Servono due scosse decise entro un secondo: un movimento normale del tablet non basta.
  // Effetto: torna alla Home e cancella la frase.
  function bindShakeToHome() {
    if (!('DeviceMotionEvent' in window)) return;
    const THRESHOLD = 22; // variazione di accelerazione (m/s²) considerata una scossa
    let last = null;
    let peaks = [];
    let cooldownUntil = 0;
    window.addEventListener('devicemotion', (event) => {
      if (document.documentElement.dataset.shakeHome !== 'on' || state.mode !== 'child') return;
      const a = event.accelerationIncludingGravity;
      if (!a || a.x == null) return;
      const now = Date.now();
      if (last) {
        const delta = Math.abs(a.x - last.x) + Math.abs(a.y - last.y) + Math.abs(a.z - last.z);
        if (delta > THRESHOLD && now > cooldownUntil) {
          peaks = peaks.filter((t) => now - t < 1000);
          peaks.push(now);
          if (peaks.length >= 2) {
            peaks = [];
            cooldownUntil = now + 1500;
            // Scossa = "ricomincia": torna alla Home e svuota la frase, pronta per una nuova
            state.sentence = [];
            renderSentence();
            if (state.pageId !== sampleData.homePage) goToPage(sampleData.homePage);
          }
        }
      }
      last = { x: a.x, y: a.y, z: a.z };
    });
  }

  // "Spingi via": un colpo deciso del dito sulla striscia frase (in alto o in basso, oppure
  // di lato se la frase è corta e non scorre) cancella tutta la frase.
  let swallowClick = false;
  function bindSwipeToClear() {
    let start = null;
    el.strip.addEventListener('pointerdown', (event) => {
      start = { x: event.clientX, y: event.clientY, t: Date.now() };
    });
    el.strip.addEventListener('pointerup', (event) => {
      // Il gesto è attivo solo se abilitato in Impostazioni → Aspetto → Disposizione e tocco
      if (document.documentElement.dataset.swipeClear !== 'on') { start = null; return; }
      if (!start || !state.sentence.length) { start = null; return; }
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      const fast = Date.now() - start.t < 700;
      const scrolls = el.strip.scrollWidth > el.strip.clientWidth + 1;
      const vertical = Math.abs(dy) > 45 && Math.abs(dy) > Math.abs(dx) * 1.2;
      const horizontal = !scrolls && Math.abs(dx) > 90 && Math.abs(dx) > Math.abs(dy) * 1.5;
      start = null;
      if (fast && (vertical || horizontal)) {
        swallowClick = true;
        setTimeout(() => { swallowClick = false; }, 300);
        clearSentenceAnimated(vertical ? (dy < 0 ? 'up' : 'down') : (dx < 0 ? 'left' : 'right'));
      }
    });
    el.strip.addEventListener('pointercancel', () => { start = null; });
  }

  function clearSentenceAnimated(direction) {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      state.sentence = [];
      renderSentence();
      return;
    }
    el.strip.dataset.clearing = direction;
    setTimeout(() => {
      delete el.strip.dataset.clearing;
      state.sentence = [];
      renderSentence();
    }, 160);
  }

  function bindEvents() {
    el.grid.addEventListener('click', onCellTap);
    el.strip.addEventListener('click', (event) => {
      if (swallowClick) return;
      onChipTap(event);
    });
    bindSwipeToClear();
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
    bindShakeToHome();
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
    autoColumns,
    currentColumns,
    maxColumns,
    itemCount: () => el.grid.childElementCount,
    get mode() { return state.mode; },
  };
})();
