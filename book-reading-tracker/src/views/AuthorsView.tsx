// src/views/AuthorsView.tsx
import { useState, useMemo } from 'react';
import { Edit2, Star, StarHalf, ChevronLeft, ChevronRight, Users, BookOpen, FileText, TrendingUp, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import type { Stats, Reading } from '../types';

interface AuthorsViewProps {
  stats: Stats;
  readings: Reading[];
  onEditAuthor: (author: string) => void;
  onBookClick?: (book: Reading) => void;
}

const WORDS_PER_PAGE = 250; // Average words per page

export function AuthorsView({ stats, readings, onEditAuthor, onBookClick }: AuthorsViewProps) {
  const { t } = useLanguage();
  const [sortBy, setSortBy] = useState<'books' | 'pages' | 'words'>('books');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [selectedAuthorName, setSelectedAuthorName] = useState<string | null>(null);

  // Calculate authors with word counts and ratings
  const authorsWithWords = useMemo(() => {
    const authorMap = new Map<string, { count: number; pages: number; words: number; nationality: string; totalRating: number; ratedBooks: number }>();

    readings.forEach(reading => {
      const existing = authorMap.get(reading.author) || {
        count: 0,
        pages: 0,
        words: 0,
        nationality: reading.nationality,
        totalRating: 0,
        ratedBooks: 0
      };

      authorMap.set(reading.author, {
        count: existing.count + 1,
        pages: existing.pages + reading.pages,
        words: existing.words + (reading.pages * WORDS_PER_PAGE),
        nationality: reading.nationality,
        totalRating: existing.totalRating + (reading.rating || 0),
        ratedBooks: existing.ratedBooks + (reading.rating ? 1 : 0)
      });
    });

    return Array.from(authorMap.entries()).map(([author, data]) => ({
      author,
      ...data,
      avgWords: Math.round(data.words / data.count),
      avgRating: data.ratedBooks > 0 ? data.totalRating / data.ratedBooks : 0
    }));
  }, [readings]);

  const authors = useMemo(() => {
    const sorted = [...authorsWithWords];
    if (sortBy === 'books') {
      sorted.sort((a, b) => b.count - a.count);
    } else if (sortBy === 'pages') {
      sorted.sort((a, b) => b.pages - a.pages);
    } else {
      sorted.sort((a, b) => b.words - a.words);
    }
    return sorted;
  }, [authorsWithWords, sortBy]);

  // Calcular paginación
  const totalPages = Math.ceil(authors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAuthors = authors.slice(startIndex, endIndex);

  // Calculate max value for bar visualization
  const maxValue = useMemo(() => {
    if (sortBy === 'books') {
      return Math.max(...authors.map(a => a.count), 1);
    } else if (sortBy === 'pages') {
      return Math.max(...authors.map(a => a.pages), 1);
    } else {
      return Math.max(...authors.map(a => a.words), 1);
    }
  }, [authors, sortBy]);

  // Resetear a página 1 cuando cambia el filtro
  const handleSortChange = (newSort: 'books' | 'pages' | 'words') => {
    setSortBy(newSort);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (newItems: number) => {
    setItemsPerPage(newItems);
    setCurrentPage(1);
  };

  // Calculate total stats
  const totalStats = useMemo(() => {
    const totalRating = authors.reduce((sum, a) => sum + (a.avgRating * a.ratedBooks), 0);
    const totalRatedBooks = authors.reduce((sum, a) => sum + a.ratedBooks, 0);

    return {
      totalAuthors: authors.length,
      totalBooks: authors.reduce((sum, a) => sum + a.count, 0),
      totalWords: authors.reduce((sum, a) => sum + a.words, 0),
      avgRating: totalRatedBooks > 0 ? totalRating / totalRatedBooks : 0
    };
  }, [authors]);

  const getCurrentValue = (author: typeof authors[0]) => {
    if (sortBy === 'books') return author.count;
    if (sortBy === 'pages') return author.pages;
    return author.words;
  };

  const selectedAuthorBooks = useMemo(() => {
    if (!selectedAuthorName) return [];
    return readings
      .filter(r => r.author === selectedAuthorName)
      .sort((a, b) => {
        if (a.parsedDate && b.parsedDate) return b.parsedDate.getTime() - a.parsedDate.getTime();
        return 0;
      });
  }, [readings, selectedAuthorName]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t.authors.title}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {authors.length} autores diferentes
            </p>
          </div>
        </div>

        {/* Sort Mode Selector */}
        <div className="flex gap-2 bg-white dark:bg-gray-800 rounded-xl p-1.5 shadow-sm border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => handleSortChange('books')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              sortBy === 'books'
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            {t.authors.sortByBooks}
          </button>
          <button
            onClick={() => handleSortChange('pages')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              sortBy === 'pages'
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            {t.authors.sortByPages}
          </button>
          <button
            onClick={() => handleSortChange('words')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              sortBy === 'words'
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Palabras
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6 border-2 border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-orange-700 dark:text-orange-300 uppercase tracking-wide mb-1">
                Total Autores
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {totalStats.totalAuthors}
              </p>
            </div>
            <div className="p-3 bg-orange-600 dark:bg-orange-500 rounded-xl">
              <Users className="w-6 h-6 text-white" />
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
                {totalStats.totalBooks}
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
                Total Palabras
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {(totalStats.totalWords / 1000000).toFixed(1)}M
              </p>
            </div>
            <div className="p-3 bg-red-600 dark:bg-red-500 rounded-xl">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-6 border-2 border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-orange-700 dark:text-orange-300 uppercase tracking-wide mb-1">
                Calificación Promedio
              </p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalStats.avgRating > 0 ? totalStats.avgRating.toFixed(1) : 'N/A'}
                </p>
                {totalStats.avgRating > 0 && (
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                )}
              </div>
            </div>
            <div className="p-3 bg-orange-600 dark:bg-orange-500 rounded-xl">
              <Star className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Autores ordenados por {sortBy === 'books' ? 'Libros' : sortBy === 'pages' ? 'Páginas' : 'Palabras'}
            </h3>
          </div>

          <div className="flex gap-2 items-center">
            {/* Items per page selector */}
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="px-3 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 text-sm font-medium bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              <option value={10}>10 por página</option>
              <option value={20}>20 por página</option>
              <option value={50}>50 por página</option>
              <option value={100}>100 por página</option>
              <option value={authors.length}>Todos ({authors.length})</option>
            </select>
          </div>
        </div>

        {/* Pagination info */}
        {totalPages > 1 && (
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400 flex items-center justify-between">
            <span>
              Mostrando {startIndex + 1}-{Math.min(endIndex, authors.length)} de {authors.length} autores
            </span>
            <span className="text-orange-600 dark:text-orange-400 font-medium">
              Página {currentPage} de {totalPages}
            </span>
          </div>
        )}

        <div className="space-y-3">
          {currentAuthors.map((author, i) => {
            const profile = stats.authorProfiles.get(author.author);
            const globalIndex = startIndex + i;
            const percentage = (getCurrentValue(author) / maxValue) * 100;

            return (
              <div
                key={`${author.author}-${i}`}
                onClick={() => setSelectedAuthorName(author.author)}
                className="group relative rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-orange-400 dark:hover:border-orange-500 transition-all p-4 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  {/* Rank badge */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {globalIndex + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Author name and nationality */}
                    <div className="flex items-baseline gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg truncate">
                        {author.author}
                      </h3>
                      {author.avgRating > 0 && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                            {author.avgRating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 mb-3">
                      {author.nationality}
                      {profile?.primaryGenre && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span>{profile.primaryGenre}</span>
                        </>
                      )}
                    </p>

                    {/* Progress bar */}
                    <div className="mb-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-red-600 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    {/* Favorite book if available */}
                    {profile?.favoriteBook && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {t.authors.favoriteBook}: {profile.favoriteBook}
                      </p>
                    )}
                  </div>

                  {/* Stats display */}
                  <div className="text-right flex items-center gap-4">
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {sortBy === 'books'
                          ? author.count
                          : sortBy === 'pages'
                            ? author.pages.toLocaleString()
                            : `${(author.words / 1000).toFixed(0)}K`
                        }
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {sortBy === 'books'
                          ? 'libros'
                          : sortBy === 'pages'
                            ? t.books.pages
                            : 'palabras'
                        }
                      </div>
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); onEditAuthor(author.author); }}
                      className="p-2 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      title={t.authors.editProfile}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
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
                  ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                  : 'text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20'
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
                        ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md'
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
                  : 'text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Author books modal */}
      {selectedAuthorName && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-600 px-8 py-6 z-10 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-1">{selectedAuthorName}</h2>
                  <p className="text-white/90 text-sm">
                    {selectedAuthorBooks.length} {selectedAuthorBooks.length === 1 ? 'libro' : 'libros'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); onEditAuthor(selectedAuthorName); setSelectedAuthorName(null); }}
                    className="p-2 hover:bg-white/20 rounded-lg transition-all"
                    title={t.authors.editProfile}
                  >
                    <Edit2 className="w-5 h-5 text-white" />
                  </button>
                  <button
                    onClick={() => setSelectedAuthorName(null)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-all"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-8">
              {selectedAuthorBooks.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <p className="text-gray-500 dark:text-gray-400">No hay libros de este autor</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedAuthorBooks.map((book, index) => (
                    <div
                      key={book.id}
                      onClick={() => { if (onBookClick) { setSelectedAuthorName(null); onBookClick(book); } }}
                      className={`flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-2 border-orange-200 dark:border-orange-800 hover:border-orange-400 dark:hover:border-orange-600 transition-all${onBookClick ? ' cursor-pointer' : ''}`}
                    >
                      {book.coverUrl && (
                        <img
                          src={book.coverUrl}
                          alt={book.title}
                          className="w-16 h-24 object-cover rounded-lg shadow-md flex-shrink-0"
                          onError={(e) => e.currentTarget.style.display = 'none'}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">{book.title}</h3>
                          <span className="text-sm font-bold text-orange-600 dark:text-orange-400 whitespace-nowrap">#{index + 1}</span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                          {book.genre}
                          {book.yearPublished && <span className="text-gray-400"> · {book.yearPublished}</span>}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            {book.pages} páginas
                          </span>
                          {book.dateFinished && <span>• {book.dateFinished}</span>}
                          {book.rating != null && book.rating > 0 && (
                            <span className="flex items-center gap-1">
                              •
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => {
                                  if (i < Math.floor(book.rating!)) return <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />;
                                  if (i === Math.floor(book.rating!) && book.rating! % 1 > 0) return <StarHalf key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />;
                                  return <Star key={i} className="w-3 h-3 text-gray-300 dark:text-gray-600" />;
                                })}
                              </div>
                            </span>
                          )}
                        </div>
                        {book.notes && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">{book.notes}</p>
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
    </div>
  );
}