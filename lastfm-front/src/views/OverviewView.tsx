import { Music, Users, Disc, TrendingUp, Clock, Calendar } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { SimpleBarChart } from '../components/SimpleBarChart';
import { SimpleLineChart } from '../components/SimpleLineChart';
import type { Stats } from '../types';

interface OverviewViewProps {
  stats: Stats;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ stats }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard icon={Music} label="Total Scrobbles" value={stats.total.toLocaleString()} color="bg-blue-600" />
      <StatCard icon={Users} label="Unique Artists" value={stats.uniqueArtists.toLocaleString()} color="bg-emerald-600" />
      <StatCard icon={Disc} label="Unique Tracks" value={stats.uniqueSongs.toLocaleString()} color="bg-violet-600" />
      <StatCard icon={TrendingUp} label="Top Artist" value={stats.topArtists[0]?.artist.substring(0, 15) || '-'} change={`${stats.topArtists[0]?.count || 0} plays`} color="bg-amber-600" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          Activity by Hour
        </h3>
        <SimpleLineChart data={stats.hourlyData} dataKey="count" nameKey="hour" />
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-600" />
          Activity by Day
        </h3>
        <SimpleBarChart data={stats.dailyData} dataKey="count" nameKey="day" color="#10b981" />
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 10 Artists</h3>
        <SimpleBarChart data={stats.topArtists} dataKey="count" nameKey="artist" color="#8b5cf6" />
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 10 Tracks</h3>
        <div className="space-y-2">
          {stats.topSongs.map((song, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">{i + 1}</span>
              </div>
              <span className="text-sm font-medium text-gray-900 flex-1 truncate">{song.song}</span>
              <span className="text-sm font-semibold text-gray-600">{song.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default OverviewView;