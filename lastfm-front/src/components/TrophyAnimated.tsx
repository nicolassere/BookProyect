// src/components/TrophyAnimated.tsx
import { memo } from 'react';
import { Trophy } from 'lucide-react';

interface TrophyAnimatedProps {
  rank: number;
  size?: 'sm' | 'md' | 'lg';
}

export const TrophyAnimated = memo<TrophyAnimatedProps>(({ rank, size = 'md' }) => {
  const getColors = () => {
    switch (rank) {
      case 1:
        return {
          bg: 'from-yellow-400 to-yellow-600',
          glow: 'shadow-yellow-500/50',
          text: 'text-yellow-600'
        };
      case 2:
        return {
          bg: 'from-gray-300 to-gray-500',
          glow: 'shadow-gray-400/50',
          text: 'text-gray-500'
        };
      case 3:
        return {
          bg: 'from-orange-400 to-orange-600',
          glow: 'shadow-orange-500/50',
          text: 'text-orange-600'
        };
      default:
        return {
          bg: 'from-blue-400 to-blue-600',
          glow: 'shadow-blue-500/50',
          text: 'text-blue-600'
        };
    }
  };

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const colors = getColors();

  return (
    <div className="relative inline-block">
      {/* Glow effect */}
      <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${colors.bg} opacity-30 blur-xl ${colors.glow} animate-pulse-soft`} />
      
      {/* Trophy container */}
      <div className={`${sizeClasses[size]} relative rounded-full bg-gradient-to-br ${colors.bg} flex items-center justify-center shadow-lg ${colors.glow} animate-bounce-soft`}>
        <Trophy className={`${iconSizes[size]} text-white`} />
      </div>

      {/* Sparkles */}
      {rank <= 3 && (
        <>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full animate-ping" />
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-yellow-200 rounded-full animate-ping animation-delay-150" />
        </>
      )}
    </div>
  );
});

TrophyAnimated.displayName = 'TrophyAnimated';