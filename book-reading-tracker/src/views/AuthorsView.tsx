// src/views/AuthorsView.tsx
import { useState } from 'react';
import { Edit2, Star } from 'lucide-react';
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

  const authors = sortBy === 'books' ? stats.authorsByBooks : stats.authorsByPages;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{t.authors.title}</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('books')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                sortBy === 'books' 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t.authors.sortByBooks}
            </button>
            <button
              onClick={() => setSortBy('pages')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                sortBy === 'pages' 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t.authors.sortByPages}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {authors.map((author, i) => {
            const profile = stats.authorProfiles.get(author.author);
            const authorBooks = readings.filter(r => r.author === author.author);
            
            return (
              <div 
                key={i} 
                className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-gray-50 to-white hover:from-amber-50 hover:to-orange-50 transition-all border border-gray-200"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">{author.author}</h3>
                  <p className="text-sm text-gray-600">
                    {author.nationality}
                    {sortBy === 'books' 
                      ? ` • ${author.count} ${author.count === 1 ? 'book' : 'books'}`
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
                      {sortBy === 'books' ? 'books' : t.books.pages}
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
      </div>
    </div>
  );
}