// src/views/YearlyStatsView.tsx - SIN LIBROS ACADÉMICOS
import { useMemo, useState } from 'react';
import { Calendar, TrendingUp, BookOpen, Star } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useBooks } from '../contexts/BookContext';
import type { Reading } from '../types';

interface YearStats {
  year: number;
  books: number;
  pages: number;
  avgPages: number;
  genres: Map<string, number>;
  authors: Set<string>;
  avgRating: number;
  fiveStars: number;
}

export function YearlyStatsView() {
  const { t } = useLanguage();
  const { readings } = useBooks();
  
  // FILTRAR LIBROS ACADÉMICOS Y DE REFERENCIA
  const nonAcademicBooks = useMemo(() => {
    return readings.filter(r => 
      r.readingType !== 'academic' && 
      r.readingType !== 'reference'
    );
  }, [readings]);

  // Obtener años únicos (solo de libros no académicos)
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    nonAcademicBooks.forEach(r => {
      if (r.parsedDate) {
        years.add(r.parsedDate.getFullYear());
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [nonAcademicBooks]);

  const [selectedYears, setSelectedYears] = useState<number[]>(() => {
    return availableYears.slice(0, Math.min(3, availableYears.length));
  });

  // Calcular estadísticas por año
  const yearlyStats = useMemo(() => {
    const stats = new Map<number, YearStats>();

    selectedYears.forEach(year => {
      const yearBooks = nonAcademicBooks.filter(r => 
        r.parsedDate && r.parsedDate.getFullYear() === year
      );

      const genres = new Map<string, number>();
      const authors = new Set<string>();
      let totalRating = 0;
      let ratedBooks = 0;
      let fiveStars = 0;

      yearBooks.forEach(book => {
        genres.set(book.genre, (genres.get(book.genre) || 0) + 1);
        authors.add(book.author);
        
        if (book.rating) {
          totalRating += book.rating;
          ratedBooks++;
          if (book.rating === 5) fiveStars++;
        }
      });

      const totalPages = yearBooks.reduce((sum, b) => sum + b.pages, 0);
      
      stats.set(year, {
        year,
        books: yearBooks.length,
        pages: totalPages,
        avgPages: yearBooks.length > 0 ? Math.round(totalPages / yearBooks.length) : 0,
        genres,
        authors,
        avgRating: ratedBooks > 0 ? totalRating / ratedBooks : 0,
        fiveStars,
      });
    });

    return stats;
  }, [nonAcademicBooks, selectedYears]);

  const toggleYear = (year: number) => {
    setSelectedYears(prev => {
      if (prev.includes(year)) {
        return prev.filter(y => y !== year);
      } else if (prev.length < 6) {
        return [...prev, year].sort((a, b) => b - a);
      }
      return prev;
    });
  };

  const maxBooks = Math.max(...Array.from(yearlyStats.values()).map(s => s.books), 1);
  const maxPages = Math.max(...Array.from(yearlyStats.values()).map(s => s.pages), 1);

  const colors = [
    'from-amber-500 to-orange-600',
    'from-blue-500 to-indigo-600',
    'from-green-500 to-emerald-600',
    'from-purple-500 to-pink-600',
    'from-red-500 to-rose-600',
    'from-cyan-500 to-teal-600',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg">
          <Calendar className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t.navigation['yearly-stats']}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Libros completos (excluye académicos y referencia)
          </p>
        </div>
      </div>

      {/* Selector de años */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          {t.common.select} años (máximo 6):
        </label>
        <div className="flex flex-wrap gap-2">
          {availableYears.map(year => (
            <button
              key={year}
              onClick={() => toggleYear(year)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedYears.includes(year)
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      {selectedYears.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Selecciona al menos un año para ver estadísticas
        </div>
      ) : (
        <>
          {/* Comparaciones */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Libros leídos */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Libros Leídos</h3>
              </div>
              <div className="space-y-3">
                {selectedYears.map((year, idx) => {
                  const stats = yearlyStats.get(year);
                  if (!stats) return null;
                  const percentage = (stats.books / maxBooks) * 100;
                  return (
                    <div key={year}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700 dark:text-gray-300">{year}</span>
                        <span className="text-gray-900 dark:text-white font-bold">{stats.books}</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${colors[idx % colors.length]} transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Total de páginas */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Total de Páginas</h3>
              </div>
              <div className="space-y-3">
                {selectedYears.map((year, idx) => {
                  const stats = yearlyStats.get(year);
                  if (!stats) return null;
                  const percentage = (stats.pages / maxPages) * 100;
                  return (
                    <div key={year}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700 dark:text-gray-300">{year}</span>
                        <span className="text-gray-900 dark:text-white font-bold">
                          {stats.pages.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${colors[idx % colors.length]} transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Promedio de páginas */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Páginas por Libro</h3>
              </div>
              <div className="space-y-3">
                {selectedYears.map((year, idx) => {
                  const stats = yearlyStats.get(year);
                  if (!stats) return null;
                  const maxAvg = Math.max(...Array.from(yearlyStats.values()).map(s => s.avgPages), 1);
                  const percentage = (stats.avgPages / maxAvg) * 100;
                  return (
                    <div key={year}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700 dark:text-gray-300">{year}</span>
                        <span className="text-gray-900 dark:text-white font-bold">{stats.avgPages}</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${colors[idx % colors.length]} transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Cards detallados por año */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedYears.map((year, idx) => {
              const stats = yearlyStats.get(year);
              if (!stats) return null;

              const topGenres = Array.from(stats.genres.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3);

              return (
                <div
                  key={year}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
                >
                  <div className={`inline-block px-4 py-2 rounded-lg bg-gradient-to-r ${colors[idx % colors.length]} text-white font-bold text-xl mb-4`}>
                    {year}
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Libros</span>
                      <span className="font-bold text-gray-900 dark:text-white">{stats.books}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Páginas</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {stats.pages.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Autores únicos</span>
                      <span className="font-bold text-gray-900 dark:text-white">{stats.authors.size}</span>
                    </div>

                    {topGenres.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Género top</span>
                        <span className="font-bold text-gray-900 dark:text-white">{topGenres[0][0]}</span>
                      </div>
                    )}

                    {stats.avgRating > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Rating promedio</span>
                        <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1">
                          {stats.avgRating.toFixed(1)}
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        </span>
                      </div>
                    )}

                    {stats.fiveStars > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">5 estrellas</span>
                        <span className="font-bold text-gray-900 dark:text-white">{stats.fiveStars}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Libros/mes</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {(stats.books / 12).toFixed(1)}
                      </span>
                    </div>

                    {topGenres.length > 0 && (
                      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Top 3 géneros:</p>
                        <div className="space-y-1">
                          {topGenres.map(([genre, count]) => (
                            <div key={genre} className="flex justify-between text-sm">
                              <span className="text-gray-700 dark:text-gray-300">{genre}</span>
                              <span className="text-gray-500 dark:text-gray-400">{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}