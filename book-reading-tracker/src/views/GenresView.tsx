// src/views/GenresView.tsx
import { Tag } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import type { Stats } from '../types';

interface GenresViewProps {
  stats: Stats;
}

export function GenresView({ stats }: GenresViewProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Tag className="w-6 h-6 text-amber-600" />
          {t.navigation.genres}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.genreDistribution.map((genre, i) => (
            <div
              key={i}
              className="p-6 rounded-xl bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 hover:border-amber-400 transition-all"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-3">{genre.genre}</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t.stats.booksRead}</span>
                  <span className="text-lg font-bold text-amber-600">{genre.count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t.stats.totalPages}</span>
                  <span className="text-lg font-bold text-blue-600">
                    {genre.pages.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t.stats.avgPages}</span>
                  <span className="text-lg font-bold text-emerald-600">
                    {Math.round(genre.pages / genre.count)}
                  </span>
                </div>
              </div>
              
              {/* Progress bar showing relative popularity */}
              <div className="mt-4 bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${(genre.count / stats.genreDistribution[0].count) * 100}%`
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {stats.genreDistribution.length === 0 && (
          <div className="text-center py-12">
            <Tag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No genre data available</p>
          </div>
        )}
      </div>
    </div>
  );
}