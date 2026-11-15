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
- [x] Modalità adulto protetta: lucchetto da tenere premuto 3 s + PIN (impronta PBKDF2), attesa crescente
      dopo errori, codice di recupero, uscita manuale e automatica dopo 5 minuti
- [x] Pagina impostazioni: Installa come app, Accesso guidato (istruzioni), Lingua, Voce, Cambia PIN
- [x] Voce: scelta automatica della migliore, selettore, velocità, tono, prova e guida alle voci migliorate
- [x] Grafica "Colore pieno" predefinita e scelta della modalità colori (Colore pieno, Bordo colorato, Neutro)
- [x] Impostazioni divise in categorie (menu laterale su tablet/PC, elenco su telefono)
- [ ] PIN collaboratore (logopedista, insegnanti) con permessi ridotti
- [ ] Creazione/modifica pagine e celle
- [ ] Colore di sfondo per singola cella, con pulsante "Ripristina colore Fitzgerald"
- [ ] Contesti (Casa, Scuola, Mare, personalizzati): creazione, attivazione/disattivazione rapida, archivio intatto
- [ ] Registrazione locale delle abitudini d'uso (simboli, orari, sequenze) attiva fin da subito

## Tappa 3 – Simboli
- [ ] Struttura a provider intercambiabili per le fonti dei simboli
- [ ] Ricerca ARASAAC in italiano
- [ ] Ricerca in italiano propagata in inglese (ponte ARASAAC, dizionario locale, MyMemory come riserva)
- [ ] Provider Global Symbols
- [ ] Set di base incluso con licenza libera (es. Mulberry, OpenMoji)
- [ ] Download unico, ridimensionamento (~256 px) e salvataggio locale dei pittogrammi (con fonte e licenza)
- [ ] Ricerca offline: simboli già salvati + set incluso; cella solo testo come ultima riserva
- [ ] Caricamento immagini personali con compressione automatica
- [ ] Pagina Crediti

## Tappa 4 – Template di base e tutorial iniziale
- [ ] Definire il template di base (vocabolario core + categorie personali) e rivederlo con la logopedista
- [ ] Versione italiana e inglese del template
- [ ] Tutorial iniziale per l'adulto: domande saltabili, interrompibile e riprendibile
- [ ] Personalizzazione automatica delle schede dalle risposte (nomi, foto, preferenze, numero di celle)
- [ ] Conoscenza iniziale del T9 a partire dalle risposte

## Tappa 5 – Backup
- [ ] Richiesta di memoria persistente (`navigator.storage.persist()`)
- [ ] Esportazione `.caa.json` (immagini, schede, statistiche e regole adattive)
- [ ] Importazione con validazione e migrazione versioni
- [ ] Impostazione adulto "Cartella di backup" (Chrome/Edge): salvataggio automatico dopo ogni modifica,
      immagini come file separati, copie a rotazione del file dati
- [ ] Riconferma dell'accesso alla cartella alla riapertura
- [ ] iPad/iPhone/Firefox/Android: promemoria periodico con salvataggio tramite pannello di condivisione
- [ ] Indicatore "Ultimo backup: X giorni fa" e ripristino guidato

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
- [x] Selettore lingua nelle impostazioni (italiano/inglese)
- [ ] Eventuale percorso a fasi di scambio guidato (ispirato al metodo PECS, senza usarne il nome)

## Idee future (non pianificate)
- Salvataggio automatico su cloud personale (es. Google Drive) e su file (Chrome/Edge)
- Sincronizzazione casa–scuola
- Suggeritore IA opzionale con chiave dell'utente
- Altre lingue oltre a italiano e inglese
