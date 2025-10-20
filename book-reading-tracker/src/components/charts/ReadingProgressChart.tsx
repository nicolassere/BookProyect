// src/components/charts/ReadingProgressChart.tsx
import { TrendingUp, Calendar } from 'lucide-react';
import type { Reading } from '../../types';

interface MonthData {
  month: string;
  year: number;
  count: number;
  pages: number;
}

interface ReadingProgressChartProps {
  readings: Reading[];
  months?: number; // Number of months to show, default 12
}

export function ReadingProgressChart({ readings, months = 12 }: ReadingProgressChartProps) {
  // Calculate monthly data
  const monthlyData = calculateMonthlyData(readings, months);
  const maxBooks = Math.max(...monthlyData.map(m => m.count), 1);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Progreso de Lectura
          </h3>
        </div>
        <Calendar className="w-5 h-5 text-gray-400" />
      </div>

      {/* Chart */}
      <div className="space-y-3">
        {monthlyData.map((data, i) => {
          const percentage = (data.count / maxBooks) * 100;
          const isCurrentMonth = 
            data.month === new Date().toLocaleString('es', { month: 'short' }) &&
            data.year === new Date().getFullYear();

          return (
            <div key={i} className="group">
              <div className="flex items-center gap-3 mb-1">
                <span className={`text-sm font-medium w-20 ${
                  isCurrentMonth 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {data.month} '{data.year.toString().slice(-2)}
                </span>
                <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-8 relative overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCurrentMonth
                        ? 'bg-gradient-to-r from-blue-400 to-indigo-500'
                        : 'bg-gradient-to-r from-amber-400 to-orange-500'
                    }`}
                    style={{ width: `${Math.max(percentage, 3)}%` }}
                  >
                    <div className="absolute inset-0 flex items-center justify-end pr-3">
                      <span className="text-xs font-bold text-white">
                        {data.count}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400 w-16 text-right group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                  {data.pages.toLocaleString()} pgs
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {monthlyData.reduce((sum, m) => sum + m.count, 0)}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Total Libros</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {(monthlyData.reduce((sum, m) => sum + m.count, 0) / months).toFixed(1)}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Promedio/Mes</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {monthlyData.reduce((sum, m) => sum + m.pages, 0).toLocaleString()}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Total Páginas</p>
        </div>
      </div>
    </div>
  );
}

function calculateMonthlyData(readings: Reading[], months: number): MonthData[] {
  const now = new Date();
  const monthsData: MonthData[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = date.toLocaleString('es', { month: 'short' });
    const year = date.getFullYear();

    const booksInMonth = readings.filter(r => {
      if (!r.parsedDate) return false;
      return (
        r.parsedDate.getMonth() === date.getMonth() &&
        r.parsedDate.getFullYear() === date.getFullYear()
      );
    });

    monthsData.push({
      month,
      year,
      count: booksInMonth.length,
      pages: booksInMonth.reduce((sum, b) => sum + b.pages, 0),
    });
  }

  return monthsData;
}