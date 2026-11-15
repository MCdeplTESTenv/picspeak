# PicSpeak – Idea di progetto

## Visione
Uno strumento di CAA gratuito, leggerissimo e senza installazione, che funziona su
qualsiasi dispositivo e browser. Ogni persona ha il proprio spazio personalizzato
(pagine, simboli, voce, abitudini di comunicazione) che cresce con lei negli anni,
dall'infanzia all'età adulta, e può essere salvato, spostato e ripristinato con un
semplice file.

## Destinatari
- Bambini con disabilità comunicative, dai 3 anni in su.
- Adulti di riferimento: genitori (riferimento principale), logopedisti, insegnanti, educatori.
- In futuro: la persona stessa, diventata adulta, che gestisce in autonomia il proprio strumento.

## Principi
1. **Gratuito** per sempre (codice GPL-3.0, nessuna funzione a pagamento).
2. **Snello**: una pagina web, nessuna dipendenza pesante.
3. **Universale**: PC, Mac, tablet, smartphone; Chrome, Safari, Firefox, Edge.
4. **Offline**: deve funzionare anche senza connessione (PWA).
5. **Privato**: nessun server, nessun account, i dati dei minori restano sul dispositivo.
6. **Durevole**: backup in formato aperto e versionato, leggibile anche tra anni.
7. **Cresce con la persona**: l'interfaccia si adatta all'uso reale e non resta "da bambino".

## Accesso
- Il tool è pubblicato su GitHub Pages a un indirizzo pubblico
  (es. `https://mcdepltestenv.github.io/picspeak/`): chiunque lo apre dal browser
  e può aggiungerlo alla schermata Home. Nessun file da distribuire a mano.
- Il sito è uguale per tutti; i dati (tabella, statistiche, regole) restano nel browser
  di ciascun dispositivo, quindi l'esperienza è personale e privata.
- Limiti di GitHub Pages ampiamente sufficienti (sito ≤ 1 GB, ~100 GB/mese di traffico
  consigliato; dopo il primo caricamento il tool lavora dalla cache). Il repository deve
  essere pubblico.

## Lingue
- Lingua principale: italiano. Inglese selezionabile dalle impostazioni dell'adulto/terapista;
  struttura predisposta per aggiungere altre lingue in futuro.
- Tutti i testi dell'interfaccia stanno in dizionari separati per lingua (es. `it`, `en`),
  mai scritti direttamente nel codice.
- La lingua influisce su: interfaccia, voce di sintesi, ricerca dei simboli presso i fornitori
  (ARASAAC e Global Symbols cercano in entrambe le lingue), template di base e tutorial.
- Le etichette delle schede appartengono al profilo: cambiare la lingua dell'interfaccia non
  traduce automaticamente le schede già create.

## Funzionalità previste

### Comunicazione (modalità utente)
- Tabella CAA libera che cresce con la persona (pagine e categorie, vocabolario
  che si arricchisce nel tempo, fino eventualmente a lettere e parole).
- Griglia di simboli con immagine + etichetta.
- Tocco su un simbolo → pronuncia vocale (sintesi vocale del browser in italiano).
- Striscia frase in stile PECS (es. "Io voglio" + simbolo), con lettura dell'intera frase.
- Navigazione tra pagine/categorie (es. Cibo, Giochi, Emozioni, Persone).
- Nessuna possibilità di modificare per errore.
- Fasi PECS guidate come modalità opzionale (più avanti).

### Interfaccia adattiva ("T9 con le immagini")
- Registrazione locale delle statistiche d'uso: quali simboli, quando, in che sequenza.
- Le statistiche diventano regole che parametrizzano lo strumento, per esempio:
  - simboli più usati più grandi o in posizione più comoda;
  - dopo un simbolo, proposta dei 3–4 simboli che di solito lo seguono (sequenze n-gram);
  - suggerimenti che cambiano con il contesto (es. ora del giorno).
