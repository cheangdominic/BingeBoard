/**
 * @file TVShowFilters.js
 * @description A React component that provides filtering options for a list of TV shows.
 * Users can filter by year, minimum rating, and genre. It displays active filters as chips
 * and uses a tab-like interface for selecting filter categories.
 */

// Import React hooks (useState, useEffect) for managing state and side effects.
import { useState, useEffect } from "react";
// Import `motion` and `AnimatePresence` from framer-motion for animations.
import { motion, AnimatePresence } from "framer-motion";
// Import icons for UI elements (close button, navigation arrows).
import { MdClose, MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";

/**
 * @constant {object} genreMap
 * @description A mapping from TMDB genre IDs to human-readable genre names.
 */
const genreMap = {
  10759: "Action & Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  10762: "Kids",
  9648: "Mystery",
  10763: "News",
  10764: "Reality",
  10765: "Sci-Fi & Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics",
  37: "Western"
};

/**
 * @constant {Array<number>} ratingSteps
 * @description An array defining the steps for minimum rating filters (e.g., >= 1 star, >= 2 stars, etc.).
 * These values likely correspond to a 1-5 star rating system.
 */
const ratingSteps = [1, 2, 3, 4]; // Assuming these are "at least X stars"

/**
 * @function TVShowFilters
 * @description A React functional component that allows users to filter a list of TV shows.
 *
 * @param {object} props - The properties passed to the component.
 * @param {Array<object>} props.shows - The array of TV show objects to be filtered. Each show object
 *                                      should have properties like `genre_ids`, `first_air_date`, `vote_average`.
 * @param {function(Array<object>): void} props.onFilter - Callback function invoked when filters are applied.
 *                                                        It receives the array of filtered shows as an argument.
 * @returns {JSX.Element} The rendered TVShowFilters component.
 */
export default function TVShowFilters({ shows, onFilter }) {
  // State to store the currently selected filter values for each category (year, minRating, genre).
  const [filters, setFilters] = useState({
    year: [],      // Array of selected years (strings)
    minRating: [], // Array of selected minimum ratings (numbers)
    genre: [],     // Array of selected genre IDs (strings or numbers, converted to string for consistency)
  });

  // State to store the unique genres available in the provided `shows` list.
  const [availableGenres, setAvailableGenres] = useState([]);
  // State to store the unique years available in the provided `shows` list.
  const [availableYears, setAvailableYears] = useState([]);
  // State to store the count of shows that match the current filters (before formally applying).
  const [filteredCount, setFilteredCount] = useState(shows.length);
  // State to manage the currently active filter tab (e.g., "year", "minRating", "genre").
  const [activeTab, setActiveTab] = useState("year");

  /**
   * `useEffect` hook to extract available genres and years from the `shows` prop
   * whenever the `shows` list changes.
   */
  useEffect(() => {
    const genres = new Set(); // Use a Set to automatically handle unique values.
    const years = new Set();

    shows.forEach(show => {
      // Add all genre IDs from the show to the genres Set.
      show.genre_ids?.forEach(id => genres.add(id));
      // If `first_air_date` exists, extract the year and add it to the years Set.
      if (show.first_air_date) {
        years.add(show.first_air_date.split("-")[0]); // Get the year part (YYYY)
      }
    });

    // Convert Sets to arrays and update state.
    setAvailableGenres(Array.from(genres));
    setAvailableYears(Array.from(years).sort((a, b) => b - a)); // Sort years in descending order.
  }, [shows]); // Dependency: re-run effect if the `shows` prop changes.

  /**
   * Toggles a filter value for a given filter type (year, minRating, genre).
   * If the value is already selected, it's removed; otherwise, it's added.
   * @param {'year' | 'minRating' | 'genre'} type - The type of filter.
   * @param {string | number} value - The filter value to toggle.
   */
  const toggleFilter = (type, value) => {
    setFilters(prev => {
      const isActive = prev[type].includes(value); // Check if the value is currently active.
      return {
        ...prev,
        [type]: isActive
          ? prev[type].filter(v => v !== value) // If active, remove it.
          : [...prev[type], value]              // If not active, add it.
      };
    });
  };

  /**
   * Applies the currently selected filters to the `shows` list and calls `onFilter`
   * with the filtered results. Also updates `filteredCount`.
   */
  const applyFilters = () => {
    const filtered = shows.filter(show => {
      // Apply year filter.
      if (filters.year.length && show.first_air_date) {
        const showYear = show.first_air_date.split("-")[0];
        if (!filters.year.includes(showYear)) return false; // Exclude if show's year is not in selected years.
      }

      // Apply minimum rating filter.
      // Note: `vote_average` from TMDB is typically out of 10. `ratingSteps` are 1-4.
      // The condition `show.vote_average >= r * 2` assumes `ratingSteps` refer to a 1-5 star system,
      // and TMDB's 0-10 rating is converted (e.g., 1 star = TMDB 2, 4 stars = TMDB 8).
      if (filters.minRating.length) {
        if (show.vote_average == null || !filters.minRating.some(r => show.vote_average >= r * 2)) {
          // Exclude if show's rating doesn't meet any selected minimum rating.
          return false;
        }
      }

      // Apply genre filter.
      if (filters.genre.length && show.genre_ids) {
        // Exclude if none of the show's genres match any selected genres.
        if (!filters.genre.some(g => show.genre_ids.includes(parseInt(g)))) { // Ensure genre ID 'g' is parsed to int for comparison.
          return false;
        }
      }

      return true; // Include show if it passes all active filters.
    });

    setFilteredCount(filtered.length); // Update the count of matching shows.
    onFilter(filtered); // Call the parent component's filter handler with the results.
  };

  /**
   * Resets all filters to their default empty state, updates `filteredCount` to total shows,
   * and calls `onFilter` with the original (unfiltered) `shows` list.
   */
  const resetFilters = () => {
    setFilters({ year: [], minRating: [], genre: [] }); // Clear all selected filters.
    setFilteredCount(shows.length); // Reset count to total.
    onFilter(shows); // Pass original list to parent.
  };

  /**
   * Removes a single active filter chip when its close button is clicked.
   * @param {'year' | 'minRating' | 'genre'} type - The type of filter.
   * @param {string | number} value - The filter value to remove.
   */
  const removeSingleFilter = (type, value) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].filter(v => v !== value) // Remove the specified value from the filter array.
    }));
    // Note: `applyFilters()` is not called here directly. The user would typically click "Apply"
    // again, or this removal could implicitly trigger `applyFilters` via a `useEffect` on `filters` (not currently implemented).
  };

  // Configuration for filter tabs (for UI display and navigation).
  const filterTabs = [
    { id: "year", label: "Year", color: "bg-blue-600" }, // Color for active tab indicator.
    { id: "minRating", label: "Rating", color: "bg-yellow-500" },
    { id: "genre", label: "Genre", color: "bg-blue-900" }
  ];

  // Map for displaying a user-friendly label for the active filter tab.
  const tabLabelMap = {
    year: "Filter by Year",
    minRating: "Filter by Rating",
    genre: "Filter by Genre"
  };

  // Render the filter UI.
  return (
    <div className="w-full">
      {/* Display area for active filter chips (removable). */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide"> {/* `scrollbar-hide` for custom scrollbar styling. */}
        <AnimatePresence> {/* Handles enter/exit animations for chips. */}
          {/* Map over selected year filters to display chips. */}
          {filters.year.map(y => (
            <motion.span
              key={`year-${y}`} // Unique key for animation.
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full flex items-center gap-1 shrink-0" // Styling.
            >
              {y} {/* Year value. */}
              <button onClick={() => removeSingleFilter("year", y)} className="text-gray-300 hover:text-white transition">
                <MdClose size={16} /> {/* Close button icon. */}
              </button>
            </motion.span>
          ))}
          {/* Map over selected minimum rating filters to display chips. */}
          {filters.minRating.map(r => (
            <motion.span
              key={`rating-${r}`}
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
              className="px-3 py-1 bg-yellow-500 text-gray-900 text-sm rounded-full flex items-center gap-1 shrink-0"
            >
              ≥ {r} {/* Rating value (e.g., "≥ 4"). */}
              <button onClick={() => removeSingleFilter("minRating", r)} className="text-gray-600 hover:text-gray-800 transition">
                <MdClose size={16} />
              </button>
            </motion.span>
          ))}
          {/* Map over selected genre filters to display chips. */}
          {filters.genre.map(g => (
            <motion.span
              key={`genre-${g}`}
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
              className="px-3 py-1 bg-blue-900 text-white text-sm rounded-full flex items-center gap-1 shrink-0"
            >
              {genreMap[g] || g} {/* Genre name from `genreMap` or ID if not found. */}
              <button onClick={() => removeSingleFilter("genre", g)} className="text-gray-300 hover:text-white transition">
                <MdClose size={16} />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      {/* Tab indicator dots for navigating between filter categories. */}
      <div className="flex justify-center gap-2 mb-2">
        {filterTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)} // Set active tab on click.
            // Dynamic styling for active vs. inactive tab indicators.
            className={`w-2 h-2 rounded-full transition-all ${activeTab === tab.id ? tab.color + " opacity-100" : "bg-gray-400 opacity-30"}`}
            aria-label={`Show ${tab.label} filters`} // Accessibility.
          />
        ))}
      </div>

      {/* Label displaying the current active filter category. */}
      <h3 className="text-sm font-semibold text-gray-600 text-center mb-2">
        {tabLabelMap[activeTab]}
      </h3>

      {/* Container for the filter options of the active tab, with animations for tab switching. */}
      <div className="overflow-hidden"> {/* `overflow-hidden` to contain sliding animations. */}
        <AnimatePresence mode="wait"> {/* `mode="wait"` ensures exit animation completes before enter. */}
          <motion.div
            key={activeTab} // Key changes with `activeTab`, triggering enter/exit animations.
            // Initial, animate, and exit states for horizontal slide animation.
            initial={{ x: activeTab === "year" ? -50 : 50, opacity: 0 }} // Slide direction depends on which tab is shown
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: activeTab === "year" ? -50 : 50, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex justify-center" // Center the content within this div.
          >
            {/* Conditional rendering for Year filter options. */}
            {activeTab === "year" && (
              <div className="flex gap-2 overflow-x-auto px-1 scrollbar-hide"> {/* Horizontally scrollable year buttons. */}
                {availableYears.map(year => (
                  <motion.button
                    key={year}
                    whileTap={{ scale: 0.95 }} // Tap animation.
                    onClick={() => toggleFilter("year", year)} // Toggle year filter.
                    // Dynamic styling for selected vs. unselected year buttons.
                    className={`px-3 py-1 rounded-full text-xs font-medium shrink-0
                      ${filters.year.includes(year)
                        ? "bg-blue-600 text-white" // Selected style.
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"} // Unselected style.
                    `}
                  >
                    {year}
                  </motion.button>
                ))}
              </div>
            )}

            {/* Conditional rendering for Minimum Rating filter options. */}
            {activeTab === "minRating" && (
              <div className="flex gap-2">
                {ratingSteps.map(rating => (
                  <motion.button
                    key={rating}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleFilter("minRating", rating)}
                    className={`px-3 py-1 rounded-full text-xs font-medium
                      ${filters.minRating.includes(rating)
                        ? "bg-yellow-500 text-gray-900" // Selected style.
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"} // Unselected style.
                    `}
                  >
                    ≥ {rating} {/* e.g., "≥ 4" */}
                  </motion.button>
                ))}
              </div>
            )}

            {/* Conditional rendering for Genre filter options. */}
            {activeTab === "genre" && (
              <div className="flex gap-2 flex-wrap justify-center"> {/* `flex-wrap` for multiple genre buttons. */}
                {availableGenres.map(genreId => (
                  <motion.button
                    key={genreId}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleFilter("genre", genreId.toString())} // Ensure genreId is string for `includes` consistency.
                    className={`px-3 py-1 rounded-full text-xs font-medium
                      ${filters.genre.includes(genreId.toString())
                        ? "bg-blue-900 text-white" // Selected style.
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"} // Unselected style.
                    `}
                  >
                    {genreMap[genreId] || genreId} {/* Display genre name or ID if name not in map. */}
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation arrows to switch between filter tabs. */}
      <div className="flex justify-between mt-3 px-1">
        {/* Previous tab button. */}
        <button
          onClick={() => {
            const currentIndex = filterTabs.findIndex(tab => tab.id === activeTab);
            // Calculate previous tab index, wrapping around.
            const prevTab = filterTabs[(currentIndex - 1 + filterTabs.length) % filterTabs.length];
            setActiveTab(prevTab.id);
          }}
          className="text-gray-400 hover:text-gray-600 transition"
        >
          <MdArrowBackIos size={20} /> {/* Back arrow icon. */}
        </button>
        {/* Next tab button. */}
        <button
          onClick={() => {
            const currentIndex = filterTabs.findIndex(tab => tab.id === activeTab);
            // Calculate next tab index, wrapping around.
            const nextTab = filterTabs[(currentIndex + 1) % filterTabs.length];
            setActiveTab(nextTab.id);
          }}
          className="text-gray-400 hover:text-gray-600 transition"
        >
          <MdArrowForwardIos size={20} /> {/* Forward arrow icon. */}
        </button>
      </div>

      {/* Action buttons: Reset and Apply filters. */}
      <div className="flex justify-end gap-2 mt-4">
        {/* Reset button. */}
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={resetFilters} // Call `resetFilters` on click.
          className="px-3 py-1 text-xs text-gray-600 hover:text-gray-900 transition"
        >
          Reset
        </motion.button>
        {/* Apply button, also displays the count of matching shows. */}
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={applyFilters} // Call `applyFilters` on click.
          className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Apply ({filteredCount} matches) {/* Display match count. */}
        </motion.button>
      </div>
    </div>
  );
}