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

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

interface ChartsProps {
  stats: Stats;
}

export const Charts: React.FC<ChartsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-2xl rounded-2xl p-6 border border-white/10 hover:border-blue-500/30 transition-all duration-300">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-emerald-500 rounded-full"></span>
          Top 10 Artists
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats.topArtists}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="artist"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis tick={{ fill: '#94a3b8' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.8)',
                border: 'none',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="count" fill="url(#colorBlue)" radius={[8, 8, 0, 0]} />
            <defs>
              <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.6}/>
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-2xl rounded-2xl p-6 border border-white/10 hover:border-emerald-500/30 transition-all duration-300">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-blue-500 rounded-full"></span>
          Activity by Hour
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={stats.hourlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="hour" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis tick={{ fill: '#94a3b8' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.8)',
                border: 'none',
                borderRadius: '8px',
              }}
            />
            <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-2xl rounded-2xl p-6 border border-white/10 hover:border-amber-500/30 transition-all duration-300">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="w-1 h-6 bg-gradient-to-b from-amber-500 to-rose-500 rounded-full"></span>
          Activity by Day
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats.dailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="day" tick={{ fill: '#94a3b8' }} />
            <YAxis tick={{ fill: '#94a3b8' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.8)',
                border: 'none',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="count" fill="url(#colorAmber)" radius={[8, 8, 0, 0]} />
            <defs>
              <linearGradient id="colorAmber" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.8}/>
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0.6}/>
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-2xl rounded-2xl p-6 border border-white/10 hover:border-rose-500/30 transition-all duration-300">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="w-1 h-6 bg-gradient-to-b from-rose-500 to-violet-500 rounded-full"></span>
          Top 6 Albums
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={stats.topAlbums as any}
              cx="50%"
              cy="50%"
              labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
              label={(entry: any) => {
                const albumName = (entry.album || '').split(' - ')[1]?.substring(0, 15) || 'No album';
                const percentValue = ((entry.percent || 0) * 100).toFixed(0);
                return `${albumName}... (${percentValue}%)`;
              }}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {stats.topAlbums.map((_album, index) => (
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