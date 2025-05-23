/**
 * @file ShowCarousel.js
 * @description A React component that displays a horizontally scrolling carousel of TV shows.
 * It fetches show data from a TMDB endpoint, implements an infinite scroll illusion,
 * and shows loading skeletons. It also fetches and displays an average rating on hover.
 */

// Import React hooks and utilities.
import React, { useEffect, useState, useRef, useCallback } from "react";
// Import TVShowCard component for displaying individual shows.
import TVShowCard from "./TVShowCard";
// Import axios for making HTTP requests.
import axios from "axios";
// Import Link for client-side navigation.
import { Link } from "react-router-dom";
// Import motion and AnimatePresence from framer-motion for animations.
import { motion, AnimatePresence } from "framer-motion";

/**
 * @function ShowCarousel
 * @description A React functional component that renders a horizontally scrolling carousel of TV shows.
 *
 * @param {object} props - The properties passed to the component.
 * @param {string} props.title - The title to display above the carousel.
 * @param {string} [props.tmdbEndpoint="popular"] - The TMDB API endpoint to fetch shows from (e.g., "popular", "top_rated").
 * @param {number} [props.cardActualWidth=130] - The actual width of each TVShowCard in pixels.
 * @param {'smooth' | 'auto'} [props.userScrollBehavior="smooth"] - The `scroll-behavior` CSS property for user-initiated scrolls.
 * @returns {JSX.Element} The rendered ShowCarousel component.
 */
