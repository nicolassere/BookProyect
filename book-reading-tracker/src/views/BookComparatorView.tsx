// src/views/BookComparatorView.tsx
// Compare 2-3 books side by side with various metrics
import { useState, useMemo } from 'react';
import { Scale, BookOpen, Star, StarHalf, Clock, TrendingUp, X, Search, Plus, Trophy, Zap } from 'lucide-react';
import { useBooks } from '../contexts/BookContext';
import { getGenreWeight } from '../utils/influenceCalculator';
import type { Reading } from '../types';

interface ComparisonMetric {
  label: string;
  getValue: (book: Reading, daysToRead?: number) => string | number;
  getNumericValue?: (book: Reading, daysToRead?: number) => number;
  higherIsBetter?: boolean;
  format?: 'number' | 'decimal' | 'stars' | 'text';
  icon?: React.ReactNode;
}

const COMPARISON_METRICS: ComparisonMetric[] = [
  {
    label: 'Páginas',
    getValue: (b) => b.pages,
    getNumericValue: (b) => b.pages,
    higherIsBetter: true,
    format: 'number',
    icon: <BookOpen className="w-4 h-4" />,
  },
  {
    label: 'Rating',
    getValue: (b) => b.rating || '-',
    getNumericValue: (b) => b.rating || 0,
    higherIsBetter: true,
    format: 'stars',
    icon: <Star className="w-4 h-4" />,
  },
  {
    label: 'Año Publicación',
    getValue: (b) => b.yearPublished || '-',
    getNumericValue: (b) => b.yearPublished || 0,
    format: 'number',
  },
  {
    label: 'Peso del Género',
    getValue: (b) => `${getGenreWeight(b.genre)}x`,
    getNumericValue: (b) => getGenreWeight(b.genre),
    higherIsBetter: true,
    format: 'decimal',
    icon: <Zap className="w-4 h-4" />,
  },
  {
    label: 'Páginas Ponderadas',
    getValue: (b) => Math.round(b.pages * getGenreWeight(b.genre)),
    getNumericValue: (b) => b.pages * getGenreWeight(b.genre),
    higherIsBetter: true,
    format: 'number',
    icon: <TrendingUp className="w-4 h-4" />,
  },
  {
    label: 'Días de Lectura',
    getValue: (b, days) => days || '-',
    getNumericValue: (b, days) => days || 999,
    higherIsBetter: false,
    format: 'number',
    icon: <Clock className="w-4 h-4" />,
  },
  {
    label: 'Páginas/Día',
    getValue: (b, days) => days ? Math.round(b.pages / days) : '-',
    getNumericValue: (b, days) => days ? b.pages / days : 0,
    higherIsBetter: true,
    format: 'number',
    icon: <TrendingUp className="w-4 h-4" />,
  },
  {
    label: 'Género',
    getValue: (b) => b.genre,
    format: 'text',
  },
  {
    label: 'Nacionalidad',
    getValue: (b) => b.nationality,
    format: 'text',
  },
];

