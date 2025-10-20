import { createContext, useContext, useState, ReactNode } from 'react';
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
  importReadings: (readings: Reading[]) => void;
}

const BookContext = createContext<BookContextType | undefined>(undefined);

export function BookProvider({ children }: { children: ReactNode }) {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [authorProfiles, setAuthorProfiles] = useState<Map<string, AuthorProfile>>(new Map());

  const stats = calculateStats(readings, authorProfiles);

  const addReading = (reading: Omit<Reading, 'id' | 'parsedDate'>) => {
    const newReading: Reading = {
      ...reading,
      id: Date.now().toString(),
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
  };

  const updateReading = (updated: Reading) => {
    setReadings(prev => prev.map(r => r.id === updated.id ? updated : r));
  };

  const deleteReading = (id: string) => {
    setReadings(prev => prev.filter(r => r.id !== id));
  };

  const updateAuthorProfile = (profile: AuthorProfile) => {
    setAuthorProfiles(prev => new Map(prev).set(profile.name, profile));
    setReadings(prev => prev.map(r => 
      r.author === profile.name 
        ? { ...r, nationality: profile.nationality, genre: profile.primaryGenre }
        : r
    ));
  };

  const importReadings = (imported: Reading[]) => {
    setReadings(prev => [...prev, ...imported]);
  };

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