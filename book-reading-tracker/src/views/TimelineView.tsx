// src/views/TimelineView.tsx
// Visual timeline showing reading history chronologically
import { useState, useMemo } from 'react';
import { Calendar, BookOpen, Star, Clock, TrendingUp, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { useBooks } from '../contexts/BookContext';
import { getGenreWeight } from '../utils/influenceCalculator';
import type { Reading } from '../types';

type ViewMode = 'monthly' | 'yearly' | 'all';
type SortOrder = 'newest' | 'oldest';

interface TimelineEntry {
  date: Date;
  book: Reading;
  daysToRead?: number;
  pagesPerDay?: number;
}

export function TimelineView() {
  const { readings } = useBooks();
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  // Filter and prepare timeline entries
  const timelineEntries = useMemo(() => {
    let filtered = readings.filter(r => 
      r.parsedDate && 
      r.readingType !== 'academic' && 
      r.readingType !== 'reference'
    );

    if (selectedGenre) {
      filtered = filtered.filter(r => r.genre === selectedGenre);
    }

    const entries: TimelineEntry[] = filtered.map(book => {
      let daysToRead: number | undefined;
      let pagesPerDay: number | undefined;

      if (book.startDate && book.dateFinished) {
        const start = new Date(book.startDate);
        const end = new Date(book.dateFinished);
        daysToRead = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
        pagesPerDay = Math.round(book.pages / daysToRead);
      }

      return {
        date: book.parsedDate!,
        book,
        daysToRead,
        pagesPerDay,
      };
    });

    // Sort by date
    entries.sort((a, b) => {
      const diff = a.date.getTime() - b.date.getTime();
      return sortOrder === 'newest' ? -diff : diff;
    });

    return entries;
  }, [readings, sortOrder, selectedGenre]);

  // Get available years
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    timelineEntries.forEach(e => years.add(e.date.getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
  }, [timelineEntries]);

  // Get available genres
  const availableGenres = useMemo(() => {
    return Array.from(new Set(readings.map(r => r.genre))).sort();
  }, [readings]);

  // Filter by year if in monthly view
  const filteredEntries = useMemo(() => {
    if (viewMode === 'yearly' || viewMode === 'all') {
      return timelineEntries;
    }
    return timelineEntries.filter(e => e.date.getFullYear() === selectedYear);
  }, [timelineEntries, viewMode, selectedYear]);

  // Group entries by month or year
  const groupedEntries = useMemo(() => {
    const groups = new Map<string, TimelineEntry[]>();

    filteredEntries.forEach(entry => {
      let key: string;
      if (viewMode === 'yearly') {
        key = entry.date.getFullYear().toString();
      } else {
        key = `${entry.date.getFullYear()}-${String(entry.date.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(entry);
    });

    return groups;
  }, [filteredEntries, viewMode]);

  // Stats for current view
  const stats = useMemo(() => {
    const entries = filteredEntries;
    const totalBooks = entries.length;
    const totalPages = entries.reduce((sum, e) => sum + e.book.pages, 0);
    const withDuration = entries.filter(e => e.daysToRead);
    const avgDaysPerBook = withDuration.length > 0
      ? withDuration.reduce((sum, e) => sum + e.daysToRead!, 0) / withDuration.length
      : 0;
    const avgPagesPerDay = withDuration.length > 0
      ? withDuration.reduce((sum, e) => sum + e.pagesPerDay!, 0) / withDuration.length
      : 0;

    return { totalBooks, totalPages, avgDaysPerBook, avgPagesPerDay };
  }, [filteredEntries]);

  const formatMonthKey = (key: string) => {
    if (key.length === 4) return key; // Year only
    const [year, month] = key.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('es', { month: 'long', year: 'numeric' });
  };

  const getSpeedColor = (pagesPerDay?: number) => {
    if (!pagesPerDay) return 'text-gray-400';
    if (pagesPerDay >= 100) return 'text-red-500';
    if (pagesPerDay >= 50) return 'text-orange-500';
    if (pagesPerDay >= 30) return 'text-amber-500';
    return 'text-green-500';
  };

  const getSpeedLabel = (pagesPerDay?: number) => {
    if (!pagesPerDay) return '';
    if (pagesPerDay >= 100) return '🔥 Intenso';
    if (pagesPerDay >= 50) return '⚡ Rápido';
    if (pagesPerDay >= 30) return '📖 Normal';
    return '🐢 Relajado';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Timeline de Lectura
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tu historia de lectura visualizada
            </p>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-1">
            <BookOpen className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase">Libros</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalBooks}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase">Páginas</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalPages.toLocaleString()}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase">Días/Libro</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.avgDaysPerBook > 0 ? stats.avgDaysPerBook.toFixed(1) : '-'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase">Págs/Día</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.avgPagesPerDay > 0 ? stats.avgPagesPerDay.toFixed(0) : '-'}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        {/* View Mode */}
        <div className="flex gap-2 bg-white dark:bg-gray-800 rounded-xl p-1.5 shadow-sm border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setViewMode('monthly')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              viewMode === 'monthly'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Por Mes
          </button>
          <button
            onClick={() => setViewMode('yearly')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              viewMode === 'yearly'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Por Año
          </button>
          <button
            onClick={() => setViewMode('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              viewMode === 'all'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Lista
          </button>
        </div>

        {/* Year Selector (for monthly view) */}
        {viewMode === 'monthly' && availableYears.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedYear(y => Math.max(Math.min(...availableYears), y - 1))}
              className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-4 py-2 font-bold text-gray-900 dark:text-white min-w-[80px] text-center">
              {selectedYear}
            </span>
            <button
              onClick={() => setSelectedYear(y => Math.min(Math.max(...availableYears), y + 1))}
              className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Sort Order */}
        <button
          onClick={() => setSortOrder(o => o === 'newest' ? 'oldest' : 'newest')}
          className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-gray-700 dark:text-gray-300"
        >
          {sortOrder === 'newest' ? '↓ Recientes primero' : '↑ Antiguos primero'}
        </button>

        {/* Genre Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={selectedGenre || ''}
            onChange={(e) => setSelectedGenre(e.target.value || null)}
            className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            <option value="">Todos los géneros</option>
            {availableGenres.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 hidden md:block" />

        <div className="space-y-8">
          {Array.from(groupedEntries.entries()).map(([key, entries]) => (
            <div key={key} className="relative">
              {/* Month/Year Header */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg z-10">
                  {entries.length}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white capitalize">
                    {formatMonthKey(key)}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {entries.reduce((sum, e) => sum + e.book.pages, 0).toLocaleString()} páginas
                  </p>
                </div>
              </div>

              {/* Books in this period */}
              <div className="ml-0 md:ml-16 space-y-3">
                {entries.map((entry, idx) => {
                  const genreWeight = getGenreWeight(entry.book.genre);
                  
                  return (
                    <div 
                      key={entry.book.id}
                      className="flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all"
                    >
                      {/* Cover */}
                      {entry.book.coverUrl ? (
                        <img 
                          src={entry.book.coverUrl} 
                          alt={entry.book.title}
                          className="w-16 h-24 object-cover rounded-lg shadow"
                        />
                      ) : (
                        <div className="w-16 h-24 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-8 h-8 text-gray-400" />
                        </div>
                      )}

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-bold text-gray-900 dark:text-white line-clamp-1">
                            {entry.book.title}
                          </h4>
                          {entry.book.rating && (
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {[...Array(entry.book.rating)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {entry.book.author} • {entry.book.nationality}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-xs">
                          <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full font-medium">
                            {entry.book.pages} pgs
                          </span>
                          
                          <span className={`px-2 py-1 rounded-full font-medium ${
                            genreWeight > 1.2 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                              : genreWeight < 1 
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}>
                            {entry.book.genre} ({genreWeight}x)
                          </span>

                          {entry.daysToRead && (
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-medium">
                              <Clock className="w-3 h-3 inline mr-1" />
                              {entry.daysToRead} días
                            </span>
                          )}

                          {entry.pagesPerDay && (
                            <span className={`px-2 py-1 rounded-full font-medium ${getSpeedColor(entry.pagesPerDay).replace('text-', 'bg-').replace('-500', '-100')} ${getSpeedColor(entry.pagesPerDay).replace('-500', '-700')}`}>
                              {entry.pagesPerDay} págs/día {getSpeedLabel(entry.pagesPerDay)}
                            </span>
                          )}
                        </div>

                        {/* Date */}
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          {entry.book.startDate && (
                            <span>{entry.book.startDate} → </span>
                          )}
                          {entry.book.dateFinished}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredEntries.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400">No hay libros en este período</p>
        </div>
      )}
    </div>
  );
}