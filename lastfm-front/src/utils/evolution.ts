// src/utils/evolution.ts
import type { Scrobble, EvolutionStats, YearRanking } from '../types';

/**
 * Calculate year-by-year rankings for a given key extractor
 */
export const calculateYearRankings = (
  scrobbles: Scrobble[],
  getKey: (scrobble: Scrobble) => string,
  topN: number = 100
): Map<number, YearRanking[]> => {
  const yearlyData = new Map<number, Map<string, number>>();

  // Group by year and count
  scrobbles.forEach(s => {
    if (!s.parsedDate) return;
    const year = s.parsedDate.getFullYear();
    const key = getKey(s);

    if (!yearlyData.has(year)) {
      yearlyData.set(year, new Map());
    }
    const yearMap = yearlyData.get(year)!;
    yearMap.set(key, (yearMap.get(key) || 0) + 1);
  });

  // Convert to rankings
  const rankings = new Map<number, YearRanking[]>();
  yearlyData.forEach((itemCounts, year) => {
    const sorted = Array.from(itemCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([item, plays], index) => ({
        year,
        item,
        position: index + 1,
        plays,
      }));
    rankings.set(year, sorted);
  });

  return rankings;
};

/**
 * Find newcomers - items that appear in a year but not in previous years
 */
export const findNewcomers = (
  rankings: Map<number, YearRanking[]>,
  targetYear: number,
  topN: number = 10
): any[] => {
  const years = Array.from(rankings.keys()).sort();
  const targetYearIndex = years.indexOf(targetYear);
  
  if (targetYearIndex <= 0) return [];

  const currentYear = rankings.get(targetYear) || [];
  const previousYears = years.slice(0, targetYearIndex);
  
  // Get all items from previous years
  const previousItems = new Set<string>();
  previousYears.forEach(year => {
    const yearRankings = rankings.get(year) || [];
    yearRankings.forEach(r => previousItems.add(r.item));
  });

  // Find items in current year that weren't in previous years
  const newcomers = currentYear
    .filter(r => !previousItems.has(r.item))
    .slice(0, topN)
    .map(r => ({
      item: r.item,
      year: targetYear,
      plays: r.plays,
      currentRank: r.position,
    }));

  return newcomers;
};

/**
 * Find biggest climbers - items that improved their ranking the most
 */
export const findClimbers = (
  rankings: Map<number, YearRanking[]>,
  fromYear: number,
  toYear: number,
  topN: number = 10
): any[] => {
  const fromRankings = rankings.get(fromYear) || [];
  const toRankings = rankings.get(toYear) || [];

  const fromMap = new Map(fromRankings.map(r => [r.item, r]));
  const toMap = new Map(toRankings.map(r => [r.item, r]));

  const climbers: any[] = [];

  toRankings.forEach(toRank => {
    const fromRank = fromMap.get(toRank.item);
    if (fromRank && fromRank.position > toRank.position && toRank.position <= 20) {
      climbers.push({
        item: toRank.item,
        fromYear,
        toYear,
        fromPosition: fromRank.position,
        toPosition: toRank.position,
        positionGain: fromRank.position - toRank.position,
        fromPlays: fromRank.plays,
        toPlays: toRank.plays,
      });
    }
  });

  return climbers
    .sort((a, b) => b.positionGain - a.positionGain)
    .slice(0, topN);
};

/**
 * Find items with biggest growth in absolute plays
 */
