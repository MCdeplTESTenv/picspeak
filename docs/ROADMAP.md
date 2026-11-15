# Roadmap

## Tappa 0 – Preparazione
- [x] Rispondere alle domande aperte in IDEA.md
- [x] Scegliere il nome del progetto: PicSpeak
- [x] Scegliere la licenza del codice: GPL-3.0
- [x] Inizializzare repository git e collegarlo a GitHub
- [x] Attivare GitHub Pages (https://mcdepltestenv.github.io/picspeak/)

## Tappa 1 – Prototipo comunicazione (MVP)
- [x] Pagina unica con griglia di simboli di esempio (emoji di prova, pagine Cibo/Giochi/Come mi sento)
- [x] Tocco → sintesi vocale in italiano
- [x] Striscia frase con lettura e cancellazione
- [x] Testi dell'interfaccia in dizionari per lingua (`it`, `en`) fin dall'inizio
- [ ] Test su Safari iPad/iPhone e Chrome (fatto su Chrome desktop e in simulazione tablet/telefono; manca la prova su iPad reale)

## Tappa 2 – Dati e modalità adulto
- [ ] Modello dati (profili, pagine, celle, contesti) documentato in docs/FORMATO-DATI.md
- [ ] Salvataggio in IndexedDB
- [x] Impostazioni protette: lucchetto da tenere premuto 3 s + PIN (impronta PBKDF2), attesa crescente
      dopo errori, codice di recupero, uscita manuale e automatica dopo 5 minuti
- [x] Pagina impostazioni: Installa come app, Accesso guidato (istruzioni), Lingua, Voce, Cambia PIN
- [x] Voce: scelta automatica della migliore, selettore, velocità, tono, prova e guida alle voci migliorate
- [x] Grafica "Colore pieno" predefinita e scelta della modalità colori (Colore pieno, Bordo colorato, Neutro)
- [x] Impostazioni divise in categorie (menu laterale su tablet/PC, elenco su telefono)
- [x] Colore di sfondo della pagina selezionabile (colori pronti o a scelta)
- [x] Modalità "Scheda" predefinita (stile tabelle stampate) e scrittura delle parole MAIUSCOLO/minuscolo
- [x] Modalità "Fogli" (cartelle come fogli con l'angolo piegato) e sfondo "Automatico"
- [x] Personalizzazioni grafiche: colore simboli, immagine/parola, posizione parola, testo, carattere, spaziatura,
      bordi, angoli, posizione frase e pulsanti, nome pagina, evidenziazione al tocco
- [x] Impostazioni ridisegnate con righe e controlli a segmenti
- [x] Dieci stili pronti da cui partire, poi personalizzabili (riquadro immagine, trasparenza celle)
- [x] Barra Percorso (HOME › pagina), icone a linea, "scuoti per ricominciare" e "spingi via" la frase
- [ ] PIN collaboratore (logopedista, insegnanti) con permessi ridotti
- [ ] Profilo adulto: la persona, diventata adulta, usa e gestisce il tool in autonomia (distinto dalle impostazioni protette)
- [ ] Creazione/modifica pagine e celle
- [ ] Colore di sfondo per singola cella, con pulsante "Ripristina colore Fitzgerald"
- [ ] Modello dati con griglia esplicita (righe × colonne) e posizione fissa di ogni cella, per poter crescere fino a ~12×10
- [ ] Contesti (Casa, Scuola, Mare, personalizzati): creazione, attivazione/disattivazione rapida, archivio intatto
- [ ] Registrazione locale delle abitudini d'uso (simboli, orari, sequenze) attiva fin da subito

## Tappa 3 – Simboli
- [x] Pittogrammi ARASAAC inclusi per i simboli di prova (anticipato)
- [x] Pagina Crediti (anticipata)
- [x] Interruttore ricerca online: attiva / solo Wi-Fi / disattivata (anticipato)
- [ ] La ricerca rispetta l'interruttore (blocca, consente o chiede conferma)
- [ ] Struttura a provider intercambiabili per le fonti dei simboli
- [ ] Ricerca ARASAAC in italiano
- [ ] Ricerca in italiano propagata in inglese per i pacchetti con parole inglesi (ponte ARASAAC, dizionario locale, MyMemory come riserva)
- [ ] Pacchetti Mulberry e OpenMoji (sottoinsieme + indice parole), scaricati solo se attivati
- [ ] Download unico, ridimensionamento (~256 px) e salvataggio locale dei pittogrammi (con fonte e licenza)
- [ ] Ricerca offline: simboli già salvati + set incluso; cella solo testo come ultima riserva
- [ ] Caricamento immagini personali con compressione automatica

## Tappa 4 – Template di base e tutorial iniziale
- [ ] Definire il template di base (vocabolario core + categorie personali) e rivederlo con la logopedista
- [ ] Versione italiana e inglese del template
- [ ] Template denso per utenti esperti/adulti: riga di categorie, core fisso Fitzgerald, accesso a tastiera
- [ ] Schede predefinite diverse per bambino e per adulto, punto di partenza del tutorial
- [ ] Modelli del terapista: creare, salvare (`.picspeak` di tipo modello) e importare insiemi di schede, in aggiunta al tutorial
- [ ] Tutorial iniziale per l'adulto: domande saltabili, interrompibile e riprendibile
- [ ] Personalizzazione automatica delle schede dalle risposte (nomi, foto, preferenze, numero di celle)
- [ ] Conoscenza iniziale del T9 a partire dalle risposte

## Tappa 5 – Backup (automatico: requisito fondamentale)
- [ ] Richiesta di memoria persistente (`navigator.storage.persist()`)
- [ ] Formato unico `nome.picspeak` (zip senza librerie: manifest + JSON + immagini), versionato con migrazioni
- [ ] Esportazione completa e importazione **selettiva** (schede, T9, impostazioni grafiche, altre impostazioni)
      con scelte per conflitti: sostituisci/aggiungi per le schede, unisci/sostituisci per il T9
- [ ] Validazione rigorosa dei file importati (dimensione, firma dei file, schema, versione)
- [ ] Livelli di backup attivabili nelle impostazioni, con stato "Ultimo backup: …"
- [ ] Cartella automatica (Chrome/Edge desktop), copie a rotazione, riconferma dell'accesso
- [ ] Cloud personale automatico (Google Drive / Dropbox / OneDrive): OAuth PKCE dal browser, solo cartella privata
      dell'app, token solo sul dispositivo, "Scollega", cifratura facoltativa con password; revisione di sicurezza
- [ ] Promemoria con pannello di condivisione come rete di sicurezza (unica via se il cloud non è collegato)
- [ ] Ripristino guidato
- [ ] "Ripristina PicSpeak alle impostazioni iniziali" (pagina Backup e ripristino): cancella schede, immagini, T9,
      impostazioni e PIN; richiede il PIN, propone prima un backup e chiede una doppia conferma; al successivo accesso
      alle impostazioni si crea un nuovo PIN

## Tappa 6 – PWA e offline
- [x] manifest e icone (anticipato per il pulsante "Installa")
- [x] Service worker "prima la rete" per uso offline (anticipato; da verificare offline su iPad)
- [x] Istruzioni "Aggiungi a Home" per iOS e Android (nelle impostazioni)

## Tappa 7 – Interfaccia adattiva
- [ ] Confermare il modello del T9 (vedi proposta in DECISIONI.md)
- [ ] Interruttore T9 attivo/disattivo (spento di default, schede fisse all'inizio)
- [ ] Regole: simboli frequenti in evidenza, con simboli fondamentali bloccati in posizione
- [ ] Predizione del simbolo successivo ("T9 con le immagini") con decadimento nel tempo
- [ ] Pesi per fascia oraria e giorno feriale/festivo
- [ ] Statistiche T9 separate per contesto, riprese intatte alla riattivazione
- [ ] Attivazione programmata dei contesti per date (facoltativa)
- [ ] Pannello adulto per vedere, correggere o azzerare le regole

## Tappa 8 – Rifiniture
- [ ] Registrazione voce per simbolo
- [ ] Colori per categoria (Fitzgerald)
- [ ] Profili multipli
- [ ] Impostazioni griglia e accessibilità
- [ ] Temi e stile non infantile per l'età adulta
- [ ] Livelli di griglia (2×2 … 12×10) con passaggio che mantiene la posizione delle tessere esistenti
- [ ] Stile ad alta densità: testo piccolo ma netto, bordi e spazi proporzionati, stesse tessere riconoscibili
- [ ] Altre personalizzazioni previste: numero di righe/colonne e celle fisse, dimensione minima delle celle,
      contorno spesso intorno all'immagine (ipovisione), cornice o sfondo dietro l'immagine, cella nascosta
      temporaneamente senza cancellarla, cella "vuota" per mantenere la posizione, ritardo/tempo di pressione
      per evitare tocchi accidentali (tremori), ignorare i tocchi ripetuti, scansione a sensore/switch,
      selezione per sosta (dwell) con puntatore o sguardo, ingrandimento della cella toccata, suono al tocco,
      zoom della striscia frase, schermo intero e blocco rotazione, tema scuro per uso serale
- [x] Selettore lingua nelle impostazioni (italiano/inglese)
- [ ] Eventuale percorso a fasi di scambio guidato (ispirato al metodo PECS, senza usarne il nome)

## Tappa 9 – Manuale (finale)
- [ ] Pagina di aiuto consultabile da telefono e tablet, aperta da un pulsante "?" nelle impostazioni
- [ ] Spiegazioni brevi per argomento (comunicare, cartelle, frase, impostazioni, backup, stili, sicurezza),
      con immagini e passi numerati; disponibile anche offline
- [ ] Versione italiana e inglese

## Idee future (non pianificate)
- **In attesa – Global Symbols** (raccolta di molti set): lasciato fuori perché è un servizio di terzi la cui API
  potrebbe in futuro richiedere una chiave o cambiare condizioni; si preferiscono le fonti originali.
- **In attesa – Tawasol** (simboli arabi di Mada, Qatar): licenza incerta (BY-NC secondo il sito ufficiale, BY-SA
  altrove) e parole solo in inglese e arabo; da riprendere se arriva un utente arabofono, dopo aver chiarito la licenza.
- **In attesa – Sclera** (pittogrammi bianchi su fondo nero, ad alto contrasto, utili per l'ipovisione): gratuito per
  uso non commerciale con attribuzione a sclera.be, rimandato per tenere il tool snello; da riprendere se serve un set
  ad alto contrasto.
- Sincronizzazione casa–scuola
- Suggeritore IA opzionale con chiave dell'utente
- Tastiera con predizione di parole e affissi/morfologia (plurali, tempi verbali) per chi scrive
- Altre lingue oltre a italiano e inglese
