import { Music, Users, Disc, TrendingUp, Clock, Calendar } from 'lucide-react';
import { useState, memo, useMemo } from 'react';
import { StatCard } from '../components/StatCard';
import { SimpleBarChart } from '../components/SimpleBarChart';
import type { Stats } from '../types';

interface OverviewViewProps {
  stats: Stats;
}

// OPTIMIZATION: Memoize the radial chart data calculation
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

// OPTIMIZATION: Memoize the radial chart component
const RadialHourChart = memo(({ data, hoveredHour, setHoveredHour }: {
  data: ReturnType<typeof useRadialChartData>;
  hoveredHour: number | null;
  setHoveredHour: (hour: number | null) => void;
}) => (
  <div className="relative" style={{ height: '380px' }}>
    <svg viewBox="0 0 400 400" className="w-full h-full">
      <g transform="translate(200, 200)">
        {data.map((item, index) => {
          const startAngle = (index * 15 - 90 ) * (Math.PI / 180);
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
                stroke="#fff" 
                strokeWidth="2"
              />
              <path 
                d={path} 
                fill={isHovered ? "#3b82f6" : "#111827"}
                stroke="#fff" 
                strokeWidth="2"
                style={{ 
                  cursor: 'pointer',
                  transition: 'fill 0.2s ease',
                }}
                onMouseEnter={() => setHoveredHour(index)}
                onMouseLeave={() => setHoveredHour(null)}
              />
            </g>
          );
        })}

        <circle cx="0" cy="0" r="25" fill="#f9fafb" stroke="#e5e7eb" strokeWidth="2" />
        <text 
          x="0" 
          y="0" 
          textAnchor="middle" 
          dominantBaseline="middle" 
          className="text-xl font-bold"
          fill="#111827"
        >
          🕐
        </text>
      </g>
    </svg>

    {hoveredHour !== null && (
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-3 rounded-lg shadow-lg border-2 border-blue-500 z-10">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {data[hoveredHour].hour}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {data[hoveredHour].count.toLocaleString()} plays
          </div>
          <div className="text-xs text-blue-600 font-semibold mt-1">
            {data[hoveredHour].fill.toFixed(1)}% of peak
          </div>
        </div>
      </div>
    )}
  </div>
));

RadialHourChart.displayName = 'RadialHourChart';

// OPTIMIZATION: Memoize the entire view
export const OverviewView = memo<OverviewViewProps>(({ stats }) => {
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);
  const hourlyRadialData = useRadialChartData(stats.hourlyData);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Music} label="Total Scrobbles" value={stats.total.toLocaleString()} color="bg-blue-600" />
        <StatCard icon={Users} label="Unique Artists" value={stats.uniqueArtists.toLocaleString()} color="bg-emerald-600" />
        <StatCard icon={Disc} label="Unique Tracks" value={stats.uniqueSongs.toLocaleString()} color="bg-pink-600" />
        <StatCard icon={TrendingUp} label="Top Artist" value={stats.topArtists[0]?.artist.substring(0, 15) || '-'} change={`${stats.topArtists[0]?.count || 0} plays`} color="bg-amber-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 animate-slide-up">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary-600" />
            Activity by Hour
          </h3>
          <RadialHourChart
            data={hourlyRadialData}
            hoveredHour={hoveredHour}
            setHoveredHour={setHoveredHour}
          />
          <p className="text-xs text-gray-500 text-center mt-3 font-medium">
            Hover over segments to see details - longer = more plays
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 animate-slide-up">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            Activity by Day
          </h3>
          <SimpleBarChart data={stats.dailyData} dataKey="count" nameKey="day" color="#10b981" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 animate-slide-up">
          <h3 className="text-lg font-bold text-gray-900 mb-5">Top 10 Artists</h3>
          <SimpleBarChart data={stats.topArtists} dataKey="count" nameKey="artist" color="#0ea5e9" />
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 animate-slide-up">
          <h3 className="text-lg font-bold text-gray-900 mb-5">Top 10 Tracks</h3>
          <div className="space-y-2">
            {stats.topSongs.map((song, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-primary-50 hover:to-transparent transition-all duration-300 group cursor-pointer border border-transparent hover:border-primary-100">
                <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                  <span className="text-white font-bold text-sm">{i + 1}</span>
                </div>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 flex-1 truncate transition-colors">{song.song}</span>
                <span className="text-sm font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-full group-hover:bg-primary-100 group-hover:text-primary-700 transition-colors">{song.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

OverviewView.displayName = 'OverviewView';

export default OverviewView;