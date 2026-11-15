/*
 * Dizionari dei testi dell'interfaccia, uno per lingua.
 * Nessun testo dell'interfaccia va scritto direttamente nel codice:
 * aggiungere una lingua significa aggiungere un dizionario qui.
 * Un valore può essere una stringa o un elenco di stringhe (passaggi numerati).
 */
(function () {
  'use strict';

  const dictionaries = {
    it: {
      appName: 'PicSpeak',
      speakSentence: 'Leggi la frase',
      deleteLast: 'Cancella l’ultimo simbolo',
      clearSentence: 'Cancella tutta la frase',
      goHome: 'Torna alla pagina principale',
      sentenceEmpty: 'Frase vuota',
      openPage: 'Apri la pagina',
      removeFromSentence: 'Togli dalla frase',

      // Modalità adulto
      lockHint: 'Modalità adulto: tieni premuto 3 secondi',
      adultMode: 'Modalità adulto',
      settings: 'Impostazioni',
      backToCommunication: 'Torna alla comunicazione',
      pinEnterTitle: 'Inserisci il PIN',
      pinCreateTitle: 'Crea il PIN dell’adulto',
      pinCreateHelp: 'Da 4 a 6 cifre. Servirà per entrare nella modalità adulto.',
      pinLabel: 'PIN',
      pinNewLabel: 'Nuovo PIN',
      pinConfirmLabel: 'Ripeti il PIN',
      currentPinLabel: 'PIN attuale',
      pinMismatch: 'I due PIN non coincidono.',
      pinInvalid: 'Il PIN deve avere da 4 a 6 cifre.',
      pinWrong: 'PIN errato.',
      pinLocked: 'Troppi tentativi. Riprova tra {s} secondi.',
      pinForgot: 'PIN dimenticato?',
      pinChanged: 'PIN aggiornato.',
      changePinTitle: 'Cambia PIN',
      recoveryTitle: 'Codice di recupero',
      recoveryHelp: 'Annota o stampa questo codice e conservalo in un posto sicuro: serve se dimentichi il PIN. Non verrà mostrato di nuovo.',
      recoveryDone: 'Ho annotato il codice',
      recoveryEnterTitle: 'Recupero del PIN',
      recoveryEnterHelp: 'Inserisci il codice di recupero ricevuto quando hai creato il PIN.',
      recoveryLabel: 'Codice di recupero',
      recoveryWrong: 'Codice di recupero errato.',
      cancel: 'Annulla',
      confirm: 'Conferma',
      close: 'Chiudi',
      back: 'Indietro',
      cryptoUnavailable: 'Da qui il PIN non può essere protetto. Apri PicSpeak dal suo indirizzo web (https://…) per usare la modalità adulto.',

      // Impostazioni
      settingsTitle: 'Impostazioni',
      catGeneral: 'Generale',
      catGeneralIntro: 'Lingua e installazione dell’app sul dispositivo.',
      catAppearance: 'Aspetto',
      catAppearanceIntro: 'Come appaiono le celle e i colori delle categorie.',
      catVoice: 'Voce',
      catVoiceIntro: 'Voce di sintesi, velocità e tono.',
      catSecurity: 'Sicurezza',
      catSecurityIntro: 'PIN dell’adulto e blocco del bambino dentro l’app.',
      catComing: 'In arrivo',
      catComingIntro: 'Funzioni previste nelle prossime tappe.',
      secColorsTitle: 'Modalità colori',
      secColorsHelp: 'I colori seguono la chiave di Fitzgerald: giallo persone, verde azioni, arancio cose, blu descrizioni, rosa parole sociali, rosso negazioni.',
      colorModeFull: 'Colore pieno',
      colorModeFullDesc: 'Ogni cella è tinta con il colore della sua categoria. Consigliata.',
      colorModeBorder: 'Bordo colorato',
      colorModeBorderDesc: 'Celle bianche con una fascia colorata in alto.',
      colorModeNone: 'Neutro',
      colorModeNoneDesc: 'Nessun colore di categoria, solo immagine e parola.',
      secBackgroundTitle: 'Colore di sfondo',
      secBackgroundHelp: 'Il colore dietro alle celle. Uno sfondo tranquillo aiuta a concentrarsi sui simboli.',
      bgVanilla: 'Vaniglia',
      bgWhite: 'Bianco',
      bgGrey: 'Grigio',
      bgSky: 'Azzurro',
      bgSage: 'Salvia',
      bgSand: 'Sabbia',
      bgNight: 'Notte',
      bgCustom: 'A scelta',
      secInstallTitle: 'Installa PicSpeak come app',
      secInstallHelp: 'Aggiunge l’icona di PicSpeak alla schermata Home o alla scrivania: si apre a schermo intero, come un’app, e funziona anche senza connessione.',
      installButton: 'Installa PicSpeak',
      installDone: 'PicSpeak è già aperto come app su questo dispositivo.',
      installFromFile: 'Per installarlo apri PicSpeak dal suo indirizzo web: https://mcdepltestenv.github.io/picspeak/',
      installIos: [
        'Apri questa pagina in Safari e tocca il pulsante Condividi (il quadrato con la freccia verso l’alto).',
        'Scorri e scegli «Aggiungi alla schermata Home».',
        'Tocca «Aggiungi».',
      ],
      installAndroid: [
        'Apri il menu ⋮ di Chrome in alto a destra.',
        'Scegli «Installa app» o «Aggiungi a schermata Home».',
      ],
      installMacSafari: [
        'Nel menu File di Safari scegli «Aggiungi al Dock».',
      ],
      installFirefox: [
        'Firefox non permette di installare le app web: apri questo indirizzo con Chrome, Edge o Safari, oppure aggiungilo ai preferiti.',
      ],
      installChromium: [
        'Se il pulsante non compare, apri il menu del browser (⋮ o …) e scegli «Installa PicSpeak» oppure «Salva e condividi → Installa pagina come app».',
      ],
      secGuidedTitle: 'Accesso guidato: tenere il bambino dentro PicSpeak',
      secGuidedHelp: 'È una funzione del tablet o del telefono che impedisce di uscire dall’app senza un codice. PicSpeak non può attivarla da solo: va impostata una volta nelle impostazioni del dispositivo.',
      guidedIosTitle: 'iPad e iPhone – Accesso guidato',
      guidedIos: [
        'Apri Impostazioni → Accessibilità → Accesso guidato e attivalo.',
        'In «Impostazioni codice» scegli un codice (può essere diverso dal PIN di PicSpeak).',
        'Apri PicSpeak e premi tre volte il tasto laterale (o il tasto Home).',
        'Tocca «Avvia». Per uscire premi di nuovo tre volte e inserisci il codice.',
      ],
      guidedAndroidTitle: 'Android – Blocco app',
      guidedAndroid: [
        'Apri Impostazioni → Sicurezza (o «Sicurezza e privacy») → Altre impostazioni → «Blocco app» / «Fissa app» e attivalo.',
        'Apri PicSpeak, poi la schermata delle app recenti.',
        'Tocca l’icona di PicSpeak in alto e scegli «Fissa» o «Blocca».',
        'I nomi dei menu cambiano un po’ tra le diverse marche.',
      ],
      secLanguageTitle: 'Lingua',
      secLanguageHelp: 'Lingua dell’interfaccia e della voce.',
      secVoiceTitle: 'Voce',
      secVoiceHelp: 'PicSpeak usa le voci già presenti sul dispositivo: non scarica nulla e resta leggero. Se la voce sembra metallica, scegline un’altra o installa una voce «migliorata» (gratuita) seguendo le istruzioni qui sotto.',
      voiceLabel: 'Voce',
      voiceAuto: 'Automatica (la migliore disponibile)',
      voiceOnline: 'solo con internet',
      voiceNone: 'Nessuna voce per questa lingua su questo dispositivo.',
      rateLabel: 'Velocità',
      pitchLabel: 'Tono',
      voiceTest: '▶ Prova la voce',
      voiceSample: 'Ciao! Io voglio giocare con la palla.',
      voiceGuideTitle: 'Come avere una voce più naturale (gratis)',
      voiceGuide: [
        'iPad e iPhone: Impostazioni → Accessibilità → Contenuto letto → Voci → Italiano: scarica una voce «Migliorata» o «Premium» (es. Federica, Alice, Luca).',
        'Mac: Impostazioni di Sistema → Accessibilità → Contenuto letto → Voce di sistema → Gestisci voci → Italiano.',
        'Android: Impostazioni → Accessibilità → Sintesi vocale → Motore di sintesi Google → Installa dati vocali → Italiano.',
        'Windows: con Edge sono disponibili le voci «Online (Natural)», molto naturali ma solo con internet; per l’uso offline aggiungi una voce italiana da Impostazioni → Ora e lingua → Voce.',
        'Dopo aver installato una voce, chiudi e riapri PicSpeak e sceglila qui sopra.',
      ],
      secSecurityTitle: 'Sicurezza e PIN',
      secSecurityHelp: 'Dopo 5 minuti senza tocchi PicSpeak torna da solo alla modalità di comunicazione.',
      changePin: 'Cambia PIN',
      secComingTitle: 'In arrivo',
      secComingHelp: 'Queste impostazioni arriveranno nelle prossime tappe:',
      comingList: [
        'Modifica schede e simboli',
        'Contesti (Casa, Scuola, Mare…)',
        'Profilo e tutorial iniziale',
        'Griglia: righe, colonne e dimensione delle celle',
        'Colore di sfondo di ogni simbolo modificabile, con ripristino al colore Fitzgerald',
        'Fonti dei simboli',
        'T9 e regole',
        'Backup',
        'Collaboratori (logopedista, insegnanti) con PIN propri',
      ],
    },
    en: {
      appName: 'PicSpeak',
      speakSentence: 'Read the sentence',
      deleteLast: 'Delete the last symbol',
      clearSentence: 'Clear the whole sentence',
      goHome: 'Back to the main page',
      sentenceEmpty: 'Empty sentence',
      openPage: 'Open page',
      removeFromSentence: 'Remove from sentence',

      lockHint: 'Adult mode: press and hold for 3 seconds',
      adultMode: 'Adult mode',
      settings: 'Settings',
      backToCommunication: 'Back to communication',
      pinEnterTitle: 'Enter the PIN',
      pinCreateTitle: 'Create the adult PIN',
      pinCreateHelp: '4 to 6 digits. You will need it to enter adult mode.',
      pinLabel: 'PIN',
      pinNewLabel: 'New PIN',
      pinConfirmLabel: 'Repeat the PIN',
      currentPinLabel: 'Current PIN',
      pinMismatch: 'The two PINs do not match.',
      pinInvalid: 'The PIN must have 4 to 6 digits.',
      pinWrong: 'Wrong PIN.',
      pinLocked: 'Too many attempts. Try again in {s} seconds.',
      pinForgot: 'Forgot your PIN?',
      pinChanged: 'PIN updated.',
      changePinTitle: 'Change PIN',
      recoveryTitle: 'Recovery code',
      recoveryHelp: 'Write down or print this code and keep it somewhere safe: you need it if you forget the PIN. It will not be shown again.',
      recoveryDone: 'I wrote the code down',
      recoveryEnterTitle: 'PIN recovery',
      recoveryEnterHelp: 'Enter the recovery code you received when you created the PIN.',
      recoveryLabel: 'Recovery code',
      recoveryWrong: 'Wrong recovery code.',
      cancel: 'Cancel',
      confirm: 'Confirm',
      close: 'Close',
      back: 'Back',
      cryptoUnavailable: 'The PIN cannot be protected here. Open PicSpeak from its web address (https://…) to use adult mode.',

      settingsTitle: 'Settings',
      catGeneral: 'General',
      catGeneralIntro: 'Language and installing the app on this device.',
      catAppearance: 'Appearance',
      catAppearanceIntro: 'How cells and category colours look.',
      catVoice: 'Voice',
      catVoiceIntro: 'Speech voice, speed and pitch.',
      catSecurity: 'Security',
      catSecurityIntro: 'Adult PIN and keeping the child inside the app.',
      catComing: 'Coming soon',
      catComingIntro: 'Features planned for the next stages.',
      secColorsTitle: 'Colour mode',
      secColorsHelp: 'Colours follow the Fitzgerald key: yellow people, green actions, orange things, blue describing words, pink social words, red negations.',
      colorModeFull: 'Full colour',
      colorModeFullDesc: 'Each cell is tinted with its category colour. Recommended.',
      colorModeBorder: 'Coloured border',
      colorModeBorderDesc: 'White cells with a coloured band at the top.',
      colorModeNone: 'Neutral',
      colorModeNoneDesc: 'No category colours, just image and word.',
      secBackgroundTitle: 'Background colour',
      secBackgroundHelp: 'The colour behind the cells. A calm background helps focus on the symbols.',
      bgVanilla: 'Vanilla',
      bgWhite: 'White',
      bgGrey: 'Grey',
      bgSky: 'Sky',
      bgSage: 'Sage',
      bgSand: 'Sand',
      bgNight: 'Night',
      bgCustom: 'Custom',
      secInstallTitle: 'Install PicSpeak as an app',
      secInstallHelp: 'Adds the PicSpeak icon to the Home screen or desktop: it opens full screen, like an app, and also works offline.',
      installButton: 'Install PicSpeak',
      installDone: 'PicSpeak is already open as an app on this device.',
      installFromFile: 'To install it, open PicSpeak from its web address: https://mcdepltestenv.github.io/picspeak/',
      installIos: [
        'Open this page in Safari and tap the Share button (the square with the up arrow).',
        'Scroll down and choose “Add to Home Screen”.',
        'Tap “Add”.',
      ],
      installAndroid: [
        'Open the Chrome ⋮ menu at the top right.',
        'Choose “Install app” or “Add to Home screen”.',
      ],
      installMacSafari: [
        'In the Safari File menu choose “Add to Dock”.',
      ],
      installFirefox: [
        'Firefox cannot install web apps: open this address with Chrome, Edge or Safari, or bookmark it.',
      ],
      installChromium: [
        'If the button does not appear, open the browser menu (⋮ or …) and choose “Install PicSpeak” or “Save and share → Install page as app”.',
      ],
      secGuidedTitle: 'Guided Access: keep the child inside PicSpeak',
      secGuidedHelp: 'A tablet or phone feature that prevents leaving the app without a code. PicSpeak cannot turn it on by itself: set it up once in the device settings.',
      guidedIosTitle: 'iPad and iPhone – Guided Access',
      guidedIos: [
        'Open Settings → Accessibility → Guided Access and turn it on.',
        'In “Passcode Settings” choose a passcode (it can differ from the PicSpeak PIN).',
        'Open PicSpeak and triple-click the side button (or the Home button).',
        'Tap “Start”. To exit, triple-click again and enter the passcode.',
      ],
      guidedAndroidTitle: 'Android – App pinning',
      guidedAndroid: [
        'Open Settings → Security (or “Security & privacy”) → More settings → “App pinning” and turn it on.',
        'Open PicSpeak, then the recent apps screen.',
        'Tap the PicSpeak icon at the top and choose “Pin”.',
        'Menu names vary slightly between brands.',
      ],
      secLanguageTitle: 'Language',
      secLanguageHelp: 'Language of the interface and of the voice.',
      secVoiceTitle: 'Voice',
      secVoiceHelp: 'PicSpeak uses the voices already on the device: it downloads nothing and stays light. If the voice sounds robotic, pick another one or install a free “enhanced” voice following the steps below.',
      voiceLabel: 'Voice',
      voiceAuto: 'Automatic (best available)',
      voiceOnline: 'internet only',
      voiceNone: 'No voice for this language on this device.',
      rateLabel: 'Speed',
      pitchLabel: 'Pitch',
      voiceTest: '▶ Test the voice',
      voiceSample: 'Hello! I want to play with the ball.',
      voiceGuideTitle: 'How to get a more natural voice (free)',
      voiceGuide: [
        'iPad and iPhone: Settings → Accessibility → Spoken Content → Voices → English: download an “Enhanced” or “Premium” voice.',
        'Mac: System Settings → Accessibility → Spoken Content → System Voice → Manage Voices.',
        'Android: Settings → Accessibility → Text-to-speech → Google speech engine → Install voice data.',
        'Windows: Edge offers “Online (Natural)” voices, very natural but internet only; for offline use add a voice in Settings → Time & language → Speech.',
        'After installing a voice, close and reopen PicSpeak and choose it above.',
      ],
      secSecurityTitle: 'Security and PIN',
      secSecurityHelp: 'After 5 minutes without touches PicSpeak goes back to communication mode by itself.',
      changePin: 'Change PIN',
      secComingTitle: 'Coming soon',
      secComingHelp: 'These settings will arrive in the next stages:',
      comingList: [
        'Edit boards and symbols',
        'Contexts (Home, School, Seaside…)',
        'Profile and first-time tutorial',
        'Grid: rows, columns and cell size',
        'Background colour of each symbol editable, with reset to the Fitzgerald colour',
        'Symbol sources',
        'Word prediction and rules',
        'Backup',
        'Collaborators (therapist, teachers) with their own PIN',
      ],
    },
  };

  // Nome di ogni lingua scritto nella lingua stessa
  const languageNames = { it: 'Italiano', en: 'English' };

  // Codici BCP 47 usati per la sintesi vocale
  const speechLocales = { it: 'it-IT', en: 'en-US' };

  const supported = Object.keys(dictionaries);
  let current = 'it';

  // La lingua indicata nell'indirizzo (?lang=en) ha la precedenza su quella salvata
  const urlLanguage = (() => {
    const lang = new URLSearchParams(location.search).get('lang');
    return lang && supported.includes(lang) ? lang : null;
  })();

  function t(key) {
    const dict = dictionaries[current] || dictionaries.it;
    return dict[key] ?? dictionaries.it[key] ?? key;
  }

  function setLanguage(lang) {
    if (!supported.includes(lang)) return;
    current = lang;
    document.documentElement.lang = lang;
  }

  // Applica i testi agli elementi con data-i18n (testo) e data-i18n-label (etichetta accessibile)
  function applyTo(root) {
    (root || document).querySelectorAll('[data-i18n]').forEach((node) => {
      node.textContent = t(node.dataset.i18n);
    });
    (root || document).querySelectorAll('[data-i18n-label]').forEach((node) => {
      const text = t(node.dataset.i18nLabel);
      node.setAttribute('aria-label', text);
      node.title = text;
    });
  }

  setLanguage(urlLanguage || 'it');

  window.PicSpeak = window.PicSpeak || {};
  window.PicSpeak.i18n = {
    t,
    setLanguage,
    applyTo,
    urlLanguage,
    languageNames,
    get language() { return current; },
    get speechLocale() { return speechLocales[current]; },
    supported,
  };
})();
