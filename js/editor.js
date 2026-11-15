/*
 * Modifica delle schede (solo con le impostazioni sbloccate).
 * Tocco su una tessera → finestra di modifica: parola, voce, tipo di parola (colore Fitzgerald),
 * colore scelto a mano con ripristino, simbolo cercato nelle fonti (Tappa 3), immagine dal dispositivo,
 * nascosta, bloccata, posizione, elimina.
 * Tessera "+" → nuova tessera o nuova cartella.
 * Sicurezza: tutti i testi passano da textContent/value; le foto vengono ridisegnate su canvas
 * (niente SVG, niente metadati come la posizione GPS) e salvate solo sul dispositivo.
 */
(function () {
  'use strict';

  const { i18n, data, app, symbols, symbolSearch } = window.PicSpeak;
  const t = i18n.t;

  const MAX_LABEL = 40;
  const MAX_FILE_BYTES = 15 * 1024 * 1024;
  const IMAGE_SIZE = 256;
  const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/heic', 'image/heif'];
  const SWATCHES = ['#e0ac00', '#2e9a47', '#e57a12', '#2a6fd6', '#d0468f', '#cf3439', '#7a4fc9', '#6b717b'];

  const dialog = document.createElement('dialog');
  dialog.className = 'pin-dialog editor-dialog';
  document.body.append(dialog);

  // ---------- Piccoli costruttori di interfaccia ----------

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function field(labelText, input) {
    const wrap = el('label', 'dialog-field editor-field');
    wrap.append(el('span', null, labelText), input);
    return wrap;
  }

  function textInput(value, max) {
    const input = el('input');
    input.type = 'text';
    input.value = value || '';
    input.maxLength = max;
    input.autocomplete = 'off';
    input.spellcheck = true;
    return input;
  }

  function segmentedChoice(options, current, onChange) {
    const group = el('div', 'segmented editor-segmented');
    group.setAttribute('role', 'group');
    const buttons = options.map(([value, label]) => {
      const btn = el('button', null, label);
      btn.type = 'button';
      btn.dataset.value = value;
      btn.setAttribute('aria-pressed', String(value === current));
      btn.addEventListener('click', () => {
        buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
        onChange(value);
      });
      return btn;
    });
    group.append(...buttons);
    return group;
  }

  function actionButton(label, onClick, extraClass) {
    const btn = el('button', `dlg-btn ${extraClass || ''}`.trim(), label);
    btn.type = 'button';
    btn.addEventListener('click', onClick);
    return btn;
  }

  // ---------- Immagini dal dispositivo ----------

  // Ridisegna la foto a 256 px: riduce il peso e toglie i metadati (es. posizione GPS)
  async function processPhoto(file) {
    if (!file || file.size > MAX_FILE_BYTES) throw new Error(t('editorImageTooBig'));
    if (file.type && !ALLOWED_TYPES.includes(file.type)) throw new Error(t('editorImageType'));
    let bitmap;
    try {
      bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch (error) {
      throw new Error(t('editorImageType'));
    }
    const scale = Math.min(1, IMAGE_SIZE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const toBlob = (type, quality) => new Promise((resolve) => canvas.toBlob(resolve, type, quality));
    // WebP dove supportato (più leggero), altrimenti PNG se c'è trasparenza o JPEG per le foto
    let blob = await toBlob('image/webp', 0.85);
    if (!blob || blob.type !== 'image/webp') {
      blob = await toBlob(file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.85);
    }
    return blob;
  }

  function pickFile() {
    return new Promise((resolve) => {
      const input = el('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.addEventListener('change', () => resolve(input.files && input.files[0]), { once: true });
      input.click();
    });
  }

  // ---------- Finestra di modifica ----------

  function close() {
    if (dialog.open) dialog.close();
    dialog.replaceChildren();
  }

  function openEditor({ pageId, cell, isNew }) {
    const draft = {
      kind: cell ? cell.kind : 'symbol',
      label: cell ? cell.label : '',
      speak: cell ? cell.speak : null,
      wordType: cell ? cell.wordType : 'noun',
      color: cell ? cell.color : null,
      imageId: cell ? cell.imageId : null,
      hidden: cell ? cell.hidden : false,
      locked: cell ? cell.locked : false,
      newImageBlob: null,
      pending: null, // simbolo scelto con "Cerca simbolo": { imageId, record, previewBlob }
    };

    const form = el('form', 'dialog-form editor-form');
    form.noValidate = true;
    form.append(el('h2', null, isNew ? t('editorNewTitle') : t('editorTitle')));

    // Tipo di tessera (solo per una nuova): simbolo o cartella
    if (isNew) {
      form.append(segmentedChoice(
        [['symbol', t('editorKindSymbol')], ['folder', t('editorKindFolder')]],
        draft.kind,
        (value) => { draft.kind = value; symbolOnly.forEach((n) => { n.hidden = value === 'folder'; }); },
      ));
    }

    const labelInput = textInput(draft.label, MAX_LABEL);
    form.append(field(t('editorLabel'), labelInput));

    const speakInput = textInput(draft.speak, 80);
    speakInput.placeholder = t('editorSpeakPlaceholder');
    const speakField = field(t('editorSpeak'), speakInput);
    form.append(speakField);

    // Tipo di parola → colore Fitzgerald
    const typeField = el('div', 'editor-block');
    typeField.append(el('span', 'editor-block-title', t('editorWordType')));
    typeField.append(segmentedChoice(
      data.WORD_TYPES.map((type) => [type, t(`wordType_${type}`)]),
      draft.wordType,
      (value) => { draft.wordType = value; },
    ));
    form.append(typeField);

    // Colore: automatico (Fitzgerald) oppure scelto a mano
    const colorField = el('div', 'editor-block');
    colorField.append(el('span', 'editor-block-title', t('editorColor')));
    const swatches = el('div', 'editor-swatches');
    const renderSwatches = () => {
      swatches.replaceChildren();
      const auto = el('button', 'editor-swatch swatch-auto', 'A');
      auto.type = 'button';
      auto.title = t('editorColorAuto');
      auto.setAttribute('aria-label', t('editorColorAuto'));
      auto.setAttribute('aria-pressed', String(!draft.color));
      auto.addEventListener('click', () => { draft.color = null; renderSwatches(); });
      swatches.append(auto);
      SWATCHES.forEach((color) => {
        const sw = el('button', 'editor-swatch');
        sw.type = 'button';
        sw.style.background = color;
        sw.setAttribute('aria-label', color);
        sw.setAttribute('aria-pressed', String(draft.color === color));
        sw.addEventListener('click', () => { draft.color = color; renderSwatches(); });
        swatches.append(sw);
      });
      const custom = el('input', 'editor-swatch-input');
      custom.type = 'color';
      custom.value = draft.color || '#888888';
      custom.setAttribute('aria-label', t('bgCustom'));
      custom.addEventListener('change', () => { draft.color = custom.value; renderSwatches(); });
      swatches.append(custom);
    };
    renderSwatches();
    colorField.append(swatches, el('small', 'editor-hint', t('editorColorHint')));
    form.append(colorField);

    // Immagine
    const imageField = el('div', 'editor-block');
    imageField.append(el('span', 'editor-block-title', t('editorImage')));
    const preview = el('div', 'editor-preview');
    let previewUrl = null;
    const renderPreview = () => {
      preview.replaceChildren();
      if (previewUrl) { URL.revokeObjectURL(previewUrl); previewUrl = null; }
      let src = null;
      const blob = draft.newImageBlob || (draft.pending && draft.pending.previewBlob);
      if (blob) {
        previewUrl = URL.createObjectURL(blob);
        src = previewUrl;
      } else if (draft.pending) {
        src = data.imageUrl(draft.pending.imageId);
      } else {
        src = data.imageUrl(draft.imageId);
      }
      if (src) {
        const img = el('img');
        img.src = src;
        img.alt = '';
        preview.append(img);
      } else {
        preview.append(el('span', 'editor-preview-empty', t('editorNoImage')));
      }
    };
    renderPreview();
    const imageError = el('p', 'dialog-error');
    imageError.setAttribute('role', 'alert');
    const imageActions = el('div', 'editor-actions-row');
    // Cerca simbolo: fonti attive (dispositivo, pacchetti, ARASAAC online)
    const searchButton = actionButton(t('editorSearchSymbol'), async () => {
      imageError.textContent = '';
      const picked = await symbolSearch.open(labelInput.value.trim());
      if (!picked) return;
      draft.pending = picked;
      draft.newImageBlob = null;
      if (!labelInput.value.trim() && picked.label) labelInput.value = picked.label.slice(0, MAX_LABEL);
      renderPreview();
    }, 'editor-search-btn');
    const photoButton = actionButton(t('editorPickImage'), async () => {
      imageError.textContent = '';
      try {
        const file = await pickFile();
        if (!file) return;
        draft.newImageBlob = await processPhoto(file);
        draft.pending = null;
        renderPreview();
      } catch (error) {
        imageError.textContent = error.message;
      }
    });
    // Le foto personali si possono spegnere in Impostazioni → Simboli
    symbols.activeSources().then((sources) => { photoButton.hidden = !sources.photo; });
    imageActions.append(
      searchButton,
      photoButton,
      actionButton(t('editorRemoveImage'), () => {
        draft.imageId = null;
        draft.newImageBlob = null;
        draft.pending = null;
        renderPreview();
      }),
    );
    imageField.append(preview, imageActions, imageError);
    form.append(imageField);

    // Opzioni: nascosta, bloccata
    const optionsField = el('div', 'editor-block');
    const hiddenChoice = segmentedChoice([['no', t('valNo')], ['yes', t('valYes')]], draft.hidden ? 'yes' : 'no',
      (v) => { draft.hidden = v === 'yes'; });
    const lockedChoice = segmentedChoice([['no', t('valNo')], ['yes', t('valYes')]], draft.locked ? 'yes' : 'no',
      (v) => { draft.locked = v === 'yes'; });
    const rowHidden = el('div', 'editor-option');
    rowHidden.append(el('span', null, t('editorHidden')), hiddenChoice);
    const rowLocked = el('div', 'editor-option');
    rowLocked.append(el('span', null, t('editorLocked')), lockedChoice);
    optionsField.append(rowHidden, rowLocked);
    form.append(optionsField);

    // Posizione ed eliminazione (solo per tessere esistenti)
    if (!isNew) {
      const manage = el('div', 'editor-actions-row');
      manage.append(
        actionButton(`← ${t('editorMoveBefore')}`, async () => {
          await data.moveCell(pageId, cell.id, -1);
          app.renderGrid();
        }),
        actionButton(`${t('editorMoveAfter')} →`, async () => {
          await data.moveCell(pageId, cell.id, 1);
          app.renderGrid();
        }),
        actionButton(t('editorDelete'), async () => {
          // eslint-disable-next-line no-alert
          if (!window.confirm(t('editorDeleteConfirm'))) return;
          await data.deleteCell(pageId, cell.id);
          close();
          app.renderGrid();
        }, 'dlg-btn-danger'),
      );
      form.append(manage);
    }

    const error = el('p', 'dialog-error');
    error.setAttribute('role', 'alert');
    form.append(error);

    const actions = el('div', 'dialog-actions');
    const cancel = actionButton(t('cancel'), close);
    const save = el('button', 'dlg-btn dlg-btn-primary', t('editorSave'));
    save.type = 'submit';
    actions.append(cancel, save);
    form.append(actions);

    const symbolOnly = [speakField, typeField];
    if (draft.kind === 'folder') symbolOnly.forEach((n) => { n.hidden = true; });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const label = labelInput.value.trim().slice(0, MAX_LABEL);
      if (!label) {
        error.textContent = t('editorLabelRequired');
        labelInput.focus();
        return;
      }
      save.disabled = true;
      let { imageId } = draft;
      if (draft.pending) {
        // Simbolo cercato: salvato una sola volta sul dispositivo con fonte, autore e licenza
        if (draft.pending.record) await data.saveImage(draft.pending.record);
        imageId = draft.pending.imageId;
      } else if (draft.newImageBlob) {
        const image = await data.addImage({
          source: 'photo',
          author: '',
          license: t('editorPersonalLicense'),
          mime: draft.newImageBlob.type,
          blob: draft.newImageBlob,
          keywords: { [i18n.language]: [label] },
        });
        imageId = image.id;
      }
      const speak = speakInput.value.trim().slice(0, 80) || null;
      if (isNew && draft.kind === 'folder') {
        const { cell: folderCell } = await data.addFolder(pageId, label);
        await data.updateCell(pageId, folderCell.id, {
          color: draft.color, imageId, hidden: draft.hidden, locked: draft.locked,
        });
      } else if (isNew) {
        await data.addCell(pageId, {
          label, speak, wordType: draft.wordType, color: draft.color, imageId,
          hidden: draft.hidden, locked: draft.locked,
        });
      } else {
        const changes = { label, color: draft.color, imageId, hidden: draft.hidden, locked: draft.locked };
        if (cell.kind !== 'folder') Object.assign(changes, { speak, wordType: draft.wordType });
        await data.updateCell(pageId, cell.id, changes);
        if (cell.kind === 'folder' && cell.targetPageId) {
          const target = data.page(cell.targetPageId);
          if (target) target.title = label;
        }
      }
      close();
      app.renderGrid();
    });

    dialog.oncancel = (event) => { event.preventDefault(); close(); };
    dialog.replaceChildren(form);
    dialog.showModal();
    labelInput.focus();
  }

  window.PicSpeak.editor = {
    edit(pageId, cellId) {
      const page = data.page(pageId);
      const cell = page && page.cells.find((c) => c.id === cellId);
      if (cell) openEditor({ pageId, cell, isNew: false });
    },
    add(pageId) {
      openEditor({ pageId, cell: null, isNew: true });
    },
    close,
  };
})();
