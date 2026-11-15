// Converte gli SVG scelti in WebP 256 px (sfondo trasparente) con Chromium
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const sel = JSON.parse(fs.readFileSync('/tmp/claude-0/build/selection.json', 'utf8'));
const SRC = { mulberry: '/tmp/claude-0/src/mulberry-symbols/EN', openmoji: '/tmp/claude-0/src/openmoji/color/svg' };
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent('<html><body></body></html>');
  for (const pack of ['mulberry', 'openmoji']) {
    const outDir = `/tmp/claude-0/build/out/${pack}`;
    fs.mkdirSync(outDir, { recursive: true });
    let total = 0;
    for (const item of sel[pack]) {
      const svg = fs.readFileSync(path.join(SRC[pack], `${item.id}.svg`), 'utf8');
      const b64 = await page.evaluate(async (svgText) => {
        const blob = new Blob([svgText], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const img = new Image();
        await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
        const S = 256;
        const c = document.createElement('canvas'); c.width = S; c.height = S;
        const ctx = c.getContext('2d');
        const w = img.naturalWidth || S; const h = img.naturalHeight || S;
        const k = Math.min(S / w, S / h);
        ctx.drawImage(img, (S - w * k) / 2, (S - h * k) / 2, w * k, h * k);
        return c.toDataURL('image/webp', 0.88).split(',')[1];
      }, svg);
      const buf = Buffer.from(b64, 'base64');
      item.file = `${item.id.replace(/[^A-Za-z0-9_-]/g, '_')}.webp`;
      fs.writeFileSync(path.join(outDir, item.file), buf);
      total += buf.length;
    }
    console.log(pack, sel[pack].length, (total / 1048576).toFixed(2), 'MB');
  }
  fs.writeFileSync('/tmp/claude-0/build/selection-files.json', JSON.stringify(sel));
  await browser.close();
})();
