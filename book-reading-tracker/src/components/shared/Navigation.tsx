// src/components/shared/Navigation.tsx
import { List, BarChart3, Users, Tag, Globe } from 'lucide-react';
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
];

export function Navigation({ activeView, onViewChange }: NavigationProps) {
  const { t } = useLanguage();

  return (
    <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <nav className="flex gap-2">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`px-4 py-3 border-b-2 transition-all font-medium capitalize flex items-center gap-2 ${
                  activeView === item.id
                    ? 'border-amber-600 text-amber-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50/50'
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


