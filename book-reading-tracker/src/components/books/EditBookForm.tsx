// src/components/books/EditBookForm.tsx - WITH GOOGLE BOOKS SEARCH
import { useState, useEffect } from 'react';
import { X, GraduationCap, BookOpen, Search, Loader2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { searchGoogleBooks } from '../../utils/googleBooksAPI';
import type { Reading, ReadingType } from '../../types';

interface EditBookFormProps {
  book: Reading;
  onClose: () => void;
  onSave: (reading: Reading) => void;
  existingGenres?: string[];
  existingNationalities?: string[];
}

export function EditBookForm({ 
  book,
  onClose, 
  onSave,
  existingGenres = [],
  existingNationalities = []
}: EditBookFormProps) {
  const { t } = useLanguage();
  
  // Google Books search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchError, setSearchError] = useState<string>('');
  
  const [formData, setFormData] = useState({
    title: book.title,
    author: book.author,
    pages: book.pages.toString(),
    genre: book.genre,
    nationality: book.nationality,
    dateFinished: book.dateFinished,
    startDate: book.startDate || '',
    rating: book.rating?.toString() || '',
    collections: book.collections.join(', '),
    isbn: book.isbn || '',
    yearPublished: book.yearPublished?.toString() || '',
    coverUrl: book.coverUrl || '',
    notes: book.notes || '',
    readingType: (book.readingType || 'complete') as ReadingType,
    academicField: book.academicField || '',
    academicLevel: (book.academicLevel || '') as '' | 'undergraduate' | 'graduate' | 'reference',
    totalChapters: book.totalChapters?.toString() || '',
    chaptersRead: book.chaptersRead?.join(', ') || '',
  });

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 3) {
      setSearchResults([]);
      setSearchError('');
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setSearchError('');
      try {
        const results = await searchGoogleBooks(searchQuery);
        setSearchResults(results);
        if (results.length === 0) {
          setSearchError('No results found. Try a different search term.');
        }
      } catch (error: any) {
        setSearchError(error.message || 'Error searching Google Books. Please try again later.');
        setSearchResults([]);
      }
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectBook = (googleBook: any) => {
    setFormData({
      ...formData,
      title: googleBook.title || formData.title,
      author: googleBook.authors?.[0] || formData.author,
      pages: googleBook.pageCount?.toString() || formData.pages,
      isbn: googleBook.isbn || formData.isbn,
      yearPublished: googleBook.publishedDate?.slice(0, 4) || formData.yearPublished,
      coverUrl: googleBook.imageUrl || formData.coverUrl,
      notes: formData.notes || googleBook.description?.slice(0, 500) || '',
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

    // Validación para libros académicos
    if (formData.readingType === 'academic' && !formData.academicField) {
      alert('Por favor especifica el campo académico para libros académicos');
      return;
    }

    // Parsear capítulos leídos si están especificados
    let chaptersRead: number[] | undefined;
    if (formData.chaptersRead) {
      chaptersRead = formData.chaptersRead
        .split(',')
        .map(c => parseInt(c.trim()))
        .filter(n => !isNaN(n));
    }

    // Crear el objeto actualizado con TODOS los campos
    const updatedBook: Reading = {
      // Mantener campos originales que no se editan
      id: book.id,
      timestamp: book.timestamp,
      readCount: book.readCount,
      
      // Campos editables - básicos
      title: formData.title.trim(),
      author: formData.author.trim(),
      pages: parseInt(formData.pages),
      genre: formData.genre.trim(),
      nationality: formData.nationality.trim(),
      dateFinished: formData.dateFinished,
      parsedDate: formData.dateFinished ? new Date(formData.dateFinished) : null,
      
      // Campos opcionales
      startDate: formData.startDate.trim() || undefined,
      rating: formData.rating ? parseInt(formData.rating) : undefined,
      collections: formData.collections.split(',').map(c => c.trim()).filter(Boolean),
      isbn: formData.isbn.trim() || undefined,
      yearPublished: formData.yearPublished ? parseInt(formData.yearPublished) : undefined,
      coverUrl: formData.coverUrl.trim() || undefined,
      notes: formData.notes.trim() || undefined,
      favorite: book.favorite, // Mantener estado de favorito
      
      // Tipo de lectura
      readingType: formData.readingType,
      
      // Campos académicos (solo si es académico)
      academicField: (formData.readingType === 'academic' || formData.readingType === 'reference') 
        ? formData.academicField.trim() 
        : undefined,
      academicLevel: (formData.readingType === 'academic' || formData.readingType === 'reference') && formData.academicLevel 
        ? formData.academicLevel 
        : undefined,
      totalChapters: formData.totalChapters ? parseInt(formData.totalChapters) : undefined,
      chaptersRead: chaptersRead && chaptersRead.length > 0 ? chaptersRead : undefined,
    };

    console.log('Saving updated book:', updatedBook);
    onSave(updatedBook);
  };

  const isAcademic = formData.readingType === 'academic' || formData.readingType === 'reference';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-6 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.forms.editBook}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <div className="p-8">
          {/* Google Books Search Section */}
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Update from Google Books
              </label>
              <button
                type="button"
                onClick={() => setShowSearch(!showSearch)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  showSearch 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 hover:bg-blue-200'
                }`}
              >
                {showSearch ? 'Hide Search' : 'Search Google Books'}
              </button>
            </div>
            
            {showSearch && (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by title, author, or ISBN..."
                    className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-700 dark:text-white transition-all"
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500 animate-spin" />
                  )}
                </div>
                
                {searchResults.length > 0 && (
                  <div className="max-h-60 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700">
                    {searchResults.map((result, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectBook(result)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all text-left border-b last:border-0 border-gray-100 dark:border-gray-600"
                      >
                        {result.imageUrl ? (
                          <img src={result.imageUrl} alt="" className="w-10 h-14 object-cover rounded shadow" />
                        ) : (
                          <div className="w-10 h-14 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate">{result.title}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {result.authors?.join(', ')} {result.publishedDate && `• ${result.publishedDate.slice(0, 4)}`}
                          </p>
                        </div>
                        {result.pageCount && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">{result.pageCount} pgs</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
                
                {searchError && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">{searchError}</p>
                    {searchError.includes('Rate limit') && (
                      <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                        To fix this, add a Google Books API key to your .env file. See .env.example for instructions.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tipo de lectura */}
          <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Tipo de Lectura
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, readingType: 'complete' })}
                className={`p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                  formData.readingType === 'complete'
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                    : 'border-gray-200 dark:border-gray-600 hover:border-amber-300 text-gray-700 dark:text-gray-300'
                }`}
              >
                <BookOpen className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-semibold">Lectura Completa</div>
                  <div className="text-xs opacity-75">Libro leído de inicio a fin</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, readingType: 'academic' })}
                className={`p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                  formData.readingType === 'academic'
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                    : 'border-gray-200 dark:border-gray-600 hover:border-indigo-300 text-gray-700 dark:text-gray-300'
                }`}
              >
                <GraduationCap className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-semibold">Libro Académico</div>
                  <div className="text-xs opacity-75">Libro de estudio o formación</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, readingType: 'reference' })}
                className={`p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                  formData.readingType === 'reference'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                    : 'border-gray-200 dark:border-gray-600 hover:border-purple-300 text-gray-700 dark:text-gray-300'
                }`}
              >
                <BookOpen className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-semibold">Referencia</div>
                  <div className="text-xs opacity-75">Consulta parcial</div>
                </div>
              </button>
            </div>
          </div>

          {/* Main form */}
          <div className="space-y-4">
            {/* Preview cover if exists */}
            {formData.coverUrl && (
              <div className="flex justify-center mb-4">
                <img 
                  src={formData.coverUrl} 
                  alt="Cover preview" 
                  className="h-32 object-cover rounded-lg shadow-lg"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            )}

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
            </div>

            {/* Academic fields */}
            {isAcademic && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Campo Académico * <GraduationCap className="w-4 h-4 inline text-indigo-600 dark:text-indigo-400" />
                  </label>
                  <input
                    type="text"
                    value={formData.academicField}
                    onChange={(e) => setFormData({ ...formData, academicField: e.target.value })}
                    placeholder="ej: Matemáticas, Física, Biología, etc."
                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:bg-gray-700 dark:text-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nivel Académico
                  </label>
                  <select
                    value={formData.academicLevel}
                    onChange={(e) => setFormData({ ...formData, academicLevel: e.target.value as any })}
                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-600 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-all"
                  >
                    <option value="">-- Seleccionar --</option>
                    <option value="undergraduate">Pregrado</option>
                    <option value="graduate">Posgrado</option>
                    <option value="reference">Referencia</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Total de Capítulos
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.totalChapters}
                    onChange={(e) => setFormData({ ...formData, totalChapters: e.target.value })}
                    placeholder="ej: 12"
                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:bg-gray-700 dark:text-white transition-all"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Capítulos Leídos (separados por comas)
                  </label>
                  <input
                    type="text"
                    value={formData.chaptersRead}
                    onChange={(e) => setFormData({ ...formData, chaptersRead: e.target.value })}
                    placeholder="ej: 1, 2, 5, 7"
                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:bg-gray-700 dark:text-white transition-all"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Si no leíste el libro completo, especifica los capítulos que consultaste
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Año de Publicación
                </label>
                <input
                  type="number"
                  min="1000"
                  max={new Date().getFullYear()}
                  value={formData.yearPublished}
                  onChange={(e) => setFormData({ ...formData, yearPublished: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:bg-gray-700 dark:text-white transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  ISBN
                </label>
                <input
                  type="text"
                  value={formData.isbn}
                  onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:bg-gray-700 dark:text-white transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  URL de portada
                </label>
                <input
                  type="url"
                  value={formData.coverUrl}
                  onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
                  placeholder="https://..."
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