export const findGrowth = (
  rankings: Map<number, YearRanking[]>,
  fromYear: number,
  toYear: number,
  topN: number = 10
): any[] => {
  const fromRankings = rankings.get(fromYear) || [];
  const toRankings = rankings.get(toYear) || [];

  const fromMap = new Map(fromRankings.map(r => [r.item, r]));
  
  const growth: any[] = [];

  toRankings.forEach(toRank => {
    const fromRank = fromMap.get(toRank.item);
    if (fromRank) {
      const growthAmount = toRank.plays - fromRank.plays;
      if (growthAmount > 0) {
        growth.push({
          item: toRank.item,
          fromYear,
          toYear,
          fromPlays: fromRank.plays,
          toPlays: toRank.plays,
          growthAmount,
          growthPercent: ((growthAmount / fromRank.plays) * 100).toFixed(1),
        });
      }
    }
  });

  return growth
    .sort((a, b) => b.growthAmount - a.growthAmount)
    .slice(0, topN);
};

/**
 * Find biggest drops - only considers items that were in the top 10 of `fromYear`
 */
export const findDrops = (
  rankings: Map<number, YearRanking[]>,
  fromYear: number,
  toYear: number,
  topN: number = 10
): any[] => {
  const fromRankings = (rankings.get(fromYear) || []).filter(r => r.position <= 20); // solo top 20
  const toRankings = rankings.get(toYear) || [];

  const toMap = new Map(toRankings.map(r => [r.item, r]));

  const drops = fromRankings.map(fromRank => {
    const toRank = toMap.get(fromRank.item);
    const toPosition = toRank ? toRank.position : 999; // si desapareció
    return {
      item: fromRank.item,
      fromYear,
      toYear,
      fromPosition: fromRank.position,
      toPosition,
      positionDrop: toPosition - fromRank.position,
    };
  })

  .filter(d => d.positionDrop > 0);

  // ordenás directamente por el tamaño de la caída y tomás los top N
  return drops.sort((a, b) => b.positionDrop - a.positionDrop).slice(0, topN);
};

/**
 * Find comeback items - items that returned after absence
 */
export const findComebacks = (
  rankings: Map<number, YearRanking[]>,
  targetYear: number,
  topN: number = 10
): any[] => {
  const years = Array.from(rankings.keys()).sort();
  const targetYearIndex = years.indexOf(targetYear);
  
  if (targetYearIndex < 2) return [];

  const currentYear = rankings.get(targetYear) || [];
  const comebacks: any[] = [];

  currentYear.forEach(current => {
    // Look backwards to find when this item was last seen
    let lastSeenYear = 0;
    for (let i = targetYearIndex - 1; i >= 0; i--) {
      const yearRankings = rankings.get(years[i]) || [];
      if (yearRankings.some(r => r.item === current.item)) {
        lastSeenYear = years[i];
        break;
      }
    }

    // Check if there's a gap (comeback)
    if (lastSeenYear > 0 && targetYear - lastSeenYear >= 2) {
      const yearsAbsent = targetYear - lastSeenYear - 1;
      comebacks.push({
        item: current.item,
        lastYear: lastSeenYear,
        comebackYear: targetYear,
        yearsAbsent,
        currentPlays: current.plays,
        currentRank: current.position,
      });
    }
  });

  return comebacks
    .sort((a, b) => b.yearsAbsent - a.yearsAbsent)
    .slice(0, topN);
};

/**
 * Find most consistent items - items that stayed in top 10 most years
 */
export const findConsistent = (
  rankings: Map<number, YearRanking[]>,
  topPosition: number = 10,
  minYears: number = 3,
  topN: number = 10
): any[] => {
  const itemYears = new Map<string, number[]>();
  const itemPositions = new Map<string, number[]>();
  const itemPlays = new Map<string, number>();

  rankings.forEach((yearRankings, year) => {
    yearRankings
      .filter(r => r.position <= topPosition)
      .forEach(r => {
        if (!itemYears.has(r.item)) {
          itemYears.set(r.item, []);
          itemPositions.set(r.item, []);
          itemPlays.set(r.item, 0);
        }
        itemYears.get(r.item)!.push(year);
        itemPositions.get(r.item)!.push(r.position);
        itemPlays.set(r.item, itemPlays.get(r.item)! + r.plays);
      });
  });

  const consistent: any[] = [];
  const totalYears = rankings.size;

  itemYears.forEach((years, item) => {
    if (years.length >= minYears) {
      const positions = itemPositions.get(item)!;
      const avgPosition = positions.reduce((a, b) => a + b, 0) / positions.length;
      
      consistent.push({
        item,
        yearsInTop10: years.length,
        totalYears,
        averagePosition: avgPosition.toFixed(1),
        totalPlays: itemPlays.get(item),
      });
    }
  });

  return consistent
    .sort((a, b) => b.yearsInTop10 - a.yearsInTop10)
    .slice(0, topN);
};

