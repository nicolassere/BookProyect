// src/views/HallOfFameView.tsx
// A spectacular, Oscar-night themed Hall of Fame for your books
import { useState, useMemo, useEffect } from 'react';
import { 
  Trophy, Star, Crown, Award, Medal, Sparkles, Plus, X, Search, 
  ChevronUp, ChevronDown, GripVertical, Calendar, BookOpen, Users,
  Edit3, Trash2, Check, Heart
} from 'lucide-react';
import { useBooks } from '../contexts/BookContext';
import { 
  AVAILABLE_BADGES, 
  SUGGESTED_CATEGORIES,
  type HallOfFameData,
  type Badge,
  type CustomCategory,
  type CustomRanking,
  type AnnualAward,
} from '../types/hallOfFame';
import {
  loadHallOfFame,
  saveHallOfFame,
  assignBadge,
  removeBadge,
  getBookBadges,
  createCategory,
  deleteCategory,
  nominateBook,
  removeNomination,
  setWinner,
  getCategoryNominees,
  getCategoryWinner,
  setAnnualAward,
  getAnnualAwards,
  createRanking,
  updateRanking,
  deleteRanking,
  addToRanking,
  removeFromRanking,
} from '../utils/hallOfFameStorage';
import type { Reading } from '../types';

type TabType = 'awards' | 'badges' | 'rankings' | 'annual';

// Spotlight animation component
function Spotlight() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 left-1/4 w-96 h-96 bg-gradient-to-b from-yellow-400/20 via-amber-300/10 to-transparent rounded-full blur-3xl animate-pulse" />
      <div className="absolute -top-40 right-1/4 w-96 h-96 bg-gradient-to-b from-yellow-400/20 via-amber-300/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-40 bg-gradient-to-b from-yellow-400/40 to-transparent" />
    </div>
  );
}

// Animated trophy component
function AnimatedTrophy({ size = 'lg' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };
  
  return (
    <div className={`${sizeClasses[size]} relative`}>
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 rounded-full blur-xl opacity-60 animate-pulse" />
      <Trophy className={`${sizeClasses[size]} text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)] relative z-10 animate-bounce`} style={{ animationDuration: '2s' }} />
    </div>
  );
}

// Gold card with glass effect
function GoldCard({ children, className = '', glow = false }: { children: React.ReactNode; className?: string; glow?: boolean }) {
  return (
    <div className={`
      relative overflow-hidden rounded-2xl
      bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95
      border border-yellow-500/30
      backdrop-blur-xl
      ${glow ? 'shadow-[0_0_40px_rgba(250,204,21,0.15)]' : 'shadow-xl'}
      ${className}
    `}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/5 to-transparent -translate-x-full animate-shimmer" />
      {children}
    </div>
  );
}

