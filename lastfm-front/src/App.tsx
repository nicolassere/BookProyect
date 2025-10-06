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
    <div className="min-h-screen bg-white p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-8">
            <Music className="w-7 h-7 text-gray-900" />
            <h1 className="text-3xl font-semibold text-gray-900">Last.fm Statistics</h1>
          </div>

          <div className="flex gap-1 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'upload'
                  ? 'text-gray-900 border-b-2 border-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              type="button"
            >
              Upload CSV
            </button>
            <button
              onClick={() => setActiveTab('api')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'api'
                  ? 'text-gray-900 border-b-2 border-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              type="button"
            >
              Connect API
            </button>
          </div>

          {activeTab === 'upload' && (
            <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-12 hover:border-gray-400 transition-colors">
              <label className="flex flex-col items-center justify-center gap-3 cursor-pointer">
                <Upload className="w-10 h-10 text-gray-400" />
                <span className="text-gray-900 font-medium">
                  Drop your Last.fm CSV file here
                </span>
                <span className="text-gray-500 text-sm">or click to browse</span>
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
            <div className="space-y-5">
              <div>
                <label htmlFor="username" className="text-gray-700 font-medium block mb-2">
                  Last.fm Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="your_username"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-colors"
                />
              </div>
              <div>
                <label htmlFor="apiKey" className="text-gray-700 font-medium block mb-2">
                  API Key
                </label>
                <input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="your_api_key"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-colors"
                />
                <p className="text-gray-600 text-sm mt-2">
                  Get your API key at: <a href="https://www.last.fm/api/account/create" target="_blank" rel="noopener noreferrer" className="text-gray-900 underline hover:no-underline">last.fm/api</a>
                </p>
              </div>
              <button
                onClick={fetchFromAPI}
                disabled={loading}
                className="w-full bg-gray-900 text-white font-medium py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                {loading ? 'Loading...' : 'Load from Last.fm (last 2000 plays)'}
              </button>
            </div>
          )}
        </header>

        {loading && (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-gray-900 mb-4"></div>
            <p className="text-gray-600">Loading your music data...</p>
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
          <div className="bg-gray-50 rounded-lg p-16 text-center border border-gray-200">
            <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 max-w-md mx-auto">
              Upload your CSV file or connect to Last.fm API to visualize your listening statistics
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;