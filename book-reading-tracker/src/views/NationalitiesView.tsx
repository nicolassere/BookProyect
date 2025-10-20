// src/views/NationalitiesView.tsx
import { Globe, Users, Book } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import type { Stats } from '../types';

interface NationalitiesViewProps {
  stats: Stats;
}

export function NationalitiesView({ stats }: NationalitiesViewProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Globe className="w-6 h-6 text-blue-600" />
          {t.navigation.nationalities}
        </h2>

        <div className="space-y-4">
          {stats.authorsByNationality.map((nat, i) => (
            <div
              key={i}
              className="p-6 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 hover:border-blue-400 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900">{nat.nationality}</h3>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">{nat.count}</div>
                  <div className="text-sm text-gray-600">{t.stats.booksRead.toLowerCase()}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>
                    {nat.authors} {nat.authors === 1 ? 'author' : 'authors'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Book className="w-4 h-4 text-blue-600" />
                  <span>{(nat.count / nat.authors).toFixed(1)} books/author</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4 bg-white rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${(nat.count / stats.authorsByNationality[0].count) * 100}%`
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {stats.authorsByNationality.length === 0 && (
          <div className="text-center py-12">
            <Globe className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No nationality data available</p>
          </div>
        )}
      </div>
    </div>
  );
}