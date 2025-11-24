// src/components/shared/Navigation.tsx - ACTUALIZADO
import { List, BarChart3, Users, Tag, Globe, Calendar } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface NavigationProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const navItems = [
  { id: 'overview', icon: BarChart3 },
  { id: 'books', icon: List },
  { id: 'authors', icon: Users },
  { id: 'genres', icon: Tag },
  { id: 'nationalities', icon: Globe },
  { id: 'yearly-stats', icon: Calendar },
];

export function Navigation({ activeView, onViewChange }: NavigationProps) {
  const { t } = useLanguage();

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <nav className="flex gap-2 overflow-x-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`px-4 py-3 border-b-2 transition-all font-medium capitalize flex items-center gap-2 whitespace-nowrap ${
                  activeView === item.id
                    ? 'border-amber-600 dark:border-amber-400 text-amber-600 dark:text-amber-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50/50 dark:hover:bg-gray-700/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.navigation[item.id as keyof typeof t.navigation]}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}