// src/components/shared/Filters.tsx
import { Star, StarOff } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface FiltersProps {
  selectedGenre: string | null;
  selectedNationality: string | null;
  excludeUnrated: boolean;
  onGenreChange: (genre: string | null) => void;
  onNationalityChange: (nationality: string | null) => void;
  onExcludeUnratedChange: (exclude: boolean) => void;
  availableGenres: string[];
  availableNationalities: string[];
}

export function Filters({
  selectedGenre,
  selectedNationality,
  excludeUnrated,
  onGenreChange,
  onNationalityChange,
  onExcludeUnratedChange,
  availableGenres,
  availableNationalities,
}: FiltersProps) {
  const { t } = useLanguage();

  return (
    <div className="bg-white/60 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex gap-3 flex-wrap items-center">
          <span className="text-sm font-medium text-gray-700">
            {t.common.filter}:
          </span>
          
          <select
            value={selectedGenre || ''}
            onChange={(e) => onGenreChange(e.target.value || null)}
            className="px-3 py-1.5 rounded-lg border-2 border-gray-200 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
          >
            <option value="">{t.filters.allGenres}</option>
            {availableGenres.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
          
          <select
            value={selectedNationality || ''}
            onChange={(e) => onNationalityChange(e.target.value || null)}
            className="px-3 py-1.5 rounded-lg border-2 border-gray-200 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
          >
            <option value="">{t.filters.allNationalities}</option>
            {availableNationalities.map(nat => (
              <option key={nat} value={nat}>{nat}</option>
            ))}
          </select>

          {/* Toggle para excluir libros sin calificación */}
          <button
            onClick={() => onExcludeUnratedChange(!excludeUnrated)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 text-sm font-medium transition-all ${
              excludeUnrated
                ? 'bg-amber-100 border-amber-400 text-amber-700'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
            title={excludeUnrated ? 'Mostrar libros sin calificación' : 'Excluir libros sin calificación'}
          >
            {excludeUnrated ? (
              <>
                <Star className="w-4 h-4 fill-amber-400" />
                Solo calificados
              </>
            ) : (
              <>
                <StarOff className="w-4 h-4" />
                Incluir sin calificar
              </>
            )}
          </button>
          
          {(selectedGenre || selectedNationality || excludeUnrated) && (
            <button
              onClick={() => {
                onGenreChange(null);
                onNationalityChange(null);
                onExcludeUnratedChange(false);
              }}
              className="text-sm text-amber-600 hover:text-amber-700 font-medium underline"
            >
              {t.filters.clearFilters}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}