export function BookComparatorView() {
  const { readings } = useBooks();
  const [selectedBooks, setSelectedBooks] = useState<Reading[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Filter books for search
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    return readings
      .filter(r => 
        r.title.toLowerCase().includes(query) ||
        r.author.toLowerCase().includes(query)
      )
      .filter(r => !selectedBooks.some(s => s.id === r.id))
      .slice(0, 10);
  }, [readings, searchQuery, selectedBooks]);

  // Calculate days to read for each selected book
  const booksWithDays = useMemo(() => {
    return selectedBooks.map(book => {
      let daysToRead: number | undefined;
      if (book.startDate && book.dateFinished) {
        const start = new Date(book.startDate);
        const end = new Date(book.dateFinished);
        daysToRead = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
      }
      return { book, daysToRead };
    });
  }, [selectedBooks]);

  const addBook = (book: Reading) => {
    if (selectedBooks.length < 3 && !selectedBooks.some(b => b.id === book.id)) {
      setSelectedBooks([...selectedBooks, book]);
      setSearchQuery('');
      setShowSearch(false);
    }
  };

  const removeBook = (id: string) => {
    setSelectedBooks(selectedBooks.filter(b => b.id !== id));
  };

  // Determine winner for each metric
  const getWinner = (metric: ComparisonMetric): string | null => {
    if (selectedBooks.length < 2 || !metric.getNumericValue) return null;

    const values = booksWithDays.map(({ book, daysToRead }) => ({
      id: book.id,
      value: metric.getNumericValue!(book, daysToRead),
    }));

    // Filter out zeros/invalid values for comparison
    const validValues = values.filter(v => v.value > 0);
    if (validValues.length < 2) return null;

    const sorted = [...validValues].sort((a, b) => 
      metric.higherIsBetter ? b.value - a.value : a.value - b.value
    );

    // Only return winner if there's a clear difference
    if (sorted[0].value !== sorted[1].value) {
      return sorted[0].id;
    }
    return null;
  };

  // Calculate overall winner
  const overallWinner = useMemo(() => {
    if (selectedBooks.length < 2) return null;

    const scores: Record<string, number> = {};
    selectedBooks.forEach(b => scores[b.id] = 0);

    COMPARISON_METRICS.forEach(metric => {
      const winner = getWinner(metric);
      if (winner) scores[winner]++;
    });

    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    if (sorted[0][1] > sorted[1][1]) {
      return { id: sorted[0][0], wins: sorted[0][1] };
    }
    return null;
  }, [selectedBooks, booksWithDays]);

  const getBookColor = (index: number) => {
    const colors = [
      'from-blue-500 to-indigo-600',
      'from-emerald-500 to-teal-600',
      'from-amber-500 to-orange-600',
    ];
    return colors[index];
  };

  const getBookBgColor = (index: number) => {
    const colors = [
      'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
      'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    ];
    return colors[index];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl shadow-lg">
            <Scale className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Comparador de Libros
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Compara hasta 3 libros lado a lado
            </p>
          </div>
        </div>
      </div>

      {/* Book Selection Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0, 1, 2].map((index) => {
          const bookData = booksWithDays[index];
          const book = bookData?.book;

          if (book) {
            return (
              <div 
                key={book.id}
                className={`relative rounded-2xl border-2 p-4 ${getBookBgColor(index)}`}
              >
                {/* Remove Button */}
                <button
                  onClick={() => removeBook(book.id)}
                  className="absolute top-2 right-2 p-1.5 bg-white dark:bg-gray-800 rounded-full shadow hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>

                {/* Winner Badge */}
                {overallWinner?.id === book.id && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-lg">
                    <Trophy className="w-3 h-3" />
                    GANADOR ({overallWinner.wins} métricas)
                  </div>
                )}

                {/* Book Cover */}
                <div className="flex justify-center mb-4">
                  {book.coverUrl ? (
                    <img 
                      src={book.coverUrl} 
                      alt={book.title}
                      className="w-24 h-36 object-cover rounded-lg shadow-lg"
                    />
                  ) : (
                    <div className={`w-24 h-36 rounded-lg bg-gradient-to-br ${getBookColor(index)} flex items-center justify-center`}>
                      <BookOpen className="w-10 h-10 text-white" />
                    </div>
                  )}
                </div>

                {/* Book Info */}
                <div className="text-center">
                  <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 mb-1">
                    {book.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {book.author}
                  </p>
                  {book.rating != null && book.rating > 0 && (
                    <div className="flex justify-center gap-0.5">
                      {[...Array(5)].map((_, i) => {
                        if (i < Math.floor(book.rating!)) {
                          return <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />;
                        } else if (i === Math.floor(book.rating!) && book.rating! % 1 > 0) {
                          return <StarHalf key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />;
                        } else {
                          return <Star key={i} className="w-4 h-4 text-gray-300 dark:text-gray-600" />;
                        }
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          }

          return (
            <button
              key={index}
              onClick={() => setShowSearch(true)}
              className="h-64 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-3 hover:border-pink-400 dark:hover:border-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/10 transition-all cursor-pointer"
            >
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <span className="text-gray-500 dark:text-gray-400 font-medium">
                Agregar libro {index + 1}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 pt-20">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por título o autor..."
                  className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 dark:bg-gray-700 dark:text-white transition-all"
                  autoFocus
                />
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto p-2">
              {searchResults.length > 0 ? (
                searchResults.map(book => (
                  <button
                    key={book.id}
                    onClick={() => addBook(book)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-left"
                  >
                    {book.coverUrl ? (
                      <img src={book.coverUrl} alt="" className="w-10 h-14 object-cover rounded" />
                    ) : (
                      <div className="w-10 h-14 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">{book.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{book.author}</p>
                    </div>
                    <span className="text-xs text-gray-500">{book.pages} pgs</span>
                  </button>
                ))
              ) : searchQuery ? (
                <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No se encontraron libros
                </p>
              ) : (
                <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Escribe para buscar...
                </p>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setShowSearch(false);
                  setSearchQuery('');
                }}
                className="w-full py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Table */}
      {selectedBooks.length >= 2 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-pink-600 dark:text-pink-400" />
              Comparación Detallada
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Métrica
                  </th>
                  {booksWithDays.map(({ book }, index) => (
                    <th key={book.id} className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold text-white bg-gradient-to-r ${getBookColor(index)}`}>
                        {book.title.slice(0, 20)}{book.title.length > 20 ? '...' : ''}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {COMPARISON_METRICS.map((metric) => {
                  const winner = getWinner(metric);
                  
                  return (
                    <tr key={metric.label} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          {metric.icon}
                          {metric.label}
                        </div>
                      </td>
                      {booksWithDays.map(({ book, daysToRead }, index) => {
                        const value = metric.getValue(book, daysToRead);
                        const isWinner = winner === book.id;
                        
                        return (
                          <td 
                            key={book.id} 
                            className={`px-6 py-4 text-center ${isWinner ? 'bg-green-50 dark:bg-green-900/20' : ''}`}
                          >
                            <div className={`flex items-center justify-center gap-2 ${isWinner ? 'text-green-700 dark:text-green-400 font-bold' : 'text-gray-900 dark:text-white'}`}>
                              {metric.format === 'stars' && typeof value === 'number' ? (
                                <div className="flex gap-0.5">
                                  {[...Array(value)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                  ))}
                                </div>
                              ) : (
                                <span className="text-lg">{value}</span>
                              )}
                              {isWinner && (
                                <Trophy className="w-4 h-4 text-amber-500" />
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Instructions */}
      {selectedBooks.length < 2 && (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-2xl">
          <Scale className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400 mb-2">
            Selecciona al menos 2 libros para compararlos
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Haz click en los cuadros de arriba para agregar libros
          </p>
        </div>
      )}
    </div>
  );
}
