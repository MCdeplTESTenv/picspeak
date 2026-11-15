# Roadmap

## Tappa 0 – Preparazione
- [x] Rispondere alle domande aperte in IDEA.md
- [x] Scegliere il nome del progetto: PicSpeak
- [x] Scegliere la licenza del codice: GPL-3.0
- [ ] Inizializzare repository git e collegarlo a GitHub
- [ ] Attivare GitHub Pages

## Tappa 1 – Prototipo comunicazione (MVP)
- [ ] Pagina unica con griglia di simboli di esempio
- [ ] Tocco → sintesi vocale in italiano
- [ ] Striscia frase con lettura e cancellazione
- [ ] Test su Safari iPad/iPhone e Chrome

## Tappa 2 – Dati e modalità adulto
- [ ] Modello dati (profili, pagine, celle) documentato in docs/FORMATO-DATI.md
- [ ] Salvataggio in IndexedDB
- [ ] Modalità adulto protetta (PIN / pressione prolungata)
- [ ] Creazione/modifica pagine e celle
- [ ] Registrazione locale delle abitudini d'uso (simboli, orari, sequenze) attiva fin da subito

## Tappa 3 – Simboli
- [ ] Struttura a provider intercambiabili per le fonti dei simboli
- [ ] Ricerca ARASAAC in italiano
- [ ] Provider Global Symbols
- [ ] Set di base incluso con licenza libera (es. Mulberry, OpenMoji)
- [ ] Download e salvataggio locale dei pittogrammi (con fonte e licenza)
- [ ] Caricamento immagini personali con compressione automatica
- [ ] Pagina Crediti

## Tappa 4 – Backup
- [ ] Esportazione `.caa.json` (incluse statistiche e regole adattive)
- [ ] Importazione con validazione e migrazione versioni
- [ ] Promemoria backup

## Tappa 5 – PWA e offline
- [ ] manifest.json e icone
- [ ] Service worker per uso offline
- [ ] Istruzioni "Aggiungi a Home" per iOS e Android

## Tappa 6 – Interfaccia adattiva
- [ ] Confermare il modello del T9 (vedi proposta in DECISIONI.md)
- [ ] Interruttore T9 attivo/disattivo (spento di default, schede fisse all'inizio)
- [ ] Regole: simboli frequenti in evidenza, con simboli fondamentali bloccati in posizione
- [ ] Predizione del simbolo successivo ("T9 con le immagini") con decadimento nel tempo
- [ ] Pesi per fascia oraria e giorno feriale/festivo
- [ ] Contesti manuali (es. Mare, Scuola, Casa) con statistiche proprie
- [ ] Pannello adulto per vedere, correggere o azzerare le regole

## Tappa 7 – Rifiniture
- [ ] Registrazione voce per simbolo
- [ ] Colori per categoria (Fitzgerald)
- [ ] Profili multipli
- [ ] Impostazioni griglia e accessibilità
- [ ] Temi e stile non infantile per l'età adulta
- [ ] Eventuale percorso a fasi di scambio guidato (ispirato al metodo PECS, senza usarne il nome)

## Idee future (non pianificate)
- Salvataggio automatico su cloud personale (es. Google Drive) e su file (Chrome/Edge)
- Sincronizzazione casa–scuola
- Suggeritore IA opzionale con chiave dell'utente
- Traduzioni dell'interfaccia
