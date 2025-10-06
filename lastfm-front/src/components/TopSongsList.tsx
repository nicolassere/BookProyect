import type { Stats } from '../types';

interface TopSongsListProps {
  stats: Stats;
}

export const TopSongsList: React.FC<TopSongsListProps> = ({ stats }) => {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mt-6">
      <h2 className="text-xl font-bold text-white mb-4">Top 10 Canciones</h2>
      <div className="space-y-2">
        {stats.topSongs.map((item, index) => (
          <div
            key={index}
            className="bg-white/10 rounded-lg p-4 flex justify-between items-center hover:bg-white/20 transition"
          >
            <div className="flex items-center gap-3">
              <span className="text-white/50 font-bold text-lg">#{index + 1}</span>
              <span className="text-white font-semibold">{item.song}</span>
            </div>
            <span className="text-white/70 font-bold">{item.count} plays</span>
          </div>
        ))}
      </div>
    </div>
  );
};