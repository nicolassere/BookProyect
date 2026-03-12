// src/utils/influenceCalculator.ts
// Genre weights and influence score calculations for reading analytics

import type { Reading } from '../types/index';

// Genre weights - higher = more "influential" intellectually
export const GENRE_WEIGHTS: Record<string, number> = {
  // High influence (1.5x) - Dense, complex, transformative
  'Philosophy': 1.5,
  'Filosofía': 1.5,
  'Classic': 1.5,
  'Clásico': 1.5,
  'Classics': 1.5,
  'Clásicos': 1.5,
  'History': 1.4,
  'Historia': 1.4,
  'Essays': 1.4,
  'Ensayo': 1.4,
  'Ensayos': 1.4,
  
  // Medium-high influence (1.3x) - Challenging, educational
  'Science': 1.3,
  'Ciencia': 1.3,
  'Psychology': 1.3,
  'Psicología': 1.3,
  'Biography': 1.3,
  'Biografía': 1.3,
  'Politics': 1.3,
  'Política': 1.3,
  'Economics': 1.3,
  'Economía': 1.3,
  'Sociology': 1.3,
  'Sociología': 1.3,
  
  // Medium influence (1.2x) - Literary value
  'Literary Fiction': 1.2,
  'Ficción Literaria': 1.2,
  'Poetry': 1.2,
  'Poesía': 1.2,
  'Drama': 1.2,
  'Theater': 1.2,
  'Teatro': 1.2,
  'Memoir': 1.2,
  'Memorias': 1.2,
  
  // Standard influence (1.0x) - Good reading
  'Fiction': 1.0,
  'Ficción': 1.0,
  'Novel': 1.0,
  'Novela': 1.0,
  'Mystery': 1.0,
  'Misterio': 1.0,
  'Thriller': 1.0,
  'Horror': 1.0,
  'Terror': 1.0,
  'Sci-Fi': 1.0,
  'Science Fiction': 1.0,
  'Ciencia Ficción': 1.0,
  'Fantasy': 1.0,
  'Fantasía': 1.0,
  'Historical Fiction': 1.0,
  'Ficción Histórica': 1.0,
  
  // Lower influence (0.8x) - Lighter reading
  'Romance': 0.8,
  'YA': 0.8,
  'Young Adult': 0.8,
  'Juvenil': 0.8,
  'Sports': 0.8,
  'Deportes': 0.8,
  'Self-Help': 0.8,
  'Autoayuda': 0.8,
  'Comedy': 0.8,
  'Comedia': 0.8,
  'Humor': 0.8,
};

// Get genre weight, default to 1.0 for unknown genres
export function getGenreWeight(genre: string): number {
  // Try exact match first
  if (GENRE_WEIGHTS[genre]) {
    return GENRE_WEIGHTS[genre];
  }
  
  // Try case-insensitive match
  const lowerGenre = genre.toLowerCase();
  for (const [key, value] of Object.entries(GENRE_WEIGHTS)) {
    if (key.toLowerCase() === lowerGenre) {
      return value;
    }
  }
  
  // Try partial match
  for (const [key, value] of Object.entries(GENRE_WEIGHTS)) {
    if (lowerGenre.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerGenre)) {
      return value;
    }
  }
  
  return 1.0; // Default weight
}

// ==============================
// Influence Score Types & Logic
// ==============================

export interface InfluenceScore {
  name: string;
  normalizedScore: number;
  rawScore: number;
  breakdown: {
    booksCount: number;
    totalPages: number;
    weightedPages: number;
    avgRating: number;
  };
  topGenres: { genre: string; count: number; weight: number }[];
  books: Reading[];
}

function getRatingMultiplier(rating: number | undefined): number {
  if (!rating) return 1.0;
  if (rating >= 5) return 1.5;
  if (rating >= 4) return 1.2;
  if (rating >= 3) return 1.0;
  if (rating >= 2) return 0.8;
  return 0.6;
}

function calculateGroupInfluence(groups: Map<string, Reading[]>): InfluenceScore[] {
  const scores: InfluenceScore[] = [];

  groups.forEach((books, name) => {
    if (books.length === 0) return;

    const totalPages = books.reduce((sum, b) => sum + b.pages, 0);

    // Weighted pages with per-book rating multiplier
    let weightedPages = 0;
    books.forEach(book => {
      const genreWeight = getGenreWeight(book.genre);
      const ratingMult = getRatingMultiplier(book.rating);
      weightedPages += book.pages * genreWeight * ratingMult;
    });

    // Diversity bonus: +5% per unique genre beyond the first, capped at +20%
    const uniqueGenres = new Set(books.map(b => b.genre));
    const diversityBonus = Math.min(0.20, (uniqueGenres.size - 1) * 0.05);

    // Favorite bonus: +10% per 5-star book
    const favoriteCount = books.filter(b => b.rating === 5).length;
    const favoriteBonus = favoriteCount * 0.10;

    const rawScore = weightedPages * (1 + diversityBonus + favoriteBonus);

    // Average rating over rated books only
    const ratedBooks = books.filter(b => b.rating != null);
    const avgRating = ratedBooks.length > 0
      ? ratedBooks.reduce((sum, b) => sum + (b.rating ?? 0), 0) / ratedBooks.length
      : 0;

    // Top genres breakdown
    const genreMap = new Map<string, { count: number; weight: number }>();
    books.forEach(b => {
      const existing = genreMap.get(b.genre);
      if (existing) {
        existing.count++;
      } else {
        genreMap.set(b.genre, { count: 1, weight: getGenreWeight(b.genre) });
      }
    });
    const topGenres = Array.from(genreMap.entries())
      .map(([genre, data]) => ({ genre, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    scores.push({
      name,
      rawScore,
      normalizedScore: 0,
      breakdown: {
        booksCount: books.length,
        totalPages,
        weightedPages: Math.round(weightedPages),
        avgRating,
      },
      topGenres,
      books,
    });
  });

  // Normalize scores to 0–100
  const maxScore = Math.max(...scores.map(s => s.rawScore), 1);
  scores.forEach(s => {
    s.normalizedScore = Math.round((s.rawScore / maxScore) * 100);
  });

  return scores.sort((a, b) => b.normalizedScore - a.normalizedScore);
}

export function calculateAuthorInfluence(readings: Reading[]): InfluenceScore[] {
  const groups = new Map<string, Reading[]>();
  readings.forEach(book => {
    if (!groups.has(book.author)) groups.set(book.author, []);
    groups.get(book.author)!.push(book);
  });
  return calculateGroupInfluence(groups);
}

export function calculateCountryInfluence(readings: Reading[]): InfluenceScore[] {
  const groups = new Map<string, Reading[]>();
  readings.forEach(book => {
    const key = book.nationality || 'Unknown';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(book);
  });
  return calculateGroupInfluence(groups);
}

export function calculateGenreInfluence(readings: Reading[]): InfluenceScore[] {
  const groups = new Map<string, Reading[]>();
  readings.forEach(book => {
    if (!groups.has(book.genre)) groups.set(book.genre, []);
    groups.get(book.genre)!.push(book);
  });
  return calculateGroupInfluence(groups);
}

export function getInfluenceExplanation(score: InfluenceScore): string {
  const { booksCount, weightedPages, avgRating } = score.breakdown;
  const ratingStr = avgRating > 0 ? ` · avg ${avgRating.toFixed(1)}★` : '';
  return `${booksCount} books · ${weightedPages.toLocaleString()} weighted pages${ratingStr}`;
}
