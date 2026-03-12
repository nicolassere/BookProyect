// src/components/charts/MonthlyBooksChart.tsx
// Stacked bar chart: each month = a bar, each book = a colored slice by genre

import { useState, useMemo } from 'react';
import type { Reading } from '../../types';

interface MonthlyBooksChartProps {
  readings: Reading[];
  onBookClick?: (book: Reading) => void;
}

interface TooltipState {
  book: Reading;
  x: number;
  y: number;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const BAR_MAX_HEIGHT = 220;
const BAR_WIDTH = 40;
const COL_WIDTH = 52;

const COLOR_PALETTE = [
  '#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#06b6d4', '#f97316', '#ec4899', '#84cc16',
  '#14b8a6', '#a855f7', '#fb923c', '#22d3ee', '#4ade80',
];

function getGenreColor(genre: string): string {
  let hash = 0;
  for (let i = 0; i < genre.length; i++) {
    hash = genre.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLOR_PALETTE[Math.abs(hash) % COLOR_PALETTE.length];
}

export function MonthlyBooksChart({ readings, onBookClick }: MonthlyBooksChartProps) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  // Last 12 months
  const months = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }, []);

  // Group finished readings by month
  const monthlyData = useMemo(() => {
    return months.map(({ year, month }) => {
      const books = readings
        .filter(r => {
          if (!r.parsedDate) return false;
          return r.parsedDate.getFullYear() === year && r.parsedDate.getMonth() === month;
        })
        .sort((a, b) => (a.parsedDate?.getTime() ?? 0) - (b.parsedDate?.getTime() ?? 0));

      const totalPages = books.reduce((sum, b) => sum + b.pages, 0);
      return { year, month, books, totalPages };
    });
  }, [readings, months]);

  const maxPages = useMemo(() =>
    Math.max(...monthlyData.map(m => m.totalPages), 1),
    [monthlyData]
  );

  // Collect unique genres for legend
  const genreColorMap = useMemo(() => {
    const seen = new Map<string, string>();
    readings.forEach(r => {
      if (!seen.has(r.genre)) seen.set(r.genre, getGenreColor(r.genre));
    });
    return seen;
  }, [readings]);

  const now = new Date();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Monthly Reading</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Last 12 months · each slice = one book · height = pages</p>

      <div className="overflow-x-auto">
        <div
          className="flex items-end gap-0"
          style={{ minWidth: COL_WIDTH * 12, height: BAR_MAX_HEIGHT + 48 }}
        >
          {monthlyData.map(({ year, month, books, totalPages }) => {
            const barHeight = totalPages > 0 ? Math.max((totalPages / maxPages) * BAR_MAX_HEIGHT, 6) : 0;
            const isCurrentMonth = now.getFullYear() === year && now.getMonth() === month;

            return (
              <div
                key={`${year}-${month}`}
                className="flex flex-col items-center"
                style={{ width: COL_WIDTH }}
              >
                {/* Page count above bar */}
                <div className="h-6 flex items-end justify-center mb-1">
                  {totalPages > 0 && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {totalPages >= 1000 ? `${(totalPages / 1000).toFixed(1)}k` : totalPages}
                    </span>
                  )}
                </div>

                {/* Bar area — fixed height container, bar grows from bottom */}
                <div
                  className="flex flex-col justify-end"
                  style={{ width: BAR_WIDTH, height: BAR_MAX_HEIGHT }}
                >
                  {barHeight > 0 ? (
                    <div
                      className="w-full flex flex-col-reverse rounded-t-md overflow-hidden"
                      style={{ height: barHeight }}
                    >
                      {books.map((book, bookIdx) => {
                        const sliceHeight = Math.max((book.pages / totalPages) * barHeight, 3);
                        const color = getGenreColor(book.genre);
                        const isLastSlice = bookIdx === books.length - 1;

                        return (
                          <div
                            key={book.id}
                            style={{
                              height: sliceHeight,
                              backgroundColor: color,
                              flexShrink: 0,
                              borderTop: isLastSlice ? 'none' : '1px solid rgba(255,255,255,0.25)',
                            }}
                            className="w-full cursor-pointer transition-all duration-150 hover:brightness-125 hover:z-10"
                            onMouseEnter={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setTooltip({ book, x: rect.left + rect.width / 2, y: rect.top });
                            }}
                            onMouseLeave={() => setTooltip(null)}
                            onClick={() => onBookClick?.(book)}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    // Empty month — faint baseline
                    <div
                      className="w-full rounded-t-sm bg-gray-100 dark:bg-gray-700/50"
                      style={{ height: 4 }}
                    />
                  )}
                </div>

                {/* Book count */}
                <div className="h-5 flex items-center justify-center mt-1">
                  {books.length > 0 && (
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      {books.length}
                    </span>
                  )}
                </div>

                {/* Month label */}
                <span className={`text-xs font-medium ${
                  isCurrentMonth
                    ? 'text-orange-600 dark:text-orange-400 font-bold'
                    : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {MONTH_NAMES[month]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Genre legend */}
      {genreColorMap.size > 0 && (
        <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1.5">
          {Array.from(genreColorMap.entries()).map(([genre, color]) => (
            <span key={genre} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
              {genre}
            </span>
          ))}
        </div>
      )}

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-xl shadow-2xl p-3 pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, calc(-100% - 8px))',
            maxWidth: 220,
          }}
        >
          <p className="font-bold leading-snug mb-0.5">{tooltip.book.title}</p>
          <p className="opacity-75 mb-1">{tooltip.book.author}</p>
          <div className="flex items-center gap-2 opacity-70">
            <span>{tooltip.book.pages.toLocaleString()} pages</span>
            <span>·</span>
            <span>{tooltip.book.genre}</span>
          </div>
          {tooltip.book.rating != null && tooltip.book.rating > 0 && (
            <p className="opacity-70 mt-0.5">{'★'.repeat(Math.round(tooltip.book.rating))}</p>
          )}
        </div>
      )}
    </div>
  );
}
