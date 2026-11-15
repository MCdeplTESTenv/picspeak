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

