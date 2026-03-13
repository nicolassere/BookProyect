// src/components/shared/BookShelf.tsx
// A visual bookshelf showing your completed books as colored spines.
// Width = proportional to page count. Color = derived from genre.
import { useState } from 'react';
import { Library } from 'lucide-react';
import type { Reading } from '../../types';

interface BookShelfProps {
  readings: Reading[];
  onBookClick?: (book: Reading) => void;
}

// Deterministic hue from a string (same genre = same color, always)
function stringToHue(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = s.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

function BookSpine({ book, onClick }: { book: Reading; onClick?: () => void }) {
  const [hovered, setHovered] = useState(false);
  const hue = stringToHue(book.genre);

  // Width: 18–52px proportional to pages (100–1200 range)
  const clamped = Math.min(Math.max(book.pages, 100), 1200);
  const width = Math.round(18 + ((clamped - 100) / 1100) * 34);

  return (
    <div
      className="relative flex-shrink-0 cursor-pointer"
      style={{
        width: `${width}px`,
        height: '120px',
        transform: hovered ? 'translateY(-10px)' : 'translateY(0)',
        transition: 'transform 0.18s ease',
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Book spine body */}
      <div
        className="w-full h-full rounded-t-sm flex items-center justify-center overflow-hidden"
        style={{
          background: `linear-gradient(150deg, hsl(${hue}, 52%, 52%), hsl(${hue}, 62%, 34%))`,
          boxShadow: hovered
            ? `3px -4px 14px rgba(0,0,0,0.4), inset 3px 0 8px rgba(255,255,255,0.18)`
            : `2px 0 6px rgba(0,0,0,0.22), inset 2px 0 4px rgba(255,255,255,0.1)`,
        }}
      >
        {/* Left spine shadow strip */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1 rounded-tl-sm"
          style={{ background: `rgba(0,0,0,0.2)` }}
        />
        {/* Vertical title */}
        <span
          className="text-white font-semibold select-none px-0.5"
          style={{
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            fontSize: width < 26 ? '7.5px' : '9px',
            lineHeight: 1.15,
            maxHeight: '108px',
            overflow: 'hidden',
            textShadow: '0 1px 3px rgba(0,0,0,0.5)',
            letterSpacing: '0.03em',
          }}
        >
          {book.title}
        </span>
      </div>

      {/* Gold star dot for top-rated books */}
      {book.rating !== undefined && book.rating >= 4.5 && (
        <div
          className="absolute top-1.5 right-1"
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#fbbf24',
            boxShadow: '0 0 5px 1px rgba(251,191,36,0.7)',
          }}
        />
      )}

      {/* Hover tooltip */}
      {hovered && (
        <div
          className="absolute bottom-full left-1/2 mb-3 z-50 pointer-events-none"
          style={{ transform: 'translateX(-50%)', minWidth: '148px' }}
        >
          <div className="bg-gray-900 text-white text-xs rounded-xl px-3 py-2.5 shadow-2xl border border-gray-700">
            <p className="font-bold leading-snug">{book.title}</p>
            <p className="text-gray-400 mt-0.5 truncate">{book.author}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span
                className="px-1.5 py-0.5 rounded text-white font-medium"
                style={{
                  fontSize: '10px',
                  background: `hsl(${hue}, 55%, 42%)`,
                }}
              >
                {book.genre}
              </span>
              <span className="text-gray-500">{book.pages}p</span>
              {book.rating !== undefined && (
                <span className="text-yellow-400 ml-auto">
                  {'★'.repeat(Math.round(book.rating))}
                </span>
              )}
            </div>
          </div>
          {/* Tooltip arrow */}
          <div
            className="mx-auto"
            style={{
              width: 0,
              height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop: '5px solid #111827',
            }}
          />
        </div>
      )}
    </div>
  );
}

const BOOKS_PER_SHELF = 18;

function Shelf({ books, onBookClick }: { books: Reading[]; onBookClick?: (b: Reading) => void }) {
  return (
    <div>
      {/* Books sitting on shelf */}
      <div className="flex items-end gap-[2px] px-3">
        {books.map(book => (
          <BookSpine key={book.id} book={book} onClick={() => onBookClick?.(book)} />
        ))}
      </div>
      {/* Wooden plank */}
      <div
        style={{
          height: '18px',
          borderRadius: '2px',
          background: 'linear-gradient(to bottom, #d4a453 0%, #b8823a 60%, #9a6c2a 100%)',
          boxShadow: '0 5px 10px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.25)',
        }}
      />
      {/* Shelf underside shadow */}
      <div
        style={{
          height: '8px',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.12), transparent)',
        }}
      />
    </div>
  );
}

export function BookShelf({ readings, onBookClick }: BookShelfProps) {
  const completed = readings.filter(
    r => r.status === 'completed' || (!r.status && r.dateFinished),
  );

  if (completed.length === 0) return null;

  // Sort oldest → newest so earlier reads are on the first shelf (top)
  const sorted = [...completed].sort((a, b) => {
    const da = a.dateFinished ? new Date(a.dateFinished).getTime() : 0;
    const db = b.dateFinished ? new Date(b.dateFinished).getTime() : 0;
    return da - db;
  });

  const shelves: Reading[][] = [];
  for (let i = 0; i < sorted.length; i += BOOKS_PER_SHELF) {
    shelves.push(sorted.slice(i, i + BOOKS_PER_SHELF));
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Library className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          Tu Estantería
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {completed.length} {completed.length === 1 ? 'libro' : 'libros'}
        </span>
      </div>

      {/* Shelves */}
      <div
        className="overflow-x-auto p-4 space-y-1"
        style={{
          background:
            'radial-gradient(ellipse at top, #f0ebe0 0%, #e8e0d0 60%, #ddd5c2 100%)',
        }}
      >
        {shelves.map((shelfBooks, i) => (
          <Shelf key={i} books={shelfBooks} onBookClick={onBookClick} />
        ))}
      </div>

      {/* Legend */}
      <div className="px-6 py-2.5 border-t border-gray-100 dark:border-gray-700 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 dark:text-gray-500">
        <span>Ancho = páginas</span>
        <span>·</span>
        <span>Color = género</span>
        <span>·</span>
        <span className="flex items-center gap-1.5">
          <span
            style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#fbbf24',
              boxShadow: '0 0 4px rgba(251,191,36,0.6)',
            }}
          />
          4.5+ estrellas
        </span>
        <span>·</span>
        <span>Hover para detalles</span>
      </div>
    </div>
  );
}
