import type { Scrobble } from '../types';

interface RankingItem {
  name: string;
  daysInTop: number;
  totalPlays: number;
  isCurrentlyTop: boolean;
}

export const calculateCumulativeRanking = (
  scrobbles: Scrobble[],
  getKey: (scrobble: Scrobble) => string,
  topN: number,
  minDays: number = 3
): RankingItem[] => {
  console.log('🔍 STARTING RANKING CALCULATION');
  console.log('📊 Total scrobbles:', scrobbles.length);
  console.log('🎯 Top N:', topN);
  console.log('⏰ Min days:', minDays);
  
  if (scrobbles.length === 0) return [];

  // Check fechas parseadas
  const withDates = scrobbles.filter(s => s.parsedDate);
  console.log('✅ Scrobbles with parsedDate:', withDates.length);
  
  if (withDates.length === 0) {
    console.error('❌ NO HAY FECHAS PARSEADAS!');
    return [];
  }

  // Verificar muestra de fechas
  console.log('📅 Sample dates:', withDates.slice(0, 3).map(s => ({
    date: s.date,
    parsedDate: s.parsedDate,
    key: getKey(s)
  })));

  // Pre-calcular Top 20 por plays totales
  const totalPlaysMap = new Map<string, number>();
  scrobbles.forEach(s => {
    const key = getKey(s);
    totalPlaysMap.set(key, (totalPlaysMap.get(key) || 0) + 1);
  });

  console.log('🎵 Total unique items:', totalPlaysMap.size);

  const top20Candidates = Array.from(totalPlaysMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  console.log('🏆 Top 20 candidates:', top20Candidates.map(([k, v]) => `${k}: ${v}`));

  const top20Set = new Set(top20Candidates.map(([k]) => k));

  // Ordenar cronológicamente
  const sortedScrobbles = scrobbles
    .filter(s => s.parsedDate !== null && s.parsedDate !== undefined)
    .sort((a, b) => a.parsedDate!.getTime() - b.parsedDate!.getTime());

  // Agrupar por día
  const scrobblesByDay = new Map<string, Scrobble[]>();
  
  sortedScrobbles.forEach(s => {
    const date = s.parsedDate!;
    const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    
    if (!scrobblesByDay.has(dayKey)) {
      scrobblesByDay.set(dayKey, []);
    }
    scrobblesByDay.get(dayKey)!.push(s);
  });

  console.log('📅 Total unique days:', scrobblesByDay.size);
  
  const sortedDays = Array.from(scrobblesByDay.keys()).sort();
  console.log('📅 Date range:', sortedDays[0], 'to', sortedDays[sortedDays.length - 1]);

  // Procesar día por día
  const dailyTop = new Map<string, string[]>();
  const cumulativePlays = new Map<string, number>();
  
  sortedDays.forEach(dayKey => {
    const dayScrobbles = scrobblesByDay.get(dayKey)!;
    
    // Actualizar plays acumulados
    dayScrobbles.forEach(s => {
      const key = getKey(s);
      if (top20Set.has(key)) { // Solo trackear Top 20
        cumulativePlays.set(key, (cumulativePlays.get(key) || 0) + 1);
      }
    });
    
    // Calcular Top N del día
    const topNItems = Array.from(cumulativePlays.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([itemKey]) => itemKey);
    
    dailyTop.set(dayKey, topNItems);
  });

  console.log('📊 Days with top N calculated:', dailyTop.size);

  // Contar días en Top N
  const daysInTop = new Map<string, number>();
  
  dailyTop.forEach((topItems) => {
    topItems.forEach(item => {
      daysInTop.set(item, (daysInTop.get(item) || 0) + 1);
    });
  });

  console.log('🎯 Items with days in top:', Array.from(daysInTop.entries()).map(([k, v]) => `${k}: ${v} days`));

  // Obtener el Top N actual
  const currentTop = sortedDays.length > 0 ? (dailyTop.get(sortedDays[sortedDays.length - 1]) || []) : [];

  // Construir resultado
  const results = Array.from(daysInTop.entries())
    .filter(([item, days]) => {
      const passes = days >= minDays;
      if (!passes) {
        console.log(`⏭️ Filtering out ${item}: ${days} days < ${minDays} minDays`);
      }
      return passes;
    })
    .map(([item, days]) => ({
      name: item,
      daysInTop: days,
      totalPlays: totalPlaysMap.get(item) || 0,
      isCurrentlyTop: currentTop.includes(item),
    }))
    .sort((a, b) => b.daysInTop - a.daysInTop)
    .slice(0, 20);

  console.log('✅ FINAL RESULTS:', results.length, 'items');
  console.log('📋 Results:', results);

  return results;
};