/**
 * @file WatchlistCarousel.jsx
 * @description A React component that displays a horizontally scrolling carousel of TV shows
 * from a user's watchlist. It fetches show details from TMDB based on IDs in the user's watchlist,
 * implements an infinite scroll illusion if enough items are present, and allows removing items from the watchlist.
 */

// Import React hooks and utilities.
import React, { useEffect, useState, useRef, useCallback } from "react";
// Import TVShowCard component for displaying individual shows.
import TVShowCard from "../../components/TVShowCard";
// Import axios for making HTTP requests.
import axios from "axios";
// Import Link for client-side navigation.
import { Link } from "react-router-dom";
// Import motion and AnimatePresence from framer-motion for animations.
import { motion, AnimatePresence } from "framer-motion";

/**
 * @function WatchlistCarousel
 * @description A React functional component that renders a carousel of TV shows from a user's watchlist.
 *
 * @param {object} props - The properties passed to the component.
 * @param {object} props.user - The user object, expected to have a `watchlist` array of show IDs.
 * @param {string} [props.title="Your Watchlist"] - The title to display above the carousel.
 * @param {number} [props.cardActualWidth=130] - The actual width of each TVShowCard in pixels.
 * @param {function} [props.onWatchlistChange] - Callback function invoked when the watchlist changes (e.g., an item is removed).
 *                                               Receives the updated watchlist (array of IDs) as an argument.
 * @param {'smooth' | 'auto'} [props.userScrollBehavior="smooth"] - The `scroll-behavior` CSS property for user-initiated scrolls.
 * @returns {JSX.Element} The rendered WatchlistCarousel component.
 */
