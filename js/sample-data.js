/*
 * Dati di prova per la Tappa 1.
 * Le immagini sono emoji di sistema (nessun file, nessuna licenza esterna):
 * verranno sostituite dai simboli ARASAAC / Mulberry / foto nelle tappe successive.
 *
 * Categoria grammaticale (chiave di Fitzgerald, colori opzionali):
 *   pronoun = persone/pronomi, verb = azioni, noun = cose, adjective = descrizioni,
 *   social = parole sociali, negation = negazioni/stop, folder = apre una pagina.
 */
(function () {
  'use strict';

  // Ogni etichetta ha la versione per ogni lingua supportata
  const symbols = {
    io:        { emoji: '🙋', type: 'pronoun',   label: { it: 'io', en: 'I' } },
    tu:        { emoji: '👉', type: 'pronoun',   label: { it: 'tu', en: 'you' } },
    voglio:    { emoji: '🤲', type: 'verb',      label: { it: 'voglio', en: 'want' } },
    mangiare:  { emoji: '🍽️', type: 'verb',      label: { it: 'mangiare', en: 'eat' } },
    bere:      { emoji: '🥤', type: 'verb',      label: { it: 'bere', en: 'drink' } },
    giocare:   { emoji: '🧸', type: 'verb',      label: { it: 'giocare', en: 'play' } },
    andare:    { emoji: '🚶', type: 'verb',      label: { it: 'andare', en: 'go' } },
    ancora:    { emoji: '🔁', type: 'adjective', label: { it: 'ancora', en: 'more' } },
    basta:     { emoji: '✋', type: 'negation',  label: { it: 'basta', en: 'stop' } },
    non:       { emoji: '🚫', type: 'negation',  label: { it: 'non', en: 'not' } },
    si:        { emoji: '👍', type: 'social',    label: { it: 'sì', en: 'yes' } },
    no:        { emoji: '👎', type: 'negation',  label: { it: 'no', en: 'no' } },
    aiuto:     { emoji: '🆘', type: 'social',    label: { it: 'aiuto', en: 'help' } },
    bagno:     { emoji: '🚽', type: 'noun',      label: { it: 'bagno', en: 'toilet' } },
    finito:    { emoji: '🏁', type: 'adjective', label: { it: 'finito', en: 'finished' } },
    mipiace:   { emoji: '😍', type: 'verb',      label: { it: 'mi piace', en: 'I like' } },

    mela:      { emoji: '🍎', type: 'noun',      label: { it: 'mela', en: 'apple' } },
    banana:    { emoji: '🍌', type: 'noun',      label: { it: 'banana', en: 'banana' } },
    pane:      { emoji: '🍞', type: 'noun',      label: { it: 'pane', en: 'bread' } },
    pasta:     { emoji: '🍝', type: 'noun',      label: { it: 'pasta', en: 'pasta' } },
    pizza:     { emoji: '🍕', type: 'noun',      label: { it: 'pizza', en: 'pizza' } },
    biscotto:  { emoji: '🍪', type: 'noun',      label: { it: 'biscotto', en: 'cookie' } },
    acqua:     { emoji: '💧', type: 'noun',      label: { it: 'acqua', en: 'water' } },
    latte:     { emoji: '🥛', type: 'noun',      label: { it: 'latte', en: 'milk' } },

    palla:     { emoji: '⚽', type: 'noun',      label: { it: 'palla', en: 'ball' } },
    costruzioni: { emoji: '🧱', type: 'noun',    label: { it: 'costruzioni', en: 'blocks' } },
    libro:     { emoji: '📖', type: 'noun',      label: { it: 'libro', en: 'book' } },
    musica:    { emoji: '🎵', type: 'noun',      label: { it: 'musica', en: 'music' } },
    disegnare: { emoji: '🖍️', type: 'verb',      label: { it: 'disegnare', en: 'draw' } },
    tablet:    { emoji: '📱', type: 'noun',      label: { it: 'tablet', en: 'tablet' } },

    felice:    { emoji: '😊', type: 'adjective', label: { it: 'felice', en: 'happy' } },
    triste:    { emoji: '😢', type: 'adjective', label: { it: 'triste', en: 'sad' } },
    arrabbiato:{ emoji: '😠', type: 'adjective', label: { it: 'arrabbiato', en: 'angry' } },
    stanco:    { emoji: '🥱', type: 'adjective', label: { it: 'stanco', en: 'tired' } },
    paura:     { emoji: '😨', type: 'adjective', label: { it: 'ho paura', en: 'scared' } },
    male:      { emoji: '🤕', type: 'adjective', label: { it: 'mi fa male', en: 'it hurts' } },
  };

  // Le cartelle aprono un'altra pagina invece di aggiungere un simbolo alla frase
  const folders = {
    cibo:     { emoji: '🍽️', type: 'folder', target: 'cibo',     label: { it: 'cibo', en: 'food' } },
    giochi:   { emoji: '🎲', type: 'folder', target: 'giochi',   label: { it: 'giochi', en: 'toys' } },
    emozioni: { emoji: '💛', type: 'folder', target: 'emozioni', label: { it: 'come mi sento', en: 'how I feel' } },
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
  window.PicSpeak.sampleData = { symbols, folders, pages, homePage: 'home' };
})();
