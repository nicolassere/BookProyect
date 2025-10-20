// src/views/NationalitiesView.tsx
import { useState } from 'react';
import { Globe, Users, Book, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import type { Stats } from '../types';

interface NationalitiesViewProps {
  stats: Stats;
}

export function NationalitiesView({ stats }: NationalitiesViewProps) {
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  const nationalities = stats.authorsByNationality;
  
  // Calcular paginación
  const totalPages = Math.ceil(nationalities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNationalities = nationalities.slice(startIndex, endIndex);

  const handleItemsPerPageChange = (newItems: number) => {
    setItemsPerPage(newItems);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Globe className="w-6 h-6 text-blue-600" />
            {t.navigation.nationalities} ({nationalities.length})
          </h2>

          <select
            value={itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            className="px-3 py-2 rounded-lg border-2 border-gray-200 text-sm font-medium hover:bg-gray-50 transition-all"
          >
            <option value={8}>8 por página</option>
            <option value={12}>12 por página</option>
            <option value={24}>24 por página</option>
            <option value={nationalities.length}>Todas ({nationalities.length})</option>
          </select>
        </div>

        {/* Pagination info */}
        {totalPages > 1 && (
          <div className="mb-4 text-sm text-gray-600 flex items-center justify-between">
            <span>
              Mostrando {startIndex + 1}-{Math.min(endIndex, nationalities.length)} de {nationalities.length} nacionalidades
            </span>
            <span className="text-blue-600 font-medium">
              Página {currentPage} de {totalPages}
            </span>
          </div>
        )}

        <div className="space-y-4">
          {currentNationalities.map((nat, i) => (
            <div
              key={i}
              className="p-6 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 hover:border-blue-400 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900">{nat.nationality}</h3>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">{nat.count}</div>
                  <div className="text-sm text-gray-600">{t.stats.booksRead.toLowerCase()}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>
                    {nat.authors} {nat.authors === 1 ? 'autor' : 'autores'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Book className="w-4 h-4 text-blue-600" />
                  <span>{(nat.count / nat.authors).toFixed(1)} libros/autor</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4 bg-white rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${(nat.count / stats.authorsByNationality[0].count) * 100}%`
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
                  : 'text-blue-600 hover:bg-blue-50'
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
                        ? 'bg-blue-600 text-white shadow-md'
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
                  : 'text-blue-600 hover:bg-blue-50'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {nationalities.length === 0 && (
          <div className="text-center py-12">
            <Globe className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No hay datos de nacionalidades disponibles</p>
          </div>
        )}
      </div>
    </div>
  );
}