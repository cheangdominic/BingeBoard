/**
 * @file ViewAllRecentlyWatched.jsx
 * @description A React component that displays a grid of all recently watched TV shows
 * for the authenticated user. It supports pagination ("Load More") and handles loading/error states.
 */

// Import React hooks and utilities.
import React, { useEffect, useState } from 'react';
// Import axios for making HTTP requests (though `fetch` is used here).
// Note: If axios was intended, it should be imported and used. Current implementation uses `fetch`.
// import axios from 'axios'; 
import { Link, useNavigate } from 'react-router-dom'; // For navigation.
import TVShowCard from '../../components/TVShowCard'; // Component to display individual show cards.
import { motion } from 'framer-motion'; // For animations.
import { useAuth } from '../../context/AuthContext'; // Custom hook to access authentication context.

// Constants for pagination and card styling.
const ITEMS_PER_PAGE = 12; // Number of items to display per page/load.
const CARD_WIDTH = 130;    // Width of each TVShowCard in pixels.

/**
 * @function ViewAllRecentlyWatched
 * @description A React functional component that renders a page displaying all recently watched shows.
 * It fetches data, paginates results, and handles various UI states.
 *
 * @returns {JSX.Element} The rendered ViewAllRecentlyWatched component.
 */
export default function ViewAllRecentlyWatched() {
  // State to store the array of all recently watched shows.
  const [shows, setShows] = useState([]);
  // State to track loading status.
  const [isLoading, setIsLoading] = useState(true);
  // State to manage the current page number for pagination.
  const [page, setPage] = useState(1);
  // State to store any error messages during data fetching.
  const [error, setError] = useState(null);
  // Hook for programmatic navigation.
  const navigate = useNavigate();
  // Get the authenticated user from AuthContext.
  const { user: authUser } = useAuth();
 // Determine if the profile is the authenticated user's own profile.
  const isOwnProfile = !username || username === authUser?.username;

  /**
   * `useEffect` hook to fetch recently watched shows when the component mounts
   * or when `authUser` (authenticated user) changes.
   */
  useEffect(() => {
    /**
     * Asynchronous function to fetch recently watched data from the API.
     * @async
     */
    const fetchRecentlyWatchedData = async () => {
      // If no authenticated user, set loading to false and clear shows.
      if (!authUser) {
        setIsLoading(false);
        setShows([]);
        return;
      }

      setIsLoading(true); // Set loading state.
      setError(null);     // Clear previous errors.
      try {
        // Fetch data from the "/api/users/recently-watched" endpoint.
        // `credentials: "include"` sends cookies for session authentication.
        const response = await fetch('/api/users/recently-watched', {
          credentials: "include"
        });

        // If the response is not OK, attempt to parse error and throw.
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` })); // Fallback if JSON parsing fails.
          throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
        }

        // Parse successful response as JSON.
        const data = await response.json();
        // Map the fetched data to a consistent structure expected by TVShowCard.
        setShows(data.map(s => ({
          id: s.showId,        // Ensure 'id' field exists.
          name: s.showName,      // Ensure 'name' field exists.
          poster_path: s.posterPath, // Ensure 'poster_path' field exists.
          lastWatchedAt: s.lastWatchedAt // Keep lastWatchedAt if needed for sorting (though not used for sorting here).
        })));
      } catch (err) {
        console.error("Error fetching recently watched shows for view all page:", err);
        setError(err.message || "Failed to load recently watched shows."); // Set error message.
        setShows([]); // Clear shows on error.
      } finally {
        setIsLoading(false); // Set loading to false.
      }
    };

    fetchRecentlyWatchedData();
  }, [authUser]); // Dependency: re-run if `authUser` changes.

  // Slice the `shows` array to get only the items for the current page(s).
  const displayedShows = shows.slice(0, page * ITEMS_PER_PAGE);

  // If loading, display skeleton cards.
  if (isLoading) {
    return (
      <div className="px-6 py-8 bg-[#1e1e1e] min-h-screen text-white">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)} // Navigate to the previous page.
          className="mb-6 px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition"
        >
          ← Back
        </button>
        <h1 className="text-4xl font-semibold mb-8">Recently Watched Shows</h1>
        {/* Grid for skeleton cards. */}
        <div className="flex flex-wrap gap-4">
          {/* Render a fixed number of skeleton cards. */}
          {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="bg-gray-700 rounded-lg animate-pulse" // Pulse animation for loading.
              style={{ width: `${CARD_WIDTH}px`, height: `${CARD_WIDTH * 1.5}px` }} // Set dimensions.
            />
          ))}
        </div>
      </div>
    );
  }

  // If user is not authenticated, display a login prompt.
  if (!authUser) {
    return (
      <div className="px-6 py-8 bg-[#1e1e1e] min-h-screen text-white text-center">
        <h1 className="text-4xl font-semibold mb-8">Recently Watched</h1>
        <p className="text-lg">Please <Link to="/login" className="text-blue-400 hover:underline">log in</Link> to view your recently watched shows.</p>
      </div>
    );
  }

  // If an error occurred during data fetching, display the error message.
  if (error) {
    return (
      <div className="px-6 py-8 bg-[#1e1e1e] min-h-screen text-white text-center">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition"
        >
          ← Back
        </button>
        <h1 className="text-4xl font-semibold mb-8">Error</h1>
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  // If user is authenticated but has no recently watched shows.
  if (!shows.length) {
    return (
      <div className="px-6 py-8 bg-[#1e1e1e] min-h-screen text-white">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition"
        >
          ← Back
        </button>
        <h1 className="text-4xl font-semibold mb-8">Recently Watched Shows</h1>
        <p>// Default scroll behavior</p>
      </div>
    );
  }

  // Main render for when shows are available.
  return (
    // Animated page container.
    <motion.div
      className="px-6 py-8 bg-[#1e1e1e] min-h-screen text-white"
      initial={{ opacity: 0, y: 20 }} // Initial animation state.
      animate={{ opacity: 1, y: 0 }}   // Animate to visible state.
      transition={{ duration: 0.5 }}   // Animation duration.
    >
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition"
      >
        ← Back
      </button>

      <h1 className="text-4xl font-semibold mb-8">Recently Watched Shows</h1>

      {/* Grid container for displaying show cards. */}
      <div className="flex flex-wrap gap-4">
        {/* Map over `displayedShows` to render TVShowCard components with animation. */}
        {displayedShows.map((show, index) => (
          <motion.div
            key={show.id || index} // Use show ID or index as key.
            className="flex-shrink-0" // Prevent cards from shrinking.
            style={{ width: `${CARD_WIDTH}px` }} // Set fixed width.
            // Framer Motion animation properties for staggered appearance.
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (index % ITEMS_PER_PAGE) * 0.03, duration: 0.3 }} // Staggered delay.
            whileHover={{ scale: 1.05, y: -2, transition: { duration: 0.2 } }} // Hover animation.
          >
            {/* Link each card to its show detail page. */}
            <Link to={`/show/${show.id}`}>
              <TVShowCard
                imageUrl={
                  show.poster_path // Construct image URL if poster_path exists.
                    ? `https://image.tmdb.org/t/p/w300${show.poster_path}`
                    : undefined // Pass undefined if no poster.
                }
                title={show.name}
                cardWidth={CARD_WIDTH}
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
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-md hover:shadow-lg transition hover:scale-105"
            disabled={isLoading} // Disable button while loading (though isLoading is for initial load here).
          >
            Load More
          </button>
        </div>
      )}
    </motion.div>
  );
}