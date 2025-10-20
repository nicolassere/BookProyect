// src/views/GenresView.tsx
import { useState } from 'react';
import { Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import type { Stats } from '../types';

interface GenresViewProps {
  stats: Stats;
}

export function GenresView({ stats }: GenresViewProps) {
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  const genres = stats.genreDistribution;
  
  // Calcular paginación
  const totalPages = Math.ceil(genres.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentGenres = genres.slice(startIndex, endIndex);

  const handleItemsPerPageChange = (newItems: number) => {
    setItemsPerPage(newItems);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Tag className="w-6 h-6 text-amber-600" />
            {t.navigation.genres} ({genres.length})
          </h2>

          <select
            value={itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            className="px-3 py-2 rounded-lg border-2 border-gray-200 text-sm font-medium hover:bg-gray-50 transition-all"
          >
            <option value={8}>8 por página</option>
            <option value={12}>12 por página</option>
            <option value={24}>24 por página</option>
            <option value={genres.length}>Todos ({genres.length})</option>
          </select>
        </div>

        {/* Pagination info */}
        {totalPages > 1 && (
          <div className="mb-4 text-sm text-gray-600 flex items-center justify-between">
            <span>
              Mostrando {startIndex + 1}-{Math.min(endIndex, genres.length)} de {genres.length} géneros
            </span>
            <span className="text-amber-600 font-medium">
              Página {currentPage} de {totalPages}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentGenres.map((genre, i) => (
            <div
              key={i}
              className="p-6 rounded-xl bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 hover:border-amber-400 transition-all"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-3 truncate">{genre.genre}</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t.stats.booksRead}</span>
                  <span className="text-lg font-bold text-amber-600">{genre.count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t.stats.totalPages}</span>
                  <span className="text-lg font-bold text-blue-600">
                    {genre.pages.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t.stats.avgPages}</span>
                  <span className="text-lg font-bold text-emerald-600">
                    {Math.round(genre.pages / genre.count)}
                  </span>
                </div>
              </div>
              
              {/* Progress bar showing relative popularity */}
              <div className="mt-4 bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${(genre.count / stats.genreDistribution[0].count) * 100}%`
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg transition-all ${
                currentPage === 1
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-amber-600 hover:bg-amber-50'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Page numbers */}
            <div className="flex gap-1">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pageNum;
                
                if (totalPages <= 7) {
                  pageNum = i + 1;
                } else if (currentPage <= 4) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 3) {
                  pageNum = totalPages - 6 + i;
                } else {
                  pageNum = currentPage - 3 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-lg font-medium transition-all ${
                      currentPage === pageNum
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg transition-all ${
                currentPage === totalPages
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-amber-600 hover:bg-amber-50'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {genres.length === 0 && (
          <div className="text-center py-12">
            <Tag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No hay datos de géneros disponibles</p>
          </div>
        )}
      </div>
    </div>
  );
}