// src/App.tsx - ENHANCED VERSION
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
import { AcademicBooksView } from './views/AcademicBooksView';

// Toast notification component (simple)
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

function App() {
  const { t } = useLanguage();
  const {
    readings,
    authorProfiles,
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
  
  // Filter State
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedNationality, setSelectedNationality] = useState<string | null>(null);
  const [excludeUnrated, setExcludeUnrated] = useState(false);
  const [excludeYA, setExcludeYA] = useState(true);
  
  // App State
  const [isLoaded, setIsLoaded] = useState(false);
  const [readingGoal, setReadingGoal] = useState<ReadingGoal | null>(null);
  const [undoAction, setUndoAction] = useState<UndoAction | null>(null);
  const [showToast, setShowToast] = useState(false);

  // Load data on mount
  useEffect(() => {
    const storedReadings = storage.loadReadings();
    const storedGoal = storage.loadGoal();
    
    if (storedReadings.length > 0) {
      importReadings(storedReadings, true);
    }
    if (storedGoal) {
      setReadingGoal(storedGoal);
    }
    setIsLoaded(true);
  }, []);

  // Save data when it changes
  useEffect(() => {
    if (isLoaded && readings.length > 0) {
      storage.saveReadings(readings);
      storage.saveProfiles(authorProfiles);
    }
  }, [readings, authorProfiles, isLoaded]);

  // Save goal when it changes
  useEffect(() => {
    if (isLoaded && readingGoal) {
      storage.saveGoal(readingGoal);
    }
  }, [readingGoal, isLoaded]);

  // Filter readings
  const filteredReadings = useMemo(() => {
    return readings.filter(reading => {
      if (selectedGenre && reading.genre !== selectedGenre) return false;
      if (selectedNationality && reading.nationality !== selectedNationality) return false;
      if (excludeUnrated && !reading.rating) return false;
      if (excludeYA && reading.genre === 'YA') return false;
      return true;
    });
  }, [readings, selectedGenre, selectedNationality, excludeUnrated, excludeYA]);

  // Calculate stats
  const filteredStats = useMemo(() => {
    return calculateStats(filteredReadings, authorProfiles);
  }, [filteredReadings, authorProfiles]);

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
          <Filters
            selectedGenre={selectedGenre}
            selectedNationality={selectedNationality}
            excludeUnrated={excludeUnrated}
            excludeYA={excludeYA}
            onGenreChange={setSelectedGenre}
            onNationalityChange={setSelectedNationality}
            onExcludeUnratedChange={setExcludeUnrated}
            onExcludeYAChange={setExcludeYA}
            availableGenres={Array.from(new Set(readings.map(r => r.genre)))}
            availableNationalities={Array.from(new Set(readings.map(r => r.nationality)))}
          />
        </>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Filter info banner */}
        {readings.length > 0 && (selectedGenre || selectedNationality || excludeUnrated || !excludeYA) && (
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
                {filteredReadings.length} de {readings.length}
              </span>
            </div>
          </div>
        )}

        {readings.length === 0 ? (
          <WelcomeScreen onAddFirst={() => setShowAddForm(true)} />
        ) : activeView === 'overview' ? (
          <div className="space-y-6">
            <OverviewView stats={filteredStats} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ReadingProgressChart readings={filteredReadings} months={12} />
              <ReadingGoalsWidget 
                readings={readings} 
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
        ) : activeView === 'academic' ? (
          <AcademicBooksView
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
          <GenresView stats={filteredStats} />
        ) : (
          <NationalitiesView stats={filteredStats} />
        )}
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