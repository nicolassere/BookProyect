import type { Scrobble, LastFmResponse, LastFmTrack } from '../types';

const BASE_URL = 'https://ws.audioscrobbler.com/2.0/';

/**
 * Extrae el texto del artista de la respuesta de Last.fm
 */
const extractArtist = (artist: LastFmTrack['artist']): string => {
  return typeof artist === 'object' ? artist['#text'] : artist;
};

/**
 * Extrae el texto del álbum de la respuesta de Last.fm
 */
const extractAlbum = (album: LastFmTrack['album']): string => {
  return typeof album === 'object' ? album['#text'] : album;
};

/**
 * Convierte un track de Last.fm a un Scrobble
 */
const convertTrackToScrobble = (track: LastFmTrack): Scrobble | null => {
  // Saltar "Now Playing"
  if (track['@attr'] && track['@attr'].nowplaying === 'true') {
    return null;
  }

  // Solo procesar tracks con fecha
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

/**
 * Obtiene los scrobbles recientes de un usuario
 */
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

/**
 * Obtiene todos los scrobbles de un usuario (máximo 10 páginas = 2000 tracks)
 */
export const fetchAllScrobbles = async (
  username: string,
  apiKey: string,
  maxPages: number = 10
): Promise<Scrobble[]> => {
  const allScrobbles: Scrobble[] = [];
  let page = 1;

  while (page <= maxPages) {
    const data = await fetchRecentTracks(username, apiKey, page);

    // Manejar errores
    if (data.error) {
      throw new Error(`Error ${data.error}: ${data.message}`);
    }

    if (!data.recenttracks || !data.recenttracks.track) {
      throw new Error('No se encontraron datos. Verifica tu usuario o API key.');
    }

    // Convertir tracks a array si es necesario
    const tracks = Array.isArray(data.recenttracks.track)
      ? data.recenttracks.track
      : [data.recenttracks.track];

    // Convertir y agregar scrobbles válidos
    tracks.forEach((track) => {
      const scrobble = convertTrackToScrobble(track);
      if (scrobble) {
        allScrobbles.push(scrobble);
      }
    });

    // Verificar si hay más páginas
    const totalPages = parseInt(data.recenttracks['@attr'].totalPages);
    if (page >= totalPages) {
      break;
    }

    page++;

    // Pausa para respetar rate limiting
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  return allScrobbles;
};