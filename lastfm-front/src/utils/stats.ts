import type { Scrobble, Stats } from '../types';
import { calculateCumulativeRanking } from './rankings';

// FIXED: Parseo robusto para TODOS los formatos posibles
const parseDate = (dateStr: string, timestamp?: string): Date | null => {
  if (!dateStr || dateStr === 'Now Playing') return null;
  
  try {
    // PRIMERO: Intentar usar timestamp si está disponible (más confiable)
    if (timestamp) {
      const ts = parseInt(timestamp);
      if (!isNaN(ts) && ts > 1000000000) {
        const date = new Date(ts * 1000);
        if (!isNaN(date.getTime())) return date;
      }
    }
    
    // Formato ISO
    let date = new Date(dateStr);
    if (!isNaN(date.getTime()) && date.getFullYear() > 1970) {
      return date;
    }
    
    // Formato "DD MMM YYYY, HH:mm" - MEJORADO
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
    
    // Formato "YYYY-MM-DD HH:mm:ss"
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
    
    // Timestamp unix en el string
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

export const calculateStats = (
  scrobbles: Scrobble[],
  startDate?: Date,
  endDate?: Date
): Stats | null => {
  if (scrobbles.length === 0) return null;

  // Filtrar por rango de fechas
  let filtered = scrobbles;
  if (startDate || endDate) {
    filtered = scrobbles.filter(s => {
      const date = parseDate(s.date, s.timestamp);
      if (!date) return false;
      if (startDate && date < startDate) return false;
      if (endDate && date > endDate) return false;
      return true;
    });
  }

  if (filtered.length === 0) return null;

  // Artist counts
  const artistCounts: Record<string, number> = {};
  filtered.forEach(s => {
    artistCounts[s.artist] = (artistCounts[s.artist] || 0) + 1;
  });
  const topArtists = Object.entries(artistCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([artist, count]) => ({ artist, count }));

  // Song counts
  const songCounts: Record<string, number> = {};
  filtered.forEach(s => {
    const key = `${s.artist} - ${s.song}`;
    songCounts[key] = (songCounts[key] || 0) + 1;
  });
  const topSongs = Object.entries(songCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([song, count]) => ({ song, count }));

  // FIXED: Hourly data
  const hourCounts = new Array(24).fill(0);
  filtered.forEach(s => {
    const date = parseDate(s.date, s.timestamp);
    if (date) {
      const hour = date.getHours();
      if (!isNaN(hour) && hour >= 0 && hour < 24) {
        hourCounts[hour]++;
      }
    }
  });
  const hourlyData = hourCounts.map((count, hour) => ({
    hour: `${hour.toString().padStart(2, '0')}:00`,
    count,
  }));

  // Daily data
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayCounts = new Array(7).fill(0);
  filtered.forEach(s => {
    const date = parseDate(s.date, s.timestamp);
    if (date) {
      const day = date.getDay();
      if (!isNaN(day) && day >= 0 && day < 7) {
        dayCounts[day]++;
      }
    }
  });
  const dailyData = dayCounts.map((count, day) => ({
    day: dayNames[day],
    count,
  }));
  // Day of month data (1-31)
  const dayOfMonthCounts = new Array(31).fill(0);
  filtered.forEach(s => {
    const date = parseDate(s.date, s.timestamp);
    if (date) {
      const dayOfMonth = date.getDate(); // 1-31
      if (!isNaN(dayOfMonth) && dayOfMonth >= 1 && dayOfMonth <= 31) {
        dayOfMonthCounts[dayOfMonth - 1]++;
      }
    }
  });
  const dayOfMonthData = dayOfMonthCounts.map((count, index) => ({
    day: index + 1,
    count,
  }));

  // Album counts
  const albumCounts: Record<string, number> = {};
  filtered.forEach(s => {
    if (s.album && s.album.trim()) {
      const key = `${s.artist} - ${s.album}`;
      albumCounts[key] = (albumCounts[key] || 0) + 1;
    }
  });
  const topAlbums = Object.entries(albumCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([album, count]) => ({ album, count }));



    

  // Evolution, timeline y nuevas stats
  const artistEvolution = calculateArtistEvolution(filtered, topArtists.slice(0, 5).map(a => a.artist));
  const top5Timeline = calculateTop5Timeline(filtered);
  const top5MonthlyTimeline = calculateTop5MonthlyTimeline(filtered); // NEW
  const yearlyStats = calculateYearlyStats(filtered); // NEW
  
// Rankings (artists, songs, albums)
  const rankings = {
    artists: {
      top1: calculateCumulativeRanking(filtered, (s) => s.artist, 1),
      top5: calculateCumulativeRanking(filtered, (s) => s.artist, 5),
      top10: calculateCumulativeRanking(filtered, (s) => s.artist, 10),
    },
    songs: {
      top1: calculateCumulativeRanking(filtered, (s) => `${s.artist} - ${s.song}`, 1),
      top5: calculateCumulativeRanking(filtered, (s) => `${s.artist} - ${s.song}`, 5),
      top10: calculateCumulativeRanking(filtered, (s) => `${s.artist} - ${s.song}`, 10),
    },
    albums: {
      top1: calculateCumulativeRanking(filtered, (s) => `${s.artist} - ${s.album}`, 1),
      top5: calculateCumulativeRanking(filtered, (s) => `${s.artist} - ${s.album}`, 5),
      top10: calculateCumulativeRanking(filtered, (s) => `${s.artist} - ${s.album}`, 10),
    },
  };
  return {
    total: filtered.length,
    topArtists,
    topSongs,
    hourlyData,
    dailyData,
    dayOfMonthData,
    topAlbums,
    uniqueArtists: Object.keys(artistCounts).length,
    uniqueSongs: Object.keys(songCounts).length,
    artistEvolution,
    top5Timeline,
    top5MonthlyTimeline,
    rankings,
    yearlyStats,
  };
};

// Evolution por mes
function calculateArtistEvolution(scrobbles: Scrobble[], topArtists: string[]) {
  const monthlyData: Record<string, Record<string, number>> = {};
  
  scrobbles.forEach(s => {
    const date = parseDate(s.date, s.timestamp);
    if (!date) return;
    
    const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {};
    }
    monthlyData[monthKey][s.artist] = (monthlyData[monthKey][s.artist] || 0) + 1;
  });

  return Object.entries(monthlyData)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, artists]) => {
      const dataPoint: any = { month };
      topArtists.forEach(artist => {
        dataPoint[artist] = artists[artist] || 0;
      });
      return dataPoint;
    });
}