- Tutto calcolato sul dispositivo: offline, gratuito, privato.
- Statistiche, regole e vocabolario fanno parte del backup: cambiando dispositivo
  non si riparte da zero.
- L'adulto (o la persona stessa) può vedere, correggere o azzerare le regole.
- **Attivabile/disattivabile** (indicazione della logopedista): nella fase iniziale si parte
  con schede fisse predisposte dal terapista o dall'adulto e poche immagini, con i
  suggerimenti spenti. La raccolta delle abitudini d'uso è però attiva fin da subito,
  così il "T9" è già allenato quando verrà acceso.
- **Modello proposto (da confermare in Tappa 7)**, per adattarsi ai cambi di abitudini
  (scuola e lego fino a giugno, una settimana al mare con la sabbia, poi di nuovo a casa):
  - suggerimenti basati sulle coppie di simboli usati in sequenza (bigrammi) e sulla frequenza;
  - decadimento nel tempo: gli usi recenti pesano di più, quelli vecchi sbiadiscono
    senza essere cancellati, così l'abitudine del mare si spegne da sola al ritorno;
  - pesi per fascia oraria e per giorno feriale/festivo;
  - contesti attivabili dall'adulto (es. Mare, Scuola, Casa), ciascuno con le proprie
    statistiche, che si ritrovano intatte quando il contesto torna (requisito, vedi "Contesti");
  - simboli fondamentali bloccati nella loro posizione, che il T9 non sposta mai
    (la posizione stabile aiuta la memoria motoria).

### Contesti (requisito)
- L'adulto o il terapista può creare e **attivare/disattivare velocemente dei contesti**:
  Casa, Scuola, Mare, Nonni, Vacanze… più quelli personalizzati.
- Ogni contesto conserva **le proprie schede/simboli in evidenza e le proprie statistiche T9**.
  Disattivato, resta archiviato intatto: l'anno dopo, al ritorno al mare, si riattiva così com'era.
- Le schede comuni (vocabolario core, Persone, ecc.) restano sempre presenti; il contesto aggiunge
  o mette in primo piano ciò che serve in quel periodo o luogo.
- Più contesti possono essere attivi insieme (es. Casa + Estate).
- Cambio rapido dalla modalità adulto con una scorciatoia protetta (lo stesso accesso del PIN),
  ed eventuale attivazione programmata per date (es. dal 1 al 15 agosto: Mare).
- I contesti fanno parte del modello dati fin dalla Tappa 2 e sono inclusi nel backup.

### Template di base e tutorial iniziale
- **Template di base** proposto da PicSpeak alla prima apertura, ispirato alle pratiche
  diffuse in logopedia per la CAA:
  - **vocabolario "core"** (poche decine di parole ad alta frequenza che servono in ogni
    situazione: io, tu, voglio, non, ancora, basta, aiuto, sì, no, finito, andare, fare,
    mangiare, bere, giocare, mi piace/non mi piace, dove, cosa, chi…) sempre nella stessa
    posizione, per favorire la memoria motoria;
  - **vocabolario "fringe"/personale** organizzato per categorie: Persone, Cibo e bevande,
    Giochi e attività, Come mi sento, Corpo e "mi fa male", Luoghi, Scuola, Routine, Colori;
  - poche celle per pagina all'inizio (in linea con l'indicazione della logopedista),
    aumentabili dall'adulto;
  - colori per categoria grammaticale (Fitzgerald) opzionali.
