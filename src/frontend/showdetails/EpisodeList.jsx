/**
 * @file EpisodeList.jsx
 * @description A React component that displays a list of episodes for a selected TV show season.
 * It allows users to select seasons, view episodes, select multiple episodes (with drag-to-select),
 * and mark them as watched. It fetches episode data from TMDB and interacts with a backend API
 * for marking episodes as watched.
 */

// Import React hooks and utilities.
import React, { useState, useEffect, useCallback } from 'react';
// Import axios for making HTTP requests.
import axios from 'axios';
// Import icons from react-icons and lucide-react.
import { FaEye, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { X, CheckCircle, Eye as EyeIcon } from "lucide-react"; // 'Eye' aliased to 'EyeIcon'.
// Import motion and AnimatePresence from framer-motion for animations.
import { motion, AnimatePresence } from 'framer-motion';

/**
 * TMDB API Key (Example).
 * Note: It's generally better to manage API keys via environment variables and a centralized configuration,
 * rather than hardcoding them or directly using `import.meta.env` in every component that needs it.
 * This key is specifically used for fetching episode details from TMDB within this component.
 * @const {string}
 */
const TMDB_API_KEY_EXAMPLE = import.meta.env.VITE_TMDB_API_KEY;

/**
 * Fetches episodes for a specific season of a TV show directly from The Movie Database (TMDB) API.
 * @async
 * @param {string|number} showId - The ID of the TV show.
 * @param {string|number} seasonNumber - The number of the season.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of episode objects (with id, number, name, rating)
 *                                   or an empty array if the API key is missing or an error occurs.
 */
const fetchSeasonEpisodesFromTMDB = async (showId, seasonNumber) => {
  // If TMDB API key is not defined, log an error and return an empty array.
  if (!TMDB_API_KEY_EXAMPLE) {
    console.error("TMDB API Key is not defined for fetchSeasonEpisodesFromTMDB");
    return [];
  }
  try {
    // Make a GET request to the TMDB API.
    const response = await axios.get(`https://api.themoviedb.org/3/tv/${showId}/season/${seasonNumber}`, {
      params: {
        api_key: TMDB_API_KEY_EXAMPLE, // Use the API key.
        language: "en-US" // Request English language results.
      }
    });
    // Map the TMDB episode data to a simpler structure.
    return response.data.episodes.map(ep => ({
      id: ep.id,
      number: ep.episode_number,
      name: ep.name,
      rating: ep.vote_average,
    }));
  } catch (error) {
    // Log errors during fetching and return an empty array.
    console.error(`Error fetching episodes for show ${showId}, season ${seasonNumber}:`, error);
    return [];
  }
};

/**
 * Formats an episode number (which might be a string or number with non-digit characters)
 * into a clean integer.
 * @param {string|number} num - The episode number to format.
 * @returns {number} The parsed integer episode number, or 0 if parsing fails or input is invalid.
 */
const formatEpisodeNumber = (num) => {
  const numStr = String(num); // Convert to string.
  const cleanNum = numStr.replace(/[^\d]/g, ''); // Remove any non-digit characters.
  return parseInt(cleanNum, 10) || 0; // Parse to integer, default to 0 if NaN.
};

/**
 * @function EpisodeList
 * @description A component to display and manage episodes for different seasons of a TV show.
 *
 * @param {object} props - Component props.
 * @param {Array<object>} props.seasons - Array of season objects for the show (e.g., [{ id, number, name, episode_count }]).
 * @param {string|number} props.showId - ID of the current TV show.
 * @param {boolean} props.isAuthenticated - Whether the current user is authenticated.
 * @param {string} props.showName - Name of the current TV show (used for toast messages).
 * @param {string} [props.posterPath] - Poster path of the current TV show (used when marking watched).
 * @returns {JSX.Element} The rendered EpisodeList component.
 */
const EpisodeList = ({
  seasons,
  showId,
  isAuthenticated,
  showName,
  posterPath
}) => {
  // Debug log for props received by the component.
  console.log("Standalone EpisodeList - Props Received:", { seasons, showId, isAuthenticated, showName, posterPath });

  // State for the currently selected season number. Defaults to the first season's number or 1.
  const [selectedSeason, setSelectedSeason] = useState(seasons?.[0]?.number || 1);
  // State to store fetched episodes, keyed by season number, for caching.
  const [episodesBySeason, setEpisodesBySeason] = useState({});
  // State for information about currently selected episodes (for marking as watched).
  const [selectedEpisodesInfo, setSelectedEpisodesInfo] = useState([]);
  // State to track if the user is currently dragging to select multiple episodes.
  const [isDragging, setIsDragging] = useState(false);
  // State to control if all episodes of a season are shown or a limited number.
  const [viewAll, setViewAll] = useState(false);
  // State to track if episodes for the selected season are currently loading from TMDB.
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);
  // State to track if the "mark as watched" API call is in progress.
  const [isMarkingWatched, setIsMarkingWatched] = useState(false);

  // State for controlling the visibility of the "watched" toast notification.
  const [showWatchedToast, setShowWatchedToast] = useState(false);
  // State for the message content of the "watched" toast.
  const [watchedToastMessage, setWatchedToastMessage] = useState("");
  // State to indicate if the toast message is an error.
  const [toastIsError, setToastIsError] = useState(false);

  // Constant defining the limit for initially displayed episodes per season.
  const EPISODES_LIMIT = 20;

  /**
   * `useEffect` hook to reset episode-related states when `seasons` or `showId` changes.
   * It also ensures `selectedSeason` is valid or defaults to the first available season.
   */
  useEffect(() => {
    setEpisodesBySeason({}); // Clear previously fetched episodes.
    setSelectedEpisodesInfo([]); // Clear any selected episodes.
    setViewAll(false); // Reset the "view all" flag.
    setIsLoadingEpisodes(false); // Reset episodes loading flag.
    if (seasons && seasons.length > 0) {
      const firstSeasonNumber = seasons[0]?.number;
      // Check if the previously selected season is still valid within the new `seasons` array.
      const currentSeasonStillValid = seasons.find(s => s.number === selectedSeason);
      if (currentSeasonStillValid) {
        // If still valid, no change needed for selectedSeason.
      } else if (firstSeasonNumber) {
        // If not valid, default to the first season's number if available.
        setSelectedSeason(firstSeasonNumber);
      } else {
        // Fallback to season 1 if no valid season number found.
        setSelectedSeason(1);
      }
    } else {
      // Default to season 1 if no seasons data is provided.
      setSelectedSeason(1);
    }
  }, [seasons, showId]); // Rerun if seasons array or showId changes.

  /**
   * `useEffect` hook to load episodes for the `selectedSeason` when it changes,
   * or when `showId` changes, or if episodes for that season aren't already fetched.
   */
  useEffect(() => {
    const loadEpisodes = async () => {
      // Do nothing if no season is selected or no showId is available.
      if (!selectedSeason || !showId) return;
      // Fetch episodes only if they haven't been fetched and cached for this season yet.
      if (!episodesBySeason[selectedSeason]) {
        setIsLoadingEpisodes(true); // Set loading state for episodes.
        try {
          const fetchedEpisodes = await fetchSeasonEpisodesFromTMDB(showId, selectedSeason);
          // Update cache with fetched episodes for the current season.
          setEpisodesBySeason(prev => ({ ...prev, [selectedSeason]: fetchedEpisodes }));
        } catch (err) {
          // Log error and set empty array for the season in cache on failure.
          console.error(`Failed to load episodes for season ${selectedSeason}:`, err.message);
          setEpisodesBySeason(prev => ({ ...prev, [selectedSeason]: [] }));
        } finally {
          setIsLoadingEpisodes(false); // Reset loading state.
        }
      }
    };
    // Trigger episode loading if showId and selectedSeason are valid.
    if (showId && selectedSeason) {
        loadEpisodes();
    }
  }, [selectedSeason, showId, episodesBySeason]); // Dependencies.

  /**
   * `useEffect` hook to reset `viewAll` and `selectedEpisodesInfo` states
   * whenever the `selectedSeason` changes.
   */
  useEffect(() => {
    setViewAll(false); // Collapse episode list.
    setSelectedEpisodesInfo([]); // Clear selected episodes.
  }, [selectedSeason]); // Rerun if selectedSeason changes.

  /**
   * `useEffect` hook to manage the auto-hide timer for toast notifications.
   */
  useEffect(() => {
    let toastTimerId;
    if (showWatchedToast) { // If toast is shown.
      toastTimerId = setTimeout(() => {
        setShowWatchedToast(false); // Hide toast after 3 seconds.
      }, 3000);
    }
    return () => clearTimeout(toastTimerId); // Cleanup timer on unmount or if toast visibility changes.
  }, [showWatchedToast]);

  // Get episodes for the currently selected season from the cache, or an empty array.
  const episodes = episodesBySeason[selectedSeason] || [];
  // Determine which episodes to display based on `viewAll` state and `EPISODES_LIMIT`.
  const displayedEpisodes = viewAll ? episodes : episodes.slice(0, EPISODES_LIMIT);
  // Check if there are more episodes to show beyond the limit (and not currently showing all).
  const hasMoreEpisodes = episodes.length > EPISODES_LIMIT && !viewAll;

  /**
   * Handles clicking on an episode to select or deselect it for marking as watched.
   * @param {object} episode - The episode object that was clicked.
   */
  const handleEpisodeClick = (episode) => {
    setSelectedEpisodesInfo(prev => {
      const isSelected = prev.find(epInfo => epInfo.id === episode.id);
      if (isSelected) {
        // If already selected, remove it from the selection.
        return prev.filter(epInfo => epInfo.id !== episode.id);
      } else {
        // If not selected, add it to the selection (with id, number, name).
        return [...prev, { id: episode.id, number: episode.number, name: episode.name }];
      }
    });
  };

  /**
   * Handles marking selected episodes as watched by sending a request to the backend API.
   * Shows toast notifications for success or failure.
   * @async
   */
  const handleMarkAsWatched = async () => {
    // If user is not authenticated, show a warning toast and do nothing.
    if (!isAuthenticated) {
      console.warn("User not authenticated. Cannot mark as watched.");
      setWatchedToastMessage("You must be logged in to mark episodes as watched.");
      setToastIsError(true);
      setShowWatchedToast(true);
      return;
    }

    // If no episodes are selected, show a warning toast and do nothing.
    if (selectedEpisodesInfo.length === 0) {
      console.warn("Client-Side: No episodes selected. Aborting mark as watched.");
      setWatchedToastMessage("Please select at least one episode to mark as watched.");
      setToastIsError(true);
      setShowWatchedToast(true);
      return;
    }

    setIsMarkingWatched(true); // Set marking state to true.
    setToastIsError(false); // Reset toast error state.

    // Prepare data payload for the API request.
    const watchedData = {
      showId: showId ? String(showId) : null, // Ensure showId is a string or null.
      showName: showName || "Unknown Show",   // Use provided showName or a fallback.
      posterPath: posterPath === undefined ? null : posterPath, // Handle undefined posterPath.
      seasonNumber: selectedSeason,
      episodes: selectedEpisodesInfo, // Array of {id, number, name} for selected episodes.
    };

    // Debug log for data being sent.
    console.log("Client-Side (Standalone EpisodeList): Preparing to send data for marking watched:", {
        propsReceived: { showId, showNameFromProp: showName, posterPath, isAuthenticated },
        localComponentState: { selectedSeason, selectedEpisodesInfo_count: selectedEpisodesInfo.length },
        payloadToServer: watchedData
    });

    // Critical client-side validation before sending to backend.
    if (!watchedData.showId || !watchedData.showName || watchedData.posterPath === undefined ||
        !watchedData.episodes || !Array.isArray(watchedData.episodes) || watchedData.episodes.length === 0) {
      console.error("Client-Side FATAL (Standalone EpisodeList): Data is incomplete or malformed just before sending.", watchedData);
      setWatchedToastMessage("Client error: Could not prepare data. Check console.");
      setToastIsError(true);
      setShowWatchedToast(true);
      setIsMarkingWatched(false);
      return;
    }

    try {
      // Make POST request to the backend API to mark episodes as watched.
      await axios.post('/api/users/mark-watched', watchedData, { withCredentials: true });
      // On success, show a success toast message.
      setWatchedToastMessage(`${selectedEpisodesInfo.length} episode(s) from ${watchedData.showName} marked as watched!`);
      setShowWatchedToast(true);
      setSelectedEpisodesInfo([]); // Clear the selected episodes.
    } catch (error) {
      // On failure, log error and show an error toast message.
      console.error("Failed to mark episodes as watched (Standalone EpisodeList):", error.response?.data || error.message, error.response);
      setWatchedToastMessage(`Error: ${error.response?.data?.message || "Could not mark episodes."}`);
      setToastIsError(true);
      setShowWatchedToast(true);
    } finally {
      setIsMarkingWatched(false); // Reset marking state.
    }
  };

  // Handlers for enabling drag-to-select functionality for episodes.
  const handleDragStart = () => setIsDragging(true);
  const handleDragEnd = () => setIsDragging(false);

  /**
   * `useEffect` hook to add a global mouseup listener. This ensures that `isDragging` state
   * is reset if the mouse button is released outside of an episode element.
   */
  useEffect(() => {
    const endDragGlobal = () => setIsDragging(false);
    window.addEventListener('mouseup', endDragGlobal);
    // Cleanup function to remove the global event listener.
    return () => window.removeEventListener('mouseup', endDragGlobal);
  }, []); // Empty dependency array: runs only on mount and unmount.

  // Framer Motion variants for toast notification animations.
  const toastVariants = {
    hidden: { opacity: 0, y: -50, scale: 0.9 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25, duration: 0.3 } },
    exit: { opacity: 0, y: 50, scale: 0.9, transition: { duration: 0.3 } }
  };

  // If no season data is available for the show, display a message.
  if (!seasons || seasons.length === 0) {
    return <div className="text-gray-400 text-center py-3">No season data available for this show.</div>;
  }

  // Render the EpisodeList UI.
  return (
    <>
      {/* Main container for the episode list section with styling. */}
      <div className="bg-gradient-to-br from-[#272733] to-[#1c1c24] rounded-xl p-6 shadow-lg border border-[#343444]">
        {/* Header: Season title, episode count, selected count, and "First Season" button. */}
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-2xl font-bold text-gray-100">Season {selectedSeason} Episodes</h2>
            <p className="text-blue-400 text-sm mt-1">
              {episodes.length} Episode{episodes.length !== 1 ? "s" : ""} • Select to mark as watched
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-400">
              {selectedEpisodesInfo.length} selected
            </span>
            <button
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors"
              onClick={() => setSelectedSeason(seasons[0]?.number || 1)} // Navigate to the first season.
              disabled={!seasons || seasons.length <=1} // Disable if only one or no seasons.
            >
              First Season
            </button>
          </div>
        </div>

        {/* Season selector buttons (horizontally scrollable). */}
        <div className="flex space-x-3 mb-6 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-[#3a3a3a] scrollbar-track-transparent">
          {seasons.map(season => (
            <button
              key={season.id || season.number} // Use season ID or number as key.
              onClick={() => setSelectedSeason(season.number)} // Set selected season on click.
              // Dynamic classes for styling active vs. inactive season buttons.
              className={`px-5 py-2.5 rounded-lg text-sm md:text-base font-medium whitespace-nowrap transition-colors ${selectedSeason === season.number
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' // Active style.
                  : 'bg-[#343444] text-gray-300 hover:bg-[#3f3f52]'       // Inactive style.
                }`}
            >
              {season.name || `Season ${season.number}`} {/* Display season name or "Season X". */}
            </button>
          ))}
        </div>

        {/* Conditional rendering for episode grid: loading, no episodes, or episode list. */}
        {isLoadingEpisodes ? (
            <div className="text-center py-8 text-gray-400">Loading episodes...</div>
        ) : episodes.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No episodes found for this season.</div>
        ) : (
          // Grid for displaying individual episode numbers.
          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-4 mb-6">
            {displayedEpisodes.map(ep => {
              const isSelected = selectedEpisodesInfo.some(selEp => selEp.id === ep.id);
              const canSelect = isAuthenticated; // User can select episodes if authenticated.
              const ratingValue = typeof ep.rating === 'number' ? ep.rating : parseFloat(ep.rating);
              // Format rating for display, show "N/A" if rating is not a valid number or is zero.
              const displayRating = !isNaN(ratingValue) && ratingValue > 0 ? ratingValue.toFixed(1) : 'N/A';

              return (
                // Clickable div for each episode.
                <div
                  key={ep.id}
                  onClick={canSelect ? () => handleEpisodeClick(ep) : undefined}
                  onMouseDown={canSelect ? handleDragStart : undefined} // Start drag selection.
                  onMouseUp={canSelect ? handleDragEnd : undefined}     // End drag selection.
                  onMouseEnter={canSelect && isDragging ? () => handleEpisodeClick(ep) : undefined} // Select on mouse enter while dragging.
                  // Dynamic classes for styling selected, unselected, or unselectable episodes.
                  className={`aspect-square rounded-lg flex items-center justify-center relative transition-all cursor-pointer
                    ${canSelect
                      ? isSelected
                        ? 'bg-blue-600 border-2 border-blue-400 shadow-lg shadow-blue-500/20' // Selected style.
                        : 'bg-[#343444] hover:bg-[#3f3f52] border border-[#4a4a5a]'          // Unselected style.
                      : 'bg-[#343444] border border-[#4a4a5a] cursor-not-allowed'             // Unselectable style.
                    }`}
                  title={`Ep. ${formatEpisodeNumber(ep.number)}: ${ep.name || ''} - Rating: ${displayRating}`} // Tooltip with episode info.
                >
                  {/* Display formatted episode number. */}
                  <span className="text-sm font-medium text-gray-200">{formatEpisodeNumber(ep.number)}</span>
                  {/* Hover overlay to show episode rating (if available and selectable). */}
                  {canSelect && displayRating !== 'N/A' && (
                    <div className={`absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 ${isDragging && !isSelected ? '' : 'hover:opacity-100'} transition-opacity rounded-lg`}>
                      <span className="text-sm font-bold text-yellow-400">
                        {displayRating}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* "View All Episodes" button, shown if there are more episodes than the limit. */}
        {hasMoreEpisodes && (
          <div className="flex justify-center mb-6">
            <button
              onClick={() => setViewAll(true)} // Set `viewAll` to true to show all episodes.
              className="flex items-center space-x-2 bg-[#343444] hover:bg-[#3f3f52] text-white px-6 py-2.5 rounded-lg transition-colors font-medium"
            >
              <span>{`View All ${episodes.length} Episodes`}</span>
              <FaChevronDown className="text-sm" /> {/* Chevron down icon. */}
            </button>
          </div>
        )}
        {/* "Show Less" button, shown if all episodes are currently viewed and exceed the limit. */}
        {viewAll && episodes.length > EPISODES_LIMIT && (
            <div className="flex justify-center mb-6">
            <button
                onClick={() => setViewAll(false)} // Set `viewAll` to false to show limited episodes.
                className="flex items-center space-x-2 bg-[#343444] hover:bg-[#3f3f52] text-white px-6 py-2.5 rounded-lg transition-colors font-medium"
            >
                <span>Show Less</span>
                <FaChevronUp className="text-sm" /> {/* Chevron up icon. */}
            </button>
            </div>
        )}

        {/* "Mark Selected as Watched" button, shown if user is authenticated. */}
        {isAuthenticated && (
          <button
            onClick={handleMarkAsWatched}
            disabled={!isAuthenticated || selectedEpisodesInfo.length === 0 || isMarkingWatched} // Disable conditions.
            // Dynamic classes for styling based on button state.
            className={`w-full py-3.5 rounded-lg font-medium flex items-center justify-center space-x-3 transition-colors text-lg ${
                isAuthenticated && selectedEpisodesInfo.length > 0 && !isMarkingWatched
                ? 'bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white shadow-lg shadow-green-500/20' // Active style.
                : 'bg-[#343444] text-gray-400 cursor-not-allowed' // Disabled style.
              }`}
          >
            <FaEye className="text-base" /> {/* Eye icon. */}
            <span>{isMarkingWatched ? "Marking..." : "Mark Selected as Watched"}</span>
            {/* Badge showing count of selected episodes (if any selected and not marking). */}
            {isAuthenticated && selectedEpisodesInfo.length > 0 && !isMarkingWatched && (
              <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-sm">
                {selectedEpisodesInfo.length}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Toast notification for "mark as watched" actions. */}
      <AnimatePresence>
        {showWatchedToast && (
            <motion.div
                key="episode-list-watched-toast" // Unique key for AnimatePresence.
                variants={toastVariants} // Apply toast animation variants.
                initial="hidden"
                animate="visible"
                exit="exit"
                // Dynamic class for toast background color based on whether it's an error.
                className={`fixed top-10 inset-x-0 mx-auto w-fit z-[200] text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 ${toastIsError ? 'bg-red-600' : 'bg-zinc-900'}`}
            >
                {/* Icon based on error state. */}
                {toastIsError ? <X size={24} /> : <EyeIcon size={24} />}
                <span>{watchedToastMessage}</span> {/* Display toast message. */}
            </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Export the EpisodeList component as the default.
export default EpisodeList;