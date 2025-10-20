export interface AuthorProfile {
  name: string;
  nationality: string;
  primaryGenre: string;
  favoriteBook?: string;
  totalBooks: number;
  totalPages: number;
}

export interface AuthorStats {
  author: string;
  count: number;
  pages: number;
  nationality: string;
}