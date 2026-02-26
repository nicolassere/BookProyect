// src/App.tsx - UPDATED with new views
import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from './contexts/LanguageContext';
import { useBooks } from './contexts/BookContext';
import { storage } from './utils/storage';
import { parseGoodreadsCSV } from './utils/csvParser';
import { calculateStats } from './utils/statsCalculator';
import type { Reading, ReadingGoal, UndoAction } from './types';

// Components
import { Header } from './components/shared/Header';
import { Navigation } from './components/shared/Navigation';
import { Filters } from './components/shared/Filters';
import { WelcomeScreen } from './components/welcome/WelcomeScreen';
import { BookDetailsModal } from './components/books/BookDetailsModal';
import { AddBookForm } from './components/books/AddBookForm';
import { EditBookForm } from './components/books/EditBookForm';
import { AuthorProfileEditor } from './components/authors/authorProfileEditor';
import { ReadingProgressChart } from './components/charts/ReadingProgressChart';
import { ReadingGoalsWidget } from './components/goals/ReadingGoalsWidget';
import { ReadingInsights } from './components/insights/ReadingInsights';

// Views
import { OverviewView } from './views/OverviewView';
import { BooksView } from './views/BooksView';
import { AuthorsView } from './views/AuthorsView';
import { GenresView } from './views/GenresView';
import { NationalitiesView } from './views/NationalitiesView';
import { YearlyStatsView } from './views/YearlyStatsView';
import { PublicationYearView } from './views/PublicationYearView';
import { HallOfFameView } from './views/HallOfFameView';
import { BookComparatorView } from './views/BookComparatorView';
import { SagasView } from './views/SagasView';

// Toast notification component
function Toast({ message, onUndo, onClose }: { message: string; onUndo?: () => void; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center gap-4 animate-slide-up">
      <span>{message}</span>
      {onUndo && (
        <button
          onClick={onUndo}
          className="px-3 py-1 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 font-medium transition-all"
        >
          Deshacer
        </button>
      )}
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-white dark:hover:text-gray-900 transition-all"
      >
        ✕
      </button>
    </div>
  );
}

// Views that don't need filters
const VIEWS_WITHOUT_FILTERS = ['yearly-stats', 'publication-years', 'hall-of-fame', 'comparator', 'sagas'];

