import { Upload, Music } from 'lucide-react';

interface HeaderProps {
  onUpload: () => void;
  onDemo: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onUpload, onDemo }) => (
  <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
            <Music className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Last.fm Analytics</h1>
            <p className="text-xs text-gray-500">Professional Dashboard</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={onUpload}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Upload className="w-4 h-4" />
            Import Data
          </button>
          <button
            onClick={onDemo}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Load Demo
          </button>
        </div>
      </div>
    </div>
  </header>
);