// src/utils/hallOfFameStorage.ts
// Storage and management utilities for Hall of Fame data

import type { 
  HallOfFameData, 
  BookBadge, 
  CustomCategory, 
  CategoryNomination, 
  AnnualAward, 
  CustomRanking,
  Badge,
} from '../types/hallOfFame';

const STORAGE_KEY = 'hall_of_fame_data';

// Predefined badges users can assign
export const AVAILABLE_BADGES: Badge[] = [
  { id: 'masterpiece', name: 'Masterpiece', emoji: '🏆', color: 'from-yellow-400 to-amber-500', description: 'An absolute masterpiece' },
  { id: 'lifechanging', name: 'Life Changing', emoji: '✨', color: 'from-purple-400 to-pink-500', description: 'Changed how I see the world' },
  { id: 'heartbreaker', name: 'Heartbreaker', emoji: '💔', color: 'from-red-400 to-rose-500', description: 'Emotionally devastating' },
  { id: 'mindblown', name: 'Mind Blown', emoji: '🤯', color: 'from-cyan-400 to-blue-500', description: 'Expanded my mind' },
  { id: 'couldntstop', name: "Couldn't Stop", emoji: '📖', color: 'from-green-400 to-emerald-500', description: 'Unputdownable' },
  { id: 'beautifulprose', name: 'Beautiful Prose', emoji: '🎨', color: 'from-pink-400 to-purple-500', description: 'Exquisite writing' },
  { id: 'perfectending', name: 'Perfect Ending', emoji: '🎬', color: 'from-amber-400 to-orange-500', description: 'Stuck the landing' },
  { id: 'villain', name: 'Best Villain', emoji: '😈', color: 'from-gray-600 to-gray-800', description: 'Unforgettable antagonist' },
  { id: 'hero', name: 'Best Hero', emoji: '🦸', color: 'from-blue-400 to-indigo-500', description: 'Inspiring protagonist' },
  { id: 'worldbuilding', name: 'World Builder', emoji: '🌍', color: 'from-teal-400 to-cyan-500', description: 'Incredible world-building' },
  { id: 'funny', name: 'Made Me Laugh', emoji: '😂', color: 'from-yellow-300 to-orange-400', description: 'Genuinely hilarious' },
  { id: 'scary', name: 'Terrifying', emoji: '😱', color: 'from-gray-700 to-black', description: 'Kept me up at night' },
  { id: 'reread', name: 'Will Reread', emoji: '🔄', color: 'from-indigo-400 to-purple-500', description: 'Definitely reading again' },
  { id: 'underrated', name: 'Hidden Gem', emoji: '💎', color: 'from-sky-400 to-blue-500', description: 'Deserves more recognition' },
  { id: 'overrated', name: 'Overrated', emoji: '📉', color: 'from-gray-400 to-gray-500', description: 'Did not live up to hype' },
  { id: 'childhood', name: 'Childhood Favorite', emoji: '🧒', color: 'from-pink-300 to-rose-400', description: 'Nostalgic favorite' },
];

// Default categories to get started
export const SUGGESTED_CATEGORIES: Omit<CustomCategory, 'id' | 'createdAt'>[] = [
  { name: 'Best Plot Twist', emoji: '🔀', description: 'Most shocking twist' },
  { name: 'Best Romance', emoji: '💕', description: 'Best love story' },
  { name: 'Best Opening Line', emoji: '📝', description: 'Hooked from the first sentence' },
  { name: 'Most Quotable', emoji: '💬', description: 'Full of memorable quotes' },
  { name: 'Best Character Arc', emoji: '📈', description: 'Most satisfying character development' },
  { name: 'Most Atmospheric', emoji: '🌫️', description: 'Best mood and atmosphere' },
  { name: 'Best Audiobook', emoji: '🎧', description: 'Amazing narration' },
  { name: 'Guilty Pleasure', emoji: '🍫', description: 'Not high art but loved it anyway' },
];

export function loadHallOfFame(): HallOfFameData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored) as HallOfFameData;
      // Ensure all arrays exist
      return {
        badges: data.badges || [],
        categories: data.categories || [],
        nominations: data.nominations || [],
        annualAwards: data.annualAwards || [],
        rankings: data.rankings || [],
        authorPhotos: data.authorPhotos || {},
      };
    }
  } catch (e) {
    console.error('Error loading Hall of Fame:', e);
  }
  return {
    badges: [],
    categories: [],
    nominations: [],
    annualAwards: [],
    rankings: [],
    authorPhotos: {},
  };
}

export function saveHallOfFame(data: HallOfFameData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving Hall of Fame:', e);
  }
}

// Badge operations
export function assignBadge(data: HallOfFameData, bookId: string, badgeId: string): HallOfFameData {
  // Remove existing badge of same type for this book
  const filtered = data.badges.filter(b => !(b.bookId === bookId && b.badgeId === badgeId));
  return {
    ...data,
    badges: [...filtered, { bookId, badgeId, assignedAt: new Date().toISOString() }],
  };
}

export function removeBadge(data: HallOfFameData, bookId: string, badgeId: string): HallOfFameData {
  return {
    ...data,
    badges: data.badges.filter(b => !(b.bookId === bookId && b.badgeId === badgeId)),
  };
}

export function getBookBadges(data: HallOfFameData, bookId: string): string[] {
  return data.badges.filter(b => b.bookId === bookId).map(b => b.badgeId);
}

