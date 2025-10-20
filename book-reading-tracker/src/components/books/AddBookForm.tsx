// src/components/books/AddBookForm.tsx - ENHANCED
import { useState, useEffect } from 'react';
import { Search, BookOpen, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { searchGoogleBooks, getBookByISBN } from '../../utils/googleBooksAPI';
import type { Reading } from '../../types';

interface AddBookFormProps {
  onClose: () => void;
  onAdd: (reading: Omit<Reading, 'id' | 'parsedDate'>) => void;
  existingGenres?: string[];
  existingNationalities?: string[];
}

export function AddBookForm({ 
  onClose, 
  onAdd,
  existingGenres = [],
  existingNationalities = []
}: AddBookFormProps) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(true);
  
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    pages: '',
    genre: '',
    nationality: '',
    dateFinished: new Date().toISOString().split('T')[0],
    startDate: '',
    rating: '',
    collections: '',
    isbn: '',
    yearPublished: '',
    coverUrl: '',
    notes: '',
  });

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchGoogleBooks(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectBook = (book: any) => {
    setFormData({
      ...formData,
      title: book.title,
      author: book.authors[0] || '',
      pages: book.pageCount?.toString() || '',
      isbn: book.isbn || '',
      yearPublished: book.publishedDate?.slice(0, 4) || '',
      coverUrl: book.imageUrl || '',
      notes: book.description?.slice(0, 500) || '',
    });
    setShowSearch(false);
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.author || !formData.pages || !formData.genre || !formData.nationality) {
      alert(t.forms.required);
      return;
    }

    onAdd({
      title: formData.title,
      author: formData.author,
      pages: parseInt(formData.pages),
      genre: formData.genre,
      nationality: formData.nationality,
      dateFinished: formData.dateFinished,
      startDate: formData.startDate || undefined,
      rating: formData.rating ? parseInt(formData.rating) : undefined,
      collections: formData.collections.split(',').map(c => c.trim()).filter(Boolean),
      timestamp: Date.now().toString(),
      isbn: formData.isbn || undefined,
      yearPublished: formData.yearPublished ? parseInt(formData.yearPublished) : undefined,
      coverUrl: formData.coverUrl || undefined,
      notes: formData.notes || undefined,
      readCount: 1,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-6 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.forms.addBook}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <div className="p-8">
          {/* Google Books Search */}
          {showSearch && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Buscar en Google Books (opcional)
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por título, autor o ISBN..."
                  className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-700 dark:text-white transition-all"
                />
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-3 bg-gray-50 dark:bg-gray-700 rounded-lg p-3 space-y-2 max-h-64 overflow-y-auto">
                  {searchResults.map((book, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectBook(book)}
                      className="w-full flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-left"
                    >
                      {book.imageUrl ? (
                        <img 
                          src={book.imageUrl} 
                          alt={book.title}
                          className="w-12 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-16 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">{book.title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{book.authors.join(', ')}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {book.pageCount && `${book.pageCount} páginas`}
                          {book.publishedDate && ` • ${book.publishedDate.slice(0, 4)}`}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {isSearching && (
                <div className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
                  Buscando...
                </div>
              )}

              <button
                onClick={() => setShowSearch(false)}
                className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Agregar manualmente
              </button>
            </div>
          )}

          {!showSearch && (
            <button
              onClick={() => setShowSearch(true)}
              className="mb-6 text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Buscar en Google Books
            </button>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.forms.title} *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:bg-gray-700 dark:text-white transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.forms.author} *
                </label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:bg-gray-700 dark:text-white transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.forms.pages} *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.pages}
                  onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:bg-gray-700 dark:text-white transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.forms.genre} *
                </label>
                <input
                  type="text"
                  list="genres"
                  value={formData.genre}
                  onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:bg-gray-700 dark:text-white transition-all"
                />
                <datalist id="genres">
                  {existingGenres.map(g => <option key={g} value={g} />)}
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.forms.nationality} *
                </label>
                <input
                  type="text"
                  list="nationalities"
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:bg-gray-700 dark:text-white transition-all"
                />
                <datalist id="nationalities">
                  {existingNationalities.map(n => <option key={n} value={n} />)}
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Inicio de lectura
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:bg-gray-700 dark:text-white transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.forms.dateFinished} *
                </label>
                <input
                  type="date"
                  value={formData.dateFinished}
                  onChange={(e) => setFormData({ ...formData, dateFinished: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:bg-gray-700 dark:text-white transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.forms.rating} (1-5)
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:bg-gray-700 dark:text-white transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t.forms.collections}
                </label>
                <input
                  type="text"
                  value={formData.collections}
                  onChange={(e) => setFormData({ ...formData, collections: e.target.value })}
                  placeholder={t.forms.collectionsPlaceholder}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:bg-gray-700 dark:text-white transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notas
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  placeholder="Tus pensamientos sobre el libro..."
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:bg-gray-700 dark:text-white transition-all resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSubmit}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-700 dark:from-amber-500 dark:to-orange-600 text-white rounded-xl hover:from-amber-700 hover:to-orange-800 dark:hover:from-amber-600 dark:hover:to-orange-700 transition-all font-medium shadow-lg"
              >
                {t.common.save}
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium"
              >
                {t.common.cancel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}