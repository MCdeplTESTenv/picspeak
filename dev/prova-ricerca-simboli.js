const { chromium, devices } = require('playwright'); // prova automatica della ricerca simboli (ARASAAC simulato)
const fs = require('fs');
const ROOT = '/home/user/picspeak';
const OUT = '/tmp/claude-0/test/shots';
fs.mkdirSync(OUT, { recursive: true });
const sizes = {
  tablet: { viewport: { width: 1024, height: 768 }, hasTouch: true },
  phone: { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true },
  pc: { viewport: { width: 1440, height: 900 } },
};
// Finta API ARASAAC (il container non la raggiunge): risposte con la stessa forma dell'API reale
async function mockArasaac(context) {
  await context.route('https://api.arasaac.org/**', async (route) => {
    const url = route.request().url();
    if (/\/search\/(mela|apple)/.test(url)) {
      return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' },
        body: JSON.stringify([{ _id: 2462, keywords: [{ keyword: 'mela', type: 2 }] }, { _id: 990001, keywords: [{ keyword: 'mela verde' }] }, { _id: 2445, keywords: [{ keyword: 'mela rossa' }] }, { _id: 8088, keywords: [{ keyword: 'torta di mele' }] }]) });
    }
    if (/\/en\/2462/.test(url)) return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ _id: 2462, keywords: [{ keyword: 'apple' }] }) });
    return route.fulfill({ status: 404, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"error":"not found"}' });
  });
  await context.route('https://static.arasaac.org/**', async (route) => {
    const id = route.request().url().match(/pictograms\/(\d+)\//)[1];
    const file = `${ROOT}/symbols/arasaac/${id === '990001' ? '2462' : id}.png`;
    if (!fs.existsSync(file)) return route.fulfill({ status: 404 });
    return route.fulfill({ status: 200, contentType: 'image/png', headers: { 'access-control-allow-origin': '*' }, body: fs.readFileSync(file) });
  });
  await context.route('https://api.mymemory.translated.net/**', (route) => route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ responseData: { translatedText: 'cat' } }) }));
}
async function verifica(page, label) {
  await page.addScriptTag({ url: '/dev/verifica-layout.js' });
  const problems = await page.evaluate(() => window.verificaLayout());
  // Controlli aggiuntivi per la finestra di ricerca: niente fuori dal riquadro, target ≥ 64 px di lato lungo
  const extra = await page.evaluate(() => {
    const out = [];
    const dlg = document.querySelector('.search-dialog[open]');
    if (dlg) {
      const d = dlg.getBoundingClientRect();
      if (d.right > innerWidth + 1 || d.bottom > innerHeight + 1 || d.left < -1 || d.top < -1) out.push('finestra fuori schermo');
      dlg.querySelectorAll('.search-tile').forEach((tile) => {
        const r = tile.getBoundingClientRect();
        if (r.width < 64 || r.height < 64) out.push(`tessera piccola ${r.width}x${r.height}`);
        const img = tile.querySelector('img');
        if (img) { const i = img.getBoundingClientRect(); if (i.left < r.left - 1 || i.right > r.right + 1 || i.top < r.top - 1 || i.bottom > r.bottom + 1) out.push('immagine fuori tessera'); }
        const lab = tile.querySelector('.search-tile-label').getBoundingClientRect();
        if (lab.right > r.right + 1 || lab.bottom > r.bottom + 1) out.push('parola fuori tessera');
      });
      if (document.documentElement.scrollWidth > innerWidth + 1) out.push('scorrimento orizzontale');
    }
    return out;
  });
  console.log(label, JSON.stringify(problems.concat(extra)));
}
(async () => {
  const browser = await chromium.launch();
  for (const [name, opts] of Object.entries(sizes)) {
    const context = await browser.newContext({ ...opts, baseURL: 'http://127.0.0.1:8123' });
    await mockArasaac(context);
    const page = await context.newPage();
    page.on('pageerror', (e) => console.log('ERRORE', e.message));
    page.on('console', (m) => { if (m.type() === 'error') console.log('console', m.text()); });
    await page.goto('/index.html');
    await page.waitForSelector('.symbol-cell');
    await page.evaluate(() => { PicSpeak.app.setMode('adult'); document.getElementById('adult-bar').hidden = false; document.getElementById('btn-lock').hidden = true; PicSpeak.app.layoutGrid(); });
    await page.waitForTimeout(300);
    // Impostazioni → Simboli: attiva Mulberry e OpenMoji (scaricamento)
    await page.click('#btn-open-settings');
    await page.click('.settings-nav-btn >> nth=2');
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${OUT}/${name}-fonti-prima.png` });
    for (const idx of [1, 2]) {
      await page.locator('.settings-panel .setting-row').nth(idx).locator('button', { hasText: /^(Sì|Attiva|On)$/ }).first().click().catch(async () => {
        await page.locator('.settings-panel .setting-row').nth(idx).locator('.segmented button').first().click();
      });
      await page.waitForTimeout(150);
    }
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${OUT}/${name}-fonti-scarico.png` });
    await page.waitForFunction(() => document.querySelectorAll('.pack-status.is-ready').length === 2, null, { timeout: 120000 });
    await page.screenshot({ path: `${OUT}/${name}-fonti-pronte.png`, fullPage: false });
    await verifica(page, `${name} impostazioni`);
    // Crediti
    await page.click('.settings-nav-btn >> nth=0').catch(async () => { await page.click('#btn-settings-back'); await page.click('.settings-nav-btn >> nth=0'); });
    await page.waitForTimeout(300);
    await page.locator('.credits-list').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${OUT}/${name}-crediti.png` });
    await page.click('#btn-settings-back');
    if (await page.locator('#settings-screen').isVisible()) await page.click('#btn-settings-back');
    // Nuova tessera → Cerca simbolo "mela"
    await page.locator('.symbol-cell').first().click();
    await page.waitForSelector('.editor-dialog[open]');
    await page.click('.editor-search-btn');
    await page.waitForSelector('.search-dialog[open]');
    await page.fill('.search-input', 'mela');
    await page.click('.search-go');
    await page.waitForFunction(() => document.querySelectorAll('.search-group').length >= 3 && !document.querySelector('.search-status'), null, { timeout: 15000 });
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${OUT}/${name}-ricerca-mela.png` });
    await verifica(page, `${name} ricerca`);
    console.log(name, await page.evaluate(() => [...document.querySelectorAll('.search-group')].map((g) => `${g.querySelector('.search-group-name').textContent}:${g.querySelectorAll('.search-tile').length}`).join(' ')));
    // Scegli il primo ARASAAC
    const arasaacTile = page.locator('.search-group', { hasText: 'ARASAAC' }).locator('.search-tile').first();
    await arasaacTile.click();
    await page.waitForSelector('.search-dialog[open]', { state: 'detached' }).catch(() => {});
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${OUT}/${name}-editor-dopo.png` });
    await page.click('.editor-dialog button[type=submit]');
    await page.waitForTimeout(400);
    const img = await page.evaluate(() => PicSpeak.data.allImages().filter((i) => i.blob).map((i) => `${i.id} ${i.source} ${i.license} ${i.mime} ${i.blob.size}`));
    console.log(name, 'salvate:', img);
    // Ricerca offline con parola non nel dizionario e senza risultati
    await page.locator('.symbol-cell').nth(1).click();
    await page.click('.editor-search-btn');
    await page.fill('.search-input', 'zxqw');
    await page.click('.search-go');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${OUT}/${name}-ricerca-vuota.png` });
    // Ricerca "cane" (pacchetti) con rete spenta
    await context.setOffline(true);
    await page.fill('.search-input', 'cane');
    await page.click('.search-go');
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${OUT}/${name}-ricerca-offline.png` });
    await verifica(page, `${name} offline`);
    await context.setOffline(false);
    await context.close();
  }
  await browser.close();
})();
