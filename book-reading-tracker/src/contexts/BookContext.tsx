// src/contexts/BookContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import type { ReactNode } from 'react';
import type { Reading, AuthorProfile, Stats } from '../types';
import { calculateStats } from '../utils/statsCalculator';
import { api } from '../utils/api';

interface BookContextType {
  readings: Reading[];
  authorProfiles: Map<string, AuthorProfile>;
  stats: Stats;
  isLoading: boolean;
  backendAvailable: boolean;
  addReading: (reading: Omit<Reading, 'id' | 'parsedDate'>) => void;
  updateReading: (reading: Reading) => void;
  deleteReading: (id: string) => void;
  updateAuthorProfile: (profile: AuthorProfile) => void;
  importReadings: (readings: Reading[], replace?: boolean) => void;
  migrateFromLocalStorage: () => Promise<{ imported: number }>;
}

const BookContext = createContext<BookContextType | undefined>(undefined);

function attachParsedDate(r: Reading): Reading {
  return { ...r, parsedDate: r.dateFinished ? new Date(r.dateFinished) : null };
}

export function BookProvider({ children }: { children: ReactNode }) {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [authorProfiles, setAuthorProfiles] = useState<Map<string, AuthorProfile>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [backendAvailable, setBackendAvailable] = useState(false);

  // Keep a ref so callbacks can read the latest value without stale closures
  const backendRef = useRef(false);
  useEffect(() => {
    backendRef.current = backendAvailable;
  }, [backendAvailable]);

  // ─── Initial load ──────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const available = await api.isAvailable();
        setBackendAvailable(available);
        backendRef.current = available;

        if (available) {
          const [apiBooks, apiProfiles] = await Promise.all([
            api.books.list(),
            api.authors.list(),
          ]);

          setReadings(apiBooks.map(attachParsedDate));

          const profilesMap = new Map<string, AuthorProfile>();
          apiProfiles.forEach(p => profilesMap.set(p.name, p));
          setAuthorProfiles(profilesMap);
        } else {
          // Offline – fall back to localStorage
          const stored = localStorage.getItem('book_readings');
          if (stored) {
            const parsed = JSON.parse(stored) as Reading[];
            setReadings(parsed.map(attachParsedDate));
          }
          const storedProfiles = localStorage.getItem('author_profiles');
          if (storedProfiles) {
            const arr = JSON.parse(storedProfiles) as [string, AuthorProfile][];
            setAuthorProfiles(new Map(arr));
          }
        }
      } catch (err) {
        console.error('BookContext: failed to load data', err);
        // Fallback to localStorage on unexpected errors
        const stored = localStorage.getItem('book_readings');
        if (stored) {
          try {
            const parsed = JSON.parse(stored) as Reading[];
            setReadings(parsed.map(attachParsedDate));
          } catch {/* ignore */}
        }
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  // ─── Keep localStorage in sync as a local backup ──────────────────────────
  useEffect(() => {
    if (!isLoading && readings.length > 0) {
      localStorage.setItem('book_readings', JSON.stringify(readings));
    }
  }, [readings, isLoading]);

  useEffect(() => {
    if (!isLoading && authorProfiles.size > 0) {
      localStorage.setItem(
        'author_profiles',
        JSON.stringify(Array.from(authorProfiles.entries())),
      );
    }
  }, [authorProfiles, isLoading]);

  // ─── Stats (computed, not stored) ─────────────────────────────────────────
  const stats = calculateStats(readings, authorProfiles);

  // ─── CRUD actions ──────────────────────────────────────────────────────────

  const addReading = useCallback(
    (reading: Omit<Reading, 'id' | 'parsedDate'>) => {
      const newReading: Reading = {
        ...reading,
        id: `${Date.now()}${Math.random()}`,
        parsedDate: reading.dateFinished ? new Date(reading.dateFinished) : null,
      };

      // Optimistic UI update first
      setReadings(prev => [...prev, newReading]);

      // Persist to backend (fire-and-forget)
      if (backendRef.current) {
        api.books.create(reading).catch(err =>
          console.error('Failed to persist book to backend:', err),
        );
      }

      // Auto-create author profile if first book from this author
      setAuthorProfiles(prev => {
        if (prev.has(reading.author)) return prev;
        const newProfile: AuthorProfile = {
          name: reading.author,
          nationality: reading.nationality,
          primaryGenre: reading.genre,
          totalBooks: 1,
          totalPages: reading.pages,
        };
        if (backendRef.current) {
          api.authors.upsert(newProfile).catch(err =>
            console.error('Failed to persist author profile:', err),
          );
        }
        return new Map(prev).set(reading.author, newProfile);
      });
    },
    [],
  );

  const updateReading = useCallback((updated: Reading) => {
    setReadings(prev => prev.map(r => (r.id === updated.id ? updated : r)));
    if (backendRef.current) {
      api.books.update(updated.id, updated).catch(err =>
        console.error('Failed to update book in backend:', err),
      );
    }
  }, []);

  const deleteReading = useCallback((id: string) => {
    setReadings(prev => prev.filter(r => r.id !== id));
    if (backendRef.current) {
      api.books.delete(id).catch(err =>
        console.error('Failed to delete book from backend:', err),
      );
    }
  }, []);

  const updateAuthorProfile = useCallback((profile: AuthorProfile) => {
    setAuthorProfiles(prev => new Map(prev).set(profile.name, profile));
    // Propagate nationality / genre change to matching books
    setReadings(prev =>
      prev.map(r =>
        r.author === profile.name
          ? { ...r, nationality: profile.nationality, genre: profile.primaryGenre }
          : r,
      ),
    );
    if (backendRef.current) {
      api.authors.upsert(profile).catch(err =>
        console.error('Failed to update author profile in backend:', err),
      );
    }
  }, []);

  const importReadings = useCallback(
    (imported: Reading[], replace = false) => {
      const withDates = imported.map(attachParsedDate);

      if (replace) {
        setReadings(withDates);
      } else {
        setReadings(prev => {
          const existing = new Set(prev.map(r => `${r.title}|${r.author}`));
          const newBooks = withDates.filter(b => !existing.has(`${b.title}|${b.author}`));
          return [...prev, ...newBooks];
        });
      }

      if (backendRef.current) {
        api.import
          .json(imported, [], replace)
          .catch(err => console.error('Failed to import readings to backend:', err));
      }
    },
    [],
  );

  /**
   * One-time migration: sends all current localStorage data to the backend.
   * Call this when the user first enables the backend.
   */
  const migrateFromLocalStorage = useCallback(async (): Promise<{ imported: number }> => {
    const storedReadings = localStorage.getItem('book_readings');
    const storedProfiles = localStorage.getItem('author_profiles');

    const localReadings: Reading[] = storedReadings ? JSON.parse(storedReadings) : [];
    const localProfiles: [string, AuthorProfile][] = storedProfiles
      ? JSON.parse(storedProfiles)
      : [];

    if (!localReadings.length) return { imported: 0 };

    const result = await api.import.json(
      localReadings,
      localProfiles.map(([, p]) => p),
      false,
    );
    return { imported: result.imported };
  }, []);

  return (
    <BookContext.Provider
      value={{
        readings,
        authorProfiles,
        stats,
        isLoading,
        backendAvailable,
        addReading,
        updateReading,
        deleteReading,
        updateAuthorProfile,
        importReadings,
        migrateFromLocalStorage,
      }}
    >
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
