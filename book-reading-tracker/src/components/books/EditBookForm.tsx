// src/components/books/EditBookForm.tsx - COMPLETO
import { useState } from 'react';
import { X, GraduationCap, BookOpen } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
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
                  <div className="text-xs opacity-75">Libro de consulta</div>
                </div>
              </button>
            </div>
          </div>

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
            </div>

            {/* Campos académicos */}
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