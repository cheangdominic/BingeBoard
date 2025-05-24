/**
 * @file TvShowSearchGrid.jsx
 * @description A React component that handles searching for TV shows using the TMDB API.
 * It displays search results, including exact matches and broader results, in a grid format.
 * It also features filtering capabilities and a "load more" functionality for pagination.
 * Initially, it shows trending TV shows of the week.
 */

// Import React hooks (useState, useEffect) for managing component state and side effects.
import { useState, useEffect } from "react";
// Import axios for making HTTP requests to the TMDB API.
import axios from "axios";
// Import `motion` from framer-motion for animations.
import { motion } from "framer-motion";
// Import `useNavigate` from react-router-dom for programmatic navigation (e.g., to show detail pages).
import { useNavigate } from "react-router-dom";
// Import SearchBar component for user input.
import SearchBar from "./SearchBar";
// Import TVShowFilters component for filtering search results.
import TVShowFilters from "./TVShowFilters";

/**
 * @function TVShowSearchGrid
 * @description A React functional component that provides an interface for searching TV shows.
 * It displays results in a grid, allows filtering, and initially shows trending shows.
 *
 * @returns {JSX.Element} The rendered TVShowSearchGrid component.
 */
const TVShowSearchGrid = () => {
  // State for the current search query string.
  const [query, setQuery] = useState("");
  // State for shows that are exact matches to the query.
  const [exactMatches, setExactMatches] = useState([]);
  // State for shows that are broader matches (used as the source for filters).
  const [broadenedShows, setBroadenedShows] = useState([]);
  // State for shows that are the result of applying filters to `broadenedShows`.
  const [filteredBroadenedShows, setFilteredBroadenedShows] = useState([]);
  // State to track if a search operation is currently in progress.
  const [isSearching, setIsSearching] = useState(false);
  // State to track if a search has been performed at least once.
  const [hasSearched, setHasSearched] = useState(false);
  // State for the current page number when loading more results (pagination).
  const [currentPage, setCurrentPage] = useState(1);
  // State for the total number of results found for the current query.
  const [totalResults, setTotalResults] = useState(0);
  // `useNavigate` hook for programmatic navigation.
  const navigate = useNavigate();

  /**
   * Fetches trending TV shows for the week from TMDB.
   * This is used as the initial content or when the search query is cleared.
   * @async
   */
  const fetchTrendingShowsThisWeek = async () => {
    try {
      const trendingRes = await axios.get("https://api.themoviedb.org/3/trending/tv/week", {
        params: {
          api_key: "325f0c86f4e9c504dac84ae3046cbee2", // Hardcoded API key (consider moving to .env).
        },
      });
      // Update both broadenedShows and filteredBroadenedShows with trending results.
      setBroadenedShows(trendingRes.data.results);
      setFilteredBroadenedShows(trendingRes.data.results);
    } catch (error) {
      console.error("Failed to fetch trending shows this week:", error);
      // Optionally, set an error state here.
    }
  };


  /**
   * `useEffect` hook to fetch trending shows if the query is empty.
   * Runs when the `query` state changes.
   */
  useEffect(() => {
    if (!query) { // If query is empty (e.g., cleared by user)
      fetchTrendingShowsThisWeek(); // Fetch trending shows to populate the grid.
    }
  }, [query]); // Dependency: re-run if `query` changes.

  /**
   * `useEffect` hook to scroll to the top of the page when the component mounts.
   * Ensures the user sees the page from the beginning.
   */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []); // Empty dependency array: runs only on mount.

  /**
   * Performs a search for TV shows based on the current `query`.
   * Fetches both exact matches and broader results from TMDB.
   * Updates relevant state variables with the search results.
   * @async
   */
  const searchShows = async () => {
    // If the query is empty or only whitespace, do not proceed.
    if (!query.trim()) return;

    setIsSearching(true); // Set searching state to true.
    setHasSearched(true); // Mark that a search has been performed.
    setCurrentPage(1);    // Reset to the first page for a new search.

    try {
      // Fetch results where the query is treated as an exact phrase (TMDB might not fully support this via `"`).
      const exactRes = await axios.get("https://api.themoviedb.org/3/search/tv", {
        params: {
          api_key: "325f0c86f4e9c504dac84ae3046cbee2", // Hardcoded API key.
          query: `"${query}"`, // Attempt at exact phrase search.
          page: 1,
        },
      });

      // Fetch broader search results.
      const broadRes = await axios.get("https://api.themoviedb.org/3/search/tv", {
        params: {
          api_key: "325f0c86f4e9c504dac84ae3046cbee2", // Hardcoded API key.
          query: query,
          page: 1,
        },
      });

      setTotalResults(broadRes.data.total_results); // Store total results count.

      // Combine results from both "exact" and "broad" searches and remove duplicates by ID.
      const allResults = [...exactRes.data.results, ...broadRes.data.results];
      const uniqueResults = allResults.filter(
        (show, index, self) => index === self.findIndex((s) => s.id === show.id) // Keep only the first occurrence of each show ID.
      );

      // Filter `uniqueResults` to find shows where the name is an exact case-insensitive match to the query.
      const exactMatchesData = uniqueResults.filter(
        (show) => show.name.toLowerCase() === query.toLowerCase()
      );

      // `broadenedShowsData` will contain unique results that are not exact name matches.
      const broadenedShowsData = uniqueResults.filter((show) => 
        !exactMatchesData.some(em => em.id === show.id) // Exclude if it's already in exactMatchesData.
      );

      // Update state with the processed search results.
      setExactMatches(exactMatchesData);
      setBroadenedShows(broadenedShowsData);
      setFilteredBroadenedShows(broadenedShowsData); // Initially, filtered is the same as broadened.
    } catch (error) {
      console.error("Search failed:", error);
      // Optionally, reset states or set an error state here.
    } finally {
      setIsSearching(false); // Set searching state to false.
    }
  };

  /**
   * Loads more search results (pagination) for the current query.
   * Appends new unique results to the `broadenedShows` and `filteredBroadenedShows` lists.
   * @async
   */
  const loadMore = async () => {
    const nextPage = currentPage + 1; // Increment page number.
    try {
      // Fetch results for the next page.
      const moreResults = await axios.get("https://api.themoviedb.org/3/search/tv", {
        params: {
          api_key: "325f0c86f4e9c504dac84ae3046cbee2", // Hardcoded API key.
          query: query,
          page: nextPage,
        },
      });

      setCurrentPage(nextPage); // Update current page state.
      // Filter new results to avoid duplicates already present in existing lists.
      const newShowsToAdd = moreResults.data.results.filter(
        newShow => 
          !broadenedShows.find(bs => bs.id === newShow.id) && // Not in current broadened shows.
          !exactMatches.find(em => em.id === newShow.id)      // Not in current exact matches.
      );
      // Append new unique shows to the existing lists.
      const updatedBroadenedShows = [...broadenedShows, ...newShowsToAdd];

      setBroadenedShows(updatedBroadenedShows);
      setFilteredBroadenedShows(updatedBroadenedShows); 
    } catch (error) {
      console.error("Failed to load more results:", error);
    }
  };

  /**
   * Handles clicking on a show card. Navigates to the show's detail page.
   * @param {string|number} showId - The ID of the clicked show.
   */
  const handleCardClick = (showId) => {
    navigate(`/show/${showId}`); // Programmatically navigate to the show detail page.
  };

  // Framer Motion variants for container and item animations (staggered fade-in).
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // Stagger animation of child elements.
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 }, // Initial state: invisible and shifted down.
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut"} }, // Animate to visible.
  };

  /**
   * Renders a grid of TV show cards.
   * @param {Array<object>} showsToRender - The array of show objects to display in the grid.
   * @param {string} sectionKey - A unique key for the root `motion.div` of this grid section (for Framer Motion).
   * @returns {JSX.Element} The rendered grid of show cards.
   */
  const renderGrid = (showsToRender, sectionKey) => (
    <motion.div
      key={sectionKey} // Unique key for the section.
      variants={containerVariants} // Apply container animation variants.
      initial="hidden"
      animate="show"
      // Styling for the grid layout (responsive columns and gaps).
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 md:gap-8"
    >
      {/* Map over `showsToRender` to create a card for each show. */}
      {showsToRender.map((show) => (
        <motion.div
          key={show.id} // Unique key for each show card.
          variants={itemVariants} // Apply item animation variants.
          whileHover={{ scale: 1.05 }} // Scale up on hover.
          transition={{ duration: 0.3, ease: "easeOut" }} // Smooth transition for hover.
          // Styling for the card: background, rounded corners, shadow, hover effects, layout.
          className="bg-[#2a2a2a] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 cursor-pointer flex flex-col"
          onClick={() => handleCardClick(show.id)} // Handle card click.
        >
          {/* Show poster image. */}
          <img
            src={
              show.poster_path // Construct image URL if poster_path exists.
                ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
                : "https://via.placeholder.com/500x750?text=No+Poster" // Fallback image.
            }
            alt={show.name}
            className="w-full h-72 object-cover" // Styling for image.
          />
          {/* Card content: title, year, overview. */}
          <div className="p-3 sm:p-4 flex-grow flex flex-col justify-between"> {/* `flex-grow` ensures this div takes remaining space. */}
            <div> {/* Wrapper for title and year for layout control. */}
              <h3 className="text-base sm:text-lg text-[#f1f1f1] font-semibold line-clamp-1"> {/* Truncate title to 1 line. */}
                {show.name}
              </h3>
              {/* Display first air year if available. */}
              {show.first_air_date && (
                  <p className="text-gray-400 text-sm">
                      {new Date(show.first_air_date).getFullYear()} {/* Format date to get year. */}
                  </p>
              )}
            </div>
            {/* Show overview, truncated to 3 lines. */}
            <p className="text-gray-300 text-xs sm:text-sm mt-2 line-clamp-3">
              {show.overview || "No description available."} {/* Fallback if no overview. */}
            </p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );

  // Main render method for the TVShowSearchGrid.
  return (
    // Main container for the search page content.
    <div className="min-h-screen bg-[#1e1e1e] py-16 px-4 pb-24">
      {/* Animated container for the page title and search bar. */}
      <motion.div
        initial={{ opacity: 0, y: -20 }} // Initial animation state.
        animate={{ opacity: 1, y: 0 }}     // Animate into view.
        className="max-w-7xl mx-auto"    // Centered with max width.
      >
        <h1 className="text-3xl font-semibold text-center text-[#1963da] mb-8">
          Search for a TV Show
        </h1>

        {/* SearchBar component. */}
        <SearchBar query={query} setQuery={setQuery} onSearch={searchShows} isSearching={isSearching} />

        {/* Container for search results sections. */}
        <div className="mt-10 space-y-12">
          {/* Display total results count and filters if a search has been performed. */}
          {hasSearched && (
            <div className="space-y-4">
              <p className="text-gray-400 text-center">
                Found {totalResults} results for "{query}"
              </p>
              {/* Display filters only if there are broadened shows to filter. */}
              {broadenedShows.length > 0 && (
                <div className="max-w-4xl mx-auto">
                  <TVShowFilters shows={broadenedShows} onFilter={setFilteredBroadenedShows} />
                </div>
              )}
            </div>
          )}

          {/* Section for Exact Matches. */}
          {exactMatches.length > 0 && (
            <section className="pt-4">
              <motion.h2
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-2xl font-semibold text-[#f1f1f1] mb-6"
              >
                Exact Matches
              </motion.h2>
              {renderGrid(exactMatches, "exact-matches-grid")} {/* Render grid for exact matches. */}
            </section>
          )}

          {/* Section for Other Results (if exact matches exist) or main Results / Trending. */}
          {filteredBroadenedShows.length > 0 && (
            <section className={exactMatches.length > 0 ? "pt-4" : ""}> {/* Add padding-top if exact matches section is also present. */}
              <motion.h2
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-2xl font-semibold text-[#f1f1f1] mb-6"
              >
                {/* Dynamic title based on search state. */}
                {hasSearched && exactMatches.length > 0 ? "Other Results" : (hasSearched ? "Results" : "Trending This Week")}
              </motion.h2>
              {renderGrid(filteredBroadenedShows, "related-shows-grid")} {/* Render grid for these shows. */}

              {/* "Load More" button for paginated search results. */}
              { hasSearched && (exactMatches.length + filteredBroadenedShows.length) < totalResults && !isSearching && (
                <div className="flex justify-center mt-8 mb-12">
                  <button
                    onClick={loadMore}
                    className="px-6 py-3 bg-[#1963da] text-white rounded-xl hover:bg-[#1652b5] transition-colors"
                  >
                    Load More
                  </button>
                </div>
              )}
            </section>
          )}
          

          {/* Message if no results found after a search (and not currently searching). */}
          {!isSearching && hasSearched && exactMatches.length === 0 && filteredBroadenedShows.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <p className="text-gray-300 text-xl">No results found for "{query}". Try a different search term.</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// Export the TVShowSearchGrid component as the default.
export default TVShowSearchGrid;