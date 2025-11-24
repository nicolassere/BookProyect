// src/contexts/LanguageContext.tsx - ACTUALIZADO
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Import types and translations
type Language = 'en' | 'es';

interface TranslationStructure {
  common: {
    add: string;
    edit: string;
    delete: string;
    save: string;
    cancel: string;
    search: string;
    filter: string;
    sort: string;
    loading: string;
    close: string;
    select: string;
  };
  header: {
    title: string;
    addBook: string;
    importCSV: string;
    exportJSON: string;
    importJSON: string;
  };
  navigation: {
    overview: string;
    books: string;
    academic: string;
    authors: string;
    genres: string;
    nationalities: string;
    'yearly-stats': string;
  };
  stats: {
    booksRead: string;
    totalPages: string;
    uniqueAuthors: string;
    avgPages: string;
    topGenres: string;
    topNationalities: string;
  };
  books: {
    title: string;
    searchPlaceholder: string;
    sortBy: {
      date: string;
      title: string;
      author: string;
      rating: string;
    };
    pages: string;
    by: string;
    deleteConfirm: string;
  };
  authors: {
    title: string;
    sortByBooks: string;
    sortByPages: string;
    editProfile: string;
    nationality: string;
    primaryGenre: string;
    favoriteBook: string;
    booksBy: string;
  };
  forms: {
    addBook: string;
    editBook: string;
    title: string;
    author: string;
    pages: string;
    genre: string;
    nationality: string;
    dateFinished: string;
    rating: string;
    collections: string;
    collectionsPlaceholder: string;
    required: string;
  };
  welcome: {
    title: string;
    description: string;
    addFirstBook: string;
    loadDemo: string;
  };
  filters: {
    allGenres: string;
    allNationalities: string;
    clearFilters: string;
  };
}

// English translations
const en: TranslationStructure = {
  common: {
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    loading: 'Loading...',
    close: 'Close',
    select: 'Select',
  },
  header: {
    title: 'Book Reading Tracker',
    addBook: 'Add Book',
    importCSV: 'Import CSV',
    exportJSON: 'Export JSON',
    importJSON: 'Import JSON',
  },
  navigation: {
    overview: 'Overview',
    books: 'Books',
    academic: 'Academic',
    authors: 'Authors',
    genres: 'Genres',
    nationalities: 'Nationalities',
    'yearly-stats': 'Yearly Stats',
  },
  stats: {
    booksRead: 'Books Read',
    totalPages: 'Total Pages',
    uniqueAuthors: 'Unique Authors',
    avgPages: 'Avg Pages/Book',
    topGenres: 'Top Genres',
    topNationalities: 'Top Nationalities',
  },
  books: {
    title: 'All Books',
    searchPlaceholder: 'Search books...',
    sortBy: {
      date: 'Date Read',
      title: 'Title',
      author: 'Author',
      rating: 'Rating',
    },
    pages: 'pages',
    by: 'by',
    deleteConfirm: 'Are you sure you want to delete this book?',
  },
  authors: {
    title: 'Authors Analysis',
    sortByBooks: 'By Books',
    sortByPages: 'By Pages',
    editProfile: 'Edit Author Profile',
    nationality: 'Nationality',
    primaryGenre: 'Primary Genre',
    favoriteBook: 'Favorite Book',
    booksBy: 'Books by this author',
  },
  forms: {
    addBook: 'Add New Book',
    editBook: 'Edit Book',
    title: 'Title',
    author: 'Author',
    pages: 'Pages',
    genre: 'Genre',
    nationality: 'Nationality',
    dateFinished: 'Date Finished',
    rating: 'Rating',
    collections: 'Collections',
    collectionsPlaceholder: 'e.g., Favorites, Summer 2024, To Re-read',
    required: 'Required field',
  },
  welcome: {
    title: 'Welcome to Your Reading Tracker',
    description: 'Track your reading journey, analyze by genre, discover authors by nationality, and group books your way',
    addFirstBook: 'Add Your First Book',
    loadDemo: 'Load Demo Data',
  },
  filters: {
    allGenres: 'All Genres',
    allNationalities: 'All Nationalities',
    clearFilters: 'Clear Filters',
  },
};

