/*
 * Spostamento delle tessere tenendole premute (solo con le impostazioni sbloccate).
 * Come sulla schermata delle app di telefono e tablet: si tiene premuta una tessera
 * per mezzo secondo, la tessera "si stacca" e segue il dito (o il mouse); le altre si
 * spostano per farle posto. Al rilascio il nuovo ordine viene salvato sul dispositivo.
 * Un tocco breve continua ad aprire la modifica della tessera (editor.js).
 */
(function () {
  'use strict';

  const { data, app } = window.PicSpeak;

  const HOLD_MS = 500; // tempo di pressione per staccare la tessera
  const MOVE_TOLERANCE = 10; // px: oltre questo movimento prima del tempo è uno scorrimento, non una presa
  const EDGE = 56; // px dal bordo della griglia in cui la griglia scorre da sola
  const EDGE_SPEED = 10; // px per fotogramma

  const grid = document.getElementById('symbol-grid');

  let pending = null; // pressione in attesa: { pointerId, cell, x, y, timer }
  let drag = null; // trascinamento in corso: { pointerId, cell, ghost, offsetX, offsetY, x, y, frame }
  let suppressClick = false;

  function isEditing() {
    return app.mode === 'adult';
  }

  // Tessere spostabili: tutte quelle della scheda, non il "+" né la copia che segue il dito
  function movableCells() {
    return [...grid.querySelectorAll('.symbol-cell[data-id]:not(.reorder-ghost)')];
  }

  function cancelPending() {
    if (!pending) return;
    clearTimeout(pending.timer);
    pending = null;
  }

  function onPointerDown(event) {
    if (!isEditing() || drag || pending) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const cell = event.target.closest('.symbol-cell[data-id]');
    if (!cell || !grid.contains(cell)) return;
    // Posizioni bloccate (per tutte le tessere o per questa tessera): niente spostamento
    if (document.documentElement.dataset.lockPositions === 'on' || cell.classList.contains('is-locked-cell')) return;
    pending = {
      pointerId: event.pointerId,
      cell,
      x: event.clientX,
      y: event.clientY,
      timer: setTimeout(() => startDrag(), HOLD_MS),
    };
  }

  function startDrag() {
    if (!pending) return;
    const { cell, pointerId, x, y } = pending;
    pending = null;
    if (!cell.isConnected || !isEditing()) return;
    const rect = cell.getBoundingClientRect();
    // Copia della tessera che segue il dito; l'originale resta come segnaposto attenuato
    const ghost = cell.cloneNode(true);
    ghost.classList.add('reorder-ghost');
    ghost.classList.remove('is-pressed');
    ghost.removeAttribute('data-id');
    ghost.setAttribute('aria-hidden', 'true');
    ghost.tabIndex = -1;
    ghost.style.width = `${rect.width}px`;
    ghost.style.height = `${rect.height}px`;
    ghost.style.left = `${rect.left}px`;
    ghost.style.top = `${rect.top}px`;
    grid.append(ghost);
    // Griglia fissa: durante lo spostamento le tessere scorrono in ordine di lettura, così il segnaposto
    // si vede muovere; al rilascio le posizioni si salvano e la griglia fissa torna com'era
    grid.querySelectorAll('.symbol-cell').forEach((node) => {
      node.style.gridRow = '';
      node.style.gridColumn = '';
    });
    cell.classList.add('is-drag-placeholder');
    document.body.classList.add('is-reordering');
    drag = {
      pointerId, cell, ghost, x, y, offsetX: x - rect.left, offsetY: y - rect.top, frame: 0,
    };
    suppressClick = true;
    // Breve vibrazione dove disponibile (Android): conferma che la tessera si è staccata
    if (navigator.vibrate) {
      try { navigator.vibrate(20); } catch (e) { /* non disponibile */ }
    }
    drag.frame = requestAnimationFrame(autoScroll);
  }

  function moveGhost() {
    drag.ghost.style.left = `${drag.x - drag.offsetX}px`;
    drag.ghost.style.top = `${drag.y - drag.offsetY}px`;
  }

  // Sposta il segnaposto nella posizione della tessera sotto il dito
  function updatePlaceholder() {
    const under = document.elementFromPoint(drag.x, drag.y);
    const target = under && under.closest('.symbol-cell');
    if (!target || !grid.contains(target) || target === drag.cell || target.classList.contains('reorder-ghost')) return;
    if (target.dataset.action === 'add') {
      // Sopra il "+": la tessera va in fondo
      if (target.previousElementSibling !== drag.cell) grid.insertBefore(drag.cell, target);
      return;
    }
    const cells = movableCells();
    const from = cells.indexOf(drag.cell);
    const to = cells.indexOf(target);
    if (from < 0 || to < 0) return;
    if (from < to) target.after(drag.cell);
    else target.before(drag.cell);
  }

  // Vicino al bordo alto o basso la griglia scorre da sola, per portare la tessera più lontano
  function autoScroll() {
    if (!drag) return;
    const rect = grid.getBoundingClientRect();
    let step = 0;
    if (drag.y < rect.top + EDGE) step = -EDGE_SPEED;
    else if (drag.y > rect.bottom - EDGE) step = EDGE_SPEED;
    if (step) {
      const before = grid.scrollTop;
      grid.scrollTop += step;
      if (grid.scrollTop !== before) updatePlaceholder();
    }
    drag.frame = requestAnimationFrame(autoScroll);
  }

  function onPointerMove(event) {
    if (pending && event.pointerId === pending.pointerId) {
      // Il dito si è mosso prima del tempo: è uno scorrimento della griglia
      if (Math.hypot(event.clientX - pending.x, event.clientY - pending.y) > MOVE_TOLERANCE) cancelPending();
      return;
    }
    if (!drag || event.pointerId !== drag.pointerId) return;
    event.preventDefault();
    drag.x = event.clientX;
    drag.y = event.clientY;
    moveGhost();
    updatePlaceholder();
  }

  async function finishDrag(save) {
    if (!drag) return;
    const { cell, ghost, frame } = drag;
    drag = null;
    cancelAnimationFrame(frame);
    ghost.remove();
    cell.classList.remove('is-drag-placeholder');
    document.body.classList.remove('is-reordering');
    // Il "click" che segue il rilascio non deve aprire la modifica della tessera
    setTimeout(() => { suppressClick = false; }, 400);
    const pageId = app.pageId;
    if (save && pageId && isEditing()) {
      await data.reorderCells(pageId, movableCells().map((node) => node.dataset.id));
    }
    app.renderGrid();
  }

  function onPointerUp(event) {
    if (pending && event.pointerId === pending.pointerId) cancelPending();
    if (drag && event.pointerId === drag.pointerId) finishDrag(true);
  }

  function onPointerCancel(event) {
    if (pending && event.pointerId === pending.pointerId) cancelPending();
    // Interruzione del sistema: si tiene l'ordine già visibile sullo schermo
    if (drag && event.pointerId === drag.pointerId) finishDrag(true);
  }

  grid.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove, { passive: false });
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointercancel', onPointerCancel);
  // Con il dito, durante il trascinamento la pagina non deve scorrere
  window.addEventListener('touchmove', (event) => {
    if (drag) event.preventDefault();
  }, { passive: false });
  // Nessun menu contestuale tenendo premuto (Android, mouse destro) con le impostazioni sbloccate
  grid.addEventListener('contextmenu', (event) => {
    if (isEditing()) event.preventDefault();
  });
  // Esc annulla lo spostamento senza salvare
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && drag) finishDrag(false);
  });
  // Blocca il click dopo il rilascio (prima che arrivi al gestore della griglia)
  window.addEventListener('click', (event) => {
    if (!suppressClick) return;
    if (grid.contains(event.target)) {
      event.stopPropagation();
      event.preventDefault();
    }
    suppressClick = false;
  }, true);
  // Uscendo dalla pagina o cambiando modalità a metà gesto non resta nulla in sospeso
  document.addEventListener('visibilitychange', () => {
    cancelPending();
    if (document.hidden) finishDrag(true);
  });
})();
