// src/views/YearlyStatsView.tsx
import { useState, useMemo } from 'react';
import { Calendar, TrendingUp, Book, BarChart3, Award, Target } from 'lucide-react';
import type { Reading, Stats } from '../types';

interface YearlyStatsViewProps {
  readings: Reading[];
  stats: Stats;
}

interface YearData {
  year: number;
  books: number;
  pages: number;
  avgPages: number;
  genres: Map<string, number>;
  topGenre: string;
  authors: Set<string>;
  avgRating: number;
  fiveStars: number;
}

export function YearlyStatsView({ readings }: YearlyStatsViewProps) {
  const [selectedYears, setSelectedYears] = useState<number[]>([]);

  // Calcular estadísticas por año
  const yearlyData = useMemo(() => {
    const dataByYear = new Map<number, YearData>();

    readings.forEach(reading => {
      if (!reading.parsedDate) return;
      
      const year = reading.parsedDate.getFullYear();
      
      if (!dataByYear.has(year)) {
        dataByYear.set(year, {
          year,
          books: 0,
          pages: 0,
          avgPages: 0,
          genres: new Map(),
          topGenre: '',
          authors: new Set(),
          avgRating: 0,
          fiveStars: 0,
        });
      }

      const yearData = dataByYear.get(year)!;
      yearData.books++;
      yearData.pages += reading.pages;
      yearData.authors.add(reading.author);
      
      // Géneros
      const genreCount = yearData.genres.get(reading.genre) || 0;
      yearData.genres.set(reading.genre, genreCount + 1);
      
      // Ratings
      if (reading.rating) {
        if (reading.rating === 5) yearData.fiveStars++;
      }
    });

    // Calcular promedios y encontrar género top
    dataByYear.forEach(yearData => {
      yearData.avgPages = Math.round(yearData.pages / yearData.books);
      
      // Encontrar género más leído
      let maxCount = 0;
      yearData.genres.forEach((count, genre) => {
        if (count > maxCount) {
          maxCount = count;
          yearData.topGenre = genre;
        }
      });

      // Calcular rating promedio
      const booksWithRating = readings.filter(r => 
        r.parsedDate?.getFullYear() === yearData.year && r.rating
      );
      if (booksWithRating.length > 0) {
        yearData.avgRating = booksWithRating.reduce((sum, r) => sum + (r.rating || 0), 0) / booksWithRating.length;
      }
    });

    return Array.from(dataByYear.values()).sort((a, b) => b.year - a.year);
  }, [readings]);

  const availableYears = yearlyData.map(d => d.year);
  const currentYear = new Date().getFullYear();

  // Si no hay años seleccionados, mostrar el año actual y el anterior
  const displayYears = selectedYears.length > 0 
    ? selectedYears 
    : [currentYear, currentYear - 1].filter(y => availableYears.includes(y));

  const compareData = yearlyData.filter(d => displayYears.includes(d.year));

  const toggleYear = (year: number) => {
    if (selectedYears.includes(year)) {
      setSelectedYears(selectedYears.filter(y => y !== year));
    } else {
      setSelectedYears([...selectedYears, year]);
    }
  };

  const getYearColor = (index: number) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600',
      'from-green-500 to-green-600',
      'from-orange-500 to-orange-600',
      'from-pink-500 to-pink-600',
      'from-indigo-500 to-indigo-600',
    ];
    return colors[index % colors.length];
  };

  const getMaxValue = (key: keyof YearData) => {
    return Math.max(...compareData.map(d => typeof d[key] === 'number' ? d[key] : 0));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Evolución por Año
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Compara tus estadísticas de lectura a través de los años
              </p>
            </div>
          </div>

          {/* Year selector */}
          <div className="flex gap-2 flex-wrap">
            {availableYears.map(year => (
              <button
                key={year}
                onClick={() => toggleYear(year)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  displayYears.includes(year)
                    ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        {displayYears.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Selecciona al menos un año para ver las estadísticas
          </div>
        )}
      </div>

      {displayYears.length > 0 && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {compareData.map((yearData, index) => (
              <div
                key={yearData.year}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border-2 border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {yearData.year}
                  </span>
                  <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${getYearColor(index)}`} />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Libros</span>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      {yearData.books}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Páginas</span>
                    <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                      {yearData.pages.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Autores</span>
                    <span className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                      {yearData.authors.size}
                    </span>
                  </div>
                  {yearData.avgRating > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Rating</span>
                      <span className="text-lg font-semibold text-amber-600 dark:text-amber-400">
                        {yearData.avgRating.toFixed(1)} ⭐
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Comparison Charts */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Comparación de Métricas
            </h3>

            <div className="space-y-6">
              {/* Books Comparison */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Libros Leídos
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Max: {getMaxValue('books')}
                  </span>
                </div>
                <div className="space-y-2">
                  {compareData.map((yearData, index) => (
                    <div key={yearData.year} className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-12">
                        {yearData.year}
                      </span>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-8 relative overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${getYearColor(index)} rounded-full flex items-center justify-end px-3 transition-all duration-500`}
                          style={{
                            width: `${(yearData.books / getMaxValue('books')) * 100}%`
                          }}
                        >
                          <span className="text-xs font-bold text-white">
                            {yearData.books}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pages Comparison */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Total de Páginas
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Max: {getMaxValue('pages').toLocaleString()}
                  </span>
                </div>
                <div className="space-y-2">
                  {compareData.map((yearData, index) => (
                    <div key={yearData.year} className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-12">
                        {yearData.year}
                      </span>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-8 relative overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${getYearColor(index)} rounded-full flex items-center justify-end px-3 transition-all duration-500`}
                          style={{
                            width: `${(yearData.pages / getMaxValue('pages')) * 100}%`
                          }}
                        >
                          <span className="text-xs font-bold text-white">
                            {yearData.pages.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Average Pages Comparison */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Promedio de Páginas/Libro
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Max: {getMaxValue('avgPages')}
                  </span>
                </div>
                <div className="space-y-2">
                  {compareData.map((yearData, index) => (
                    <div key={yearData.year} className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-12">
                        {yearData.year}
                      </span>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-8 relative overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${getYearColor(index)} rounded-full flex items-center justify-end px-3 transition-all duration-500`}
                          style={{
                            width: `${(yearData.avgPages / getMaxValue('avgPages')) * 100}%`
                          }}
                        >
                          <span className="text-xs font-bold text-white">
                            {yearData.avgPages}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Stats Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {compareData.map((yearData, index) => (
              <div
                key={yearData.year}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border-2 border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Detalles {yearData.year}
                  </h3>
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${getYearColor(index)}`} />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Book className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Género favorito
                      </span>
                    </div>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {yearData.topGenre}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Autores únicos
                      </span>
                    </div>
                    <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                      {yearData.authors.size}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Libros 5 estrellas
                      </span>
                    </div>
                    <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                      {yearData.fiveStars}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Libros/mes promedio
                      </span>
                    </div>
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">
                      {(yearData.books / 12).toFixed(1)}
                    </span>
                  </div>

                  {/* Top 3 genres */}
                  {yearData.genres.size > 0 && (
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                        Top 3 Géneros
                      </p>
                      <div className="space-y-1">
                        {Array.from(yearData.genres.entries())
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 3)
                          .map(([genre, count], i) => (
                            <div key={genre} className="flex items-center justify-between text-sm">
                              <span className="text-gray-700 dark:text-gray-300">
                                {i + 1}. {genre}
                              </span>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {count}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}