function WatchlistCarousel({
  user, // The user object containing the watchlist
  title = "Your Watchlist", // Default title
  cardActualWidth = 130,   // Default card width
  onWatchlistChange,       // Optional callback for when watchlist changes
  userScrollBehavior = "smooth", // Default scroll behavior
}) {
  // State to store the array of show objects (with details fetched from TMDB).
  const [shows, setShows] = useState([]);
  // State to track loading status for fetching show details.
  const [isLoading, setIsLoading] = useState(true);
  // State to track the ID of the show currently being hovered over (for showing remove button).
  const [hoveredShowId, setHoveredShowId] = useState(null);
  // Ref for the scrollable container div.
  const containerRef = useRef(null);
  // Ref for the content div that holds all show cards.
  const contentRef = useRef(null);
  // TMDB API key from environment variables.
  const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
  // Item width used for calculations.
  const itemWidth = cardActualWidth;
  // Minimum number of shows required to enable the infinite scroll illusion.
  const MIN_SHOWS_FOR_INFINITE_SCROLL = 6;

  /**
   * `useEffect` hook to fetch details for each show in the user's watchlist.
   * Runs when the `user.watchlist` or `API_KEY` changes.
   */
  useEffect(() => {
    // If API key is missing, or no user/watchlist, or watchlist is empty, do nothing.
    if (!API_KEY || !user?.watchlist || user.watchlist.length === 0) {
      setIsLoading(false);
      setShows([]); // Ensure shows array is empty.
      return;
    }

    /**
     * Asynchronous function to fetch details for all shows in the watchlist.
     * @async
     */
    const fetchShowDetails = async () => {
      setIsLoading(true);
      try {
        // Create an array of promises, each fetching details for one show ID.
        const showPromises = user.watchlist.map((id) =>
          axios.get(
            `https://api.themoviedb.org/3/tv/${id}?api_key=${API_KEY}&language=en-US`
          )
            .then((res) => res.data) // On success, return the show data.
            .catch((err) => { // On failure for a single show, log error and return null.
              console.error(`Failed to fetch show ${id}:`, err);
              return null; // Allows Promise.all to complete even if some requests fail.
            })
        );

        // Wait for all detail fetch promises to resolve.
        const showResults = await Promise.all(showPromises);
        // Filter out any null results (from failed fetches).
        const validShows = showResults.filter((show) => show !== null);
        setShows(validShows); // Update shows state with valid show details.
      } catch (error) {
        console.error("Error fetching show details:", error);
        setShows([]); // Set shows to empty on overall error.
      } finally {
        setIsLoading(false); // Set loading to false.
      }
    };

    fetchShowDetails();
  }, [user?.watchlist, API_KEY]); // Dependencies for the effect.

  /**
   * Handles the scroll event for infinite scroll illusion.
   * Wrapped in `useCallback` for memoization.
   */
  const handleScroll = useCallback(() => {
    // If not enough shows for infinite scroll, do nothing.
    if (shows.length < MIN_SHOWS_FOR_INFINITE_SCROLL) return;

    const container = containerRef.current;
    // Guard clause: if refs or data are not ready, do nothing.
    if (!container || shows.length === 0 || itemWidth <= 0) return;

    // Calculate width of one set of original shows (itemWidth should ideally include margins).
    const contentWidth = shows.length * itemWidth; // Simplified, assumes no margin for calculation here.
    const scrollPos = container.scrollLeft;
    const containerWidth = container.offsetWidth;

    let newScrollLeft = scrollPos;
    let didTeleport = false;

    // Logic for teleporting scroll position.
    if (scrollPos >= contentWidth * 2 - containerWidth / 2) {
      newScrollLeft = scrollPos - contentWidth;
      didTeleport = true;
    } else if (scrollPos <= contentWidth - containerWidth / 2) {
      newScrollLeft = scrollPos + contentWidth;
      didTeleport = true;
    }

    // If teleportation occurred, adjust scrollLeft.
    if (didTeleport) {
      const originalBehavior = container.style.scrollBehavior;
      container.style.scrollBehavior = "auto"; // Disable smooth scroll for jump.
      container.scrollLeft = newScrollLeft;
      container.style.scrollBehavior = originalBehavior || userScrollBehavior; // Restore behavior.
    }
  }, [shows, itemWidth, userScrollBehavior]); // Dependencies.

  /**
   * `useEffect` hook to set up initial scroll position and attach/detach scroll listener.
   * Manages content width based on whether infinite scroll is active.
   */
  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;

    // Guard clause.
    if (!container || !content || shows.length === 0 || itemWidth <= 0) {
      if (content) content.style.width = "0px"; // Reset content width if no shows.
      return;
    }

    // Calculate width of one set of original shows (itemWidth should include margins).
    const contentWidth = shows.length * itemWidth; // Simplified, assumes no margin for calculation.

    // If not enough shows for infinite scroll.
    if (shows.length < MIN_SHOWS_FOR_INFINITE_SCROLL) {
      content.style.width = `${contentWidth}px`; // Set width for original items only.
      container.style.scrollBehavior = userScrollBehavior;
      container.removeEventListener("scroll", handleScroll); // Ensure listener is removed.
    } else {
      // If enough shows, set width for three clones and set up infinite scroll.
      content.style.width = `${contentWidth * 3}px`;
      const initialScrollPosition = contentWidth; // Start at the middle clone.

      // Set initial scroll without smooth scrolling, only if not already there.
      const originalBehavior = container.style.scrollBehavior;
      container.style.scrollBehavior = "auto";
      if (Math.abs(container.scrollLeft - initialScrollPosition) > 1) { // Avoid minor re-scrolls
        container.scrollLeft = initialScrollPosition;
      }
      container.style.scrollBehavior = userScrollBehavior; // Restore user-defined behavior.

      container.addEventListener("scroll", handleScroll, { passive: true }); // Add scroll listener.
    }

    // Cleanup function: remove scroll listener.
    return () => {
      if (container) { // Check if container still exists
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [shows, itemWidth, handleScroll, userScrollBehavior]); // Dependencies.

  /**
   * Handles removing a show from the watchlist.
   * Sends a POST request to the backend and updates local state and parent component via `onWatchlistChange`.
   * @async
   * @param {string|number} showIdToRemove - The ID of the show to remove.
   */
  const handleRemoveFromWatchlist = async (showIdToRemove) => {
    // Guard clause: if no user or watchlist, do nothing.
    if (!user || !user.watchlist) {
      return;
    }

    try {
      // Make POST request to remove show from watchlist.
      const response = await axios.post(
        "/api/watchlist/remove",
        { showId: String(showIdToRemove) }, // Ensure showId is a string for backend.
        { withCredentials: true } // Send cookies for authentication.
      );

      if (response.data.success) {
        // Update local `shows` state to remove the item immediately from the carousel.
        setShows(prevShows => prevShows.filter(show => show.id !== showIdToRemove));

        // If `onWatchlistChange` callback is provided, call it with the updated watchlist.
        if (onWatchlistChange) {
          const updatedWatchlist = user.watchlist.filter(id => String(id) !== String(showIdToRemove));
          onWatchlistChange(updatedWatchlist);
        }
      } else {
         // Log error if backend indicates failure.
         console.error("Failed to remove show from watchlist:", response.data.message);
      }
    } catch (error) {
      // Log network or other errors.
      console.error("Error removing show:", error.response?.data || error.message || error);
    }
  };

  // If API_KEY is not configured, render an error message.
  if (!API_KEY) {
    return (
      <section className="relative my-8">
        <h3 className="text-xl font-bold px-4 md:px-0 mb-4">{title}</h3>
        <p className="px-4 md:px-0 text-red-500">TMDB API Key not configured.</p>
      </section>
    );
  }

  // If loading, display skeleton cards.
  if (isLoading) {
    const SkeletonCard = () => ( // Define SkeletonCard component locally.
      <motion.div
        className="flex-shrink-0 mx-2 py-2" // Styling for skeleton item wrapper.
        style={{ width: `${itemWidth}px` }} // Set fixed width.
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          transition: { duration: 0.5 },
        }}
      >
        <motion.div
          className="bg-gray-700 rounded-lg overflow-hidden" // Base styling.
          style={{
            width: `${itemWidth}px`,
            height: `${itemWidth * 1.5}px`, // Dynamic height.
          }}
          // Shimmer animation.
          animate={{
            background: [
              "linear-gradient(90deg, #2d3748 0%, #4a5568 50%, #2d3748 100%)",
              "linear-gradient(90deg, #2d3748 0%, #4a5568 100%, #2d3748 100%)",
              "linear-gradient(90deg, #2d3748 0%, #4a5568 50%, #2d3748 100%)",
            ],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </motion.div>
    );

    return ( // Return skeleton UI.
      <section className="relative my-8 pl-2 mr-2">
        <div className="flex justify-between items-center mb-4 px-4 md:px-0">
          <h3 className="text-xl text-white font-bold md:pl-2 md:m-0 -m-2">
            {title}
          </h3>
        </div>
        <div
          ref={containerRef} // Attach ref even for skeleton.
          className="relative w-full overflow-x-auto no-scrollbar px-4"
        >
          <div ref={contentRef} className="flex">
            {/* Display a number of skeleton cards based on watchlist length or a default. */}
            {Array.from({ length: Math.min(user?.watchlist?.length || 5, 10) }).map((_, index) => (
              <SkeletonCard key={`skeleton-${index}`} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // If not loading and user's watchlist is empty.
  if (!isLoading && (!user?.watchlist || user.watchlist.length === 0)) {
    return (
      <section className="relative my-8">
        <h3 className="text-xl font-bold px-4 md:px-0 mb-4">{title}</h3>
        <p className="px-4 md:px-0 text-gray-400">Your watchlist is empty. Add some shows!</p>
      </section>
    );
  }

  // If not loading, watchlist has IDs, but `shows` array is empty (meaning all fetches failed).
  if (!isLoading && shows.length === 0 && user?.watchlist && user.watchlist.length > 0) {
    return (
      <section className="relative my-8">
        <h3 className="text-xl font-bold px-4 md:px-0 mb-4">{title}</h3>
        <p className="px-4 md:px-0 text-gray-400">Could not load watchlist shows.</p>
      </section>
    );
  }

  // Determine items to display: original list or cloned list for infinite scroll.
  const displayItems = shows.length < MIN_SHOWS_FOR_INFINITE_SCROLL
    ? shows
    : [...shows, ...shows, ...shows]; // Three clones for infinite scroll.

  // Main render for when shows are available.
  return (
    <section className="relative my-8 mr-2"> {/* Carousel section container. */}
      {/* Header: title and "View All" link. */}
      <div className="flex justify-between items-center mb-4 px-4 md:px-0">
        <h3 className="text-xl text-white font-bold md:pl-2 md:m-0 -m-2">
          {title}
        </h3>
        {/* Show "View All" link only if there are items in the watchlist. */}
        {user?.watchlist && user.watchlist.length > 0 && (
          <Link to="/view-all/watchlist" state={{ watchlist: user.watchlist }}> {/* Pass watchlist IDs to view all page. */}
            <button className="text-sm text-blue-400 font-semibold hover:underline">
              View All
            </button>
          </Link>
        )}
      </div>

      {/* Scrollable container. */}
      <div
        ref={containerRef}
        className="relative w-full overflow-x-auto no-scrollbar px-4"
      >
        {/* Content div holding all show cards. */}
        <div ref={contentRef} className="flex">
          <AnimatePresence> {/* For item enter/exit animations (if items can be removed dynamically). */}
            {displayItems.map((show, index) => (
              // Animated wrapper for each TVShowCard.
              <motion.div
                key={`${show.id}-${index}`} // Unique key including index for cloned items.
                className="flex-shrink-0 mx-2 py-2 relative" // `relative` for positioning remove button.
                style={{ width: `${itemWidth}px` }} // Set fixed width.
                // Mouse enter/leave handlers for showing remove button.
                onMouseEnter={() => setHoveredShowId(show.id)}
                onMouseLeave={() => setHoveredShowId(null)}
                // Framer Motion animation properties.
                initial={{ opacity: 0, y: 20, scale: 0.95 }} // Initial state.
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { // Staggered spring animation.
                    delay: (index % shows.length) * 0.03, // Delay based on original index.
                    type: "spring",
                    stiffness: 100,
                    damping: 10,
                  },
                }}
                whileHover={{ // Hover animation.
                  scale: 1.05,
                  transition: { duration: 0.2 },
                }}
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }} // Exit animation.
              >
                {/* Link card to show detail page. */}
                <Link to={`/show/${show.id}`}>
                  <div className="transition-transform duration-300 ease-in-out"> {/* Optional: wrapper for card's own transitions. */}
                    <TVShowCard
                      imageUrl={
                        show.poster_path // Construct image URL.
                          ? `https://image.tmdb.org/t/p/w300${show.poster_path}`
                          : undefined
                      }
                      title={show.name || show.title} // Use name or title.
                      cardWidth={cardActualWidth}
                      // averageRating could be passed if available, e.g., from TMDB details
                    />
                  </div>
                </Link>
                {/* "Remove from watchlist" button, shown on hover. */}
                {hoveredShowId === show.id && (
                  <button
                    onClick={(e) => { // Handle click to remove.
                      e.preventDefault(); // Prevent Link navigation.
                      e.stopPropagation(); // Prevent other click handlers.
                      handleRemoveFromWatchlist(show.id);
                    }}
                    // Styling for the remove button.
                    className="absolute right-1 bottom-[30%] transform translate-y-1/2 bg-black bg-opacity-75 text-white text-xs px-2 py-0.5 rounded hover:bg-red-600 hover:bg-opacity-100 z-20 transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500"
                    aria-label={`Remove ${show.name || show.title} from watchlist`} // Accessibility.
                    title="Remove from watchlist" // Tooltip.
                  >
                    Remove?
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

// Export the WatchlistCarousel component as the default.
export default WatchlistCarousel;