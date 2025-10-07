// NEW: Monthly timeline
export interface Top5MonthlyTimeline {
  artist: string;
  monthsAsTop: number;
  totalPlays: number;
}

// NEW: Cumulative ranking (estilo Djokovic)
export interface CumulativeRanking {
  artist: string;
  daysAsNumber1: number;
  totalPlays: number;
  isCurrentLeader: boolean;
}

// NEW: Yearly stats
export interface YearlyStats {
  year: string;
  totalScrobbles:export interface Scrobble {
  artist: string;
  song: string;
  album: string;
  date: string;
  url?: string;
  timestamp?: string;
}

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

// NEW: Monthly timeline
export interface Top5MonthlyTimeline {
  artist: string;
  monthsAsTop: number;
  totalPlays: number;
}

// NEW: Cumulative ranking (estilo Djokovic)
export interface CumulativeRanking {
  artist: string;
  daysAsNumber1: number;
  totalPlays: number;
  isCurrentLeader: boolean;
}

// NEW: Yearly stats
export interface YearlyStats {
  year: string;
  totalScrobbles: number;
  uniqueArtists: number;
  uniqueSongs: number;
  topArtist: string;
  topArtistPlays: number;
  topSong: string;
  topSongPlays: number;
}

export interface Stats {
  total: number;
  topArtists: ArtistCount[];
  topSongs: SongCount[];
  hourlyData: HourlyData[];
  dailyData: DailyData[];
  topAlbums: AlbumCount[];
  uniqueArtists: number;
  uniqueSongs: number;
  artistEvolution: ArtistEvolution[];
  top5Timeline: Top5Timeline[];
  top5MonthlyTimeline: Top5MonthlyTimeline[];  // NEW
  cumulativeRanking: CumulativeRanking[];      // NEW
  yearlyStats: YearlyStats[];                   // NEW
}

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

export type TabType = 'upload' | 'api';