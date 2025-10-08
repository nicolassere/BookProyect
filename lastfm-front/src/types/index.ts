export interface Scrobble {
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

export interface ArtistEvolution {
  month: string;
  [artist: string]: number | string;
}

export interface Top5Timeline {
  artist: string;
  daysAsTop: number;
  totalPlays: number;
}

export interface Top5MonthlyTimeline {
  artist: string;
  monthsAsTop: number;
  totalPlays: number;
}

export interface CumulativeRanking {
  artist: string;
  daysAsNumber1: number;
  totalPlays: number;
  isCurrentLeader: boolean;
}

export interface Top5Ranking {
  artist: string;
  daysInTop5: number;
  totalPlays: number;
  isCurrentlyTop5: boolean;
}

export interface Top10Ranking {
  artist: string;
  daysInTop10: number;
  totalPlays: number;
  isCurrentlyTop10: boolean;
}

export interface DayOfMonthData {
  day: number;
  count: number;
}

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
  dayOfMonthData: DayOfMonthData[];
  topAlbums: AlbumCount[];
  uniqueArtists: number;
  uniqueSongs: number;
  artistEvolution: ArtistEvolution[];
  top5Timeline: Top5Timeline[];
  top5MonthlyTimeline: Top5MonthlyTimeline[];
  cumulativeRanking: CumulativeRanking[];
  top5Ranking: Top5Ranking[];
  top10Ranking: Top10Ranking[];
  yearlyStats: YearlyStats[];
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