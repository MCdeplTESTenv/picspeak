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
  const DEFAULT_COLOR_MODE = 'full';
  const COLOR_MODES = [
    { id: 'full', nameKey: 'colorModeFull', descKey: 'colorModeFullDesc' },
    { id: 'border', nameKey: 'colorModeBorder', descKey: 'colorModeBorderDesc' },
    { id: 'none', nameKey: 'colorModeNone', descKey: 'colorModeNoneDesc' },
  ];

  // Colori di sfondo della pagina proposti (il primo è quello predefinito)
  const PAGE_BACKGROUNDS = [
    { id: 'vanilla', color: '#fbfaf7', nameKey: 'bgVanilla' },
    { id: 'white', color: '#ffffff', nameKey: 'bgWhite' },
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

  // Colore di sfondo della pagina: colori pronti + colore a piacere
  function renderBackgroundSection() {
    const wrap = section('secBackgroundTitle', 'secBackgroundHelp');
    const options = document.createElement('div');
    options.className = 'bg-options';
    const current = (document.documentElement.style.getPropertyValue('--page-bg') || '').trim().toLowerCase()
      || PAGE_BACKGROUNDS[0].color;

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
      swatch.style.background = bg.color;
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
    picker.value = current;
    picker.addEventListener('change', () => choose(picker.value.toLowerCase()));
    const name = document.createElement('span');
    name.textContent = t('bgCustom');
    custom.append(picker, name);
    options.append(custom);

    wrap.append(options);
  }

  // Categorie delle impostazioni: icona, titolo, sezioni contenute
  const CATEGORIES = [
    { id: 'general', icon: '⚙️', titleKey: 'catGeneral', introKey: 'catGeneralIntro',
      render: [renderLanguageSection, renderInstallSection] },
    { id: 'appearance', icon: '🎨', titleKey: 'catAppearance', introKey: 'catAppearanceIntro',
      render: [renderColorModeSection, renderBackgroundSection] },
    { id: 'voice', icon: '🔊', titleKey: 'catVoice', introKey: 'catVoiceIntro',
      render: [renderVoiceSection] },
    { id: 'security', icon: '🔒', titleKey: 'catSecurity', introKey: 'catSecurityIntro',
      render: [renderSecuritySection, renderGuidedSection] },
    { id: 'coming', icon: '🧩', titleKey: 'catComing', introKey: 'catComingIntro',
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
      icon.textContent = cat.icon;
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
    title.textContent = `${category.icon} ${t(category.titleKey)}`;
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

  bindEvents();
  restorePageBackground();
  restoreLanguage();
  restoreVoice();
  restoreColorMode();
})();
