import { Music, User, TrendingUp, Clock } from 'lucide-react';
import type { Stats } from '../types';

interface OverviewCardsProps {
  stats: Stats;
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-sm transition-shadow">
        <div className="flex items-center gap-3 mb-3">
          <Music className="w-5 h-5 text-gray-500" />
          <h3 className="font-medium text-gray-600 text-sm">Total Scrobbles</h3>
        </div>
        <p className="text-3xl font-semibold text-gray-900">{stats.total.toLocaleString()}</p>
      </div>

      <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-sm transition-shadow">
        <div className="flex items-center gap-3 mb-3">
          <User className="w-5 h-5 text-gray-500" />
          <h3 className="font-medium text-gray-600 text-sm">Unique Artists</h3>
        </div>
        <p className="text-3xl font-semibold text-gray-900">{stats.uniqueArtists.toLocaleString()}</p>
      </div>

      <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-sm transition-shadow">
        <div className="flex items-center gap-3 mb-3">
          <TrendingUp className="w-5 h-5 text-gray-500" />
          <h3 className="font-medium text-gray-600 text-sm">Unique Songs</h3>
        </div>
        <p className="text-3xl font-semibold text-gray-900">{stats.uniqueSongs.toLocaleString()}</p>
      </div>

      <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-sm transition-shadow">
        <div className="flex items-center gap-3 mb-3">
          <Clock className="w-5 h-5 text-gray-500" />
          <h3 className="font-medium text-gray-600 text-sm">Top Artist</h3>
        </div>
        <p className="text-xl font-semibold text-gray-900 truncate">{stats.topArtists[0]?.artist || '-'}</p>
        <p className="text-sm text-gray-500 mt-1">
          {stats.topArtists[0]?.count.toLocaleString() || 0} plays
        </p>
      </div>
    </div>
  );
};