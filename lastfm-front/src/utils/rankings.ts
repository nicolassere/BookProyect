import type { Scrobble } from '../types';

// Función genérica para parsear fechas (copia de stats.ts)
const parseDate = (dateStr: string, timestamp?: string): Date | null => {
  if (!dateStr || dateStr === 'Now Playing') return null;
  
  try {
    let date = new Date(dateStr);
    if (!isNaN(date.getTime()) && date.getFullYear() > 1970) {
      return date;
    }
    
    const match1 = dateStr.match(/(\d+)\s+(\w+)\s+(\d{4})[,\s]+(\d+):(\d+)/);
    if (match1) {
      const months: Record<string, number> = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11,
        'Ene': 0, 'Abr': 3, 'Ago': 7, 'Dic': 11,
        'Jan.': 0, 'Feb.': 1, 'Mar.': 2, 'Apr.': 3, 'May.': 4, 'Jun.': 5,
        'Jul.': 6, 'Aug.': 7, 'Sep.': 8, 'Oct.': 9, 'Nov.': 10, 'Dec.': 11
      };
      const month = months[match1[2]];
      if (month !== undefined) {
        date = new Date(
          parseInt(match1[3]), 
          month, 
          parseInt(match1[1]), 
          parseInt(match1[4]), 
          parseInt(match1[5])
        );
        if (!isNaN(date.getTime())) return date;
      }
    }
    
    const match2 = dateStr.match(/(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})/);
    if (match2) {
      date = new Date(
        parseInt(match2[1]),
        parseInt(match2[2]) - 1,
        parseInt(match2[3]),
        parseInt(match2[4]),
        parseInt(match2[5]),
        parseInt(match2[6])
      );
      if (!isNaN(date.getTime())) return date;
    }
    
    const timestamp2 = parseInt(dateStr);
    if (!isNaN(timestamp2) && timestamp2 > 1000000000) {
      date = new Date(timestamp2 * 1000);
      if (!isNaN(date.getTime())) return date;
    }
    
    return null;
  } catch {
    return null;
  }
};

interface RankingItem {
  name: string;
  daysInTop: number;
  totalPlays: number;
  isCurrentlyTop: boolean;
}

/**
 * Calcula el ranking acumulado genérico
 * @param scrobbles - Lista de scrobbles
 * @param getKey - Función para extraer la clave (artist, song, album)
 * @param topN - Tamaño del top (1, 5, 10, etc.)
 * @param minDays - Mínimo de días requeridos (default 3)
 */
export const calculateCumulativeRanking = (
  scrobbles: Scrobble[],
  getKey: (scrobble: Scrobble) => string,
  topN: number,
  minDays: number = 3
): RankingItem[] => {
  if (scrobbles.length === 0) return [];

  // Ordenar cronológicamente
  const sortedScrobbles = scrobbles
    .map(s => ({
      ...s,
      parsedDate: parseDate(s.date, s.timestamp)
    }))
    .filter(s => s.parsedDate !== null)
    .sort((a, b) => {
      const dateA = a.parsedDate!;
      const dateB = b.parsedDate!;
      return dateA.getTime() - dateB.getTime();
    });

  if (sortedScrobbles.length === 0) return [];

  // Calcular plays acumulados día por día
  const dailyTop: Record<string, string[]> = {};
  const cumulativePlays: Record<string, number> = {};
  
  sortedScrobbles.forEach(s => {
    const date = s.parsedDate!;
    const dayKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    const key = getKey(s);
    
    // Actualizar plays acumulados
    cumulativePlays[key] = (cumulativePlays[key] || 0) + 1;
    
    // Encontrar el Top N de ese día
    const topNItems = Object.entries(cumulativePlays)
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([itemKey]) => itemKey);
    
    dailyTop[dayKey] = topNItems;
  });

  // Contar días en Top N para cada item
  const daysInTop: Record<string, number> = {};
  Object.values(dailyTop).forEach(topItems => {
    topItems.forEach(item => {
      daysInTop[item] = (daysInTop[item] || 0) + 1;
    });
  });

  // Obtener total de plays
  const totalPlays: Record<string, number> = {};
  scrobbles.forEach(s => {
    const key = getKey(s);
    totalPlays[key] = (totalPlays[key] || 0) + 1;
  });

  // Determinar el Top N actual
  const allDays = Object.keys(dailyTop).sort();
  const currentTop = allDays.length > 0 ? dailyTop[allDays[allDays.length - 1]] : [];

  return Object.entries(daysInTop)
    .filter(([item, days]) => days >= minDays)
    .map(([item, days]) => ({
      name: item,
      daysInTop: days,
      totalPlays: totalPlays[item] || 0,
      isCurrentlyTop: currentTop.includes(item),
    }))
    .sort((a, b) => b.daysInTop - a.daysInTop)
    .slice(0, 15);
};


  