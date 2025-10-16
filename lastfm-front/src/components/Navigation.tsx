import { BarChart3, Trophy, Calendar } from 'lucide-react';

interface NavigationProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const navItems = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'ranking', label: 'All-Time Ranking', icon: Trophy },
  { id: 'timeline', label: 'Timeline', icon: Trophy },
  { id: 'years', label: 'By Year', icon: Calendar },
  { id: 'evolution', label: 'Evolution', icon: BarChart3 },
];

export const Navigation: React.FC<NavigationProps> = ({ activeView, onViewChange }) => (
  <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-16 z-40">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <nav className="flex gap-2">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`flex items-center gap-2 px-5 py-4 border-b-3 transition-all duration-300 relative ${
              activeView === item.id
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-black-600 hover:text-black-900 hover:bg-gray-50/50'
            }`}
          >
            <item.icon className={`w-4 h-4 transition-transform duration-300 ${activeView === item.id ? 'scale-110' : ''}`} />
            <span className="font-medium">{item.label}</span>
            {activeView === item.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-400 via-primary-600 to-primary-400"></div>
            )}
          </button>
        ))}
      </nav>
    </div>
  </div>
);