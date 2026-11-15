# Pacchetti di simboli (Mulberry, OpenMoji)

Strumenti di sviluppo, non caricati dall'app. Servono a rigenerare `symbols/packs/` e `symbols/it-en.json`.

1. Scaricare le fonti originali in `/tmp/claude-0/src`:
   `git clone --depth 1 https://github.com/mulberrysymbols/mulberry-symbols.git` e
   `git clone --depth 1 --filter=blob:none --sparse https://github.com/hfg-gmuend/openmoji.git`
   (poi `git sparse-checkout set data color/svg`).
2. `dizionario.txt`: vocabolario CAA italiano → inglese (una riga `parola=english|sinonimo`).
3. `python3 build_index.py`: crea il dizionario JSON e sceglie i simboli che hanno una parola italiana
   (Mulberry: massimo 2 varianti per parola, esclusi bandiere, mappe e simboli "rated";
   OpenMoji: massimo 3 per parola, escluse varianti di carnagione, bandiere, marchi ed elementi d'interfaccia).
4. `node raster.js` (Playwright/Chromium): converte gli SVG in WebP 256 px a sfondo trasparente.
5. Copiare in `symbols/packs/<id>/` i file e l'`index.json` (formato `picspeak-pack`, versione 1).

Licenze: Mulberry © Steve Lee, CC BY-SA 4.0; OpenMoji, CC BY-SA 4.0. Le immagini sono state ridimensionate e
convertite in WebP (modifica dichiarata nei Crediti dell'app); i file `LICENSE.txt` originali sono nei pacchetti.
