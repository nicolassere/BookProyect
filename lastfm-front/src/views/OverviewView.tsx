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

// ---- Hook optimizado para calcular el gráfico radial ----
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

// ---- Gráfico radial (versión combinada: diseño del 2°, estilo del 1°) ----
const RadialHourChart = memo(({ data, hoveredHour, setHoveredHour }: {
  data: ReturnType<typeof useRadialChartData>;
  hoveredHour: number | null;
  setHoveredHour: (hour: number | null) => void;
}) => (
  <div className="relative" style={{ height: '380px' }}>
    <svg viewBox="0 0 400 400" className="w-full h-full">
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

          const path = `
            M ${x1} ${y1} 
            A ${innerRadius} ${innerRadius} 0 0 1 ${x2} ${y2}
            L ${x3} ${y3}
            A ${outerRadius} ${outerRadius} 0 0 0 ${x4} ${y4}
            Z
          `;

          const isHovered = hoveredHour === index;

          return (
            <path
              key={`hour-${index}`}
              d={path}
              fill={isHovered ? '#3b82f6' : '#d1d5db'}
              className={isHovered ? 'dark:fill-blue-500' : 'dark:fill-gray-600'}
              stroke="#fff"
              strokeWidth="2"
              style={{
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                filter: isHovered ? 'drop-shadow(0 0 6px rgba(59,130,246,0.6))' : 'none',
              }}
              onMouseEnter={() => setHoveredHour(index)}
              onMouseLeave={() => setHoveredHour(null)}
            />
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

// ---- Vista principal combinada ----
export const OverviewView = memo<OverviewViewProps>(({ stats }) => {
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);
  const hourlyRadialData = useRadialChartData(stats.hourlyData);

  return (
    <div className="space-y-6">
      {/* ---- Estadísticas principales ---- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Music} label="Total Scrobbles" value={<CountUp end={stats.total} />} color="bg-blue-600" />
        <StatCard icon={Users} label="Unique Artists" value={<CountUp end={stats.uniqueArtists} />} color="bg-emerald-600" />
        <StatCard icon={Disc} label="Unique Tracks" value={<CountUp end={stats.uniqueSongs} />} color="bg-pink-600" />
        <StatCard icon={Users} label="Top Artist" value={stats.topArtists[0]?.artist || '-'} color="bg-blue-600" />
      </div>

      {/* ---- Gráficos ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass dark:glass-dark rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-90 dark:text-gray-1000 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Activity by Hour
          </h3>
          <RadialHourChart data={hourlyRadialData} hoveredHour={hoveredHour} setHoveredHour={setHoveredHour} />
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3 font-medium">
            Hover over segments to see details - longer = more plays
          </p>
        </div>

        <div className="glass dark:glass-dark rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-90 dark:text-gray-1000 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Activity by Day
          </h3>
          <SimpleBarChart data={stats.dailyData} dataKey="count" nameKey="day" color="#10b981" />
        </div>
      </div>

      {/* ---- Top Artists & Tracks ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Artists */}
        <div className="glass dark:glass-dark rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-90 dark:text-gray-1000 mb-5">Top 10 Artists</h3>
          <SimpleBarChart data={stats.topArtists} dataKey="count" nameKey="artist" color="#0ea5e9" />
        </div>

        {/* Top Tracks c */}
         <div className="glass dark:glass-dark rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-90 dark:text-gray-1000 mb-5">Top 10 Tracks</h3>
          <SimpleBarChart data={stats.topSongs} dataKey="count" nameKey="song" color="#0ea5e9" />
        </div>

      </div>
    </div>
  );
});

OverviewView.displayName = 'OverviewView';
export default OverviewView;
