/**
 * @file EpisodeListView.js
 * @description A React component that displays a list of episodes for a TV show,
 * organized by season. It includes a season dropdown selector and allows expanding
 * individual episodes to view their details.
 */

// Import React and hooks (useState, useEffect) for component logic.
import React, { useEffect, useState } from "react";
// Import icons (Star for rating, ChevronDown for dropdown/expand) from lucide-react.
import { Star, ChevronDown } from "lucide-react";
// Import `fetchSeasonEpisodes` function, presumably from a TMDB API utility file.
// The path '/src/backend/tmdb' suggests this might be a utility function intended for backend use,
// or it's a client-side utility that directly calls the TMDB API.
import { fetchSeasonEpisodes } from '/src/backend/tmdb'; // Path might need adjustment based on project structure.

/**
 * @function EpisodeListView
 * @description A React functional component that renders a list of TV show episodes.
 * Users can select a season from a dropdown, and then view episodes for that season.
 * Each episode can be expanded to show its overview.
 *
 * @param {object} props - The properties passed to the component.
 * @param {Array<object>} [props.seasons=[]] - An array of season objects for the show.
 *                                            Each season object should have `number`, `name` (optional),
 *                                            `episodeCount` (optional), and potentially `rating`.
 * @param {string|number} props.showId - The ID of the TV show whose episodes are being displayed.
 * @returns {JSX.Element} The rendered EpisodeListView component.
 */
