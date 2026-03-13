// src/components/shared/BookShelf.tsx
// Virtual bookshelf — compact, few rows. Books grouped by saga then nationality.
// Groups flow continuously; a floating label marks each group's first book.
import { useState } from 'react';
import { Library } from 'lucide-react';
import type { Reading } from '../../types';

interface BookShelfProps {
  readings: Reading[];
  onBookClick?: (book: Reading) => void;
}

interface ShelfGroup {
  label: string;
  type: 'saga' | 'nationality';
  books: Reading[];
}

interface BookItem {
  book: Reading;
  groupLabel: string;
  groupType: 'saga' | 'nationality';
  isFirstInGroup: boolean;
}

// Deterministic hue from a string
function stringToHue(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = s.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

function groupBooks(books: Reading[]): ShelfGroup[] {
  const sagaMap = new Map<string, Reading[]>();
  const natMap = new Map<string, Reading[]>();

  for (const book of books) {
    if (book.collections && book.collections.length > 0) {
      const saga = book.collections[0];
      if (!sagaMap.has(saga)) sagaMap.set(saga, []);
      sagaMap.get(saga)!.push(book);
    } else {
      const nat = book.nationality || 'Desconocido';
      if (!natMap.has(nat)) natMap.set(nat, []);
      natMap.get(nat)!.push(book);
    }
  }

  const groups: ShelfGroup[] = [];
  for (const [label, grpBooks] of [...sagaMap.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    groups.push({ label, type: 'saga', books: grpBooks });
  }
  for (const [label, grpBooks] of [...natMap.entries()].sort((a, b) => b[1].length - a[1].length)) {
    groups.push({ label, type: 'nationality', books: grpBooks });
  }
  return groups;
}

function buildItems(groups: ShelfGroup[]): BookItem[] {
  const items: BookItem[] = [];
  for (const group of groups) {
    group.books.forEach((book, i) => {
      items.push({
        book,
        groupLabel: group.label,
        groupType: group.type,
        isFirstInGroup: i === 0,
      });
    });
  }
  return items;
}

// ── Book spine ────────────────────────────────────────────────────────────────

function BookSpine({
  book,
  isFirstInGroup,
  groupLabel,
  groupType,
  onClick,
}: {
  book: Reading;
  isFirstInGroup: boolean;
  groupLabel: string;
  groupType: 'saga' | 'nationality';
  onClick?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const hue = stringToHue(book.genre);

  const clamped = Math.min(Math.max(book.pages, 100), 1200);
  const width = Math.round(22 + ((clamped - 100) / 1100) * 32);
  const fontSize = width < 28 ? 9 : 10;

  return (
    // Extra left margin at group boundaries for visual breathing room
    <div
      className="relative flex-shrink-0 cursor-pointer"
      style={{
        width: `${width}px`,
        height: '130px',
        marginLeft: isFirstInGroup ? '10px' : '2px',
        transform: hovered ? 'translateY(-12px)' : 'translateY(0)',
        transition: 'transform 0.16s ease',
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Group label tab — floats at top of first book in group */}
      {isFirstInGroup && (
        <div
          className="absolute left-0 right-0 flex justify-center"
          style={{ top: '-20px', zIndex: 10 }}
        >
          <span
            className="text-white font-bold truncate rounded-t px-1.5"
            style={{
              fontSize: '8px',
              maxWidth: '80px',
              letterSpacing: '0.03em',
              background: groupType === 'saga'
                ? 'linear-gradient(to bottom, #7c5230, #5c3a1e)'
                : 'linear-gradient(to bottom, #2e6b3e, #1e4a2a)',
              boxShadow: '0 -1px 4px rgba(0,0,0,0.3)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            title={groupLabel}
          >
            {groupType === 'saga' ? '📚 ' : '🌍 '}{groupLabel}
          </span>
        </div>
      )}

      {/* Thin vertical divider line before first book in group */}
      {isFirstInGroup && (
        <div
          className="absolute top-0 bottom-0"
          style={{
            left: '-6px',
            width: '1px',
            background: 'rgba(0,0,0,0.18)',
          }}
        />
      )}

      {/* Spine body */}
      <div
        className="w-full h-full rounded-t flex flex-col overflow-hidden"
        style={{
          background: `linear-gradient(160deg,
            hsl(${hue}, 45%, 62%) 0%,
            hsl(${hue}, 55%, 46%) 50%,
            hsl(${hue}, 62%, 34%) 100%)`,
          boxShadow: hovered
            ? `3px -4px 16px rgba(0,0,0,0.45), inset 3px 0 8px rgba(255,255,255,0.15)`
            : `2px 0 5px rgba(0,0,0,0.2), inset 2px 0 3px rgba(255,255,255,0.1)`,
        }}
      >
        {/* Left binding shadow */}
        <div className="absolute left-0 top-0 bottom-0" style={{ width: '3px', background: 'rgba(0,0,0,0.22)' }} />

        {/* Title */}
        <div className="flex-1 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.15)' }} />
          <span
            className="relative select-none font-bold text-white"
            style={{
              writingMode: 'vertical-rl',
              transform: 'rotate(180deg)',
              fontSize: `${fontSize}px`,
              lineHeight: 1.2,
              maxHeight: '102px',
              overflow: 'hidden',
              letterSpacing: '0.04em',
              textShadow: `
                0 0 5px rgba(0,0,0,1),
                0 0 10px rgba(0,0,0,0.8),
                1px 1px 0 rgba(0,0,0,1),
                -1px -1px 0 rgba(0,0,0,0.9)
              `,
              padding: '4px 1px',
            }}
          >
            {book.title}
          </span>
        </div>

        {/* Author initials strip */}
        <div
          className="flex-shrink-0 flex items-center justify-center"
          style={{ height: '16px', background: 'rgba(0,0,0,0.28)', borderTop: '1px solid rgba(255,255,255,0.08)' }}
        >
          <span className="text-white/60 font-medium" style={{ fontSize: '7px', letterSpacing: '0.05em' }}>
            {book.author.split(' ').map(w => w[0]).join('').slice(0, 5).toUpperCase()}
          </span>
        </div>
      </div>

      {/* Gold glow for 4.5★+ */}
      {book.rating !== undefined && book.rating >= 4.5 && (
        <div
          className="absolute top-1.5 right-1 rounded-full"
          style={{ width: '7px', height: '7px', background: '#fde047', boxShadow: '0 0 6px 2px rgba(253,224,71,0.7)' }}
        />
      )}

      {/* Hover tooltip */}
      {hovered && (
        <div
          className="absolute bottom-full left-1/2 mb-2 z-50 pointer-events-none"
          style={{ transform: 'translateX(-50%)', minWidth: '155px' }}
        >
          <div className="bg-gray-900 text-white text-xs rounded-xl px-3 py-2.5 shadow-2xl border border-gray-700/60">
            <p className="font-bold leading-snug">{book.title}</p>
            <p className="text-gray-400 mt-0.5 truncate">{book.author}</p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="px-1.5 py-0.5 rounded text-white font-semibold" style={{ fontSize: '10px', background: `hsl(${hue}, 52%, 38%)` }}>
                {book.genre}
              </span>
              <span className="text-gray-500">{book.pages}p</span>
              {book.rating !== undefined && (
                <span className="text-yellow-400 ml-auto tracking-tight">{'★'.repeat(Math.round(book.rating))}</span>
              )}
            </div>
          </div>
          <div className="mx-auto" style={{ width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid #111827' }} />
        </div>
      )}
    </div>
  );
}

// ── Shelf row ─────────────────────────────────────────────────────────────────

const BOOKS_PER_ROW = 28;

function ShelfRow({ items, onBookClick }: { items: BookItem[]; onBookClick?: (b: Reading) => void }) {
  return (
    <div style={{ paddingTop: '24px' /* space for group label tabs */ }}>
      {/* Books */}
      <div className="flex items-end" style={{ paddingLeft: '6px', paddingRight: '6px' }}>
        {items.map((item, i) => (
          <BookSpine
            key={item.book.id + i}
            book={item.book}
            isFirstInGroup={item.isFirstInGroup}
            groupLabel={item.groupLabel}
            groupType={item.groupType}
            onClick={() => onBookClick?.(item.book)}
          />
        ))}
      </div>

      {/* Wooden plank */}
      <div
        style={{
          height: '20px',
          background: 'linear-gradient(to bottom, #d4a453 0%, #b8823a 55%, #9a6a28 100%)',
          boxShadow: '0 5px 10px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.22)',
          borderRadius: '1px',
        }}
      />
      {/* Underside shadow */}
      <div style={{ height: '8px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.13), transparent)' }} />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function BookShelf({ readings, onBookClick }: BookShelfProps) {
  const completed = readings.filter(
    r => r.status === 'completed' || (!r.status && r.dateFinished),
  );

  if (completed.length === 0) return null;

  const groups = groupBooks(completed);
  const items = buildItems(groups);

  // Slice into rows
  const rows: BookItem[][] = [];
  for (let i = 0; i < items.length; i += BOOKS_PER_ROW) {
    rows.push(items.slice(i, i + BOOKS_PER_ROW));
  }
  // Mark isFirstInGroup correctly after row splitting
  // (a group that starts mid-way through a row keeps its label)

  const sagaCount = groups.filter(g => g.type === 'saga').length;
  const natCount = groups.filter(g => g.type === 'nationality').length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Library className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          Tu Estantería
        </h3>
        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
          {sagaCount > 0 && <span>📚 {sagaCount} {sagaCount === 1 ? 'saga' : 'sagas'}</span>}
          {natCount > 0 && <span>🌍 {natCount} {natCount === 1 ? 'civilización' : 'civilizaciones'}</span>}
          <span className="text-gray-300 dark:text-gray-600">·</span>
          <span>{completed.length} libros</span>
        </div>
      </div>

      {/* Shelves */}
      <div
        className="overflow-x-auto px-3 pb-4"
        style={{
          background: 'radial-gradient(ellipse at top, #f0ebe0 0%, #e4dccb 70%, #d8cfbc 100%)',
        }}
      >
        {rows.map((rowItems, i) => (
          <ShelfRow key={i} items={rowItems} onBookClick={onBookClick} />
        ))}
      </div>

      {/* Legend */}
      <div className="px-6 py-2.5 border-t border-gray-100 dark:border-gray-700 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 dark:text-gray-500">
        <span>Ancho = páginas · Color = género</span>
        <span>·</span>
        <span className="flex items-center gap-1.5">
          <span style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', background: '#fde047', boxShadow: '0 0 4px rgba(253,224,71,0.7)' }} />
          4.5+ estrellas
        </span>
        <span>·</span>
        <span>📚 saga · 🌍 civilización</span>
      </div>
    </div>
  );
}
