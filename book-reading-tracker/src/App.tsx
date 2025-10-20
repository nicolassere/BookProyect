// src/App.tsx
import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from './contexts/LanguageContext';
import { useBooks } from './contexts/BookContext';
import { storage } from './utils/storage';
import { parseGoodreadsCSV } from './utils/csvParser';
import { calculateStats } from './utils/statsCalculator';

// Components
import { Header } from './components/shared/Header';
import { Navigation } from './components/shared/Navigation';
import { Filters } from './components/shared/Filters';
import { WelcomeScreen } from './components/welcome/WelcomeScreen';

// Views
import { OverviewView } from './views/OverviewView';
import { BooksView } from './views/BooksView';
import { AuthorsView } from './views/AuthorsView';
import { GenresView } from './views/GenresView';
import { NationalitiesView } from './views/NationalitiesView';

// Modals
import { AddBookForm } from './components/books/AddBookForm';
import { EditBookForm } from './components/books/EditBookForm';
import { AuthorProfileEditor } from './components/authors/authorProfileEditor';

import type { Reading } from './types';

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

  const [activeView, setActiveView] = useState('overview');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Reading | null>(null);
  const [showAuthorEditor, setShowAuthorEditor] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedNationality, setSelectedNationality] = useState<string | null>(null);
  const [excludeUnrated, setExcludeUnrated] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data on mount ONCE
  useEffect(() => {
    const storedReadings = storage.loadReadings();
    
    if (storedReadings.length > 0) {
      importReadings(storedReadings, true); // true = replace
    }
    setIsLoaded(true);
  }, []); // Sin dependencias para que solo se ejecute una vez

  // Save data when it changes (solo después de la carga inicial)
  useEffect(() => {
    if (isLoaded && readings.length > 0) {
      storage.saveReadings(readings);
      storage.saveProfiles(authorProfiles);
    }
  }, [readings, authorProfiles, isLoaded]);

  // Filtrar readings basado en los filtros activos
  const filteredReadings = useMemo(() => {
    return readings.filter(reading => {
      // Filtro de género
      if (selectedGenre && reading.genre !== selectedGenre) return false;
      
      // Filtro de nacionalidad
      if (selectedNationality && reading.nationality !== selectedNationality) return false;
      
      // Filtro de calificación
      if (excludeUnrated && !reading.rating) return false;
      
      return true;
    });
  }, [readings, selectedGenre, selectedNationality, excludeUnrated]);

  // Calcular estadísticas con los readings filtrados
  const filteredStats = useMemo(() => {
    return calculateStats(filteredReadings, authorProfiles);
  }, [filteredReadings, authorProfiles]);

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvText = event.target?.result as string;
        const imported = parseGoodreadsCSV(csvText);
        
        // Preguntar al usuario si quiere reemplazar o agregar
        const replace = window.confirm(
          `Se encontraron ${imported.length} libros en el CSV.\n\n` +
          `¿Quieres REEMPLAZAR todos tus libros actuales (${readings.length}) con estos?\n\n` +
          `Presiona OK para reemplazar, Cancelar para agregar solo los nuevos.`
        );
        
        importReadings(imported, replace);
        
        const message = replace 
          ? `Se reemplazaron todos los libros. Total: ${imported.length}`
          : `Se agregaron libros nuevos. Total: ${readings.length + imported.length}`;
        
        alert(message);
      } catch (error) {
        console.error('Error importing CSV:', error);
        alert('Error al importar CSV. Por favor verifica el formato del archivo.');
      }
    };
    reader.readAsText(file);
    
    // Limpiar el input para permitir reimportar el mismo archivo
    e.target.value = '';
  };

  const handleJSONImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string) as Reading[];
        
        const replace = window.confirm(
          `Se encontraron ${imported.length} libros en el JSON.\n\n` +
          `¿Quieres REEMPLAZAR todos tus libros actuales (${readings.length}) con estos?\n\n` +
          `Presiona OK para reemplazar, Cancelar para agregar solo los nuevos.`
        );
        
        importReadings(imported, replace);
        
        const message = replace 
          ? `Se reemplazaron todos los libros. Total: ${imported.length}`
          : `Se agregaron libros nuevos. Total: ${readings.length + imported.length}`;
        
        alert(message);
      } catch (error) {
        console.error('Error importing JSON:', error);
        alert('Error al importar JSON. Por favor verifica el formato del archivo.');
      }
    };
    reader.readAsText(file);
    
    // Limpiar el input
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50">
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
            onGenreChange={setSelectedGenre}
            onNationalityChange={setSelectedNationality}
            onExcludeUnratedChange={setExcludeUnrated}
            availableGenres={Array.from(new Set(readings.map(r => r.genre)))}
            availableNationalities={Array.from(new Set(readings.map(r => r.nationality)))}
          />
        </>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Mostrar información sobre filtros activos */}
        {readings.length > 0 && (selectedGenre || selectedNationality || excludeUnrated) && (
          <div className="mb-6 bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-bold text-amber-800">Filtros activos:</span>
                {excludeUnrated && (
                  <span className="px-2 py-1 bg-amber-200 text-amber-800 rounded-lg font-medium">
                    Solo libros calificados
                  </span>
                )}
                {selectedGenre && (
                  <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded-lg font-medium">
                    Género: {selectedGenre}
                  </span>
                )}
                {selectedNationality && (
                  <span className="px-2 py-1 bg-green-200 text-green-800 rounded-lg font-medium">
                    Nacionalidad: {selectedNationality}
                  </span>
                )}
              </div>
              <span className="text-sm text-amber-700">
                Mostrando {filteredReadings.length} de {readings.length} libros
              </span>
            </div>
          </div>
        )}

        {readings.length === 0 ? (
          <WelcomeScreen onAddFirst={() => setShowAddForm(true)} />
        ) : activeView === 'overview' ? (
          <OverviewView stats={filteredStats} />
        ) : activeView === 'books' ? (
          <BooksView
            readings={filteredReadings}
            authorProfiles={authorProfiles}
            onEdit={setEditingBook}
            onDelete={(id) => {
              if (confirm(t.books.deleteConfirm)) {
                deleteReading(id);
              }
            }}
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
    </div>
  );
}

export default App;