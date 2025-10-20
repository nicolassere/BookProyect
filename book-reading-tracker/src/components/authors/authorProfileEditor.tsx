// src/components/authors/AuthorProfileEditor.tsx
import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import type { AuthorProfile, Reading } from '../../types';

interface AuthorProfileEditorProps {
  author: string;
  profile?: AuthorProfile;
  readings: Reading[];
  onClose: () => void;
  onSave: (profile: AuthorProfile) => void;
}

export function AuthorProfileEditor({
  author,
  profile,
  readings,
  onClose,
  onSave,
}: AuthorProfileEditorProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    nationality: profile?.nationality || 'Unknown',
    primaryGenre: profile?.primaryGenre || readings[0]?.genre || '',
    favoriteBook: profile?.favoriteBook || '',
  });

  const handleSubmit = () => {
    onSave({
      name: author,
      nationality: formData.nationality,
      primaryGenre: formData.primaryGenre,
      favoriteBook: formData.favoriteBook || undefined,
      totalBooks: readings.length,
      totalPages: readings.reduce((sum, r) => sum + r.pages, 0),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.authors.editProfile}</h2>
        <p className="text-gray-600 mb-6">{author}</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.authors.nationality} *
            </label>
            <input
              type="text"
              value={formData.nationality}
              onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.authors.primaryGenre} *
            </label>
            <input
              type="text"
              value={formData.primaryGenre}
              onChange={(e) => setFormData({ ...formData, primaryGenre: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.authors.favoriteBook} ({t.authors.booksBy})
            </label>
            <select
              value={formData.favoriteBook}
              onChange={(e) => setFormData({ ...formData, favoriteBook: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
            >
              <option value="">-- {t.common.select || 'Select'} --</option>
              {readings.map((book) => (
                <option key={book.id} value={book.title}>
                  {book.title} ({book.yearPublished || 'N/A'})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
            <p className="font-medium mb-2">{t.authors.booksBy}:</p>
            <p>
              {readings.length} books • {readings.reduce((sum, r) => sum + r.pages, 0).toLocaleString()} {t.books.pages}
            </p>
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