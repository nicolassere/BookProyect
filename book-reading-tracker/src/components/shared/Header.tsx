import { Book, Plus, Download, Upload, Trash2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useBooks } from '../../contexts/BookContext';
import { storage } from '../../utils/storage';

interface HeaderProps {
  onAddBook: () => void;
  onCSVImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onJSONImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function Header({ onAddBook, onCSVImport, onJSONImport }: HeaderProps) {
  const { t, language, setLanguage } = useLanguage();
  const { readings, stats } = useBooks();

  const handleClearAll = () => {
    const confirmed = window.confirm(
      '⚠️ ¿Estás seguro de que quieres ELIMINAR TODOS los libros?\n\n' +
      `Se borrarán ${readings.length} libros permanentemente.\n\n` +
      'Esta acción no se puede deshacer.'
    );
    
    if (confirmed) {
      storage.clearAll();
      window.location.reload(); // Recargar la página para limpiar el estado
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-orange-700 rounded-xl flex items-center justify-center shadow-md">
              <Book className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{t.header.title}</h1>
              <p className="text-xs text-gray-500">
                {readings.length} {t.books.title.toLowerCase()} • {stats.totalPages.toLocaleString()} {t.books.pages}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2 items-center">
            {/* Language Selector */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all"
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
                  onClick={() => storage.exportToJSON(readings)}
                  className="p-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                  title={t.header.exportJSON}
                >
                  <Download className="w-4 h-4" />
                </button>
                <label className="p-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all cursor-pointer" title={t.header.importJSON}>
                  <Upload className="w-4 h-4" />
                  <input type="file" accept=".json" onChange={onJSONImport} className="hidden" />
                </label>
                <button
                  onClick={handleClearAll}
                  className="p-2 border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-all"
                  title="Eliminar todos los libros"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            
            <label className="px-3 py-2 border-2 border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-all cursor-pointer text-sm font-medium flex items-center gap-2" title={t.header.importCSV}>
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