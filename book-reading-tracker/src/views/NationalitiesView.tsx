// src/views/NationalitiesView.tsx - WITHOUT SQUARE CARDS
import { useState, useMemo } from 'react';
import { Globe, Users, Book, FileText, BarChart3 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import type { Stats, Reading } from '../types';

interface NationalitiesViewProps {
  stats: Stats;
  readings?: Reading[];
}

type ViewMode = 'books' | 'pages' | 'authors';

export function NationalitiesView({ stats, readings = [] }: NationalitiesViewProps) {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<ViewMode>('books');

  // Calculate data by nationality including pages
  const nationalityData = useMemo(() => {
    const data = new Map<string, { books: number; pages: number; authors: Set<string> }>();
    
    readings.forEach(reading => {
      const nat = reading.nationality;
      if (!data.has(nat)) {
        data.set(nat, { books: 0, pages: 0, authors: new Set() });
      }
      const entry = data.get(nat)!;
      entry.books++;
      entry.pages += reading.pages;
      entry.authors.add(reading.author);
    });

    return Array.from(data.entries())
      .map(([nationality, data]) => ({
        nationality,
        books: data.books,
        pages: data.pages,
        authors: data.authors.size,
      }))
      .sort((a, b) => {
        if (viewMode === 'books') return b.books - a.books;
        if (viewMode === 'pages') return b.pages - a.pages;
        return b.authors - a.authors;
      });
  }, [readings, viewMode]);

  const maxValue = useMemo(() => {
    if (viewMode === 'books') return Math.max(...nationalityData.map(d => d.books), 1);
    if (viewMode === 'pages') return Math.max(...nationalityData.map(d => d.pages), 1);
    return Math.max(...nationalityData.map(d => d.authors), 1);
  }, [nationalityData, viewMode]);

  const topNationalities = nationalityData.slice(0, 15);

  const getCurrentValue = (nat: typeof nationalityData[0]) => {
    if (viewMode === 'books') return nat.books;
    if (viewMode === 'pages') return nat.pages;
    return nat.authors;
  };

  const getLabel = () => {
    if (viewMode === 'books') return 'Libros';
    if (viewMode === 'pages') return 'Páginas';
    return 'Autores';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t.navigation.nationalities}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {nationalityData.length} nacionalidades diferentes
            </p>
          </div>
        </div>

        {/* View Mode Selector */}
        <div className="flex gap-2 bg-white dark:bg-gray-800 rounded-xl p-1.5 shadow-sm border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setViewMode('books')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              viewMode === 'books'
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Book className="w-4 h-4" />
            Libros
          </button>
          <button
            onClick={() => setViewMode('pages')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              viewMode === 'pages'
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            Páginas
          </button>
          <button
            onClick={() => setViewMode('authors')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              viewMode === 'authors'
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Users className="w-4 h-4" />
            Autores
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6 border-2 border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-orange-700 dark:text-orange-300 uppercase tracking-wide mb-1">
                Total Libros
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {readings.length}
              </p>
            </div>
            <div className="p-3 bg-orange-600 dark:bg-orange-500 rounded-xl">
              <Book className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-6 border-2 border-amber-200 dark:border-amber-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wide mb-1">
                Total Páginas
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {nationalityData.reduce((sum, d) => sum + d.pages, 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-amber-600 dark:bg-amber-500 rounded-xl">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-xl p-6 border-2 border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-red-700 dark:text-red-300 uppercase tracking-wide mb-1">
                Autores Únicos
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.uniqueAuthors}
              </p>
            </div>
            <div className="p-3 bg-red-600 dark:bg-red-500 rounded-xl">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Bar Charts */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Top 15 Países por {getLabel()}
          </h3>
        </div>

        <div className="space-y-4">
          {topNationalities.map((nat, i) => {
            const value = getCurrentValue(nat);
            const percentage = (value / maxValue) * 100;
            
            return (
              <div key={nat.nationality} className="group">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-bold text-orange-600 dark:text-orange-400 w-6">
                    #{i + 1}
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white flex-1 truncate">
                    {nat.nationality}
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {viewMode === 'pages' ? value.toLocaleString() : value}
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-10 relative overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-orange-400 via-orange-500 to-red-600 rounded-full transition-all duration-700 ease-out flex items-center justify-end px-4 group-hover:from-orange-500 group-hover:via-orange-600 group-hover:to-red-700"
                      style={{ width: `${Math.max(percentage, 5)}%` }}
                    >
                      <span className="text-xs font-bold text-white drop-shadow-lg">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end text-xs text-gray-600 dark:text-gray-400 min-w-[80px]">
                    <span className="flex items-center gap-1">
                      <Book className="w-3 h-3" />
                      {nat.books} libros
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {nat.authors} autores
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {nationalityData.length === 0 && (
        <div className="text-center py-12">
          <Globe className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400">No hay datos de nacionalidades disponibles</p>
        </div>
      )}
    </div>
  );
}