// Category operations
export function createCategory(data: HallOfFameData, name: string, emoji: string, description: string): HallOfFameData {
  const newCategory: CustomCategory = {
    id: `cat-${Date.now()}`,
    name,
    emoji,
    description,
    createdAt: new Date().toISOString(),
  };
  return {
    ...data,
    categories: [...data.categories, newCategory],
  };
}

export function deleteCategory(data: HallOfFameData, categoryId: string): HallOfFameData {
  return {
    ...data,
    categories: data.categories.filter(c => c.id !== categoryId),
    nominations: data.nominations.filter(n => n.categoryId !== categoryId),
  };
}

// Nomination operations
export function nominateBook(data: HallOfFameData, categoryId: string, bookId: string): HallOfFameData {
  // Check if already nominated
  const exists = data.nominations.some(n => n.categoryId === categoryId && n.bookId === bookId);
  if (exists) return data;
  
  return {
    ...data,
    nominations: [...data.nominations, {
      categoryId,
      bookId,
      nominatedAt: new Date().toISOString(),
      isWinner: false,
    }],
  };
}

export function removeNomination(data: HallOfFameData, categoryId: string, bookId: string): HallOfFameData {
  return {
    ...data,
    nominations: data.nominations.filter(n => !(n.categoryId === categoryId && n.bookId === bookId)),
  };
}

export function setWinner(data: HallOfFameData, categoryId: string, bookId: string): HallOfFameData {
  return {
    ...data,
    nominations: data.nominations.map(n => {
      if (n.categoryId === categoryId) {
        return { ...n, isWinner: n.bookId === bookId };
      }
      return n;
    }),
  };
}

export function getCategoryNominees(data: HallOfFameData, categoryId: string): CategoryNomination[] {
  return data.nominations.filter(n => n.categoryId === categoryId);
}

export function getCategoryWinner(data: HallOfFameData, categoryId: string): string | null {
  const winner = data.nominations.find(n => n.categoryId === categoryId && n.isWinner);
  return winner?.bookId || null;
}

// Annual awards operations
export function setAnnualAward(
  data: HallOfFameData, 
  year: number, 
  type: AnnualAward['type'], 
  winnerId: string,
  note?: string
): HallOfFameData {
  // Remove existing award of same type/year
  const filtered = data.annualAwards.filter(a => !(a.year === year && a.type === type));
  return {
    ...data,
    annualAwards: [...filtered, { year, type, winnerId, note }],
  };
}

export function removeAnnualAward(data: HallOfFameData, year: number, type: AnnualAward['type']): HallOfFameData {
  return {
    ...data,
    annualAwards: data.annualAwards.filter(a => !(a.year === year && a.type === type)),
  };
}

export function getAnnualAwards(data: HallOfFameData, year: number): AnnualAward[] {
  return data.annualAwards.filter(a => a.year === year);
}

// Ranking operations
export function createRanking(data: HallOfFameData, name: string, emoji: string, description: string): HallOfFameData {
  const newRanking: CustomRanking = {
    id: `rank-${Date.now()}`,
    name,
    emoji,
    description,
    bookIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return {
    ...data,
    rankings: [...data.rankings, newRanking],
  };
}

export function updateRanking(data: HallOfFameData, rankingId: string, bookIds: string[]): HallOfFameData {
  return {
    ...data,
    rankings: data.rankings.map(r => 
      r.id === rankingId 
        ? { ...r, bookIds, updatedAt: new Date().toISOString() }
        : r
    ),
  };
}

export function deleteRanking(data: HallOfFameData, rankingId: string): HallOfFameData {
  return {
    ...data,
    rankings: data.rankings.filter(r => r.id !== rankingId),
  };
}

export function addToRanking(data: HallOfFameData, rankingId: string, bookId: string): HallOfFameData {
  return {
    ...data,
    rankings: data.rankings.map(r => {
      if (r.id === rankingId && !r.bookIds.includes(bookId)) {
        return { ...r, bookIds: [...r.bookIds, bookId], updatedAt: new Date().toISOString() };
      }
      return r;
    }),
  };
}

export function removeFromRanking(data: HallOfFameData, rankingId: string, bookId: string): HallOfFameData {
  return {
    ...data,
    rankings: data.rankings.map(r => {
      if (r.id === rankingId) {
        return { ...r, bookIds: r.bookIds.filter(id => id !== bookId), updatedAt: new Date().toISOString() };
      }
      return r;
    }),
  };
}

export function reorderRanking(data: HallOfFameData, rankingId: string, fromIndex: number, toIndex: number): HallOfFameData {
  return {
    ...data,
    rankings: data.rankings.map(r => {
      if (r.id === rankingId) {
        const newOrder = [...r.bookIds];
        const [moved] = newOrder.splice(fromIndex, 1);
        newOrder.splice(toIndex, 0, moved);
        return { ...r, bookIds: newOrder, updatedAt: new Date().toISOString() };
      }
      return r;
    }),
  };
}

// Author photo operations
export function setAuthorPhoto(data: HallOfFameData, authorName: string, photoUrl: string): HallOfFameData {
  return {
    ...data,
    authorPhotos: {
      ...data.authorPhotos,
      [authorName]: photoUrl,
    },
  };
}

export function removeAuthorPhoto(data: HallOfFameData, authorName: string): HallOfFameData {
  const { [authorName]: _, ...rest } = data.authorPhotos;
  return {
    ...data,
    authorPhotos: rest,
  };
}

export function getAuthorPhoto(data: HallOfFameData, authorName: string): string | undefined {
  return data.authorPhotos[authorName];
}