// Tipos para los datos de scrobbles
export interface Scrobble {
  artist: string;
  song: string;
  album: string;
  date: string;
  url?: string;
  timestamp?: string;
}

// Tipos para contadores
export interface ArtistCount {
  artist: string;
  count: number;
}

export interface SongCount {
  song: string;
  count: number;
}

export interface AlbumCount {
  album: string;
  count: number;
}

export interface HourlyData {
  hour: string;
  count: number;
}

export interface DailyData {
  day: string;
  count: number;
}

// Tipo para todas las estadísticas
export interface Stats {
  total: number;
  topArtists: ArtistCount[];
  topSongs: SongCount[];
  hourlyData: HourlyData[];
  dailyData: DailyData[];
  topAlbums: AlbumCount[];
  uniqueArtists: number;
  uniqueSongs: number;
}

// Tipos para la respuesta de la API de Last.fm
export interface LastFmArtist {
  '#text': string;
  mbid: string;
}

export interface LastFmAlbum {
  '#text': string;
  mbid: string;
}

export interface LastFmDate {
  '#text': string;
  uts: string;
}

export interface LastFmTrackAttributes {
  nowplaying: string;
}

export interface LastFmTrack {
  artist: LastFmArtist | string;
  name: string;
  album: LastFmAlbum | string;
  url: string;
  date?: LastFmDate;
  '@attr'?: LastFmTrackAttributes;
}

export interface LastFmRecentTracksAttributes {
  user: string;
  totalPages: string;
  page: string;
  perPage: string;
  total: string;
}

export interface LastFmRecentTracks {
  track: LastFmTrack | LastFmTrack[];
  '@attr': LastFmRecentTracksAttributes;
}

export interface LastFmResponse {
  recenttracks?: LastFmRecentTracks;
  error?: number;
  message?: string;
}

// Tipo para el tab activo
export type TabType = 'upload' | 'api';