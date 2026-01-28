// src/types/hallOfFame.ts
// Type definitions for the Hall of Fame system

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  color: string; // Tailwind color class
  description: string;
}

export interface BookBadge {
  bookId: string;
  badgeId: string;
  assignedAt: string; // ISO date
}

export interface CustomCategory {
  id: string;
  name: string;
  emoji: string;
  description: string;
  createdAt: string;
}

export interface CategoryNomination {
  categoryId: string;
  bookId: string;
  nominatedAt: string;
  isWinner: boolean;
}

export interface AnnualAward {
  year: number;
  type: 'book' | 'author' | 'discovery' | 'disappointment';
  winnerId: string; // bookId or author name
  note?: string;
}

export interface CustomRanking {
  id: string;
  name: string;
  emoji: string;
  description: string;
  bookIds: string[]; // Ordered list, index 0 = #1
  createdAt: string;
  updatedAt: string;
}

export interface HallOfFameData {
  badges: BookBadge[];
  categories: CustomCategory[];
  nominations: CategoryNomination[];
  annualAwards: AnnualAward[];
  rankings: CustomRanking[];
  authorPhotos: Record<string, string>; // author name -> photo URL
}