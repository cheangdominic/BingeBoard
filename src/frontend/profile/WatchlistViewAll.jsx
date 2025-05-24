/**
 * @file ViewAllWatchlist.jsx
 * @description A React component that displays a grid of all TV shows in a user's watchlist.
 * It receives the watchlist (array of show IDs) via route state, fetches details for each show from TMDB,
 * and supports pagination ("Load More").
 */

// Import React hooks and utilities.
import React, { useEffect, useState } from "react";
// Import Link for client-side navigation, useLocation to access route state, and useNavigate for programmatic navigation.
import { Link, useLocation, useNavigate } from "react-router-dom";
// Import TVShowCard component for displaying individual show cards.
import TVShowCard from "../../components/TVShowCard";
// Import motion from framer-motion for animations.
import { motion } from "framer-motion";
// Import axios for making HTTP requests to TMDB.
import axios from "axios";

// Constants for pagination and card styling.
const FILMS_PER_PAGE = 12; // Number of items to display per page/load (using FILMS_PER_PAGE, though it's for TV shows).
const CARD_WIDTH = 130;    // Width of each TVShowCard in pixels.

/**
 * @function ViewAllWatchlist
 * @description A React functional component that renders a page displaying all shows in a user's watchlist.
 * It fetches show details from TMDB using IDs passed via route state and paginates the results.
 *
 * @returns {JSX.Element} The rendered ViewAllWatchlist component.
 */
export default function ViewAllWatchlist() {
  /**
   * `state` from `useLocation()` hook, expected to contain `watchlist` (an array of show IDs).
   * @type {{watchlist?: Array<string|number>}}
   */
  const { state } = useLocation();
  // State to store the array of show objects (with details fetched from TMDB).
  const [shows, setShows] = useState([]);
  // State to track loading status for fetching show details.
  const [isLoading, setIsLoading] = useState(true);
  // State to manage the current page number for pagination.
  const [page, setPage] = useState(1);
  // TMDB API key from environment variables.
  const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
  // Hook for programmatic navigation (e.g., for the "Back" button).
  const navigate = useNavigate();

  /**
   * `useEffect` hook to fetch details for each show in the watchlist.
   * Runs when `API_KEY` or `state.watchlist` (passed via route state) changes.
   */
  useEffect(() => {
    /**
     * Asynchronous function to fetch details for all shows in the watchlist.
     * @async
     */
    const fetchWatchlistShows = async () => {
      // If API key is missing, or no watchlist data in state, or watchlist is empty, do nothing.
      if (!API_KEY || !state?.watchlist || state.watchlist.length === 0) {
        setIsLoading(false);
        setShows([]); // Ensure shows array is empty.
        return;
      }

      try {
        setIsLoading(true); // Set loading state.
        // Create an array of promises, each fetching details for one show ID from TMDB.
        const showPromises = state.watchlist.map((id) =>
          axios.get( // Using axios here
            `https://api.themoviedb.org/3/tv/${id}?api_key=${API_KEY}&language=en-US`
          )
        );

        // Wait for all detail fetch promises to resolve.
        const showResults = await Promise.all(showPromises);
        // Filter out any unsuccessful requests (where `res.data` might be falsy) and map to the data.
        const validShows = showResults
          .filter((res) => res.data) // Ensure data exists in the response.
          .map((res) => res.data);   // Extract the show data.

        setShows(validShows); // Update shows state with valid show details.
      } catch (error) {
        console.error("Error fetching watchlist shows:", error);
        setShows([]); // Set shows to empty on error.
        // Optionally, set an error state here to display a message to the user.
      } finally {
        setIsLoading(false); // Set loading to false.
      }
    };

    fetchWatchlistShows();
  }, [API_KEY, state?.watchlist]); // Dependencies for the effect.

  // Slice the `shows` array to get only the items for the current page(s).
  const displayedShows = shows.slice(0, page * FILMS_PER_PAGE);

  // If loading, display skeleton cards.
  if (isLoading) {
    return (
      <div className="px-6 py-8 bg-[#1e1e1e] min-h-screen text-white">
        <h1 className="text-4xl font-semibold mb-8">Your Watchlist</h1>
        {/* Grid for skeleton cards. */}
        <div className="flex flex-wrap gap-4">
          {/* Render a fixed number of skeleton cards based on FILMS_PER_PAGE. */}
          {Array.from({ length: FILMS_PER_PAGE }).map((_, index) => (
            <div
              key={index} // Using index as key for skeleton items.
              className="h-[195px] w-[130px] bg-gray-700 rounded-lg animate-pulse" // Placeholder dimensions and pulse animation.
              // Note: Dimensions h-[195px] w-[130px] match CARD_WIDTH * 1.5 height for aspect ratio.
            />
          ))}
        </div>
      </div>
    );
  }

  // If (after loading) the watchlist is empty.
  if (!shows.length) {
    return (
      <div className="px-6 py-8 bg-[#1e1e1e] min-h-screen text-white">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)} // Navigate to the previous page.
          className="mb-6 px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition"
        >
          ← Back
        </button>
        <h1 className="text-4xl font-semibold mb-8">Your Watchlist</h1>
        <p>Your watchlist is empty. Add some shows!</p>
      </div>
    );
  }

  // Main render for when shows are available.
  return (
    // Animated page container.
    <motion.div
      className="px-6 py-8 bg-[#1e1e1e] min-h-screen text-white"
      initial={{ opacity: 0, y: 50 }} // Initial animation state.
      animate={{ opacity: 1, y: 0 }}   // Animate to visible state.
      // transition prop for the main container animation is missing, defaults will be used.
    >
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition"
      >
        ← Back
      </button>

      <h1 className="text-4xl font-semibold mb-8">Your Watchlist</h1>

      {/* Grid container for displaying show cards. */}
      <div className="flex flex-wrap gap-4">
        {/* Map over `displayedShows` to render TVShowCard components with animation. */}
        {displayedShows.map((show, index) => (
          <motion.div
            key={show.id} // Use show ID as key.
            className="flex-shrink-0" // Prevent cards from shrinking.
            style={{ width: `${CARD_WIDTH}px` }} // Set fixed width.
            // Framer Motion animation properties for staggered appearance.
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }} // Staggered delay for each card.
            whileHover={{ scale: 1.05 }}        // Hover animation (scale up).
          >
            {/* Link each card to its show detail page. */}
            <Link to={`/show/${show.id}`}>
              <TVShowCard
                imageUrl={
                  show.poster_path // Construct image URL if poster_path exists.
                    ? `https://image.tmdb.org/t/p/w300${show.poster_path}`
                    : undefined // Pass undefined if no poster.
                }
                title={show.name || show.title} // Use name or title.
                cardWidth={CARD_WIDTH}
                // averageRating could be passed if available from TMDB details
              />
            </Link>
          </motion.div>
        ))}
      </div>

      {/* "Load More" button, shown if there are more shows to display than currently visible. */}
      {displayedShows.length < shows.length && (
        <div className="mt-10 flex justify-center">
          <button
            onClick={() => setPage(page + 1)} // Increment page number to load more items.
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-md hover:shadow-lg transition hover:scale-105"
            // `isLoading` here would refer to the initial load, not subsequent "Load More" clicks.
            // A separate loading state for "Load More" might be needed for better UX.
          >
            Load More
          </button>
        </div>
      )}
    </motion.div>
  );
}