- **Tutorial iniziale**, avviabile solo dall'adulto (dalla modalità protetta):
  - domande in forma di scheda, ognuna **saltabile**; il tutorial si può **interrompere in
    qualsiasi momento** e riprendere dopo; le risposte si possono modificare in seguito;
  - domande proposte (elenco iniziale, da rivedere con la logopedista):
    - nome, età, scuola e classe frequentata;
    - famiglia: chi vive in casa (nomi e ruoli), nonni e parenti vicini, animali domestici;
    - migliori amici; insegnanti, educatori, terapisti;
    - cibi e bevande preferiti, cibi non graditi, allergie o cibi vietati;
    - giochi e attività preferite; cartoni, personaggi, musica preferiti; colore preferito;
    - luoghi frequentati (casa dei nonni, parco, piscina, catechismo, sport…);
    - routine della giornata (sveglia, scuola, terapie, bagno, nanna);
    - come esprime dolore o malessere; cosa lo calma; cosa non sopporta (rumori, ecc.);
    - livello comunicativo attuale: quanti simboli gestisce per pagina, se riconosce
      foto o parole scritte, se usa già frasi di due o più simboli;
    - accesso fisico: tocco preciso o serve una cella più grande, tempo di pressione;
    - voce preferita (maschile/femminile, velocità) e lingua;
    - possibilità di aggiungere subito le foto di persone, oggetti e luoghi.
  - Al termine il template viene personalizzato: nomi e foto nelle schede Persone,
    cibi e giochi preferiti in evidenza, cibi vietati esclusi, numero di celle adeguato.
  - Le risposte forniscono anche una **conoscenza iniziale al T9** (es. i giochi preferiti
    partono con un peso maggiore), così i suggerimenti hanno senso fin dal primo giorno.
  - Tutte le risposte restano sul dispositivo e fanno parte del backup.

### Accesso alla modalità adulto (confermato; prima versione realizzata)
- In modalità bambino nulla modifica i dati: anche toccare un simbolo nella striscia frase
  lo ripete soltanto (la cancellazione dal simbolo è possibile solo in modalità adulto;
  i pulsanti ⌫ e ✕ della frase restano disponibili al bambino).
- Ingresso: piccolo lucchetto poco visibile in un angolo, da tenere premuto ~3 secondi,
  poi richiesta del PIN (4–6 cifre) creato al primo avvio.
- Uscita: pulsante "Torna alla comunicazione" e ritorno automatico dopo alcuni minuti di inattività.
- Permessi: un PIN "amministratore" (genitore: tutto, compresi backup, PIN, eliminazioni) e,
  facoltativi (non ancora realizzati), PIN "collaboratore" (terapista/insegnante: modifica schede e simboli, niente
  impostazioni di sicurezza o cancellazione del profilo).
- PIN salvato solo come impronta cifrata (hash con sale, Web Crypto), mai in chiaro; pausa crescente
  dopo tentativi sbagliati; codice di recupero da stampare alla creazione.
- Limite onesto: senza server la protezione ferma il bambino e l'adulto non autorizzato, non un
  esperto informatico con il dispositivo in mano. Per il file di backup si potrà aggiungere una
  password facoltativa (cifratura AES con Web Crypto).
- Nelle impostazioni: istruzioni passo passo per "Accesso guidato" di iPad/iPhone e "Blocco app"
  di Android, che tengono il bambino dentro PicSpeak (il tool non può attivarli da solo).
- Nelle impostazioni: "Installa PicSpeak come app" – pulsante con un clic su Chrome/Edge (PC e Android),
  istruzioni brevi su Safari (iPad/iPhone: Condividi → Aggiungi alla schermata Home; Mac: File → Aggiungi al Dock).
- Impostazioni raggruppate in: Modifica schede, Profilo, Aspetto e griglia, Voce, Lingua,
  Fonti dei simboli, T9 e regole, Backup, Sicurezza e PIN, Avanzate.

### Gestione (modalità adulto, protetta da PIN o pressione prolungata)
- Pensata per un genitore senza competenze tecniche; opzioni avanzate
  (griglia, fasi PECS, profili, regole adattive) in una sezione "Avanzate"
  per logopedisti e insegnanti.
