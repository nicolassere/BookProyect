import { Trophy, Crown, Medal, Star, Music, Disc, Loader2, Calendar } from 'lucide-react';
import { useState, memo, useMemo, useEffect } from 'react';
import type { Scrobble, Stats } from '../types';
import { calculateCumulativeRanking } from '../utils/rankings';
import { TrophyAnimated } from '../components/TrophyAnimated';
import { CountUp } from '../components/CountUp';
import { getArtistColor } from '../utils/theme';

interface RankingViewProps {
  stats: Stats & { rankingsLoading?: boolean };
  scrobbles: Scrobble[];
}

type RankingMode = 'top1' | 'top5' | 'top10';
type RankingType = 'artists' | 'songs' | 'albums';
type TimePeriod = 'alltime' | 'lastyear' | 'last2years' | 'last3years' | 'last5years';

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
}) => {
  const artistColor = getArtistColor(item.name);
  
  return (
    <div 
      className={`glass dark:glass-dark rounded-xl p-6 shadow-sm border-2 transition-all hover:shadow-md card-3d animate-fade-in-up ${
        index === 0 ? 'border-yellow-400 bg-gradient-to-r from-yellow-50 to-white dark:from-yellow-900/20 dark:to-transparent' :
        index === 1 ? 'border-gray-400 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-transparent' :
        index === 2 ? 'border-orange-400 bg-gradient-to-r from-orange-50 to-white dark:from-orange-900/20 dark:to-transparent' :
        'border-gray-200 dark:border-gray-700'
      }`}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="flex items-center gap-4">
        <TrophyAnimated rank={index + 1} size="md" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 truncate">
              {item.name}
            </h3>
            {item.isCurrentlyTop && (
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full flex items-center gap-1 animate-pulse-soft">
                <Star className="w-3 h-3 fill-current" />
                {getCurrentLabel()}
              </span>
            )}
          </div>
          <p className="text-sm text-black-600 dark:text-gray-400">
            <CountUp end={item.totalPlays} suffix=" total plays" />
          </p>
        </div>

        <div className="text-right">
          <div className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            <CountUp end={item.daysInTop} duration={800} />
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            {getModeLabel()}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${(item.daysInTop / maxDays) * 100}%`,
              background: artistColor
            }}
          ></div>
        </div>
      </div>
    </div>
  );
});

RankingCard.displayName = 'RankingCard';

export const RankingView = memo<RankingViewProps>(({ stats, scrobbles }) => {
  const [mode, setMode] = useState<RankingMode>('top1');
  const [type, setType] = useState<RankingType>('artists');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('alltime');
  const [customRankings, setCustomRankings] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Filter scrobbles based on time period
  const filteredScrobbles = useMemo(() => {
    if (timePeriod === 'alltime') return scrobbles;

    const now = new Date();
    const cutoffDate = new Date(now);

    switch (timePeriod) {
      case 'lastyear':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'last2years':
        cutoffDate.setFullYear(now.getFullYear() - 2);
        break;
      case 'last3years':
        cutoffDate.setFullYear(now.getFullYear() - 3);
        break;
      case 'last5years':
        cutoffDate.setFullYear(now.getFullYear() - 5);
        break;
    }

    return scrobbles.filter(s => s.parsedDate && s.parsedDate >= cutoffDate);
  }, [scrobbles, timePeriod]);

  // Calculate rankings for custom time period
  useEffect(() => {
    if (timePeriod === 'alltime') {
      setCustomRankings(null);
      return;
    }

    setIsCalculating(true);

    const timer = setTimeout(() => {
      try {
        const rankings = {
          artists: {
            top1: calculateCumulativeRanking(filteredScrobbles, (s) => s.artist, 1),
            top5: calculateCumulativeRanking(filteredScrobbles, (s) => s.artist, 5),
            top10: calculateCumulativeRanking(filteredScrobbles, (s) => s.artist, 10),
          },
          songs: {
            top1: calculateCumulativeRanking(filteredScrobbles, (s) => `${s.artist} - ${s.song}`, 1),
            top5: calculateCumulativeRanking(filteredScrobbles, (s) => `${s.artist} - ${s.song}`, 5),
            top10: calculateCumulativeRanking(filteredScrobbles, (s) => `${s.artist} - ${s.song}`, 10),
          },
          albums: {
            top1: calculateCumulativeRanking(filteredScrobbles, (s) => `${s.artist} - ${s.album}`, 1),
            top5: calculateCumulativeRanking(filteredScrobbles, (s) => `${s.artist} - ${s.album}`, 5),
            top10: calculateCumulativeRanking(filteredScrobbles, (s) => `${s.artist} - ${s.album}`, 10),
          },
        };
        
        setCustomRankings(rankings);
        setIsCalculating(false);
      } catch (error) {
        console.error('❌ Error calculating custom rankings:', error);
        setIsCalculating(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [filteredScrobbles, timePeriod]);

  const activeRankings = timePeriod === 'alltime' ? stats.rankings : customRankings;
  const isLoading = (timePeriod === 'alltime' && stats.rankingsLoading) || isCalculating;

  const rankings = useMemo(() => {
    if (!activeRankings) return [];
    const data = activeRankings[type]?.[mode] || [];
    return data;
  }, [activeRankings, type, mode]);

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

  const getPeriodLabel = () => {
    switch (timePeriod) {
      case 'alltime': return 'All Time';
      case 'lastyear': return 'Last Year';
      case 'last2years': return 'Last 2 Years';
      case 'last3years': return 'Last 3 Years';
      case 'last5years': return 'Last 5 Years';
    }
  };

  const TypeIcon = getTypeIcon();
  const maxDays = useMemo(() => rankings.length > 0 ? rankings[0].daysInTop : 1, [rankings]);
  const summaryStats = useMemo(() => ({
    champion: rankings[0] || null,
    totalRankings: rankings.length,
    dominancePercent: rankings[0] 
      ? ((rankings[0].daysInTop / rankings.reduce((sum, r) => sum + r.daysInTop, 0)) * 100).toFixed(1)
      : '0',
    totalDays: rankings.reduce((sum, r) => sum + r.daysInTop, 0),
  }), [rankings]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="glass dark:glass-dark rounded-xl p-6 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center justify-center gap-3 py-12">
            <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Calculating Rankings...
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {getPeriodLabel()} - Top {mode === 'top1' ? '1' : mode === 'top5' ? '5' : '10'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass dark:glass-dark rounded-xl p-6 border border-yellow-200 dark:border-yellow-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <TypeIcon className="w-8 h-8 text-yellow-600 dark:text-yellow-400 animate-bounce-soft" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                All-Time Cumulative Ranking
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
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

        {/* Controls */}
        <div className="flex flex-wrap gap-3">
          {/* Time Period */}
          <div className="flex gap-2 flex-wrap">
            <span className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 px-2">
              <Calendar className="w-4 h-4 mr-1" />
              Period:
            </span>
            {(['alltime', 'lastyear', 'last2years', 'last3years', 'last5years'] as TimePeriod[]).map(p => (
              <button
                key={p}
                onClick={() => setTimePeriod(p)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  timePeriod === p 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md' 
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                {p === 'alltime' ? 'All Time' :
                 p === 'lastyear' ? 'Last Year' :
                 p === 'last2years' ? 'Last 2Y' :
                 p === 'last3years' ? 'Last 3Y' : 'Last 5Y'}
              </button>
            ))}
          </div>

          <div className="w-px bg-gray-300 dark:bg-gray-600"></div>

          {/* Type */}
          <div className="flex gap-2">
            {['artists', 'songs', 'albums'].map(t => (
              <button
                key={t}
                onClick={() => setType(t as RankingType)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  type === t ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                {t === 'artists' && <Crown className="w-4 h-4" />}
                {t === 'songs' && <Music className="w-4 h-4" />}
                {t === 'albums' && <Disc className="w-4 h-4" />}
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div className="w-px bg-gray-300 dark:bg-gray-600"></div>

          {/* Mode */}
          <div className="flex gap-2">
            {['top1', 'top5', 'top10'].map(m => (
              <button
                key={m}
                onClick={() => setMode(m as RankingMode)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  mode === m ? 'bg-yellow-600 text-white shadow-md' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                {m === 'top1' ? '#1' : m === 'top5' ? 'Top 5' : 'Top 10'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {rankings.length === 0 ? (
        <div className="glass dark:glass-dark rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
          <Trophy className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4 animate-float" />
          <p className="text-gray-500 dark:text-gray-400">No ranking data available for this period</p>
        </div>
      ) : (
        <>
          {/* Rankings */}
          <div className="grid grid-cols-1 gap-4">
            {rankings.slice(0, 20).map((item, index) => (
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

          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="glass dark:glass-dark rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 card-3d">
              <div className="flex items-center gap-3 mb-3">
                <Crown className="w-6 h-6 text-yellow-500 animate-bounce-soft" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Champion</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1 truncate">
                {summaryStats.champion?.name || '-'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <CountUp end={summaryStats.champion?.daysInTop || 0} suffix=" days" />
              </p>
            </div>
            
            <div className="glass dark:glass-dark rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 card-3d">
              <div className="flex items-center gap-3 mb-3">
                <Trophy className="w-6 h-6 text-blue-500" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Total {getTypeLabel()}</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                <CountUp end={summaryStats.totalRankings} />
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Different {mode} {type}
              </p>
            </div>
            
            <div className="glass dark:glass-dark rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 card-3d">
              <div className="flex items-center gap-3 mb-3">
                <Medal className="w-6 h-6 text-emerald-500" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Dominance</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                {summaryStats.dominancePercent}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">of total days</p>
            </div>

            <div className="glass dark:glass-dark rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 card-3d">
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="w-6 h-6 text-purple-500" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Total Days</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                <CountUp end={summaryStats.totalDays} />
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{getPeriodLabel()}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
});

RankingView.displayName = 'RankingView';

export default RankingView;