/**
 * Find one-year wonders - items that only appeared in one year
 */
export const findOneYearWonders = (
  rankings: Map<number, YearRanking[]>,
  minPosition: number = 15,
  topN: number = 10
): any[] => {
  const itemYears = new Map<string, { year: number; plays: number; rank: number }[]>();

  rankings.forEach((yearRankings, year) => {
    yearRankings
      .filter(r => r.position <= minPosition)
      .forEach(r => {
        if (!itemYears.has(r.item)) {
          itemYears.set(r.item, []);
        }
        itemYears.get(r.item)!.push({
          year,
          plays: r.plays,
          rank: r.position,
        });
      });
  });

  const wonders: any[] = [];

  itemYears.forEach((years, item) => {
    if (years.length === 1) {
      const { year, plays, rank } = years[0];
      wonders.push({
        item,
        year,
        plays,
        rank,
      });
    }
  });

  return wonders
    .sort((a, b) => b.plays - a.plays)
    .slice(0, topN);
};

/**
 * Calculate all evolution stats
 */
export const calculateEvolutionStats = (
  scrobbles: Scrobble[],
  compareYear?: number
): EvolutionStats | null => {
  if (scrobbles.length === 0) return null;

  // Get years
  const years = Array.from(
    new Set(
      scrobbles
        .filter(s => s.parsedDate)
        .map(s => s.parsedDate!.getFullYear())
    )
  ).sort();

  if (years.length < 2) return null;

  const latestYear = compareYear || years[years.length - 1];
  const previousYear = years[years.indexOf(latestYear) - 1];

  // Calculate rankings for artists, songs, albums
  const artistRankings = calculateYearRankings(scrobbles, s => s.artist);
  const songRankings = calculateYearRankings(scrobbles, s => `${s.artist} - ${s.song}`);
  const albumRankings = calculateYearRankings(scrobbles, s => `${s.artist} - ${s.album}`);

  return {
    artists: {
      newcomers: findNewcomers(artistRankings, latestYear),
      climbers: findClimbers(artistRankings, previousYear, latestYear),
      growth: findGrowth(artistRankings, previousYear, latestYear),
      drops: findDrops(artistRankings, previousYear, latestYear),
      comebacks: findComebacks(artistRankings, latestYear),
      consistent: findConsistent(artistRankings),
      oneYearWonders: findOneYearWonders(artistRankings),
    },
    songs: {
      newcomers: findNewcomers(songRankings, latestYear),
      climbers: findClimbers(songRankings, previousYear, latestYear),
      growth: findGrowth(songRankings, previousYear, latestYear),
      drops: findDrops(songRankings, previousYear, latestYear),
      comebacks: findComebacks(songRankings, latestYear),
      consistent: findConsistent(songRankings),
      oneYearWonders: findOneYearWonders(songRankings),
    },
    albums: {
      newcomers: findNewcomers(albumRankings, latestYear),
      climbers: findClimbers(albumRankings, previousYear, latestYear),
      growth: findGrowth(albumRankings, previousYear, latestYear),
      drops: findDrops(albumRankings, previousYear, latestYear),
      comebacks: findComebacks(albumRankings, latestYear),
      consistent: findConsistent(albumRankings),
      oneYearWonders: findOneYearWonders(albumRankings),
    },
  };
};