import { useState, useMemo } from 'react';
import { Upload, Music, TrendingUp, Users, Disc, Clock, Calendar, BarChart3, Activity, X, Trophy, CalendarDays } from 'lucide-react';
import type { Scrobble } from './types';
import { calculateStats, getDateRange } from './utils/stats';
import { StatCard } from './components/StatCard';
import { SimpleBarChart } from './components/SimpleBarChart';
import { SimpleLineChart } from './components/SimpleLineChart';

type DatePreset = 'all' | 'last7' | 'last30' | 'last90' | 'last6months' | 'lastyear' | 'custom';

function App() {
  const [scrobbles, setScrobbles] = useState<Scrobble[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState('overview');
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // NEW: Date filters mejorados
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  const dateRange = useMemo(() => getDateRange(scrobbles), [scrobbles]);
  
  // Calcular fechas basado en preset
  const { startDate, endDate } = useMemo(() => {
    if (datePreset === 'custom') {
      return {
        startDate: customStartDate ? new Date(customStartDate) : undefined,
        endDate: customEndDate ? new Date(customEndDate) : undefined
      };
    }
    
    if (datePreset === 'all') {
      return { startDate: undefined, endDate: undefined };
    }
    
    const now = new Date();
    const end = new Date(now);
    let start = new Date(now);
    
    switch (datePreset) {
      case 'last7':
        start.setDate(now.getDate() - 7);
        break;
      case 'last30':
        start.setDate(now.getDate() - 30);
        break;
      case 'last90':
        start.setDate(now.getDate() - 90);
        break;
      case 'last6months':
        start.setMonth(now.getMonth() - 6);
        break;
      case 'lastyear':
        start.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    return { startDate: start, endDate: end };
  }, [datePreset, customStartDate, customEndDate]);
  
  const stats = useMemo(() => {
    return calculateStats(scrobbles, startDate, endDate);
  }, [scrobbles, startDate, endDate]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const data = lines.slice(1).filter(line => line.trim()).map(line => {
        const values = line.split(',');
        const obj: any = {};
        headers.forEach((header, i) => {
          obj[header] = values[i]?.trim() || '';
        });
        return obj as Scrobble;
      });
      
      setScrobbles(data);
      setLoading(false);
      setShowUploadModal(false);
    };
    
    reader.readAsText(file);
  };

  const demoData = () => {
    const demo: Scrobble[] = [];
    const artists = ['Radiohead', 'The Beatles', 'Pink Floyd', 'Led Zeppelin', 'Nirvana', 'The Strokes', 'Arctic Monkeys', 'Tame Impala'];
    const songs = ['Creep', 'Hey Jude', 'Wish You Were Here', 'Stairway to Heaven', 'Smells Like Teen Spirit', 'Last Nite', 'Do I Wanna Know?', 'The Less I Know'];
    
    const now = Date.now();
    for (let i = 0; i < 1000; i++) {
      const artistIndex = Math.floor(Math.random() * artists.length);
      const daysAgo = Math.floor(Math.random() * 180);
      demo.push({
        artist: artists[artistIndex],
        song: songs[artistIndex],
        album: `Album ${artistIndex + 1}`,
        date: new Date(now - daysAgo * 24 * 60 * 60 * 1000).toISOString()
      });
    }
    
    setScrobbles(demo);
  };

  const resetFilters = () => {
    setDatePreset('all');
    setCustomStartDate('');
    setCustomEndDate('');
  };

  const presets = [
    { id: 'all', label: 'All Time', icon: CalendarDays },
    { id: 'last7', label: 'Last 7 Days', icon: Calendar },
    { id: 'last30', label: 'Last 30 Days', icon: Calendar },
    { id: 'last90', label: 'Last 3 Months', icon: Calendar },
    { id: 'last6months', label: 'Last 6 Months', icon: Calendar },
    { id: 'lastyear', label: 'Last Year', icon: Calendar },
    { id: 'custom', label: 'Custom Range', icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <Music className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Last.fm Analytics</h1>
                <p className="text-xs text-gray-500">Professional Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Upload className="w-4 h-4" />
                Import Data
              </button>
              <button
                onClick={demoData}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Load Demo
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      {stats && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex gap-8">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'evolution', label: 'Evolution', icon: TrendingUp },
                { id: 'timeline', label: 'Timeline', icon: Trophy },
                { id: 'ranking', label: 'All-Time Ranking', icon: Trophy },
                { id: 'years', label: 'By Year', icon: Calendar },
                { id: 'activity', label: 'Activity', icon: Activity }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-colors ${
                    activeView === item.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Date Filters - NUEVO DISEÑO AMIGABLE */}
      {stats && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Time Period</h3>
              <span className="text-xs text-gray-500">
                Data range: {dateRange.min} to {dateRange.max}
              </span>
            </div>
            
            {/* Presets */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 mb-4">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setDatePreset(preset.id as DatePreset)}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all font-medium text-sm ${
                    datePreset === preset.id
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <preset.icon className="w-4 h-4" />
                  {preset.label}
                </button>
              ))}
            </div>
            
            {/* Custom Date Inputs - Solo visible cuando custom está activo */}
            {datePreset === 'custom' && (
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    min={dateRange.min}
                    max={dateRange.max}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    min={dateRange.min}
                    max={dateRange.max}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => {
                    setCustomStartDate('');
                    setCustomEndDate('');
                  }}
                  className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm border border-gray-300 mt-5"
                >
                  Clear
                </button>
              </div>
            )}
            
            {/* Active Filter Display */}
            {datePreset !== 'all' && (
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <span className="text-sm font-medium text-gray-700">
                  📊 Showing: <span className="text-blue-700 font-semibold">
                    {datePreset === 'custom' 
                      ? `${customStartDate || 'start'} to ${customEndDate || 'end'}`
                      : presets.find(p => p.id === datePreset)?.label
                    }
                  </span>
                </span>
                <button
                  onClick={resetFilters}
                  className="px-3 py-1 bg-white text-gray-700 rounded-md hover:bg-gray-100 transition-colors font-medium text-xs border border-gray-300"
                >
                  Reset to All Time
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your music data...</p>
            </div>
          </div>
        )}

        {!stats && !loading && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Music className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Welcome to Last.fm Analytics
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Import your Last.fm scrobble data to visualize your listening habits with professional analytics and insights.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Import CSV File
                </button>
                <button
                  onClick={demoData}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Try Demo Data
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Overview View */}
        {stats && !loading && activeView === 'overview' && (
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
                  Activity by Hour (FIXED)
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
        )}

        {/* Evolution View - NEW */}
        {stats && !loading && activeView === 'evolution' && stats.artistEvolution.length > 0 && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Top 5 Artists Evolution Over Time</h2>
              <div className="h-96">
                <div className="relative h-full">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {/* Grid */}
                    {[0, 25, 50, 75, 100].map(y => (
                      <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#e5e7eb" strokeWidth="0.2" />
                    ))}
                    
                    {/* Areas for each artist */}
                    {Object.keys(stats.artistEvolution[0] || {})
                      .filter(key => key !== 'month')
                      .map((artist, artistIndex) => {
                        const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];
                        const maxValue = Math.max(...stats.artistEvolution.map(d => d[artist] as number));
                        
                        const points = stats.artistEvolution.map((d, i) => {
                          const x = (i / (stats.artistEvolution.length - 1)) * 100;
                          const y = 100 - ((d[artist] as number / maxValue) * 80);
                          return { x, y };
                        });
                        
                        const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                        
                        return (
                          <g key={artist}>
                            <path d={`${pathD} L 100 100 L 0 100 Z`} fill={colors[artistIndex]} opacity="0.2" />
                            <path d={pathD} fill="none" stroke={colors[artistIndex]} strokeWidth="0.5" />
                          </g>
                        );
                      })}
                  </svg>
                </div>
              </div>
              
              {/* Legend */}
              <div className="flex flex-wrap gap-4 mt-6 justify-center">
                {Object.keys(stats.artistEvolution[0] || {})
                  .filter(key => key !== 'month')
                  .map((artist, i) => {
                    const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];
                    return (
                      <div key={artist} className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: colors[i] }}></div>
                        <span className="text-sm font-medium text-gray-700">{artist}</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* Timeline View - NEW */}
        {stats && !loading && activeView === 'timeline' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Top 5 Artists Timeline</h2>
              <p className="text-gray-600 mb-6">Days each artist was #1 most played</p>
              
              <div className="space-y-4">
                {stats.top5Timeline.map((item, index) => (
                  <div key={index} className="bg-gradient-to-r from-gray-50 to-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                      {/* Medal */}
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 ${
                        index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                        index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                        index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                        'bg-gradient-to-br from-blue-400 to-blue-600'
                      }`}>
                        <span className="text-white font-bold text-2xl">{index + 1}</span>
                      </div>
                      
                      {/* Artist Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-gray-900 truncate mb-1">
                          {item.artist}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {item.totalPlays.toLocaleString()} total plays
                        </p>
                      </div>
                      
                      {/* Stats */}
                      <div className="text-right">
                        <div className="text-4xl font-bold text-gray-900">
                          {item.daysAsTop}
                        </div>
                        <div className="text-sm text-gray-600 font-medium">
                          days as #1
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                            index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                            index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                            'bg-gradient-to-r from-blue-400 to-blue-600'
                          }`}
                          style={{ 
                            width: `${(item.daysAsTop / stats.top5Timeline[0].daysAsTop) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  <h3 className="font-semibold text-gray-900">Champion</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {stats.top5Timeline[0]?.artist || '-'}
                </p>
                <p className="text-sm text-gray-600">
                  Dominated {stats.top5Timeline[0]?.daysAsTop || 0} days
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="w-6 h-6 text-blue-500" />
                  <h3 className="font-semibold text-gray-900">Top 5 Total</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {stats.top5Timeline.reduce((sum, item) => sum + item.totalPlays, 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Combined plays</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="w-6 h-6 text-emerald-500" />
                  <h3 className="font-semibold text-gray-900">Dominance</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {((stats.top5Timeline.reduce((sum, item) => sum + item.totalPlays, 0) / stats.total) * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600">of total scrobbles</p>
              </div>
            </div>
          </div>
        )}

        {/* Activity View */}
        {stats && !loading && activeView === 'activity' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Hourly Distribution
                </h3>
                <SimpleLineChart data={stats.hourlyData} dataKey="count" nameKey="hour" />
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  Weekly Pattern
                </h3>
                <SimpleBarChart data={stats.dailyData} dataKey="count" nameKey="day" color="#10b981" />
              </div>
            </div>

            {/* Peak Times */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Peak Listening Times</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(() => {
                  const sortedHours = [...stats.hourlyData].sort((a, b) => b.count - a.count);
                  return sortedHours.slice(0, 4).map((hour, i) => (
                    <div key={i} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                      <div className="text-3xl font-bold text-blue-600 mb-1">
                        {hour.hour}
                      </div>
                      <div className="text-sm text-gray-600">
                        {hour.count} plays
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Import Data</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-400 transition-colors">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-700 font-medium mb-2">
                Drop your CSV file here
              </p>
              <p className="text-sm text-gray-500 mb-4">
                or click to browse
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer font-medium"
              >
                Choose File
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;