import type { Stats } from '../types';

interface TopSongsListProps {
  stats: Stats;
}

export const TopSongsList: React.FC<TopSongsListProps> = ({ stats }) => {
  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Top 10 Songs</h2>
      <div className="space-y-2">
        {stats.topSongs.map((item, index) => (
          <div
            key={index}
            className="flex justify-between items-center p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <span className="text-gray-400 font-medium text-sm w-8 flex-shrink-0">#{index + 1}</span>
              <span className="text-gray-900 font-medium truncate">{item.song}</span>
            </div>
            <span className="text-gray-600 font-medium flex-shrink-0">{item.count.toLocaleString()} plays</span>
          </div>
        ))}
      </div>
    </div>
  );
};
