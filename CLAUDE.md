# Istruzioni per Claude – Progetto PicSpeak

## Contesto
Tool web gratuito di Comunicazione Aumentativa Alternativa (CAA), ispirato al PECS,
per bambini con disabilità dai 3 anni in su. Deve poter accompagnare il bambino
negli anni e diventare il suo metodo di comunicazione.
Leggi sempre `docs/IDEA.md`, `docs/DECISIONI.md` e `docs/ROADMAP.md` prima di lavorare.

## Vincoli NON negoziabili
- Nessuna installazione richiesta: si apre da browser (e opzionalmente "Aggiungi a Home").
- Nessun server, nessun backend, nessun account: i dati restano sul dispositivo.
- HTML + CSS + JavaScript puro (vanilla). Nessun framework, nessun build step, nessun npm in produzione.
- Deve funzionare su: Safari (iOS/iPadOS/macOS), Chrome, Firefox, Edge; PC, Mac, tablet, smartphone.
- Deve funzionare offline dopo il primo caricamento (PWA con service worker).
- Leggerezza: evitare dipendenze esterne; se indispensabili, discuterle prima e registrarle in DECISIONI.md.
- Hosting previsto: GitHub Pages (solo file statici).

## Utente finale
- Bambino: interfaccia senza testo superfluo, celle grandi, nessun elemento che modifichi i dati.
- Adulto (genitore, logopedista, insegnante): modalità modifica protetta.

## Regole di lavoro
- Lavora per piccole tappe seguendo `docs/ROADMAP.md`; una tappa = uno o più commit chiari.
- Messaggi di commit in italiano, formato: `tipo: descrizione` (feat, fix, docs, refactor, style).
- Quando prendiamo una decisione tecnica, aggiungila a `docs/DECISIONI.md` (data, decisione, motivo).
- A fine tappa aggiorna la ROADMAP (spunta le voci completate).
- Codice commentato in italiano, nomi di variabili/funzioni in inglese.
- Accessibilità: target di tocco ≥ 64px, buon contrasto, nessuna animazione invasiva.
- Prima di modifiche strutturali (formato dati, storage), proponi e chiedi conferma.
- Il formato del file di backup è versionato: ogni modifica richiede una migrazione dai formati precedenti.

## Licenze
- Pittogrammi ARASAAC: CC BY-NC-SA 4.0 (autore Sergio Palao, proprietà Governo di Aragona).
  Obbligo di attribuzione, uso non commerciale. Mantenere sempre la pagina Crediti.
- Codice: GNU GPL-3.0 (file `LICENSE`).
- "PECS" è un marchio registrato: non usarlo nei nomi di funzioni, pulsanti o pagine del tool.
- Più fonti di simboli (ARASAAC, Global Symbols, set di base incluso, immagini personali):
  ogni simbolo salvato conserva fonte e licenza; la pagina Crediti elenca quelle usate.
