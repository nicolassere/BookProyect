import { Upload, Music } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { VinylRecord } from './VinylRecord';

interface HeaderProps {
  onUpload: () => void;
  onDemo: () => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onUpload, onDemo, theme, onThemeToggle }) => (
  <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-md transform hover:scale-105 transition-transform duration-300 animate-float">
              <Music className="w-6 h-6 text-white" />
            </div>
            {/* Pulse ring */}
            <div className="absolute inset-0 rounded-xl bg-primary-600 opacity-20 animate-ping" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
              Last.fm Analytics
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Professional Dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle theme={theme} onToggle={onThemeToggle} />
          
          <button
            onClick={onUpload}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-300 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Import Data</span>
          </button>
          <button
            onClick={onDemo}
            className="flex items-center gap-2 px-5 py-2.5 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-300 font-medium transform hover:-translate-y-0.5"
          >
            <span className="hidden sm:inline">Load Demo</span>
            <span className="sm:hidden">Demo</span>
          </button>
        </div>
      </div>
    </div>
  </header>
);