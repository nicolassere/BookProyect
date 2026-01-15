// src/utils/influenceCalculator.ts
// Genre weights for calculating reading influence/difficulty

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
