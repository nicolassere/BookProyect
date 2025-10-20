// src/views/AuthorsView.tsx
import { useState } from 'react';
import { Edit2, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import type { Stats, Reading } from '../types';

interface AuthorsViewProps {
  stats: Stats;
  readings: Reading[];
  onEditAuthor: (author: string) => void;
}

export function AuthorsView({ stats, readings, onEditAuthor }: AuthorsViewProps) {
  const { t } = useLanguage();
  const [sortBy, setSortBy] = useState<'books' | 'pages'>('books');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const authors = sortBy === 'books' ? stats.authorsByBooks : stats.authorsByPages;
  
  // Calcular paginación
  const totalPages = Math.ceil(authors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAuthors = authors.slice(startIndex, endIndex);

  // Resetear a página 1 cuando cambia el filtro
  const handleSortChange = (newSort: 'books' | 'pages') => {
    setSortBy(newSort);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (newItems: number) => {
    setItemsPerPage(newItems);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h2 className="text-2xl font-bold text-gray-900">
            {t.authors.title} ({authors.length})
          </h2>
          
          <div className="flex gap-2 flex-wrap items-center">
            {/* Items per page selector */}
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="px-3 py-2 rounded-lg border-2 border-gray-200 text-sm font-medium hover:bg-gray-50 transition-all"
            >
              <option value={10}>10 por página</option>
              <option value={20}>20 por página</option>
              <option value={50}>50 por página</option>
              <option value={100}>100 por página</option>
              <option value={authors.length}>Todos ({authors.length})</option>
            </select>

            {/* Sort buttons */}
            <button
              onClick={() => handleSortChange('books')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                sortBy === 'books' 
                  ? 'bg-amber-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t.authors.sortByBooks}
            </button>
            <button
              onClick={() => handleSortChange('pages')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                sortBy === 'pages' 
                  ? 'bg-amber-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t.authors.sortByPages}
            </button>
          </div>
        </div>

        {/* Pagination info */}
        {totalPages > 1 && (
          <div className="mb-4 text-sm text-gray-600 flex items-center justify-between">
            <span>
              Mostrando {startIndex + 1}-{Math.min(endIndex, authors.length)} de {authors.length} autores
            </span>
            <span className="text-amber-600 font-medium">
              Página {currentPage} de {totalPages}
            </span>
          </div>
        )}

        <div className="space-y-3">
          {currentAuthors.map((author, i) => {
            const profile = stats.authorProfiles.get(author.author);
            const authorBooks = readings.filter(r => r.author === author.author);
            const globalIndex = startIndex + i + 1;
            
            return (
              <div 
                key={`${author.author}-${i}`}
                className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-gray-50 to-white hover:from-amber-50 hover:to-orange-50 transition-all border border-gray-200"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {globalIndex}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">{author.author}</h3>
                  <p className="text-sm text-gray-600">
                    {author.nationality}
                    {sortBy === 'books' 
                      ? ` • ${author.count} ${author.count === 1 ? 'libro' : 'libros'}`
                      : ` • ${author.pages.toLocaleString()} ${t.books.pages}`
                    }
                    {profile?.primaryGenre && ` • ${profile.primaryGenre}`}
                  </p>
                  {profile?.favoriteBook && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {t.authors.favoriteBook}: {profile.favoriteBook}
                    </p>
                  )}
                </div>
                <div className="text-right flex items-center gap-4">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {sortBy === 'books' ? author.count : author.pages.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {sortBy === 'books' ? 'libros' : t.books.pages}
                    </div>
                  </div>
                  <button
                    onClick={() => onEditAuthor(author.author)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    title={t.authors.editProfile}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
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
      </div>
    </div>
  );
}