function ShowCarousel({
  title,
  tmdbEndpoint = "popular", // Default TMDB endpoint if not provided
  cardActualWidth = 130,   // Default card width
  userScrollBehavior = "smooth", // Default scroll behavior
}) {
  // State to store the array of shows fetched from TMDB.
  const [shows, setShows] = useState([]);
  // State to track loading status.
  const [isLoading, setIsLoading] = useState(true);
  // Ref for the scrollable container div.
  const containerRef = useRef(null);
  // Ref for the content div that holds all show cards (including clones for infinite scroll).
  const contentRef = useRef(null);
  // TMDB API key from environment variables.
  const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
  // Item width used for calculations, derived from cardActualWidth.
  const itemWidth = cardActualWidth; // This might need to include margins if mx-2 is significant
  // State to track the ID of the show currently being hovered over.
  const [hoveredShowId, setHoveredShowId] = useState(null);
  // State to store the average rating fetched for the hovered show.
  const [hoveredRating, setHoveredRating] = useState(null);

  // `useEffect` hook to fetch shows from TMDB when the component mounts or `tmdbEndpoint`/`API_KEY` changes.
  useEffect(() => {
    const fetchShows = async () => {
      // If API_KEY is not available, set shows to empty and stop loading.
      if (!API_KEY) {
        console.warn("TMDB API Key is missing. Carousel will not load shows.");
        setShows([]);
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        // Fetch data from the specified TMDB endpoint.
        const res = await axios.get(
          `https://api.themoviedb.org/3/${tmdbEndpoint}?api_key=${API_KEY}&language=en-US&page=1`
        );
        const tmdbResults = res.data.results || []; // Get results array or empty if undefined
        // Initialize shows with averageRating as null; this will be fetched on hover.
        const showsWithoutRatings = tmdbResults.map((show) => ({
          ...show,
          averageRating: null, // Placeholder for average rating
        }));
        setShows(showsWithoutRatings);
      } catch (error) { // Changed from empty catch to log error
        console.error(`Failed to fetch shows from ${tmdbEndpoint}:`, error);
        setShows([]); // Set to empty array on error
      } finally {
        setIsLoading(false);
      }
    };
    fetchShows();
  }, [tmdbEndpoint, API_KEY]); // Dependencies for the effect

  /**
   * Fetches the average rating for a specific show ID from the backend API.
   * @async
   * @param {string|number} showId - The ID of the show to fetch the rating for.
   */
  const fetchHoverRating = async (showId) => {
    try {
      // Make GET request to the backend API for average rating.
      const ratingRes = await axios.get(`/api/average-rating?showId=${showId}`, {
        withCredentials: true, // Send cookies if needed for authentication
      });
      setHoveredRating(ratingRes.data.averageRating); // Update state with fetched rating
    } catch (error) { // Changed from empty catch to log error
      console.warn(`Failed to fetch average rating for show ${showId}:`, error);
      setHoveredRating(null); // Set to null on error
    }
  };

  /**
   * Handles the scroll event on the container to create an "infinite scroll" illusion.
   * When the scroll position nears the end or beginning of the cloned content,
   * it teleports the scroll position to maintain the illusion.
   * Wrapped in `useCallback` for memoization.
   */
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    // Guard clause: if container, shows, or itemWidth are not ready, do nothing.
    if (!container || !shows.length || itemWidth <= 0) return;

    // Calculate the width of one set of original shows.
    const contentWidthPerClone = shows.length * itemWidth; // This should be itemWidth + margin for accurate calculation
    const currentPos = container.scrollLeft;
    let newScrollLeft = currentPos;
    let didTeleport = false;

    // Check if scrolled near the end of the third clone.
    if (currentPos >= contentWidthPerClone * 2 - container.offsetWidth / 2) {
      newScrollLeft = currentPos - contentWidthPerClone; // Teleport back by one clone width.
      didTeleport = true;
    } 
    // Check if scrolled near the beginning of the first clone (relative to the initial middle position).
    else if (currentPos <= contentWidthPerClone - container.offsetWidth / 2) {
      newScrollLeft = currentPos + contentWidthPerClone; // Teleport forward by one clone width.
      didTeleport = true;
    }

    // If teleportation occurred, adjust scrollLeft without smooth scrolling.
    if (didTeleport) {
      const originalBehavior = container.style.scrollBehavior;
      container.style.scrollBehavior = "auto"; // Temporarily disable smooth scroll for instant jump
      container.scrollLeft = newScrollLeft;
      container.style.scrollBehavior = originalBehavior; // Restore original scroll behavior
    }
  }, [shows, itemWidth]); // Dependencies for useCallback

  // `useEffect` hook to set up the initial scroll position and attach/detach the scroll event listener.
  // This effect runs when `shows`, `itemWidth`, `handleScroll`, or `userScrollBehavior` changes.
  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    // Guard clause: if refs or necessary data are not ready, do nothing.
    if (!container || !content || !shows.length || itemWidth <= 0) {
      if (content) content.style.width = "0px"; // Reset content width if no shows
      return;
    }

    const numItems = shows.length;
    const contentWidthPerClone = numItems * itemWidth; // Again, consider margins here
    // Set the total width of the content div to accommodate three clones of the shows.
    content.style.width = `${contentWidthPerClone * 3}px`;
    // Set the initial scroll position to the start of the middle clone.
    const initialScrollPosition = contentWidthPerClone;

    // Set initial scroll position without smooth scrolling.
    const originalBehavior = container.style.scrollBehavior;
    container.style.scrollBehavior = "auto";
    container.scrollLeft = initialScrollPosition;
    container.style.scrollBehavior = userScrollBehavior; // Restore user-defined scroll behavior

    // Add the scroll event listener.
    container.addEventListener("scroll", handleScroll, { passive: true });
    // Cleanup function: remove the scroll event listener when the component unmounts or dependencies change.
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [shows, itemWidth, handleScroll, userScrollBehavior]); // Dependencies for the effect

  // If API_KEY is not configured, render an error message.
  if (!API_KEY && !isLoading) { // Check isLoading to avoid showing this before initial fetch attempt
    return (
      <section className="relative my-8">
        <h3 className="text-xl font-bold px-4 md:px-0 mb-4">{title}</h3>
        <p className="px-4 md:px-0 text-red-500">TMDB API Key not configured. Cannot load shows.</p>
      </section>
    );
  }

  // Create an array of all items to render (original shows cloned three times for infinite scroll).
  const allItems = shows.length > 0 ? [...shows, ...shows, ...shows] : [];

  /**
   * @function SkeletonCard
   * @description A component to display a placeholder card with a shimmer animation while content is loading.
   * @returns {JSX.Element} The rendered skeleton card.
   */
  const SkeletonCard = () => (
    <motion.div
      className="flex-shrink-0 mx-2 py-2" // Margin and padding for spacing
      style={{ width: `${itemWidth}px` }} // Set fixed width
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.5 } }}
    >
      <motion.div
        className="bg-gray-700 rounded-lg overflow-hidden" // Base styling for skeleton
        style={{ width: `${itemWidth}px`, height: `${itemWidth * 1.5}px` }} // Dynamic height based on width
        // Shimmer animation using a gradient background.
        animate={{
          background: [ // Array of gradient states for animation
            'linear-gradient(90deg, #2d3748 0%, #4a5568 50%, #2d3748 100%)',
            'linear-gradient(90deg, #2d3748 0%, #4a5568 100%, #2d3748 100%)', // Simulates movement
            'linear-gradient(90deg, #2d3748 0%, #4a5568 50%, #2d3748 100%)',
          ],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity, // Repeat animation infinitely
          ease: "linear",
        }}
      />
    </motion.div>
  );

  // Main render method for the ShowCarousel.
  return (
    <section className="relative my-8 mr-2"> {/* Carousel section container */}
      {/* Header for the carousel: title and "View All" link. */}
      <div className="flex justify-between items-center mb-4 px-4 md:px-0">
        <h3 className="text-xl text-white font-bold pl-2 md:pl-4 md:m-0 -m-2">{title}</h3>
        {/* Show "View All" link only when not loading. */}
        {!isLoading && shows.length > 0 && ( // Added shows.length check
          <Link to={`/view-all/${encodeURIComponent(tmdbEndpoint)}`}>
            <button className="text-sm text-blue-400 font-semibold hover:underline">View All</button>
          </Link>
        )}
      </div>

      {/* The scrollable container for the carousel items. */}
      <div
        ref={containerRef}
        className="relative w-full overflow-x-auto overflow-y-hidden no-scrollbar px-4" // Hides scrollbar, allows x-scroll
        style={{ maxHeight: `${cardActualWidth * 1.5 + 20}px` }} // Set max height to contain cards
      >
        {/* The content div that holds all items (actual shows + clones). */}
        <div ref={contentRef} className="flex"> {/* Flex display for horizontal layout */}
          {isLoading ? (
            // If loading, display an array of SkeletonCards.
            Array.from({ length: 10 }).map((_, index) => (
              <SkeletonCard key={`skeleton-${index}`} />
            ))
          ) : (
            // If not loading, display the actual show cards.
            <AnimatePresence> {/* For item enter/exit animations (if items could be removed dynamically) */}
              {allItems.map((show, index) => (
                <motion.div
                  key={`${show.id}-${index}-${tmdbEndpoint}`} // Unique key for each item, including clone index and endpoint
                  className="flex-shrink-0 mx-2 py-2" // Styling for item wrapper
                  style={{ width: `${itemWidth}px` }} // Set fixed width
                  initial={{ opacity: 0, y: 20 }} // Initial animation state
                  animate={{ opacity: 1, y: 0 }} // Animate into view
                  whileHover={{ // Hover animation
                    scale: 1.05,
                    boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.3)",
                  }}
                  transition={{ duration: 0.2, ease: "easeOut" }} // Animation transition
                  // Mouse enter/leave handlers for fetching and clearing hover rating.
                  onMouseEnter={() => {
                    setHoveredShowId(show.id);
                    fetchHoverRating(show.id);
                  }}
                  onMouseLeave={() => {
                    setHoveredShowId(null);
                    setHoveredRating(null);
                  }}
                >
                  {/* Link each card to its show detail page. */}
                  <Link to={`/show/${show.id}`}>
                    <TVShowCard
                      imageUrl={
                        show.poster_path // Construct image URL if poster_path exists
                          ? `https://image.tmdb.org/t/p/w300${show.poster_path}`
                          : undefined // Pass undefined if no poster
                      }
                      title={show.name || show.title} // Use name or title field
                      cardWidth={cardActualWidth} // Pass card width to TVShowCard
                      // Pass hovered rating if this show is hovered, otherwise its own (potentially null) averageRating.
                      averageRating={hoveredShowId === show.id ? hoveredRating : show.averageRating}
                    />
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </section>
  );
}

// Export the ShowCarousel component as the default.
export default ShowCarousel;