export type ReadingType = 'complete' | 'academic' | 'reference';
export type ReadingStatus = 'reading' | 'completed' | 'abandoned' | 'want-to-read';

export interface Reading {
  id: string;
  title: string;
  author: string;
  pages: number;
  genre: string;
  nationality: string;
  dateFinished?: string;        // Optional: not set for 'reading' status books
  timestamp?: string;
  parsedDate?: Date | null;
  rating?: number;
  collections: string[];
  isbn?: string;
  yearPublished?: number;
  readCount?: number;
  readingType?: ReadingType;
  coverUrl?: string;
  notes?: string;
  startDate?: string;
  favorite?: boolean;
  status?: ReadingStatus;       // reading | completed | abandoned | want-to-read
  // Academic-specific fields
  academicField?: string;
  academicLevel?: 'undergraduate' | 'graduate' | 'reference';
  chaptersRead?: number[];
  totalChapters?: number;
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
  readingType?: ReadingType;
  academicField?: string;
  academicLevel?: string;
  chaptersRead?: string;
  totalChapters?: string;
}
