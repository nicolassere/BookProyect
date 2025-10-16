import { useState, useMemo, lazy, Suspense, useEffect } from 'react';
import { Music } from 'lucide-react';
import Papa from 'papaparse';
import type { Scrobble } from './types';
import { parseDate } from './utils/stats';
import { getDateRange } from './utils/stats';
import { useStats } from './utils/useStats';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { DateFilters } from './components/DateFilters';
import { UploadModal } from './components/UploadModal';
import { Confetti } from './components/Confetti';

const OverviewView = lazy(() => import('./views/OverviewView').then(m => ({ default: m.OverviewView })));
const RankingView = lazy(() => import('./views/RankingView').then(m => ({ default: m.RankingView })));
const YearsView = lazy(() => import('./views/YearsView').then(m => ({ default: m.YearsView })));
const TimelineView = lazy(() => import('./views/TimelineView').then(m => ({ default: m.TimelineView })));
const EvolutionView = lazy(() => import('./views/EvolutionView').then(m => ({ default: m.EvolutionView })));

type DatePreset = 'all' | 'last7' | 'last30' | 'last90' | 'last6months' | 'lastyear' | 'custom';

function App() {
  const [scrobbles, setScrobbles] = useState<Scrobble[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState('overview');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

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
        
        setScrobbles(data);
        setLoading(false);
        setShowUploadModal(false);
        setShowConfetti(true); // 🎉 Show confetti on successful upload!
        
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
    setShowConfetti(true);
  };

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-32 animate-fade-in">
      <div className="text-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary-200 dark:border-primary-800 rounded-full mx-auto mb-4"></div>
          <div className="w-16 h-16 border-4 border-primary-600 dark:border-primary-400 border-t-transparent rounded-full animate-spin mx-auto absolute top-0 left-1/2 -translate-x-1/2"></div>
        </div>
        <p className="text-gray-600 dark:text-gray-400 font-medium">Loading...</p>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme === 'dark' ? 'from-gray-900 via-purple-900/20 to-gray-900' : 'from-gray-50 via-blue-50/30 to-gray-50'}`}>
      <Confetti show={showConfetti} onComplete={() => setShowConfetti(false)} />
      
      <Header 
        onUpload={() => setShowUploadModal(true)} 
        onDemo={demoData}
        theme={theme}
        onThemeToggle={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      />

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
          <div className="max-w-2xl mx-auto animate-scale-in">
            <div className="bg-white dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 p-12 text-center overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-100/50 dark:from-primary-900/30 to-transparent rounded-full -translate-y-32 translate-x-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-100/50 dark:from-blue-900/30 to-transparent rounded-full translate-y-24 -translate-x-24"></div>

              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-200 dark:shadow-primary-900/50 transform hover:scale-110 transition-transform duration-300">
                  <Music className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                  Welcome to Last.fm Analytics
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
                  Import your Last.fm scrobble data to visualize your listening habits and discover insights about your music taste
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="px-8 py-3.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-300 font-medium shadow-lg shadow-primary-200 dark:shadow-primary-900/50 hover:shadow-xl hover:shadow-primary-300 dark:hover:shadow-primary-900/70 transform hover:-translate-y-0.5"
                  >
                    Import CSV File
                  </button>
                  <button
                    onClick={demoData}
                    className="px-8 py-3.5 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-300 font-medium transform hover:-translate-y-0.5"
                  >
                    Try Demo Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {stats && !loading && (
          <Suspense fallback={<LoadingSpinner />}>
            {activeView === 'overview' && <OverviewView stats={stats} />}
            {activeView === 'ranking' && <RankingView stats={stats} scrobbles={scrobbles} />}
            {activeView === 'years' && <YearsView stats={stats} />}
            {activeView === 'timeline' && <TimelineView stats={stats} />}
            {activeView === 'evolution' && <EvolutionView evolutionStats={stats} scrobbles={scrobbles} />}
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