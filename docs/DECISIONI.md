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
- **Grafica: "Colore pieno" come aspetto predefinito; modalità colori scelta dall'adulto (Colore pieno, Bordo colorato, Neutro).**
  Motivo: Marcello ha scartato le proposte "Morbido" e "Scuro" e scelto "Colore pieno" (celle tinte col colore Fitzgerald,
  immagine su riquadro bianco, frase su barra scura, cartelle scure). Le altre modalità restano selezionabili in
  Impostazioni → Aspetto; scelta salvata sul dispositivo (`colorMode`).
- **Impostazioni divise in categorie (Generale, Aspetto, Voce, Sicurezza, In arrivo).**
  Motivo: la pagina unica era difficile da leggere. Menu laterale su tablet/PC, elenco con frecce su telefono
  (il pulsante Indietro torna all'elenco prima di chiudere).
- **Colore di sfondo di ogni simbolo modificabile, con ripristino al colore Fitzgerald (Tappa 2).**
  Motivo: richiesta di Marcello. Nel modello dati ogni cella avrà un campo colore facoltativo: vuoto = colore
  automatico dalla categoria grammaticale; "Ripristina" lo svuota.
- **Colore di sfondo della pagina scelto dall'adulto** (Impostazioni → Aspetto): Vaniglia (predefinito), Bianco, Grigio,
  Azzurro, Salvia, Sabbia, Notte, oppure un colore a scelta. Il testo del titolo diventa chiaro su sfondi scuri.
  Motivo: richiesta di Marcello. Salvato sul dispositivo (`pageBackground`).
- **Nuova modalità colori "Scheda" come predefinita** (sostituisce "Colore pieno" come predefinita, che resta selezionabile).
  Motivo: Marcello indica come riferimento lo stile delle tabelle CAA stampate (es. Widgit): pagina bianca, riquadri con
  fondo tenue e bordo spesso dello stesso colore Fitzgerald, immagine grande in alto, parola sotto. Si riprende solo lo
  stile grafico, non i simboli Widgit (proprietari e a pagamento).
- **Scrittura delle parole selezionabile: MAIUSCOLO (predefinito), minuscolo, come scritte.**
  Motivo: lo stampatello è comune nelle tabelle CAA, ma alcuni logopedisti preferiscono il minuscolo per avvicinare alla
  letto-scrittura: la scelta resta all'adulto.
- **Nuova modalità colori "Fogli"** (selezionabile): fondo turchese sfumato, parole come riquadri piatti e velati,
  cartelle come fogli bianchi impilati con l'angolo piegato.
  Motivo: Marcello indica come riferimento un'altra app CAA in cui le cartelle si riconoscono subito; ripreso
  il principio (cartella = foglio con più pagine), non la grafica.
- **Colore di sfondo "Automatico"** (predefinito): usa lo sfondo previsto dalla modalità colori scelta
  (bianco per Scheda, sfumato per Fogli…); gli altri colori lo sostituiscono.
- **Personalizzazioni grafiche nelle impostazioni (Aspetto)**, ognuna salvata sul dispositivo (`appearance`):
  colore dei simboli (a colori, bianco e nero, più contrasto), contenuto della cella (immagine e parola, solo immagine,
  solo parola), posizione della parola (sotto/sopra), scrittura (MAIUSCOLO/minuscolo/come scritte), dimensione del testo,
  carattere (standard, alta leggibilità, arrotondato), spazio tra le celle, spessore del bordo, angoli, striscia frase
  in alto/in basso, pulsanti della frase a destra/sinistra (mancini), nome della pagina visibile/nascosto,
  evidenziazione al tocco (normale, marcata, nessuna).
  Motivo: richiesta di Marcello; dettagli che sembrano banali ma contano molto per l'accessibilità e per adattare
  il tool alla persona nel tempo.
- **Impostazioni con aspetto più "professionale":** carattere di sistema, schede con intestazione grigia in maiuscoletto,
  righe "etichetta a sinistra, controllo a destra", controlli a segmenti, angoli e spaziature ridotti.
  Motivo: Marcello trovava la pagina ancora "molle".
- **Dieci stili pronti come punto di partenza** (Impostazioni → Aspetto → Stili pronti): Scheda (predefinito),
  Scheda grande, Fogli, Colore pieno, Pulito, Essenziale, Alto contrasto, Bianco e nero, Notte, Solo parole.
  Ogni stile imposta modalità colori, sfondo e personalizzazioni; dopo si può cambiare ogni dettaglio e si ottiene
  uno stile "personalizzato" (ibrido). Aggiunte le opzioni "riquadro dietro l'immagine" e "trasparenza delle celle".
  Motivo: richiesta di Marcello; il turchese di "Fogli" era solo un esempio e resta uno degli stili, non il predefinito.
- **Simboli di prova: pittogrammi ARASAAC inclusi nel tool al posto delle emoji** (39 immagini da 300 px, ~440 KB,
  in `symbols/arasaac/<id>.png`, salvati anche nella cache offline). Pagina **Crediti e licenze** in Impostazioni → Generale
  con autore, proprietario, fonte e licenza CC BY-NC-SA 4.0.
  Motivo: le emoji hanno sfumature e stile 3D diversi su ogni sistema e rendevano la grafica "pasticciata"; i pittogrammi
  piatti con contorno nero si avvicinano allo stile di riferimento. Approvato da Marcello.
- **Interruttore "Ricerca online di nuovi simboli": Attiva / Solo Wi-Fi / Disattivata** (Impostazioni → Generale).
  Motivo: evitare consumo di dati non voluto. Il tool funziona sempre offline con i simboli salvati. "Solo Wi-Fi" usa la
  Network Information API, disponibile solo su Chrome Android; dove il browser non indica il tipo di rete (Safari, Firefox,
  PC) la ricerca chiederà conferma prima di usare internet. Funzione `PicSpeak.network.onlineSearchStatus()` pronta per la Tappa 3.
- **Risoluzione crescente delle schede: livelli di griglia da 2×2 fino a circa 12×10, con core fisso (requisito).**
  Motivo: richiesta di Marcello; con l'avanzare delle abilità o in età adulta servono schede dense come i vocabolari
  robusti (riga di categorie, core Fitzgerald in posizione fissa, tastiera e affissi), senza perdere la pulizia delle
  tessere che deve rendere PicSpeak riconoscibile. Collocazione: modello dati (righe/colonne, posizione fissa delle
  celle) nella Tappa 2; template core denso nella Tappa 4; densità di stile e livelli nella Tappa 8; tastiera e affissi
  tra le idee future pianificate.
- **Controllo grafico obbligatorio prima di proporre modifiche** con `dev/verifica-layout.js` (contenuti fuori dal
  riquadro, parole tagliate o spezzate, celle sovrapposte) su tablet, telefono e PC, in tutte le modalità colori e opzioni.
  Motivo: su Safari Mac la parola delle tessere della frase usciva dal bordo. Correzione: tessere della frase a misura
  fissa con immagine contenuta; nelle celle l'immagine si adatta allo spazio libero, la parola va al massimo su due righe
  e il carattere si riduce da solo se una parola non entra (mai parole spezzate a metà).
- **Barra di navigazione "Percorso" (scelta C) e icone a linea al posto delle emoji nell'interfaccia.**
  Il nome pagina diventa una pillola "⌂ HOME › CIBO" (toccando HOME si torna alla Home); l'accesso adulto è un pulsante
  "•••" discreto, sempre da tenere premuto 3 secondi; pulsanti della frase, barra adulto e menu impostazioni usano icone
  a linea sottile coerenti con le tessere piatte. Motivo: Marcello trovava lucchetto e titolo "Home" poco moderni; le
  emoji 3D stonavano con lo stile pulito.
- **Pulsante Home grande nelle sotto-pagine**, in aggiunta al percorso "HOME › pagina": tessera grigia (come le
  cartelle) con icona casa a linea. Motivo: Marcello: la casetta serve, il percorso da solo non basta.
- **Opzione "Scuoti per ricominciare"** (Aspetto → Disposizione e tocco, spenta di default): due scosse decise entro
  un secondo riportano alla Home e cancellano la frase, solo in modalità comunicazione. Su iPad/iPhone il browser chiede il permesso per i
  sensori di movimento al momento dell'attivazione. Spenta di default per non far scattare per sbaglio chi ha movimenti
  involontari.
- **"Modalità adulto" rinominata "Impostazioni" (protette da PIN).** La modalità adulto sarà in futuro un profilo
  separato, per la persona che da adulta usa e gestisce il tool. Motivo: indicazione di Marcello, evitare confusione.
  (Nel codice la modalità interna si chiama ancora `adult`.)
- **La modalità scura del telefono non cambia i colori di PicSpeak** (`color-scheme: light`). Motivo: sul telefono di
  un utente in modalità scura le parole della frase erano bianche su fondo chiaro, quindi invisibili. Per la sera c'è lo
  stile "Notte". Il controllo grafico ora verifica anche il contrasto (almeno 4,5:1).
- **Pulsante Home grande rimosso:** basta il percorso "⌂ HOME › pagina" (decisione di Marcello).
- **Pressione sui "•••": l'avanzamento appare in cima allo schermo** (barra + "Continua a tenere premuto…"), perché sul
  telefono il dito copriva la barra sul pulsante.
- **"Spingi via" la frase (interruttore in Aspetto → Disposizione e tocco, spento di default):** un colpo deciso del dito
  sulla striscia frase verso l'alto o il basso (o di lato se la frase non scorre) la cancella. In modalità impostazioni ogni tessera mostra anche la ✕ per toglierla.
- **Sicurezza:** Content-Security-Policy, blocco delle impostazioni dentro un iframe, link esterni senza referrer,
  documento `docs/SICUREZZA.md` e agente `security-reviewer` da usare prima di ogni push.
- **Zoom delle tessere (sostituisce lo zoom delle sole immagini):** con le impostazioni sbloccate, nella barra in alto
  della pagina principale compaiono − 100% +: agiscono sull'intera tessera (immagine e parola) cambiando il numero di
  colonne, e l'effetto si vede subito; toccando la percentuale si torna ad "automatico". In comunicazione i pulsanti
  spariscono. Il numero di colonne scelto è salvato (Aspetto → Celle mostra "Automatico" o "N colonne").
  Con − non si scende sotto ~90 px di larghezza per tessera.
- **REQUISITO FONDAMENTALE: il backup deve essere automatico, mai un'operazione manuale.** Perdere impostazioni, schede
  o statistiche del T9 sarebbe un danno grave per la persona che usa il tool. Saranno i genitori a scegliere dove
  salvare (cartella locale o cloud personale), ma il salvataggio avviene da solo. Il promemoria manuale resta solo come
  rete di sicurezza. Proposta in valutazione (in attesa di conferma di Marcello prima di modificare la ROADMAP):
  anticipare nella tappa Backup il salvataggio automatico sul cloud personale dei genitori (Google Drive, Dropbox o
  OneDrive, accesso dal browser senza server nostri), così da coprire anche iPad e Android.
- **Griglia su schermi bassi (telefono in orizzontale):** le celle non scendono sotto ~108 px di larghezza, la griglia
  scorre invece di stringersi; barre più compatte sotto i 500 px di altezza. Il controllo grafico ora include anche il
  telefono in orizzontale, lo zoom delle immagini (60–160%) e le righe delle impostazioni.
- **Backup a livelli, ciascuno attivabile dalle impostazioni** (confermato da Marcello):
  1. memoria del browser persistente (sempre attiva);
  2. cartella automatica sul computer (Chrome/Edge desktop);
  3. **cloud personale automatico** (Google Drive, Dropbox o OneDrive) — l'unico automatico su iPad, iPhone e Android;
  4. esportazione manuale del file, con promemoria (rete di sicurezza; resta l'unica via se il cloud non è collegato).
- **Sicurezza del collegamento al cloud ("super seria"):** OAuth 2.0 con PKCE direttamente dal browser, nessun segreto nel
  codice, permessi minimi (solo la cartella privata dell'app: Drive `appDataFolder`, Dropbox "App folder", OneDrive
  `approot`), mai accesso agli altri file dell'utente; token di breve durata conservati solo sul dispositivo e mai nel
  backup; pulsante "Scollega" che revoca l'accesso; cifratura facoltativa (consigliata) del backup con una password dei
  genitori prima dell'invio (AES-GCM, Web Crypto). Ogni modifica a questa parte va verificata con l'agente
  `security-reviewer`. Domini dei provider aggiunti alla CSP solo quando si implementa.
- **Formato di export unico: un solo file `nome.picspeak`** (archivio zip, scritto dal tool senza librerie esterne) con
  `manifest.json` (versione del formato, data, contenuto, tipo: backup completo o modello), dati in JSON e immagini.
  Sostituisce il precedente `.caa.json`. Lo stesso formato serve per backup, spostamento tra dispositivi e modelli del
  terapista.
- **Importazione selettiva:** il tool mostra cosa contiene il file e chiede cosa importare: schede, T9, impostazioni
  grafiche, altre impostazioni (e contesti).
  - impostazioni grafiche e altre impostazioni: sostituiscono quelle presenti;
  - schede: per ogni scheda con lo stesso nome si chiede "sostituisci" o "aggiungi come nuova";
  - T9 (proposta): **unisci** (predefinito: somma dei conteggi, mantenendo le date per il decadimento nel tempo) oppure
    **sostituisci**, a scelta.
- **Modelli del terapista:** il terapista crea in autonomia impaginazioni/insiemi di schede, li salva come `.picspeak`
  di tipo "modello" e li importa per altri bambini. Si applicano sempre in aggiunta al risultato del tutorial, che parte
  da schede predefinite diverse per bambino e per adulto.
- **Griglia automatica:** si preferisce la disposizione che fa stare tutte le tessere senza scorrere (es. 4×4 sul telefono
  in verticale); sotto i 76 px di larghezza la griglia scorre invece di stringersi. Se una parola non entra nemmeno al
  carattere minimo, va a capo sillabando con il trattino (mai fuori dal bordo).
- **Barra delle impostazioni sbloccate sempre su una riga:** su telefono "Impostazioni" diventa solo l'icona ⚙ e
  "Torna alla comunicazione" diventa "Fine". Il controllo grafico verifica anche questo.
- **Formato dei dati approvato** (`docs/FORMATO-DATI.md`), con il vincolo di non appesantire peso dei file e fluidità.
- **Fonti dei simboli verificate il 15/11/2026 (accesso diretto, nessuna chiave personale, nessun costo):**
  | Fonte | Licenza | Accesso | Permessi da chiedere |
  |---|---|---|---|
  | ARASAAC | CC BY-NC-SA 4.0 | API pubblica `api.arasaac.org`, immagini con CORS aperto | nessuno (attribuzione obbligatoria) |
  | Global Symbols (raccolta) | varia per set | API pubblica: "Public endpoints are available without an API key" (`/api/v1/swagger_doc`), CORS aperto | nessuno; consigliata una mail di cortesia al gestore |
  | Tawasol (Mada) | CC BY-SA 4.0 | tramite Global Symbols (`symbolset=tawasol`), parole in inglese e arabo | nessuno (attribuzione a Mada) |
  | Mulberry | CC BY-SA | tramite Global Symbols e set incluso nel tool | nessuno (attribuzione Steve Lee / Mulberry) |
  | OpenMoji | CC BY-SA 4.0 | set incluso nel tool (e tramite Global Symbols) | nessuno ("OpenMoji – License: CC BY-SA 4.0") |
  | Sclera | CC BY-NC | tramite Global Symbols | nessuno per uso non commerciale (attribuzione www.sclera.be) |
  Esclusi dai set selezionabili: quelli con licenza "ND" (non modificabili: anche il ridimensionamento sarebbe a rischio) o senza
  licenza dichiarata, e quelli a pagamento (Widgit, PCS). Le licenze Creative Commons non sono revocabili per i simboli già
  ottenuti: ciò che è salvato nel tool resta utilizzabile. Le API invece sono servizi gratuiti che potrebbero cambiare: per
  questo ogni simbolo viene salvato in locale e Mulberry/OpenMoji sono inclusi nel tool.
  Le immagini SVG di Global Symbols vengono convertite in PNG sul dispositivo (mai SVG salvati così come sono).
- **Fonti dei simboli – decisione finale: niente Global Symbols** (scelta di Marcello, per evitare ogni dubbio futuro).
  Tutte le fonti si usano direttamente dalla fonte originale, senza chiavi né account:
  | Fonte | Licenza (verificata alla fonte, 15/11/2026) | Come arriva in PicSpeak |
  |---|---|---|
  | ARASAAC | CC BY-NC-SA 4.0 | ricerca online con l'API pubblica `api.arasaac.org` + simboli già inclusi |
  | Mulberry | Creative Commons BY-SA (repository GitHub `mulberrysymbols/mulberry-symbols`) | pacchetto incluso |
  | OpenMoji | CC BY-SA 4.0 (repository GitHub `hfg-gmuend/openmoji`) | pacchetto incluso |
  | Tawasol (Mada) | CC BY-NC 4.0 secondo il sito ufficiale tawasol.mada.org.qa (altrove indicato BY-SA: vale la più restrittiva, comunque compatibile con un tool gratuito) | pacchetto incluso da GitHub/"Download" ufficiale |
  | Sclera | Creative Commons 2.0, uso gratuito non commerciale con attribuzione a www.sclera.be | pacchetto incluso dal "Download" ufficiale |
  Per non appesantire il tool, ogni set aggiuntivo è un **pacchetto separato** (sottoinsieme del vocabolario più utile, con
  indice delle parole) pubblicato sul nostro stesso sito: viene scaricato una sola volta solo se l'adulto attiva quella
  fonte nelle impostazioni, poi funziona offline. Nessuna richiesta di permesso obbligatoria; attribuzione automatica nei
  Crediti. Sostituisce la decisione precedente che usava Global Symbols.
- **Per ora si parte senza Global Symbols e senza Tawasol** (decisione di Marcello): restano nelle idee future "in attesa"
  con il motivo (vedi ROADMAP). Esclusa per ora anche Sclera (in attesa). Fonti attive: ARASAAC (ricerca online),
  Mulberry e OpenMoji (pacchetti inclusi), foto personali.
  Nelle impostazioni ogni fonte ha una breve spiegazione dello stile e di quando conviene sceglierla.
- **Ripristino alle impostazioni iniziali** (richiesta di Marcello, Tappa 5): nella pagina Backup e ripristino un comando
  cancella tutti i dati personalizzati, PIN compreso; al successivo accesso alle impostazioni si crea un nuovo PIN.
  Protezioni: PIN richiesto, proposta di un backup prima di procedere, doppia conferma.
- **Tappa 3 – ricerca dei simboli (15/11/2026).** Pulsante "Cerca simbolo" nella modifica tessera; i risultati si
  mostrano per fonte: "Già sul dispositivo" (subito, anche offline), ARASAAC (online), Mulberry e OpenMoji (pacchetti).
  Motivo: le fonti restano intercambiabili (`js/symbols.js`) e l'adulto vede da dove viene ogni simbolo.
- **Pacchetti Mulberry e OpenMoji: sottoinsieme del vocabolario CAA con parole italiane.** Mulberry 626 simboli (3,8 MB),
  OpenMoji 600 (3,0 MB), WebP 256 px su fondo trasparente, pubblicati in `symbols/packs/<id>/` con `index.json`
  (formato `picspeak-pack` versione 1) e licenza originale. Si scaricano nella Cache Storage (`picspeak-pack-<id>`) solo
  quando l'adulto attiva la fonte, rispettando l'interruttore "Ricerca online"; spegnendo la fonte il pacchetto si toglie
  (i simboli già usati restano nelle tessere). Gli aggiornamenti dell'app non cancellano queste cache.
  Motivo: tool leggero per chi non li usa, offline per chi li usa. Script di generazione in `dev/pacchetti-simboli/`.
- **Dizionario italiano → inglese locale** (`symbols/it-en.json`, ~870 parole CAA, 21 KB, in cache offline): traduce la
  ricerca per i pacchetti e dà le parole italiane ai loro simboli. Se manca una parola: ponte ARASAAC (stesso pittogramma
  in inglese), poi MyMemory. Varianti singolare/plurale semplici (mela/mele, cane/cani).
- **Ogni simbolo scelto si salva una volta** nell'archivio `images` con id stabile (`img_ar_<id>`, `img_mb_<nome>`,
  `img_om_<codice>`): se è già presente si riusa. Ridisegnato su canvas a 256 px (WebP, o PNG dove il browser non scrive
  WebP), con fonte, autore, licenza e parole chiave. Nessuna modifica al formato dei dati (campi già previsti).
- **Content-Security-Policy:** tolti i domini di Global Symbols (fonte esclusa); aggiunto `https://static.arasaac.org` a
  `connect-src`, perché l'immagine scelta va scaricata come dati per ridurla e salvarla (prima era solo in `img-src`).
- **Crediti automatici:** la pagina Crediti elenca ARASAAC (sempre, set incluso) e Mulberry/OpenMoji solo se scaricati o
  usati, con la nota sulla modifica delle immagini (obbligo CC BY-SA), le foto personali e la nota sulla privacy della ricerca.
- **"Solo Wi-Fi" dove il browser non dice il tipo di rete** (iPad, iPhone, PC): la ricerca mostra subito i simboli sul
  dispositivo e un avviso con il pulsante "Cerca anche su internet"; la conferma vale fino alla chiusura della pagina.
