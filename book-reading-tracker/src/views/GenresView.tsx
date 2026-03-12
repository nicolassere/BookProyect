// src/views/GenresView.tsx
import { useState, useMemo } from 'react';
import { Tag, TrendingUp, BookOpen, X, Star, StarHalf, ArrowUpDown, BarChart3, FileText } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import type { Stats, Reading } from '../types';

interface GenresViewProps {
  stats: Stats;
  readings?: Reading[];
  onBookClick?: (book: Reading) => void;
}

type SortMode = 'books' | 'avgPages' | 'totalPages';

export function GenresView({ stats, readings = [], onBookClick }: GenresViewProps) {
  const { t } = useLanguage();
  const [sortMode, setSortMode] = useState<SortMode>('books');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  const genreData = useMemo(() => {
    return stats.genreDistribution.map(genre => ({
      ...genre,
      avgPages: Math.round(genre.pages / genre.count),
    })).sort((a, b) => {
      if (sortMode === 'books') return b.count - a.count;
      if (sortMode === 'avgPages') return b.avgPages - a.avgPages;
      return b.pages - a.pages;
    });
  }, [stats.genreDistribution, sortMode]);

  const selectedGenreBooks = useMemo(() => {
    if (!selectedGenre) return [];
    return readings
      .filter(r => r.genre === selectedGenre)
      .sort((a, b) => {
        if (a.parsedDate && b.parsedDate) return b.parsedDate.getTime() - a.parsedDate.getTime();
        return 0;
      });
  }, [readings, selectedGenre]);

  const getCurrentValue = (genre: typeof genreData[0]) => {
    if (sortMode === 'books') return genre.count;
    if (sortMode === 'avgPages') return genre.avgPages;
    return genre.pages;
  };

  const maxValue = useMemo(() => {
    return Math.max(...genreData.map(g => getCurrentValue(g)), 1);
  }, [genreData, sortMode]);

  const getSortLabel = () => {
    if (sortMode === 'books') return 'Libros';
    if (sortMode === 'avgPages') return 'Promedio de Páginas';
    return 'Total de Páginas';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg">
            <Tag className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t.navigation.genres}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {genreData.length} géneros diferentes
            </p>
          </div>
        </div>

        {/* Sort Mode Selector */}
        <div className="flex gap-2 bg-white dark:bg-gray-800 rounded-xl p-1.5 shadow-sm border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setSortMode('books')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              sortMode === 'books'
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Libros
          </button>
          <button
            onClick={() => setSortMode('avgPages')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              sortMode === 'avgPages'
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Promedio
          </button>
          <button
            onClick={() => setSortMode('totalPages')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              sortMode === 'totalPages'
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <ArrowUpDown className="w-4 h-4" />
            Total
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6 border-2 border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-orange-700 dark:text-orange-300 uppercase tracking-wide mb-1">Total Géneros</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{genreData.length}</p>
            </div>
            <div className="p-3 bg-orange-600 dark:bg-orange-500 rounded-xl">
              <Tag className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-6 border-2 border-amber-200 dark:border-amber-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wide mb-1">Total Libros</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{readings.length}</p>
            </div>
            <div className="p-3 bg-amber-600 dark:bg-amber-500 rounded-xl">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-xl p-6 border-2 border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-red-700 dark:text-red-300 uppercase tracking-wide mb-1">Género Top</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white truncate">{genreData[0]?.genre || 'N/A'}</p>
            </div>
            <div className="p-3 bg-red-600 dark:bg-red-500 rounded-xl">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Géneros por {getSortLabel()}
          </h3>
        </div>

        <div className="space-y-4">
          {genreData.map((genre, i) => {
            const value = getCurrentValue(genre);
            const percentage = (value / maxValue) * 100;

            return (
              <div
                key={genre.genre}
                onClick={() => setSelectedGenre(genre.genre)}
                className="group cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-1.5">
                  <span className="text-sm font-bold text-orange-600 dark:text-orange-400 w-6">
                    #{i + 1}
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white flex-1 truncate group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {genre.genre}
                  </span>
                  {genre.averageRating > 0 && (
                    <span className="flex items-center gap-0.5 text-xs text-amber-600 dark:text-amber-400">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {genre.averageRating.toFixed(1)}
                    </span>
                  )}
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {sortMode === 'totalPages' ? value.toLocaleString() : value}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-10 relative overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-orange-400 via-orange-500 to-red-600 rounded-full transition-all duration-700 ease-out flex items-center justify-end px-4 group-hover:from-orange-500 group-hover:via-orange-600 group-hover:to-red-700"
                      style={{ width: `${Math.max(percentage, 3)}%` }}
                    >
                      <span className="text-xs font-bold text-white drop-shadow-lg">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end text-xs text-gray-600 dark:text-gray-400 min-w-[80px]">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {genre.count} libros
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {genre.avgPages} pgs avg
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {genreData.length === 0 && (
        <div className="text-center py-12">
          <Tag className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400">No hay datos de géneros disponibles</p>
        </div>
      )}

      {/* Book list modal */}
      {selectedGenre && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-600 px-8 py-6 z-10 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-1">{selectedGenre}</h2>
                  <p className="text-white/90 text-sm">
                    {selectedGenreBooks.length} {selectedGenreBooks.length === 1 ? 'libro' : 'libros'}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedGenre(null)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-all"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            <div className="p-8">
              {selectedGenreBooks.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <p className="text-gray-500 dark:text-gray-400">No hay libros en este género</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedGenreBooks.map((book, index) => (
                    <div
                      key={book.id}
                      onClick={() => { if (onBookClick) { setSelectedGenre(null); onBookClick(book); } }}
                      className={`flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-2 border-orange-200 dark:border-orange-800 hover:border-orange-400 dark:hover:border-orange-600 transition-all${onBookClick ? ' cursor-pointer' : ''}`}
                    >
                      {book.coverUrl && (
                        <img
                          src={book.coverUrl}
                          alt={book.title}
                          className="w-16 h-24 object-cover rounded-lg shadow-md flex-shrink-0"
                          onError={(e) => e.currentTarget.style.display = 'none'}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">{book.title}</h3>
                          <span className="text-sm font-bold text-orange-600 dark:text-orange-400 whitespace-nowrap">#{index + 1}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          por <span className="font-semibold">{book.author}</span>
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            {book.pages} páginas
                          </span>
                          {book.dateFinished && <span>• {book.dateFinished}</span>}
                          {book.rating != null && book.rating > 0 && (
                            <span className="flex items-center gap-1">
                              •
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => {
                                  if (i < Math.floor(book.rating!)) return <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />;
                                  if (i === Math.floor(book.rating!) && book.rating! % 1 > 0) return <StarHalf key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />;
                                  return <Star key={i} className="w-3 h-3 text-gray-300 dark:text-gray-600" />;
                                })}
                              </div>
                            </span>
                          )}
                        </div>
                        {book.notes && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">{book.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
