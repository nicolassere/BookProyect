// src/views/GenresView.tsx - ENHANCED
import { useState, useMemo } from 'react';
import { Tag, TrendingUp, BookOpen, X, Star, ArrowUpDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import type { Stats, Reading } from '../types';

interface GenresViewProps {
  stats: Stats;
  readings?: Reading[];
}

type SortMode = 'books' | 'avgPages' | 'totalPages';

export function GenresView({ stats, readings = [] }: GenresViewProps) {
  const { t } = useLanguage();
  const [sortMode, setSortMode] = useState<SortMode>('books');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  // Calcular datos de géneros con todas las métricas
  const genreData = useMemo(() => {
    return stats.genreDistribution.map(genre => ({
      ...genre,
      avgPages: Math.round(genre.pages / genre.count),
    })).sort((a, b) => {
      if (sortMode === 'books') return b.count - a.count;
      if (sortMode === 'avgPages') return b.avgPages - a.avgPages;
      return b.pages - a.pages; // totalPages
    });
  }, [stats.genreDistribution, sortMode]);

  // Libros del género seleccionado
  const selectedGenreBooks = useMemo(() => {
    if (!selectedGenre) return [];
    return readings
      .filter(r => r.genre === selectedGenre)
      .sort((a, b) => {
        // Ordenar por fecha, más recientes primero
        if (a.parsedDate && b.parsedDate) {
          return b.parsedDate.getTime() - a.parsedDate.getTime();
        }
        return 0;
      });
  }, [readings, selectedGenre]);

  const getSortLabel = () => {
    if (sortMode === 'books') return 'Libros';
    if (sortMode === 'avgPages') return 'Promedio de Páginas';
    return 'Total de Páginas';
  };

  const getCurrentValue = (genre: typeof genreData[0]) => {
    if (sortMode === 'books') return genre.count;
    if (sortMode === 'avgPages') return genre.avgPages;
    return genre.pages;
  };

  const maxValue = useMemo(() => {
    return Math.max(...genreData.map(g => getCurrentValue(g)), 1);
  }, [genreData, sortMode]);

  // Colores naranjas para las tarjetas
  const getCardColor = (index: number) => {
    const colors = [
      'from-orange-500 to-red-600',
      'from-orange-400 to-orange-600',
      'from-amber-500 to-orange-500',
      'from-amber-400 to-orange-600',
      'from-orange-400 to-red-500',
      'from-amber-500 to-red-500',
      'from-yellow-500 to-orange-500',
      'from-orange-300 to-orange-500',
      'from-amber-400 to-amber-600',
      'from-orange-500 to-amber-600',
    ];
    return colors[index % colors.length];
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
              <p className="text-sm font-semibold text-orange-700 dark:text-orange-300 uppercase tracking-wide mb-1">
                Total Géneros
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {genreData.length}
              </p>
            </div>
            <div className="p-3 bg-orange-600 dark:bg-orange-500 rounded-xl">
              <Tag className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-6 border-2 border-amber-200 dark:border-amber-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wide mb-1">
                Total Libros
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {readings.length}
              </p>
            </div>
            <div className="p-3 bg-amber-600 dark:bg-amber-500 rounded-xl">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-xl p-6 border-2 border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-red-700 dark:text-red-300 uppercase tracking-wide mb-1">
                Género Top
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white truncate">
                {genreData[0]?.genre || 'N/A'}
              </p>
            </div>
            <div className="p-3 bg-red-600 dark:bg-red-500 rounded-xl">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Genre Cards Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-6">
          <Tag className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Géneros ordenados por {getSortLabel()}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {genreData.map((genre, index) => {
            const percentage = (getCurrentValue(genre) / maxValue) * 100;
            
            return (
              <div
                key={genre.genre}
                onClick={() => setSelectedGenre(genre.genre)}
                className="group cursor-pointer"
              >
                <div className={`p-6 rounded-2xl bg-gradient-to-br ${getCardColor(index)} transition-all duration-300 transform hover:scale-105 hover:shadow-2xl`}>
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-white truncate pr-2">
                      {genre.genre}
                    </h3>
                    <span className="text-xs font-bold text-white/80 bg-white/20 px-2 py-1 rounded-full">
                      #{index + 1}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-white">
                      <span className="text-sm font-medium opacity-90">Libros</span>
                      <span className="text-2xl font-bold">{genre.count}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-white">
                      <span className="text-sm font-medium opacity-90">Total páginas</span>
                      <span className="text-lg font-bold">{genre.pages.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-white">
                      <span className="text-sm font-medium opacity-90">Promedio</span>
                      <span className="text-lg font-bold">{genre.avgPages} pgs</span>
                    </div>

                    {genre.averageRating > 0 && (
                      <div className="flex items-center justify-between text-white pt-2 border-t border-white/20">
                        <span className="text-sm font-medium opacity-90">Rating</span>
                        <div className="flex items-center gap-1">
                          <span className="text-lg font-bold">{genre.averageRating.toFixed(1)}</span>
                          <Star className="w-4 h-4 fill-white" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4 bg-white/20 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-700"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                <div className="mt-2 text-center">
                  <p className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    Click para ver libros
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de libros por género */}
      {selectedGenre && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header del modal */}
            <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-600 px-8 py-6 z-10 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">{selectedGenre}</h2>
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

            {/* Lista de libros */}
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
                      className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-2 border-orange-200 dark:border-orange-800 hover:border-orange-400 dark:hover:border-orange-600 transition-all"
                    >
                      {book.coverUrl && (
                        <img
                          src={book.coverUrl}
                          alt={book.title}
                          className="w-16 h-24 object-cover rounded-lg shadow-md"
                          onError={(e) => e.currentTarget.style.display = 'none'}
                        />
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                            {book.title}
                          </h3>
                          <span className="text-sm font-bold text-orange-600 dark:text-orange-400 whitespace-nowrap">
                            #{index + 1}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          por <span className="font-semibold">{book.author}</span>
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            {book.pages} páginas
                          </span>
                          
                          {book.dateFinished && (
                            <span>• {book.dateFinished}</span>
                          )}
                          
                          {book.rating && (
                            <span className="flex items-center gap-1">
                              •
                              <div className="flex">
                                {[...Array(book.rating)].map((_, i) => (
                                  <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                                ))}
                              </div>
                            </span>
                          )}
                        </div>

                        {book.notes && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                            {book.notes}
                          </p>
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

      {genreData.length === 0 && (
        <div className="text-center py-12">
          <Tag className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400">No hay datos de géneros disponibles</p>
        </div>
      )}
    </div>
  );
}