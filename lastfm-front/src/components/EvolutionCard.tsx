// src/components/EvolutionCard.tsx
import { memo } from 'react';
import { TrendingUp, TrendingDown, Star, Award, Sparkles, Target, Zap } from 'lucide-react';

interface EvolutionCardProps {
  title: string;
  description: string;
  data: any[];
  type: 'newcomer' | 'climber' | 'growth' | 'drop' | 'comeback' | 'consistent' | 'wonder';
  empty Message?: string;
}

const getIcon = (type: string) => {
  switch (type) {
    case 'newcomer': return Sparkles;
    case 'climber': return TrendingUp;
    case 'growth': return Zap;
    case 'drop': return TrendingDown;
    case 'comeback': return Award;
    case 'consistent': return Target;
    case 'wonder': return Star;
    default: return Star;
  }
};

const getColorClasses = (type: string) => {
  switch (type) {
    case 'newcomer': return 'from-purple-500 to-pink-500';
    case 'climber': return 'from-green-500 to-emerald-500';
    case 'growth': return 'from-blue-500 to-cyan-500';
    case 'drop': return 'from-red-500 to-orange-500';
    case 'comeback': return 'from-yellow-500 to-amber-500';
    case 'consistent': return 'from-indigo-500 to-purple-500';
    case 'wonder': return 'from-pink-500 to-rose-500';
    default: return 'from-gray-500 to-gray-600';
  }
};

const renderItemDetails = (item: any, type: string) => {
  switch (type) {
    case 'newcomer':
      return (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-semibold text-purple-600 dark:text-purple-400">New in {item.year}</span>
          {' '} • Rank #{item.currentRank} • {item.plays.toLocaleString()} plays
        </div>
      );
    
    case 'climber':
      return (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-semibold text-green-600 dark:text-green-400">
            #{item.fromPosition} → #{item.toPosition}
          </span>
          {' '}(+{item.positionGain} positions) • {item.fromYear} → {item.toYear}
        </div>
      );
    
    case 'growth':
      return (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-semibold text-blue-600 dark:text-blue-400">
            +{item.growthAmount.toLocaleString()} plays
          </span>
          {' '}(+{item.growthPercent}%) • {item.fromPlays.toLocaleString()} → {item.toPlays.toLocaleString()}
        </div>
      );
    
    case 'drop':
      return (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-semibold text-red-600 dark:text-red-400">
            #{item.fromPosition} → #{item.toPosition === 999 ? 'Out' : item.toPosition}
          </span>
          {' '}(-{item.positionDrop} positions) • {item.fromYear} → {item.toYear}
        </div>
      );
    
    case 'comeback':
      return (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-semibold text-yellow-600 dark:text-yellow-400">
            {item.yearsAbsent} year{item.yearsAbsent > 1 ? 's' : ''} absent
          </span>
          {' '} • Last seen: {item.lastYear} • Back in: {item.comebackYear}
        </div>
      );
    
    case 'consistent':
      return (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
            {item.yearsInTop10} of {item.totalYears} years in Top 10
          </span>
          {' '} • Avg position: #{item.averagePosition}
        </div>
      );
    
    case 'wonder':
      return (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-semibold text-pink-600 dark:text-pink-400">
            Only in {item.year}
          </span>
          {' '} • Rank #{item.rank} • {item.plays.toLocaleString()} plays
        </div>
      );
    
    default:
      return null;
  }
};

export const EvolutionCard = memo<EvolutionCardProps>(({ 
  title, 
  description, 
  data, 
  type,
  emptyMessage = 'No data available for this metric'
}) => {
  const Icon = getIcon(type);
  const colorClasses = getColorClasses(type);

  return (
    <div className="glass dark:glass-dark rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses} shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Icon className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p className="text-sm">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.slice(0, 5).map((item, index) => (
            <div
              key={index}
              className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-300 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br ${colorClasses} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate mb-1">
                    {item.item}
                  </h4>
                  {renderItemDetails(item, type)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {data.length > 5 && (
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Showing top 5 of {data.length} results
          </p>
        </div>
      )}
    </div>
  );
});

EvolutionCard.displayName = 'EvolutionCard';