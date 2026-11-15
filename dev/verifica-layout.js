/*
 * Controllo grafico automatico (strumento di sviluppo, non caricato dall'app).
 * Da incollare nella console del browser, o eseguire in un test: restituisce l'elenco
 * degli elementi che escono dal proprio contenitore (testo o immagine fuori dal bordo,
 * testo tagliato senza puntini, celle che si sovrappongono).
 */
(() => {
  const TOLERANCE = 1; // pixel
  const problems = [];

  function inside(child, parent, label) {
    const c = child.getBoundingClientRect();
    const p = parent.getBoundingClientRect();
    const style = getComputedStyle(parent);
    // Il contenuto deve restare dentro il bordo interno (bordo escluso)
    const left = p.left + parseFloat(style.borderLeftWidth);
    const right = p.right - parseFloat(style.borderRightWidth);
    const top = p.top + parseFloat(style.borderTopWidth);
    const bottom = p.bottom - parseFloat(style.borderBottomWidth);
    if (c.width === 0 || c.height === 0) return;
    if (c.left < left - TOLERANCE || c.right > right + TOLERANCE
      || c.top < top - TOLERANCE || c.bottom > bottom + TOLERANCE) {
      problems.push(`${label}: "${(child.textContent || child.getAttribute('src') || '').trim()}" esce dal riquadro`);
    }
  }

  document.querySelectorAll('.symbol-cell, .sentence-chip').forEach((box) => {
    const kind = box.classList.contains('sentence-chip') ? 'Frase' : 'Cella';
    const label = box.querySelector('.symbol-label');
    const image = box.querySelector('.symbol-image img') || box.querySelector('.symbol-image');
    if (label && getComputedStyle(label).position !== 'absolute') {
      inside(label, box, `${kind} – parola`);
      const ls = getComputedStyle(label);
      if (label.scrollWidth > label.clientWidth + TOLERANCE && ls.textOverflow !== 'ellipsis') {
        problems.push(`${kind} – parola "${label.textContent}" tagliata`);
      }
    }
    if (image && getComputedStyle(image).display !== 'none') inside(image, box, `${kind} – immagine`);
  });

  // Barre: icone dentro i pulsanti, percorso dentro la sua pillola
  document.querySelectorAll('.action-btn, .lock-btn, .adult-btn').forEach((btn) => {
    const icon = btn.querySelector('svg');
    if (icon && btn.offsetParent) inside(icon, btn, 'Pulsante – icona');
  });
  const crumbs = document.querySelector('.crumbs');
  if (crumbs && crumbs.offsetParent) {
    crumbs.querySelectorAll('.crumb, .crumb-sep').forEach((part) => {
      if (getComputedStyle(part).display !== 'none') inside(part, crumbs, 'Percorso');
    });
  }

  // Celle della griglia che si sovrappongono
  const cells = [...document.querySelectorAll('.symbol-cell')].map((el) => [el, el.getBoundingClientRect()]);
  for (let i = 0; i < cells.length; i += 1) {
    for (let j = i + 1; j < cells.length; j += 1) {
      const a = cells[i][1];
      const b = cells[j][1];
      if (a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1) {
        problems.push(`Celle sovrapposte: ${cells[i][0].dataset.id} / ${cells[j][0].dataset.id}`);
      }
    }
  }
  return problems;
})();
