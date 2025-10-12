// src/components/VinylRecord.tsx
import { memo } from 'react';
import { Music } from 'lucide-react';

interface VinylRecordProps {
  artistName?: string;
  isPlaying?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const VinylRecord = memo<VinylRecordProps>(({ 
  artistName = '',
  isPlaying = false,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-32 h-32',
    lg: 'w-48 h-48'
  };

  return (
    <div className="relative inline-block">
      {/* Vinyl Record */}
      <div 
        className={`${sizeClasses[size]} rounded-full relative ${isPlaying ? 'animate-spin-slow' : ''}`}
        style={{
          background: 'radial-gradient(circle, #1a1a1a 30%, #2d2d2d 31%, #1a1a1a 32%, #2d2d2d 33%, #1a1a1a 60%, transparent 61%)',
        }}
      >
        {/* Grooves effect */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute inset-0 rounded-full border border-gray-700 opacity-20"
            style={{
              width: `${100 - i * 8}%`,
              height: `${100 - i * 8}%`,
              top: `${i * 4}%`,
              left: `${i * 4}%`,
            }}
          />
        ))}
        
        {/* Center label */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/3 h-1/3 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
          <Music className="w-1/2 h-1/2 text-white" />
        </div>

        {/* Shine effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent opacity-30" />
      </div>

      {/* Artist name */}
      {artistName && (
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 text-center">
            {artistName}
          </p>
        </div>
      )}
    </div>
  );
});

VinylRecord.displayName = 'VinylRecord';