- Utilizzabile in autonomia dalla persona stessa quando sarà adulta.
- Creazione/modifica di pagine e celle.
- Ricerca simboli da più fonti (vedi "Fonti dei simboli").
- Caricamento di immagini personali (foto di oggetti, persone, luoghi),
  ridimensionate e compresse automaticamente (~256–300 px, WebP/JPEG).
- Registrazione opzionale della voce di un adulto per ogni simbolo.
- Scelta della voce di sintesi (fra quelle del dispositivo), velocità e tono, con prova d'ascolto
  e istruzioni per installare gratis voci più naturali.
- Configurazione griglia: numero di righe/colonne, dimensione celle.
- Temi e stile regolabili (aspetto non infantile disponibile per l'età adulta).
- Colori per categoria (chiave di Fitzgerald): modalità "Scheda" (predefinita, stile tabelle stampate),
  "Fogli" (cartelle come fogli con l'angolo piegato), "Colore pieno", "Bordo colorato" o "Neutro", scelte in Impostazioni → Aspetto; parole in MAIUSCOLO o minuscolo.
- Colore di sfondo di ogni singolo simbolo modificabile, con ripristino al colore Fitzgerald automatico.
- Più profili sullo stesso dispositivo.
- Lingua dell'interfaccia (italiano/inglese).

### Fonti dei simboli
- Architettura a "provider" intercambiabili: la ricerca può interrogare più fonti
  insieme e l'adulto sceglie quali attivare.
- Fonti previste (licenze da riverificare al momento dell'implementazione):
  - **ARASAAC** (CC BY-NC-SA 4.0): fonte principale, ottima copertura in italiano.
  - **Global Symbols**: raccolta di più set (ARASAAC, Mulberry, Sclera e altri).
  - **Set di base incluso nel tool** (es. Mulberry CC BY-SA, OpenMoji CC BY-SA 4.0):
    funziona anche senza alcun servizio esterno.
  - **Immagini personali** caricate dall'utente.
- Escluse per ora: OpenSymbols (API su richiesta di una chiave), Sclera come set
  incluso (licenza non commerciale con condizioni proprie, usabile via Global Symbols).
- **Ricerca bilingue**: un termine cercato in italiano viene tradotto subito anche in inglese
  (ponte ARASAAC, dizionario locale, servizio gratuito MyMemory come riserva) e i risultati
  di tutte le fonti vengono uniti, così la ricerca restituisce sempre il massimo dei risultati.
- Ogni simbolo aggiunto viene salvato localmente con la sua fonte e licenza:
  anche se un servizio esterno cambiasse condizioni o chiudesse, le tabelle
  esistenti continuano a funzionare.
- La pagina Crediti elenca le fonti e le licenze effettivamente usate.

### Immagini offline
- Ogni simbolo viene scaricato **una sola volta**, quando l'adulto lo aggiunge a una scheda:
  ridimensionato (~256 px) e compresso (circa 10–25 KB), poi salvato in IndexedDB insieme a
  fonte e licenza. Durante l'uso il tool legge solo dal dispositivo: nessuna ricerca, nessuna rete.
- La ricerca online serve solo per aggiungere simboli nuovi. Se manca la connessione, la ricerca
  mostra i simboli già salvati e il set incluso nel tool, e propone foto dalla fotocamera o cella solo testo.
- Se un'immagine mancasse (es. dati corrotti), la cella mostra comunque l'etichetta e continua a parlare:
  ordine di riserva = simbolo salvato → foto personale → set incluso nel tool → solo testo.
- L'applicazione stessa (HTML, CSS, JS, set incluso) è tenuta in cache dal service worker.
- Ordine di grandezza: 500 simboli ≈ 5–12 MB, molto sotto i limiti del browser.

### Dati e backup (punto di forza del progetto)
- Obiettivo: non perdere mai immagini, schede, regole e statistiche del T9, anche se la memoria
  del browser viene cancellata, e senza che l'adulto debba ricordarsi di fare il backup.
- **Livello 1 – memoria del browser (IndexedDB)**, con richiesta di memoria persistente
  (`navigator.storage.persist()`) per ridurre il rischio che il browser la svuoti da solo.
- **Livello 2 – cartella di backup automatica** (Chrome ed Edge su PC/Mac):
  - l'adulto sceglie una volta una cartella dalle impostazioni (anche dentro iCloud Drive,
    Dropbox o OneDrive, così il backup va anche nel cloud senza servizi nostri);
  - PicSpeak ci scrive da solo: le immagini come file separati, scritti una volta sola,
    e un piccolo file dati (schede, regole, statistiche) aggiornato pochi secondi dopo ogni modifica;
  - più copie del file dati a rotazione (es. ultimi 7 giorni) per poter tornare indietro;
  - alla riapertura il browser può chiedere di riconfermare l'accesso alla cartella con un tocco
    (Chrome permette di scegliere "consenti sempre").
- **Livello 3 – iPad, iPhone, Firefox, Android** (il browser non permette di scrivere in una cartella):
  promemoria automatico periodico (es. ogni 7 giorni o dopo N modifiche) che prepara il file e apre
  il pannello di condivisione per salvarlo in File/iCloud con due tocchi.
- **File unico portabile `nomeutente.caa.json`** (esportazione/importazione) con immagini incorporate,
  schede, statistiche, regole e numero di versione del formato: serve per cambiare dispositivo e per lo
  scambio casa–scuola.
- Indicatore sempre visibile nelle impostazioni adulto: "Ultimo backup: X giorni fa" e dove si trova.
- Leggerezza: il salvataggio avviene in background, solo dopo una modifica, e scrive solo ciò che è cambiato.

## Sviluppi futuri annotati
- **Salvataggio automatico sul cloud personale** dell'utente (es. Google Drive, cartella
  nascosta dell'app, con accesso Google direttamente dal browser, senza server nostri);
  su Chrome/Edge desktop anche salvataggio automatico su un file scelto dall'utente
  (es. in una cartella iCloud/Dropbox). Servirebbe anche per lo scambio casa–scuola.
- **Suggeritore IA opzionale**: spento di default, attivabile dall'adulto con una
  propria chiave gratuita (es. Gemini). Da valutare: privacy dei dati di un minore
  inviati a un servizio esterno e termini d'uso che cambiano nel tempo.

## Rischi noti
- Safari iOS può cancellare i dati di siti non usati a lungo se NON aggiunti alla Home:
  incoraggiare "Aggiungi a schermata Home" e il backup regolare.
- Le API dei simboli richiedono connessione solo per la ricerca di nuovi simboli;
  i loro termini possono cambiare (mitigato da più provider e salvataggio locale).
- La qualità delle voci di sintesi varia tra dispositivi → la voce registrata è un'alternativa.
- Dati in browser diversi sullo stesso dispositivo sono separati: si passa dall'uno
  all'altro col file di backup.

## Decisioni sulle domande iniziali (2026-11-15)
1. **Utente adulto**: tutti (genitore, logopedista, insegnante) con il genitore come
   riferimento; in futuro la persona stessa da adulta.
2. **Impostazione**: tabella CAA libera che cresce con la persona, con interfaccia
   adattiva; PECS a fasi come modalità opzionale.
3. **Casa–scuola / cambio dispositivo**: per ora file di backup manuale con promemoria;
   cloud personale come sviluppo futuro.
4. **Dispositivo**: tablet (iPad/Android) come riferimento, ma deve aprirsi bene anche
   su smartphone e PC/Mac (lo sviluppo si testa soprattutto su PC/Mac).
5. **Nome**: PicSpeak. **Licenza del codice**: GPL-3.0.
6. **Lingue**: italiano principale, inglese selezionabile, predisposizione per altre lingue.
7. **Avvio**: template di base consigliato + tutorial iniziale per l'adulto che lo personalizza.
