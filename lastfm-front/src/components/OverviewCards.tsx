import { Music, User, TrendingUp, Clock } from 'lucide-react';
import type { Stats } from '../types';

interface OverviewCardsProps {
  stats: Stats;
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Music className="w-6 h-6" />
          <h3 className="font-semibold">Total Scrobbles</h3>
        </div>
        <p className="text-3xl font-bold">{stats.total.toLocaleString()}</p>
      </div>

      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <User className="w-6 h-6" />
          <h3 className="font-semibold">Artistas Únicos</h3>
        </div>
        <p className="text-3xl font-bold">{stats.uniqueArtists.toLocaleString()}</p>
      </div>

      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-6 h-6" />
          <h3 className="font-semibold">Canciones Únicas</h3>
        </div>
        <p className="text-3xl font-bold">{stats.uniqueSongs.toLocaleString()}</p>
      </div>

      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Clock className="w-6 h-6" />
          <h3 className="font-semibold">Top Artista</h3>
        </div>
        <p className="text-xl font-bold truncate">{stats.topArtists[0]?.artist || '-'}</p>
        <p className="text-sm opacity-75">
          {stats.topArtists[0]?.count.toLocaleString() || 0} reproducciones
        </p>
      </div>
    </div>
  );
};