// Book search modal
function BookSearchModal({ 
  onSelect, 
  onClose, 
  readings,
  excludeIds = [],
  title = 'Select a Book'
}: { 
  onSelect: (book: Reading) => void;
  onClose: () => void;
  readings: Reading[];
  excludeIds?: string[];
  title?: string;
}) {
  const [search, setSearch] = useState('');
  
  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    return readings
      .filter(r => !excludeIds.includes(r.id))
      .filter(r => 
        r.title.toLowerCase().includes(query) ||
        r.author.toLowerCase().includes(query)
      )
      .slice(0, 20);
  }, [readings, search, excludeIds]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <GoldCard className="w-full max-w-lg" glow>
        <div className="p-6 border-b border-yellow-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-yellow-400 font-serif">{title}</h3>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-all">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-yellow-500/50" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or author..."
              className="w-full pl-12 pr-4 py-3 bg-black/50 border-2 border-yellow-500/30 rounded-xl text-white placeholder-gray-500 focus:border-yellow-400 focus:outline-none transition-all"
              autoFocus
            />
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto p-2">
          {filtered.length > 0 ? filtered.map(book => (
            <button
              key={book.id}
              onClick={() => onSelect(book)}
              className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-yellow-500/10 transition-all text-left group"
            >
              {book.coverUrl ? (
                <img src={book.coverUrl} alt="" className="w-12 h-16 object-cover rounded-lg shadow-lg" />
              ) : (
                <div className="w-12 h-16 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-gray-500" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate group-hover:text-yellow-400 transition-colors">{book.title}</p>
                <p className="text-sm text-gray-400">{book.author}</p>
              </div>
              {book.rating && (
                <div className="flex gap-0.5">
                  {[...Array(book.rating)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              )}
            </button>
          )) : (
            <p className="text-center py-8 text-gray-500">No books found</p>
          )}
        </div>
      </GoldCard>
    </div>
  );
}

// Winner display component
function WinnerCard({ book, categoryName, emoji }: { book: Reading; categoryName: string; emoji: string }) {
  return (
    <div className="relative group">
      <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400/20 via-amber-500/20 to-yellow-400/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
      
      <GoldCard className="relative" glow>
        <div className="p-6">
          <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(250,204,21,0.4)] animate-pulse">
            <Trophy className="w-8 h-8 text-black" />
          </div>
          
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">{emoji}</span>
            <span className="text-sm font-semibold text-yellow-400/80 uppercase tracking-wider">{categoryName}</span>
          </div>
          
          <div className="flex gap-4">
            {book.coverUrl ? (
              <img 
                src={book.coverUrl} 
                alt={book.title}
                className="w-20 h-28 object-cover rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.5)] border-2 border-yellow-500/30"
              />
            ) : (
              <div className="w-20 h-28 bg-gradient-to-br from-yellow-900/50 to-amber-900/50 rounded-lg flex items-center justify-center border-2 border-yellow-500/30">
                <BookOpen className="w-8 h-8 text-yellow-500/50" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-white text-lg leading-tight mb-1 font-serif">{book.title}</h4>
              <p className="text-yellow-400/80 text-sm">{book.author}</p>
              {book.rating && (
                <div className="flex gap-1 mt-2">
                  {[...Array(book.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </GoldCard>
    </div>
  );
}

// Main component
export function HallOfFameView() {
  const { readings } = useBooks();
  const [activeTab, setActiveTab] = useState<TabType>('awards');
  const [hofData, setHofData] = useState<HallOfFameData>(() => loadHallOfFame());
  const [showBookSearch, setShowBookSearch] = useState(false);
  const [searchContext, setSearchContext] = useState<{
    type: 'badge' | 'category' | 'ranking' | 'annual';
    id?: string;
    badgeId?: string;
    year?: number;
    awardType?: AnnualAward['type'];
  } | null>(null);
  
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryEmoji, setNewCategoryEmoji] = useState('🏆');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');
  
  const [showCreateRanking, setShowCreateRanking] = useState(false);
  const [newRankingName, setNewRankingName] = useState('');
  const [newRankingEmoji, setNewRankingEmoji] = useState('📊');
  const [newRankingDesc, setNewRankingDesc] = useState('');

  useEffect(() => {
    saveHallOfFame(hofData);
  }, [hofData]);

  const eligibleBooks = useMemo(() => {
    return readings.filter(r => r.readingType !== 'academic' && r.readingType !== 'reference');
  }, [readings]);

  const getBook = (id: string) => readings.find(r => r.id === id);

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    readings.forEach(r => {
      if (r.parsedDate) {
        years.add(r.parsedDate.getFullYear());
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [readings]);

  const handleBookSelect = (book: Reading) => {
    if (!searchContext) return;

    if (searchContext.type === 'badge' && searchContext.badgeId) {
      setHofData(prev => assignBadge(prev, book.id, searchContext.badgeId!));
    } else if (searchContext.type === 'category' && searchContext.id) {
      setHofData(prev => nominateBook(prev, searchContext.id!, book.id));
    } else if (searchContext.type === 'ranking' && searchContext.id) {
      setHofData(prev => addToRanking(prev, searchContext.id!, book.id));
    } else if (searchContext.type === 'annual' && searchContext.year && searchContext.awardType) {
      setHofData(prev => setAnnualAward(prev, searchContext.year!, searchContext.awardType!, book.id));
    }

    setShowBookSearch(false);
    setSearchContext(null);
  };

  const handleCreateCategory = () => {
    if (newCategoryName.trim()) {
      setHofData(prev => createCategory(prev, newCategoryName.trim(), newCategoryEmoji, newCategoryDesc.trim()));
      setNewCategoryName('');
      setNewCategoryEmoji('🏆');
      setNewCategoryDesc('');
      setShowCreateCategory(false);
    }
  };

  const handleCreateRanking = () => {
    if (newRankingName.trim()) {
      setHofData(prev => createRanking(prev, newRankingName.trim(), newRankingEmoji, newRankingDesc.trim()));
      setNewRankingName('');
      setNewRankingEmoji('📊');
      setNewRankingDesc('');
      setShowCreateRanking(false);
    }
  };

  const getBookBadgesList = (bookId: string) => {
    const badgeIds = getBookBadges(hofData, bookId);
    return AVAILABLE_BADGES.filter(b => badgeIds.includes(b.id));
  };

  const stats = useMemo(() => ({
    totalAwards: hofData.categories.length,
    totalBadges: hofData.badges.length,
    totalRankings: hofData.rankings.length,
    booksWithBadges: new Set(hofData.badges.map(b => b.bookId)).size,
  }), [hofData]);

  return (
    <div className="min-h-screen relative">
      {/* Dramatic background */}
      <div className="fixed inset-0 bg-gradient-to-b from-black via-gray-900 to-black -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-900/20 via-transparent to-transparent -z-10" />
      <Spotlight />
      
      <div className="fixed inset-0 opacity-[0.015] -z-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />

      <div className="relative space-y-8 pb-12">
        {/* Header */}
        <div className="text-center pt-8 pb-4">
          <div className="flex justify-center mb-4">
            <AnimatedTrophy size="lg" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent font-serif tracking-tight">
            Hall of Fame
          </h1>
          <p className="text-yellow-500/60 mt-2 text-lg">Your personal book awards ceremony</p>
          
          <div className="flex justify-center gap-8 mt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-400">{stats.totalAwards}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Categories</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-400">{stats.booksWithBadges}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Honored Books</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-400">{stats.totalRankings}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Rankings</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center">
          <div className="inline-flex bg-black/50 backdrop-blur-xl rounded-2xl p-2 border border-yellow-500/20">
            {[
              { id: 'awards', label: 'Custom Awards', icon: Trophy },
              { id: 'badges', label: 'Badges', icon: Medal },
              { id: 'rankings', label: 'Rankings', icon: Crown },
              { id: 'annual', label: 'Annual Awards', icon: Calendar },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`
                    flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300
                    ${isActive 
                      ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-black shadow-[0_0_20px_rgba(250,204,21,0.3)]' 
                      : 'text-gray-400 hover:text-yellow-400'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-6xl mx-auto px-4">
          {/* AWARDS TAB */}
          {activeTab === 'awards' && (
            <div className="space-y-8">
              <div className="flex justify-center">
                <button
                  onClick={() => setShowCreateCategory(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 hover:from-yellow-500/30 hover:to-amber-500/30 border border-yellow-500/30 rounded-xl text-yellow-400 font-semibold transition-all hover:scale-105"
                >
                  <Plus className="w-5 h-5" />
                  Create New Award Category
                </button>
              </div>

              {hofData.categories.length === 0 && (
                <GoldCard className="p-6">
                  <h3 className="text-lg font-bold text-yellow-400 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Suggested Categories to Get Started
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {SUGGESTED_CATEGORIES.map((cat, i) => (
                      <button
                        key={i}
                        onClick={() => setHofData(prev => createCategory(prev, cat.name, cat.emoji, cat.description))}
                        className="p-4 bg-black/30 hover:bg-yellow-500/10 border border-gray-700 hover:border-yellow-500/50 rounded-xl transition-all text-left group"
                      >
                        <span className="text-2xl">{cat.emoji}</span>
                        <p className="text-sm font-semibold text-white mt-2 group-hover:text-yellow-400 transition-colors">{cat.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{cat.description}</p>
                      </button>
                    ))}
                  </div>
                </GoldCard>
              )}

              {hofData.categories.some(cat => getCategoryWinner(hofData, cat.id)) && (
                <div>
                  <h3 className="text-2xl font-bold text-yellow-400 mb-6 text-center font-serif flex items-center justify-center gap-3">
                    <Trophy className="w-6 h-6" />
                    Winners Circle
                    <Trophy className="w-6 h-6" />
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {hofData.categories.map(cat => {
                      const winnerId = getCategoryWinner(hofData, cat.id);
                      if (!winnerId) return null;
                      const book = getBook(winnerId);
                      if (!book) return null;
                      return (
                        <WinnerCard key={cat.id} book={book} categoryName={cat.name} emoji={cat.emoji} />
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {hofData.categories.map(category => {
                  const nominees = getCategoryNominees(hofData, category.id);
                  const winnerId = getCategoryWinner(hofData, category.id);
                  
                  return (
                    <GoldCard key={category.id} className="overflow-visible">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{category.emoji}</span>
                            <div>
                              <h3 className="text-xl font-bold text-white font-serif">{category.name}</h3>
                              <p className="text-sm text-gray-400">{category.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSearchContext({ type: 'category', id: category.id });
                                setShowBookSearch(true);
                              }}
                              className="p-2 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-lg transition-all"
                            >
                              <Plus className="w-5 h-5 text-yellow-400" />
                            </button>
                            <button
                              onClick={() => setHofData(prev => deleteCategory(prev, category.id))}
                              className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all"
                            >
                              <Trash2 className="w-5 h-5 text-red-400" />
                            </button>
                          </div>
                        </div>

                        {nominees.length > 0 ? (
                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {nominees.map(nom => {
                              const book = getBook(nom.bookId);
                              if (!book) return null;
                              const isWinner = nom.isWinner;
                              
                              return (
                                <div 
                                  key={nom.bookId}
                                  className={`relative group cursor-pointer transition-all duration-300 ${isWinner ? 'scale-105' : 'hover:scale-105'}`}
                                  onClick={() => setHofData(prev => setWinner(prev, category.id, nom.bookId))}
                                >
                                  {isWinner && (
                                    <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400/30 to-amber-500/30 rounded-2xl blur-lg" />
                                  )}
                                  
                                  <div className={`relative rounded-xl overflow-hidden border-2 transition-colors ${isWinner ? 'border-yellow-400' : 'border-transparent group-hover:border-yellow-500/50'}`}>
                                    {book.coverUrl ? (
                                      <img src={book.coverUrl} alt={book.title} className="w-full h-40 object-cover" />
                                    ) : (
                                      <div className="w-full h-40 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                                        <BookOpen className="w-10 h-10 text-gray-500" />
                                      </div>
                                    )}
                                    
                                    {isWinner && (
                                      <div className="absolute top-2 right-2 w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                                        <Trophy className="w-5 h-5 text-black" />
                                      </div>
                                    )}
                                    
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setHofData(prev => removeNomination(prev, category.id, nom.bookId));
                                      }}
                                      className="absolute top-2 left-2 w-8 h-8 bg-black/60 hover:bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                      <X className="w-4 h-4 text-white" />
                                    </button>
                                    
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent p-3">
                                      <p className="text-sm font-semibold text-white truncate">{book.title}</p>
                                      <p className="text-xs text-gray-400 truncate">{book.author}</p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-8 border-2 border-dashed border-gray-700 rounded-xl">
                            <Medal className="w-10 h-10 mx-auto mb-2 text-gray-600" />
                            <p className="text-gray-500">No nominees yet</p>
                            <button
                              onClick={() => {
                                setSearchContext({ type: 'category', id: category.id });
                                setShowBookSearch(true);
                              }}
                              className="mt-3 text-yellow-400 hover:text-yellow-300 text-sm font-semibold"
                            >
                              + Add first nominee
                            </button>
                          </div>
                        )}
                        
                        {nominees.length > 0 && !winnerId && (
                          <p className="text-center text-sm text-yellow-500/60 mt-4">
                            Click on a book to crown it as the winner
                          </p>
                        )}
                      </div>
                    </GoldCard>
                  );
                })}
              </div>
            </div>
          )}

          {/* BADGES TAB */}
          {activeTab === 'badges' && (
            <div className="space-y-8">
              <GoldCard className="p-6">
                <h3 className="text-xl font-bold text-yellow-400 mb-6 font-serif flex items-center gap-2">
                  <Medal className="w-6 h-6" />
                  Available Badges
                </h3>
                <p className="text-gray-400 mb-6">Click a badge, then select a book to honor</p>
                
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {AVAILABLE_BADGES.map(badge => (
                    <button
                      key={badge.id}
                      onClick={() => {
                        setSearchContext({ type: 'badge', badgeId: badge.id });
                        setShowBookSearch(true);
                      }}
                      className="p-4 bg-black/30 hover:bg-yellow-500/10 border border-gray-700 hover:border-yellow-500/50 rounded-xl transition-all text-center group"
                    >
                      <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">{badge.emoji}</div>
                      <p className="text-xs font-semibold text-gray-300 group-hover:text-yellow-400 transition-colors">{badge.name}</p>
                    </button>
                  ))}
                </div>
              </GoldCard>

              <div>
                <h3 className="text-2xl font-bold text-yellow-400 mb-6 font-serif text-center">Honored Books</h3>
                
                {hofData.badges.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from(new Set(hofData.badges.map(b => b.bookId))).map(bookId => {
                      const book = getBook(bookId);
                      if (!book) return null;
                      const badges = getBookBadgesList(bookId);
                      
                      return (
                        <GoldCard key={bookId} className="p-4 group">
                          <div className="flex gap-4">
                            {book.coverUrl ? (
                              <img src={book.coverUrl} alt="" className="w-16 h-24 object-cover rounded-lg shadow-lg" />
                            ) : (
                              <div className="w-16 h-24 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center">
                                <BookOpen className="w-8 h-8 text-gray-500" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-white truncate">{book.title}</h4>
                              <p className="text-sm text-gray-400 mb-3">{book.author}</p>
                              <div className="flex flex-wrap gap-2">
                                {badges.map(badge => (
                                  <div
                                    key={badge.id}
                                    className={`relative group/badge px-2 py-1 rounded-lg bg-gradient-to-r ${badge.color} cursor-pointer`}
                                    title={badge.description}
                                    onClick={() => setHofData(prev => removeBadge(prev, bookId, badge.id))}
                                  >
                                    <span className="text-sm">{badge.emoji}</span>
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full items-center justify-center hidden group-hover/badge:flex">
                                      <X className="w-3 h-3 text-white" />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </GoldCard>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Medal className="w-16 h-16 mx-auto mb-4 text-gray-700" />
                    <p className="text-gray-500">No badges assigned yet</p>
                    <p className="text-gray-600 text-sm mt-1">Click a badge above to start honoring your books</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* RANKINGS TAB */}
          {activeTab === 'rankings' && (
            <div className="space-y-8">
              <div className="flex justify-center">
                <button
                  onClick={() => setShowCreateRanking(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 hover:from-yellow-500/30 hover:to-amber-500/30 border border-yellow-500/30 rounded-xl text-yellow-400 font-semibold transition-all hover:scale-105"
                >
                  <Plus className="w-5 h-5" />
                  Create New Ranking
                </button>
              </div>

              {hofData.rankings.length > 0 ? (
                <div className="space-y-8">
                  {hofData.rankings.map(ranking => (
                    <GoldCard key={ranking.id} className="overflow-visible">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{ranking.emoji}</span>
                            <div>
                              <h3 className="text-xl font-bold text-white font-serif">{ranking.name}</h3>
                              <p className="text-sm text-gray-400">{ranking.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSearchContext({ type: 'ranking', id: ranking.id });
                                setShowBookSearch(true);
                              }}
                              className="p-2 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-lg transition-all"
                            >
                              <Plus className="w-5 h-5 text-yellow-400" />
                            </button>
                            <button
                              onClick={() => setHofData(prev => deleteRanking(prev, ranking.id))}
                              className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all"
                            >
                              <Trash2 className="w-5 h-5 text-red-400" />
                            </button>
                          </div>
                        </div>

                        {ranking.bookIds.length > 0 ? (
                          <div className="space-y-3">
                            {ranking.bookIds.map((bookId, index) => {
                              const book = getBook(bookId);
                              if (!book) return null;
                              
                              const isTop3 = index < 3;
                              const rankColors = ['from-yellow-400 to-amber-500', 'from-gray-300 to-gray-400', 'from-amber-600 to-orange-700'];
                              
                              return (
                                <div 
                                  key={bookId}
                                  className={`flex items-center gap-4 p-3 rounded-xl transition-all ${isTop3 ? 'bg-black/40' : 'bg-black/20'} hover:bg-yellow-500/10 group`}
                                >
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                                    isTop3 
                                      ? `bg-gradient-to-br ${rankColors[index]} text-black` 
                                      : 'bg-gray-800 text-gray-400'
                                  }`}>
                                    {index + 1}
                                  </div>
                                  
                                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => {
                                        if (index > 0) {
                                          const newOrder = [...ranking.bookIds];
                                          [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
                                          setHofData(prev => updateRanking(prev, ranking.id, newOrder));
                                        }
                                      }}
                                      disabled={index === 0}
                                      className="p-1 hover:bg-white/10 rounded disabled:opacity-30"
                                    >
                                      <ChevronUp className="w-4 h-4 text-gray-400" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (index < ranking.bookIds.length - 1) {
                                          const newOrder = [...ranking.bookIds];
                                          [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
                                          setHofData(prev => updateRanking(prev, ranking.id, newOrder));
                                        }
                                      }}
                                      disabled={index === ranking.bookIds.length - 1}
                                      className="p-1 hover:bg-white/10 rounded disabled:opacity-30"
                                    >
                                      <ChevronDown className="w-4 h-4 text-gray-400" />
                                    </button>
                                  </div>
                                  
                                  {book.coverUrl ? (
                                    <img src={book.coverUrl} alt="" className="w-12 h-16 object-cover rounded-lg shadow" />
                                  ) : (
                                    <div className="w-12 h-16 bg-gray-800 rounded-lg flex items-center justify-center">
                                      <BookOpen className="w-6 h-6 text-gray-600" />
                                    </div>
                                  )}
                                  
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-white truncate">{book.title}</p>
                                    <p className="text-sm text-gray-400">{book.author}</p>
                                  </div>
                                  
                                  {book.rating && (
                                    <div className="flex gap-0.5">
                                      {[...Array(book.rating)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                      ))}
                                    </div>
                                  )}
                                  
                                  <button
                                    onClick={() => setHofData(prev => removeFromRanking(prev, ranking.id, bookId))}
                                    className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 rounded-lg transition-all"
                                  >
                                    <X className="w-4 h-4 text-red-400" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-8 border-2 border-dashed border-gray-700 rounded-xl">
                            <Crown className="w-10 h-10 mx-auto mb-2 text-gray-600" />
                            <p className="text-gray-500">No books in this ranking</p>
                            <button
                              onClick={() => {
                                setSearchContext({ type: 'ranking', id: ranking.id });
                                setShowBookSearch(true);
                              }}
                              className="mt-3 text-yellow-400 hover:text-yellow-300 text-sm font-semibold"
                            >
                              + Add first book
                            </button>
                          </div>
                        )}
                      </div>
                    </GoldCard>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Crown className="w-16 h-16 mx-auto mb-4 text-gray-700" />
                  <p className="text-gray-500">No rankings created yet</p>
                  <p className="text-gray-600 text-sm mt-1">Create your first ranking to organize your favorites</p>
                </div>
              )}
            </div>
          )}

          {/* ANNUAL AWARDS TAB */}
          {activeTab === 'annual' && (
            <div className="space-y-8">
              {availableYears.length > 0 ? (
                availableYears.map(year => {
                  const awards = getAnnualAwards(hofData, year);
                  const awardTypes: { type: AnnualAward['type']; label: string; emoji: string }[] = [
                    { type: 'book', label: 'Book of the Year', emoji: '🏆' },
                    { type: 'author', label: 'Author of the Year', emoji: '✍️' },
                    { type: 'discovery', label: 'Best Discovery', emoji: '💎' },
                    { type: 'disappointment', label: 'Biggest Disappointment', emoji: '😔' },
                  ];
                  
                  return (
                    <GoldCard key={year} className="overflow-visible">
                      <div className="p-6">
                        <h3 className="text-3xl font-bold text-center mb-8">
                          <span className="bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent font-serif">
                            {year} Awards
                          </span>
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {awardTypes.map(({ type, label, emoji }) => {
                            const award = awards.find(a => a.type === type);
                            const book = award ? getBook(award.winnerId) : null;
                            
                            return (
                              <div 
                                key={type}
                                className={`p-4 rounded-xl border-2 transition-all ${
                                  award 
                                    ? 'border-yellow-500/30 bg-black/30' 
                                    : 'border-dashed border-gray-700 hover:border-yellow-500/30'
                                }`}
                              >
                                <div className="flex items-center gap-3 mb-4">
                                  <span className="text-2xl">{emoji}</span>
                                  <h4 className="font-bold text-white">{label}</h4>
                                </div>
                                
                                {book ? (
                                  <div className="flex items-center gap-4 group">
                                    {book.coverUrl ? (
                                      <img src={book.coverUrl} alt="" className="w-14 h-20 object-cover rounded-lg shadow" />
                                    ) : (
                                      <div className="w-14 h-20 bg-gray-800 rounded-lg flex items-center justify-center">
                                        <BookOpen className="w-6 h-6 text-gray-600" />
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="font-semibold text-white truncate">{book.title}</p>
                                      <p className="text-sm text-gray-400">{book.author}</p>
                                    </div>
                                    <button
                                      onClick={() => {
                                        setSearchContext({ type: 'annual', year, awardType: type });
                                        setShowBookSearch(true);
                                      }}
                                      className="p-2 opacity-0 group-hover:opacity-100 hover:bg-yellow-500/20 rounded-lg transition-all"
                                    >
                                      <Edit3 className="w-4 h-4 text-yellow-400" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setSearchContext({ type: 'annual', year, awardType: type });
                                      setShowBookSearch(true);
                                    }}
                                    className="w-full py-4 text-center text-gray-500 hover:text-yellow-400 transition-colors"
                                  >
                                    + Select winner
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </GoldCard>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-700" />
                  <p className="text-gray-500">No reading years found</p>
                  <p className="text-gray-600 text-sm mt-1">Add books with dates to see annual awards</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showBookSearch && (
        <BookSearchModal
          readings={eligibleBooks}
          onSelect={handleBookSelect}
          onClose={() => {
            setShowBookSearch(false);
            setSearchContext(null);
          }}
          excludeIds={
            searchContext?.type === 'category' && searchContext.id
              ? getCategoryNominees(hofData, searchContext.id).map(n => n.bookId)
              : searchContext?.type === 'ranking' && searchContext.id
                ? hofData.rankings.find(r => r.id === searchContext.id)?.bookIds || []
                : []
          }
        />
      )}

      {showCreateCategory && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <GoldCard className="w-full max-w-md" glow>
            <div className="p-6">
              <h3 className="text-xl font-bold text-yellow-400 mb-6 font-serif">Create Award Category</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Category Name</label>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g., Best Plot Twist"
                    className="w-full px-4 py-3 bg-black/50 border-2 border-yellow-500/30 rounded-xl text-white placeholder-gray-500 focus:border-yellow-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Emoji</label>
                  <input
                    type="text"
                    value={newCategoryEmoji}
                    onChange={(e) => setNewCategoryEmoji(e.target.value)}
                    className="w-full px-4 py-3 bg-black/50 border-2 border-yellow-500/30 rounded-xl text-white text-2xl focus:border-yellow-400 focus:outline-none"
                    maxLength={2}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Description (optional)</label>
                  <input
                    type="text"
                    value={newCategoryDesc}
                    onChange={(e) => setNewCategoryDesc(e.target.value)}
                    placeholder="What makes a book win this?"
                    className="w-full px-4 py-3 bg-black/50 border-2 border-yellow-500/30 rounded-xl text-white placeholder-gray-500 focus:border-yellow-400 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateCategory(false)}
                  className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-300 font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCategory}
                  disabled={!newCategoryName.trim()}
                  className="flex-1 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 rounded-xl text-black font-semibold transition-all disabled:opacity-50"
                >
                  Create
                </button>
              </div>
            </div>
          </GoldCard>
        </div>
      )}

      {showCreateRanking && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <GoldCard className="w-full max-w-md" glow>
            <div className="p-6">
              <h3 className="text-xl font-bold text-yellow-400 mb-6 font-serif">Create New Ranking</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Ranking Name</label>
                  <input
                    type="text"
                    value={newRankingName}
                    onChange={(e) => setNewRankingName(e.target.value)}
                    placeholder="e.g., My All-Time Top 10"
                    className="w-full px-4 py-3 bg-black/50 border-2 border-yellow-500/30 rounded-xl text-white placeholder-gray-500 focus:border-yellow-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Emoji</label>
                  <input
                    type="text"
                    value={newRankingEmoji}
                    onChange={(e) => setNewRankingEmoji(e.target.value)}
                    className="w-full px-4 py-3 bg-black/50 border-2 border-yellow-500/30 rounded-xl text-white text-2xl focus:border-yellow-400 focus:outline-none"
                    maxLength={2}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Description (optional)</label>
                  <input
                    type="text"
                    value={newRankingDesc}
                    onChange={(e) => setNewRankingDesc(e.target.value)}
                    placeholder="What's this ranking about?"
                    className="w-full px-4 py-3 bg-black/50 border-2 border-yellow-500/30 rounded-xl text-white placeholder-gray-500 focus:border-yellow-400 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateRanking(false)}
                  className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-300 font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateRanking}
                  disabled={!newRankingName.trim()}
                  className="flex-1 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 rounded-xl text-black font-semibold transition-all disabled:opacity-50"
                >
                  Create
                </button>
              </div>
            </div>
          </GoldCard>
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>
    </div>
  );
}
