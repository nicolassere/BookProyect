import { Trophy, Crown, Medal, Star, Music, Disc, Loader2 } from 'lucide-react';
import { useState, memo, useMemo } from 'react';
import type { Stats } from '../types';

interface RankingViewProps {
  stats: Stats & { rankingsLoading?: boolean };
}

type RankingMode = 'top1' | 'top5' | 'top10';
type RankingType = 'artists' | 'songs' | 'albums';

const RankingCard = memo(({ 
  item, 
  index, 
  maxDays, 
  getModeLabel, 
  getCurrentLabel 
}: {
  item: any;
  index: number;
  maxDays: number;
  getModeLabel: () => string;
  getCurrentLabel: () => string;
}) => (
  <div 
    className={`bg-white rounded-xl p-6 shadow-sm border-2 transition-all hover:shadow-md ${
      index === 0 ? 'border-yellow-400 bg-gradient-to-r from-yellow-50 to-white' :
      index === 1 ? 'border-gray-400 bg-gradient-to-r from-gray-50 to-white' :
      index === 2 ? 'border-orange-400 bg-gradient-to-r from-orange-50 to-white' :
      'border-gray-200'
    }`}
  >
    <div className="flex items-center gap-4">
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

      <div className="text-right">
        <div className="text-4xl font-bold text-gray-900">
          {item.daysInTop}
        </div>
        <div className="text-sm text-gray-600 font-medium">
          {getModeLabel()}
        </div>
      </div>
    </div>

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
            width: `${(item.daysInTop / maxDays) * 100}%` 
          }}
        ></div>
      </div>
    </div>
  </div>
));

RankingCard.displayName = 'RankingCard';

export const RankingView = memo<RankingViewProps>(({ stats }) => {
  const [mode, setMode] = useState<RankingMode>('top1');
  const [type, setType] = useState<RankingType>('artists');
  
  console.log('🎨 RankingView render:', { 
    hasRankings: !!stats.rankings, 
    loading: stats.rankingsLoading,
    rankings: stats.rankings
  });
  
  const rankings = useMemo(() => {
    const data = stats.rankings?.[type]?.[mode] || [];
    console.log(`📊 ${type}.${mode}:`, data);
    return data;
  }, [stats.rankings, type, mode]);

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

  const getTypeLabel = () => type.charAt(0).toUpperCase() + type.slice(1);
  const getTypeIcon = () => {
    switch (type) {
      case 'artists': return Crown;
      case 'songs': return Music;
      case 'albums': return Disc;
    }
  };

  const TypeIcon = getTypeIcon();
  const maxDays = useMemo(() => rankings.length > 0 ? rankings[0].daysInTop : 1, [rankings]);
  const summaryStats = useMemo(() => ({
    champion: rankings[0] || null,
    totalRankings: rankings.length,
    dominancePercent: rankings[0] 
      ? ((rankings[0].daysInTop / rankings.reduce((sum, r) => sum + r.daysInTop, 0)) * 100).toFixed(1)
      : '0'
  }), [rankings]);

  if (stats.rankingsLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
          <div className="flex items-center justify-center gap-3 py-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Calculating Rankings...</h2>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                  ? `Total days each ${type.slice(0, -1)} has been your #1`
                  : mode === 'top5'
                  ? `Total days each ${type.slice(0, -1)} has been in Top 5`
                  : `Total days each ${type.slice(0, -1)} has been in Top 10`
                }
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex gap-2">
            {['artists', 'songs', 'albums'].map(t => (
              <button
                key={t}
                onClick={() => setType(t as RankingType)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  type === t ? 'bg-purple-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {t === 'artists' && <Crown className="w-4 h-4" />}
                {t === 'songs' && <Music className="w-4 h-4" />}
                {t === 'albums' && <Disc className="w-4 h-4" />}
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div className="w-px bg-gray-300"></div>

          <div className="flex gap-2">
            {['top1', 'top5', 'top10'].map(m => (
              <button
                key={m}
                onClick={() => setMode(m as RankingMode)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  mode === m ? 'bg-yellow-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {m === 'top1' ? '#1' : m === 'top5' ? 'Top 5' : 'Top 10'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {rankings.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No ranking data available</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4">
            {rankings.map((item, index) => (
              <RankingCard
                key={item.name}
                item={item}
                index={index}
                maxDays={maxDays}
                getModeLabel={getModeLabel}
                getCurrentLabel={getCurrentLabel}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <Crown className="w-6 h-6 text-yellow-500" />
                <h3 className="font-semibold text-gray-900">Champion</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1 truncate">
                {summaryStats.champion?.name || '-'}
              </p>
              <p className="text-sm text-gray-600">
                {summaryStats.champion?.daysInTop || 0} {getModeLabel()}
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <Trophy className="w-6 h-6 text-blue-500" />
                <h3 className="font-semibold text-gray-900">Total {getTypeLabel()}</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {summaryStats.totalRankings}
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
                {summaryStats.dominancePercent}%
              </p>
              <p className="text-sm text-gray-600">of total days</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
});

RankingView.displayName = 'RankingView';

export default RankingView;