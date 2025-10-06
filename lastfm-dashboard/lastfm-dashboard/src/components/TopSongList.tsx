import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { Stats } from '../types';

const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

interface ChartsProps {
  stats: Stats;
}

export const Charts: React.FC<ChartsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Artists Chart */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Top 10 Artistas</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats.topArtists}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="artist"
              tick={{ fill: 'white', fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis tick={{ fill: 'white' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.8)',
                border: 'none',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="count" fill="#8b5cf6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Hourly Activity Chart */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Actividad por Hora</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={stats.hourlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="hour" tick={{ fill: 'white', fontSize: 12 }} />
            <YAxis tick={{ fill: 'white' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.8)',
                border: 'none',
                borderRadius: '8px',
              }}
            />
            <Line type="monotone" dataKey="count" stroke="#ec4899" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Daily Activity Chart */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Actividad por Día</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats.dailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="day" tick={{ fill: 'white' }} />
            <YAxis tick={{ fill: 'white' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.8)',
                border: 'none',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="count" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Albums Chart */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Top 6 Álbumes</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={stats.topAlbums}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ album, percent }) => {
                const albumName = album.split(' - ')[1]?.substring(0, 15) || 'Sin álbum';
                return `${albumName}... (${(percent * 100).toFixed(0)}%)`;
              }}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {stats.topAlbums.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.8)',
                border: 'none',
                borderRadius: '8px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};