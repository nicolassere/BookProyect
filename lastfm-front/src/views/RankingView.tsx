import { Calendar, Music, Users, Disc, TrendingUp } from 'lucide-react';
import type { Stats } from '../types';

interface YearsViewProps {
  stats: Stats;
}

export const YearsView: React.FC<YearsViewProps> = ({ stats }) => {
  const years = stats.yearlyStats || [];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center gap-3 mb-2">
          <Calendar className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Year by Year Breakdown</h2>
        </div>
        <p className="text-gray-600">Your music journey through the years</p>
      </div>

      {years.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No yearly data available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {years.map((year, index) => (
            <div 
              key={year.year}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Year Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-3xl font-bold mb-1">{year.year}</h3>
                    <p className="text-blue-100">
                      {year.totalScrobbles.toLocaleString()} total scrobbles
                    </p>
                  </div>
                  {index === 0 && (
                    <div className="px-4 py-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <span className="text-sm font-semibold">Latest Year</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Music className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-gray-600">Scrobbles</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {year.totalScrobbles.toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-emerald-600" />
                      <span className="text-sm font-medium text-gray-600">Artists</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {year.uniqueArtists.toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Disc className="w-5 h-5 text-violet-600" />
                      <span className="text-sm font-medium text-gray-600">Songs</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {year.uniqueSongs.toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-amber-600" />
                      <span className="text-sm font-medium text-gray-600">Avg/Day</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round(year.totalScrobbles / 365)}
                    </p>
                  </div>
                </div>

                {/* Top Artist & Song */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-gray-900">Top Artist</h4>
                    </div>
                    <p className="text-lg font-bold text-gray-900 mb-1 truncate">
                      {year.topArtist}
                    </p>
                    <p className="text-sm text-gray-600">
                      {year.topArtistPlays.toLocaleString()} plays
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Music className="w-5 h-5 text-purple-600" />
                      <h4 className="font-semibold text-gray-900">Top Song</h4>
                    </div>
                    <p className="text-lg font-bold text-gray-900 mb-1 truncate">
                      {year.topSong}
                    </p>
                    <p className="text-sm text-gray-600">
                      {year.topSongPlays.toLocaleString()} plays
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comparison Chart */}
      {years.length > 1 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Year Comparison</h3>
          <div className="space-y-3">
            {years.map((year) => {
              const maxScrobbles = Math.max(...years.map(y => y.totalScrobbles));
              const percentage = (year.totalScrobbles / maxScrobbles) * 100;
              
              return (
                <div key={year.year} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700 w-16">
                    {year.year}
                  </span>
                  <div className="flex-1 bg-gray-100 rounded-full h-10 relative overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-end px-3 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    >
                      <span className="text-xs font-semibold text-white">
                        {year.totalScrobbles.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};