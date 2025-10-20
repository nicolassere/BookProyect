import type { AuthorProfile } from '../types/author.types';

export interface Stats {
  totalBooks: number;
  totalPages: number;
  uniqueAuthors: number;
  averagePages: number;
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
  }>;
  collectionStats: Array<{
    collection: string;
    count: number;
  }>;
  authorProfiles: Map<string, AuthorProfile>;
}