function App() {
  const { t } = useLanguage();
  const {
    readings,
    authorProfiles,
    isLoading,
    addReading,
    updateReading,
    deleteReading,
    updateAuthorProfile,
    importReadings,
  } = useBooks();

  // UI State
  const [activeView, setActiveView] = useState('overview');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Reading | null>(null);
  const [viewingBook, setViewingBook] = useState<Reading | null>(null);
  const [showAuthorEditor, setShowAuthorEditor] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
  
  // Book type filter
  const [bookTypeFilter, setBookTypeFilter] = useState<'normal' | 'academic' | 'all'>('normal');
  
  // Filter State
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedNationality, setSelectedNationality] = useState<string | null>(null);
  const [excludeUnrated, setExcludeUnrated] = useState(false);
  const [excludeYA, setExcludeYA] = useState(true);
  
  // App State
  const [readingGoal, setReadingGoal] = useState<ReadingGoal | null>(null);
  const [undoAction, setUndoAction] = useState<UndoAction | null>(null);
  const [showToast, setShowToast] = useState(false);

  // Load reading goal from localStorage on mount (goal is UI-only state)
  useEffect(() => {
    const storedGoal = storage.loadGoal();
    if (storedGoal) setReadingGoal(storedGoal);
  }, []);

  // Save goal when it changes
  useEffect(() => {
    if (readingGoal) storage.saveGoal(readingGoal);
  }, [readingGoal]);

  // Reset filters when book type changes
  useEffect(() => {
    setSelectedGenre(null);
    setSelectedNationality(null);
    setExcludeUnrated(false);
    setExcludeYA(true);
  }, [bookTypeFilter]);

  // Step 1: Filter by book type
  const readingsByType = useMemo(() => {
    if (bookTypeFilter === 'all') {
      return readings;
    } else if (bookTypeFilter === 'academic') {
      return readings.filter(r => r.readingType === 'academic' || r.readingType === 'reference');
    } else {
      // 'normal' - exclude academic
      return readings.filter(r => !r.readingType || r.readingType === 'complete');
    }
  }, [readings, bookTypeFilter]);

  // Step 2: Apply additional filters
  const filteredReadings = useMemo(() => {
    let result = [...readingsByType];
    
    if (selectedGenre) {
      result = result.filter(r => r.genre === selectedGenre);
    }
    
    if (selectedNationality) {
      result = result.filter(r => r.nationality === selectedNationality);
    }
    
    if (excludeUnrated) {
      result = result.filter(r => r.rating != null);
    }
    
    if (excludeYA) {
      result = result.filter(r => r.genre !== 'YA');
    }
    
    return result;
  }, [readingsByType, selectedGenre, selectedNationality, excludeUnrated, excludeYA]);

  // Calculate stats
  const filteredStats = useMemo(() => {
    return calculateStats(filteredReadings, authorProfiles);
  }, [filteredReadings, authorProfiles]);

  // Get available genres and nationalities from current type filter
  const availableGenres = useMemo(() => 
    Array.from(new Set(readingsByType.map(r => r.genre))).sort(), 
    [readingsByType]
  );

  const availableNationalities = useMemo(() => 
    Array.from(new Set(readingsByType.map(r => r.nationality))).sort(), 
    [readingsByType]
  );

  // Handlers
  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvText = event.target?.result as string;
        const imported = parseGoodreadsCSV(csvText);
        
        const replace = window.confirm(
          `Se encontraron ${imported.length} libros.\n\n¿Reemplazar todos (${readings.length}) o agregar nuevos?`
        );
        
        importReadings(imported, replace);
        alert(`${replace ? 'Reemplazados' : 'Agregados'}: ${imported.length} libros`);
      } catch (error) {
        alert('Error al importar CSV');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleJSONImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string) as Reading[];
        const replace = window.confirm(`¿Reemplazar (${readings.length}) o agregar?`);
        importReadings(imported, replace);
      } catch (error) {
        alert('Error al importar JSON');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDelete = (id: string) => {
    const book = readings.find(r => r.id === id);
    if (book) {
      setUndoAction({
        type: 'delete',
        book,
        timestamp: Date.now(),
      });
      deleteReading(id);
      setShowToast(true);
    }
  };

  const handleUndo = () => {
    if (undoAction && undoAction.type === 'delete') {
      addReading(undoAction.book);
      setUndoAction(null);
      setShowToast(false);
    }
  };

  const handleToggleFavorite = (id: string) => {
    const book = readings.find(r => r.id === id);
    if (book) {
      updateReading({ ...book, favorite: !book.favorite });
    }
  };

  const handleBookClick = (book: Reading) => {
    setViewingBook(book);
  };

  // Check if current view needs filters
  const showFilters = !VIEWS_WITHOUT_FILTERS.includes(activeView);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
      <Header
        onAddBook={() => setShowAddForm(true)}
        onCSVImport={handleCSVImport}
        onJSONImport={handleJSONImport}
      />

      {readings.length > 0 && (
        <>
          <Navigation activeView={activeView} onViewChange={setActiveView} />
          
          {/* Only show type selector and filters for views that need them */}
          {showFilters && (
            <>
              {/* Book type selector */}
              <div className="bg-white/80 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 py-3">
                  <div className="flex gap-2 items-center flex-wrap">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Ver:</span>
                    <button
                      onClick={() => setBookTypeFilter('normal')}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        bookTypeFilter === 'normal'
                          ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-md'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      📚 Libros Normales ({readings.filter(r => !r.readingType || r.readingType === 'complete').length})
                    </button>
                    <button
                      onClick={() => setBookTypeFilter('academic')}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        bookTypeFilter === 'academic'
                          ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-md'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      🎓 Libros Académicos ({readings.filter(r => r.readingType === 'academic' || r.readingType === 'reference').length})
                    </button>
                    <button
                      onClick={() => setBookTypeFilter('all')}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        bookTypeFilter === 'all'
                          ? 'bg-purple-600 dark:bg-purple-500 text-white shadow-md'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      📖 Todos ({readings.length})
                    </button>
                  </div>
                </div>
              </div>

              <Filters
                selectedGenre={selectedGenre}
                selectedNationality={selectedNationality}
                excludeUnrated={excludeUnrated}
                excludeYA={excludeYA}
                onGenreChange={setSelectedGenre}
                onNationalityChange={setSelectedNationality}
                onExcludeUnratedChange={setExcludeUnrated}
                onExcludeYAChange={setExcludeYA}
                availableGenres={availableGenres}
                availableNationalities={availableNationalities}
              />
            </>
          )}
        </>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Filter info banner */}
        {readings.length > 0 && showFilters && (selectedGenre || selectedNationality || excludeUnrated || !excludeYA) && (
          <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm flex-wrap">
                <span className="font-bold text-amber-800 dark:text-amber-300">Filtros activos:</span>
                {excludeUnrated && <span className="px-2 py-1 bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 rounded-lg font-medium">Solo calificados</span>}
                {!excludeYA && <span className="px-2 py-1 bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-lg font-medium">✓ YA incluido</span>}
                {selectedGenre && <span className="px-2 py-1 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-lg font-medium">Género: {selectedGenre}</span>}
                {selectedNationality && <span className="px-2 py-1 bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-lg font-medium">Nacionalidad: {selectedNationality}</span>}
              </div>
              <span className="text-sm text-amber-700 dark:text-amber-400 whitespace-nowrap ml-2">
                {filteredReadings.length} de {readingsByType.length}
              </span>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-32 text-gray-500 dark:text-gray-400">
            <span className="text-lg">Cargando…</span>
          </div>
        ) : readings.length === 0 ? (
          <WelcomeScreen onAddFirst={() => setShowAddForm(true)} />
        ) : activeView === 'overview' ? (
          <div className="space-y-6">
            <OverviewView stats={filteredStats} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ReadingProgressChart readings={filteredReadings} months={12} />
              <ReadingGoalsWidget 
                readings={readingsByType} 
                goal={readingGoal} 
                onUpdateGoal={setReadingGoal} 
              />
            </div>
            
            <ReadingInsights readings={filteredReadings} stats={filteredStats} />
          </div>
        ) : activeView === 'books' ? (
          <BooksView
            readings={filteredReadings}
            authorProfiles={authorProfiles}
            onEdit={setEditingBook}
            onDelete={handleDelete}
            onBookClick={handleBookClick}
          />
        ) : activeView === 'authors' ? (
          <AuthorsView
            stats={filteredStats}
            readings={filteredReadings}
            onEditAuthor={(author) => {
              setSelectedAuthor(author);
              setShowAuthorEditor(true);
            }}
          />
        ) : activeView === 'genres' ? (
          <GenresView stats={filteredStats} readings={filteredReadings} />
        ) : activeView === 'nationalities' ? (
          <NationalitiesView stats={filteredStats} readings={filteredReadings} />
        ) : activeView === 'sagas' ? (
          <SagasView />
        ) : activeView === 'yearly-stats' ? (
          <YearlyStatsView />
        ) : activeView === 'publication-years' ? (
          <PublicationYearView />
        ) : activeView === 'hall-of-fame' ? (
          <HallOfFameView />
        ) : activeView === 'comparator' ? (
          <BookComparatorView />
        ) : 
        null}
      </main>

      {/* Modals */}
      {showAddForm && (
        <AddBookForm
          onClose={() => setShowAddForm(false)}
          onAdd={(book) => {
            addReading(book);
            setShowAddForm(false);
          }}
          existingGenres={Array.from(new Set(readings.map(r => r.genre)))}
          existingNationalities={Array.from(new Set(readings.map(r => r.nationality)))}
        />
      )}

      {editingBook && (
        <EditBookForm
          book={editingBook}
          onClose={() => setEditingBook(null)}
          onSave={(updated) => {
            updateReading(updated);
            setEditingBook(null);
          }}
          existingGenres={Array.from(new Set(readings.map(r => r.genre)))}
          existingNationalities={Array.from(new Set(readings.map(r => r.nationality)))}
        />
      )}

      {viewingBook && (
        <BookDetailsModal
          book={viewingBook}
          authorProfile={authorProfiles.get(viewingBook.author)}
          onClose={() => setViewingBook(null)}
          onEdit={(book) => {
            setViewingBook(null);
            setEditingBook(book);
          }}
          onDelete={handleDelete}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      {showAuthorEditor && selectedAuthor && (
        <AuthorProfileEditor
          author={selectedAuthor}
          profile={authorProfiles.get(selectedAuthor)}
          readings={filteredReadings.filter(r => r.author === selectedAuthor)}
          onClose={() => {
            setShowAuthorEditor(false);
            setSelectedAuthor(null);
          }}
          onSave={(profile) => {
            updateAuthorProfile(profile);
            setShowAuthorEditor(false);
            setSelectedAuthor(null);
          }}
        />
      )}

      {/* Toast notification */}
      {showToast && undoAction && (
        <Toast
          message="Libro eliminado"
          onUndo={handleUndo}
          onClose={() => {
            setShowToast(false);
            setUndoAction(null);
          }}
        />
      )}
    </div>
  );
}

export default App;
