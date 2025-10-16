export interface Scrobble {
  artist: string;
  song: string;
  album: string;
  date: string;
  url?: string;
  timestamp?: string;
  parsedDate?: Date | null; // NEW: Pre-parsed date for performance
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

export interface RankingItem {
  name: string;
  daysInTop: number;
  totalPlays: number;
  isCurrentlyTop: boolean;
}

export interface Rankings {
  artists: {
    top1: RankingItem[];
    top5: RankingItem[];
    top10: RankingItem[];
  };
  songs: {
    top1: RankingItem[];
    top5: RankingItem[];
    top10: RankingItem[];
  };
  albums: {
    top1: RankingItem[];
    top5: RankingItem[];
    top10: RankingItem[];
  };
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
  rankings: Rankings;
  yearlyStats: YearlyStats[];
}

// Add to src/types/index.ts

export interface YearRanking {
  year: number;
  item: string;
  position: number;
  plays: number;
}

export interface NewcomerItem {
  item: string;
  year: number;
  plays: number;
  currentRank: number;
}

export interface ClimberItem {
  item: string;
  fromYear: number;
  toYear: number;
  fromPosition: number;
  toPosition: number;
  positionGain: number;
  fromPlays: number;
  toPlays: number;
}

export interface GrowthItem {
  item: string;
  fromYear: number;
  toYear: number;
  fromPlays: number;
  toPlays: number;
  growthAmount: number;
  growthPercent: number;
}

export interface DropItem {
  item: string;
  fromYear: number;
  toYear: number;
  fromPosition: number;
  toPosition: number;
  positionDrop: number;
}

export interface ComebackItem {
  item: string;
  lastYear: number;
  comebackYear: number;
  yearsAbsent: number;
  currentPlays: number;
  currentRank: number;
}

export interface ConsistencyItem {
  item: string;
  yearsInTop10: number;
  totalYears: number;
  averagePosition: number;
  totalPlays: number;
}

export interface OneYearWonderItem {
  item: string;
  year: number;
  plays: number;
  rank: number;
}

export interface EvolutionStats {
  artists: {
    newcomers: NewcomerItem[];
    climbers: ClimberItem[];
    growth: GrowthItem[];
    drops: DropItem[];
    comebacks: ComebackItem[];
    consistent: ConsistencyItem[];
    oneYearWonders: OneYearWonderItem[];
  };
  songs: {
    newcomers: NewcomerItem[];
    climbers: ClimberItem[];
    growth: GrowthItem[];
    drops: DropItem[];
    comebacks: ComebackItem[];
    consistent: ConsistencyItem[];
    oneYearWonders: OneYearWonderItem[];
  };
  albums: {
    newcomers: NewcomerItem[];
    climbers: ClimberItem[];
    growth: GrowthItem[];
    drops: DropItem[];
    comebacks: ComebackItem[];
    consistent: ConsistencyItem[];
    oneYearWonders: OneYearWonderItem[];
  };
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