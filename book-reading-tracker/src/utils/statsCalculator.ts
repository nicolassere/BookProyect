// src/utils/statsCalculator.ts - ENHANCED
import type { Reading, AuthorProfile, Stats } from '../types';

export function calculateStats(
  readings: Reading[],
  authorProfiles: Map<string, AuthorProfile>
): Stats {
  const authorBooks = new Map<string, { count: number; nationality: string; totalRating: number; ratedCount: number }>();
  const authorPages = new Map<string, { pages: number; nationality: string }>();
  const nationalityCounts = new Map<string, { count: number; authors: Set<string> }>();
  const genreCounts = new Map<string, { count: number; pages: number; totalRating: number; ratedCount: number }>();
  const collectionCounts = new Map<string, number>();
  const monthlyData = new Map<string, { count: number; pages: number }>();
  const ratingDist = new Map<number, number>();

  // Process each reading
  readings.forEach(reading => {
    const profile = authorProfiles.get(reading.author);
    const nationality = profile?.nationality || reading.nationality;
    
    // Author stats
    if (!authorBooks.has(reading.author)) {
      authorBooks.set(reading.author, { count: 0, nationality, totalRating: 0, ratedCount: 0 });
    }
    const authorData = authorBooks.get(reading.author)!;
    authorData.count++;
    if (reading.rating != null) {
      authorData.totalRating += reading.rating;
      authorData.ratedCount++;
    }

    // Author pages
    if (!authorPages.has(reading.author)) {
      authorPages.set(reading.author, { pages: 0, nationality });
    }
    authorPages.get(reading.author)!.pages += reading.pages;

    // Nationality stats
    if (!nationalityCounts.has(nationality)) {
      nationalityCounts.set(nationality, { count: 0, authors: new Set() });
    }
    const natData = nationalityCounts.get(nationality)!;
    natData.count++;
    natData.authors.add(reading.author);

    // Genre stats
    if (!genreCounts.has(reading.genre)) {
      genreCounts.set(reading.genre, { count: 0, pages: 0, totalRating: 0, ratedCount: 0 });
    }
    const genreData = genreCounts.get(reading.genre)!;
    genreData.count++;
    genreData.pages += reading.pages;
    if (reading.rating != null) {
      genreData.totalRating += reading.rating;
      genreData.ratedCount++;
    }

    // Collection stats
    reading.collections.forEach(collection => {
      collectionCounts.set(collection, (collectionCounts.get(collection) || 0) + 1);
    });

    // Monthly stats
    if (reading.parsedDate) {
      const monthKey = `${reading.parsedDate.getFullYear()}-${String(reading.parsedDate.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { count: 0, pages: 0 });
      }
      const monthData = monthlyData.get(monthKey)!;
      monthData.count++;
      monthData.pages += reading.pages;
    }

    // Rating distribution
    if (reading.rating != null) {
      ratingDist.set(reading.rating, (ratingDist.get(reading.rating) || 0) + 1);
    }
  });

  // Update author profiles with calculated stats
  const updatedProfiles = new Map(authorProfiles);
  authorBooks.forEach((data, author) => {
    const existing = updatedProfiles.get(author);
    const avgRating = data.ratedCount > 0 ? data.totalRating / data.ratedCount : undefined;
    if (existing) {
      existing.totalBooks = data.count;
      existing.totalPages = authorPages.get(author)?.pages || 0;
      existing.averageRating = avgRating;
    } else {
      updatedProfiles.set(author, {
        name: author,
        nationality: data.nationality,
        primaryGenre: readings.find(r => r.author === author)?.genre || 'Unknown',
        totalBooks: data.count,
        totalPages: authorPages.get(author)?.pages || 0,
        averageRating: avgRating,
      });
    }
  });

  // Calculate monthly reading array (sorted by date)
  const monthlyReading = Array.from(monthlyData.entries())
    .map(([key, data]) => {
      const [yearStr, monthStr] = key.split('-');
      return {
        month: new Date(parseInt(yearStr), parseInt(monthStr) - 1).toLocaleString('es', { month: 'short' }),
        year: parseInt(yearStr),
        count: data.count,
        pages: data.pages,
      };
    })
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return new Date(a.year, 0).getMonth() - new Date(b.year, 0).getMonth();
    });

  // Calculate reading streak
  const readingStreak = calculateReadingStreak(readings);

  // Find longest and shortest books
  const sortedByPages = [...readings].sort((a, b) => b.pages - a.pages);
  const longestBook = sortedByPages[0];
  const shortestBook = sortedByPages[sortedByPages.length - 1];

  // Get favorite books (5 stars)
  const favoriteBooks = readings.filter(r => r.rating === 5 || r.favorite);

  // Calculate average rating
  const ratedBooks = readings.filter(r => r.rating != null);
  const averageRating = ratedBooks.length > 0
    ? ratedBooks.reduce((sum, r) => sum + (r.rating || 0), 0) / ratedBooks.length
    : 0;

  const academicBooks = readings.filter(r => 
  r.readingType === 'academic' || r.readingType === 'reference'
);

  // Calcular distribución por campo académico
  const academicByFieldMap = new Map<string, { count: number; pages: number }>();
  academicBooks.forEach(book => {
    const field = book.academicField || 'Sin categoría';
    if (!academicByFieldMap.has(field)) {
      academicByFieldMap.set(field, { count: 0, pages: 0 });
    }
    const data = academicByFieldMap.get(field)!;
    data.count++;
    data.pages += book.pages;
  });

  const academicByField = Array.from(academicByFieldMap.entries())
    .map(([field, data]) => ({ field, ...data }))
    .sort((a, b) => b.count - a.count);

  // Contar libros completos vs académicos
  const completeBooksCount = readings.filter(r => 
    !r.readingType || r.readingType === 'complete'
  ).length;

  const academicBooksCount = academicBooks.length;

  // ======================================================================

  // MODIFICAR EL return PARA INCLUIR LAS NUEVAS PROPIEDADES:
  return {
    totalBooks: readings.length,
    totalPages: readings.reduce((sum, r) => sum + r.pages, 0),
    uniqueAuthors: authorBooks.size,
    averagePages: readings.length > 0 
      ? Math.round(readings.reduce((sum, r) => sum + r.pages, 0) / readings.length) 
      : 0,
    averageRating,
    authorsByBooks: Array.from(authorBooks.entries())
      .map(([author, data]) => ({ author, count: data.count, nationality: data.nationality }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 100),
    authorsByPages: Array.from(authorPages.entries())
      .map(([author, data]) => ({ author, pages: data.pages, nationality: data.nationality }))
      .sort((a, b) => b.pages - a.pages)
      .slice(0, 100),
    authorsByNationality: Array.from(nationalityCounts.entries())
      .map(([nationality, data]) => ({ 
        nationality, 
        count: data.count, 
        authors: data.authors.size 
      }))
      .sort((a, b) => b.count - a.count),
    genreDistribution: Array.from(genreCounts.entries())
      .map(([genre, data]) => ({
        genre,
        count: data.count,
        pages: data.pages,
        averageRating: data.ratedCount > 0 ? data.totalRating / data.ratedCount : 0,
      }))
      .sort((a, b) => b.count - a.count),
    collectionStats: Array.from(collectionCounts.entries())
      .map(([collection, count]) => ({ collection, count }))
      .sort((a, b) => b.count - a.count),
    authorProfiles: updatedProfiles,
    monthlyReading,
    readingStreak,
    longestBook,
    shortestBook,
    favoriteBooks,
    ratingDistribution: Array.from(ratingDist.entries())
      .map(([rating, count]) => ({ rating, count }))
      .sort((a, b) => b.rating - a.rating),
    
    // ============= NUEVAS PROPIEDADES =============
    academicBooks,
    academicByField,
    completeBooksCount,
    academicBooksCount,
    // ==============================================
  };

  return {
    totalBooks: readings.length,
    totalPages: readings.reduce((sum, r) => sum + r.pages, 0),
    uniqueAuthors: authorBooks.size,
    averagePages: readings.length > 0 
      ? Math.round(readings.reduce((sum, r) => sum + r.pages, 0) / readings.length) 
      : 0,
    averageRating,
    authorsByBooks: Array.from(authorBooks.entries())
      .map(([author, data]) => ({ author, count: data.count, nationality: data.nationality }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 100), // Increased from 20 to 100
    authorsByPages: Array.from(authorPages.entries())
      .map(([author, data]) => ({ author, pages: data.pages, nationality: data.nationality }))
      .sort((a, b) => b.pages - a.pages)
      .slice(0, 100),
    authorsByNationality: Array.from(nationalityCounts.entries())
      .map(([nationality, data]) => ({ 
        nationality, 
        count: data.count, 
        authors: data.authors.size 
      }))
      .sort((a, b) => b.count - a.count),
    genreDistribution: Array.from(genreCounts.entries())
      .map(([genre, data]) => ({
        genre,
        count: data.count,
        pages: data.pages,
        averageRating: data.ratedCount > 0 ? data.totalRating / data.ratedCount : 0,
      }))
      .sort((a, b) => b.count - a.count),
    collectionStats: Array.from(collectionCounts.entries())
      .map(([collection, count]) => ({ collection, count }))
      .sort((a, b) => b.count - a.count),
    authorProfiles: updatedProfiles,
    monthlyReading,
    readingStreak,
    longestBook,
    shortestBook,
    favoriteBooks,
    ratingDistribution: Array.from(ratingDist.entries())
      .map(([rating, count]) => ({ rating, count }))
      .sort((a, b) => b.rating - a.rating),
  };
}



function calculateReadingStreak(readings: Reading[]): number {
  if (readings.length === 0) return 0;

  const sortedDates = readings
    .filter(r => r.parsedDate)
    .map(r => r.parsedDate!)
    .sort((a, b) => b.getTime() - a.getTime());

  if (sortedDates.length === 0) return 0;

  let streak = 1;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  // Check if most recent reading was within last 7 days
  const mostRecent = new Date(sortedDates[0]);
  mostRecent.setHours(0, 0, 0, 0);
  const daysDiff = Math.floor((currentDate.getTime() - mostRecent.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff > 7) return 0; // Streak broken if no reading in last 7 days

  // Count consecutive weeks with at least one reading
  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1]);
    const currDate = new Date(sortedDates[i]);
    prevDate.setHours(0, 0, 0, 0);
    currDate.setHours(0, 0, 0, 0);

    const weeksDiff = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
    
    if (weeksDiff <= 1) {
      streak++;
    } else {
      break;
    }
  }

  

  return streak;
}