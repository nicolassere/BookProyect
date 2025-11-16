// src/types/stats.types.ts
import type { Reading, AuthorProfile } from './book.types';

export interface Stats {
  totalBooks: number;
  totalPages: number;
  uniqueAuthors: number;
  averagePages: number;
  averageRating: number;
  authorsByBooks: Array<{
    author: string;
    count: number;
    nationality: string;
  }>;
  authorsByPages: Array<{
    author: string;
    pages: number;
    nationality: string;
  }>;
  authorsByNationality: Array<{
    nationality: string;
    count: number;
    authors: number;
  }>;
  genreDistribution: Array<{
    genre: string;
    count: number;
    pages: number;
    averageRating: number;
  }>;
  collectionStats: Array<{
    collection: string;
    count: number;
  }>;
  authorProfiles: Map<string, AuthorProfile>;
  
  // New stats
  monthlyReading: Array<{
    month: string;
    year: number;
    count: number;
    pages: number;
  }>;
  readingStreak: number;
  longestBook?: Reading;
  shortestBook?: Reading;
  favoriteBooks: Reading[];
  ratingDistribution: Array<{
    rating: number;
    count: number;
  }>;
  
  // Academic book stats
  academicBooks: Reading[];
  academicByField: Array<{
    field: string;
    count: number;
    pages: number;
  }>;
  completeBooksCount: number;
  academicBooksCount: number;
}