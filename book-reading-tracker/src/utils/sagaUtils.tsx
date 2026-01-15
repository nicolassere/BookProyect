// src/utils/sagaUtils.ts
// Utilities for grouping books into sagas and calculating saga-level metrics

import type { Reading } from '../types';
import { getGenreWeight } from './influenceCalculator';

export interface Saga {
  id: string;
  name: string;
  author: string;
  books: Reading[];
  totalPages: number;
  weightedPages: number;
  avgRating: number;
  avgGenreWeight: number;
  primaryGenre: string;
  nationality: string;
  startYear: number | null;
  endYear: number | null;
  isComplete: boolean; // User can mark if they've read all books
  bookCount: number;
}

export interface SagaInfluenceScore {
  saga: Saga;
  rawScore: number;
  normalizedScore: number;
  breakdown: {
    totalPages: number;
    weightedPages: number;
    avgRating: number;
    ratingBonus: number;
    genreBonus: number;
    completionBonus: number;
    lengthBonus: number;
  };
}

/**
 * Extract saga name from book title or collection field
 * Handles common patterns like "Book Name (Series #1)", "Series: Book Name", etc.
 */
export function extractSagaName(book: Reading): string | null {
  // First check if book has explicit collection/saga field
  if ('collection' in book && (book as any).collection) {
    return (book as any).collection;
  }
  if ('saga' in book && (book as any).saga) {
    return (book as any).saga;
  }
  if ('series' in book && (book as any).series) {
    return (book as any).series;
  }

  // Try to extract from title using common patterns
  const title = book.title;

  // Pattern: "Title (Series #1)" or "Title (Series, #1)" or "Title (Series Book 1)"
  const parenPattern = /\(([^)]+?)(?:\s*[#,]\s*\d+|\s+Book\s+\d+|\s+Vol\.?\s*\d+)?\)$/i;
  const parenMatch = title.match(parenPattern);
  if (parenMatch) {
    const seriesName = parenMatch[1].replace(/[#,]\s*\d+$/, '').replace(/\s+Book\s+\d+$/i, '').trim();
    if (seriesName.length > 2) {
      return seriesName;
    }
  }

  // Pattern: "Series: Title" or "Series - Title"
  const colonPattern = /^([^:–—-]+?)(?:\s*[:–—-]\s+)/;
  const colonMatch = title.match(colonPattern);
  if (colonMatch && colonMatch[1].length > 2 && colonMatch[1].length < 50) {
    // Avoid matching things like "The Lord of the Rings: The Fellowship..."
    // by checking if what follows looks like a book title
    const afterColon = title.substring(colonMatch[0].length);
    if (afterColon.length > 3) {
      return colonMatch[1].trim();
    }
  }

  // Pattern: "Title, Vol. 1" or "Title Vol 1" or "Title #1"
  const volPattern = /^(.+?)(?:\s*,?\s*(?:Vol\.?|Volume|#|Book)\s*\d+)$/i;
  const volMatch = title.match(volPattern);
  if (volMatch && volMatch[1].length > 2) {
    return volMatch[1].trim();
  }

  return null;
}

/**
 * Group readings into sagas
 * Books without saga info remain as individual entries
 */
export function groupIntoSagas(readings: Reading[]): { sagas: Saga[]; standalone: Reading[] } {
  const sagaMap = new Map<string, Reading[]>();
  const standalone: Reading[] = [];

  readings.forEach(book => {
    const sagaName = extractSagaName(book);
    
    if (sagaName) {
      // Create a key combining saga name and author to handle same-named series by different authors
      const key = `${sagaName.toLowerCase()}|||${book.author.toLowerCase()}`;
      
      if (!sagaMap.has(key)) {
        sagaMap.set(key, []);
      }
      sagaMap.get(key)!.push(book);
    } else {
      standalone.push(book);
    }
  });

  // Convert to Saga objects (only if 2+ books, otherwise treat as standalone)
  const sagas: Saga[] = [];
  
  sagaMap.forEach((books, key) => {
    if (books.length >= 2) {
      // This is a real saga
      const [sagaName] = key.split('|||');
      sagas.push(createSagaFromBooks(sagaName, books));
    } else {
      // Single book with saga-like title, treat as standalone
      standalone.push(...books);
    }
  });

  // Sort sagas by total pages (descending)
  sagas.sort((a, b) => b.totalPages - a.totalPages);

  return { sagas, standalone };
}

/**
 * Create a Saga object from a group of books
 */
function createSagaFromBooks(name: string, books: Reading[]): Saga {
  // Calculate metrics
  const totalPages = books.reduce((sum, b) => sum + b.pages, 0);
  
  let weightedPages = 0;
  const genreCounts = new Map<string, number>();
  
  books.forEach(book => {
    const weight = getGenreWeight(book.genre);
    weightedPages += book.pages * weight;
    genreCounts.set(book.genre, (genreCounts.get(book.genre) || 0) + 1);
  });

  // Find primary genre (most common)
  let primaryGenre = books[0].genre;
  let maxCount = 0;
  genreCounts.forEach((count, genre) => {
    if (count > maxCount) {
      maxCount = count;
      primaryGenre = genre;
    }
  });

  // Calculate average rating (only rated books)
  const ratedBooks = books.filter(b => b.rating && b.rating > 0);
  const avgRating = ratedBooks.length > 0
    ? ratedBooks.reduce((sum, b) => sum + (b.rating || 0), 0) / ratedBooks.length
    : 0;

  // Average genre weight
  const avgGenreWeight = weightedPages / totalPages;

  // Find year range
  const years = books
    .map(b => b.yearPublished)
    .filter((y): y is number => y !== undefined && y !== null && y > 0)
    .sort((a, b) => a - b);

  // Sort books by publication year or date finished for display
  const sortedBooks = [...books].sort((a, b) => {
    if (a.yearPublished && b.yearPublished) {
      return a.yearPublished - b.yearPublished;
    }
    if (a.parsedDate && b.parsedDate) {
      return a.parsedDate.getTime() - b.parsedDate.getTime();
    }
    return 0;
  });

  // Capitalize saga name properly
  const formattedName = name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  return {
    id: `saga-${name.toLowerCase().replace(/\s+/g, '-')}`,
    name: formattedName,
    author: books[0].author, // Assuming all books have same author
    books: sortedBooks,
    totalPages,
    weightedPages: Math.round(weightedPages),
    avgRating,
    avgGenreWeight,
    primaryGenre,
    nationality: books[0].nationality,
    startYear: years.length > 0 ? years[0] : null,
    endYear: years.length > 0 ? years[years.length - 1] : null,
    isComplete: false, // Could be set by user
    bookCount: books.length,
  };
}

/**
 * Calculate influence score for a saga
 * A saga is treated as a single "super-book" for influence purposes
 */
export function calculateSagaInfluence(saga: Saga): SagaInfluenceScore {
  const { weightedPages, avgRating, bookCount, avgGenreWeight } = saga;

  // Rating bonus: same as individual books
  const ratingBonus = avgRating > 0 
    ? 0.6 + (avgRating - 1) * 0.225 
    : 1.0;

  // Genre bonus (already factored into weightedPages, but we track it)
  const genreBonus = avgGenreWeight;

  // Completion bonus: reading multiple books in a series shows commitment
  // 2 books = 1.1x, 3 books = 1.2x, etc. up to 1.5x for 6+ books
  const completionBonus = Math.min(1.5, 1 + (bookCount - 1) * 0.1);

  // Length bonus: longer sagas have more influence
  // Based on total pages: 1000+ pages = 1.1x, 2000+ = 1.2x, etc.
  const lengthBonus = Math.min(1.3, 1 + Math.floor(saga.totalPages / 1000) * 0.1);

  const rawScore = weightedPages * ratingBonus * completionBonus * lengthBonus;

  return {
    saga,
    rawScore,
    normalizedScore: 0, // Will be normalized later
    breakdown: {
      totalPages: saga.totalPages,
      weightedPages,
      avgRating,
      ratingBonus,
      genreBonus,
      completionBonus,
      lengthBonus,
    },
  };
}

/**
 * Calculate influence for all sagas
 */
export function calculateAllSagaInfluence(readings: Reading[]): SagaInfluenceScore[] {
  const { sagas } = groupIntoSagas(
    readings.filter(r => r.readingType !== 'academic' && r.readingType !== 'reference')
  );

  const scores = sagas.map(calculateSagaInfluence);

  // Normalize to 0-100
  const maxScore = Math.max(...scores.map(s => s.rawScore), 1);
  scores.forEach(s => {
    s.normalizedScore = Math.round((s.rawScore / maxScore) * 100);
  });

  return scores.sort((a, b) => b.normalizedScore - a.normalizedScore);
}

/**
 * Get author stats counting sagas as single works
 * Returns adjusted book count and other metrics
 */
export interface AuthorSagaStats {
  author: string;
  totalBooks: number; // Raw count
  effectiveBooks: number; // Counting sagas as 1
  sagas: Saga[];
  standaloneBooks: Reading[];
  totalPages: number;
  weightedPages: number;
  avgRating: number;
}

export function getAuthorStatsWithSagas(readings: Reading[]): AuthorSagaStats[] {
  // Group all readings by author
  const byAuthor = new Map<string, Reading[]>();
  
  readings.forEach(book => {
    if (!byAuthor.has(book.author)) {
      byAuthor.set(book.author, []);
    }
    byAuthor.get(book.author)!.push(book);
  });

  const stats: AuthorSagaStats[] = [];

  byAuthor.forEach((books, author) => {
    const { sagas, standalone } = groupIntoSagas(books);

    // Effective books = standalone count + number of sagas (each saga = 1)
    const effectiveBooks = standalone.length + sagas.length;

    // Calculate totals
    const totalPages = books.reduce((sum, b) => sum + b.pages, 0);
    let weightedPages = 0;
    books.forEach(b => {
      weightedPages += b.pages * getGenreWeight(b.genre);
    });

    const ratedBooks = books.filter(b => b.rating && b.rating > 0);
    const avgRating = ratedBooks.length > 0
      ? ratedBooks.reduce((sum, b) => sum + (b.rating || 0), 0) / ratedBooks.length
      : 0;

    stats.push({
      author,
      totalBooks: books.length,
      effectiveBooks,
      sagas,
      standaloneBooks: standalone,
      totalPages,
      weightedPages: Math.round(weightedPages),
      avgRating,
    });
  });

  return stats.sort((a, b) => b.effectiveBooks - a.effectiveBooks);
}