import type { Reading, AuthorProfile, Stats } from '../types';

export function calculateStats(
  readings: Reading[],
  authorProfiles: Map<string, AuthorProfile>
): Stats {
  const authorBooks = new Map<string, { count: number; nationality: string }>();
  const authorPages = new Map<string, { pages: number; nationality: string }>();
  const nationalityCounts = new Map<string, { count: number; authors: Set<string> }>();
  const genreCounts = new Map<string, { count: number; pages: number }>();
  const collectionCounts = new Map<string, number>();

  readings.forEach(reading => {
    const profile = authorProfiles.get(reading.author);
    const nationality = profile?.nationality || reading.nationality;
    
    if (!authorBooks.has(reading.author)) {
      authorBooks.set(reading.author, { count: 0, nationality });
    }
    authorBooks.get(reading.author)!.count++;

    if (!authorPages.has(reading.author)) {
      authorPages.set(reading.author, { pages: 0, nationality });
    }
    authorPages.get(reading.author)!.pages += reading.pages;

    if (!nationalityCounts.has(nationality)) {
      nationalityCounts.set(nationality, { count: 0, authors: new Set() });
    }
    const natData = nationalityCounts.get(nationality)!;
    natData.count++;
    natData.authors.add(reading.author);

    if (!genreCounts.has(reading.genre)) {
      genreCounts.set(reading.genre, { count: 0, pages: 0 });
    }
    const genreData = genreCounts.get(reading.genre)!;
    genreData.count++;
    genreData.pages += reading.pages;

    reading.collections.forEach(collection => {
      collectionCounts.set(collection, (collectionCounts.get(collection) || 0) + 1);
    });
  });

  const updatedProfiles = new Map(authorProfiles);
  authorBooks.forEach((data, author) => {
    const existing = updatedProfiles.get(author);
    if (existing) {
      existing.totalBooks = data.count;
      existing.totalPages = authorPages.get(author)?.pages || 0;
    }
  });

  return {
    totalBooks: readings.length,
    totalPages: readings.reduce((sum, r) => sum + r.pages, 0),
    uniqueAuthors: authorBooks.size,
    averagePages: readings.length > 0 
      ? Math.round(readings.reduce((sum, r) => sum + r.pages, 0) / readings.length) 
      : 0,
    authorsByBooks: Array.from(authorBooks.entries())
      .map(([author, data]) => ({ author, count: data.count, nationality: data.nationality }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20),
    authorsByPages: Array.from(authorPages.entries())
      .map(([author, data]) => ({ author, pages: data.pages, nationality: data.nationality }))
      .sort((a, b) => b.pages - a.pages)
      .slice(0, 20),
    authorsByNationality: Array.from(nationalityCounts.entries())
      .map(([nationality, data]) => ({ 
        nationality, 
        count: data.count, 
        authors: data.authors.size 
      }))
      .sort((a, b) => b.count - a.count),
    genreDistribution: Array.from(genreCounts.entries())
      .map(([genre, data]) => ({ genre, count: data.count, pages: data.pages }))
      .sort((a, b) => b.count - a.count),
    collectionStats: Array.from(collectionCounts.entries())
      .map(([collection, count]) => ({ collection, count }))
      .sort((a, b) => b.count - a.count),
    authorProfiles: updatedProfiles,
  };
}