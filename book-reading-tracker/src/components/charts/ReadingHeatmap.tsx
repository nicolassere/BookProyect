// src/components/charts/ReadingHeatmap.tsx
// GitHub-style reading heatmap showing the last 365 days

import { useState } from 'react';
import type { Reading } from '../../types';

interface ReadingHeatmapProps {
  readings: Reading[];
}

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getCellColor(count: number, isDark: boolean): string {
  if (count === 0) return isDark ? '#374151' : '#e5e7eb'; // gray-700 / gray-200
  if (count === 1) return isDark ? '#166534' : '#bbf7d0'; // green-800 / green-200
  return isDark ? '#15803d' : '#4ade80'; // green-700 / green-400
}

export function ReadingHeatmap({ readings }: ReadingHeatmapProps) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; date: string; count: number } | null>(null);
  const [isDark] = useState(() => document.documentElement.classList.contains('dark'));

  // Build a map of ISO date string → book count for the last 365 days
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 364);

  const countMap = new Map<string, number>();
  readings.forEach(r => {
    if (!r.dateFinished) return;
    const d = new Date(r.dateFinished);
    d.setHours(0, 0, 0, 0);
    if (d >= startDate && d <= today) {
      const key = d.toISOString().split('T')[0];
      countMap.set(key, (countMap.get(key) ?? 0) + 1);
    }
  });

  // Build grid: 53 columns (weeks), 7 rows (days Sun–Sat)
  // Align so today lands on the last column
  const dayOfWeek = today.getDay(); // 0 = Sun
  const totalCells = 53 * 7;
  const lastCellIndex = totalCells - 1 - (6 - dayOfWeek); // last col, row = dayOfWeek
  const firstCellDate = new Date(today);
  firstCellDate.setDate(today.getDate() - lastCellIndex);

  // Build cells array
  const cells: { date: Date; key: string; count: number }[] = [];
  for (let i = 0; i < totalCells; i++) {
    const d = new Date(firstCellDate);
    d.setDate(firstCellDate.getDate() + i);
    const key = d.toISOString().split('T')[0];
    cells.push({ date: d, key, count: countMap.get(key) ?? 0 });
  }

  // Figure out month label positions (col index where month starts)
  const monthLabels: { col: number; label: string }[] = [];
  let lastMonth = -1;
  cells.forEach((cell, i) => {
    const col = Math.floor(i / 7);
    const month = cell.date.getMonth();
    if (month !== lastMonth && i % 7 === 0) {
      monthLabels.push({ col, label: MONTH_NAMES[month] });
      lastMonth = month;
    }
  });

  const cellSize = 12;
  const gap = 2;
  const step = cellSize + gap;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        Reading Activity
      </h3>

      <div className="overflow-x-auto">
        <div className="relative inline-block" style={{ paddingTop: 20, paddingLeft: 28 }}>
          {/* Month labels */}
          {monthLabels.map(({ col, label }) => (
            <span
              key={col}
              className="absolute text-xs text-gray-500 dark:text-gray-400"
              style={{ left: 28 + col * step, top: 0 }}
            >
              {label}
            </span>
          ))}

          {/* Day labels */}
          {DAY_LABELS.map((label, row) => (
            <span
              key={row}
              className="absolute text-xs text-gray-500 dark:text-gray-400"
              style={{ top: 20 + row * step, left: 0, lineHeight: `${cellSize}px` }}
            >
              {label}
            </span>
          ))}

          {/* Grid cells */}
          <svg
            width={53 * step - gap}
            height={7 * step - gap}
            style={{ display: 'block' }}
          >
            {cells.map((cell, i) => {
              const col = Math.floor(i / 7);
              const row = i % 7;
              // Skip cells before startDate
              if (cell.date < startDate || cell.date > today) {
                return (
                  <rect
                    key={cell.key}
                    x={col * step}
                    y={row * step}
                    width={cellSize}
                    height={cellSize}
                    rx={2}
                    fill="transparent"
                  />
                );
              }
              return (
                <rect
                  key={cell.key}
                  x={col * step}
                  y={row * step}
                  width={cellSize}
                  height={cellSize}
                  rx={2}
                  fill={getCellColor(cell.count, isDark)}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onMouseEnter={(e) => {
                    const rect = (e.target as SVGRectElement).getBoundingClientRect();
                    setTooltip({
                      x: rect.left + window.scrollX,
                      y: rect.top + window.scrollY,
                      date: cell.key,
                      count: cell.count,
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              );
            })}
          </svg>

          {/* Tooltip */}
          {tooltip && (
            <div
              className="fixed z-50 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded shadow-lg pointer-events-none"
              style={{ left: tooltip.x, top: tooltip.y - 30 }}
            >
              {tooltip.date}: {tooltip.count === 0 ? 'No books' : `${tooltip.count} book${tooltip.count > 1 ? 's' : ''}`}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-3 text-xs text-gray-500 dark:text-gray-400">
          <span>Less</span>
          {[0, 1, 2].map(v => (
            <svg key={v} width={cellSize} height={cellSize}>
              <rect width={cellSize} height={cellSize} rx={2} fill={getCellColor(v, isDark)} />
            </svg>
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
