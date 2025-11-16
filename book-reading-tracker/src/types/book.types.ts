export type ReadingType = 'complete' | 'academic' | 'reference';

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
  readingType?: ReadingType; // 'complete' por defecto, 'academic' para libros académicos/referencia
  coverUrl?: string;
  notes?: string;
  startDate?: string;
  favorite?: boolean;
  // Campos específicos para libros académicos
  academicField?: string; // Campo de estudio (ej: "Matemáticas", "Física", etc.)
  academicLevel?: 'undergraduate' | 'graduate' | 'reference'; // Nivel académico
  chaptersRead?: number[]; // Capítulos leídos (para libros que no se leen completos)
  totalChapters?: number; // Total de capítulos
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


