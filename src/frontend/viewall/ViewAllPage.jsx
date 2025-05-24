/**
 * @file ViewAllPage.jsx
 * @description A React component that displays a grid of all TV shows from a specific TMDB endpoint.
 * The TMDB endpoint is determined by a URL parameter. It supports pagination ("Load More").
 */

// Import React hooks and utilities.
import React, { useEffect, useState } from "react";
// Import Link for client-side navigation, useParams to get URL parameters, and useNavigate for programmatic navigation.
import { Link, useParams, useNavigate } from "react-router-dom";
// Import TVShowCard component for displaying individual show cards.
import TVShowCard from "../../components/TVShowCard";
// Import motion from framer-motion for animations.
import { motion } from "framer-motion";
// Import axios for making HTTP requests to TMDB.
import axios from "axios";
// Import BottomNavbar component for consistent navigation.
import BottomNavbar from "../../components/BottomNavbar.jsx";


// Constants for pagination and card styling.
const FILMS_PER_PAGE = 12; // Number of items to display per page/load (using FILMS_PER_PAGE for TV shows too).
const CARD_WIDTH = 130;    // Width of each TVShowCard in pixels.

/**
 * @function ViewAllPage
 * @description A React functional component that renders a page displaying a list of TV shows
 * fetched from a dynamic TMDB endpoint. It supports pagination to load more shows.
 *
 * @returns {JSX.Element} The rendered ViewAllPage component.
 */
export default function ViewAllPage() {
  /**
   * `tmdbEndpoint` from the URL parameters, indicating which TMDB API endpoint to fetch shows from.
   * @type {{tmdbEndpoint: string}}
   */
  const { tmdbEndpoint } = useParams();
  // Decode the URL-encoded TMDB endpoint string.
  const decodedEndpoint = decodeURIComponent(tmdbEndpoint);
  // State to store the array of show objects fetched from TMDB.
  const [shows, setShows] = useState([]);
  // State to manage the current page number for pagination.
  const [page, setPage] = useState(1);
  // TMDB API key from environment variables.
  const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
  // Hook for programmatic navigation (e.g., for the "Back" button).
  const navigate = useNavigate();
  // Note: isLoading and error states are not explicitly managed here, which could be an improvement
  // to show loading spinners or error messages. The current implementation will show an empty page
  // or a partially loaded page until data arrives or if an error occurs.

  /**
   * `useEffect` hook to fetch shows from the specified TMDB endpoint.
   * Runs when `tmdbEndpoint` (which means `decodedEndpoint` effectively) or `API_KEY` changes.
   * Currently, it only fetches the first page of results.
   * For a "View All" page, it might be desirable to fetch all pages or implement server-side pagination
   * if the TMDB endpoint supports it beyond just the `page` parameter for a single list.
   * This component's pagination is client-side based on the initial fetch.
   */
  useEffect(() => {
    /**
     * Asynchronous function to fetch shows from TMDB.
     * @async
     */
    const fetchShows = async () => {
      // If API key or TMDB endpoint is missing, log an error and do nothing.
      if (!API_KEY || !tmdbEndpoint) { // tmdbEndpoint check is a bit redundant due to useParams
        console.error("Missing API key or tmdbEndpoint.");
        setShows([]); // Ensure shows is empty.
        return;
      }

      try {
        // Make GET request to the TMDB API using the decoded endpoint and API key.
        // Currently fetches only page 1.
        const res = await axios.get(
          `https://api.themoviedb.org/3/${decodedEndpoint}?api_key=${API_KEY}&language=en-US&page=1`
        );
        // Set shows state with the results array from the response, or an empty array if no results.
        setShows(res.data.results || []);
      } catch (error) {
        console.error(`Failed to fetch shows from ${decodedEndpoint}:`, error);
        setShows([]); // Set shows to empty array on error.
        // Optionally, set an error state here to display a message to the user.
      }
      // `setIsLoading(false)` would typically be here if a loading state was managed.
    };

    fetchShows();
  }, [decodedEndpoint, API_KEY]); // Use `decodedEndpoint` in dependencies as `tmdbEndpoint` is the raw param.

  // Slice the `shows` array to get only the items for the current page(s) based on client-side pagination.
  const displayedShows = shows.slice(0, page * FILMS_PER_PAGE);

  // Render the "View All" page.
  return (
    <>
      {/* Animated page container. */}
      <motion.div
        className="px-6 py-8 bg-[#1e1e1e] min-h-screen text-white"
        initial={{ opacity: 0, y: 50 }} // Initial animation state.
        animate={{ opacity: 1, y: 0 }}   // Animate to visible state.
        // transition prop for the main container animation is missing, defaults will be used.
      >
        {/* Back button to navigate to the previous page. */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition"
        >
          ← Back
        </button>

        {/* Page title, dynamically generated from the TMDB endpoint. */}
        {/* Capitalizes first letter and replaces underscores with spaces for readability. */}
        <h1 className="text-4xl font-semibold mb-8 capitalize tracking-tight">
          All {decodedEndpoint.replace(/_/g, " ").replace(/\//g, " ")} Shows {/* Also replace slashes for cleaner titles */}
        </h1>

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
                  title={show.name || show.title} // Use name (for TV) or title (for movies).
                  cardWidth={CARD_WIDTH}
                  // averageRating could be passed if available from TMDB data
                />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* "Load More" button, shown if there are more shows to display than currently visible
            (based on the initially fetched `shows` array and client-side pagination). */}
        {displayedShows.length < shows.length && (
          <div className="mt-10 flex justify-center">
            <button
              onClick={() => setPage(page + 1)} // Increment page number to load more items.
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-md hover:shadow-lg transition hover:scale-105"
              // `isLoading` for this button would refer to loading more data if this were true pagination from API.
            >
              Load More
            </button>
          </div>
        )}
      </motion.div>
      {/* Bottom navigation bar. */}
      <BottomNavbar />
    </>
  );
}