// Spanish translations
const es: TranslationStructure = {
  common: {
    add: 'Añadir',
    edit: 'Editar',
    delete: 'Eliminar',
    save: 'Guardar',
    cancel: 'Cancelar',
    search: 'Buscar',
    filter: 'Filtrar',
    sort: 'Ordenar',
    loading: 'Cargando...',
    close: 'Cerrar',
    select: 'Seleccionar',
  },
  header: {
    title: 'Registro de Lectura',
    addBook: 'Añadir Libro',
    importCSV: 'Importar CSV',
    exportJSON: 'Exportar JSON',
    importJSON: 'Importar JSON',
  },
  navigation: {
    overview: 'Resumen',
    books: 'Libros',
    academic: 'Académicos',
    authors: 'Autores',
    genres: 'Géneros',
    nationalities: 'Nacionalidades',
    'yearly-stats': 'Por Año',
  },
  stats: {
    booksRead: 'Libros Leídos',
    totalPages: 'Páginas Totales',
    uniqueAuthors: 'Autores Únicos',
    avgPages: 'Promedio Páginas/Libro',
    topGenres: 'Géneros Principales',
    topNationalities: 'Nacionalidades Principales',
  },
  books: {
    title: 'Todos los Libros',
    searchPlaceholder: 'Buscar libros...',
    sortBy: {
      date: 'Fecha de Lectura',
      title: 'Título',
      author: 'Autor',
      rating: 'Calificación',
    },
    pages: 'páginas',
    by: 'por',
    deleteConfirm: '¿Estás seguro de que quieres eliminar este libro?',
  },
  authors: {
    title: 'Análisis de Autores',
    sortByBooks: 'Por Libros',
    sortByPages: 'Por Páginas',
    editProfile: 'Editar Perfil del Autor',
    nationality: 'Nacionalidad',
    primaryGenre: 'Género Principal',
    favoriteBook: 'Libro Favorito',
    booksBy: 'Libros de este autor',
  },
  forms: {
    addBook: 'Añadir Nuevo Libro',
    editBook: 'Editar Libro',
    title: 'Título',
    author: 'Autor',
    pages: 'Páginas',
    genre: 'Género',
    nationality: 'Nacionalidad',
    dateFinished: 'Fecha de Finalización',
    rating: 'Calificación',
    collections: 'Colecciones',
    collectionsPlaceholder: 'ej., Favoritos, Verano 2024, Para releer',
    required: 'Campo obligatorio',
  },
  welcome: {
    title: 'Bienvenido a tu Registro de Lectura',
    description: 'Registra tu viaje de lectura, analiza por género, descubre autores por nacionalidad y agrupa libros a tu manera',
    addFirstBook: 'Añade tu Primer Libro',
    loadDemo: 'Cargar Datos de Prueba',
  },
  filters: {
    allGenres: 'Todos los Géneros',
    allNationalities: 'Todas las Nacionalidades',
    clearFilters: 'Limpiar Filtros',
  },
};

// Translations object
const translations: Record<Language, TranslationStructure> = {
  en,
  es,
};

// Language options for selector
export const languageOptions = [
  { code: 'en' as Language, label: 'English', flag: '🇬🇧' },
  { code: 'es' as Language, label: 'Español', flag: '🇪🇸' },
];

// Context interface
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationStructure;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'app_language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Try to get from localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Language;
      if (stored && translations[stored]) {
        return stored;
      }
    } catch (e) {
      console.warn('Could not access localStorage:', e);
    }
    
    // Try to detect browser language
    const browserLang = navigator.language.split('-')[0] as Language;
    if (translations[browserLang]) {
      return browserLang;
    }
    
    // Default to English
    return 'en';
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    if (translations[lang]) {
      setLanguageState(lang);
    }
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: translations[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Export types for use in other files
export type { Language, TranslationStructure };