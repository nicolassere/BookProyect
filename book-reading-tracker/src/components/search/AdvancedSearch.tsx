// src/components/search/AdvancedSearch.tsx
import { useState } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import type { Reading } from '../../types';

interface AdvancedSearchProps {
  readings: Reading[];
  onResultsChange: (results: Reading[]) => void;
  onClose: () => void;
}

export function AdvancedSearch({ readings, onResultsChange, onClose }: AdvancedSearchProps) {
  const [filters, setFilters] = useState({
    query: '',
    minPages: '',
    maxPages: '',
    minRating: '',
    maxRating: '',
    startDate: '',
    endDate: '',
    genres: [] as string[],
    nationalities: [] as string[],
    favoriteOnly: false,
  });

  const allGenres = Array.from(new Set(readings.map(r => r.genre)));
  const allNationalities = Array.from(new Set(readings.map(r => r.nationality)));

  const handleSearch = () => {
    let results = readings;

    // Text query
    if (filters.query) {
      const q = filters.query.toLowerCase();
      results = results.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.author.toLowerCase().includes(q) ||
        r.notes?.toLowerCase().includes(q)
      );
    }

    // Page range
    if (filters.minPages) {
      results = results.filter(r => r.pages >= parseInt(filters.minPages));
    }
    if (filters.maxPages) {
      results = results.filter(r => r.pages <= parseInt(filters.maxPages));
    }

    // Rating range
    if (filters.minRating) {
      results = results.filter(r => r.rating && r.rating >= parseInt(filters.minRating));
    }
    if (filters.maxRating) {
      results = results.filter(r => r.rating && r.rating <= parseInt(filters.maxRating));
    }

    // Date range
    if (filters.startDate) {
      results = results.filter(r => r.parsedDate && r.parsedDate >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      results = results.filter(r => r.parsedDate && r.parsedDate <= new Date(filters.endDate));
    }

    // Genres
    if (filters.genres.length > 0) {
      results = results.filter(r => filters.genres.includes(r.genre));
    }

    // Nationalities
    if (filters.nationalities.length > 0) {
      results = results.filter(r => filters.nationalities.includes(r.nationality));
    }

    // Favorites
    if (filters.favoriteOnly) {
      results = results.filter(r => r.favorite || r.rating === 5);
    }

    onResultsChange(results);
  };

  const handleReset = () => {
    setFilters({
      query: '',
      minPages: '',
      maxPages: '',
      minRating: '',
      maxRating: '',
      startDate: '',
      endDate: '',
      genres: [],
      nationalities: [],
      favoriteOnly: false,
    });
    onResultsChange(readings);
  };

  const toggleGenre = (genre: string) => {
    setFilters(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }));
  };

  const toggleNationality = (nat: string) => {
    setFilters(prev => ({
      ...prev,
      nationalities: prev.nationalities.includes(nat)
        ? prev.nationalities.filter(n => n !== nat)
        : [...prev.nationalities, nat]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-3xl w-full p-8 shadow-2xl my-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Búsqueda Avanzada</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
          {/* Text Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Buscar en título, autor o notas
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={filters.query}
                onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-700 dark:text-white transition-all"
                placeholder="Escribe algo..."
              />
            </div>
          </div>

          {/* Page Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rango de páginas
            </label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                min="0"
                value={filters.minPages}
                onChange={(e) => setFilters({ ...filters, minPages: e.target.value })}
                className="px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-700 dark:text-white transition-all"
                placeholder="Mínimo"
              />
              <input
                type="number"
                min="0"
                value={filters.maxPages}
                onChange={(e) => setFilters({ ...filters, maxPages: e.target.value })}
                className="px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-700 dark:text-white transition-all"
                placeholder="Máximo"
              />
            </div>
          </div>

          {/* Rating Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Calificación
            </label>
            <div className="grid grid-cols-2 gap-4">
              <select
                value={filters.minRating}
                onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
                className="px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all"
              >
                <option value="">Mínimo</option>
                {[1, 2, 3, 4, 5].map(n => (
                  <option key={n} value={n}>{n} ⭐</option>
                ))}
              </select>
              <select
                value={filters.maxRating}
                onChange={(e) => setFilters({ ...filters, maxRating: e.target.value })}
                className="px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all"
              >
                <option value="">Máximo</option>
                {[1, 2, 3, 4, 5].map(n => (
                  <option key={n} value={n}>{n} ⭐</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rango de fechas
            </label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-700 dark:text-white transition-all"
              />
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-700 dark:text-white transition-all"
              />
            </div>
          </div>

          {/* Genres */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Géneros (selección múltiple)
            </label>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
              {allGenres.map(genre => (
                <button
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    filters.genres.includes(genre)
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-600 hover:border-blue-400'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Nationalities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nacionalidades (selección múltiple)
            </label>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
              {allNationalities.map(nat => (
                <button
                  key={nat}
                  onClick={() => toggleNationality(nat)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    filters.nationalities.includes(nat)
                      ? 'bg-green-600 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-600 hover:border-green-400'
                  }`}
                >
                  {nat}
                </button>
              ))}
            </div>
          </div>

          {/* Favorites Only */}
          <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <input
              type="checkbox"
              id="favorites"
              checked={filters.favoriteOnly}
              onChange={(e) => setFilters({ ...filters, favoriteOnly: e.target.checked })}
              className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <label htmlFor="favorites" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              🌟 Solo mostrar favoritos
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleSearch}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-500 dark:to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-800 transition-all font-medium shadow-lg flex items-center justify-center gap-2"
          >
            <Search className="w-5 h-5" />
            Buscar
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium"
          >
            Limpiar
          </button>
        </div>
      </div>
    </div>
  );
}