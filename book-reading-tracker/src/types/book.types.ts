export interface Reading {
  id: string;
  title: string;
  author: string;
  pages: number;
  genre: string;
  nationality: string;
  dateFinished: string;
  timestamp?: string;
  parsedDate?: Date | null;
  rating?: number;
  collections: string[];
  isbn?: string;
  yearPublished?: number;
  readCount?: number;
}

export interface BookFormData {
  title: string;
  author: string;
  pages: string;
  genre: string;
  nationality: string;
  dateFinished: string;
  rating: string;
  collections: string;
  isbn?: string;
  yearPublished?: string;
}