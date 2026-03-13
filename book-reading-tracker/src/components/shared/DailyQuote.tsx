// src/components/shared/DailyQuote.tsx
// Daily rotating quote — bilingual (EN/ES), plus user-defined custom quotes.
import { useState } from 'react';
import { Plus, X, Check, Trash2 } from 'lucide-react';

interface Quote {
  text: string;
  author: string;
  custom?: boolean;
}

const BUILT_IN_QUOTES: Quote[] = [
  // English
  { text: "A reader lives a thousand lives before he dies. The man who never reads lives only one.", author: "George R.R. Martin" },
  { text: "There is no friend as loyal as a book.", author: "Ernest Hemingway" },
  { text: "Books are a uniquely portable magic.", author: "Stephen King" },
  { text: "A book is a dream that you hold in your hands.", author: "Neil Gaiman" },
  { text: "If you only read the books that everyone else is reading, you can only think what everyone else is thinking.", author: "Haruki Murakami" },
  { text: "We read to know we are not alone.", author: "William Nicholson" },
  { text: "A room without books is like a body without a soul.", author: "Marcus Tullius Cicero" },
  { text: "The more that you read, the more things you will know. The more that you learn, the more places you'll go.", author: "Dr. Seuss" },
  { text: "It is what you read when you don't have to that determines what you will be when you can't help it.", author: "Oscar Wilde" },
  { text: "Reading is to the mind what exercise is to the body.", author: "Joseph Addison" },
  { text: "You can never get a cup of tea large enough or a book long enough to suit me.", author: "C.S. Lewis" },
  { text: "One glance at a book and you hear the voice of another person, perhaps someone dead for 1,000 years.", author: "Italo Calvino" },
  { text: "I declare after all there is no enjoyment like reading!", author: "Jane Austen" },
  { text: "Today a reader, tomorrow a leader.", author: "Margaret Fuller" },
  { text: "Show me a family of readers, and I will show you the people who move the world.", author: "Napoléon Bonaparte" },
  { text: "To read without reflecting is like eating without digesting.", author: "Edmund Burke" },
  { text: "Reading gives us someplace to go when we have to stay where we are.", author: "Mason Cooley" },
  { text: "Not all those who wander are lost.", author: "J.R.R. Tolkien" },
  { text: "So many books, so little time.", author: "Frank Zappa" },
  // Español
  { text: "Uno no es lo que es por lo que escribe, sino por lo que ha leído.", author: "Jorge Luis Borges" },
  { text: "El que lee mucho y anda mucho, ve mucho y sabe mucho.", author: "Miguel de Cervantes" },
  { text: "Los libros son espejos: solo ves en ellos lo que ya llevas dentro.", author: "Carlos Ruiz Zafón" },
  { text: "Vivir sin leer es peligroso, te obliga a contentarte con la vida.", author: "Michel Houellebecq" },
  { text: "Una novela es un espejo que se pasea por un camino real.", author: "Stendhal" },
  { text: "La lectura es el viaje de los que no pueden tomar el tren.", author: "Francis de Croisset" },
  { text: "Los libros son la quietud del espíritu.", author: "Franz Kafka" },
  { text: "Leer es hacer arder el cerebro.", author: "Voltaire" },
  { text: "Hay algo que no puedo hacer sin haberlo leído antes: vivir.", author: "Marguerite Yourcenar" },
  { text: "Siempre imaginé que el paraíso sería algún tipo de biblioteca.", author: "Jorge Luis Borges" },
  { text: "Los libros son los más callados y constantes de los amigos.", author: "Charles W. Eliot" },
  { text: "No hay ningún amigo tan leal como un libro.", author: "Ernest Hemingway" },
  { text: "Un libro abierto es un cerebro que habla; cerrado, un amigo que espera.", author: "Victor Hugo" },
  { text: "Nunca he conocido a un hombre muy moral que fuera incapaz de leer un buen libro.", author: "Walt Whitman" },
  { text: "La diferencia entre quien lee y quien no lee es la diferencia entre el que puede vivir muchas vidas y el que solo vive una.", author: "Mario Vargas Llosa" },
  { text: "Cuánta vida hay en los libros que creemos que nos la quitan.", author: "Günter Grass" },
  { text: "La palabra es mitad de quien la pronuncia y mitad de quien la escucha.", author: "Michel de Montaigne" },
];

