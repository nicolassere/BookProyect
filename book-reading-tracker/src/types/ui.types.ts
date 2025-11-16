// src/types/ui.types.ts
import type { Reading } from './book.types';

export interface ReadingGoal {
  year: number;
  targetBooks: number;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  language: 'en' | 'es';
  defaultView: string;
  excludeYAByDefault: boolean;
}

export interface UndoAction {
  type: 'delete' | 'edit';
  book: Reading;
  timestamp: number;
}