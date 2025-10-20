// src/components/EvolutionCard.tsx
import { memo } from 'react';
import { TrendingUp, TrendingDown, Star, Award, Sparkles, Target, Zap } from 'lucide-react';

interface EvolutionCardProps {
  title: string;
  description: string;
  data: any[];
  type: 'newcomer' | 'climber' | 'growth' | 'drop' | 'comeback' | 'consistent' | 'wonder';
  emptyMessage?: string;
  showTop?: number;
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

const getTheme = (type: string) => {
  switch (type) {
    case 'newcomer': return {
      icon: 'bg-purple-500',
      badge: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
      accent: 'text-purple-600 dark:text-purple-400',
      border: 'border-l-purple-500'
    };
    case 'climber': return {
      icon: 'bg-green-500',
      badge: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      accent: 'text-green-600 dark:text-green-400',
      border: 'border-l-green-500'
    };
    case 'growth': return {
      icon: 'bg-blue-500',
      badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      accent: 'text-blue-600 dark:text-blue-400',
      border: 'border-l-blue-500'
    };
    case 'drop': return {
      icon: 'bg-red-500',
      badge: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
      accent: 'text-red-600 dark:text-red-400',
      border: 'border-l-red-500'
    };
    case 'comeback': return {
      icon: 'bg-amber-500',
      badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
      accent: 'text-amber-600 dark:text-amber-400',
      border: 'border-l-amber-500'
    };
    case 'consistent': return {
      icon: 'bg-indigo-500',
      badge: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
      accent: 'text-indigo-600 dark:text-indigo-400',
      border: 'border-l-indigo-500'
    };
    case 'wonder': return {
      icon: 'bg-pink-500',
      badge: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
      accent: 'text-pink-600 dark:text-pink-400',
      border: 'border-l-pink-500'
    };
    default: return {
      icon: 'bg-gray-500',
      badge: 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300',
      accent: 'text-gray-600 dark:text-gray-400',
      border: 'border-l-gray-500'
    };
  }
};

const renderItemDetails = (item: any, type: string, theme: ReturnType<typeof getTheme>) => {
  switch (type) {
    case 'newcomer':
      return (
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          <span className={theme.accent}>New in {item.year}</span> • Rank #{item.currentRank} • {item.plays.toLocaleString()} plays
        </p>
      );
    
    case 'climber':
      return (
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          <span className={theme.accent}>#{item.fromPosition} → #{item.toPosition}</span> (+{item.positionGain}) • {item.fromYear}-{item.toYear}
        </p>
      );
    
    case 'growth':
      return (
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          <span className={theme.accent}>+{item.growthAmount.toLocaleString()}</span> (+{item.growthPercent}%) • {item.fromPlays.toLocaleString()} → {item.toPlays.toLocaleString()}
        </p>
      );
    
    case 'drop':
      return (
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          <span className={theme.accent}>#{item.fromPosition} → {item.toPosition === 999 ? 'Out' : `#${item.toPosition}`}</span> (-{item.positionDrop}) • {item.fromYear}-{item.toYear}
        </p>
      );
    
    case 'comeback':
      return (
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          <span className={theme.accent}>{item.yearsAbsent} year{item.yearsAbsent > 1 ? 's' : ''} absent</span> • Last: {item.lastYear} • Return: {item.comebackYear}
        </p>
      );
    
    case 'consistent':
      return (
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          <span className={theme.accent}>{item.yearsInTop10}/{item.totalYears} years</span> in Top 10 • Avg: #{item.averagePosition}
        </p>
      );
    
    case 'wonder':
      return (
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          <span className={theme.accent}>Only {item.year}</span> • Rank #{item.rank} • {item.plays.toLocaleString()} plays
        </p>
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
  emptyMessage = 'No data available for this metric',
  showTop = 10
}) => {
  const Icon = getIcon(type);
  const theme = getTheme(type);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gray-900 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-lg ${theme.icon}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white">{title}</h3>
            <p className="text-sm text-gray-400 mt-0.5">{description}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-4">
        {data.length === 0 ? (
          <div className="text-center py-12">
            <Icon className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-500 dark:text-gray-400">{emptyMessage}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.slice(0, showTop).map((item, index) => (
              <div
                key={index}
                className={`flex items-center gap-4 p-4 rounded-lg border-l-4 ${theme.border} bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full ${theme.badge} flex items-center justify-center font-bold text-sm`}>
                  {index + 1}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {item.item}
                  </h4>
                  {renderItemDetails(item, type, theme)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {data.length > showTop && (
        <div className="px-6 py-4">
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 py-2">
            Showing {showTop} of {data.length} • {data.length - showTop} more
          </p>
        </div>
      )}
    </div>
  );
});

EvolutionCard.displayName = 'EvolutionCard';