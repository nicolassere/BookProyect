// src/views/BooksView.tsx
import { useState, useMemo } from 'react';
import { List, Edit2, X, Star } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import type { Reading } from '../types';

interface BooksViewProps {
  readings: Reading[];
  authorProfiles: Map<string, any>;
  onEdit: (book: Reading) => void;
  onDelete: (id: string) => void;
}

export function BooksView({ readings, authorProfiles, onEdit, onDelete }: BooksViewProps) {
  const { t } = useLanguage();
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'author' | 'rating'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');

  const sortedReadings = useMemo(() => {
    let filtered = readings;
    
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return [...filtered].sort((a, b) => {
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
  }, [readings, sortBy, sortOrder, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <List className="w-6 h-6 text-amber-600" />
            {t.books.title} ({readings.length})
          </h2>
          
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={t.books.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-amber-500 text-sm"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-lg border-2 border-gray-200 text-sm"
            >
              <option value="date">{t.books.sortBy.date}</option>
              <option value="title">{t.books.sortBy.title}</option>
              <option value="author">{t.books.sortBy.author}</option>
              <option value="rating">{t.books.sortBy.rating}</option>
            </select>
            <button
              onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 rounded-lg border-2 border-gray-200 hover:bg-gray-50 text-sm font-medium"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {sortedReadings.map((book) => {
            const profile = authorProfiles.get(book.author);
            return (
              <div
                key={book.id}
                className="flex items-start gap-4 p-4 rounded-lg bg-gradient-to-r from-gray-50 to-white hover:from-amber-50 hover:to-orange-50 transition-all border border-gray-200"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{book.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {t.books.by} <span className="font-medium">{book.author}</span>
                    {profile && (
                      <span className="text-gray-400"> • {profile.nationality}</span>
                    )}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
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
                    <div className="flex gap-2 mt-2">
                      {book.collections.map((col, i) => (
                        <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                          {col}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(book)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    title={t.common.edit}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(book.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title={t.common.delete}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {sortedReadings.length === 0 && (
          <div className="text-center py-12">
            <List className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No books found</p>
          </div>
        )}
      </div>
    </div>
  );
}