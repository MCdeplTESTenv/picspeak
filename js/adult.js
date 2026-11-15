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
    el.settingsBody.append(wrap);
    return wrap;
  }

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

  function renderSettings() {
    el.settingsBody.replaceChildren();
    renderInstallSection();
    renderGuidedSection();
    renderLanguageSection();
    renderVoiceSection();
    renderSecuritySection();
    renderComingSection();
  }

  function openSettings() {
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
    el.settingsBack.addEventListener('click', closeSettings);
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

  bindEvents();
  restoreLanguage();
  restoreVoice();
})();
