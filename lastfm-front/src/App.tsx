import { useState, useMemo, type ChangeEvent } from 'react';
import { Upload, Music } from 'lucide-react';
import Papa from 'papaparse';
import type { Scrobble, TabType } from './types';
import { fetchAllScrobbles } from './services/lastfm';
import { calculateStats } from './utils/stats';
import { OverviewCards } from './components/OverviewCards';
import { Charts } from './components/Charts';
import { TopSongsList } from './components/TopSongsList';

function App() {
  const [scrobbles, setScrobbles] = useState<Scrobble[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>(localStorage.getItem('lastfm_api_key') || '');
  const [username, setUsername] = useState<string>(localStorage.getItem('lastfm_username') || '');
  const [activeTab, setActiveTab] = useState<TabType>('upload');

  const stats = useMemo(() => calculateStats(scrobbles), [scrobbles]);

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    Papa.parse<Scrobble>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const validData = results.data.filter((row) => row.artist && row.song);
        setScrobbles(validData);
        setLoading(false);
        
        if (validData.length === 0) {
          alert('No se encontraron datos válidos en el CSV');
        }
      },
      error: (error) => {
        alert('Error al procesar el archivo CSV: ' + error.message);
        setLoading(false);
      },
    });
  };

  const fetchFromAPI = async (): Promise<void> => {
    if (!apiKey || !username) {
      alert('Por favor ingresa tu API Key y usuario de Last.fm');
      return;
    }

    localStorage.setItem('lastfm_api_key', apiKey);
    localStorage.setItem('lastfm_username', username);

    setLoading(true);

    try {
      const tracks = await fetchAllScrobbles(username, apiKey, 10);
      setScrobbles(tracks);
      
      if (tracks.length === 0) {
        alert('No se encontraron scrobbles');
      }
    } catch (error) {
      console.error('Error:', error);
      alert((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4 md:p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.1),transparent_50%)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.08),transparent_50%)] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="bg-white/5 backdrop-blur-2xl rounded-3xl p-8 mb-8 shadow-2xl border border-white/10 transition-all duration-300 hover:shadow-blue-500/10">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-2xl shadow-lg">
              <Music className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-emerald-100 bg-clip-text text-transparent">Last.fm Statistics</h1>
              <p className="text-slate-400 text-sm mt-1">Explore your music listening patterns</p>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'upload'
                  ? 'bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow-lg shadow-blue-500/30 scale-105'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
              }`}
              type="button"
            >
              Upload CSV
            </button>
            <button
              onClick={() => setActiveTab('api')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'api'
                  ? 'bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
              }`}
              type="button"
            >
              Connect API
            </button>
          </div>

          {activeTab === 'upload' && (
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl p-8 border border-white/10 transition-all duration-300 hover:border-blue-500/30">
              <label className="flex flex-col items-center justify-center gap-4 cursor-pointer group">
                <div className="p-4 bg-gradient-to-br from-blue-500/20 to-emerald-500/20 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <Upload className="w-12 h-12 text-blue-400" />
                </div>
                <span className="text-white font-semibold text-lg">
                  Drag and drop your Last.fm CSV file
                </span>
                <span className="text-slate-400 text-sm">or click to browse</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl p-8 space-y-5 border border-white/10">
              <div>
                <label htmlFor="username" className="text-white font-semibold block mb-3 text-sm uppercase tracking-wide">
                  Last.fm Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="your_username"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-500"
                />
              </div>
              <div>
                <label htmlFor="apiKey" className="text-white font-semibold block mb-3 text-sm uppercase tracking-wide">
                  API Key
                </label>
                <input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="your_api_key"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-500"
                />
                <p className="text-slate-400 text-sm mt-3 flex items-center gap-2">
                  Get your API key at: <a href="https://www.last.fm/api/account/create" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">last.fm/api</a>
                </p>
              </div>
              <button
                onClick={fetchFromAPI}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 text-white font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                type="button"
              >
                {loading ? 'Loading...' : 'Load from Last.fm (last 2000 plays)'}
              </button>
            </div>
          )}
        </header>

        {loading && (
          <div className="text-center text-white text-xl py-16">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative inline-block animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-blue-500 border-r-emerald-500"></div>
            </div>
            <p className="text-slate-300">Loading your music data...</p>
          </div>
        )}

        {stats && !loading && (
          <>
            <OverviewCards stats={stats} />
            <Charts stats={stats} />
            <TopSongsList stats={stats} />
          </>
        )}

        {!stats && !loading && (
          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-2xl rounded-3xl p-16 text-center border border-white/10">
            <div className="inline-block p-5 bg-gradient-to-br from-blue-500/20 to-emerald-500/20 rounded-3xl mb-6">
              <Music className="w-16 h-16 text-slate-400" />
            </div>
            <p className="text-slate-300 text-xl max-w-md mx-auto leading-relaxed">
              Upload your CSV file or connect to Last.fm API to visualize your listening statistics
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;