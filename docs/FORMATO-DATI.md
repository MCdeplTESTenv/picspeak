# Formato dei dati – PROPOSTA (da confermare)

Stato: proposta del 15/11/2026, in attesa di conferma di Marcello. Nessun dato reale viene ancora
salvato con questo schema. Ogni modifica futura richiede un nuovo `formatVersion` e una migrazione.

## Principi
- Tutto resta sul dispositivo (IndexedDB, database `picspeak`). Niente server.
- Ogni elemento ha un identificativo stabile (`id`, stringa casuale) che non cambia mai: serve per
  backup, import selettivo, statistiche del T9 e modelli del terapista.
- Le immagini sono salvate una sola volta e riusate (archivio `images`), con fonte e licenza.
- Le posizioni delle celle sono esplicite (riga, colonna): la griglia può crescere senza spostare
  le tessere esistenti (pianificazione motoria).
- Il file di export `nome.picspeak` contiene esattamente questi dati (vedi in fondo).

## Archivi IndexedDB (versione 2)

| Archivio | Chiave | Contenuto |
|---|---|---|
| `settings` | nome | impostazioni del dispositivo (già esistente: PIN, lingua, aspetto, voce…) |
| `profiles` | `id` | una persona che usa PicSpeak (più profili sullo stesso dispositivo) |
| `pages` | `id` | schede (Home, Cibo, Giochi…) di un profilo |
| `images` | `id` | immagini (pittogrammi scaricati, foto, set incluso) con fonte e licenza |
| `contexts` | `id` | contesti (Casa, Scuola, Mare…) di un profilo |
| `usage` | `id` | statistiche d'uso per il T9 (Tappa 7) |
| `audio` | `id` | registrazioni vocali per simbolo (Tappa 8) |

### Profilo
```json
{
  "id": "p_7f3a…",
  "name": "Luca",
  "kind": "child",            // "child" | "adult" (schede predefinite diverse)
  "language": "it",
  "homePageId": "pg_home…",
  "activeContextIds": ["ctx_casa…"],
  "createdAt": "2026-11-15T20:00:00Z",
  "updatedAt": "…"
}
```

### Scheda (pagina)
```json
{
  "id": "pg_cibo…",
  "profileId": "p_7f3a…",
  "title": "Cibo",
  "grid": { "rows": 3, "cols": 4 },        // griglia esplicita; "auto" possibile per le schede semplici
  "contextIds": [],                         // vuoto = sempre visibile; altrimenti solo nei contesti indicati
  "cells": [
    {
      "id": "c_mela…",
      "row": 1, "col": 0,                   // posizione fissa
      "kind": "symbol",                     // "symbol" | "folder" | "empty" (mantiene il posto)
      "label": "mela",
      "speak": "mela",                      // testo pronunciato, se diverso dalla parola mostrata
      "imageId": "img_ar_2462",
      "wordType": "noun",                   // categoria grammaticale → colore Fitzgerald automatico
      "color": null,                        // null = colore Fitzgerald; "#RRGGBB" = scelto a mano
      "targetPageId": null,                 // per le cartelle
      "hidden": false,                      // nascosta temporaneamente senza cancellarla
      "locked": false,                      // "core": il T9 non la sposta mai
      "audioId": null
    }
  ],
  "updatedAt": "…"
}
```

### Immagine
```json
{
  "id": "img_ar_2462",
  "source": "arasaac",                      // "arasaac" | "globalsymbols:<set>" | "mulberry" | "openmoji" | "photo"
  "sourceId": "2462",
  "author": "Sergio Palao",
  "license": "CC BY-NC-SA 4.0",
  "licenseUrl": "https://creativecommons.org/licenses/by-nc-sa/4.0/",
  "mime": "image/png",                      // png | jpeg | webp (mai SVG grezzi)
  "blob": "<Blob ~256 px>",
  "keywords": { "it": ["mela"], "en": ["apple"] },
  "addedAt": "…"
}
```
La pagina Crediti si costruisce da sola leggendo le fonti presenti in `images`.

### Contesto
```json
{ "id": "ctx_mare…", "profileId": "p_7f3a…", "name": "Mare", "active": false,
  "schedule": null }                        // in futuro: { "from": "08-01", "to": "08-15" }
```

### Statistiche d'uso (Tappa 7, qui solo per completezza)
```json
{ "id": "u_…", "profileId": "p_7f3a…", "contextId": null,
  "cellId": "c_mela…", "prevCellId": "c_voglio…",   // coppia per i bigrammi
  "count": 12.4,                                     // valore che decade nel tempo
  "lastUsed": "…", "byHour": [0,0,…24], "weekday": 7.1, "holiday": 2.3 }
```

## File di export `nome.picspeak`
Archivio zip con:
```
manifest.json        { "format": "picspeak", "formatVersion": 1, "kind": "backup" | "template",
                       "createdAt": "…", "app": "PicSpeak", "contents": ["pages","images","usage","appearance","settings","contexts"] }
profile.json
pages.json
contexts.json
usage.json
settings.json        (senza PIN, codice di recupero e accessi al cloud)
appearance.json
images/<id>.<ext>
images.json          (metadati: fonte, licenza, parole chiave)
```
- Un "modello del terapista" è lo stesso formato con `kind: "template"` e solo `pages`, `images` (e
  facoltativamente `appearance`).
- All'importazione si leggono `manifest.json` e `contents` per proporre la scelta di cosa importare.
- Controlli all'importazione: dimensione massima, firma reale delle immagini, schema JSON, versione.

## Migrazione
- Versione database 1 → 2: si creano i nuovi archivi; le schede di prova attuali (`sample-data.js`)
  diventano il primo profilo predefinito "bambino".
