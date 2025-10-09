import { Trophy, Crown, Medal, Star, Music, Disc } from 'lucide-react';
import { useState } from 'react';
import type { Stats } from '../types';

interface RankingViewProps {
  stats: Stats;
}

type RankingMode = 'top1' | 'top5' | 'top10';
type RankingType = 'artists' | 'songs' | 'albums';

export const RankingView: React.FC<RankingViewProps> = ({ stats }) => {
  const [mode, setMode] = useState<RankingMode>('top1');
  const [type, setType] = useState<RankingType>('artists');
  
  const rankings = stats.rankings[type][mode];

  const getModeLabel = () => {
    switch (mode) {
      case 'top1': return 'days as #1';
      case 'top5': return 'days in top 5';
      case 'top10': return 'days in top 10';
    }
  };

  const getCurrentLabel = () => {
    switch (mode) {
      case 'top1': return 'Current #1';
      case 'top5': return 'Current Top 5';
      case 'top10': return 'Current Top 10';
    }
  };

  const getTypeLabel = () => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'artists': return Crown;
      case 'songs': return Music;
      case 'albums': return Disc;
    }
  };

  const TypeIcon = getTypeIcon();

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <TypeIcon className="w-8 h-8 text-yellow-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">All-Time Cumulative Ranking</h2>
              <p className="text-sm text-gray-600 mt-1">
                {mode === 'top1' 
                  ? `Total days each ${type.slice(0, -1)} has been your #1 most played`
                  : mode === 'top5'
                  ? `Total days each ${type.slice(0, -1)} has been in your Top 5`
                  : `Total days each ${type.slice(0, -1)} has been in your Top 10`
                }
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Type Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setType('artists')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                type === 'artists'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Crown className="w-4 h-4" />
              Artists
            </button>
            <button
              onClick={() => setType('songs')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                type === 'songs'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Music className="w-4 h-4" />
              Songs
            </button>
            <button
              onClick={() => setType('albums')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                type === 'albums'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Disc className="w-4 h-4" />
              Albums
            </button>
          </div>

          <div className="w-px bg-gray-300"></div>

          {/* Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setMode('top1')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                mode === 'top1'
                  ? 'bg-yellow-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              #1
            </button>
            <button
              onClick={() => setMode('top5')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                mode === 'top5'
                  ? 'bg-yellow-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Top 5
            </button>
            <button
              onClick={() => setMode('top10')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                mode === 'top10'
                  ? 'bg-yellow-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Top 10
            </button>
          </div>
        </div>
      </div>

      {rankings.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No ranking data available (minimum 3 days required)</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {rankings.map((item, index) => {
            return (
              <div 
                key={index}
                className={`bg-white rounded-xl p-6 shadow-sm border-2 transition-all hover:shadow-md ${
                  index === 0 ? 'border-yellow-400 bg-gradient-to-r from-yellow-50 to-white' :
                  index === 1 ? 'border-gray-400 bg-gradient-to-r from-gray-50 to-white' :
                  index === 2 ? 'border-orange-400 bg-gradient-to-r from-orange-50 to-white' :
                  'border-gray-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Medalla/Posición */}
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 ${
                    index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                    index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                    index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                    'bg-gradient-to-br from-blue-400 to-blue-600'
                  }`}>
                    {index < 3 ? (
                      <Medal className="w-8 h-8 text-white" />
                    ) : (
                      <span className="text-white font-bold text-2xl">{index + 1}</span>
                    )}
                  </div>

                  {/* Info del item */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold text-gray-900 truncate">
                        {item.name}
                      </h3>
                      {item.isCurrentlyTop && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          {getCurrentLabel()}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {item.totalPlays.toLocaleString()} total plays
                    </p>
                  </div>

                  {/* Stats de días */}
                  <div className="text-right">
                    <div className="text-4xl font-bold text-gray-900">
                      {item.daysInTop}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                      {getModeLabel()}
                    </div>
                  </div>
                </div>

                {/* Barra de progreso */}
                <div className="mt-4">
                  <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                        index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                        index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                        'bg-gradient-to-r from-blue-400 to-blue-600'
                      }`}
                      style={{ 
                        width: `${(item.daysInTop / rankings[0].daysInTop) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary stats */}
      {rankings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <Crown className="w-6 h-6 text-yellow-500" />
              <h3 className="font-semibold text-gray-900">Champion</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1 truncate">
              {rankings[0]?.name || '-'}
            </p>
            <p className="text-sm text-gray-600">
              {rankings[0]?.daysInTop || 0} {getModeLabel()}
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <Trophy className="w-6 h-6 text-blue-500" />
              <h3 className="font-semibold text-gray-900">Total {getTypeLabel()}</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {rankings.length}
            </p>
            <p className="text-sm text-gray-600">
              Different {mode} {type}
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <Medal className="w-6 h-6 text-emerald-500" />
              <h3 className="font-semibold text-gray-900">Dominance</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {rankings[0] 
                ? ((rankings[0].daysInTop / rankings.reduce((sum, r) => sum + r.daysInTop, 0)) * 100).toFixed(1)
                : 0
              }%
            </p>
            <p className="text-sm text-gray-600">of total days</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RankingView;