const EpisodeListView = ({ seasons = [], showId }) => {
  /**
   * State variable for the currently active/selected season number.
   * Defaults to the number of the first season in the `seasons` array, or 1 if no seasons.
   * @type {[number, function(number): void]}
   */
  const [activeSeason, setActiveSeason] = useState(seasons[0]?.number || 1);
  /**
   * State variable to control the visibility of the season selection dropdown.
   * @type {[boolean, function(boolean): void]}
   */
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  /**
   * State variable to store the ID of the currently expanded episode (to show its overview).
   * `null` if no episode is expanded.
   * @type {[string|number|null, function(string|number|null): void]}
   */
  const [expandedEpisode, setExpandedEpisode] = useState(null);
  /**
   * State variable to cache fetched episodes, keyed by season number.
   * e.g., `{ 1: [episode1, episode2], 2: [episodeA, episodeB] }`
   * @type {[object, function(object): void]}
   */
  const [episodesBySeason, setEpisodesBySeason] = useState({});
  /**
   * State variable to track if episodes for the active season are currently loading.
   * @type {[boolean, function(boolean): void]}
   */
  const [loading, setLoading] = useState(false);
  /**
   * State variable to control whether all episodes of the active season are shown
   * or a limited number (for pagination/"View All" functionality).
   * @type {[boolean, function(boolean): void]}
   */
  const [viewAll, setViewAll] = useState(false);

  // Constant defining the limit for initially displayed episodes per season.
  const EPISODES_LIMIT = 10;

  // Find the current season's data from the `seasons` array. Defaults to an empty object.
  const currentSeason = seasons.find(season => season.number === activeSeason) || {};
  // Get episodes for the `activeSeason` from the cache, or an empty array.
  const episodes = episodesBySeason[activeSeason] || [];
  // Determine which episodes to display based on `viewAll` state and `EPISODES_LIMIT`.
  const displayedEpisodes = viewAll ? episodes : episodes.slice(0, EPISODES_LIMIT);
  // Check if there are more episodes to show beyond the limit.
  const hasMoreEpisodes = episodes.length > EPISODES_LIMIT;

  /**
   * `useEffect` hook to load episodes for the `activeSeason` when it changes,
   * or when `showId` changes, or if episodes for that season aren't already fetched.
   */
  useEffect(() => {
    /**
     * Asynchronous function to load episodes for the `activeSeason`.
     * @async
     */
    const loadEpisodes = async () => {
      // Fetch episodes only if they haven't been fetched and cached for this season yet.
      if (!episodesBySeason[activeSeason]) {
        setLoading(true); // Set loading state.
        try {
          // Call the utility function to fetch episodes from TMDB (or another source).
          const fetchedEpisodes = await fetchSeasonEpisodes(showId, activeSeason);
          // Update the cache with fetched episodes for the current season.
          setEpisodesBySeason(prev => ({
            ...prev,
            [activeSeason]: fetchedEpisodes
          }));
        } catch (err) {
          // Log error if fetching fails.
          console.error("Failed to load episodes:", err.message);
          // Optionally, set an error state here to display to the user.
        } finally {
          setLoading(false); // Reset loading state.
        }
      }
    };

    loadEpisodes();
  }, [activeSeason, showId, episodesBySeason]); // Dependencies for the effect.

  /**
   * `useEffect` hook to reset the `viewAll` state (collapse episode list)
   * whenever the `activeSeason` changes.
   */
  useEffect(() => {
    setViewAll(false); // Reset to show limited episodes when season changes.
  }, [activeSeason]);

  /**
   * Formats a rating number for display.
   * @param {number|string} rating - The rating value.
   * @returns {string} The formatted rating string (e.g., "7.5") or "N/A".
   */
  const displayRating = (rating) => {
    // If rating is a number and greater than 0, format to one decimal place. Otherwise, show "N/A".
    return (typeof rating === "number" && rating > 0) ? rating.toFixed(1) : "N/A";
  };

  // Render the episode list view UI.
  return (
    // Main container for the episode list section.
    <div className="mt-8 space-y-6">
      {/* Season Dropdown Selector */}
      <div className="relative"> {/* Relative positioning for the dropdown panel. */}
        {/* Button to toggle the season dropdown. */}
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center justify-between w-full md:w-72 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white px-5 py-3 rounded-xl transition-colors"
        >
          <span className="font-medium">Season {activeSeason}</span> {/* Display active season. */}
          {/* Chevron icon that rotates based on dropdown open state. */}
          <ChevronDown className={`w-5 h-5 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
        </button>

        {/* Dropdown panel containing the list of seasons. */}
        {isDropdownOpen && (
          <div className="absolute z-10 mt-2 w-full md:w-72 bg-[#2a2a2a] rounded-xl shadow-lg border border-[#3a3a3a]">
            {/* Map over the `seasons` array to create a button for each season. */}
            {seasons.map((season) => (
              <button
                key={season.number} // Use season number as key.
                onClick={() => {
                  setActiveSeason(season.number); // Set active season.
                  setIsDropdownOpen(false);      // Close dropdown.
                  setExpandedEpisode(null);      // Collapse any expanded episode.
                }}
                // Dynamic styling for active vs. inactive season items.
                className={`w-full text-left px-5 py-3 hover:bg-[#3a3a3a] transition-colors ${activeSeason === season.number ? "text-blue-400 font-medium" : "text-gray-300"
                  }`}
              >
                Season {season.number} • {season.episodeCount || 0} episodes {/* Display season info. */}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Season Content: Displays details and episodes for the active season. */}
      <div className="bg-[#2a2a2a] p-6 rounded-xl shadow-lg">
        {/* Header for the active season's content. */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Season {currentSeason.number}</h1> {/* Season number. */}
            {/* Season's average rating (if available in `currentSeason.rating`). */}
            <div className="flex items-center text-gray-300">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 mr-1" /> {/* Star icon. */}
              <span className="font-medium">{displayRating(currentSeason.rating)}</span>
            </div>
          </div>
          {/* Number of episodes in the current season. */}
          <p className="text-gray-400 mt-2">
            {episodes.length} Episode{episodes.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Conditional rendering for episode list: loading, no episodes, or list of episodes. */}
        {loading ? (
          // Loading state: display a loading message.
          <div className="text-center py-8 text-gray-400 text-lg">Loading episodes...</div>
        ) : episodes.length > 0 ? (
          // If episodes are available, display them.
          <div className="space-y-4">
            {/* Map over `displayedEpisodes` to render each episode. */}
            {displayedEpisodes.map((episode) => (
              // Container for a single episode item.
              <div
                key={episode.id} // Use episode ID as key.
                className="bg-[#3a3a3a] rounded-xl border border-[#4a4a4a] overflow-hidden hover:border-[#5a5a5a] transition-colors"
              >
                {/* Clickable header part of the episode item to toggle expansion. */}
                <div
                  className="p-5 cursor-pointer flex justify-between items-start"
                  onClick={() => setExpandedEpisode(expandedEpisode === episode.id ? null : episode.id)} // Toggle expanded state.
                >
                  {/* Left side: Episode number, rating, title, duration. */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-1">
                      <span className="text-blue-400 font-medium">Episode {episode.number}</span>
                      {/* Display episode rating if available and > 0. */}
                      {(episode.rating > 0) && (
                        <div className="flex items-center bg-[#2a2a2a] px-2 py-1 rounded-full">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                          <span className="text-sm font-medium text-white">
                            {displayRating(episode.rating)}
                          </span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-white">
                      {episode.title || "Untitled Episode"} {/* Episode title or fallback. */}
                    </h3>
                    {/* Episode duration (if available in `episode.duration`). */}
                    <p className="text-gray-400 mt-1">{episode.duration || "Duration N/A"}</p>
                  </div>
                  {/* Right side: Chevron icon indicating expand/collapse state. */}
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${expandedEpisode === episode.id ? "rotate-180" : "" // Rotate icon when expanded.
                      }`}
                  />
                </div>

                {/* Expanded content: Episode overview/description. */}
                {/* Conditionally rendered if `expandedEpisode` matches this episode's ID. */}
                {expandedEpisode === episode.id && (
                  <div className="px-5 pb-5 pt-3 border-t border-[#4a4a4a]"> {/* Separator line. */}
                    <p className="text-gray-300 text-base leading-relaxed">
                      {episode.overview || "No description available"} {/* Overview or fallback. */}
                    </p>
                  </div>
                )}
              </div>
            ))}

            {/* "View All Episodes" / "Show Less" Button. */}
            {/* Displayed if there are more episodes than the initial limit. */}
            {hasMoreEpisodes && ( // This logic seems to be for "View All"
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => setViewAll(!viewAll)} // Toggle `viewAll` state.
                  className="bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white px-6 py-3 rounded-xl transition-colors font-medium"
                >
                  {/* Button text changes based on `viewAll` state. */}
                  {viewAll ? "Show Less" : `View All ${episodes.length} Episodes`}
                </button>
              </div>
            )}
            {/* This is a duplicated condition for "Show Less", it should be part of the above button logic
                or combined with `hasMoreEpisodes` for the "View All" button.
                If `viewAll` is true AND `episodes.length > EPISODES_LIMIT`, then show "Show Less".
                The button text logic above already handles this.
            */}
          </div>
        ) : (
          // If no episodes are found for the season (after loading).
          <div className="text-center py-8 text-gray-400 text-lg">No episodes found for this season</div>
        )}
      </div>
    </div>
  );
};

// Export the EpisodeListView component as the default export of this module.
export default EpisodeListView;