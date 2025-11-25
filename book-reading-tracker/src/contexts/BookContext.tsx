// src/contexts/BookContext.tsx - VERSIÓN FINAL
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { Reading, AuthorProfile, Stats } from '../types';
import { calculateStats } from '../utils/statsCalculator';

interface BookContextType {
  readings: Reading[];
  authorProfiles: Map<string, AuthorProfile>;
  stats: Stats;
  addReading: (reading: Omit<Reading, 'id' | 'parsedDate'>) => void;
  updateReading: (reading: Reading) => void;
  deleteReading: (id: string) => void;
  updateAuthorProfile: (profile: AuthorProfile) => void;
  importReadings: (readings: Reading[], replace?: boolean) => void;
}

const BookContext = createContext<BookContextType | undefined>(undefined);

export function BookProvider({ children }: { children: ReactNode }) {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [authorProfiles, setAuthorProfiles] = useState<Map<string, AuthorProfile>>(new Map());

  // Cargar readings del localStorage SOLO UNA VEZ al inicio
  useEffect(() => {
    const stored = localStorage.getItem('book_readings');
    if (stored) {
      const parsed = JSON.parse(stored) as Reading[];
      const withDates = parsed.map(r => ({
        ...r,
        parsedDate: r.dateFinished ? new Date(r.dateFinished) : null,
      }));
      setReadings(withDates);
    }
  }, []); // <-- Array vacío = solo al inicio

  // Guardar en localStorage cada vez que readings cambia
  useEffect(() => {
    if (readings.length > 0) {
      localStorage.setItem('book_readings', JSON.stringify(readings));
    }
  }, [readings]);

  const stats = calculateStats(readings, authorProfiles);

  const addReading = useCallback((reading: Omit<Reading, 'id' | 'parsedDate'>) => {
    const newReading: Reading = {
      ...reading,
      id: Date.now().toString() + Math.random(),
      parsedDate: reading.dateFinished ? new Date(reading.dateFinished) : null,
    };
    setReadings(prev => [...prev, newReading]);

    // Create author profile if doesn't exist
    if (!authorProfiles.has(reading.author)) {
      const newProfile: AuthorProfile = {
        name: reading.author,
        nationality: reading.nationality,
        primaryGenre: reading.genre,
        totalBooks: 1,
        totalPages: reading.pages,
      };
      setAuthorProfiles(prev => new Map(prev).set(reading.author, newProfile));
    }
  }, [authorProfiles]);

  const updateReading = useCallback((updated: Reading) => {
    setReadings(prev => prev.map(r => r.id === updated.id ? updated : r));
  }, []);

  const deleteReading = useCallback((id: string) => {
    setReadings(prev => prev.filter(r => r.id !== id));
  }, []);

  const updateAuthorProfile = useCallback((profile: AuthorProfile) => {
    setAuthorProfiles(prev => new Map(prev).set(profile.name, profile));
    setReadings(prev => prev.map(r => 
      r.author === profile.name 
        ? { ...r, nationality: profile.nationality, genre: profile.primaryGenre }
        : r
    ));
  }, []);

  const importReadings = useCallback((imported: Reading[], replace: boolean = false) => {
    if (replace) {
      // Reemplazar todos los libros
      setReadings(imported);
    } else {
      // Agregar solo libros que no existan (comparar por título + autor)
      setReadings(prev => {
        const existing = new Set(prev.map(r => `${r.title}|${r.author}`));
        const newBooks = imported.filter(book => 
          !existing.has(`${book.title}|${book.author}`)
        );
        return [...prev, ...newBooks];
      });
    }
  }, []);

  return (
    <BookContext.Provider value={{
      readings,
      authorProfiles,
      stats,
      addReading,
      updateReading,
      deleteReading,
      updateAuthorProfile,
      importReadings,
    }}>
      {children}
    </BookContext.Provider>
  );
}

export function useBooks() {
  const context = useContext(BookContext);
  if (context === undefined) {
    throw new Error('useBooks must be used within a BookProvider');
  }
  return context;
}