# Sicurezza di PicSpeak

Revisione iniziale: 15/11/2026. Da aggiornare a ogni tappa. Ogni modifica al codice va controllata
con l'agente `.claude/agents/security-reviewer.md` (o con la checklist qui sotto) prima del push.

## Modello di minaccia
PicSpeak è un sito statico (GitHub Pages), senza server né account. I dati (schede, foto, statistiche,
PIN) restano nel browser del dispositivo. Chi vogliamo fermare:
- il **bambino** o un **adulto non autorizzato** che apre le impostazioni e modifica o cancella i dati;
- un **sito esterno** che prova a eseguire codice dentro PicSpeak (XSS) o a ingannare l'utente (iframe);
- un **file importato** (backup, immagine) manipolato per eseguire codice o rompere i dati;
- la **fuga di dati del minore** verso servizi esterni.

Fuori portata (limite dichiarato): chi ha il dispositivo sbloccato in mano e competenze tecniche può leggere
o cancellare i dati del browser. La protezione serve contro l'accesso casuale o non autorizzato, non contro
un attacco informatico mirato. Il file di backup non è cifrato (cifratura facoltativa prevista).

## Esito della revisione (15/11/2026)
| Area | Stato | Note |
|---|---|---|
| Inserimento nel DOM (XSS) | OK | Tutto il testo passa da `textContent`. Unico `innerHTML`: icone SVG costanti nel menu impostazioni. |
| Esecuzione di codice | OK | Nessun `eval`, `new Function`, gestori in stringa, URL `javascript:`. |
| Content Security Policy | Aggiunta | Meta CSP in `index.html`: solo script/stili del sito, rete solo verso ARASAAC, Global Symbols, MyMemory. |
| Iframe / clickjacking | Mitigato | GitHub Pages non permette l'intestazione `frame-ancestors`: se PicSpeak è dentro un iframe le impostazioni non si aprono. |
| PIN | OK | Mai salvato in chiaro: impronta PBKDF2-SHA256, 150.000 iterazioni, sale casuale; attesa crescente dopo 3 errori; codice di recupero salvato solo come impronta. |
| Limiti del PIN | Noto | L'attesa si basa sull'orologio del dispositivo e sui dati del browser: cambiando ora o cancellando i dati si azzera (ma si cancella anche tutto il resto). |
| Parametri dell'indirizzo | OK | Solo `?lang=` accettato, confrontato con l'elenco delle lingue supportate. |
| Service worker | OK | Mette in cache solo file dello stesso sito con richieste GET; le chiamate ad altri siti passano senza cache. |
| Link esterni | OK | Crediti aperti con `noopener noreferrer`; meta `referrer` = `no-referrer`. |
| Dipendenze | OK | Nessuna libreria esterna. |
| Privacy | OK | Nessun tracciamento. In futuro verso l'esterno vanno solo i termini di ricerca dei simboli (e mai se la ricerca online è spenta). |

## Checklist per ogni modifica
1. Testo e dati nel DOM solo con `textContent`/`createElement`; `innerHTML` solo con costanti del codice.
2. Niente `eval`, `new Function`, stringhe in `setTimeout`, gestori `on…` in stringa, `javascript:`.
3. Non allargare la CSP senza registrarlo in `DECISIONI.md` (mai `unsafe-inline`, `unsafe-eval`, `*`).
4. PIN e codice di recupero: mai in chiaro, mai in console, mai nel backup.
5. Dati del minore: nessun invio all'esterno oltre ai termini di ricerca; niente dati personali negli URL.
6. Import di file (Tappa 5): dimensione massima, firma reale del file, niente SVG grezzi, schema JSON e
   `formatVersion` validati prima di scrivere in IndexedDB, nessun campo usato come HTML.
7. Rete: solo HTTPS, solo domini ammessi, rispetto dell'interruttore "Ricerca online".
8. Service worker: cache solo dello stesso sito.
9. Link esterni con `noopener noreferrer`.
10. Nuove librerie: discusse prima, versione fissa e controllo di integrità (SRI).

## Da fare nelle prossime tappe
- Tappa 3: controllare il tipo e la dimensione delle immagini scaricate e caricate; ridimensionarle su canvas
  (rimuove eventuali dati nascosti, compresi i metadati GPS delle foto).
- Tappa 5: validazione rigorosa del backup; cifratura facoltativa con password (AES-GCM, Web Crypto).
- Valutare un PIN più lungo facoltativo per gli adulti che lo desiderano.
