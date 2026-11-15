/*
 * Controllo grafico automatico (strumento di sviluppo, non caricato dall'app).
 * Da incollare nella console del browser, o caricare con <script src="dev/verifica-layout.js">
 * (compatibile con la Content-Security-Policy): definisce window.verificaLayout() e restituisce l'elenco
 * degli elementi che escono dal proprio contenitore (testo o immagine fuori dal bordo,
 * testo tagliato senza puntini, celle che si sovrappongono).
 */
window.verificaLayout = () => {
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

  // Contrasto tra testo e sfondo (WCAG: almeno 4,5:1) per parole delle tessere e percorso
  function rgb(str) {
    const m = str.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const [r, g, b, a = 1] = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
    return { r, g, b, a };
  }
  function luminance({ r, g, b }) {
    const f = (v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  }
  function backgroundOf(node) {
    for (let el = node; el; el = el.parentElement) {
      const c = rgb(getComputedStyle(el).backgroundColor);
      if (c && c.a > 0.5) return c;
    }
    return { r: 255, g: 255, b: 255, a: 1 };
  }
  document.querySelectorAll('.symbol-cell .symbol-label, .sentence-chip .symbol-label, .crumbs .crumb').forEach((label) => {
    if (!label.offsetParent || !label.textContent.trim()) return;
    const fg = rgb(getComputedStyle(label).color);
    if (!fg) return;
    const l1 = luminance(fg);
    const l2 = luminance(backgroundOf(label));
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    if (ratio < 4.5) problems.push(`Contrasto basso (${ratio.toFixed(1)}:1) per "${label.textContent.trim()}"`);
  });

  // Impostazioni: nessuno spazio vuoto anomalo sotto il testo di una voce
  document.querySelectorAll('.setting-text').forEach((text) => {
    if (!text.offsetParent) return;
    const content = [...text.children].reduce((sum, child) => sum + child.getBoundingClientRect().height, 0);
    if (text.getBoundingClientRect().height > content + 12) {
      problems.push(`Impostazioni – spazio vuoto sotto "${text.firstElementChild?.textContent}"`);
    }
  });

  // Barre: icone dentro i pulsanti, percorso dentro la sua pillola
  document.querySelectorAll('.action-btn, .lock-btn, .adult-btn, .home-btn').forEach((btn) => {
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
};
window.verificaLayout();
