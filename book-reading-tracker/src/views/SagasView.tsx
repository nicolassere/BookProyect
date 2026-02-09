// src/views/SagasView.tsx
// View for displaying book sagas/series with influence rankings
import { useState, useMemo } from 'react';
import { Library, BookOpen, Star, TrendingUp, ChevronDown, ChevronUp, Crown, Users, Info, Zap } from 'lucide-react';
import { useBooks } from '../contexts/BookContext';
import { groupIntoSagas, calculateAllSagaInfluence, type Saga, type SagaInfluenceScore } from '../utils/sagaUtils';
import { getGenreWeight } from '../utils/influenceCalculator';

type ViewMode = 'all' | 'ranking';
type SortBy = 'pages' | 'books' | 'rating' | 'influence';

export function SagasView() {
  const { readings } = useBooks();
  const [viewMode, setViewMode] = useState<ViewMode>('ranking');
  const [sortBy, setSortBy] = useState<SortBy>('influence');
  const [expandedSaga, setExpandedSaga] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // Filter out academic books
  const nonAcademicBooks = useMemo(() => {
    return readings.filter(r => 
      r.readingType !== 'academic' && 
      r.readingType !== 'reference'
    );
  }, [readings]);

  // Group into sagas
  const { sagas, standalone } = useMemo(() => 
    groupIntoSagas(nonAcademicBooks), [nonAcademicBooks]);

  // Calculate saga influence scores
  const sagaInfluenceScores = useMemo(() => 
    calculateAllSagaInfluence(nonAcademicBooks), [nonAcademicBooks]);

  // Create a map for quick lookup
  const influenceMap = useMemo(() => {
    const map = new Map<string, SagaInfluenceScore>();
    sagaInfluenceScores.forEach(score => {
      map.set(score.saga.id, score);
    });
    return map;
  }, [sagaInfluenceScores]);

  // Sort sagas based on selected criteria
  const sortedSagas = useMemo(() => {
    const sorted = [...sagas];
    
    switch (sortBy) {
      case 'pages':
        return sorted.sort((a, b) => b.totalPages - a.totalPages);
      case 'books':
        return sorted.sort((a, b) => b.bookCount - a.bookCount);
      case 'rating':
        return sorted.sort((a, b) => b.avgRating - a.avgRating);
      case 'influence':
        return sorted.sort((a, b) => {
          const scoreA = influenceMap.get(a.id)?.normalizedScore || 0;
          const scoreB = influenceMap.get(b.id)?.normalizedScore || 0;
          return scoreB - scoreA;
        });
      default:
        return sorted;
    }
  }, [sagas, sortBy, influenceMap]);

  // Stats
  const stats = useMemo(() => ({
    totalSagas: sagas.length,
    totalBooksInSagas: sagas.reduce((sum, s) => sum + s.bookCount, 0),
    totalPagesInSagas: sagas.reduce((sum, s) => sum + s.totalPages, 0),
    standaloneCount: standalone.length,
    avgBooksPerSaga: sagas.length > 0 
      ? (sagas.reduce((sum, s) => sum + s.bookCount, 0) / sagas.length).toFixed(1)
      : '0',
  }), [sagas, standalone]);

  const getRankEmoji = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  const getRankColor = (index: number) => {
    if (index === 0) return 'from-yellow-400 to-amber-500';
    if (index === 1) return 'from-gray-300 to-gray-400';
    if (index === 2) return 'from-amber-600 to-orange-700';
    return 'from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-lg">
            <Library className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Sagas y Series
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tus colecciones de libros agrupadas
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="flex items-center gap-2 px-4 py-2 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/50 transition-all"
        >
          <Info className="w-4 h-4" />
          ¿Cómo funciona?
        </button>
      </div>

      {/* Explanation Panel */}
      {showExplanation && (
        <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-2xl p-6 border-2 border-violet-200 dark:border-violet-800">
          <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Library className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            Sistema de Sagas
          </h3>
          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <p>
              <strong>Detección automática:</strong> Los libros se agrupan por patrones en el título como 
              "Título (Serie #1)", "Serie: Título", o "Título Vol. 1".
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white mb-2">Para Influencia:</p>
                <ul className="space-y-1 text-xs">
                  <li>📚 Una saga cuenta como <strong>1 obra</strong> para el autor</li>
                  <li>📖 Pero suma <strong>todas las páginas</strong> ponderadas</li>
                  <li>⭐ Rating promedio de todos los libros</li>
                  <li>🏆 Bonus por completar series largas (+10% por libro)</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white mb-2">Bonus de Saga:</p>
                <ul className="space-y-1 text-xs">
                  <li>📕 2 libros = 1.1x</li>
                  <li>📗 3 libros = 1.2x</li>
                  <li>📘 4 libros = 1.3x</li>
                  <li>📙 5+ libros = hasta 1.5x</li>
                </ul>
                <p className="mt-2 text-gray-600 dark:text-gray-400 italic">
                  Leer una saga completa demuestra mayor compromiso e influencia.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 mb-1">
            <Library className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase">Sagas</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalSagas}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-1">
            <BookOpen className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase">En Sagas</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalBooksInSagas}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase">Páginas</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalPagesInSagas.toLocaleString()}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-1">
            <BookOpen className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase">Promedio</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgBooksPerSaga} libros</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
            <BookOpen className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase">Sueltos</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.standaloneCount}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        {/* View Mode */}
        <div className="flex gap-2 bg-white dark:bg-gray-800 rounded-xl p-1.5 shadow-sm border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setViewMode('ranking')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              viewMode === 'ranking'
                ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Crown className="w-4 h-4" />
            Ranking
          </button>
          <button
            onClick={() => setViewMode('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              viewMode === 'all'
                ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Library className="w-4 h-4" />
            Todas
          </button>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Ordenar:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            <option value="influence">Por Influencia</option>
            <option value="pages">Por Páginas</option>
            <option value="books">Por Cantidad de Libros</option>
            <option value="rating">Por Rating</option>
          </select>
        </div>
      </div>

      {/* Top 3 Podium (only in ranking mode) */}
      {viewMode === 'ranking' && sortedSagas.length >= 3 && (
        <div className="grid grid-cols-3 gap-4">
          {/* Second Place */}
          <div className="flex flex-col items-center justify-end">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-4 w-full text-center shadow-lg">
              <div className="text-4xl mb-2">🥈</div>
              <h3 className="font-bold text-gray-900 dark:text-white truncate text-sm">
                {sortedSagas[1].name}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                {sortedSagas[1].author}
              </p>
              <p className="text-xl font-bold text-gray-700 dark:text-gray-300 mt-1">
                {influenceMap.get(sortedSagas[1].id)?.normalizedScore || 0}
              </p>
              <p className="text-xs text-gray-500">
                {sortedSagas[1].bookCount} libros
              </p>
            </div>
            <div className="h-16 w-full bg-gradient-to-t from-gray-300 to-gray-200 dark:from-gray-600 dark:to-gray-700 rounded-b-lg" />
          </div>

          {/* First Place */}
          <div className="flex flex-col items-center justify-end">
            <div className="bg-gradient-to-br from-violet-100 to-purple-200 dark:from-violet-900/30 dark:to-purple-900/30 rounded-2xl p-6 w-full text-center shadow-xl border-2 border-violet-300 dark:border-violet-700">
              <div className="text-5xl mb-2">🥇</div>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg truncate">
                {sortedSagas[0].name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {sortedSagas[0].author}
              </p>
              <p className="text-3xl font-bold text-violet-600 dark:text-violet-400 mt-1">
                {influenceMap.get(sortedSagas[0].id)?.normalizedScore || 0}
              </p>
              <p className="text-sm text-gray-500">
                {sortedSagas[0].bookCount} libros • {sortedSagas[0].totalPages.toLocaleString()} pgs
              </p>
            </div>
            <div className="h-24 w-full bg-gradient-to-t from-violet-400 to-purple-300 dark:from-violet-700 dark:to-purple-600 rounded-b-lg" />
          </div>

          {/* Third Place */}
          <div className="flex flex-col items-center justify-end">
            <div className="bg-gradient-to-br from-orange-100 to-amber-200 dark:from-orange-900/30 dark:to-amber-900/30 rounded-2xl p-4 w-full text-center shadow-lg">
              <div className="text-4xl mb-2">🥉</div>
              <h3 className="font-bold text-gray-900 dark:text-white truncate text-sm">
                {sortedSagas[2].name}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                {sortedSagas[2].author}
              </p>
              <p className="text-xl font-bold text-orange-700 dark:text-orange-400 mt-1">
                {influenceMap.get(sortedSagas[2].id)?.normalizedScore || 0}
              </p>
              <p className="text-xs text-gray-500">
                {sortedSagas[2].bookCount} libros
              </p>
            </div>
            <div className="h-12 w-full bg-gradient-to-t from-orange-400 to-amber-300 dark:from-orange-700 dark:to-amber-600 rounded-b-lg" />
          </div>
        </div>
      )}

      {/* Sagas List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Library className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            {viewMode === 'ranking' ? 'Ranking de Sagas' : 'Todas las Sagas'} ({sortedSagas.length})
          </h3>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {sortedSagas.map((saga, index) => {
            const isExpanded = expandedSaga === saga.id;
            const influenceScore = influenceMap.get(saga.id);
            
            return (
              <div key={saga.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all">
                <div 
                  className="p-4 flex items-center gap-4 cursor-pointer"
                  onClick={() => setExpandedSaga(isExpanded ? null : saga.id)}
                >
                  {/* Rank Badge (in ranking mode) */}
                  {viewMode === 'ranking' && (
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getRankColor(index)} flex items-center justify-center shadow-md flex-shrink-0`}>
                      <span className={`font-bold ${index < 3 ? 'text-lg' : 'text-sm text-gray-700 dark:text-gray-300'}`}>
                        {getRankEmoji(index)}
                      </span>
                    </div>
                  )}

                  {/* Saga Icon */}
                  <div className="w-14 h-20 bg-gradient-to-br from-violet-400 to-purple-500 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                    <div className="text-white text-center">
                      <Library className="w-6 h-6 mx-auto" />
                      <span className="text-xs font-bold">{saga.bookCount}</span>
                    </div>
                  </div>

                  {/* Saga Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 dark:text-white truncate">
                      {saga.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <Users className="w-3 h-3" />
                      {saga.author} • {saga.nationality}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-full">
                        {saga.bookCount} libros
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                        {saga.totalPages.toLocaleString()} pgs
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        saga.avgGenreWeight > 1.2 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                          : saga.avgGenreWeight < 1 
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}>
                        {saga.primaryGenre} ({saga.avgGenreWeight.toFixed(1)}x)
                      </span>
                      {saga.avgRating > 0 && (
                        <span className="text-xs flex items-center gap-0.5">
                          {saga.avgRating.toFixed(1)}
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Influence Score */}
                  {influenceScore && (
                    <div className="text-right flex-shrink-0">
                      <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                        {influenceScore.normalizedScore}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">puntos</p>
                    </div>
                  )}

                  {/* Progress Bar */}
                  {influenceScore && (
                    <div className="w-24 hidden lg:block flex-shrink-0">
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-violet-400 to-purple-500 rounded-full transition-all duration-500"
                          style={{ width: `${influenceScore.normalizedScore}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Expand Icon */}
                  <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 bg-gray-50 dark:bg-gray-900/50">
                    {/* Influence Breakdown */}
                    {influenceScore && (
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Páginas</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {influenceScore.breakdown.totalPages.toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Pgs Ponderadas</p>
                          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            {influenceScore.breakdown.weightedPages.toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Bonus Rating</p>
                          <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                            {influenceScore.breakdown.ratingBonus.toFixed(2)}x
                          </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Bonus Completitud</p>
                          <p className="text-lg font-bold text-green-600 dark:text-green-400">
                            {influenceScore.breakdown.completionBonus.toFixed(2)}x
                          </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Bonus Longitud</p>
                          <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                            {influenceScore.breakdown.lengthBonus.toFixed(2)}x
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Books in Saga */}
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-3">
                        Libros en esta saga ({saga.books.length})
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {saga.books.map((book, bookIdx) => {
                          const genreWeight = getGenreWeight(book.genre);
                          
                          return (
                            <div 
                              key={book.id}
                              className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                            >
                              <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center text-violet-700 dark:text-violet-300 font-bold text-sm flex-shrink-0">
                                {bookIdx + 1}
                              </div>
                              {book.coverUrl ? (
                                <img src={book.coverUrl} alt="" className="w-10 h-14 object-cover rounded shadow" />
                              ) : (
                                <div className="w-10 h-14 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                                  <BookOpen className="w-5 h-5 text-gray-400" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {book.title}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {book.pages} pgs 
                                  {book.yearPublished && ` • ${book.yearPublished}`}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  {book.rating != null && book.rating > 0 && (
                                    <span className="text-xs flex items-center gap-0.5">
                                      {book.rating}<Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                    </span>
                                  )}
                                  <span className={`text-xs ${genreWeight > 1 ? 'text-green-600' : genreWeight < 1 ? 'text-red-500' : 'text-gray-500'}`}>
                                    {genreWeight}x
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Year Range */}
                    {(saga.startYear || saga.endYear) && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                        Publicación: {saga.startYear || '?'} - {saga.endYear || '?'}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {sortedSagas.length === 0 && (
        <div className="text-center py-12">
          <Library className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400 mb-2">No se detectaron sagas</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Las sagas se detectan automáticamente por patrones en los títulos como "Título (Serie #1)"
          </p>
        </div>
      )}
    </div>
  );
}
