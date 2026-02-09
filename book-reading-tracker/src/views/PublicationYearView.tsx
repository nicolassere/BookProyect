// src/views/PublicationYearView.tsx
import { useMemo, useState } from 'react';
import { Calendar, BookOpen, TrendingUp, Clock } from 'lucide-react';
import { useBooks } from '../contexts/BookContext';
import type { Reading } from '../types';

type GroupingMode = 'year' | 'decade' | 'century' | 'era';

interface YearGroup {
  label: string;
  range: string;
  books: Reading[];
  totalPages: number;
  avgRating: number;
}

export function PublicationYearView() {
  const { readings } = useBooks();
  const [grouping, setGrouping] = useState<GroupingMode>('decade');
  
  // Filtrar libros que tienen año de publicación (excluir académicos y YA por defecto)
  const booksWithYear = useMemo(() => {
    return readings.filter(r => 
      r.yearPublished &&
      (!r.readingType || r.readingType === 'complete') && // Excluir académicos
      r.genre !== 'YA' // Excluir YA
    );
  }, [readings]);

  // Función para obtener la era/civilización
  const getEra = (year: number): string => {
    if (year < 500) return 'Antigüedad (-500)';
    if (year < 1000) return 'Alta Edad Media (500-999)';
    if (year < 1500) return 'Baja Edad Media (1000-1499)';
    if (year < 1800) return 'Edad Moderna (1500-1799)';
    if (year < 1900) return 'Siglo XIX (1800-1899)';
    if (year < 1950) return 'Primera mitad s. XX (1900-1949)';
    if (year < 2000) return 'Segunda mitad s. XX (1950-1999)';
    return 'Siglo XXI (2000+)';
  };

  // Función para obtener el siglo
  const getCentury = (year: number): string => {
    if (year < 1) return 'Antes de Cristo';
    const century = Math.ceil(year / 100);
    if (century <= 20) {
      const roman = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
                     'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX'];
      return `Siglo ${roman[century]} (${(century-1)*100+1}-${century*100})`;
    }
    return `Siglo XXI (2001-2100)`;
  };

  // Función para obtener la década
  const getDecade = (year: number): string => {
    const decade = Math.floor(year / 10) * 10;
    return `${decade}s (${decade}-${decade + 9})`;
  };

  // Agrupar libros según el modo seleccionado
  const groupedBooks = useMemo(() => {
    const groups = new Map<string, Reading[]>();

    booksWithYear.forEach(book => {
      let key: string;
      
      switch (grouping) {
        case 'year':
          key = book.yearPublished!.toString();
          break;
        case 'decade':
          key = getDecade(book.yearPublished!);
          break;
        case 'century':
          key = getCentury(book.yearPublished!);
          break;
        case 'era':
          key = getEra(book.yearPublished!);
          break;
      }

      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(book);
    });

    // Convertir a array y ordenar
    const result: YearGroup[] = Array.from(groups.entries()).map(([label, books]) => {
      const totalPages = books.reduce((sum, b) => sum + b.pages, 0);
      const ratedBooks = books.filter(b => b.rating);
      const avgRating = ratedBooks.length > 0
        ? ratedBooks.reduce((sum, b) => sum + (b.rating || 0), 0) / ratedBooks.length
        : 0;

      // Para sorting, extraer el primer año del rango
      let sortKey: number;
      if (grouping === 'year') {
        sortKey = parseInt(label);
      } else {
        const match = label.match(/\d+/);
        sortKey = match ? parseInt(match[0]) : 0;
      }

      return {
        label,
        range: label,
        books,
        totalPages,
        avgRating,
        sortKey,
      };
    });

    // Ordenar por año (ascendente)
    return result.sort((a, b) => (a as any).sortKey - (b as any).sortKey);
  }, [booksWithYear, grouping]);

  const totalBooksWithYear = booksWithYear.length;
  const totalBooksWithoutYear = readings.length - totalBooksWithYear;
  const oldestBook = booksWithYear.length > 0 
    ? booksWithYear.reduce((oldest, book) => 
        book.yearPublished! < oldest.yearPublished! ? book : oldest
      )
    : null;
  const newestBook = booksWithYear.length > 0
    ? booksWithYear.reduce((newest, book) =>
        book.yearPublished! > newest.yearPublished! ? book : newest
      )
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Libros por Año de Publicación
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Análisis histórico (excluye académicos y YA)
            </p>
          </div>
        </div>
      </div>

      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-2">
            <BookOpen className="w-5 h-5" />
            <span className="text-sm font-semibold">Con año</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalBooksWithYear}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {totalBooksWithoutYear} sin año
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
            <Calendar className="w-5 h-5" />
            <span className="text-sm font-semibold">Libro más antiguo</span>
          </div>
          {oldestBook ? (
            <>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {oldestBook.yearPublished}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                {oldestBook.title}
              </p>
            </>
          ) : (
            <p className="text-gray-400">-</p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
            <Calendar className="w-5 h-5" />
            <span className="text-sm font-semibold">Libro más reciente</span>
          </div>
          {newestBook ? (
            <>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {newestBook.yearPublished}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                {newestBook.title}
              </p>
            </>
          ) : (
            <p className="text-gray-400">-</p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-2">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm font-semibold">Rango temporal</span>
          </div>
          {oldestBook && newestBook ? (
            <>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {newestBook.yearPublished! - oldestBook.yearPublished!}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">años de historia</p>
            </>
          ) : (
            <p className="text-gray-400">-</p>
          )}
        </div>
      </div>

      {/* Selector de agrupación */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Agrupar por:
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => setGrouping('year')}
            className={`p-4 rounded-lg border-2 transition-all ${
              grouping === 'year'
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                : 'border-gray-200 dark:border-gray-600 hover:border-purple-300 text-gray-700 dark:text-gray-300'
            }`}
          >
            <div className="font-semibold">Año exacto</div>
            <div className="text-xs opacity-75">1984, 2010, etc.</div>
          </button>

          <button
            onClick={() => setGrouping('decade')}
            className={`p-4 rounded-lg border-2 transition-all ${
              grouping === 'decade'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 text-gray-700 dark:text-gray-300'
            }`}
          >
            <div className="font-semibold">Década</div>
            <div className="text-xs opacity-75">1980s, 2000s, etc.</div>
          </button>

          <button
            onClick={() => setGrouping('century')}
            className={`p-4 rounded-lg border-2 transition-all ${
              grouping === 'century'
                ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                : 'border-gray-200 dark:border-gray-600 hover:border-green-300 text-gray-700 dark:text-gray-300'
            }`}
          >
            <div className="font-semibold">Siglo</div>
            <div className="text-xs opacity-75">XVIII, XIX, XX, XXI</div>
          </button>

          <button
            onClick={() => setGrouping('era')}
            className={`p-4 rounded-lg border-2 transition-all ${
              grouping === 'era'
                ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                : 'border-gray-200 dark:border-gray-600 hover:border-amber-300 text-gray-700 dark:text-gray-300'
            }`}
          >
            <div className="font-semibold">Era/Civilización</div>
            <div className="text-xs opacity-75">Antigua, Medieval, etc.</div>
          </button>
        </div>
      </div>

      {/* Grupos de libros */}
      <div className="space-y-4">
        {groupedBooks.map((group, idx) => {
          const maxBooks = Math.max(...groupedBooks.map(g => g.books.length));
          const percentage = (group.books.length / maxBooks) * 100;
          
          return (
            <div
              key={idx}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              {/* Header del grupo */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    {group.label}
                  </h3>
                  <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>{group.books.length} libros</span>
                    <span>{group.totalPages.toLocaleString()} páginas</span>
                    {group.avgRating > 0 && (
                      <span>⭐ {group.avgRating.toFixed(1)}</span>
                    )}
                  </div>
                </div>
                {/* Barra de proporción */}
                <div className="w-32">
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-600"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-right mt-1">
                    {((group.books.length / totalBooksWithYear) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Lista de libros */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {group.books.map((book) => (
                  <div
                    key={book.id}
                    className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                  >
                    {book.coverUrl ? (
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-12 h-16 object-cover rounded shadow"
                      />
                    ) : (
                      <div className="w-12 h-16 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500 rounded flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">
                        {book.title}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {book.author}
                      </p>
                      <div className="flex gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>{book.yearPublished}</span>
                        <span>•</span>
                        <span>{book.pages} pág.</span>
                        {book.rating != null && book.rating > 0 && (
                          <>
                            <span>•</span>
                            <span>⭐ {book.rating}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {totalBooksWithYear === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No hay libros con año de publicación registrado
        </div>
      )}
    </div>
  );
}