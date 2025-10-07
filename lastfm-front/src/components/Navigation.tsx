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
];

export const Navigation: React.FC<NavigationProps> = ({ activeView, onViewChange }) => (
  <div className="bg-white border-b border-gray-200">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <nav className="flex gap-8">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-colors ${
              activeView === item.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <item.icon className="w-4 h-4" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  </div>
);