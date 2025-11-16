// src/views/AcademicBooksView.tsx
import { useState, useMemo } from 'react';
import { GraduationCap, BookOpen, Edit2, X, Star, ChevronLeft, ChevronRight, Award } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import type { Reading } from '../types';

interface AcademicBooksViewProps {
  readings: Reading[];
  authorProfiles: Map<string, any>;
  onEdit: (book: Reading) => void;
  onDelete: (id: string) => void;
  onBookClick: (book: Reading) => void;
}

export function AcademicBooksView({ 
  readings, 
  authorProfiles, 
  onEdit, 
  onDelete,
  onBookClick 
}: AcademicBooksViewProps) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Filtrar solo libros académicos
  const academicBooks = useMemo(() => {
    return readings.filter(r => r.readingType === 'academic' || r.readingType === 'reference');
  }, [readings]);

  // Obtener campos académicos únicos
  const academicFields = useMemo(() => {
    const fields = new Set<string>();
    academicBooks.forEach(book => {
      if (book.academicField) {
        fields.add(book.academicField);
      }
    });
    return Array.from(fields).sort();
  }, [academicBooks]);

  // Filtrar libros
  const filteredBooks = useMemo(() => {
    let filtered = academicBooks;
    
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.academicField?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedField) {
      filtered = filtered.filter(r => r.academicField === selectedField);
    }

    return filtered;
  }, [academicBooks, searchTerm, selectedField]);

  // Estadísticas de libros académicos
  const stats = useMemo(() => {
    const byField = new Map<string, { count: number; pages: number }>();
    
    academicBooks.forEach(book => {
      const field = book.academicField || 'Sin categoría';
      if (!byField.has(field)) {
        byField.set(field, { count: 0, pages: 0 });
      }
      const data = byField.get(field)!;
      data.count++;
      data.pages += book.pages;
    });

    return {
      total: academicBooks.length,
      totalPages: academicBooks.reduce((sum, b) => sum + b.pages, 0),
      byField: Array.from(byField.entries())
        .map(([field, data]) => ({ field, ...data }))
        .sort((a, b) => b.count - a.count),
    };
  }, [academicBooks]);

  // Paginación
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBooks = filteredBooks.slice(startIndex, endIndex);

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleFieldChange = (field: string | null) => {
    setSelectedField(field);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (newItems: number) => {
    setItemsPerPage(newItems);
    setCurrentPage(1);
  };

  const getLevelBadgeColor = (level?: string) => {
    switch (level) {
      case 'undergraduate': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'graduate': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'reference': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getLevelLabel = (level?: string) => {
    switch (level) {
      case 'undergraduate': return 'Pregrado';
      case 'graduate': return 'Posgrado';
      case 'reference': return 'Referencia';
      default: return 'General';
    }
  };

  return (
    <div className="space-y-6">
      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 border-2 border-indigo-200 dark:border-indigo-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 uppercase tracking-wide mb-1">
                Libros Académicos
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <div className="p-3 bg-indigo-600 dark:bg-indigo-500 rounded-xl">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide mb-1">
                Total Páginas
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.totalPages.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-600 dark:bg-blue-500 rounded-xl">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border-2 border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wide mb-1">
                Campos de Estudio
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {academicFields.length}
              </p>
            </div>
            <div className="p-3 bg-purple-600 dark:bg-purple-500 rounded-xl">
              <Award className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Distribución por campo */}
      {stats.byField.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Distribución por Campo Académico
          </h3>
          <div className="space-y-3">
            {stats.byField.slice(0, 5).map((field, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-40 truncate">
                  {field.field}
                </span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-8 relative overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full flex items-center justify-end px-3 transition-all duration-500"
                    style={{
                      width: `${(field.count / stats.byField[0].count) * 100}%`
                    }}
                  >
                    <span className="text-xs font-bold text-white">
                      {field.count}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400 w-24 text-right">
                  {field.pages.toLocaleString()} pgs
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de libros */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Libros Académicos ({filteredBooks.length})
          </h2>
          
          <div className="flex gap-2 flex-wrap">
            {/* Items per page */}
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="px-3 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-600 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-700 dark:text-white transition-all"
            >
              <option value={10}>10 por página</option>
              <option value={20}>20 por página</option>
              <option value={50}>50 por página</option>
              <option value={100}>100 por página</option>
              <option value={filteredBooks.length}>Todos ({filteredBooks.length})</option>
            </select>

            {/* Field filter */}
            {academicFields.length > 0 && (
              <select
                value={selectedField || ''}
                onChange={(e) => handleFieldChange(e.target.value || null)}
                className="px-3 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-600 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-700 dark:text-white transition-all"
              >
                <option value="">Todos los campos</option>
                {academicFields.map(field => (
                  <option key={field} value={field}>{field}</option>
                ))}
              </select>
            )}

            {/* Search */}
            <input
              type="text"
              placeholder="Buscar libros académicos..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:bg-gray-700 dark:text-white text-sm transition-all"
            />
          </div>
        </div>

        {/* Pagination info */}
        {totalPages > 1 && (
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400 flex items-center justify-between">
            <span>
              Mostrando {startIndex + 1}-{Math.min(endIndex, filteredBooks.length)} de {filteredBooks.length} libros
            </span>
            <span className="text-indigo-600 dark:text-indigo-400 font-medium">
              Página {currentPage} de {totalPages}
            </span>
          </div>
        )}

        <div className="space-y-3">
          {currentBooks.map((book) => {
            const profile = authorProfiles.get(book.author);
            const chaptersInfo = book.totalChapters && book.chaptersRead 
              ? `${book.chaptersRead.length}/${book.totalChapters} capítulos`
              : null;

            return (
              <div
                key={book.id}
                onClick={() => onBookClick(book)}
                className="flex items-start gap-4 p-4 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-900/30 dark:hover:to-purple-900/30 transition-all border border-indigo-200 dark:border-indigo-800 cursor-pointer"
              >
                {book.coverUrl && (
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-16 h-24 object-cover rounded shadow-md"
                    onError={(e) => e.currentTarget.style.display = 'none'}
                  />
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg flex-1">
                      {book.title}
                    </h3>
                    {book.academicLevel && (
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${getLevelBadgeColor(book.academicLevel)}`}>
                        {getLevelLabel(book.academicLevel)}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    por <span className="font-medium">{book.author}</span>
                    {profile && (
                      <span className="text-gray-400 dark:text-gray-500"> • {profile.nationality}</span>
                    )}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
                    {book.academicField && (
                      <>
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                          📚 {book.academicField}
                        </span>
                        <span>•</span>
                      </>
                    )}
                    <span>{book.pages} páginas</span>
                    {chaptersInfo && (
                      <>
                        <span>•</span>
                        <span className="text-purple-600 dark:text-purple-400">{chaptersInfo}</span>
                      </>
                    )}
                    {book.dateFinished && (
                      <>
                        <span>•</span>
                        <span>{book.dateFinished}</span>
                      </>
                    )}
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
                  
                  {book.notes && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                      {book.notes}
                    </p>
                  )}

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
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(book.id)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
                    title="Eliminar"
                  >
                    <X className="w-4 h-4" />
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
                  ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                  : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'
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
                        ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-md'
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
                  : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {filteredBooks.length === 0 && (
          <div className="text-center py-12">
            <GraduationCap className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400">No se encontraron libros académicos</p>
          </div>
        )}
      </div>
    </div>
  );
}