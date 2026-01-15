// src/views/InfluenceRankingView.tsx
// Shows authors, countries, and genres ranked by "influence" score
import { useState, useMemo } from 'react';
import { Crown, Users, Globe, Tag, TrendingUp, Star, BookOpen, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { useBooks } from '../contexts/BookContext';
import { 
  calculateAuthorInfluence, 
  calculateCountryInfluence, 
  calculateGenreInfluence,
  getInfluenceExplanation,
  GENRE_WEIGHTS,
  type InfluenceScore 
} from '../utils/influenceCalculator';

type ViewMode = 'authors' | 'countries' | 'genres';

export function InfluenceRankingView() {
  const { readings } = useBooks();
  const [viewMode, setViewMode] = useState<ViewMode>('authors');
  const [showExplanation, setShowExplanation] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  // Filter out academic books for influence calculation
  const nonAcademicBooks = useMemo(() => {
    return readings.filter(r => 
      r.readingType !== 'academic' && 
      r.readingType !== 'reference'
    );
  }, [readings]);

  // Calculate influence scores
  const authorScores = useMemo(() => 
    calculateAuthorInfluence(nonAcademicBooks), [nonAcademicBooks]);
  
  const countryScores = useMemo(() => 
    calculateCountryInfluence(nonAcademicBooks), [nonAcademicBooks]);
  
  const genreScores = useMemo(() => 
    calculateGenreInfluence(nonAcademicBooks), [nonAcademicBooks]);

  const currentScores = viewMode === 'authors' 
    ? authorScores 
    : viewMode === 'countries' 
      ? countryScores 
      : genreScores;

  const getIcon = () => {
    switch (viewMode) {
      case 'authors': return <Users className="w-6 h-6" />;
      case 'countries': return <Globe className="w-6 h-6" />;
      case 'genres': return <Tag className="w-6 h-6" />;
    }
  };

  const getTitle = () => {
    switch (viewMode) {
      case 'authors': return 'Autores';
      case 'countries': return 'Países';
      case 'genres': return 'Géneros';
    }
  };

  const getRankColor = (index: number) => {
    if (index === 0) return 'from-yellow-400 to-amber-500'; // Gold
    if (index === 1) return 'from-gray-300 to-gray-400'; // Silver
    if (index === 2) return 'from-amber-600 to-orange-700'; // Bronze
    return 'from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700';
  };

  const getRankEmoji = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl shadow-lg">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Ranking de Influencia
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ¿Quién ha moldeado tu pensamiento?
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all"
        >
          <Info className="w-4 h-4" />
          ¿Cómo se calcula?
        </button>
      </div>

      {/* Explanation Panel */}
      {showExplanation && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-800">
          <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Fórmula de Influencia
          </h3>
          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <p>
              <strong>Score = Páginas Ponderadas × Rating × Diversidad × Favoritos</strong>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white mb-2">Peso por Género:</p>
                <ul className="space-y-1 text-xs">
                  <li>🔴 <strong>1.5x:</strong> Filosofía, Clásicos, Historia</li>
                  <li>🟠 <strong>1.3x:</strong> Ciencia, Psicología, Biografía</li>
                  <li>🟡 <strong>1.2x:</strong> Ficción Literaria, Poesía, Ensayo</li>
                  <li>🟢 <strong>1.0x:</strong> Ficción, Thriller, Fantasía, Sci-Fi</li>
                  <li>🔵 <strong>0.8x:</strong> Romance, YA, Deportes, Autoayuda</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white mb-2">Otros Factores:</p>
                <ul className="space-y-1 text-xs">
                  <li>⭐ <strong>Rating:</strong> 5★ = 1.5x, 4★ = 1.2x, 3★ = 1.0x</li>
                  <li>📚 <strong>Diversidad:</strong> +5% por género diferente (max 20%)</li>
                  <li>❤️ <strong>Favoritos:</strong> +10% por cada libro favorito/5★</li>
                </ul>
                <p className="mt-3 text-gray-600 dark:text-gray-400 italic">
                  La idea: 500 páginas de filosofía con rating 5 influyen más que 500 de deportes con rating 3.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Mode Selector */}
      <div className="flex gap-2 bg-white dark:bg-gray-800 rounded-xl p-1.5 shadow-sm border border-gray-200 dark:border-gray-700 w-fit">
        <button
          onClick={() => setViewMode('authors')}
          className={`px-5 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
            viewMode === 'authors'
              ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-md'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <Users className="w-4 h-4" />
          Autores
        </button>
        <button
          onClick={() => setViewMode('countries')}
          className={`px-5 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
            viewMode === 'countries'
              ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-md'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <Globe className="w-4 h-4" />
          Países
        </button>
        <button
          onClick={() => setViewMode('genres')}
          className={`px-5 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
            viewMode === 'genres'
              ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-md'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <Tag className="w-4 h-4" />
          Géneros
        </button>
      </div>

      {/* Top 3 Podium */}
      {currentScores.length >= 3 && (
        <div className="grid grid-cols-3 gap-4">
          {/* Second Place */}
          <div className="flex flex-col items-center justify-end">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-4 w-full text-center shadow-lg">
              <div className="text-4xl mb-2">🥈</div>
              <h3 className="font-bold text-gray-900 dark:text-white truncate">
                {currentScores[1].name}
              </h3>
              <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                {currentScores[1].normalizedScore}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {currentScores[1].breakdown.booksCount} libros
              </p>
            </div>
            <div className="h-16 w-full bg-gradient-to-t from-gray-300 to-gray-200 dark:from-gray-600 dark:to-gray-700 rounded-b-lg" />
          </div>

          {/* First Place */}
          <div className="flex flex-col items-center justify-end">
            <div className="bg-gradient-to-br from-yellow-100 to-amber-200 dark:from-yellow-900/30 dark:to-amber-900/30 rounded-2xl p-6 w-full text-center shadow-xl border-2 border-yellow-300 dark:border-yellow-700">
              <div className="text-5xl mb-2">🥇</div>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg truncate">
                {currentScores[0].name}
              </h3>
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                {currentScores[0].normalizedScore}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {currentScores[0].breakdown.booksCount} libros • {currentScores[0].breakdown.totalPages.toLocaleString()} pgs
              </p>
            </div>
            <div className="h-24 w-full bg-gradient-to-t from-yellow-400 to-amber-300 dark:from-yellow-700 dark:to-amber-600 rounded-b-lg" />
          </div>

          {/* Third Place */}
          <div className="flex flex-col items-center justify-end">
            <div className="bg-gradient-to-br from-orange-100 to-amber-200 dark:from-orange-900/30 dark:to-amber-900/30 rounded-2xl p-4 w-full text-center shadow-lg">
              <div className="text-4xl mb-2">🥉</div>
              <h3 className="font-bold text-gray-900 dark:text-white truncate">
                {currentScores[2].name}
              </h3>
              <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">
                {currentScores[2].normalizedScore}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {currentScores[2].breakdown.booksCount} libros
              </p>
            </div>
            <div className="h-12 w-full bg-gradient-to-t from-orange-400 to-amber-300 dark:from-orange-700 dark:to-amber-600 rounded-b-lg" />
          </div>
        </div>
      )}

      {/* Full Ranking List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            {getIcon()}
            Ranking Completo de {getTitle()}
          </h3>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {currentScores.map((score, index) => {
            const isExpanded = expandedItem === score.name;
            
            return (
              <div key={score.name} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all">
                <div 
                  className="p-4 flex items-center gap-4 cursor-pointer"
                  onClick={() => setExpandedItem(isExpanded ? null : score.name)}
                >
                  {/* Rank Badge */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getRankColor(index)} flex items-center justify-center shadow-md`}>
                    <span className={`font-bold ${index < 3 ? 'text-lg' : 'text-sm text-gray-700 dark:text-gray-300'}`}>
                      {getRankEmoji(index)}
                    </span>
                  </div>

                  {/* Name and Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 dark:text-white truncate">
                      {score.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {getInfluenceExplanation(score)}
                    </p>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {score.normalizedScore}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">puntos</p>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-32 hidden md:block">
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${score.normalizedScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Expand Icon */}
                  <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 bg-gray-50 dark:bg-gray-900/50">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Libros</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          {score.breakdown.booksCount}
                        </p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Páginas</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          {score.breakdown.totalPages.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Pgs Ponderadas</p>
                        <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                          {score.breakdown.weightedPages.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Rating Promedio</p>
                        <p className="text-xl font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          {score.breakdown.avgRating.toFixed(1)}
                          <Star className="w-4 h-4 fill-amber-400" />
                        </p>
                      </div>
                    </div>

                    {/* Top Genres */}
                    {score.topGenres.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-2">Géneros</p>
                        <div className="flex flex-wrap gap-2">
                          {score.topGenres.map(g => (
                            <span 
                              key={g.genre}
                              className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
                            >
                              {g.genre} ({g.count}) 
                              <span className={`ml-1 ${g.weight > 1.2 ? 'text-green-600' : g.weight < 1 ? 'text-red-500' : 'text-gray-500'}`}>
                                {g.weight}x
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Books List */}
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-2">Libros leídos</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                        {score.books.slice(0, 10).map(book => (
                          <div 
                            key={book.id}
                            className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg"
                          >
                            {book.coverUrl ? (
                              <img src={book.coverUrl} alt="" className="w-8 h-12 object-cover rounded" />
                            ) : (
                              <div className="w-8 h-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                                <BookOpen className="w-4 h-4 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {book.title}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {book.pages} pgs • {book.genre}
                                {book.rating && ` • ${book.rating}⭐`}
                              </p>
                            </div>
                          </div>
                        ))}
                        {score.books.length > 10 && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 p-2">
                            +{score.books.length - 10} libros más...
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {currentScores.length === 0 && (
        <div className="text-center py-12">
          <Crown className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400">No hay datos suficientes para calcular influencia</p>
        </div>
      )}
    </div>
  );
}