// Timeline por DÍAS
function calculateTop5Timeline(scrobbles: Scrobble[]) {
  const dailyTopArtist: Record<string, string> = {};
  const dayArtistCounts: Record<string, Record<string, number>> = {};
  
  scrobbles.forEach(s => {
    const date = parseDate(s.date, s.timestamp);
    if (!date) return;
    
    const dayKey = date.toISOString().split('T')[0];
    if (!dayArtistCounts[dayKey]) {
      dayArtistCounts[dayKey] = {};
    }
    dayArtistCounts[dayKey][s.artist] = (dayArtistCounts[dayKey][s.artist] || 0) + 1;
  });

  Object.entries(dayArtistCounts).forEach(([day, artists]) => {
    const topArtist = Object.entries(artists).sort((a, b) => b[1] - a[1])[0];
    if (topArtist) {
      dailyTopArtist[day] = topArtist[0];
    }
  });

  const daysAsTop: Record<string, number> = {};
  Object.values(dailyTopArtist).forEach(artist => {
    daysAsTop[artist] = (daysAsTop[artist] || 0) + 1;
  });

  const totalPlays: Record<string, number> = {};
  scrobbles.forEach(s => {
    totalPlays[s.artist] = (totalPlays[s.artist] || 0) + 1;
  });

  return Object.entries(daysAsTop)
    .map(([artist, days]) => ({
      artist,
      daysAsTop: days,
      totalPlays: totalPlays[artist] || 0,
    }))
    .sort((a, b) => b.daysAsTop - a.daysAsTop)
    .slice(0, 5);
}

