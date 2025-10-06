import { useState, useMemo, ChangeEvent } from 'react';
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Music className="w-8 h-8 text-white" />
            <h1 className="text-3xl font-bold text-white">Last.fm Statistics Dashboard</h1>
          </div>

          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                activeTab === 'upload'
                  ? 'bg-white text-purple-900'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              type="button"
            >
              Cargar CSV
            </button>
            <button
              onClick={() => setActiveTab('api')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                activeTab === 'api'
                  ? 'bg-white text-purple-900'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              type="button"
            >
              Conectar API
            </button>
          </div>

          {activeTab === 'upload' && (
            <div className="bg-white/20 rounded-xl p-6">
              <label className="flex flex-col items-center justify-center gap-4 cursor-pointer">
                <Upload className="w-12 h-12 text-white" />
                <span className="text-white font-semibold">
                  Arrastra o haz clic para cargar tu CSV de Last.fm
                </span>
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
            <div className="bg-white/20 rounded-xl p-6 space-y-4">
              <div>
                <label htmlFor="username" className="text-white font-semibold block mb-2">
                  Usuario de Last.fm
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="tu_usuario"
                  className="w-full px-4 py-2 rounded-lg bg-white/90 text-gray-900"
                />
              </div>
              <div>
                <label htmlFor="apiKey" className="text-white font-semibold block mb-2">
                  API Key
                </label>
                <input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="tu_api_key"
                  className="w-full px-4 py-2 rounded-lg bg-white/90 text-gray-900"
                />
                <p className="text-white/70 text-sm mt-2">
                  Obtén tu API key en: <a href="https://www.last.fm/api/account/create" target="_blank" rel="noopener noreferrer" className="underline">last.fm/api</a>
                </p>
              </div>
              <button
                onClick={fetchFromAPI}
                disabled={loading}
                className="w-full bg-white text-purple-900 font-bold py-3 rounded-lg hover:bg-white/90 transition disabled:opacity-50"
                type="button"
              >
                {loading ? 'Cargando...' : 'Cargar desde Last.fm (últimas 2000 reproducciones)'}
              </button>
            </div>
          )}
        </header>

        {loading && (
          <div className="text-center text-white text-xl py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4"></div>
            <p>Cargando datos...</p>
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
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 text-center">
            <Music className="w-16 h-16 text-white/50 mx-auto mb-4" />
            <p className="text-white/70 text-lg">
              Carga tu archivo CSV o conecta con la API de Last.fm para ver tus estadísticas
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;