const STORAGE_KEY = 'daily_quote_custom';

function loadCustomQuotes(): Quote[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Quote[]) : [];
  } catch {
    return [];
  }
}

function saveCustomQuotes(quotes: Quote[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
}

function getDailyIndex(total: number) {
  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86_400_000,
  );
  return dayOfYear % total;
}

export function DailyQuote() {
  const [customQuotes, setCustomQuotes] = useState<Quote[]>(loadCustomQuotes);
  const [showForm, setShowForm] = useState(false);
  const [showManager, setShowManager] = useState(false);
  const [newText, setNewText] = useState('');
  const [newAuthor, setNewAuthor] = useState('');

  const allQuotes = [...BUILT_IN_QUOTES, ...customQuotes];
  const { text, author, custom } = allQuotes[getDailyIndex(allQuotes.length)];

  function addQuote() {
    if (!newText.trim()) return;
    const updated = [...customQuotes, { text: newText.trim(), author: newAuthor.trim() || 'Anónimo', custom: true }];
    setCustomQuotes(updated);
    saveCustomQuotes(updated);
    setNewText('');
    setNewAuthor('');
    setShowForm(false);
  }

  function deleteCustomQuote(i: number) {
    const updated = customQuotes.filter((_, idx) => idx !== i);
    setCustomQuotes(updated);
    saveCustomQuotes(updated);
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-amber-200/60 dark:border-amber-800/40 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-yellow-950/20">

      {/* Main quote area */}
      <div className="relative px-8 py-6">
        {/* Decorative quotation mark */}
        <span
          className="absolute -top-2 left-4 select-none pointer-events-none font-serif text-amber-300/50 dark:text-amber-700/40"
          style={{ fontSize: '96px', lineHeight: 1 }}
          aria-hidden
        >
          "
        </span>

        <div className="relative pr-4">
          <p className="text-gray-800 dark:text-gray-100 text-base font-medium italic leading-relaxed">
            {text}
          </p>
          <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 tracking-wide">
              — {author}
              {custom && (
                <span className="ml-2 text-xs font-normal text-amber-600/70 dark:text-amber-500/60">(tuya)</span>
              )}
            </p>
            <div className="flex items-center gap-2">
              {customQuotes.length > 0 && (
                <button
                  onClick={() => setShowManager(v => !v)}
                  className="text-xs text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 transition-colors underline underline-offset-2"
                >
                  {showManager ? 'Ocultar mis frases' : `Mis frases (${customQuotes.length})`}
                </button>
              )}
              <button
                onClick={() => { setShowForm(v => !v); setShowManager(false); }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Añadir frase
              </button>
            </div>
          </div>
        </div>

        {/* Subtle corner glow */}
        <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full bg-amber-200/20 dark:bg-amber-700/10 blur-2xl pointer-events-none" />
      </div>

      {/* Add quote form */}
      {showForm && (
        <div className="border-t border-amber-200/60 dark:border-amber-800/40 bg-white/60 dark:bg-gray-800/60 px-8 py-4">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Nueva frase</p>
          <textarea
            className="w-full rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400"
            rows={2}
            placeholder="Escribe la frase..."
            value={newText}
            onChange={e => setNewText(e.target.value)}
          />
          <div className="flex items-center gap-2 mt-2">
            <input
              type="text"
              className="flex-1 rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="Autor (opcional)"
              value={newAuthor}
              onChange={e => setNewAuthor(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addQuote()}
            />
            <button
              onClick={addQuote}
              disabled={!newText.trim()}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white text-xs font-semibold transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              Guardar
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Custom quotes manager */}
      {showManager && customQuotes.length > 0 && (
        <div className="border-t border-amber-200/60 dark:border-amber-800/40 bg-white/60 dark:bg-gray-800/60 px-8 py-4 space-y-2">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Tus frases</p>
          {customQuotes.map((q, i) => (
            <div key={i} className="flex items-start gap-3 group">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 dark:text-gray-200 italic leading-snug">"{q.text}"</p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">— {q.author}</p>
              </div>
              <button
                onClick={() => deleteCustomQuote(i)}
                className="flex-shrink-0 p-1 rounded text-gray-300 hover:text-red-400 dark:text-gray-600 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
