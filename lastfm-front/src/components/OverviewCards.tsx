import { Music, User, TrendingUp, Clock } from 'lucide-react';
import type { Stats } from '../types';

interface OverviewCardsProps {
  stats: Stats;
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
      <div className="group bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-2xl rounded-2xl p-6 text-white border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
            <Music className="w-5 h-5 text-blue-400" />
          </div>
          <h3 className="font-semibold text-slate-300 text-sm uppercase tracking-wider">Total Scrobbles</h3>
        </div>
        <p className="text-4xl font-bold bg-gradient-to-br from-white to-blue-200 bg-clip-text text-transparent">{stats.total.toLocaleString()}</p>
      </div>

      <div className="group bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 backdrop-blur-2xl rounded-2xl p-6 text-white border border-emerald-500/20 hover:border-emerald-400/40 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
            <User className="w-5 h-5 text-emerald-400" />
          </div>
          <h3 className="font-semibold text-slate-300 text-sm uppercase tracking-wider">Unique Artists</h3>
        </div>
        <p className="text-4xl font-bold bg-gradient-to-br from-white to-emerald-200 bg-clip-text text-transparent">{stats.uniqueArtists.toLocaleString()}</p>
      </div>

      <div className="group bg-gradient-to-br from-amber-500/10 to-amber-600/5 backdrop-blur-2xl rounded-2xl p-6 text-white border border-amber-500/20 hover:border-amber-400/40 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-amber-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
            <TrendingUp className="w-5 h-5 text-amber-400" />
          </div>
          <h3 className="font-semibold text-slate-300 text-sm uppercase tracking-wider">Unique Songs</h3>
        </div>
        <p className="text-4xl font-bold bg-gradient-to-br from-white to-amber-200 bg-clip-text text-transparent">{stats.uniqueSongs.toLocaleString()}</p>
      </div>

      <div className="group bg-gradient-to-br from-rose-500/10 to-rose-600/5 backdrop-blur-2xl rounded-2xl p-6 text-white border border-rose-500/20 hover:border-rose-400/40 transition-all duration-300 hover:shadow-xl hover:shadow-rose-500/10 hover:-translate-y-1">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-rose-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
            <Clock className="w-5 h-5 text-rose-400" />
          </div>
          <h3 className="font-semibold text-slate-300 text-sm uppercase tracking-wider">Top Artist</h3>
        </div>
        <p className="text-2xl font-bold truncate bg-gradient-to-br from-white to-rose-200 bg-clip-text text-transparent">{stats.topArtists[0]?.artist || '-'}</p>
        <p className="text-sm text-slate-400 mt-2">
          {stats.topArtists[0]?.count.toLocaleString() || 0} plays
        </p>
      </div>
    </div>
  );
};