// src/views/EvolutionView.tsx
import { memo, useState, useMemo, useEffect } from 'react';
import { TrendingUp, Crown, Music, Disc, Loader2, Calendar } from 'lucide-react';
import type { Scrobble, EvolutionStats } from '../types';
import { calculateEvolutionStats } from '../utils/evolution';
import { EvolutionCard } from '../components/EvolutionCard';

interface EvolutionViewProps {
  scrobbles: Scrobble[];
}

type CategoryType = 'artists' | 'songs' | 'albums';

export const EvolutionView = memo<EvolutionViewProps>(({ scrobbles }) => {
  const [category, setCategory] = useState<CategoryType>('artists');
  const [evolutionStats, setEvolutionStats] = useState<EvolutionStats | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);

  // Get available years
  const availableYears = useMemo(() => {
    const years = Array.from(
      new Set(
        scrobbles
          .filter(s => s.parsedDate)
          .map(s => s.parsedDate!.getFullYear())
      )
    ).sort((a, b) => b - a);
    return years;
  }, [scrobbles]);

  // Calculate evolution stats
  useEffect(() => {
    if (scrobbles.length === 0) return;

    setIsCalculating(true);
    const timer = setTimeout(() => {
      try {
        const stats = calculateEvolutionStats(scrobbles, selectedYear);
        setEvolutionStats(stats);
        setIsCalculating(false);
      } catch (error) {
        console.error('Error calculating evolution stats:', error);
        setIsCalculating(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [scrobbles, selectedYear]);

  const currentData = evolutionStats?.[category];
  const currentYear = selectedYear || availableYears[0];
  const previousYear = availableYears[availableYears.indexOf(currentYear) + 1];

  if (isCalculating) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Analyzing Evolution...
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Calculating year-over-year changes
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!evolutionStats || availableYears.length < 2) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <TrendingUp className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Not Enough Data
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            You need at least 2 years of scrobble data to see evolution analysis.
            <br />
            Currently you have {availableYears.length} year{availableYears.length !== 1 ? 's' : ''} of data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-500">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Evolution Analysis
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                Year-over-year changes, breakthroughs, and consistency
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="px-6 py-4">
          <div className="flex flex-wrap gap-3">
            {/* Year selector */}
            <div className="flex gap-2 items-center flex-wrap">
              <span className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 px-2">
                <Calendar className="w-4 h-4 mr-1" />
                Compare:
              </span>
              {availableYears.slice(0, 5).map(year => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    (selectedYear || availableYears[0]) === year
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>

            <div className="w-px bg-gray-300 dark:bg-gray-600"></div>

            {/* Category selector */}
            <div className="flex gap-2">
              <button
                onClick={() => setCategory('artists')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  category === 'artists'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Crown className="w-4 h-4" />
                Artists
              </button>
              <button
                onClick={() => setCategory('songs')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  category === 'songs'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Music className="w-4 h-4" />
                Songs
              </button>
              <button
                onClick={() => setCategory('albums')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  category === 'albums'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Disc className="w-4 h-4" />
                Albums
              </button>
            </div>
          </div>
        </div>

        {/* Year comparison info */}
        <div className="px-6 py-4 bg-blue-50 dark:bg-blue-900/20 border-t-2 border-blue-200 dark:border-blue-800">
          <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
            Comparing {previousYear} → {currentYear}
          </p>
        </div>
      </div>

      {/* Evolution Cards Grid */}
      {currentData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Newcomers */}
          <EvolutionCard
            title="✨ New Discoveries"
            description={`${category === 'artists' ? 'Artists' : category === 'songs' ? 'Songs' : 'Albums'} that appeared for the first time in ${currentYear}`}
            data={currentData.newcomers}
            type="newcomer"
            emptyMessage="No new entries this year"
          />

          {/* Biggest Climbers */}
          <EvolutionCard
            title="📈 Biggest Climbers"
            description={`${category === 'artists' ? 'Artists' : category === 'songs' ? 'Songs' : 'Albums'} that improved their ranking the most`}
            data={currentData.climbers}
            type="climber"
            emptyMessage="No significant ranking improvements"
          />

          {/* Growth in Plays */}
          <EvolutionCard
            title="⚡ Explosive Growth"
            description={`${category === 'artists' ? 'Artists' : category === 'songs' ? 'Songs' : 'Albums'} with the biggest increase in absolute plays`}
            data={currentData.growth}
            type="growth"
            emptyMessage="No significant growth in plays"
          />

          {/* Biggest Drops */}
          <EvolutionCard
            title="📉 Biggest Falls"
            description={`${category === 'artists' ? 'Artists' : category === 'songs' ? 'Songs' : 'Albums'} that dropped the most in ranking`}
            data={currentData.drops}
            type="drop"
            emptyMessage="No significant ranking drops"
          />

          {/* Comebacks */}
          <EvolutionCard
            title="🎖️ Comeback Story"
            description={`${category === 'artists' ? 'Artists' : category === 'songs' ? 'Songs' : 'Albums'} that returned after absence`}
            data={currentData.comebacks}
            type="comeback"
            emptyMessage="No comebacks this year"
          />

          {/* Most Consistent */}
          <EvolutionCard
            title="🎯 Most Consistent"
            description={`${category === 'artists' ? 'Artists' : category === 'songs' ? 'Songs' : 'Albums'} that stayed in Top 10 the longest`}
            data={currentData.consistent}
            type="consistent"
            emptyMessage="Not enough data for consistency analysis"
          />

          {/* One-Year Wonders */}
          <EvolutionCard
            title="⭐ One-Year Wonders"
            description={`${category === 'artists' ? 'Artists' : category === 'songs' ? 'Songs' : 'Albums'} that only appeared in a single year`}
            data={currentData.oneYearWonders}
            type="wonder"
            emptyMessage="No one-year wonders found"
          />
        </div>
      )}
    </div>
  );
});

EvolutionView.displayName = 'EvolutionView';

export default EvolutionView;