// src/types/author.types.ts
export interface AuthorProfile {
  name: string;
  nationality: string;
  primaryGenre: string;
  favoriteBook?: string;
  totalBooks: number;
  totalPages: number;
  averageRating?: number;
  bio?: string;
}

export interface AuthorStats {
  author: string;
  count: number;
  pages: number;
  nationality: string;
  averageRating?: number;
}