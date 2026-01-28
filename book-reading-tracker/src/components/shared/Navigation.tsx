// src/components/shared/Navigation.tsx - UPDATED with new views
import { List, BarChart3, Users, Tag, Globe, Calendar, Trophy, Scale, Library } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface NavigationProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const navItems = [
  { id: 'overview', icon: BarChart3, labelKey: 'overview' },
  { id: 'books', icon: List, labelKey: 'books' },
  { id: 'authors', icon: Users, labelKey: 'authors' },
  { id: 'genres', icon: Tag, labelKey: 'genres' },
  { id: 'nationalities', icon: Globe, labelKey: 'nationalities' },
  { id: 'sagas', icon: Library, labelKey: 'sagas' },
  { id: 'yearly-stats', icon: Calendar, labelKey: 'yearly-stats' },
  { id: 'publication-years', icon: Calendar, labelKey: 'publication-years' },
  { id: 'hall-of-fame', icon: Trophy, labelKey: 'hall-of-fame' },
  { id: 'comparator', icon: Scale, labelKey: 'comparator' },
];

// Extended labels for new views
const extendedLabels: Record<string, Record<string, string>> = {
  en: {
    overview: 'Overview',
    books: 'Books',
    authors: 'Authors',
    genres: 'Genres',
    nationalities: 'Nationalities',
    sagas: 'Sagas',
    'yearly-stats': 'Yearly Stats',
    'publication-years': 'By Year Published',
    'hall-of-fame': 'Hall of Fame',
    comparator: 'Compare',
  },
  es: {
    overview: 'Resumen',
    books: 'Libros',
    authors: 'Autores',
    genres: 'Géneros',
    nationalities: 'Nacionalidades',
    sagas: 'Sagas',
    'yearly-stats': 'Por Año',
    'publication-years': 'Año Publicación',
    'hall-of-fame': 'Hall of Fame',
    comparator: 'Comparar',
  },
};

export function Navigation({ activeView, onViewChange }: NavigationProps) {
  const { t, language } = useLanguage();

  const getLabel = (key: string) => {
    // Try to get from extended labels first
    return extendedLabels[language]?.[key] || extendedLabels['es'][key] || key;
  };

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <nav className="flex gap-1 overflow-x-auto py-1 scrollbar-hide">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            // Highlight new features
            const isNewFeature = ['hall-of-fame', 'comparator', 'sagas'].includes(item.id);
            
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`px-3 py-2.5 border-b-2 transition-all font-medium capitalize flex items-center gap-1.5 whitespace-nowrap text-sm relative ${
                  isActive
                    ? 'border-amber-600 dark:border-amber-400 text-amber-600 dark:text-amber-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50/50 dark:hover:bg-gray-700/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {getLabel(item.labelKey)}
                {isNewFeature && !isActive && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
