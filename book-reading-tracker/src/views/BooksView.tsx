// src/views/BooksView.tsx
import { useState, useMemo } from 'react';
import { List, Edit2, X, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import type { Reading } from '../types';

interface BooksViewProps {
  readings: Reading[];
  authorProfiles: Map<string, any>;
  onEdit: (book: Reading) => void;
  onDelete: (id: string) => void;
  onBookClick: (book: Reading) => void; // AGREGADO
}

export function BooksView({ readings, authorProfiles, onEdit, onDelete, onBookClick }: BooksViewProps) {
  const { t } = useLanguage();
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'author' | 'rating'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const sortedReadings = useMemo(() => {
    let filtered = readings;
    
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = (a.parsedDate?.getTime() || 0) - (b.parsedDate?.getTime() || 0);
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'author':
          comparison = a.author.localeCompare(b.author);
          break;
        case 'rating':
          comparison = (a.rating || 0) - (b.rating || 0);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [readings, sortBy, sortOrder, searchTerm]);

  const totalPages = Math.ceil(sortedReadings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBooks = sortedReadings.slice(startIndex, endIndex);

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleSortChange = (newSort: 'date' | 'title' | 'author' | 'rating') => {
    setSortBy(newSort);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (newItems: number) => {
    setItemsPerPage(newItems);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <List className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            {t.books.title} ({sortedReadings.length})
          </h2>
          
          <div className="flex gap-2 flex-wrap">
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="px-3 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-600 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-700 dark:text-white transition-all"
            >
              <option value={10}>10 por página</option>
              <option value={20}>20 por página</option>
              <option value={50}>50 por página</option>
              <option value={100}>100 por página</option>
              <option value={sortedReadings.length}>Todos ({sortedReadings.length})</option>
            </select>

            <input
              type="text"
              placeholder={t.books.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:bg-gray-700 dark:text-white text-sm transition-all"
            />
            
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as any)}
              className="px-3 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-600 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:bg-gray-700 dark:text-white transition-all"
            >
              <option value="date">{t.books.sortBy.date}</option>
              <option value="title">{t.books.sortBy.title}</option>
              <option value="author">{t.books.sortBy.author}</option>
              <option value="rating">{t.books.sortBy.rating}</option>
            </select>
            
            <button
              onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium transition-all"
              title={sortOrder === 'asc' ? 'Ascendente' : 'Descendente'}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400 flex items-center justify-between">
            <span>
              Mostrando {startIndex + 1}-{Math.min(endIndex, sortedReadings.length)} de {sortedReadings.length} libros
            </span>
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              Página {currentPage} de {totalPages}
            </span>
          </div>
        )}

        <div className="space-y-3">
          {currentBooks.map((book) => {
            const profile = authorProfiles.get(book.author);
            return (
              <div
                key={book.id}
                onClick={() => onBookClick(book)}
                className="flex items-start gap-4 p-4 rounded-lg bg-gradient-to-r from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 hover:from-amber-50 hover:to-orange-50 dark:hover:from-amber-900/20 dark:hover:to-orange-900/20 transition-all border border-gray-200 dark:border-gray-700 cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">{book.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {t.books.by} <span className="font-medium">{book.author}</span>
                    {profile && (
                      <span className="text-gray-400 dark:text-gray-500"> • {profile.nationality}</span>
                    )}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>{book.pages} {t.books.pages}</span>
                    <span>•</span>
                    <span>{book.genre}</span>
                    <span>•</span>
                    <span>{book.dateFinished}</span>
                    {book.rating && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          {[...Array(book.rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  {book.collections.length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {book.collections.map((col, i) => (
                        <span key={i} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full">
                          {col}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onEdit(book)}
                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                    title={t.common.edit}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(book.id)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
                    title={t.common.delete}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg transition-all ${
                currentPage === 1
                  ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                  : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

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
                        ? 'bg-amber-600 dark:bg-amber-500 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
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
                  ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                  : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {sortedReadings.length === 0 && (
          <div className="text-center py-12">
            <List className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400">No se encontraron libros</p>
          </div>
        )}
      </div>
    </div>
  );
}