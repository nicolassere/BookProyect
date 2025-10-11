import { useState, memo, useMemo } from 'react';
import { Trophy, Users, TrendingUp, Calendar, Clock } from 'lucide-react';
import type { Stats } from '../types';

interface TimelineViewProps {
  stats: Stats;
}

type TimelineMode = 'days' | 'months';

// OPTIMIZATION: Memoize timeline card component
const TimelineCard = memo(({ 
  item, 
  index, 
  maxValue, 
  getValue, 
  getLabel 
}: {
  item: any;
  index: number;
  maxValue: number;
  getValue: (item: any) => number;
  getLabel: () => string;
}) => (
  <div 
    className="bg-gradient-to-r from-gray-50 to-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-all"
  >
    <div className="flex items-center gap-4">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 ${
        index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
        index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
        index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
        'bg-gradient-to-br from-blue-400 to-blue-600'
      }`}>
        <span className="text-white font-bold text-2xl">{index + 1}</span>
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="text-xl font-bold text-gray-900 truncate mb-1">
          {item.artist}
        </h3>
        <p className="text-sm text-gray-600">
          {item.totalPlays.toLocaleString()} total plays
        </p>
      </div>
      
      <div className="text-right">
        <div className="text-4xl font-bold text-gray-900">
          {getValue(item)}
        </div>
        <div className="text-sm text-gray-600 font-medium">
          {getLabel()}
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
            width: `${(getValue(item) / maxValue) * 100}%` 
          }}
        ></div>
      </div>
    </div>
  </div>
));

TimelineCard.displayName = 'TimelineCard';

// OPTIMIZATION: Memoize the entire view
export const TimelineView = memo<TimelineViewProps>(({ stats }) => {
  const [mode, setMode] = useState<TimelineMode>('days');
  const [topN, setTopN] = useState(5);

  // OPTIMIZATION: Memoize timeline data selection
  const { timelineData, maxValue } = useMemo(() => {
    const data = mode === 'days'
      ? (stats.top5Timeline || []).slice(0, topN)
      : (stats.top5MonthlyTimeline || []).slice(0, topN);

    const max = data.length > 0
      ? (mode === 'days'
          ? (data[0] as any).daysAsTop || 1
          : (data[0] as any).monthsAsTop || 1)
      : 1;

    return { timelineData: data, maxValue: max };
  }, [mode, topN, stats.top5Timeline, stats.top5MonthlyTimeline]);

  const getLabel = () => {
    return mode === 'days' ? 'days as #1' : 'months as #1';
  };

  const getValue = (item: any) => {
    return item.daysAsTop || item.monthsAsTop || 0;
  };

  // OPTIMIZATION: Memoize summary stats
  const summaryStats = useMemo(() => ({
    champion: timelineData[0] || null,
    totalPlays: timelineData.reduce((sum, item) => sum + item.totalPlays, 0),
    dominancePercent: stats.total > 0
      ? ((timelineData.reduce((sum, item) => sum + item.totalPlays, 0) / stats.total) * 100).toFixed(1)
      : '0'
  }), [timelineData, stats.total]);

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Top Artists Timeline</h2>
        <p className="text-gray-600 mb-6">Track dominance over time</p>
        
        {/* Controls */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
          {/* Mode selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setMode('days')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                mode === 'days'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Clock className="w-4 h-4 inline mr-2" />
              By Days
            </button>
            <button
              onClick={() => setMode('months')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                mode === 'months'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              By Months
            </button>
          </div>

          {/* Top N selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Show top:</span>
            {[5, 10, 20, 50].map(n => (
              <button
                key={n}
                onClick={() => setTopN(n)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  topN === n
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline cards */}
      {timelineData.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No timeline data available for this period</p>
        </div>
      ) : (
        <div className="space-y-4">
          {timelineData.map((item, index) => (
            <TimelineCard
              key={item.artist}
              item={item}
              index={index}
              maxValue={maxValue}
              getValue={getValue}
              getLabel={getLabel}
            />
          ))}
        </div>
      )}
      
      {/* Summary stats */}
      {timelineData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <h3 className="font-semibold text-gray-900">Champion</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {summaryStats.champion?.artist || '-'}
            </p>
            <p className="text-sm text-gray-600">
              {getValue(summaryStats.champion || {})} {getLabel()}
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-6 h-6 text-blue-500" />
              <h3 className="font-semibold text-gray-900">Top {topN} Total</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {summaryStats.totalPlays.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Combined plays</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-6 h-6 text-emerald-500" />
              <h3 className="font-semibold text-gray-900">Dominance</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {summaryStats.dominancePercent}%
            </p>
            <p className="text-sm text-gray-600">of total scrobbles</p>
          </div>
        </div>
      )}
    </div>
  );
});

TimelineView.displayName = 'TimelineView';

export default TimelineView;