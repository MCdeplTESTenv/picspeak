/*
 * Dati di prova.
 * Immagini: pittogrammi ARASAAC inclusi nel tool (symbols/arasaac/<id>.png, 300 px),
 * autore Sergio Palao, proprietà Governo di Aragona, licenza CC BY-NC-SA 4.0 (vedi Crediti).
 * L'emoji resta come riserva se l'immagine non si carica.
 *
 * Categoria grammaticale (chiave di Fitzgerald, colori opzionali):
 *   pronoun = persone/pronomi, verb = azioni, noun = cose, adjective = descrizioni,
 *   social = parole sociali, negation = negazioni/stop, folder = apre una pagina.
 */
(function () {
  'use strict';

  // Ogni etichetta ha la versione per ogni lingua supportata
  const symbols = {
    io:        { arasaac: 2617, emoji: '🙋', type: 'pronoun',   label: { it: 'io', en: 'I' } },
    tu:        { arasaac: 2608, emoji: '👉', type: 'pronoun',   label: { it: 'tu', en: 'you' } },
    voglio:    { arasaac: 5441, emoji: '🤲', type: 'verb',      label: { it: 'voglio', en: 'want' } },
    mangiare:  { arasaac: 28641, emoji: '🍽️', type: 'verb',      label: { it: 'mangiare', en: 'eat' } },
    bere:      { arasaac: 29716, emoji: '🥤', type: 'verb',      label: { it: 'bere', en: 'drink' } },
    giocare:   { arasaac: 2439, emoji: '🧸', type: 'verb',      label: { it: 'giocare', en: 'play' } },
    andare:    { arasaac: 2432, emoji: '🚶', type: 'verb',      label: { it: 'andare', en: 'go' } },
    ancora:    { arasaac: 37162, emoji: '🔁', type: 'adjective', label: { it: 'ancora', en: 'more' } },
    basta:     { arasaac: 8289, emoji: '✋', type: 'negation',  label: { it: 'basta', en: 'stop' } },
    non:       { arasaac: 5526, emoji: '🚫', type: 'negation',  label: { it: 'non', en: 'not' } },
    si:        { arasaac: 5584, emoji: '👍', type: 'social',    label: { it: 'sì', en: 'yes' } },
    no:        { arasaac: 5525, emoji: '👎', type: 'negation',  label: { it: 'no', en: 'no' } },
    aiuto:     { arasaac: 32648, emoji: '🆘', type: 'social',    label: { it: 'aiuto', en: 'help' } },
    bagno:     { arasaac: 2430, emoji: '🚽', type: 'noun',      label: { it: 'bagno', en: 'toilet' } },
    finito:    { arasaac: 28429, emoji: '🏁', type: 'adjective', label: { it: 'finito', en: 'finished' } },
    mipiace:   { arasaac: 37758, emoji: '😍', type: 'verb',      label: { it: 'mi piace', en: 'I like' } },

    mela:      { arasaac: 2462, emoji: '🍎', type: 'noun',      label: { it: 'mela', en: 'apple' } },
    banana:    { arasaac: 2530, emoji: '🍌', type: 'noun',      label: { it: 'banana', en: 'banana' } },
    pane:      { arasaac: 2494, emoji: '🍞', type: 'noun',      label: { it: 'pane', en: 'bread' } },
    pasta:     { arasaac: 8652, emoji: '🍝', type: 'noun',      label: { it: 'pasta', en: 'pasta' } },
    pizza:     { arasaac: 2527, emoji: '🍕', type: 'noun',      label: { it: 'pizza', en: 'pizza' } },
    biscotto:  { arasaac: 8312, emoji: '🍪', type: 'noun',      label: { it: 'biscotto', en: 'cookie' } },
    acqua:     { arasaac: 2248, emoji: '💧', type: 'noun',      label: { it: 'acqua', en: 'water' } },
    latte:     { arasaac: 2445, emoji: '🥛', type: 'noun',      label: { it: 'latte', en: 'milk' } },

    palla:     { arasaac: 3241, emoji: '⚽', type: 'noun',      label: { it: 'palla', en: 'ball' } },
    costruzioni: { arasaac: 4935, emoji: '🧱', type: 'noun',    label: { it: 'costruzioni', en: 'blocks' } },
    libro:     { arasaac: 25191, emoji: '📖', type: 'noun',      label: { it: 'libro', en: 'book' } },
    musica:    { arasaac: 24795, emoji: '🎵', type: 'noun',      label: { it: 'musica', en: 'music' } },
    disegnare: { arasaac: 8088, emoji: '🖍️', type: 'verb',      label: { it: 'disegnare', en: 'draw' } },
    tablet:    { arasaac: 28099, emoji: '📱', type: 'noun',      label: { it: 'tablet', en: 'tablet' } },

    felice:    { arasaac: 10192, emoji: '😊', type: 'adjective', label: { it: 'felice', en: 'happy' } },
    triste:    { arasaac: 11959, emoji: '😢', type: 'adjective', label: { it: 'triste', en: 'sad' } },
    arrabbiato:{ arasaac: 21820, emoji: '😠', type: 'adjective', label: { it: 'arrabbiato', en: 'angry' } },
    stanco:    { arasaac: 31925, emoji: '🥱', type: 'adjective', label: { it: 'stanco', en: 'tired' } },
    paura:     { arasaac: 35571, emoji: '😨', type: 'adjective', label: { it: 'ho paura', en: 'scared' } },
    male:      { arasaac: 2367, emoji: '🤕', type: 'adjective', label: { it: 'mi fa male', en: 'it hurts' } },
  };

  // Le cartelle aprono un'altra pagina invece di aggiungere un simbolo alla frase
  const folders = {
    cibo:     { arasaac: 4610, emoji: '🍽️', type: 'folder', target: 'cibo',     label: { it: 'cibo', en: 'food' } },
    giochi:   { arasaac: 9813, emoji: '🎲', type: 'folder', target: 'giochi',   label: { it: 'giochi', en: 'toys' } },
    emozioni: { arasaac: 11476, emoji: '💛', type: 'folder', target: 'emozioni', label: { it: 'come mi sento', en: 'how I feel' } },
  };

  // Pagine: elenco ordinato di identificativi (simboli o cartelle)
  const pages = {
    home: {
      title: { it: 'Home', en: 'Home' },
      cells: ['io', 'voglio', 'non', 'ancora', 'basta', 'aiuto',
              'si', 'no', 'mangiare', 'bere', 'giocare', 'bagno',
              'cibo', 'giochi', 'emozioni', 'finito'],
    },
    cibo: {
      title: { it: 'Cibo', en: 'Food' },
      cells: ['mangiare', 'bere', 'ancora', 'basta', 'mela', 'banana',
              'pane', 'pasta', 'pizza', 'biscotto', 'acqua', 'latte'],
    },
    giochi: {
      title: { it: 'Giochi', en: 'Toys' },
      cells: ['giocare', 'ancora', 'basta', 'mipiace', 'palla', 'costruzioni',
              'libro', 'musica', 'disegnare', 'tablet'],
    },
    emozioni: {
      title: { it: 'Come mi sento', en: 'How I feel' },
      cells: ['io', 'felice', 'triste', 'arrabbiato', 'stanco', 'paura', 'male', 'aiuto'],
    },
  };

  window.PicSpeak = window.PicSpeak || {};
  // Percorso dell'immagine di un simbolo (null se non ha un pittogramma)
  function imageOf(item) {
    return item.arasaac ? `symbols/arasaac/${item.arasaac}.png` : null;
  }

  window.PicSpeak.sampleData = { symbols, folders, pages, homePage: 'home', imageOf };
})();
