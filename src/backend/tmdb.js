import axios from 'axios';

const TMDB_CONFIG = {
  baseURL: import.meta.env.VITE_TMDB_BASE_URL || 'https://api.themoviedb.org/3',
  params: {
    api_key: import.meta.env.VITE_TMDB_API_KEY,
    language: 'en-US',
  },
  timeout: 10000, 
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
};

const tmdbAPI = axios.create(TMDB_CONFIG);

export const fetchTVShow = async (showId, { appendSeasons = '' } = {}) => {
  try {
    if (!showId) throw new Error('Show ID is required');
    
    const params = {};
    if (appendSeasons) {
      params.append_to_response = appendSeasons
        .split(',')
        .map(season => `season/${season.trim()}`)
        .join(',');
    }

    const { data } = await tmdbAPI.get(`tv/${showId}`, { params });
    return data;
  } catch (error) {
    console.error(`[TMDB] Failed to fetch show ${showId}:`, error);
    throw new Error(`Failed to load show: ${error.response?.data?.status_message || error.message}`);
  }
};

export const searchTVShows = async (query, { page = 1 } = {}) => {
  try {
    if (!query?.trim()) return [];
    
    const { data } = await tmdbAPI.get('/search/tv', {
      params: { 
        query: query.trim(),
        page,
        include_adult: false 
      }
    });
    return data.results;
  } catch (error) {
    console.error(`[TMDB] Search failed for "${query}":`, error);
    throw new Error(`Search failed: ${error.response?.data?.status_message || error.message}`);
  }
};

export const fetchSeasonEpisodes = async (showId, seasonNumber) => {
  try {
    if (!showId || !seasonNumber) {
      throw new Error('Show ID and season number are required');
    }

    const { data } = await tmdbAPI.get(`/tv/${showId}/season/${seasonNumber}`);
    
    return data.episodes.map(episode => ({
      id: episode.id,
      number: episode.episode_number,
      title: episode.name,
      rating: episode.vote_average,
      duration: `${episode.runtime || 24}m`,
      overview: episode.overview,
      airDate: episode.air_date,
      stillPath: episode.still_path 
        ? `https://image.tmdb.org/t/p/w300${episode.still_path}`
        : null
    }));
  } catch (error) {
    console.error(
      `[TMDB] Failed to fetch season ${seasonNumber} for show ${showId}:`,
      error
    );
    throw new Error(
      `Failed to load season: ${error.response?.data?.status_message || error.message}`
    );
  }
};
