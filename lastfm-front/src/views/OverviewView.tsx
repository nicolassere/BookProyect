import { Music, Users, Disc, TrendingUp, Clock, Calendar } from 'lucide-react';
import { useState, memo, useMemo } from 'react';
import { StatCard } from '../components/StatCard';
import { SimpleBarChart } from '../components/SimpleBarChart';
import { VinylRecord } from '../components/VinylRecord';
import { CountUp } from '../components/CountUp';
import type { Stats } from '../types';
import { getArtistColor } from '../utils/theme';

interface OverviewViewProps {
  stats: Stats;
}

const useRadialChartData = (hourlyData: Stats['hourlyData']) => {
  return useMemo(() => {
    const maxHourCount = Math.max(...hourlyData.map(h => h.count));
    
    return hourlyData.map((item, index) => {
      const fillPercentage = (item.count / maxHourCount) * 100;
      
      return {
        hour: item.hour,
        count: item.count,
        fill: fillPercentage,
        angle: index * 15,
        name: item.hour.substring(0, 2) + 'h'
      };
    });
  }, [hourlyData]);
};

const RadialHourChart = memo(({ data, hoveredHour, setHoveredHour }: {
  data: ReturnType<typeof useRadialChartData>;
  hoveredHour: number | null;
  setHoveredHour: (hour: number | null) => void;
}) => (
  <div className="relative" style={{ height: '380px' }}>
    <svg viewBox="0 0 400 400" className="w-full h-full">
      <defs>
        <linearGradient id="hourGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <g transform="translate(200, 200)">
        {data.map((item, index) => {
          const startAngle = (index * 15 - 90) * (Math.PI / 180);
          const endAngle = ((index + 1) * 15 - 90) * (Math.PI / 180);
          const innerRadius = 30;
          const outerRadius = 30 + (item.fill / 100) * 150;
          
          const x1 = Math.cos(startAngle) * innerRadius;
          const y1 = Math.sin(startAngle) * innerRadius;
          const x2 = Math.cos(endAngle) * innerRadius;
          const y2 = Math.sin(endAngle) * innerRadius;
          const x3 = Math.cos(endAngle) * outerRadius;
          const y3 = Math.sin(endAngle) * outerRadius;
          const x4 = Math.cos(startAngle) * outerRadius;
          const y4 = Math.sin(startAngle) * outerRadius;
          
          const largeArcFlag = 0;
          const path = `
            M ${x1} ${y1} 
            A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}
            L ${x3} ${y3}
            A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}
            Z
          `;
          
          const isHovered = hoveredHour === index;
          
          return (
            <g key={`hour-${index}`}>
              <path 
                d={`
                  M ${x1} ${y1} 
                  A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}
                  L ${Math.cos(endAngle) * 180} ${Math.sin(endAngle) * 180}
                  A 180 180 0 ${largeArcFlag} 0 ${Math.cos(startAngle) * 180} ${Math.sin(startAngle) * 180}
                  Z
                `}
                fill="#f3f4f6" 
                className="dark:fill-gray-700"
                stroke="#fff" 
                strokeWidth="2"
              />
              <path 
                d={path} 
                fill={isHovered ? "url(#hourGradient)" : "#111827"}
                className={isHovered ? "" : "dark:fill-gray-300"}
                stroke="#fff" 
                strokeWidth="2"
                style={{ 
                  cursor: 'pointer',
                  transition: 'fill 0.2s ease',
                  filter: isHovered ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))' : 'none'
                }}
                onMouseEnter={() => setHoveredHour(index)}
                onMouseLeave={() => setHoveredHour(null)}
              />
            </g>
          );
        })}

        <circle cx="0" cy="0" r="25" fill="#f9fafb" className="dark:fill-gray-800" stroke="#e5e7eb" className="dark:stroke-gray-600" strokeWidth="2" />
        <text 
          x="0" 
          y="0" 
          textAnchor="middle" 
          dominantBaseline="middle" 
          className="text-xl"
        >
          🕐
        </text>
      </g>
    </svg>

    {hoveredHour !== null && (
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 glass dark:glass-dark px-4 py-3 rounded-lg shadow-lg border-2 border-blue-500 z-10 animate-scale-in">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {data[hoveredHour].hour}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            <CountUp end={data[hoveredHour].count} suffix=" plays" duration={500} />
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-1">
            {data[hoveredHour].fill.toFixed(1)}% of peak
          </div>
        </div>
      </div>
    )}
  </div>
));

RadialHourChart.displayName = 'RadialHourChart';

export const OverviewView = memo<OverviewViewProps>(({ stats }) => {
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);
  const hourlyRadialData = useRadialChartData(stats.hourlyData);

  return (
    <div className="space-y-6">
      {/* Stats Cards con vinyl record para top artist */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass dark:glass-dark rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 card-3d animate-fade-in-up">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Total Scrobbles</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                <CountUp end={stats.total} />
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg hover:scale-110 transition-transform duration-300">
              <Music className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="glass dark:glass-dark rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 card-3d animate-fade-in-up" style={{animationDelay: '0.1s'}}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Unique Artists</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                <CountUp end={stats.uniqueArtists} />
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg hover:scale-110 transition-transform duration-300">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="glass dark:glass-dark rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 card-3d animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Unique Tracks</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                <CountUp end={stats.uniqueSongs} />
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-pink-500 to-pink-700 shadow-lg hover:scale-110 transition-transform duration-300">
              <Disc className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="glass dark:glass-dark rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 card-3d animate-fade-in-up" style={{animationDelay: '0.3s'}}>
          <div className="flex items-center justify-between">
            <div className="flex-1 mr-2">
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Top Artist</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100 truncate">
                {stats.topArtists[0]?.artist || '-'}
              </p>
              <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                <TrendingUp className="w-4 h-4" />
                <CountUp end={stats.topArtists[0]?.count || 0} suffix=" plays" />
              </p>
            </div>
            <VinylRecord size="sm" isPlaying />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass dark:glass-dark rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300 animate-slide-in-right">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            Activity by Hour
          </h3>
          <RadialHourChart
            data={hourlyRadialData}
            hoveredHour={hoveredHour}
            setHoveredHour={setHoveredHour}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3 font-medium">
            Hover over segments to see details - longer = more plays
          </p>
        </div>

        <div className="glass dark:glass-dark rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300 animate-slide-in-right" style={{animationDelay: '0.1s'}}>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Activity by Day
          </h3>
          <SimpleBarChart data={stats.dailyData} dataKey="count" nameKey="day" color="#10b981" />
        </div>
      </div>

      {/* Top Artists and Songs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass dark:glass-dark rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300 animate-fade-in-up">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-5">Top 10 Artists</h3>
          <SimpleBarChart data={stats.topArtists} dataKey="count" nameKey="artist" color="#0ea5e9" />
        </div>

        <div className="glass dark:glass-dark rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-5">Top 10 Tracks</h3>
          <div className="space-y-2">
            {stats.topSongs.map((song, i) => {
              const color = getArtistColor(song.song);
              return (
                <div 
                  key={i} 
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-primary-50 dark:hover:from-primary-900/20 hover:to-transparent transition-all duration-300 group cursor-pointer border border-transparent hover:border-primary-100 dark:hover:border-primary-800"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div 
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300"
                    style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)` }}
                  >
                    <span className="text-white font-bold text-sm">{i + 1}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 flex-1 truncate transition-colors">
                    {song.song}
                  </span>
                  <span className="text-sm font-bold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
                    <CountUp end={song.count} duration={500} />
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
});

OverviewView.displayName = 'OverviewView';

export default OverviewView;