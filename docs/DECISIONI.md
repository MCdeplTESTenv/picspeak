# Registro delle decisioni

Formato: data – decisione – motivo.

## 2026-11-15
- **Stack: HTML/CSS/JS vanilla, nessun framework né build.**
  Motivo: massima leggerezza, apertura immediata, manutenzione semplice nel tempo.
- **PWA con service worker.**
  Motivo: funzionamento offline e possibilità di "Aggiungi a Home" senza installazione da store.
- **Storage: IndexedDB (non localStorage).**
  Motivo: localStorage è limitato (~5 MB) e inadatto alle immagini.
- **Backup: file unico `.caa.json` con immagini in base64 e campo `formatVersion`.**
  Motivo: un solo file facile da spostare; versionamento per compatibilità futura.
- **Simboli ARASAAC salvati localmente al momento dell'aggiunta.**
  Motivo: funzionamento offline e inclusione nel backup.
- **Hosting: GitHub Pages.**
  Motivo: gratuito, HTTPS (necessario per PWA), integrato con il repository.
- **Nessun server/account: dati solo sul dispositivo.**
  Motivo: privacy dei minori, costo zero, semplicità.
- **Licenza pittogrammi: ARASAAC CC BY-NC-SA 4.0 con pagina Crediti.**
- **Nome del progetto: PicSpeak.**
  Nota: "DRM" nel nome della cartella locale è solo un prefisso organizzativo
  personale e non fa parte del nome del progetto (né del repository).
- **Licenza del codice: GPL-3.0.**
  Motivo: garantisce che PicSpeak e ogni sua versione modificata restino liberi e gratuiti;
  nessuno potrà chiuderlo e venderlo. Separata dalle licenze dei simboli.
- **Utente adulto: tutti, con il genitore come riferimento; opzioni avanzate in sezione "Avanzate".**
  Motivo: un genitore deve poterlo usare senza aiuto. In futuro l'adulto sarà la persona stessa:
  la gestione deve essere usabile in autonomia e l'aspetto non deve restare infantile.
- **Impostazione: tabella CAA libera che cresce con la persona; PECS a fasi come modalità opzionale futura.**
  Motivo: la tabella libera accompagna la persona fino all'età adulta.
