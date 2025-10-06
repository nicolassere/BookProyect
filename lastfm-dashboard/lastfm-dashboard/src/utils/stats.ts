import type { Scrobble, Stats, ArtistCount, SongCount, AlbumCount, HourlyData, DailyData } from '../types';

/**
 * Calcula todas las estadísticas a partir de los scrobbles
 */
export const calculateStats = (scrobbles: Scrobble[]): Stats | null => {
  if (scrobbles.length === 0) {
    return null;
  }

  // Calcular top artistas
  const artistCounts: Record<string, number> = {};
  scrobbles.forEach((s) => {
    artistCounts[s.artist] = (artistCounts[s.artist] || 0) + 1;
  });
  const topArtists: ArtistCount[] = Object.entries(artistCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([artist, count]) => ({ artist, count }));

  // Calcular top canciones
  const songCounts: Record<string, number> = {};
  scrobbles.forEach((s) => {
    const key = `${s.artist} - ${s.song}`;
    songCounts[key] = (songCounts[key] || 0) + 1;
  });
  const topSongs: SongCount[] = Object.entries(songCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([song, count]) => ({ song, count }));

  // Calcular actividad por hora
  const hourCounts = new Array(24).fill(0);
  scrobbles.forEach((s) => {
    if (s.date && s.date !== 'Now Playing') {
      try {
        const date = new Date(s.date);
        const hour = date.getHours();
        if (!isNaN(hour) && hour >= 0 && hour < 24) {
          hourCounts[hour]++;
        }
      } catch (e) {
        // Ignorar fechas inválidas
      }
    }
  });
  const hourlyData: HourlyData[] = hourCounts.map((count, hour) => ({
    hour: `${hour}:00`,
    count,
  }));

  // Calcular actividad por día
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const dayCounts = new Array(7).fill(0);
  scrobbles.forEach((s) => {
    if (s.date && s.date !== 'Now Playing') {
      try {
        const date = new Date(s.date);
        const day = date.getDay();
        if (!isNaN(day) && day >= 0 && day < 7) {
          dayCounts[day]++;
        }
      } catch (e) {
        // Ignorar fechas inválidas
      }
    }
  });
  const dailyData: DailyData[] = dayCounts.map((count, day) => ({
    day: dayNames[day],
    count,
  }));

  // Calcular top álbumes
  const albumCounts: Record<string, number> = {};
  scrobbles.forEach((s) => {
    if (s.album && s.album.trim()) {
      const key = `${s.artist} - ${s.album}`;
      albumCounts[key] = (albumCounts[key] || 0) + 1;
    }
  });
  const topAlbums: AlbumCount[] = Object.entries(albumCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([album, count]) => ({ album, count }));

  return {
    total: scrobbles.length,
    topArtists,
    topSongs,
    hourlyData,
    dailyData,
    topAlbums,
    uniqueArtists: Object.keys(artistCounts).length,
    uniqueSongs: Object.keys(songCounts).length,
  };
};