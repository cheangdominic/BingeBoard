/**
 * @file TMDB API Service
 * @description This module provides functions to interact with The Movie Database (TMDB) API
 * for fetching TV show details, searching TV shows, and retrieving season episode information.
 * It uses an Axios instance pre-configured with TMDB base URL, API key, and other defaults.
 */

// Import the axios library for making HTTP requests
import axios from 'axios';

/**
 * Configuration object for the TMDB API requests.
 * @const {object} TMDB_CONFIG
 * @property {string} baseURL - The base URL for TMDB API, sourced from environment variables or a default.
 * @property {object} params - Default query parameters for all requests.
 * @property {string} params.api_key - The TMDB API key, sourced from environment variables.
 * @property {string} params.language - The default language for API responses (e.g., 'en-US').
 * @property {number} timeout - Default request timeout in milliseconds.
 * @property {object} headers - Default headers for all requests.
 * @property {string} headers.Accept - Specifies that JSON responses are expected.
 * @property {string} headers.Content-Type - Specifies the content type of requests (though GET requests don't typically have a body).
 */
const TMDB_CONFIG = {
  baseURL: import.meta.env.VITE_TMDB_BASE_URL || 'https://api.themoviedb.org/3', // Base URL for TMDB API
  params: {
    api_key: import.meta.env.VITE_TMDB_API_KEY, // API key from environment variables
    language: 'en-US', // Default language for results
  },
  timeout: 10000, // Request timeout set to 10 seconds
  headers: {
    'Accept': 'application/json', // Specifies that the client expects a JSON response
    'Content-Type': 'application/json' // Specifies the content type of the request (more relevant for POST/PUT)
  }
};

/**
 * Axios instance pre-configured for making requests to the TMDB API.
 * Uses the `TMDB_CONFIG` for base URL, default parameters, timeout, and headers.
 * @const {axios.AxiosInstance} tmdbAPI
 */
const tmdbAPI = axios.create(TMDB_CONFIG);

/**
 * Fetches detailed information for a specific TV show from TMDB.
 * Optionally appends details for specified seasons to the response.
 * @async
 * @function fetchTVShow
 * @param {string|number} showId - The ID of the TV show to fetch.
 * @param {object} [options={}] - Optional parameters.
 * @param {string} [options.appendSeasons=''] - A comma-separated string of season numbers to append to the response (e.g., "1,2,3").
 *                                              If provided, details for these seasons will be included in the main show details response.
 * @returns {Promise<object>} A promise that resolves to the TV show data object from TMDB.
 * @throws {Error} If `showId` is not provided, or if the API request fails. The error message will contain details from TMDB if available.
 */
export const fetchTVShow = async (showId, { appendSeasons = '' } = {}) => {
  try {
    // Ensure a showId is provided
    if (!showId) throw new Error('Show ID is required');
    
    // Initialize an empty object for additional request parameters
    const params = {};
    // If `appendSeasons` is provided, format it for the `append_to_response` TMDB parameter
    if (appendSeasons) {
      params.append_to_response = appendSeasons
        .split(',') // Split the string of season numbers into an array
        .map(season => `season/${season.trim()}`) // Format each season number as "season/N"
        .join(','); // Join them back into a comma-separated string
    }

    // Make a GET request to the `tv/{showId}` endpoint with the constructed params
    const { data } = await tmdbAPI.get(`tv/${showId}`, { params });
    // Return the data part of the response
    return data;
  } catch (error) {
    // Log the error for debugging purposes
    console.error(`[TMDB] Failed to fetch show ${showId}:`, error);
    // Throw a new error with a user-friendly message, including TMDB's status message if available
    throw new Error(`Failed to load show: ${error.response?.data?.status_message || error.message}`);
  }
};

/**
 * Searches for TV shows on TMDB based on a query string.
 * @async
 * @function searchTVShows
 * @param {string} query - The search query string.
 * @param {object} [options={}] - Optional parameters.
 * @param {number} [options.page=1] - The page number of results to fetch.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of TV show result objects from TMDB.
 *                                   Returns an empty array if the query is empty or whitespace.
 * @throws {Error} If the API request fails. The error message will contain details from TMDB if available.
 */
export const searchTVShows = async (query, { page = 1 } = {}) => {
  try {
    // If the query is null, undefined, or just whitespace, return an empty array immediately
    if (!query?.trim()) return [];
    
    // Make a GET request to the `/search/tv` endpoint
    const { data } = await tmdbAPI.get('/search/tv', {
      params: { 
        query: query.trim(), // The search query, trimmed of whitespace
        page, // The page number for pagination
        include_adult: false // Exclude adult content from results
      }
    });
    // Return the `results` array from the response data
    return data.results;
  } catch (error) {
    // Log the error
    console.error(`[TMDB] Search failed for "${query}":`, error);
    // Throw a new error with a user-friendly message
    throw new Error(`Search failed: ${error.response?.data?.status_message || error.message}`);
  }
};

/**
 * Fetches details for all episodes of a specific season of a TV show from TMDB.
 * Formats the episode data into a more structured and frontend-friendly format.
 * @async
 * @function fetchSeasonEpisodes
 * @param {string|number} showId - The ID of the TV show.
 * @param {string|number} seasonNumber - The number of the season to fetch episodes for.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of formatted episode objects.
 *                                   Each episode object includes id, number, title, rating, duration, overview, airDate, and stillPath.
 * @throws {Error} If `showId` or `seasonNumber` is not provided, or if the API request fails.
 *                 The error message will contain details from TMDB if available.
 */
export const fetchSeasonEpisodes = async (showId, seasonNumber) => {
  try {
    // Ensure both showId and seasonNumber are provided
    if (!showId || !seasonNumber) {
      throw new Error('Show ID and season number are required');
    }

    // Make a GET request to the `/tv/{showId}/season/{seasonNumber}` endpoint
    const { data } = await tmdbAPI.get(`/tv/${showId}/season/${seasonNumber}`);
    
    // Map over the `episodes` array in the response data to format each episode
    return data.episodes.map(episode => ({
      id: episode.id, // Episode ID
      number: Number(episode.episode_number) || 0, // Episode number, converted to a number (defaults to 0 if invalid)
      title: episode.name, // Episode title
      rating: episode.vote_average, // Episode rating (vote average)
      duration: `${episode.runtime || 24}m`, // Episode runtime in minutes (defaults to 24m if not available)
      overview: episode.overview, // Episode overview/summary
      airDate: episode.air_date, // Episode air date
      stillPath: episode.still_path // Path to the episode's still image
        ? `https://image.tmdb.org/t/p/w300${episode.still_path}` // Full URL for the still image (w300 size)
        : null // Null if no still path is available
    }));
  } catch (error) {
    // Log the error
    console.error(
      `[TMDB] Failed to fetch season ${seasonNumber} for show ${showId}:`,
      error
    );
    // Throw a new error with a user-friendly message
    throw new Error(
      `Failed to load season: ${error.response?.data?.status_message || error.message}`
    );
  }
};