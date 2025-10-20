import { en } from './en';
import { es } from './es';
// Import other languages as needed
// import { fr } from './fr';
// import { pt } from './pt';

export const translations = {
  en,
  es,
  // fr,
  // pt,
};

export type Language = keyof typeof translations;
export type TranslationKeys = typeof en;