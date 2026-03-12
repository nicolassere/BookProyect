import { Book, Plus, Download, Upload, Trash2, Wifi, WifiOff, Moon, Sun } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useBooks } from '../../contexts/BookContext';
import { useTheme } from '../../contexts/ThemeContext';
import { storage } from '../../utils/storage';
import { api } from '../../utils/api';

interface HeaderProps {
  onAddBook: () => void;
  onCSVImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onJSONImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function Header({ onAddBook, onCSVImport, onJSONImport }: HeaderProps) {
  const { t, language, setLanguage } = useLanguage();
  const { readings, stats, backendAvailable, clearAllReadings } = useBooks();
  const { theme, toggleTheme } = useTheme();

  const handleClearAll = () => {
    const confirmed = window.confirm(
      '⚠️ ¿Estás seguro de que quieres ELIMINAR TODOS los libros?\n\n' +
      `Se borrarán ${readings.length} libros permanentemente.\n\n` +
      'Esta acción no se puede deshacer.',
    );
    if (confirmed) clearAllReadings();
  };

  const handleExport = () => {
    if (backendAvailable) {
      api.export.json();   // server-side download — includes everything in the DB
    } else {
      storage.exportToJSON(readings);  // fallback: export from local state
    }
  };

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-orange-700 rounded-xl flex items-center justify-center shadow-md">
              <Book className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t.header.title}</h1>
              <div className="flex items-center gap-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {readings.length} {t.books.title.toLowerCase()} • {stats.totalPages.toLocaleString()} {t.books.pages}
                </p>
                {/* Backend connection indicator */}
                <span
                  title={backendAvailable ? 'Sincronizado con el servidor' : 'Modo local (sin servidor)'}
                  className={`flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-full ${
                    backendAvailable
                      ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {backendAvailable
                    ? <><Wifi className="w-3 h-3" /> Online</>
                    : <><WifiOff className="w-3 h-3" /> Local</>}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 items-center">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Language Selector */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'en' | 'es')}
              className="px-3 py-2 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              <option value="en">🇬🇧 English</option>
              <option value="es">🇪🇸 Español</option>
            </select>

            <button
              onClick={onAddBook}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-700 text-white rounded-lg hover:from-amber-700 hover:to-orange-800 transition-all shadow-md text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              {t.header.addBook}
            </button>

            {readings.length > 0 && (
              <>
                <button
                  onClick={handleExport}
                  className="p-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                  title={backendAvailable ? 'Descargar JSON desde servidor' : t.header.exportJSON}
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={handleClearAll}
                  className="p-2 border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-all"
                  title="Eliminar todos los libros"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Import buttons — always visible so data can be restored from empty state */}
            <label
              className="p-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer"
              title={t.header.importJSON}
            >
              <Upload className="w-4 h-4" />
              <input type="file" accept=".json" onChange={onJSONImport} className="hidden" />
            </label>

            <label
              className="px-3 py-2 border-2 border-blue-300 text-blue-700 dark:border-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all cursor-pointer text-sm font-medium flex items-center gap-2"
              title={t.header.importCSV}
            >
              <Upload className="w-4 h-4" />
              CSV
              <input type="file" accept=".csv" onChange={onCSVImport} className="hidden" />
            </label>
          </div>
        </div>
      </div>
    </header>
  );
}
