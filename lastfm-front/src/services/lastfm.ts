import type { Scrobble, LastFmResponse, LastFmTrack } from '../types';

const BASE_URL = 'https://ws.audioscrobbler.com/2.0/';

const extractArtist = (artist: LastFmTrack['artist']): string => {
  return typeof artist === 'object' ? artist['#text'] : artist;
};

const extractAlbum = (album: LastFmTrack['album']): string => {
  return typeof album === 'object' ? album['#text'] : album;
};

const convertTrackToScrobble = (track: LastFmTrack): Scrobble | null => {
  if (track['@attr'] && track['@attr'].nowplaying === 'true') {
    return null;
  }

  if (!track.date) {
    return null;
  }

  return {
    artist: extractArtist(track.artist),
    song: track.name,
    album: extractAlbum(track.album),
    date: track.date['#text'],
    url: track.url,
    timestamp: track.date.uts,
  };
};

export const fetchRecentTracks = async (
  username: string,
  apiKey: string,
  page: number = 1,
  limit: number = 200
): Promise<LastFmResponse> => {
  const url = `${BASE_URL}?method=user.getrecenttracks&user=${encodeURIComponent(
    username
  )}&api_key=${encodeURIComponent(apiKey)}&format=json&limit=${limit}&page=${page}`;

  const response = await fetch(url);
  const data: LastFmResponse = await response.json();

  return data;
};

export const fetchAllScrobbles = async (
  username: string,
  apiKey: string,
  maxPages: number = 10
): Promise<Scrobble[]> => {
  const allScrobbles: Scrobble[] = [];
  let page = 1;

  while (page <= maxPages) {
    const data = await fetchRecentTracks(username, apiKey, page);

    if (data.error) {
      throw new Error(`Error ${data.error}: ${data.message}`);
    }

    if (!data.recenttracks || !data.recenttracks.track) {
      throw new Error('No se encontraron datos. Verifica tu usuario o API key.');
    }

    const tracks = Array.isArray(data.recenttracks.track)
      ? data.recenttracks.track
      : [data.recenttracks.track];

    tracks.forEach((track) => {
      const scrobble = convertTrackToScrobble(track);
      if (scrobble) {
        allScrobbles.push(scrobble);
      }
    });

    const totalPages = parseInt(data.recenttracks['@attr'].totalPages);
    if (page >= totalPages) {
      break;
    }

    page++;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  return allScrobbles;
};