- **Interfaccia adattiva calcolata in locale (statistiche d'uso → regole, predizione a sequenze).**
  Motivo: "T9 con le immagini" leggero, offline, gratuito e privato. Statistiche e regole
  fanno parte del backup.
- **IA esterna: non nel nucleo; eventuale suggeritore opzionale futuro con chiave dell'utente.**
  Motivo: privacy dei dati di un minore e termini dei servizi gratuiti instabili.
- **Backup/spostamento dati: per ora solo file manuale con promemoria.**
  Motivo: semplicità e zero servizi esterni. Cloud personale (es. Google Drive) annotato come sviluppo futuro.
- **Dispositivo di riferimento: tablet; layout responsive per smartphone e PC/Mac.**
  Motivo: uso tipico della CAA; lo sviluppo si testa soprattutto su PC/Mac, con verifiche su iPad (Safari).
- **Fonti dei simboli: più provider intercambiabili (ARASAAC, Global Symbols, set di base incluso
  con licenza libera, immagini personali), simboli salvati localmente con fonte e licenza.**
  Motivo: non dipendere da un solo servizio; le tabelle esistenti funzionano anche se una fonte cambia condizioni.
- **Accesso tramite indirizzo pubblico GitHub Pages; repository GitHub `picspeak` pubblico.**
  Motivo: nessun file da distribuire, aggiornamenti automatici; Pages gratuito richiede repo pubblico.
- **Interfaccia adattiva ("T9") attivabile/disattivabile e spenta all'inizio; raccolta delle abitudini sempre attiva.**
  Motivo: indicazione della logopedista. Nella fase iniziale servono schede fisse predisposte dal
  terapista o dall'adulto con poche immagini; intanto lo strumento impara, così il T9 è già allenato
  quando viene acceso.
- **Modello del T9: proposta, non ancora decisa.** Bigrammi di simboli con decadimento esponenziale
  nel tempo, pesi per fascia oraria e feriale/festivo, contesti manuali (Mare, Scuola…) con statistiche
  proprie, simboli fondamentali bloccati in posizione. Da confermare all'inizio della Tappa 7 (Interfaccia adattiva).
- **Vincolo legale: niente marchio "PECS" nei nomi di funzioni, pulsanti o pagine del tool.**
  Motivo: "PECS" è un marchio registrato. Si può citare come ispirazione nella documentazione,
  ma le funzioni useranno nomi propri (es. "percorso a fasi", "striscia frase").
- **Vincolo legale: pubblicare oggi la pagina non pone problemi di licenza** (nel repository non ci sono
  immagini ARASAAC). Quando saranno presenti: pagina Crediti sempre visibile, uso solo non commerciale,
  eventuali simboli modificati distribuiti con licenza CC BY-NC-SA. Privacy: dati solo sul dispositivo.
- **Lingue: italiano principale, inglese selezionabile dalle impostazioni adulto; predisposizione per altre lingue.**
  Motivo: richiesta di Marcello. Tutti i testi dell'interfaccia in dizionari per lingua fin dalla Tappa 1,
  così aggiungere una lingua non richiede di toccare il codice.
- **Template di base consigliato + tutorial iniziale per l'adulto (interrompibile, domande saltabili).**
  Motivo: partire da schede fisse sensate (vocabolario core in posizione stabile + vocabolario personale per
  categorie) e personalizzarle subito; le risposte danno al T9 una conoscenza iniziale. Il contenuto del
  template e l'elenco delle domande sono da rivedere con la logopedista.
- **Fornitori di simboli verificati dal browser (15/11/2026): ARASAAC e Global Symbols rispondono con CORS aperto.**
  Motivo: il tool può interrogarli direttamente da GitHub Pages, senza server intermedi.
- **Ricerca simboli: un termine italiano viene propagato subito anche in inglese, e i risultati si uniscono.**
  Motivo: richiesta di Marcello; molti archivi (Global Symbols, Mulberry, OpenMoji) hanno etichette solo in inglese,
  e così la ricerca non resta mai vuota. Traduzione senza chiavi né costi, in quest'ordine:
  1. ponte ARASAAC: la ricerca italiana restituisce il pittogramma, che ha anche le parole chiave inglesi
     (e un codice WordNet/synset utile per abbinare altri archivi);
  2. piccolo dizionario locale it→en del vocabolario CAA più comune (funziona offline);
  3. MyMemory (servizio di traduzione gratuito senza registrazione, CORS aperto) come riserva.
  Il termine cercato viene inviato a questi servizi: è accettabile perché sono parole generiche, ma in Crediti/Privacy
  va spiegato. Verificato dal browser il 15/11/2026.
- **Tappa 1: script JavaScript classici (non moduli ES).**
  Motivo: il tool si apre anche con doppio clic sul file, senza server locale, comodo per le prove su PC/Mac.
- **Tappa 1: immagini di prova con emoji di sistema.**
  Motivo: nessun file né licenza esterna finché non arrivano i fornitori di simboli (Tappa 3); l'aspetto varia un po' tra Apple, Android e Windows.
- **Griglia che si adatta da sola: sceglie il numero di colonne che rende le celle più grandi possibile.**
  Motivo: con poche immagini le celle diventano grandi (indicazione della logopedista); su telefono si scorre se le celle scenderebbero sotto ~88 px.
- **Immagini: scaricate una sola volta all'aggiunta, ridimensionate (~256 px, 10–25 KB) e salvate in IndexedDB.**
  Motivo: uso quotidiano interamente offline e veloce. Riserva se un'immagine manca: simbolo salvato → foto →
  set incluso → solo testo. App e set incluso in cache tramite service worker.
- **Backup a tre livelli: IndexedDB persistente + cartella automatica (Chrome/Edge) + promemoria con condivisione (Safari e altri).**
  Motivo: richiesta di Marcello, il backup deve essere costante e non dipendere dalla memoria dell'adulto né da quella del browser.
  Vincoli tecnici verificati: la scelta di una cartella (File System Access API) esiste solo su Chrome/Edge desktop;
  Safari (iPad/iPhone/Mac), Firefox e Chrome Android non la consentono, quindi lì serve il salvataggio guidato tramite
  pannello di condivisione verso File/iCloud. Alla riapertura il browser può chiedere di riconfermare l'accesso alla cartella.
  Nella cartella le immagini sono file separati scritti una volta e il file dati è piccolo e aggiornato poco dopo ogni
  modifica, così il tool resta leggero. L'unico backup davvero automatico anche su iPad resta il cloud personale (sviluppo futuro).
- **Contesti (Casa, Scuola, Mare, personalizzati) come requisito, non più solo proposta.**
  Motivo: richiesta di Marcello. L'adulto/terapista li attiva e disattiva velocemente; ognuno conserva schede e
  statistiche T9 e si riattiva intatto (es. ogni estate il Mare). Nel modello dati dalla Tappa 2, statistiche per
  contesto nella Tappa 7.
- **Modalità adulto confermata e realizzata (prima versione).** Lucchetto poco visibile da tenere premuto 3 secondi,
  poi PIN di 4–6 cifre; il PIN è salvato solo come impronta PBKDF2-SHA256 (150.000 iterazioni, sale casuale);
  dopo 3 errori attesa crescente da 30 s a 15 min (vale anche per il codice di recupero); codice di recupero
  di 12 caratteri mostrato una sola volta; uscita automatica dopo 5 minuti senza tocchi.
  Motivo: richiesta di Marcello, il bambino e gli adulti non autorizzati non devono accedere alle impostazioni.
  Limite dichiarato: senza server non protegge da chi ha competenze tecniche e il dispositivo in mano.
- **Impostazioni salvate in IndexedDB (database `picspeak`, archivio `settings`, versione 1).**
  Motivo: base minima per PIN e lingua; il modello dati completo (Tappa 2) aggiungerà altri archivi con una nuova versione.
- **Installazione come app e service worker anticipati dalla Tappa 6.**
  Motivo: richiesta di Marcello di un pulsante per installare il tool; Chrome mostra il pulsante solo se ci sono
  manifest, icone e service worker. Strategia "prima la rete": online arriva sempre l'ultima versione, offline si usa la copia.
  Su Safari l'installazione non si può avviare da un pulsante: mostriamo le istruzioni.
- **Icone generate da uno script senza librerie** (fumetto bianco con tre carte colorate su blu).
- **Voce: solo voci del dispositivo (Web Speech API), scelta automatica della migliore + scelta manuale dell'adulto.**
  Motivo: la voce "metallica" dipende dalle voci di base installate, non dal tool. Senza appesantire nulla:
  punteggio che preferisce voci Migliorate/Premium/Natural/Google/Siri e, offline, solo voci locali;
  nelle impostazioni selettore voce, velocità, tono, pulsante di prova e guida per installare gratis voci
  migliori su iPad, Mac, Android e Windows. Voci sintetiche esterne (servizi cloud o modelli da scaricare)
  scartate: costi, privacy o peso di decine di MB.