// NEW: Timeline por MESES
function calculateTop5MonthlyTimeline(scrobbles: Scrobble[]) {
  const monthlyTopArtist: Record<string, string> = {};
  const monthArtistCounts: Record<string, Record<string, number>> = {};
  
  scrobbles.forEach(s => {
    const date = parseDate(s.date, s.timestamp);
    if (!date) return;
    
    const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    if (!monthArtistCounts[monthKey]) {
      monthArtistCounts[monthKey] = {};
    }
    monthArtistCounts[monthKey][s.artist] = (monthArtistCounts[monthKey][s.artist] || 0) + 1;
  });

  Object.entries(monthArtistCounts).forEach(([month, artists]) => {
    const topArtist = Object.entries(artists).sort((a, b) => b[1] - a[1])[0];
    if (topArtist) {
      monthlyTopArtist[month] = topArtist[0];
    }
  });

  const monthsAsTop: Record<string, number> = {};
  Object.values(monthlyTopArtist).forEach(artist => {
    monthsAsTop[artist] = (monthsAsTop[artist] || 0) + 1;
  });

  const totalPlays: Record<string, number> = {};
  scrobbles.forEach(s => {
    totalPlays[s.artist] = (totalPlays[s.artist] || 0) + 1;
  });

  return Object.entries(monthsAsTop)
    .map(([artist, months]) => ({
      artist,
      monthsAsTop: months,
      totalPlays: totalPlays[artist] || 0,
    }))
    .sort((a, b) => b.monthsAsTop - a.monthsAsTop)
    .slice(0, 5);
}




// NEW: Estadísticas por año
function calculateYearlyStats(scrobbles: Scrobble[]) {
  const yearlyData: Record<string, any> = {};
  
  scrobbles.forEach(s => {
    const date = parseDate(s.date, s.timestamp);
    if (!date) return;
    
    const year = date.getFullYear().toString();
    if (!yearlyData[year]) {
      yearlyData[year] = {
        year,
        totalScrobbles: 0,
        artists: {} as Record<string, number>,
        songs: {} as Record<string, number>,
      };
    }
    
    yearlyData[year].totalScrobbles++;
    yearlyData[year].artists[s.artist] = (yearlyData[year].artists[s.artist] || 0) + 1;
    const songKey = `${s.artist} - ${s.song}`;
    yearlyData[year].songs[songKey] = (yearlyData[year].songs[songKey] || 0) + 1;
  });

  return Object.values(yearlyData)
    .map((yearData: any) => {
      const topArtist = Object.entries(yearData.artists as Record<string, number>)
        .sort((a, b) => (b[1] as number) - (a[1] as number))[0];
      
      const topSong = Object.entries(yearData.songs as Record<string, number>)
        .sort((a, b) => (b[1] as number) - (a[1] as number))[0];

      return {
        year: yearData.year,
        totalScrobbles: yearData.totalScrobbles,
        uniqueArtists: Object.keys(yearData.artists).length,
        uniqueSongs: Object.keys(yearData.songs).length,
        topArtist: topArtist ? topArtist[0] : '-',
        topArtistPlays: topArtist ? topArtist[1] : 0,
        topSong: topSong ? topSong[0] : '-',
        topSongPlays: topSong ? topSong[1] : 0,
      };
    })
    .sort((a, b) => b.year.localeCompare(a.year));
}

export const getDateRange = (scrobbles: Scrobble[]) => {
  const dates = scrobbles
    .map(s => parseDate(s.date, s.timestamp))
    .filter(d => d !== null) as Date[];
  
  if (dates.length === 0) return { min: '', max: '' };
  
  const min = new Date(Math.min(...dates.map(d => d.getTime())));
  const max = new Date(Math.max(...dates.map(d => d.getTime())));
  
  return {
    min: min.toISOString().split('T')[0],
    max: max.toISOString().split('T')[0],
  };
};