/**
 * @file ShowGrid.jsx
 * @description A React component that provides a grid for searching, filtering, and logging TV shows.
 * It includes a search bar, filters, and a modal for detailed show information, episode tracking, and review submission.
 */

// Import React hooks and utilities.
import { useState, useEffect, useRef, useCallback } from "react";
// Import axios for making HTTP requests.
import axios from "axios";
// Import motion and AnimatePresence from framer-motion for animations.
import { motion, AnimatePresence } from "framer-motion";
// Import SearchBar and TVShowFilters components for UI.
import SearchBar from "../search/SearchBar.jsx";
import TVShowFilters from "../search/TVShowFilters";
// Import icons from lucide-react and react-icons.
import { X, CheckCircle, Eye as EyeIcon } from "lucide-react"; // 'Eye' aliased to 'EyeIcon' to avoid conflict.
import { FaEye, FaChevronDown, FaChevronUp } from 'react-icons/fa';
// Import useAuth custom hook to access authentication context.
import { useAuth } from '../../context/AuthContext';
// Import AppleRatingDisplay component for showing ratings.
import AppleRatingDisplay from '../../components/AppleRatingDisplay';

// Constants for TMDB API and image URLs.
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
const BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/w1280";
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

/**
 * Fetches episodes for a specific season of a TV show from TMDB.
 * @async
 * @param {string|number} showId - The ID of the TV show.
 * @param {string|number} seasonNumber - The number of the season.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of episode objects or an empty array on error.
 */
const fetchSeasonEpisodes = async (showId, seasonNumber) => {
  try {
    const response = await axios.get(`https://api.themoviedb.org/3/tv/${showId}/season/${seasonNumber}`, {
      params: {
        api_key: TMDB_API_KEY,
        language: "en-US"
      }
    });
    // Map TMDB episode data to a simpler structure.
    return response.data.episodes.map(ep => ({
      id: ep.id,
      number: ep.episode_number,
      name: ep.name,
      rating: ep.vote_average,
    }));
  } catch (error) {
    console.error(`Error fetching episodes for show ${showId}, season ${seasonNumber}:`, error);
    return []; // Return empty array on error.
  }
};

/**
 * Formats an episode number string/number to a clean integer.
 * @param {string|number} num - The episode number.
 * @returns {number} The parsed integer episode number, or 0 if invalid.
 */
const formatEpisodeNumber = (num) => {
  const numStr = String(num);
  const cleanNum = numStr.replace(/[^\d]/g, ''); // Remove non-digit characters.
  return parseInt(cleanNum, 10) || 0; // Parse to integer, default to 0.
};

/**
 * @function EpisodeList
 * @description A component to display a list of episodes for a selected season.
 * Allows users to select episodes and mark them as watched.
 *
 * @param {object} props - Component props.
 * @param {Array<object>} props.seasons - Array of season objects for the show.
 * @param {string|number} props.showId - ID of the current show.
 * @param {boolean} props.isAuthenticated - Whether the user is authenticated.
 * @param {string} props.showName - Name of the current show.
 * @param {string} props.posterPath - Poster path of the current show.
 * @param {function} props.setShowWatchedToast - Function to show a "watched" toast notification.
 * @param {function} props.setWatchedToastMessage - Function to set the message for the "watched" toast.
 * @returns {JSX.Element} The rendered EpisodeList component.
 */
