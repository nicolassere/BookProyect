// src/components/books/AddBookForm.tsx
import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
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
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    pages: '',
    genre: '',
    nationality: '',
    dateFinished: new Date().toISOString().split('T')[0],
    rating: '',
    collections: '',
    isbn: '',
    yearPublished: '',
  });

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
      rating: formData.rating ? parseInt(formData.rating) : undefined,
      collections: formData.collections.split(',').map(c => c.trim()).filter(Boolean),
      timestamp: Date.now().toString(),
      isbn: formData.isbn || undefined,
      yearPublished: formData.yearPublished ? parseInt(formData.yearPublished) : undefined,
      readCount: 1,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.forms.addBook}</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.forms.title} *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.forms.author} *
              </label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.forms.pages} *
              </label>
              <input
                type="number"
                min="1"
                value={formData.pages}
                onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.forms.genre} *
              </label>
              <input
                type="text"
                list="genres"
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
              />
              <datalist id="genres">
                {existingGenres.map(g => <option key={g} value={g} />)}
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.forms.nationality} *
              </label>
              <input
                type="text"
                list="nationalities"
                value={formData.nationality}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
              />
              <datalist id="nationalities">
                {existingNationalities.map(n => <option key={n} value={n} />)}
              </datalist>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.forms.dateFinished} *
              </label>
              <input
                type="date"
                value={formData.dateFinished}
                onChange={(e) => setFormData({ ...formData, dateFinished: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.forms.rating} (1-5)
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.forms.collections}
            </label>
            <input
              type="text"
              value={formData.collections}
              onChange={(e) => setFormData({ ...formData, collections: e.target.value })}
              placeholder={t.forms.collectionsPlaceholder}
              className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSubmit}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-700 text-white rounded-xl hover:from-amber-700 hover:to-orange-800 transition-all font-medium shadow-lg"
            >
              {t.common.save}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
            >
              {t.common.cancel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}