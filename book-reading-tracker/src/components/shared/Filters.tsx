// src/components/shared/Filters.tsx
import { useLanguage } from '../../contexts/LanguageContext';

interface FiltersProps {
  selectedGenre: string | null;
  selectedNationality: string | null;
  onGenreChange: (genre: string | null) => void;
  onNationalityChange: (nationality: string | null) => void;
  availableGenres: string[];
  availableNationalities: string[];
}

export function Filters({
  selectedGenre,
  selectedNationality,
  onGenreChange,
  onNationalityChange,
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
            className="px-3 py-1.5 rounded-lg border-2 border-gray-200 text-sm"
          >
            <option value="">{t.filters.allGenres}</option>
            {availableGenres.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
          
          <select
            value={selectedNationality || ''}
            onChange={(e) => onNationalityChange(e.target.value || null)}
            className="px-3 py-1.5 rounded-lg border-2 border-gray-200 text-sm"
          >
            <option value="">{t.filters.allNationalities}</option>
            {availableNationalities.map(nat => (
              <option key={nat} value={nat}>{nat}</option>
            ))}
          </select>
          
          {(selectedGenre || selectedNationality) && (
            <button
              onClick={() => {
                onGenreChange(null);
                onNationalityChange(null);
              }}
              className="text-sm text-amber-600 hover:text-amber-700 font-medium"
            >
              {t.filters.clearFilters}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}