const EpisodeList = ({ 
    seasons, 
    showId, 
    isAuthenticated, 
    showName, 
    posterPath, 
    setShowWatchedToast,
    setWatchedToastMessage
}) => {
  // State for the currently selected season number.
  const [selectedSeason, setSelectedSeason] = useState(seasons[0]?.number || 1);
  // State to store fetched episodes, keyed by season number.
  const [episodesBySeason, setEpisodesBySeason] = useState({});
  // State for information about currently selected episodes for marking as watched.
  const [selectedEpisodesInfo, setSelectedEpisodesInfo] = useState([]);
  // State to track if the user is currently dragging to select episodes.
  const [isDragging, setIsDragging] = useState(false);
  // State to control if all episodes of a season are shown or a limited number.
  const [viewAll, setViewAll] = useState(false);
  // State to track if episodes for the selected season are currently loading.
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);
  // State to track if the "mark as watched" action is in progress.
  const [isMarkingWatched, setIsMarkingWatched] = useState(false);

  // Limit for initially displayed episodes per season.
  const EPISODES_LIMIT = 20;

  // `useEffect` to reset episode-related states when `seasons` or `showId` changes.
  // Also ensures `selectedSeason` is valid.
  useEffect(() => {
    setEpisodesBySeason({}); // Clear previously fetched episodes.
    setSelectedEpisodesInfo([]); // Clear selected episodes.
    setViewAll(false); // Reset view all flag.
    setIsLoadingEpisodes(false); // Reset loading flag.
    if (seasons && seasons.length > 0) {
      // Check if the current `selectedSeason` is still valid within the new `seasons` array.
      const currentSeasonStillValid = seasons.find(s => s.number === selectedSeason);
      if (currentSeasonStillValid) {
        setSelectedSeason(currentSeasonStillValid.number);
      } else {
        // If not valid, default to the first season or season 1.
        setSelectedSeason(seasons[0]?.number || 1);
      }
    } else {
      setSelectedSeason(1); // Default to season 1 if no seasons data.
    }
  }, [seasons, showId]); // Rerun if seasons or showId changes.


  // `useEffect` to load episodes for the `selectedSeason` when it changes or `showId` changes.
  useEffect(() => {
    const loadEpisodes = async () => {
      if (!selectedSeason) return; // Do nothing if no season is selected.
      // Fetch episodes only if they haven't been fetched for this season yet.
      if (!episodesBySeason[selectedSeason]) {
        setIsLoadingEpisodes(true);
        try {
          const fetchedEpisodes = await fetchSeasonEpisodes(showId, selectedSeason);
          setEpisodesBySeason(prev => ({ ...prev, [selectedSeason]: fetchedEpisodes }));
        } catch (err) { // Catch specific error from fetchSeasonEpisodes (though it returns [] on error)
          console.error(`Error in loadEpisodes for season ${selectedSeason}:`, err);
          setEpisodesBySeason(prev => ({ ...prev, [selectedSeason]: [] })); // Ensure it's an empty array on error
        } finally {
          setIsLoadingEpisodes(false);
        }
      }
    };
    loadEpisodes();
  }, [selectedSeason, showId, episodesBySeason]); // Rerun if selectedSeason, showId, or episodesBySeason map itself changes (for new entries).

  // `useEffect` to reset `viewAll` and `selectedEpisodesInfo` when `selectedSeason` changes.
  useEffect(() => {
    setViewAll(false);
    setSelectedEpisodesInfo([]);
  }, [selectedSeason]);

  // Get episodes for the currently selected season, or an empty array.
  const episodes = episodesBySeason[selectedSeason] || [];
  // Determine which episodes to display based on `viewAll` state and `EPISODES_LIMIT`.
  const displayedEpisodes = viewAll ? episodes : episodes.slice(0, EPISODES_LIMIT);
  // Check if there are more episodes to show beyond the limit.
  const hasMoreEpisodes = episodes.length > EPISODES_LIMIT;

  /**
   * Handles clicking on an episode to select/deselect it for marking as watched.
   * @param {object} episode - The episode object that was clicked.
   */
  const handleEpisodeClick = (episode) => {
    setSelectedEpisodesInfo(prev => {
      const isSelected = prev.find(epInfo => epInfo.id === episode.id);
      if (isSelected) {
        // If already selected, remove it.
        return prev.filter(epInfo => epInfo.id !== episode.id);
      } else {
        // If not selected, add it.
        return [...prev, { id: episode.id, number: episode.number, name: episode.name }];
      }
    });
  };
  
  /**
   * Handles marking selected episodes as watched.
   * Sends a POST request to the backend API.
   * @async
   */
  const handleMarkAsWatched = async () => {
    // Guard clauses: do nothing if not authenticated or no episodes are selected.
    if (!isAuthenticated || selectedEpisodesInfo.length === 0) return;
    setIsMarkingWatched(true); // Set marking in progress.

    // Prepare data for the API request.
    const watchedData = {
      showId: showId.toString(),
      showName: showName, 
      posterPath: posterPath, 
      seasonNumber: selectedSeason,
      episodes: selectedEpisodesInfo, // Array of {id, number, name}
    };

    try {
      // Make POST request to the backend.
      await axios.post('/api/users/mark-watched', watchedData, { withCredentials: true });
      // Show success toast.
      setWatchedToastMessage(`${selectedEpisodesInfo.length} episode(s) from ${showName} marked as watched!`);
      setShowWatchedToast(true);
      setSelectedEpisodesInfo([]); // Clear selected episodes.
    } catch (error) {
      console.error("Failed to mark episodes as watched:", error.response?.data || error.message);
      // Show error toast.
      setWatchedToastMessage(`Error: ${error.response?.data?.message || "Could not mark episodes as watched."}`);
      setShowWatchedToast(true);
    } finally {
      setIsMarkingWatched(false); // Reset marking state.
    }
  };

  // Handlers for drag-to-select functionality.
  const handleDragStart = () => setIsDragging(true);
  const handleDragEnd = () => setIsDragging(false);

  // `useEffect` to add a global mouseup listener to end dragging state,
  // even if mouseup occurs outside the episode grid.
  useEffect(() => {
    const endDragGlobal = () => setIsDragging(false);
    window.addEventListener('mouseup', endDragGlobal);
    return () => window.removeEventListener('mouseup', endDragGlobal); // Cleanup listener.
  }, []);

  // If no season data is available, display a message.
  if (!seasons || seasons.length === 0) {
    return <div className="text-gray-400 text-center py-3">No season data available.</div>;
  }

  // Render the episode list UI.
  return (
    <div className="bg-[#2a2a2a] rounded-xl p-6"> {/* Main container for episode list section */}
      <div className="text-2xl font-bold mb-6 text-gray-100">
        Episodes
      </div>
      {/* Inner container with gradient background and border */}
      <div className="bg-gradient-to-br from-[#272733] to-[#1c1c24] rounded-xl p-4 sm:p-6 shadow-lg border border-[#343444]">
      {/* Header: Season title, episode count, selected count, and "First Season" button */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-5 gap-3 sm:gap-0">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-100">Season {selectedSeason} Episodes</h3>
          <p className="text-blue-400 text-xs sm:text-sm mt-1">
            {episodes.length} Episode{episodes.length !== 1 ? "s" : ""} • Select to mark as watched
          </p>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-3">
          <span className="text-xs sm:text-sm text-gray-400">
            {selectedEpisodesInfo.length} selected
          </span>
          <button
            className="bg-blue-600 hover:bg-blue-700 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-white text-xs sm:text-sm font-medium transition-colors"
            onClick={() => setSelectedSeason(seasons[0]?.number || 1)} // Go to first season
          >
            First Season
          </button>
        </div>
      </div>

      {/* Season selector buttons (horizontal scroll) */}
      <div className="flex space-x-2 sm:space-x-3 mb-6 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-[#3a3a3a] scrollbar-track-transparent">
        {seasons.map(season => (
          <button
            key={season.id || season.number} // Use season ID or number as key
            onClick={() => setSelectedSeason(season.number)} // Set selected season on click
            // Dynamic classes for styling active vs. inactive season buttons
            className={`px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-lg text-xs sm:text-sm md:text-base font-medium whitespace-nowrap transition-colors ${selectedSeason === season.number
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' // Active style
                : 'bg-[#343444] text-gray-300 hover:bg-[#3f3f52]' // Inactive style
              }`}
          >
            {season.name || `Season ${season.number}`} {/* Display season name or "Season X" */}
          </button>
        ))}
      </div>

      {/* Conditional rendering for episode grid: loading, no episodes, or episode list */}
      {isLoadingEpisodes ? (
         <div className="text-center py-8 text-gray-400">Loading episodes...</div>
      ) : episodes.length === 0 ? (
        <div className="text-center py-8 text-gray-400">No episodes found for this season.</div>
      ) : (
        // Grid for displaying episodes
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 sm:gap-3 mb-6">
          {displayedEpisodes.map(ep => {
            const isCurrentlySelected = selectedEpisodesInfo.some(selEp => selEp.id === ep.id);
            const canSelect = isAuthenticated; // User can select episodes if authenticated
            const ratingValue = typeof ep.rating === 'number' ? ep.rating : parseFloat(ep.rating);
            const displayRating = !isNaN(ratingValue) ? ratingValue.toFixed(1) : 'N/A'; // Format rating

            return (
              <div
                key={ep.id}
                onClick={canSelect ? () => handleEpisodeClick(ep) : undefined}
                onMouseDown={canSelect ? handleDragStart : undefined} // Start drag selection
                onMouseUp={canSelect ? handleDragEnd : undefined}     // End drag selection
                onMouseEnter={canSelect && isDragging ? () => handleEpisodeClick(ep) : undefined} // Select on mouse enter while dragging
                // Dynamic classes for styling selected/unselected/unselectable episodes
                className={`aspect-square rounded-md sm:rounded-lg flex items-center justify-center relative transition-all cursor-pointer
                  ${canSelect
                    ? isCurrentlySelected
                      ? 'bg-blue-600 border-2 border-blue-400 shadow-md shadow-blue-500/20' // Selected style
                      : 'bg-[#343444] hover:bg-[#3f3f52] border border-[#4a4a5a]' // Unselected style
                    : 'bg-[#343444] border border-[#4a4a5a] cursor-not-allowed' // Unselectable style
                  }`}
                title={`Ep. ${formatEpisodeNumber(ep.number)}: ${ep.name || ''} - Rating: ${displayRating}`} // Tooltip
              >
                <span className="text-xs sm:text-sm font-medium text-gray-200">{formatEpisodeNumber(ep.number)}</span>
                {/* Hover overlay to show episode rating */}
                {canSelect && (
                  <div className={`absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 ${isDragging ? '' : 'hover:opacity-100'} transition-opacity rounded-md sm:rounded-lg`}>
                    <span className="text-xs sm:text-sm font-bold text-yellow-400">
                      {displayRating}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* "View All / Show Less" button if there are more episodes than the limit */}
      {hasMoreEpisodes && !isLoadingEpisodes && episodes.length > 0 && (
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setViewAll(!viewAll)} // Toggle viewAll state
            className="flex items-center space-x-2 bg-[#343444] hover:bg-[#3f3f52] text-white px-4 py-2 sm:px-6 sm:py-2.5 rounded-lg transition-colors font-medium text-xs sm:text-sm"
          >
            <span>{viewAll ? "Show Less" : `View All ${episodes.length} Episodes`}</span>
            {/* Chevron icon indicating expand/collapse action */}
            {viewAll ? <FaChevronUp className="text-sm" /> : <FaChevronDown className="text-sm" />}
          </button>
        </div>
      )}

      {/* "Mark Selected as Watched" button, shown if user is authenticated */}
      {isAuthenticated && (
        <button
          onClick={handleMarkAsWatched}
          disabled={selectedEpisodesInfo.length === 0 || isMarkingWatched} // Disable if no episodes selected or marking in progress
          // Dynamic classes for styling based on button state
          className={`w-full py-2.5 sm:py-3.5 rounded-lg font-medium flex items-center justify-center space-x-2 sm:space-x-3 transition-colors text-xs sm:text-sm md:text-md lg:text-lg ${selectedEpisodesInfo.length > 0 && !isMarkingWatched
              ? 'bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white shadow-md shadow-green-500/20' // Active style
              : 'bg-[#343444] text-gray-400 cursor-not-allowed' // Disabled style
            }`}
        >
          <FaEye className="text-base" /> {/* Eye icon */}
          <span>{isMarkingWatched ? "Marking..." : "Mark Selected as Watched"}</span>
          {/* Badge showing count of selected episodes */}
          {selectedEpisodesInfo.length > 0 && !isMarkingWatched && (
            <span className="bg-white/20 px-2 py-0.5 sm:px-2.5 rounded-full text-xs sm:text-sm">
              {selectedEpisodesInfo.length}
            </span>
          )}
        </button>
      )}
      </div>
    </div>
  );
};

/**
 * @function ShowGrid
 * @description Main component for the "Log Shows" page.
 * Handles searching for shows, displaying results, and opening a modal for detailed interaction.
 * @returns {JSX.Element} The rendered ShowGrid component.
 */
const ShowGrid = () => {
  // State for search query, search results (exact and broadened), loading status, etc.
  const [query, setQuery] = useState("");
  const [exactMatches, setExactMatches] = useState([]);
  const [broadenedShows, setBroadenedShows] = useState([]);
  const [filteredBroadenedShows, setFilteredBroadenedShows] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false); // Track if a search has been performed
  const [currentPage, setCurrentPage] = useState(1); // For pagination of broad search results
  const [totalResults, setTotalResults] = useState(0); // Total results from broad search

  // State for the currently selected show (to open in modal).
  const [selectedShow, setSelectedShow] = useState(null);
  // State for detailed information of the selected show.
  const [selectedShowDetails, setSelectedShowDetails] = useState(null);
  // State for formatted season data of the selected show.
  const [formattedShowSeasons, setFormattedShowSeasons] = useState([]);
  // State to track if details for the selected show are loading.
  const [isLoadingShowDetails, setIsLoadingShowDetails] = useState(false);
  
  // Get user authentication status from context.
  const { user } = useAuth();
  const isAuthenticatedForReview = !!user; // Boolean flag for review authentication

  // State for review form fields.
  const [reviewText, setReviewText] = useState("");
  const [ratingWhole, setRatingWhole] = useState(1); // Integer part of rating (0-5)
  const [ratingDecimal, setRatingDecimal] = useState(0); // Decimal part of rating (0-99), stored as string for leading zeros
  const [containsSpoilers, setContainsSpoilers] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false); // Track review submission status
  const [reviewError, setReviewError] = useState(null); // Error message for review submission
  
  // State for toast notifications.
  const [showSuccessReviewToast, setShowSuccessReviewToast] = useState(false);
  const [showWatchedToast, setShowWatchedToast] = useState(false);
  const [watchedToastMessage, setWatchedToastMessage] = useState("");
  
  // State to control if the modal can be closed (e.g., prevent closing during toast display).
  const [modalCanClose, setModalCanClose] = useState(true);

  // `useEffect` to reset decimal part of rating if whole part is 5.
  useEffect(() => {
    if (ratingWhole >= 5) {
      setRatingDecimal(0);
    }
  }, [ratingWhole]);

  /**
   * Handles clicks on the interactive AppleRatingDisplay component for setting the rating.
   * @param {number} appleNumber - The number of the clicked apple (1-5).
   */
  const handleInteractiveAppleClick = (appleNumber) => {
    setRatingWhole(appleNumber);
    if (appleNumber >= 5) { // If 5 apples are selected, decimal part must be 0.
      setRatingDecimal(0);
    }
  };

  /**
   * Fetches trending TV shows for the week from TMDB.
   * Used as initial content before a search is performed.
   * @async
   */
  const fetchTrendingShowsWeek = async () => {
    setIsSearching(true);
    try {
      const trendingRes = await axios.get(
        "https://api.themoviedb.org/3/trending/tv/week",
        { params: { api_key: TMDB_API_KEY, language: "en-US", page: 1 } }
      );
      setBroadenedShows(trendingRes.data.results);
      setFilteredBroadenedShows(trendingRes.data.results); // Initially, filtered is same as broadened
    } catch (error) {
      console.error("Failed to fetch trending shows:", error);
      setBroadenedShows([]);
      setFilteredBroadenedShows([]);
    } finally {
      setIsSearching(false);
    }
  };

  // `useEffect` to fetch trending shows if query is empty and no search has been made.
  useEffect(() => {
    if (!query.trim() && !hasSearched) {
      fetchTrendingShowsWeek();
    }
  }, [query, hasSearched]); // Rerun if query or hasSearched changes.

  // `useEffect` to scroll to top when the component mounts.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // `useEffect` to manage body overflow when modal is open/closed.
  useEffect(() => {
    if (selectedShow) {
      document.body.style.overflow = 'hidden'; // Prevent background scroll when modal is open.
    } else {
      document.body.style.overflow = 'unset'; // Restore background scroll.
      setModalCanClose(true); // Ensure modal can be closed by default when it's not visible.
    }
    // Cleanup function to restore overflow style.
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedShow]);

  // `useEffect` to fetch detailed information for the `selectedShow` when it changes.
  useEffect(() => {
    const fetchShowDetailsForModal = async () => {
      if (!selectedShow) { // If no show is selected, reset details and seasons.
        setFormattedShowSeasons([]);
        setSelectedShowDetails(null);
        return;
      }
      setIsLoadingShowDetails(true);
      try {
        // Fetch show details from TMDB.
        const response = await axios.get(`https://api.themoviedb.org/3/tv/${selectedShow.id}`, {
          params: {
            api_key: TMDB_API_KEY,
            language: "en-US",
          },
        });
        setSelectedShowDetails(response.data); // Set detailed show info.
        // Adapt season data, filtering out "specials" (season_number 0).
        const adaptedSeasons = response.data.seasons
          ?.filter(s => s.season_number > 0 ) // Filter out season 0 (specials)
          .map(s => ({
            id: s.id,
            number: s.season_number,
            name: s.name,
            episode_count: s.episode_count
          })) || [];
        setFormattedShowSeasons(adaptedSeasons);
      } catch (error) {
        console.error(`Failed to fetch details for show ${selectedShow.id}:`, error);
        setFormattedShowSeasons([]);
        setSelectedShowDetails(null);
      } finally {
        setIsLoadingShowDetails(false);
      }
    };

    fetchShowDetailsForModal();
  }, [selectedShow]); // Rerun if selectedShow changes.


  /**
   * Performs a search for TV shows based on the current `query`.
   * Fetches both exact matches and broader results from TMDB.
   * @async
   */
  const searchShows = async () => {
    // If query is empty, reset search results and fetch trending shows.
    if (!query.trim()) {
      setExactMatches([]);
      setBroadenedShows([]);
      setFilteredBroadenedShows([]);
      setHasSearched(false);
      setTotalResults(0);
      setCurrentPage(1);
      fetchTrendingShowsWeek();
      return;
    }
    setIsSearching(true);
    setHasSearched(true);
    setCurrentPage(1); // Reset to first page for new search.

    try {
      // Fetch results where query is treated as an exact phrase.
      const exactRes = await axios.get("https://api.themoviedb.org/3/search/tv", {
        params: { api_key: TMDB_API_KEY, query: `"${query}"`, page: 1 }, // Using quotes for exact phrase (TMDB might not support this well)
      });
      // Fetch broader results.
      const broadRes = await axios.get("https://api.themoviedb.org/3/search/tv", {
        params: { api_key: TMDB_API_KEY, query: query, page: 1 },
      });
      setTotalResults(broadRes.data.total_results); // Store total results for pagination.

      // Filter exactRes for shows where the name strictly matches the query (case-insensitive).
      let tempExactMatches = exactRes.data.results.filter(
        (show) => show.name.toLowerCase() === query.toLowerCase()
      );
      // Also add shows from broadRes that are exact name matches if not already included.
      broadRes.data.results.forEach(show => {
        if (show.name.toLowerCase() === query.toLowerCase() && !tempExactMatches.find(s => s.id === show.id)) {
          tempExactMatches.push(show);
        }
      });
      setExactMatches(tempExactMatches);

      // Combine results from exact and broad searches, ensuring uniqueness.
      const allCombinedResults = [...new Set([...exactRes.data.results, ...broadRes.data.results].map(s => JSON.stringify(s)))].map(s => JSON.parse(s));

      // Filter out exact matches from the combined results to get unique broadened shows.
      const uniqueBroadened = allCombinedResults.filter(
        (show) => !tempExactMatches.some(em => em.id === show.id)
      );
      setBroadenedShows(uniqueBroadened);
      setFilteredBroadenedShows(uniqueBroadened); // Initially, filtered is same as broadened.
    } catch (error) {
      console.error("Search failed:", error);
      setExactMatches([]); setBroadenedShows([]); setFilteredBroadenedShows([]); setTotalResults(0);
    } finally {
      setIsSearching(false);
    }
  };

  /**
   * Loads more results for the current broad search query (pagination).
   * @async
   */
  const loadMore = async () => {
    const nextPage = currentPage + 1;
    try {
      const moreResults = await axios.get("https://api.themoviedb.org/3/search/tv", {
        params: { api_key: TMDB_API_KEY, query: query, page: nextPage },
      });
      setCurrentPage(nextPage);
      // Filter new results to avoid duplicates already present in broadenedShows or exactMatches.
      const newShowsToAdd = moreResults.data.results.filter(
        newShow =>
          !broadenedShows.find(bs => bs.id === newShow.id) &&
          !exactMatches.find(em => em.id === newShow.id)
      );
      const updatedBroadenedShows = [...broadenedShows, ...newShowsToAdd];
      setBroadenedShows(updatedBroadenedShows);
      setFilteredBroadenedShows(updatedBroadenedShows); // Update filtered list as well.
    } catch (error) {
      console.error("Failed to load more results:", error);
    }
  };

  /**
   * Handles clicking on a show card to open the details modal.
   * Resets review form fields and toast states.
   * @param {object} show - The show object that was clicked.
   */
  const handleCardClick = (show) => {
      setSelectedShow(show); // Set the selected show to open modal.
      // Reset review form and toast states.
      setReviewText("");
      setRatingWhole(1);
      setRatingDecimal(0);
      setContainsSpoilers(false);
      setIsSubmittingReview(false);
      setReviewError(null);
      setShowSuccessReviewToast(false);
      setShowWatchedToast(false);
      setModalCanClose(true); // Ensure modal can be closed.
  };

  /**
   * Closes the show details modal if `modalCanClose` is true.
   */
  const closeModal = () => {
    if (modalCanClose) { // Only close if allowed (e.g., not while toast is active).
        setSelectedShow(null);
    }
  };

  /**
   * Handles submission of the review form.
   * Sends a POST request to the backend API.
   * @async
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
   */
  const handleReviewSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission.
    // Guard clauses.
    if (!selectedShowDetails) {
        setReviewError("Show details not loaded yet.");
        return;
    }
    if (!user) { 
      setReviewError("You must be logged in to submit a review.");
      return;
    }

    setIsSubmittingReview(true);
    setReviewError(null);
    setShowSuccessReviewToast(false); 
    setModalCanClose(false); // Prevent modal close during submission/toast.

    // Prepare review data for API.
    const reviewData = {
      showId: selectedShowDetails.id.toString(),
      // Combine whole and decimal parts for rating, ensuring decimal is treated correctly.
      rating: ratingWhole + (Number(ratingDecimal) || 0) / 100,
      content: reviewText,
      containsSpoiler: containsSpoilers,
    };

    try {
      // Make POST request to submit review.
      const response = await axios.post('/api/reviews', reviewData, { withCredentials: true });

      if (response.data) { // Check if API returned data (implies success).
        // Reset review form fields.
        setReviewText("");
        setRatingWhole(1);
        setRatingDecimal(0);
        setContainsSpoilers(false);
        
        setShowSuccessReviewToast(true); // Show success toast.
        // After a delay, close the modal (if the toast has finished).
        setTimeout(() => {
          setSelectedShow(null); // This will trigger the modal to close via AnimatePresence exit.
        }, 1800); // Delay to allow toast to be seen.


      } else {
        // This case might indicate an API issue if success is expected but no data is returned.
        throw new Error("API did not return a successful response or data.");
      }

    } catch (err) {
      // Set error message from API response or a generic one.
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || "Failed to submit review. Please try again.";
      setReviewError(errorMessage);
      setModalCanClose(true); // Allow modal to be closed after error.
    } finally {
      setIsSubmittingReview(false); // Reset submitting state.
    }
  };

  // `useEffect` to manage visibility of success review toast and modal closeability.
  useEffect(() => {
    let reviewToastTimer;
    if (showSuccessReviewToast) {
      setModalCanClose(false); // Keep modal open while toast is shown.
      reviewToastTimer = setTimeout(() => {
        setShowSuccessReviewToast(false); // Hide toast.
        // Only allow modal close if selectedShow is null (meaning it was intentionally closed by submit logic).
        if (!selectedShow) setModalCanClose(true);
      }, 2500); // Toast duration.
    }
    return () => clearTimeout(reviewToastTimer); // Cleanup timer.
  }, [showSuccessReviewToast, selectedShow]);

  // `useEffect` to manage visibility of "marked as watched" toast and modal closeability.
  useEffect(() => {
    let watchedToastTimer;
    if (showWatchedToast) {
        setModalCanClose(false); // Keep modal open.
        watchedToastTimer = setTimeout(() => {
            setShowWatchedToast(false); // Hide toast.
            setModalCanClose(true); // Allow modal close.
        }, 2500); // Toast duration.
    }
    return () => clearTimeout(watchedToastTimer); // Cleanup timer.
  }, [showWatchedToast]);


  // Framer Motion animation variants.
  const fadeInUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
  
  const modalVariants = {
    hidden: { opacity: 0, y: -50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.25, ease: "easeOut" } }, 
    exit: { opacity: 0, y: 50, scale: 0.9, transition: { duration: 0.25, ease: "easeIn" } } 
  };

  const overlayVariants = { 
    hidden: { opacity: 0 }, 
    visible: { opacity: 1 }, 
    exit: { opacity: 0, transition: { duration: 0.25 } } 
  };

  const toastVariants = {
    hidden: { opacity: 0, y: -50, scale: 0.9 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25, duration: 0.3 } },
    exit: { opacity: 0, y: 50, scale: 0.9, transition: { duration: 0.3 } }
  };

  // Determine the title for the show list section.
  let listTitle = "";
  if (hasSearched) {
    // If a search was done and no results found (and not currently searching).
    if (exactMatches.length === 0 && filteredBroadenedShows.length === 0 && !isSearching) {
      listTitle = `No results for "${query}"`;
    }
  } else if (!isSearching && filteredBroadenedShows.length > 0) {
    // If no search done, not searching, and trending shows are present.
    listTitle = "Trending This Week";
  }

  // Main render method for the ShowGrid component.
  return (
    <div className="min-h-screen bg-[#1e1e1e] py-16 px-4 pb-8"> {/* Main page container */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-semibold text-center text-[#1963da] mb-8">Log Shows</h1>
        {/* Search bar component */}
        <SearchBar query={query} setQuery={setQuery} onSearch={searchShows} isSearching={isSearching} />
        {/* Filters, shown only if a search has yielded results */}
        {hasSearched && (exactMatches.length > 0 || broadenedShows.length > 0) && (
          <div className="max-w-4xl mx-auto mt-6">
            <TVShowFilters shows={broadenedShows} onFilter={setFilteredBroadenedShows} />
          </div>
        )}
        {/* Display total results count if a search has been performed */}
        {hasSearched && <div className="w-full text-center my-4"><p className="text-gray-400 inline-block">Found {totalResults} results for "{query}"</p></div>}
        
        {/* Container for displaying show grids (exact matches, other results/trending) */}
        <div className="mt-10">
          <div className="space-y-12">
            {/* Section for Exact Matches */}
            {exactMatches.length > 0 && (
              <section className="pt-4">
                <h2 className="text-2xl font-semibold text-[#f1f1f1] mb-6">Exact Matches</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                  {exactMatches.map((show) => (
                    // Animated show card
                    <motion.div key={show.id} className="bg-zinc-900 rounded-2xl overflow-hidden shadow-lg cursor-pointer" variants={fadeInUp} initial="hidden" animate="visible" whileHover={{ scale: 1.05 }} transition={{ duration: 0.3, ease: "easeOut" }} onClick={() => handleCardClick(show)}>
                      <img src={show.poster_path ? IMAGE_BASE_URL + show.poster_path : "https://via.placeholder.com/500x750?text=No+Image"} alt={show.name} className="w-full h-72 object-cover"/>
                      <div className="p-4">
                        <h3 className="text-white text-lg font-bold mb-2 truncate">{show.name}</h3>
                        <p className="text-gray-400 text-sm font-semibold flex items-center gap-1">
                          <AppleRatingDisplay rating={show.vote_average / 2} appleSize="w-4 h-4" />
                          {show.vote_average ? `${(show.vote_average / 2).toFixed(2)} (${show.vote_count})` : "N/A"}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}
            {/* Section for Other Results or Trending Shows */}
            {(filteredBroadenedShows.length > 0 || (listTitle && listTitle.startsWith("No results"))) && (
              <section className="pt-4">
                {/* Dynamic section title */}
                {hasSearched && exactMatches.length > 0 && filteredBroadenedShows.length > 0 && <h2 className="text-2xl font-semibold text-[#f1f1f1] mb-6">Other Results</h2>}
                {!hasSearched && filteredBroadenedShows.length > 0 && <h2 className="text-2xl font-semibold text-[#f1f1f1] mb-6">{listTitle}</h2>}
                {hasSearched && exactMatches.length === 0 && filteredBroadenedShows.length > 0 && <h2 className="text-2xl font-semibold text-[#f1f1f1] mb-6">Results</h2>}
                {/* Display "No results" message if applicable */}
                {listTitle && listTitle.startsWith("No results") && <p className="text-xl text-center text-gray-400 mt-8">{listTitle}</p>}
                {/* Grid for broadened/filtered/trending shows */}
                {filteredBroadenedShows.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                    {filteredBroadenedShows.map((show) => (
                      <motion.div key={show.id} className="bg-zinc-900 rounded-2xl overflow-hidden shadow-lg cursor-pointer" variants={fadeInUp} initial="hidden" animate="visible" whileHover={{ scale: 1.05 }} transition={{ duration: 0.3, ease: "easeOut" }} onClick={() => handleCardClick(show)}>
                        <img src={show.poster_path ? IMAGE_BASE_URL + show.poster_path : "https://via.placeholder.com/500x750?text=No+Image"} alt={show.name} className="w-full h-72 object-cover"/>
                        <div className="p-4">
                            <h3 className="text-white text-lg font-bold mb-2 truncate">{show.name}</h3>
                            <p className="text-gray-400 text-sm font-semibold flex items-center gap-1">
                                <AppleRatingDisplay rating={show.vote_average / 2} appleSize="w-4 h-4" />
                                {show.vote_average ? `${(show.vote_average / 2).toFixed(2)} (${show.vote_count})` : "N/A"}
                            </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </section>
            )}
            {/* Loading message while searching (and no prior results or "no results" shown) */}
            {isSearching && (!hasSearched || (exactMatches.length === 0 && filteredBroadenedShows.length === 0)) && <div className="text-center text-gray-400 py-10">Loading shows...</div>}
            {/* "Load More" button for paginated search results */}
            {hasSearched && filteredBroadenedShows.length + exactMatches.length < totalResults && !isSearching && <div className="flex justify-center mt-8"><button className="bg-[#1963da] hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={loadMore}>Load More</button></div>}
          </div>
        </div>
      </motion.div>

      {/* Modal for displaying show details, episode list, and review form */}
      <AnimatePresence>
        {selectedShow && selectedShowDetails && ( // Render modal only if a show is selected and its details are loaded
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-75 flex items-start justify-center z-50 p-4 pt-6 sm:pt-8 md:pt-10" // Modal overlay
            initial="hidden" 
            animate="visible" 
            exit="exit" 
            variants={overlayVariants} // Use overlay animation variants
            onClick={closeModal} // Close modal on overlay click
          >
            <motion.div 
                className="bg-zinc-900 rounded-xl shadow-xl text-white w-full max-w-5xl max-h-[80vh] overflow-y-auto relative scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-800" // Modal content container
                variants={modalVariants} // Use modal animation variants
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside content
            >
              {/* Close button for the modal */}
              <button 
                onClick={closeModal} 
                className="absolute top-6 right-6 text-gray-400 hover:text-white z-20" 
                aria-label="Close review modal"
                disabled={!modalCanClose} // Disable if modal shouldn't close (e.g., during toast)
              >
                <X size={28} />
              </button>
              {/* Modal content body */}
              <div className="p-4 space-y-3"> {/* Padding and spacing for content */}
                {/* Backdrop image and show title overlay */}
                <div className="relative w-full rounded-lg overflow-hidden mb-4">
                  <img
                    src={selectedShowDetails.backdrop_path ? BACKDROP_BASE_URL + selectedShowDetails.backdrop_path : (selectedShowDetails.poster_path ? IMAGE_BASE_URL + selectedShowDetails.poster_path : "https://via.placeholder.com/1280x720?text=No+Image&fontsize=50")} // Use backdrop, then poster, then placeholder
                    alt={selectedShowDetails.name}
                    className="w-full h-auto object-cover max-h-[50vh] block" // Responsive image
                  />
                  {/* Dark overlay with centered show title */}
                  <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4">
                    <h2 className="text-3xl sm:text-5xl font-bold text-white text-center shadow-lg mb-[1vh] sm:mb-[2vh] lg:mb-[4vh]">
                      {selectedShowDetails.name}
                    </h2>
                  </div>
                </div>

                {/* Episode List section */}
                <div className="mt-8">
                  {isLoadingShowDetails ? (
                    <div className="text-center py-4 text-gray-400">Loading season information...</div>
                  ) : formattedShowSeasons && formattedShowSeasons.length > 0 && selectedShowDetails ? (
                    // Render EpisodeList component if data is available
                    <EpisodeList 
                        seasons={formattedShowSeasons} 
                        showId={selectedShowDetails.id} 
                        isAuthenticated={isAuthenticatedForReview} // Pass auth status for enabling actions
                        showName={selectedShowDetails.name}
                        posterPath={selectedShowDetails.poster_path}
                        setShowWatchedToast={setShowWatchedToast} // Pass toast control functions
                        setWatchedToastMessage={setWatchedToastMessage}
                    />
                  ) : (
                    // Message if no season info is available (and not loading)
                    !isLoadingShowDetails && <div className="text-center py-3 text-gray-400">No season information available for this show.</div>
                  )}
                </div>

                {/* Review Form section */}
                <div className="space-y-3 pt-2">
                  <form onSubmit={handleReviewSubmit} className="bg-[#2a2a2a] rounded-xl p-6 shadow-lg">
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">
                      Review for "{selectedShowDetails.name}"
                    </h3>

                    {/* Rating input section */}
                    <div className="mb-6">
                        <label className="block text-gray-300 mb-2 font-semibold text-lg">Rating</label>
                        {/* Interactive apple rating display */}
                        <AppleRatingDisplay 
                            rating={ratingWhole + (Number(ratingDecimal) || 0) / 100} // Combine whole and decimal for display
                            appleSize="w-8 h-8" 
                            onAppleClick={handleInteractiveAppleClick} // Handle click to set rating
                            interactive={true}
                        />
                        {/* Numeric input for precise rating (whole and decimal parts) */}
                        <div className="flex items-center gap-1.5 mt-3">
                        <input type="number" min={1} max={5} value={ratingWhole} aria-label="Rating whole number" onChange={(e) => { const v = e.target.value; if (v === "") { setRatingWhole(""); } else { const n = parseInt(v, 10); if (!isNaN(n) && n >= 1 && n <= 5) { setRatingWhole(n); } } }} onBlur={(e) => { const currentValInInput = e.target.value; if (currentValInInput === "") { setRatingWhole(1); } else { const n = parseInt(currentValInInput, 10); if (isNaN(n) || n < 1) { setRatingWhole(1); } else if (n > 5) { setRatingWhole(5); } else { setRatingWhole(n); } } }} className="bg-zinc-800 border-2 border-black p-2 rounded-md text-gray-200 w-15 text-center text-md focus:ring-1 focus:ring-[#1963da] outline-none"/>
                        <span className="text-gray-200 text-lg font-bold select-none">.</span>
                        <input type="number" min={0} max={99} aria-label="Rating decimal part" value={ratingDecimal} onFocus={(e)=>{if(e.target.value==="0"||e.target.value==="00")setRatingDecimal("");}} onChange={(e)=>{const v=e.target.value;if(v==="")setRatingDecimal("");else{const n=Number(v);if(!isNaN(n)&&n>=0&&n<=99&&v.length<=2)setRatingDecimal(v);}}} onBlur={(e)=>{let s=e.target.value;if(s==="")setRatingDecimal(0);else{let n=Number(s);if(s.length===1&&n<10)setRatingDecimal("0"+n);else setRatingDecimal(s);}}} disabled={ratingWhole>=5} className={`bg-zinc-800 border-2 border-black p-2 rounded-md text-gray-200 w-15 text-center text-md focus:ring-1 focus:ring-[#1963da] outline-none ${ratingWhole>=5?"opacity-50 cursor-not-allowed":""}`}/>
                        </div>
                    </div>

                    {/* Review text input section */}
                    <div className="mb-6">
                        <label htmlFor="review-text-modal" className="block text-gray-300 mb-2 font-semibold text-lg">Your Review</label>
                        <textarea
                            id="review-text-modal"
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            className="bg-zinc-800 border-2 border-black rounded-md p-2 w-full text-gray-200 text-md focus:ring-1 focus:ring-[#1963da] outline-none resize-none" // No resize handle
                            rows={5}
                            maxLength={2000} // Max character limit
                            placeholder={`Share your thoughts about ${selectedShowDetails.name}...`}
                        />
                        {/* Spoiler checkbox */}
                        <div className="flex items-center gap-2 mt-3"> 
                            <input
                                type="checkbox"
                                id="spoiler-checkbox-modal"
                                checked={containsSpoilers}
                                onChange={(e) => setContainsSpoilers(e.target.checked)}
                                className="form-checkbox h-5 w-5 text-yellow-500 bg-zinc-700 border-zinc-600 rounded focus:ring-yellow-500 focus:ring-offset-zinc-800 cursor-pointer"
                            />
                            <label htmlFor="spoiler-checkbox-modal" className="text-md text-gray-300 select-none font-medium cursor-pointer">
                                Contains Spoilers
                            </label>
                        </div>
                    </div>

                    {/* Display review submission error if any */}
                    {reviewError && (
                      <div className="mb-4 p-3 bg-red-900/30 border border-red-700 text-red-400 text-sm rounded-md">
                        {reviewError}
                      </div>
                    )}

                    {/* Form action buttons (Cancel, Submit) */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4"> 
                      <motion.button
                        type="button"
                        onClick={closeModal} // Close modal on cancel
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        className="w-full py-2.5 sm:py-3 bg-zinc-700 text-gray-300 rounded-lg hover:bg-zinc-600 transition-colors text-sm font-semibold"
                        disabled={!modalCanClose || isSubmittingReview} // Disable if modal shouldn't close or submitting
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        // Disable if not authenticated, submitting, or form is incomplete (no rating or no text)
                        disabled={!isAuthenticatedForReview || isSubmittingReview || ((ratingWhole === 0 && Number(ratingDecimal) === 0) || !reviewText.trim())}
                        className="w-full py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmittingReview ? 'Submitting...' : (isAuthenticatedForReview ? 'Submit Review' : 'Login to Review')}
                      </motion.button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast notification for successful review submission */}
      <AnimatePresence>
        {showSuccessReviewToast && (
            <motion.div
                key="review-success-toast" // Unique key for AnimatePresence
                variants={toastVariants} // Use toast animation variants
                initial="hidden"
                animate="visible"
                exit="exit"
                className="fixed top-10 inset-x-0 mx-auto w-fit z-[100] bg-zinc-800 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3" // Styling for toast
            >
                <CheckCircle size={24} /> {/* Success icon */}
                <span>Review Submitted!</span>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Toast notification for marking episodes as watched */}
      <AnimatePresence>
        {showWatchedToast && (
            <motion.div
                key="watched-success-toast" // Unique key
                variants={toastVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="fixed top-10 inset-x-0 mx-auto w-fit z-[100] bg-blue-700 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3" // Styling
            >
                <EyeIcon size={24} /> {/* Eye icon */}
                <span>{watchedToastMessage}</span> {/* Display dynamic message */}
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Export the ShowGrid component as the default.
export default ShowGrid;