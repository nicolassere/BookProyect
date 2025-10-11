import { Upload, Music } from 'lucide-react';

interface HeaderProps {
  onUpload: () => void;
  onDemo: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onUpload, onDemo }) => (
  <header className="bg-white-800/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-md transform hover:scale-105 transition-transform duration-300">
            <Music className="w-6 h-6 text-gray-800" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Last.fm Analytics</h1>
            <p className="text-xs text-gray-500 font-medium">Professional Dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onUpload}
            className="flex items-center gap-2 px-5 py-2.5 border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 font-medium transform hover:-translate-y-0.5"
          >
            <Upload className="w-4 h-4" />
            Import Data
          </button>
          <button
            onClick={onDemo}
            className="flex items-center gap-2 px-5 py-2.5 border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 font-medium transform hover:-translate-y-0.5"
          >
            Load Demo
          </button>
        </div>
      </div>
    </div>
  </header>
);