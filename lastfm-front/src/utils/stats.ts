import type { Scrobble, Stats } from '../types';

export const calculateStats = (scrobbles: Scrobble[]): Stats | null => {
  if (scrobbles.length === 0) {
    return null;
  }

  const artistCounts: Record<string, number> = {};
  scrobbles.forEach((s) => {
    artistCounts[s.artist] = (artistCounts[s.artist] || 0) + 1;
  });
  const topArtists = Object.entries(artistCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([artist, count]) => ({ artist, count }));

  const songCounts: Record<string, number> = {};
  scrobbles.forEach((s) => {
    const key = `${s.artist} - ${s.song}`;
    songCounts[key] = (songCounts[key] || 0) + 1;
  });
  const topSongs = Object.entries(songCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([song, count]) => ({ song, count }));

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
        // Ignorar
      }
    }
  });
  const hourlyData = hourCounts.map((count, hour) => ({
    hour: `${hour}:00`,
    count,
  }));

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
        // Ignorar
      }
    }
  });
  const dailyData = dayCounts.map((count, day) => ({
    day: dayNames[day],
    count,
  }));

  const albumCounts: Record<string, number> = {};
  scrobbles.forEach((s) => {
    if (s.album && s.album.trim()) {
      const key = `${s.artist} - ${s.album}`;
      albumCounts[key] = (albumCounts[key] || 0) + 1;
    }
  });
  const topAlbums = Object.entries(albumCounts)
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