// src/components/ThemeToggle.tsx
import { Moon, Sun } from 'lucide-react';
import { memo } from 'react';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
}

export const ThemeToggle = memo<ThemeToggleProps>(({ theme, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="relative w-14 h-7 bg-gray-200 dark:bg-gray-700 rounded-full p-1 transition-all duration-300 hover:scale-105"
      aria-label="Toggle theme"
    >
      <div
        className={`absolute top-1 w-5 h-5 bg-white dark:bg-gray-900 rounded-full shadow-md transition-all duration-300 flex items-center justify-center ${
          theme === 'dark' ? 'left-7' : 'left-1'
        }`}
      >
        {theme === 'dark' ? (
          <Moon className="w-3 h-3 text-purple-500" />
        ) : (
          <Sun className="w-3 h-3 text-yellow-500" />
        )}
      </div>
    </button>
  );
});

ThemeToggle.displayName = 'ThemeToggle';