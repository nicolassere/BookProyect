import { useState, useMemo, lazy, Suspense } from 'react';
import { Upload, Music } from 'lucide-react';
import Papa from 'papaparse';
import type { Scrobble } from './types';
import { parseDate } from './utils/stats';
import { getDateRange } from './utils/stats';
import { useStats } from './utils/useStats';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { DateFilters } from './components/DateFilters';
import { UploadModal } from './components/UploadModal';

// Lazy load views
const OverviewView = lazy(() => import('./views/OverviewView').then(m => ({ default: m.OverviewView })));
const RankingView = lazy(() => import('./views/RankingView').then(m => ({ default: m.RankingView })));
const YearsView = lazy(() => import('./views/YearsView').then(m => ({ default: m.YearsView })));
const TimelineView = lazy(() => import('./views/TimelineView').then(m => ({ default: m.TimelineView })));

type DatePreset = 'all' | 'last7' | 'last30' | 'last90' | 'last6months' | 'lastyear' | 'custom';

function App() {
  const [scrobbles, setScrobbles] = useState<Scrobble[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState('overview');
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  const dateRange = useMemo(() => getDateRange(scrobbles), [scrobbles]);
  
  const { startDate, endDate } = useMemo(() => {
    if (datePreset === 'custom') {
      return {
        startDate: customStartDate ? new Date(customStartDate) : undefined,
        endDate: customEndDate ? new Date(customEndDate) : undefined
      };
    }
    
    if (datePreset === 'all') return { startDate: undefined, endDate: undefined };
    
    const now = new Date();
    const end = new Date(now);
    let start = new Date(now);
    
    switch (datePreset) {
      case 'last7': start.setDate(now.getDate() - 7); break;
      case 'last30': start.setDate(now.getDate() - 30); break;
      case 'last90': start.setDate(now.getDate() - 90); break;
      case 'last6months': start.setMonth(now.getMonth() - 6); break;
      case 'lastyear': start.setFullYear(now.getFullYear() - 1); break;
    }
    
    return { startDate: start, endDate: end };
  }, [datePreset, customStartDate, customEndDate]);
  
  // ⚡ LAZY STATS: Solo calcula lo necesario para la vista activa
  const stats = useStats(scrobbles, startDate, endDate, activeView);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      worker: true,
      complete: (results) => {
        console.time('⚡ Process CSV Data');
        
        const data = results.data
          .filter((row: any) => row.artist && row.song)
          .map((row: any) => {
            const scrobble: Scrobble = {
              artist: row.artist?.trim() || '',
              song: row.song?.trim() || '',
              album: row.album?.trim() || '',
              date: row.date?.trim() || '',
              timestamp: row.timestamp?.trim() || '',
              url: row.url?.trim() || '',
              parsedDate: parseDate(row.date?.trim() || '', row.timestamp?.trim() || '')
            };
            return scrobble;
          });
        
        console.timeEnd('⚡ Process CSV Data');
        console.log('📊 Loaded scrobbles:', data.length);
        console.log('🔍 Sample:', data[0]);
        
        setScrobbles(data);
        setLoading(false);
        setShowUploadModal(false);
        
        if (data.length === 0) {
          alert('No se encontraron datos válidos en el CSV');
        }
      },
      error: (error) => {
        alert('Error al procesar el archivo CSV: ' + error.message);
        setLoading(false);
      }
    });
  };

  const demoData = () => {
    const demo: Scrobble[] = [];
    const artists = ['Radiohead', 'The Beatles', 'Pink Floyd', 'Led Zeppelin', 'Nirvana'];
    const songs = ['Creep', 'Hey Jude', 'Wish You Were Here', 'Stairway to Heaven', 'Smells Like Teen Spirit'];
    
    const now = Date.now();
    for (let i = 0; i < 1000; i++) {
      const artistIndex = Math.floor(Math.random() * artists.length);
      const daysAgo = Math.floor(Math.random() * 365);
      const randomHour = Math.floor(Math.random() * 24);
      const randomMinute = Math.floor(Math.random() * 60);
      
      const timestamp = Math.floor((now - daysAgo * 24 * 60 * 60 * 1000) / 1000);
      const date = new Date(timestamp * 1000);
      date.setHours(randomHour, randomMinute);
      
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const dateStr = `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}, ${randomHour.toString().padStart(2, '0')}:${randomMinute.toString().padStart(2, '0')}`;
      
      demo.push({
        artist: artists[artistIndex],
        song: songs[artistIndex],
        album: `Album ${artistIndex + 1}`,
        date: dateStr,
        timestamp: Math.floor(date.getTime() / 1000).toString(),
        parsedDate: date
      });
    }
    
    setScrobbles(demo);
  };

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-32">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onUpload={() => setShowUploadModal(true)} onDemo={demoData} />

      {stats && (
        <>
          <Navigation activeView={activeView} onViewChange={setActiveView} />
          <DateFilters
            dateRange={dateRange}
            datePreset={datePreset}
            setDatePreset={setDatePreset}
            customStartDate={customStartDate}
            setCustomStartDate={setCustomStartDate}
            customEndDate={customEndDate}
            setCustomEndDate={setCustomEndDate}
          />
        </>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && <LoadingSpinner />}

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
                Import your Last.fm scrobble data to visualize your listening habits
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

        {stats && !loading && (
          <Suspense fallback={<LoadingSpinner />}>
            {activeView === 'overview' && <OverviewView stats={stats} />}
            {activeView === 'ranking' && <RankingView stats={stats} />}
            {activeView === 'years' && <YearsView stats={stats} />}
            {activeView === 'timeline' && <TimelineView stats={stats} />}
          </Suspense>
        )}
      </main>

      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onUpload={handleFileUpload}
        />
      )}
    </div>
  );
}

export default App;