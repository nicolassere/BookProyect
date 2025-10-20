// src/views/OverviewView.tsx
import { Book, Users, BarChart3, TrendingUp, Tag, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { StatCard } from '../components/shared/StatCard';
import type { Stats } from '../types';

interface OverviewViewProps {
  stats: Stats;
}

export function OverviewView({ stats }: OverviewViewProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Book}
          label={t.stats.booksRead}
          value={stats.totalBooks}
          color="from-blue-500 to-blue-600"
        />
        <StatCard
          icon={BarChart3}
          label={t.stats.totalPages}
          value={stats.totalPages}
          color="from-emerald-500 to-emerald-600"
        />
        <StatCard
          icon={Users}
          label={t.stats.uniqueAuthors}
          value={stats.uniqueAuthors}
          color="from-purple-500 to-purple-600"
        />
        <StatCard
          icon={TrendingUp}
          label={t.stats.avgPages}
          value={stats.averagePages}
          color="from-amber-500 to-amber-600"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Genres */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5 text-amber-600" />
            {t.stats.topGenres}
          </h3>
          <div className="space-y-3">
            {stats.genreDistribution.slice(0, 5).map((genre, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 w-32 truncate">
                  {genre.genre}
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-8 relative overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-end px-3"
                    style={{
                      width: `${(genre.count / stats.genreDistribution[0].count) * 100}%`
                    }}
                  >
                    <span className="text-xs font-bold text-white">
                      {genre.count}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Nationalities */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600" />
            {t.stats.topNationalities}
          </h3>
          <div className="space-y-3">
            {stats.authorsByNationality.slice(0, 5).map((nat, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 w-32 truncate">
                  {nat.nationality}
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-8 relative overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-end px-3"
                    style={{
                      width: `${(nat.count / stats.authorsByNationality[0].count) * 100}%`
                    }}
                  >
                    <span className="text-xs font-bold text-white">
                      {nat.count} {t.books.title.toLowerCase()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}