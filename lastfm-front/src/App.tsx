import { useState, useMemo } from 'react';
import { Upload, Music, TrendingUp, Users, Disc, Clock, Calendar, BarChart3, Activity, X } from 'lucide-react';
import type { Scrobble } from './types';
import { calculateStats } from './utils/stats';
import { StatCard } from './components/StatCard';
import { SimpleBarChart } from './components/SimpleBarChart';
import { SimpleLineChart } from './components/SimpleLineChart';

function App() {
  const [scrobbles, setScrobbles] = useState<Scrobble[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState('overview');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const stats = useMemo(() => calculateStats(scrobbles), [scrobbles]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const data = lines.slice(1).filter(line => line.trim()).map(line => {
        const values = line.split(',');
        const obj: any = {};
        headers.forEach((header, i) => {
          obj[header.toLowerCase()] = values[i]?.trim() || '';
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
    
    for (let i = 0; i < 500; i++) {
      const artistIndex = Math.floor(Math.random() * artists.length);
      demo.push({
        artist: artists[artistIndex],
        song: songs[artistIndex],
        album: `Album ${artistIndex + 1}`,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
    
    setScrobbles(demo);
  };

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
                { id: 'artists', label: 'Artists', icon: Users },
                { id: 'tracks', label: 'Tracks', icon: Music },
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

        {stats && !loading && activeView === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={Music}
                label="Total Scrobbles"
                value={stats.total.toLocaleString()}
                color="bg-blue-600"
              />
              <StatCard
                icon={Users}
                label="Unique Artists"
                value={stats.uniqueArtists.toLocaleString()}
                color="bg-emerald-600"
              />
              <StatCard
                icon={Disc}
                label="Unique Tracks"
                value={stats.uniqueSongs.toLocaleString()}
                color="bg-violet-600"
              />
              <StatCard
                icon={TrendingUp}
                label="Top Artist"
                value={stats.topArtists[0]?.artist.substring(0, 15) || '-'}
                change={`${stats.topArtists[0]?.count || 0} plays`}
                color="bg-amber-600"
              />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Listening Activity by Hour
                </h3>
                <SimpleLineChart data={stats.hourlyData} dataKey="count" nameKey="hour" />
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  Activity by Day of Week
                </h3>
                <SimpleBarChart 
                  data={stats.dailyData} 
                  dataKey="count" 
                  nameKey="day"
                  color="#10b981"
                />
              </div>
            </div>

            {/* Top Artists & Songs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-violet-600" />
                  Top 10 Artists
                </h3>
                <SimpleBarChart 
                  data={stats.topArtists} 
                  dataKey="count" 
                  nameKey="artist"
                  color="#8b5cf6"
                />
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Music className="w-5 h-5 text-blue-600" />
                  Top 10 Tracks
                </h3>
                <div className="space-y-2">
                  {stats.topSongs.map((song, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">{i + 1}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 flex-1 truncate" title={song.song}>
                        {song.song}
                      </span>
                      <span className="text-sm font-semibold text-gray-600">
                        {song.count}
                      </span>
                    </div>
                  ))}
                </div>
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