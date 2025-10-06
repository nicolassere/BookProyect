import type { Stats } from '../types';

interface TopSongsListProps {
  stats: Stats;
}

export const TopSongsList: React.FC<TopSongsListProps> = ({ stats }) => {
  const rankColors = [
    'from-yellow-500 to-amber-500',
    'from-slate-400 to-slate-500',
    'from-orange-600 to-amber-700',
  ];

  const getRankColor = (index: number) => {
    if (index < 3) return rankColors[index];
    return 'from-blue-500 to-emerald-500';
  };

  return (
    <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-2xl rounded-2xl p-8 border border-white/10">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <span className="w-1 h-8 bg-gradient-to-b from-violet-500 to-fuchsia-500 rounded-full"></span>
        Top 10 Songs
      </h2>
      <div className="space-y-3">
        {stats.topSongs.map((item, index) => (
          <div
            key={index}
            className="group bg-white/5 rounded-xl p-5 flex justify-between items-center hover:bg-white/10 transition-all duration-300 border border-white/5 hover:border-white/20 hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className={`flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br ${getRankColor(index)} shadow-lg flex-shrink-0`}>
                <span className="text-white font-bold text-sm">#{index + 1}</span>
              </div>
              <span className="text-white font-semibold text-lg truncate group-hover:text-blue-300 transition-colors">{item.song}</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-slate-400 font-bold text-lg">{item.count}</span>
              <span className="text-slate-500 text-sm">plays</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};