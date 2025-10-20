// src/components/welcome/WelcomeScreen.tsx
import { Book } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface WelcomeScreenProps {
  onAddFirst: () => void;
}

export function WelcomeScreen({ onAddFirst }: WelcomeScreenProps) {
  const { t } = useLanguage();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-12 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Book className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          {t.welcome.title}
        </h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          {t.welcome.description}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onAddFirst}
            className="px-8 py-3.5 bg-gradient-to-r from-amber-600 to-orange-700 text-white rounded-xl hover:from-amber-700 hover:to-orange-800 transition-all font-medium shadow-lg"
          >
            {t.welcome.addFirstBook}
          </button>
        </div>
      </div>
    </div>
  );
}
