// src/components/books/BookDetailsModal.tsx
import { X, Edit2, Star, StarHalf, Calendar, BookOpen, Hash, Globe2, Heart, Trash2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import type { Reading, AuthorProfile } from '../../types';

interface BookDetailsModalProps {
  book: Reading;
  authorProfile?: AuthorProfile;
  onClose: () => void;
  onEdit: (book: Reading) => void;
  onDelete: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
}

export function BookDetailsModal({
  book,
  authorProfile,
  onClose,
  onEdit,
  onDelete,
  onToggleFavorite,
}: BookDetailsModalProps) {
  const { t } = useLanguage();

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-4xl w-full shadow-2xl my-8">
        {/* Header with cover */}
        <div className="relative">
          {/* Background gradient */}
          <div className="h-48 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-t-3xl" />
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/90 dark:bg-gray-800/90 rounded-full hover:bg-white dark:hover:bg-gray-700 transition-all shadow-lg"
          >
            <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>

          {/* Book cover */}
          <div className="absolute -bottom-16 left-8">
            {book.coverUrl ? (
              <img
                src={book.coverUrl}
                alt={book.title}
                className="w-32 h-48 object-cover rounded-xl shadow-2xl border-4 border-white dark:border-gray-800"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`w-32 h-48 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-xl shadow-2xl border-4 border-white dark:border-gray-800 flex items-center justify-center ${book.coverUrl ? 'hidden' : ''}`}>
              <BookOpen className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-20 px-8 pb-8">
          {/* Title and author */}
          <div className="mb-6">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                {book.title}
              </h2>
              {onToggleFavorite && (
                <button
                  onClick={() => onToggleFavorite(book.id)}
                  className={`p-2 rounded-full transition-all ${
                    book.favorite
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:text-red-500'
                  }`}
                  title={book.favorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart className={`w-5 h-5 ${book.favorite ? 'fill-current' : ''}`} />
                </button>
              )}
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              por <span className="font-semibold">{book.author}</span>
            </p>
            {book.rating != null && (
              <div className="flex items-center gap-1 mt-2">
                {[...Array(5)].map((_, i) => {
                  if (i < Math.floor(book.rating!)) {
                    return <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />;
                  } else if (i === Math.floor(book.rating!) && book.rating! % 1 > 0) {
                    return <StarHalf key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />;
                  } else {
                    return <Star key={i} className="w-5 h-5 text-gray-300 dark:text-gray-600" />;
                  }
                })}
                <span className="ml-2 text-lg font-bold text-gray-700 dark:text-gray-300">
                  {book.rating}/5
                </span>
              </div>
            )}
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                <BookOpen className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase">Páginas</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{book.pages}</p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-1">
                <Hash className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase">Género</span>
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{book.genre}</p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
                <Globe2 className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase">Origen</span>
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{book.nationality}</p>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase">Leído</span>
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{book.dateFinished}</p>
            </div>
          </div>

          {/* Additional info */}
          {(book.yearPublished || book.isbn || book.startDate) && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">Información Adicional</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {book.yearPublished && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Año de publicación:</span>
                    <p className="font-semibold text-gray-900 dark:text-white">{book.yearPublished}</p>
                  </div>
                )}
                {book.isbn && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">ISBN:</span>
                    <p className="font-semibold text-gray-900 dark:text-white">{book.isbn}</p>
                  </div>
                )}
                {book.startDate && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Inicio de lectura:</span>
                    <p className="font-semibold text-gray-900 dark:text-white">{book.startDate}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Collections */}
          {book.collections.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">Colecciones</h3>
              <div className="flex gap-2 flex-wrap">
                {book.collections.map((col, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium"
                  >
                    {col}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {book.notes && (
            <div className="mb-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">Notas</h3>
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border-l-4 border-amber-400">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{book.notes}</p>
              </div>
            </div>
          )}

          {/* Author info */}
          {authorProfile && (
            <div className="mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-4">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Sobre el autor</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-semibold">{authorProfile.name}</span> • {authorProfile.nationality} • {authorProfile.primaryGenre}
              </p>
              {authorProfile.averageRating && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Calificación promedio: {authorProfile.averageRating.toFixed(1)} ⭐
                </p>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => onEdit(book)}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-xl transition-all font-medium shadow-lg flex items-center justify-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Editar
            </button>
            <button
              onClick={() => {
                if (confirm('¿Estás seguro de que quieres eliminar este libro?')) {
                  onDelete(book.id);
                  onClose();
                }
              }}
              className="px-6 py-3 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 rounded-xl transition-all font-medium flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}