/*
 * Modalità adulto: accesso protetto (lucchetto da tenere premuto + PIN),
 * uscita manuale o automatica per inattività, pagina delle impostazioni.
 */
(function () {
  'use strict';

  const { i18n, storage, security, install, app, speech } = window.PicSpeak;
  const t = i18n.t;

  const HOLD_MS = 3000;
  const INACTIVITY_MS = 5 * 60 * 1000;

  // Modalità colori disponibili (vedi css/style.css, attributo data-color-mode su <html>)
  const DEFAULT_COLOR_MODE = 'card';
  const COLOR_MODES = [
    { id: 'card', nameKey: 'colorModeCard', descKey: 'colorModeCardDesc' },
    { id: 'sheet', nameKey: 'colorModeSheet', descKey: 'colorModeSheetDesc' },
    { id: 'full', nameKey: 'colorModeFull', descKey: 'colorModeFullDesc' },
    { id: 'border', nameKey: 'colorModeBorder', descKey: 'colorModeBorderDesc' },
    { id: 'none', nameKey: 'colorModeNone', descKey: 'colorModeNoneDesc' },
  ];

  // Colori di sfondo della pagina proposti (il primo è quello predefinito)
  const PAGE_BACKGROUNDS = [
    { id: 'auto', color: '', nameKey: 'bgAuto' },
    { id: 'white', color: '#ffffff', nameKey: 'bgWhite' },
    { id: 'vanilla', color: '#fbfaf7', nameKey: 'bgVanilla' },
    { id: 'grey', color: '#eceef2', nameKey: 'bgGrey' },
    { id: 'sky', color: '#e6f0fb', nameKey: 'bgSky' },
    { id: 'sage', color: '#e9f2ea', nameKey: 'bgSage' },
    { id: 'sand', color: '#f3ebdd', nameKey: 'bgSand' },
    { id: 'night', color: '#1f2430', nameKey: 'bgNight' },
  ];

  // Testo chiaro sugli sfondi scuri, scuro sugli sfondi chiari
  function isDark(hex) {
    const n = parseInt(hex.slice(1), 16);
    const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    return (0.299 * r + 0.587 * g + 0.114 * b) < 140;
  }

  function applyPageBackground(color) {
    const root = document.documentElement.style;
    if (!color || !/^#[0-9a-f]{6}$/i.test(color)) {
      root.removeProperty('--page-bg');
      root.removeProperty('--page-text');
      root.removeProperty('--page-icon-filter');
      delete document.documentElement.dataset.pageDark;
      return;
    }
    root.setProperty('--page-bg', color);
    root.setProperty('--page-text', isDark(color) ? '#f4f5f7' : '#1a1d24');
    root.setProperty('--page-icon-filter', isDark(color) ? 'invert(1)' : 'none');
    document.documentElement.dataset.pageDark = String(isDark(color));
  }

  function applyColorMode(mode) {
    document.documentElement.dataset.colorMode = mode;
    app.layoutGrid();
  }

  const el = {
    lock: document.getElementById('btn-lock'),
    adultBar: document.getElementById('adult-bar'),
    openSettings: document.getElementById('btn-open-settings'),
    exitAdult: document.getElementById('btn-exit-adult'),
    dialog: document.getElementById('pin-dialog'),
    settings: document.getElementById('settings-screen'),
    settingsBody: document.getElementById('settings-body'),
    settingsBack: document.getElementById('btn-settings-back'),
  };

  let inactivityTimer = null;
  let closeCurrentDialog = null;

  // ---------- Finestra di dialogo generica (PIN, recupero, messaggi) ----------

  /*
   * cfg: { title, help, code, fields: [{ id, label, text }], primary, secondary, link, onSubmit }
   * onSubmit(values) restituisce: una stringa = errore (la finestra resta aperta),
   * altrimenti il risultato con cui chiudere. Risolve null se annullata.
   */
  function runDialog(cfg) {
    return new Promise((resolve) => {
      const dialog = el.dialog;
      const form = document.createElement('form');
      form.className = 'dialog-form';
      form.noValidate = true;

      const title = document.createElement('h2');
      title.textContent = cfg.title;
      form.append(title);

      if (cfg.help) {
        const help = document.createElement('p');
        help.className = 'dialog-help';
        help.textContent = cfg.help;
        form.append(help);
      }

      if (cfg.code) {
        const code = document.createElement('p');
        code.className = 'recovery-code';
        code.textContent = cfg.code;
        form.append(code);
      }

      const inputs = (cfg.fields || []).map((field) => {
        const label = document.createElement('label');
        label.className = 'dialog-field';
        const caption = document.createElement('span');
        caption.textContent = field.label;
        const input = document.createElement('input');
        input.name = field.id;
        input.autocomplete = 'off';
        input.autocapitalize = 'characters';
        input.spellcheck = false;
        if (field.text) {
          input.type = 'text';
        } else {
          input.type = 'password';
          input.inputMode = 'numeric';
          input.maxLength = 6;
        }
        label.append(caption, input);
        form.append(label);
        return input;
      });

      const error = document.createElement('p');
      error.className = 'dialog-error';
      error.setAttribute('role', 'alert');
      form.append(error);

      if (cfg.link) {
        const link = document.createElement('button');
        link.type = 'button';
        link.className = 'dialog-link';
        link.textContent = cfg.link;
        link.addEventListener('click', () => close({ link: true }));
        form.append(link);
      }

      const actions = document.createElement('div');
      actions.className = 'dialog-actions';
      if (cfg.secondary) {
        const cancel = document.createElement('button');
        cancel.type = 'button';
        cancel.className = 'dlg-btn';
        cancel.textContent = cfg.secondary;
        cancel.addEventListener('click', () => close(null));
        actions.append(cancel);
      }
      const primary = document.createElement('button');
      primary.type = 'submit';
      primary.className = 'dlg-btn dlg-btn-primary';
      primary.textContent = cfg.primary;
      actions.append(primary);
      form.append(actions);

      function close(result) {
        closeCurrentDialog = null;
        if (dialog.open) dialog.close();
        dialog.replaceChildren();
        resolve(result);
      }
      closeCurrentDialog = () => close(null);

      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        primary.disabled = true;
        const values = Object.fromEntries(inputs.map((input) => [input.name, input.value.trim()]));
        const outcome = cfg.onSubmit ? await cfg.onSubmit(values) : true;
        primary.disabled = false;
        if (typeof outcome === 'string') {
          error.textContent = outcome;
          inputs.forEach((input) => { input.value = ''; });
          if (inputs[0]) inputs[0].focus();
          return;
        }
        close(outcome ?? true);
      });

      // Tasto Esc = annulla
      dialog.oncancel = (event) => {
        event.preventDefault();
        if (cfg.secondary) close(null);
      };

      dialog.replaceChildren(form);
      dialog.showModal();
      if (inputs[0]) inputs[0].focus();
    });
  }

  function lockedMessage(seconds) {
    return t('pinLocked').replace('{s}', String(seconds));
  }

  // ---------- Flussi del PIN ----------

  async function createPinFlow() {
    const result = await runDialog({
      title: t('pinCreateTitle'),
      help: t('pinCreateHelp'),
      fields: [{ id: 'pin', label: t('pinLabel') }, { id: 'pin2', label: t('pinConfirmLabel') }],
      primary: t('confirm'),
      secondary: t('cancel'),
      onSubmit: async (values) => {
        if (!security.isValidPin(values.pin)) return t('pinInvalid');
        if (values.pin !== values.pin2) return t('pinMismatch');
        const code = await security.setPin(values.pin, { newRecovery: true });
        return { code };
      },
    });
    if (!result) return false;
    await runDialog({
      title: t('recoveryTitle'),
      help: t('recoveryHelp'),
      code: result.code,
      primary: t('recoveryDone'),
    });
    return true;
  }

  async function recoveryFlow() {
    const ok = await runDialog({
      title: t('recoveryEnterTitle'),
      help: t('recoveryEnterHelp'),
      fields: [{ id: 'code', label: t('recoveryLabel'), text: true }],
      primary: t('confirm'),
      secondary: t('cancel'),
      onSubmit: async (values) => {
        const res = await security.verifyRecovery(values.code);
        if (res.ok) return true;
        return res.waitSeconds ? lockedMessage(res.waitSeconds) : t('recoveryWrong');
      },
    });
    // Codice corretto: si crea un nuovo PIN (e un nuovo codice di recupero)
    return ok === true ? createPinFlow() : false;
  }

  async function changePinFlow() {
    const ok = await runDialog({
      title: t('changePinTitle'),
      fields: [
        { id: 'current', label: t('currentPinLabel') },
        { id: 'pin', label: t('pinNewLabel') },
        { id: 'pin2', label: t('pinConfirmLabel') },
      ],
      primary: t('confirm'),
      secondary: t('cancel'),
      onSubmit: async (values) => {
        if (!security.isValidPin(values.pin)) return t('pinInvalid');
        if (values.pin !== values.pin2) return t('pinMismatch');
        const res = await security.verifyPin(values.current);
        if (!res.ok) return res.waitSeconds ? lockedMessage(res.waitSeconds) : t('pinWrong');
        // Il codice di recupero esistente resta valido
        await security.setPin(values.pin, { newRecovery: false });
        return true;
      },
    });
    if (ok === true) {
      await runDialog({ title: t('pinChanged'), primary: t('close') });
    }
  }

  async function requestAdultAccess() {
    if (!security.supported) {
      await runDialog({ title: t('adultMode'), help: t('cryptoUnavailable'), primary: t('close') });
      return;
    }
    if (!(await security.hasPin())) {
      if (await createPinFlow()) enterAdult();
      return;
    }
    const result = await runDialog({
      title: t('pinEnterTitle'),
      fields: [{ id: 'pin', label: t('pinLabel') }],
      primary: t('confirm'),
      secondary: t('cancel'),
      link: t('pinForgot'),
      onSubmit: async (values) => {
        const res = await security.verifyPin(values.pin);
        if (res.ok) return true;
        return res.waitSeconds ? lockedMessage(res.waitSeconds) : t('pinWrong');
      },
    });
    if (result === true) {
      enterAdult();
    } else if (result && result.link && (await recoveryFlow())) {
      enterAdult();
    }
  }

  // ---------- Ingresso e uscita ----------

  function enterAdult() {
    app.setMode('adult');
    el.adultBar.hidden = false;
    el.lock.hidden = true;
    resetInactivity();
    app.layoutGrid();
  }

  function exitAdult() {
    if (closeCurrentDialog) closeCurrentDialog();
    closeSettings();
    clearTimeout(inactivityTimer);
    app.setMode('child');
    el.adultBar.hidden = true;
    el.lock.hidden = false;
    app.layoutGrid();
  }

  function resetInactivity() {
    clearTimeout(inactivityTimer);
    if (app.mode !== 'adult') return;
    inactivityTimer = setTimeout(exitAdult, INACTIVITY_MS);
  }

  // Lucchetto: serve una pressione continua di 3 secondi (un tocco veloce non fa nulla)
  function bindLock() {
    let holdTimer = null;
    const cancel = () => {
      clearTimeout(holdTimer);
      holdTimer = null;
      el.lock.classList.remove('is-holding');
    };
    const start = (event) => {
      if (event.type === 'pointerdown' && event.button !== 0) return;
      cancel();
      el.lock.classList.add('is-holding');
      holdTimer = setTimeout(() => {
        cancel();
        requestAdultAccess();
      }, HOLD_MS);
    };
    el.lock.addEventListener('pointerdown', start);
    ['pointerup', 'pointerleave', 'pointercancel'].forEach((name) => el.lock.addEventListener(name, cancel));
    el.lock.addEventListener('keydown', (event) => {
      if ((event.key === 'Enter' || event.key === ' ') && !event.repeat) {
        event.preventDefault();
        start(event);
      }
    });
    el.lock.addEventListener('keyup', (event) => {
      if (event.key === 'Enter' || event.key === ' ') cancel();
    });
    el.lock.addEventListener('contextmenu', (event) => event.preventDefault());
  }

  // ---------- Impostazioni ----------

  function section(titleKey, helpKey) {
    const wrap = document.createElement('section');
    wrap.className = 'settings-section';
    const title = document.createElement('h3');
    title.textContent = t(titleKey);
    wrap.append(title);
    if (helpKey) {
      const help = document.createElement('p');
      help.className = 'settings-help';
      help.textContent = t(helpKey);
      wrap.append(help);
    }
    currentPanel.append(wrap);
    return wrap;
  }

  // Pannello della categoria in costruzione (vedi renderSettings)
  let currentPanel = null;
  let currentCategory = 'general';
  // Su telefono: true = si vede il contenuto della categoria, false = l'elenco delle categorie
  let showPanelOnPhone = false;

  function list(items, ordered) {
    const node = document.createElement(ordered ? 'ol' : 'ul');
    node.className = 'settings-list';
    (Array.isArray(items) ? items : [items]).forEach((text) => {
      const li = document.createElement('li');
      li.textContent = text;
      node.append(li);
    });
    return node;
  }

  function button(label, onClick, primary) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = primary ? 'dlg-btn dlg-btn-primary' : 'dlg-btn';
    btn.textContent = label;
    btn.addEventListener('click', onClick);
    return btn;
  }

  function renderInstallSection() {
    const wrap = section('secInstallTitle', 'secInstallHelp');
    if (install.isStandalone()) {
      wrap.append(list(t('installDone')));
      return;
    }
    if (!location.protocol.startsWith('http')) {
      wrap.append(list(t('installFromFile')));
      return;
    }
    if (install.canPrompt()) {
      wrap.append(button(t('installButton'), async () => {
        await install.prompt();
        renderSettings();
      }, true));
    }
    const steps = {
      ios: 'installIos',
      android: 'installAndroid',
      'mac-safari': 'installMacSafari',
      firefox: 'installFirefox',
      chromium: 'installChromium',
    }[install.platform()];
    if (!install.canPrompt() || install.platform() === 'chromium') {
      wrap.append(list(t(steps), true));
    }
  }

  function renderGuidedSection() {
    const wrap = section('secGuidedTitle', 'secGuidedHelp');
    [['guidedIosTitle', 'guidedIos'], ['guidedAndroidTitle', 'guidedAndroid']].forEach(([titleKey, stepsKey]) => {
      const sub = document.createElement('h4');
      sub.textContent = t(titleKey);
      wrap.append(sub, list(t(stepsKey), true));
    });
  }

  function renderLanguageSection() {
    const wrap = section('secLanguageTitle', 'secLanguageHelp');
    const group = document.createElement('div');
    group.className = 'choice-group';
    i18n.supported.forEach((lang) => {
      const btn = button(i18n.languageNames[lang], async () => {
        i18n.setLanguage(lang);
        await storage.set('language', lang);
        app.refreshTexts();
        renderSettings();
      }, false);
      btn.setAttribute('aria-pressed', String(i18n.language === lang));
      btn.lang = lang;
      group.append(btn);
    });
    wrap.append(group);
  }

  function renderVoiceSection() {
    const wrap = section('secVoiceTitle', 'secVoiceHelp');
    const lang = i18n.language;
    const prefs = speech.getPrefs();
    const available = speech.voicesFor(i18n.speechLocale);

    const savePrefs = async (next) => {
      speech.setPrefs(next);
      await storage.set('voice', speech.getPrefs());
    };

    // Elenco delle voci della lingua corrente
    const field = document.createElement('label');
    field.className = 'settings-field';
    const caption = document.createElement('span');
    caption.textContent = t('voiceLabel');
    const select = document.createElement('select');
    const auto = new Option(t('voiceAuto'), '');
    select.append(auto);
    available.forEach((voice) => {
      const suffix = voice.localService ? '' : ` (${t('voiceOnline')})`;
      select.append(new Option(`${voice.name}${suffix}`, voice.name));
    });
    select.value = prefs.voiceByLang[lang] || '';
    select.addEventListener('change', () => {
      const voiceByLang = { ...speech.getPrefs().voiceByLang, [lang]: select.value || undefined };
      if (!select.value) delete voiceByLang[lang];
      savePrefs({ voiceByLang });
    });
    field.append(caption, select);
    wrap.append(field);
    if (!available.length) wrap.append(list(t('voiceNone')));

    // Cursori per velocità e tono
    [['rate', 'rateLabel', 0.5, 1.5], ['pitch', 'pitchLabel', 0.5, 1.5]].forEach(([key, labelKey, min, max]) => {
      const row = document.createElement('label');
      row.className = 'settings-field';
      const text = document.createElement('span');
      const value = document.createElement('output');
      text.textContent = t(labelKey);
      const range = document.createElement('input');
      range.type = 'range';
      range.min = String(min);
      range.max = String(max);
      range.step = '0.05';
      range.value = String(prefs[key]);
      value.textContent = `${Number(prefs[key]).toFixed(2)}×`;
      range.addEventListener('input', () => {
        value.textContent = `${Number(range.value).toFixed(2)}×`;
      });
      range.addEventListener('change', () => savePrefs({ [key]: Number(range.value) }));
      text.append(' ', value);
      row.append(text, range);
      wrap.append(row);
    });

    wrap.append(button(t('voiceTest'), () => speech.speak(t('voiceSample'), i18n.speechLocale), true));

    const guide = document.createElement('h4');
    guide.textContent = t('voiceGuideTitle');
    wrap.append(guide, list(t('voiceGuide')));
  }

  function renderSecuritySection() {
    const wrap = section('secSecurityTitle', 'secSecurityHelp');
    wrap.append(button(t('changePin'), changePinFlow, false));
  }

  // Ricerca online di nuovi simboli: attiva, solo con Wi-Fi, disattivata (nessun traffico dati)
  const ONLINE_SEARCH_VALUES = [['on', 'valOnlineOn'], ['wifi', 'valOnlineWifi'], ['off', 'valOnlineOff']];
  let onlineSearch = 'on';

  // Usata dalla ricerca simboli (Tappa 3): decide se si può usare la rete.
  // 'wifi': Chrome su Android dice il tipo di connessione; dove il browser non lo dice
  // (Safari, Firefox, PC) la ricerca chiederà conferma prima di usare internet.
  function onlineSearchStatus() {
    if (onlineSearch === 'off' || !navigator.onLine) return 'blocked';
    if (onlineSearch === 'wifi') {
      const type = navigator.connection && navigator.connection.type;
      if (type === 'wifi' || type === 'ethernet') return 'allowed';
      if (type) return 'blocked';
      return 'ask';
    }
    return 'allowed';
  }

  function renderOnlineSection() {
    const wrap = section('secOnlineTitle', 'secOnlineHelp');
    wrap.append(settingRow('optOnlineSearch', 'optOnlineSearchHelp', segmented(ONLINE_SEARCH_VALUES, onlineSearch, async (value) => {
      onlineSearch = value;
      await storage.set('onlineSearch', value);
      renderSettings();
    })));
  }

  // Crediti: attribuzione obbligatoria per i pittogrammi ARASAAC (CC BY-NC-SA 4.0)
  function renderCreditsSection() {
    const wrap = section('secCreditsTitle', 'secCreditsHelp');
    const items = [
      [t('creditsArasaac'), 'https://arasaac.org', 'arasaac.org'],
      [t('creditsArasaacLicense'), 'https://creativecommons.org/licenses/by-nc-sa/4.0/deed.it', 'CC BY-NC-SA 4.0'],
      [t('creditsCode'), 'https://github.com/MCdeplTESTenv/picspeak', 'github.com/MCdeplTESTenv/picspeak'],
    ];
    const ul = document.createElement('ul');
    ul.className = 'settings-list';
    items.forEach(([text, href, label]) => {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = href;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = label;
      li.append(`${text} `, link);
      ul.append(li);
    });
    wrap.append(ul);
  }

  function renderComingSection() {
    const wrap = section('secComingTitle', 'secComingHelp');
    wrap.append(list(t('comingList')));
  }

  // Modalità colori: anteprima in miniatura + nome + descrizione
  function renderColorModeSection() {
    const wrap = section('secColorsTitle', 'secColorsHelp');
    const options = document.createElement('div');
    options.className = 'mode-options';
    const current = document.documentElement.dataset.colorMode || DEFAULT_COLOR_MODE;
    COLOR_MODES.forEach((mode) => {
      const option = document.createElement('button');
      option.type = 'button';
      option.className = 'mode-option';
      option.setAttribute('aria-pressed', String(current === mode.id));
      const preview = document.createElement('span');
      preview.className = `mode-preview is-${mode.id}`;
      ['pronoun', 'verb', 'noun', 'adjective', 'social', 'folder'].forEach((type) => {
        const swatch = document.createElement('span');
        swatch.className = `type-${type}`;
        preview.append(swatch);
      });
      const name = document.createElement('strong');
      name.textContent = t(mode.nameKey);
      const desc = document.createElement('small');
      desc.textContent = t(mode.descKey);
      option.append(preview, name, desc);
      option.addEventListener('click', async () => {
        applyColorMode(mode.id);
        await storage.set('colorMode', mode.id);
        renderSettings();
      });
      options.append(option);
    });
    wrap.append(options);
  }

  // Personalizzazioni grafiche: ogni opzione diventa un attributo data-* su <html> (vedi css/style.css).
  // Il primo valore di ogni elenco è quello predefinito.
  const APPEARANCE_GROUPS = [
    { titleKey: 'grpSymbols', options: [
      { key: 'symbolColor', labelKey: 'optSymbolColor', helpKey: 'optSymbolColorHelp',
        values: [['color', 'valColor'], ['gray', 'valGray'], ['contrast', 'valContrast']] },
      { key: 'cellContent', labelKey: 'optCellContent', helpKey: 'optCellContentHelp',
        values: [['both', 'valBoth'], ['image', 'valImageOnly'], ['text', 'valTextOnly']] },
      { key: 'labelPosition', labelKey: 'optLabelPosition',
        values: [['below', 'valBelow'], ['above', 'valAbove']] },
      { key: 'imageFrame', labelKey: 'optImageFrame', helpKey: 'optImageFrameHelp',
        values: [['none', 'valNo'], ['frame', 'valYes']] },
    ] },
    { titleKey: 'grpText', options: [
      { key: 'labelCase', labelKey: 'secCaseTitle', helpKey: 'secCaseHelp',
        values: [['upper', 'caseUpper'], ['lower', 'caseLower'], ['as-is', 'caseAsIs']] },
      { key: 'textSize', labelKey: 'optTextSize',
        values: [['m', 'valMedium'], ['s', 'valSmall'], ['l', 'valLarge'], ['xl', 'valXLarge']] },
      { key: 'font', labelKey: 'optFont', helpKey: 'optFontHelp',
        values: [['standard', 'valStandard'], ['readable', 'valReadable'], ['rounded', 'valRounded']] },
    ] },
    { titleKey: 'grpCells', options: [
      { key: 'cellGap', labelKey: 'optCellGap',
        values: [['normal', 'valNormal'], ['tight', 'valTight'], ['wide', 'valWide']] },
      { key: 'border', labelKey: 'optBorder',
        values: [['normal', 'valNormal'], ['thin', 'valThin'], ['thick', 'valThick']] },
      { key: 'corners', labelKey: 'optCorners',
        values: [['rounded', 'valRoundedCorners'], ['square', 'valSquare']] },
      { key: 'cellOpacity', labelKey: 'optCellOpacity', helpKey: 'optCellOpacityHelp',
        values: [['solid', 'valSolid'], ['translucent', 'valTranslucent']] },
    ] },
    { titleKey: 'grpLayout', options: [
      { key: 'sentencePosition', labelKey: 'optSentencePosition',
        values: [['top', 'valTop'], ['bottom', 'valBottom']] },
      { key: 'controlsSide', labelKey: 'optControlsSide', helpKey: 'optControlsSideHelp',
        values: [['right', 'valRight'], ['left', 'valLeft']] },
      { key: 'pageTitle', labelKey: 'optPageTitle',
        values: [['shown', 'valShown'], ['hidden', 'valHidden']] },
      { key: 'touchFeedback', labelKey: 'optTouchFeedback', helpKey: 'optTouchFeedbackHelp',
        values: [['on', 'valOn'], ['strong', 'valStrong'], ['off', 'valOff']] },
    ] },
  ];
  const APPEARANCE_OPTIONS = APPEARANCE_GROUPS.flatMap((group) => group.options);
  let appearance = {};

  function applyAppearance() {
    APPEARANCE_OPTIONS.forEach((opt) => {
      const value = appearance[opt.key] || opt.values[0][0];
      document.documentElement.dataset[opt.key] = value;
    });
    app.layoutGrid();
  }

  // Stili pronti: punto di partenza da cui poi personalizzare ogni dettaglio
  const PRESETS = [
    { id: 'card', nameKey: 'presetCard', descKey: 'presetCardDesc', colorMode: 'card', background: '',
      appearance: {} },
    { id: 'card-big', nameKey: 'presetCardBig', descKey: 'presetCardBigDesc', colorMode: 'card', background: '',
      appearance: { textSize: 'l', font: 'readable', border: 'thick', touchFeedback: 'strong' } },
    { id: 'sheet', nameKey: 'presetSheet', descKey: 'presetSheetDesc', colorMode: 'sheet', background: '',
      appearance: { labelCase: 'as-is' } },
    { id: 'full', nameKey: 'presetFull', descKey: 'presetFullDesc', colorMode: 'full', background: '',
      appearance: { imageFrame: 'frame' } },
    { id: 'clean', nameKey: 'presetClean', descKey: 'presetCleanDesc', colorMode: 'border', background: '#ffffff',
      appearance: { labelCase: 'lower', border: 'thin' } },
    { id: 'minimal', nameKey: 'presetMinimal', descKey: 'presetMinimalDesc', colorMode: 'none', background: '#eceef2',
      appearance: { labelCase: 'as-is', corners: 'square', border: 'thin', cellGap: 'tight' } },
    { id: 'contrast', nameKey: 'presetContrast', descKey: 'presetContrastDesc', colorMode: 'card', background: '#ffffff',
      appearance: { symbolColor: 'contrast', border: 'thick', textSize: 'l', touchFeedback: 'strong', corners: 'square' } },
    { id: 'bw', nameKey: 'presetBw', descKey: 'presetBwDesc', colorMode: 'none', background: '#ffffff',
      appearance: { symbolColor: 'gray', border: 'thick' } },
    { id: 'night', nameKey: 'presetNight', descKey: 'presetNightDesc', colorMode: 'card', background: '#1f2430',
      appearance: {} },
    { id: 'words', nameKey: 'presetWords', descKey: 'presetWordsDesc', colorMode: 'border', background: '#ffffff',
      appearance: { cellContent: 'text', labelCase: 'as-is', font: 'readable' } },
  ];

  function currentBackground() {
    return (document.documentElement.style.getPropertyValue('--page-bg') || '').trim().toLowerCase();
  }

  // Uno stile è "attivo" se tutte le scelte coincidono con le sue
  function presetMatches(preset) {
    if ((document.documentElement.dataset.colorMode || DEFAULT_COLOR_MODE) !== preset.colorMode) return false;
    if (currentBackground() !== (preset.background || '').toLowerCase()) return false;
    return APPEARANCE_OPTIONS.every((opt) => {
      const def = opt.values[0][0];
      return (appearance[opt.key] || def) === (preset.appearance[opt.key] || def);
    });
  }

  async function applyPreset(preset) {
    applyColorMode(preset.colorMode);
    applyPageBackground(preset.background);
    appearance = { ...preset.appearance };
    applyAppearance();
    await storage.set('colorMode', preset.colorMode);
    await storage.set('pageBackground', preset.background);
    await storage.set('appearance', appearance);
    await storage.set('preset', preset.id);
  }

  function renderPresetSection() {
    const wrap = section('secPresetsTitle', 'secPresetsHelp');
    const grid = document.createElement('div');
    grid.className = 'preset-grid';
    PRESETS.forEach((preset) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'preset-card';
      card.setAttribute('aria-pressed', String(presetMatches(preset)));
      const preview = document.createElement('span');
      const look = preset.appearance;
      preview.className = [
        'preset-preview', `is-${preset.colorMode}`,
        look.symbolColor === 'gray' ? 'is-gray' : '',
        look.corners === 'square' ? 'is-square' : '',
        look.border === 'thick' ? 'is-thick' : '',
      ].join(' ');
      preview.style.background = preset.background
        || (preset.colorMode === 'sheet' ? 'linear-gradient(180deg, #d5f4f0, #4fc6ba)' : '#ffffff');
      ['pronoun', 'verb', 'noun', 'adjective', 'social', 'folder'].forEach((type) => {
        const swatch = document.createElement('span');
        swatch.className = `type-${type}`;
        preview.append(swatch);
      });
      const name = document.createElement('strong');
      name.textContent = t(preset.nameKey);
      const desc = document.createElement('small');
      desc.textContent = t(preset.descKey);
      card.append(preview, name, desc);
      card.addEventListener('click', async () => {
        await applyPreset(preset);
        renderSettings();
      });
      grid.append(card);
    });
    wrap.append(grid);
    if (!PRESETS.some(presetMatches)) {
      const note = document.createElement('p');
      note.className = 'preset-custom-note';
      note.textContent = t('presetCustomNote');
      wrap.append(note);
    }
  }

  function settingRow(labelKey, helpKey, control) {
    const row = document.createElement('div');
    row.className = 'setting-row';
    const text = document.createElement('div');
    text.className = 'setting-text';
    const label = document.createElement('strong');
    label.textContent = t(labelKey);
    text.append(label);
    if (helpKey) {
      const help = document.createElement('small');
      help.textContent = t(helpKey);
      text.append(help);
    }
    row.append(text, control);
    return row;
  }

  function segmented(values, current, onChoose) {
    const group = document.createElement('div');
    group.className = 'segmented';
    group.setAttribute('role', 'group');
    values.forEach(([value, nameKey]) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = t(nameKey);
      btn.setAttribute('aria-pressed', String(current === value));
      btn.addEventListener('click', () => onChoose(value));
      group.append(btn);
    });
    return group;
  }

  function renderAppearanceGroups() {
    APPEARANCE_GROUPS.forEach((group) => {
      const wrap = section(group.titleKey);
      group.options.forEach((opt) => {
        const current = appearance[opt.key] || opt.values[0][0];
        wrap.append(settingRow(opt.labelKey, opt.helpKey, segmented(opt.values, current, async (value) => {
          appearance = { ...appearance, [opt.key]: value };
          applyAppearance();
          await storage.set('appearance', appearance);
          renderSettings();
        })));
      });
    });
  }

  // Colore di sfondo della pagina: colori pronti + colore a piacere
  function renderBackgroundSection() {
    const wrap = section('secBackgroundTitle', 'secBackgroundHelp');
    const options = document.createElement('div');
    options.className = 'bg-options';
    // '' = sfondo automatico, quello previsto dalla modalità colori scelta
    const current = (document.documentElement.style.getPropertyValue('--page-bg') || '').trim().toLowerCase();

    const choose = async (color) => {
      applyPageBackground(color);
      await storage.set('pageBackground', color);
      renderSettings();
    };

    PAGE_BACKGROUNDS.forEach((bg) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'bg-swatch';
      btn.setAttribute('aria-pressed', String(current === bg.color));
      const swatch = document.createElement('span');
      swatch.className = 'swatch';
      if (bg.color) {
        swatch.style.background = bg.color;
      } else {
        swatch.classList.add('swatch-auto');
        swatch.textContent = 'A';
      }
      const name = document.createElement('span');
      name.textContent = t(bg.nameKey);
      btn.append(swatch, name);
      btn.addEventListener('click', () => choose(bg.color));
      options.append(btn);
    });

    // Colore a piacere
    const custom = document.createElement('label');
    custom.className = 'bg-swatch';
    const isCustom = !PAGE_BACKGROUNDS.some((bg) => bg.color === current);
    custom.setAttribute('aria-pressed', String(isCustom));
    const picker = document.createElement('input');
    picker.type = 'color';
    picker.value = current || '#ffffff';
    picker.addEventListener('change', () => choose(picker.value.toLowerCase()));
    const name = document.createElement('span');
    name.textContent = t('bgCustom');
    custom.append(picker, name);
    options.append(custom);

    wrap.append(options);
  }

  // Categorie delle impostazioni: icona, titolo, sezioni contenute
  const CATEGORIES = [
    { id: 'general', icon: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M4.2 6.2l2.1 2.1M17.7 15.7l2.1 2.1M2.5 12h3M18.5 12h3M4.2 17.8l2.1-2.1M17.7 8.3l2.1-2.1"/>', titleKey: 'catGeneral', introKey: 'catGeneralIntro',
      render: [renderLanguageSection, renderOnlineSection, renderInstallSection, renderCreditsSection] },
    { id: 'appearance', icon: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>', titleKey: 'catAppearance', introKey: 'catAppearanceIntro',
      render: [renderPresetSection, renderColorModeSection, renderBackgroundSection, renderAppearanceGroups] },
    { id: 'voice', icon: '<path d="M11 5 6.5 9H3.5v6h3L11 19z"/><path d="M15.5 9a4.5 4.5 0 0 1 0 6"/><path d="M18.5 6a8.5 8.5 0 0 1 0 12"/>', titleKey: 'catVoice', introKey: 'catVoiceIntro',
      render: [renderVoiceSection] },
    { id: 'security', icon: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7.5a4 4 0 0 1 8 0V11"/>', titleKey: 'catSecurity', introKey: 'catSecurityIntro',
      render: [renderSecuritySection, renderGuidedSection] },
    { id: 'coming', icon: '<path d="M12 3v3M12 18v3M3 12h3M18 12h3"/><circle cx="12" cy="12" r="4"/>', titleKey: 'catComing', introKey: 'catComingIntro',
      render: [renderComingSection] },
  ];

  function renderSettings() {
    const layout = document.createElement('div');
    layout.className = 'settings-layout';
    layout.classList.toggle('show-panel', showPanelOnPhone);

    // Menu delle categorie
    const nav = document.createElement('ul');
    nav.className = 'settings-nav';
    CATEGORIES.forEach((cat) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'settings-nav-btn';
      btn.setAttribute('aria-current', String(cat.id === currentCategory));
      const icon = document.createElement('span');
      icon.className = 'nav-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${cat.icon}</svg>`;
      const label = document.createElement('span');
      label.textContent = t(cat.titleKey);
      const chevron = document.createElement('span');
      chevron.className = 'nav-chevron';
      chevron.setAttribute('aria-hidden', 'true');
      chevron.textContent = '›';
      btn.append(icon, label, chevron);
      btn.addEventListener('click', () => {
        currentCategory = cat.id;
        showPanelOnPhone = true;
        renderSettings();
        el.settings.scrollTop = 0;
      });
      li.append(btn);
      nav.append(li);
    });

    // Contenuto della categoria scelta
    const category = CATEGORIES.find((cat) => cat.id === currentCategory) || CATEGORIES[0];
    const panel = document.createElement('div');
    panel.className = 'settings-panel';
    const title = document.createElement('h3');
    title.className = 'settings-panel-title';
    title.textContent = t(category.titleKey);
    const intro = document.createElement('p');
    intro.className = 'settings-panel-intro';
    intro.textContent = t(category.introKey);
    panel.append(title, intro);
    currentPanel = panel;
    category.render.forEach((fn) => fn());

    layout.append(nav, panel);
    el.settingsBody.replaceChildren(layout);
  }

  function openSettings() {
    showPanelOnPhone = false;
    renderSettings();
    el.settings.hidden = false;
    document.body.classList.add('settings-open');
    el.settings.scrollTop = 0;
    el.settingsBack.focus();
  }

  function closeSettings() {
    el.settings.hidden = true;
    document.body.classList.remove('settings-open');
  }

  // ---------- Avvio ----------

  function bindEvents() {
    bindLock();
    el.openSettings.addEventListener('click', openSettings);
    el.exitAdult.addEventListener('click', exitAdult);
    // "Indietro": su telefono, dal contenuto di una categoria torna all'elenco; altrimenti chiude
    el.settingsBack.addEventListener('click', () => {
      if (showPanelOnPhone && window.matchMedia('(max-width: 720px)').matches) {
        showPanelOnPhone = false;
        renderSettings();
        return;
      }
      closeSettings();
    });
    // Ogni tocco o tasto in modalità adulto rimanda l'uscita automatica
    ['pointerdown', 'keydown'].forEach((name) => {
      document.addEventListener(name, resetInactivity, true);
    });
    install.onChange(() => {
      if (!el.settings.hidden) renderSettings();
    });
    // Le voci possono arrivare dopo l'apertura delle impostazioni (Chrome)
    speech.onVoicesChanged(() => {
      if (!el.settings.hidden && !el.settings.contains(document.activeElement)) renderSettings();
    });
  }

  // Lingua salvata dall'adulto (quella nell'indirizzo, se presente, ha la precedenza)
  async function restoreLanguage() {
    if (i18n.urlLanguage) return;
    const saved = await storage.get('language');
    if (saved && saved !== i18n.language && i18n.supported.includes(saved)) {
      i18n.setLanguage(saved);
      app.refreshTexts();
    }
  }

  // Preferenze di voce salvate dall'adulto
  async function restoreVoice() {
    speech.setPrefs(await storage.get('voice'));
  }

  // Modalità colori salvata (predefinita: colore pieno)
  async function restoreColorMode() {
    const saved = await storage.get('colorMode');
    if (saved && COLOR_MODES.some((mode) => mode.id === saved)) applyColorMode(saved);
  }

  // Colore di sfondo salvato (predefinito: vaniglia)
  async function restorePageBackground() {
    const saved = await storage.get('pageBackground');
    if (saved) applyPageBackground(saved);
  }

  // Personalizzazioni grafiche salvate (con recupero della vecchia impostazione "labelCase")
  async function restoreAppearance() {
    appearance = (await storage.get('appearance')) || {};
    if (!appearance.labelCase) {
      const legacy = await storage.get('labelCase');
      if (legacy) appearance.labelCase = legacy;
    }
    applyAppearance();
  }

  async function restoreOnlineSearch() {
    const saved = await storage.get('onlineSearch');
    if (ONLINE_SEARCH_VALUES.some(([value]) => value === saved)) onlineSearch = saved;
  }

  window.PicSpeak.network = { onlineSearchStatus };

  bindEvents();
  restoreOnlineSearch();
  restorePageBackground();
  restoreAppearance();
  restoreLanguage();
  restoreVoice();
  restoreColorMode();
})();
