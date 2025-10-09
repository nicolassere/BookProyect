import { useMemo, useState, useEffect } from 'react';
import type { Scrobble } from '../types';
import { calculateCumulativeRanking } from './rankings';

/**
 * Hook optimizado que calcula stats de forma LAZY
 * OPTIMIZACIÓN: Rankings ahora solo Top 20, mucho más rápido
 */
export const useStats = (
  scrobbles: Scrobble[],
  startDate?: Date,
  endDate?: Date,
  activeView: string = 'overview'
) => {
  // Estado para rankings (se calculan de forma asíncrona)
  const [rankingsData, setRankingsData] = useState<any>(null);
  const [rankingsLoading, setRankingsLoading] = useState(false);

  // 1. FILTRADO (siempre necesario, muy rápido)
  const filtered = useMemo(() => {
    if (scrobbles.length === 0) return [];
    
    if (!startDate && !endDate) return scrobbles;
    
    return scrobbles.filter(s => {
      const date = s.parsedDate;
      if (!date) return false;
      if (startDate && date < startDate) return false;
      if (endDate && date > endDate) return false;
      return true;
    });
  }, [scrobbles, startDate, endDate]);

  // 2. STATS BÁSICOS (siempre necesarios, muy rápidos)
  const basicStats = useMemo(() => {
    if (filtered.length === 0) return null;

    const artistCounts = new Map<string, number>();
    const songCounts = new Map<string, number>();

    filtered.forEach(s => {
      artistCounts.set(s.artist, (artistCounts.get(s.artist) || 0) + 1);
      const songKey = `${s.artist} - ${s.song}`;
      songCounts.set(songKey, (songCounts.get(songKey) || 0) + 1);
    });

    const topArtists = Array.from(artistCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([artist, count]) => ({ artist, count }));

    const topSongs = Array.from(songCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([song, count]) => ({ song, count }));

    return {
      total: filtered.length,
      uniqueArtists: artistCounts.size,
      uniqueSongs: songCounts.size,
      topArtists,
      topSongs,
    };
  }, [filtered]);

  // 3. HOURLY/DAILY DATA (solo para Overview)
  const timeData = useMemo(() => {
    if (activeView !== 'overview' || filtered.length === 0) return null;

    const hourCounts = new Array(24).fill(0);
    const dayCounts = new Array(7).fill(0);
    const dayOfMonthCounts = new Array(31).fill(0);

    filtered.forEach(s => {
      const date = s.parsedDate;
      if (date) {
        const hour = date.getHours();
        if (!isNaN(hour) && hour >= 0 && hour < 24) hourCounts[hour]++;
        
        const day = date.getDay();
        if (!isNaN(day) && day >= 0 && day < 7) dayCounts[day]++;
        
        const dayOfMonth = date.getDate();
        if (!isNaN(dayOfMonth) && dayOfMonth >= 1 && dayOfMonth <= 31) {
          dayOfMonthCounts[dayOfMonth - 1]++;
        }
      }
    });

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return {
      hourlyData: hourCounts.map((count, hour) => ({
        hour: `${hour.toString().padStart(2, '0')}:00`,
        count,
      })),
      dailyData: dayCounts.map((count, day) => ({
        day: dayNames[day],
        count,
      })),
      dayOfMonthData: dayOfMonthCounts.map((count, index) => ({
        day: index + 1,
        count,
      })),
    };
  }, [filtered, activeView]);

  // 4. ALBUMS (solo para Overview)
  const albumStats = useMemo(() => {
    if (activeView !== 'overview' || filtered.length === 0) return null;

    const albumCounts = new Map<string, number>();
    
    filtered.forEach(s => {
      if (s.album && s.album.trim()) {
        const albumKey = `${s.artist} - ${s.album}`;
        albumCounts.set(albumKey, (albumCounts.get(albumKey) || 0) + 1);
      }
    });

    return {
      topAlbums: Array.from(albumCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([album, count]) => ({ album, count }))
    };
  }, [filtered, activeView]);

  // 5. RANKINGS (solo para RankingView)
  useEffect(() => {
    if (activeView !== 'ranking' || filtered.length === 0) {
      setRankingsData(null);
      return;
    }

    setRankingsLoading(true);
    
    const timer = setTimeout(() => {
      try {
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
        
        setRankingsData(rankings);
        setRankingsLoading(false);
      } catch (error) {
        console.error('❌ Error calculating rankings:', error);
        setRankingsLoading(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [filtered, activeView]);

  // 6. TIMELINE (solo para TimelineView)
  const timeline = useMemo(() => {
    if (activeView !== 'timeline' || filtered.length === 0) return null;

    // Top 5 por días
    const dailyTopArtist: Record<string, string> = {};
    const dayArtistCounts: Record<string, Record<string, number>> = {};
    
    filtered.forEach(s => {
      const date = s.parsedDate;
      if (!date) return;
      
      const dayKey = date.toISOString().split('T')[0];
      if (!dayArtistCounts[dayKey]) dayArtistCounts[dayKey] = {};
      dayArtistCounts[dayKey][s.artist] = (dayArtistCounts[dayKey][s.artist] || 0) + 1;
    });

    Object.entries(dayArtistCounts).forEach(([day, artists]) => {
      const topArtist = Object.entries(artists).sort((a, b) => b[1] - a[1])[0];
      if (topArtist) dailyTopArtist[day] = topArtist[0];
    });

    const daysAsTop: Record<string, number> = {};
    Object.values(dailyTopArtist).forEach(artist => {
      daysAsTop[artist] = (daysAsTop[artist] || 0) + 1;
    });

    const totalPlays: Record<string, number> = {};
    filtered.forEach(s => {
      totalPlays[s.artist] = (totalPlays[s.artist] || 0) + 1;
    });

    const top5Timeline = Object.entries(daysAsTop)
      .map(([artist, days]) => ({
        artist,
        daysAsTop: days,
        totalPlays: totalPlays[artist] || 0,
      }))
      .sort((a, b) => b.daysAsTop - a.daysAsTop)
      .slice(0, 50);

    // Top 5 por meses
    const monthlyTopArtist: Record<string, string> = {};
    const monthArtistCounts: Record<string, Record<string, number>> = {};
    
    filtered.forEach(s => {
      const date = s.parsedDate;
      if (!date) return;
      
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      if (!monthArtistCounts[monthKey]) monthArtistCounts[monthKey] = {};
      monthArtistCounts[monthKey][s.artist] = (monthArtistCounts[monthKey][s.artist] || 0) + 1;
    });

    Object.entries(monthArtistCounts).forEach(([month, artists]) => {
      const topArtist = Object.entries(artists).sort((a, b) => b[1] - a[1])[0];
      if (topArtist) monthlyTopArtist[month] = topArtist[0];
    });

    const monthsAsTop: Record<string, number> = {};
    Object.values(monthlyTopArtist).forEach(artist => {
      monthsAsTop[artist] = (monthsAsTop[artist] || 0) + 1;
    });

    const top5MonthlyTimeline = Object.entries(monthsAsTop)
      .map(([artist, months]) => ({
        artist,
        monthsAsTop: months,
        totalPlays: totalPlays[artist] || 0,
      }))
      .sort((a, b) => b.monthsAsTop - a.monthsAsTop)
      .slice(0, 50);

    return {
      top5Timeline,
      top5MonthlyTimeline
    };
  }, [filtered, activeView]);

  // 7. YEARLY STATS (solo para YearsView)
  const yearlyStats = useMemo(() => {
    if (activeView !== 'years' || filtered.length === 0) return null;

    const yearlyData: Record<string, any> = {};
    
    filtered.forEach(s => {
      const date = s.parsedDate;
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
  }, [filtered, activeView]);

  // RETORNO: Solo lo calculado hasta ahora
  if (!basicStats) return null;

  return {
    ...basicStats,
    ...(timeData || {}),
    ...(albumStats || {}),
    rankings: rankingsData,
    rankingsLoading, // Nuevo: indicador de carga
    ...(timeline || {}),
    yearlyStats: yearlyStats || [],
  } as any;
};