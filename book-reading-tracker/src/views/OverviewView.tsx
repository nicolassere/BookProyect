// src/views/OverviewView.tsx - ENHANCED with Dark Mode
import { Book, Users, BarChart3, TrendingUp, Tag, Globe, Star, StarHalf, Award, Flame } from 'lucide-react';
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
      {/* Main Stats Cards */}
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

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Average Rating */}
        {stats.averageRating > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                  Calificación Promedio
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  {stats.averageRating.toFixed(1)}
                  <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
                <Star className="w-6 h-6 text-white fill-white" />
              </div>
            </div>
          </div>
        )}

        {/* Reading Streak */}
        {stats.readingStreak > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                  Racha de Lectura
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.readingStreak}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {stats.readingStreak === 1 ? 'libro' : 'libros'} seguidos
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-red-400 to-orange-500 shadow-lg">
                <Flame className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        )}

        {/* Favorite Count */}
        {stats.favoriteBooks.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                  Favoritos
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.favoriteBooks.length}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  5 ⭐ o marcados
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-pink-400 to-red-500 shadow-lg">
                <Award className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Genres */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            {t.stats.topGenres}
          </h3>
          <div className="space-y-3">
            {stats.genreDistribution.slice(0, 5).map((genre, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-32 truncate">
                  {genre.genre}
                </span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-8 relative overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-end px-3 transition-all duration-500"
                    style={{
                      width: `${(genre.count / stats.genreDistribution[0].count) * 100}%`
                    }}
                  >
                    <span className="text-xs font-bold text-white">
                      {genre.count}
                    </span>
                  </div>
                </div>
                {genre.averageRating > 0 && (
                  <span className="text-xs text-gray-600 dark:text-gray-400 w-12 text-right">
                    {genre.averageRating.toFixed(1)} ⭐
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Top Nationalities */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            {t.stats.topNationalities}
          </h3>
          <div className="space-y-3">
            {stats.authorsByNationality.slice(0, 5).map((nat, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-32 truncate">
                  {nat.nationality}
                </span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-8 relative overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-end px-3 transition-all duration-500"
                    style={{
                      width: `${(nat.count / stats.authorsByNationality[0].count) * 100}%`
                    }}
                  >
                    <span className="text-xs font-bold text-white">
                      {nat.count}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400 w-16 text-right">
                  {nat.authors} {nat.authors === 1 ? 'autor' : 'autores'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Record Books */}
      {(stats.longestBook || stats.shortestBook) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Longest Book */}
          {stats.longestBook && (
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6 border-2 border-purple-200 dark:border-purple-800">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-600 dark:bg-purple-500 rounded-xl">
                  <Book className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wide mb-1">
                    Libro Más Largo
                  </p>
                  <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-1">
                    {stats.longestBook.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stats.longestBook.author} • {stats.longestBook.pages} páginas
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Shortest Book */}
          {stats.shortestBook && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border-2 border-green-200 dark:border-green-800">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-600 dark:bg-green-500 rounded-xl">
                  <Book className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-green-700 dark:text-green-300 uppercase tracking-wide mb-1">
                    Libro Más Corto
                  </p>
                  <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-1">
                    {stats.shortestBook.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stats.shortestBook.author} • {stats.shortestBook.pages} páginas
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rating Distribution */}
      {stats.ratingDistribution.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            Distribución de Calificaciones
          </h3>
          <div className="space-y-3">
            {stats.ratingDistribution.map((rating, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex items-center gap-0.5 w-28">
                  {[...Array(5)].map((_, j) => {
                    if (j < Math.floor(rating.rating)) {
                      return <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />;
                    } else if (j === Math.floor(rating.rating) && rating.rating % 1 > 0) {
                      return <StarHalf key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />;
                    } else {
                      return <Star key={j} className="w-4 h-4 text-gray-300 dark:text-gray-600" />;
                    }
                  })}
                  <span className="text-xs text-gray-500 ml-1">{rating.rating}</span>
                </div>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-8 relative overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-end px-3 transition-all duration-500"
                    style={{
                      width: `${(rating.count / stats.ratingDistribution[0].count) * 100}%`
                    }}
                  >
                    <span className="text-xs font-bold text-white">
                      {rating.count}
                    </span>
                  </div>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                  {((rating.count / stats.totalBooks) * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}