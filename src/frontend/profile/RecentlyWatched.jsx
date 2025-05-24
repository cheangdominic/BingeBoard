/**
 * @file RecentlyWatched.jsx
 * @description A React component that displays a horizontally scrolling carousel of TV shows
 * recently watched by the authenticated user. It fetches data from an API and implements
 * an infinite scroll illusion if enough items are present.
 */

// Import React hooks and utilities.
import React, { useEffect, useState, useRef, useCallback } from "react";
// Import TVShowCard component for displaying individual shows.
import TVShowCard from "../../components/TVShowCard";
// Import Link for client-side navigation.
import { Link } from "react-router-dom";
// Import motion and AnimatePresence from framer-motion for animations.
import { motion, AnimatePresence } from "framer-motion";
// Import useAuth custom hook to access authentication context (current user).
import { useAuth } from "../../context/AuthContext.jsx";

/**
 * @function RecentlyWatched
 * @description A React functional component that renders a carousel of recently watched TV shows.
 *
 * @param {object} props - The properties passed to the component.
 * @param {string} [props.title="Recently Watched"] - The title to display above the carousel.
 * @param {number} [props.cardActualWidth=130] - The actual width of each TVShowCard in pixels.
 * @param {'smooth' | 'auto'} [props.userScrollBehavior="smooth"] - The `scroll-behavior` CSS property for user-initiated scrolls.
 * @returns {JSX.Element} The rendered RecentlyWatched component.
 */
function RecentlyWatched({
  title = "Recently Watched", // Default title
  cardActualWidth = 130,     // Default card width
  userScrollBehavior = "smooth", // Default scroll behavior
  username, 
}) {
  // State to store the array of recently watched shows.
  const [shows, setShows] = useState([]);
  // State to track loading status.
  const [isLoading, setIsLoading] = useState(true);
  // Ref for the scrollable container div.
  const containerRef = useRef(null);
  // Ref for the content div that holds all show cards.
  const contentRef = useRef(null);
  // Get the authenticated user from AuthContext.
  const { user: authUser } = useAuth();
  // Determine if the profile is the authenticated user's own profile.
  const isOwnProfile = !username || username === authUser?.username;
  // Determine the API endpoint based on whether it's the user's own profile.
  const endpoint = isOwnProfile
    ? "/api/users/recently-watched"
    : `/api/users/${username}/recently-watched`;
  // Item width used for calculations, derived from cardActualWidth.
  const itemWidth = cardActualWidth;
  // Minimum number of shows required to enable the infinite scroll illusion.
  const MIN_SHOWS_FOR_INFINITE_SCROLL = 6;

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
      setIsLoading(true);
      try {
        // Fetch data from the endpoint.
        // `credentials: "include"` sends cookies (for session authentication).
        const response = await fetch(endpoint, {
          credentials: "include",
        });

        // If the response is not OK, attempt to parse error and throw.
        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ // Fallback if JSON parsing fails
              message: `HTTP error! status: ${response.status}`,
            }));
          throw new Error(
            errorData.error || // Prefer `error` field from backend
            errorData.message || // Then `message` field
            `HTTP error! status: ${response.status}` // Generic HTTP error
          );
        }

        // Parse successful response as JSON.
        const data = await response.json();
        // Map the fetched data to a consistent structure expected by TVShowCard.
        setShows(
          data.map((s) => ({
            ...s,
            id: s.showId, // Ensure 'id' field exists
            name: s.showName, // Ensure 'name' field exists
            poster_path: s.posterPath, // Ensure 'poster_path' field exists
          }))
        );
      } catch (error) {
        console.error("Error fetching recently watched shows:", error);
        setShows([]); // Set shows to empty array on error.
      } finally {
        setIsLoading(false); // Set loading to false.
      }
    };

    fetchRecentlyWatchedData();
  }, [authUser]); // Dependency: re-run if `authUser` changes.

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

    // Calculate width of one set of original shows, including margin (16px is from mx-2 which is 0.5rem * 2 = 1rem = 16px assumed).
    const contentWidth = shows.length * (itemWidth + 16); // itemWidth + (0.5rem margin-left + 0.5rem margin-right)
    const scrollPos = container.scrollLeft;
    const containerWidth = container.offsetWidth;

    let newScrollLeft = scrollPos;
    let didTeleport = false;

    // Check if scrolled near the end of the third clone.
    if (scrollPos >= contentWidth * 2 - containerWidth / 2) {
      newScrollLeft = scrollPos - contentWidth; // Teleport back.
      didTeleport = true;
    }
    // Check if scrolled near the beginning of the first clone (relative to initial middle).
    else if (scrollPos <= contentWidth - containerWidth / 2) {
      newScrollLeft = scrollPos + contentWidth; // Teleport forward.
      didTeleport = true;
    }

    // If teleportation occurred, adjust scrollLeft without smooth scrolling.
    if (didTeleport) {
      const originalBehavior = container.style.scrollBehavior;
      container.style.scrollBehavior = "auto"; // Disable smooth scroll for jump.
      container.scrollLeft = newScrollLeft;
      container.style.scrollBehavior = originalBehavior || userScrollBehavior; // Restore original/user-defined behavior.
    }
  }, [shows, itemWidth, userScrollBehavior]); // Dependencies for useCallback.

  /**
   * `useEffect` hook to set up initial scroll position and attach/detach scroll listener.
   * Manages the width of the content div based on whether infinite scroll is active.
   */
  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;

    // Guard clause.
    if (!container || !content || shows.length === 0 || itemWidth <= 0) {
      if (content) content.style.width = "0px"; // Reset content width if no shows.
      return;
    }

    // Calculate actual item width including horizontal margins (mx-2 implies 0.5rem on each side).
    // Assuming 1rem = 16px for this calculation.
    const actualItemWidthWithMargin = itemWidth + 16; // 0.5rem + 0.5rem = 1rem = 16px for margins.
    const contentWidth = shows.length * actualItemWidthWithMargin;

    // If not enough shows for infinite scroll, set content width to fit only original items
    // and remove scroll listener.
    if (shows.length < MIN_SHOWS_FOR_INFINITE_SCROLL) {
      content.style.width = `${contentWidth}px`;
      container.style.scrollBehavior = userScrollBehavior;
      container.removeEventListener("scroll", handleScroll); // Ensure listener is removed.
    } else {
      // If enough shows, set content width for three clones (for infinite scroll).
      content.style.width = `${contentWidth * 3}px`;
      // Set initial scroll position to the start of the middle clone.
      const initialScrollPosition = contentWidth;

      // Set initial scroll without smooth scrolling.
      const originalBehavior = container.style.scrollBehavior;
      container.style.scrollBehavior = "auto";
      container.scrollLeft = initialScrollPosition;
      container.style.scrollBehavior = userScrollBehavior; // Restore user-defined behavior.

      // Add scroll event listener.
      container.addEventListener("scroll", handleScroll, { passive: true });
    }

    // Cleanup function: remove scroll listener when component unmounts or dependencies change.
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [shows, itemWidth, handleScroll, userScrollBehavior]); // Dependencies.

  // If loading, display skeleton cards.
  if (isLoading) {
    const SkeletonCard = () => ( // Define SkeletonCard component locally.
      <motion.div
        className="flex-shrink-0 mx-2 py-2" // Styling for skeleton item wrapper.
        style={{ width: `${itemWidth}px` }} // Set fixed width.
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.5 } }}
      >
        <motion.div
          className="bg-gray-700 rounded-lg overflow-hidden" // Base styling for skeleton.
          style={{ width: `${itemWidth}px`, height: `${itemWidth * 1.5}px` }} // Dynamic height.
          // Shimmer animation using a gradient background.
          animate={{
            background: [
              "linear-gradient(90deg, #2d3748 0%, #4a5568 50%, #2d3748 100%)",
              "linear-gradient(90deg, #2d3748 0%, #4a5568 100%, #2d3748 100%)",
              "linear-gradient(90deg, #2d3748 0%, #4a5568 50%, #2d3748 100%)",
            ],
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
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
          ref={containerRef} // Attach ref even for skeleton for layout consistency if needed.
          className="relative w-full overflow-x-auto no-scrollbar px-4"
        >
          <div ref={contentRef} className="flex">
            {/* Display 5 skeleton cards. */}
            {Array.from({ length: 5 }).map((_, index) => (
              <SkeletonCard key={`skeleton-recent-${index}`} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // If user is not authenticated, display a login prompt.
  if (!authUser) {
    return (
      <section className="relative my-8 py-4 px-4 md:px-0">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-400">
          Please{" "}
          <a href="/login" className="text-blue-400 hover:underline"> {/* Simple link to login, consider <Link> */}
            log in
          </a>{" "}
          to see this section.
        </p>
      </section>
    );
  }

  // If user is authenticated but has no recently watched shows.
  if (!shows || shows.length === 0) {
    return (
      <section className="relative my-8">
        <h3 className="text-xl font-bold px-4 md:px-0 mb-4">{title}</h3>
        <p className="px-4 md:px-0 text-gray-400">
          {isOwnProfile
          ? "You haven't watched any shows recently."
          : `${username} hasn’t watched any shows recently.`}
        </p>
      </section>
    );
  }

  // Determine items to display: original list or cloned list for infinite scroll.
  const displayItems =
    shows.length < MIN_SHOWS_FOR_INFINITE_SCROLL // If not enough shows for infinite scroll
      ? shows // Display only the original shows
      : [...shows, ...shows, ...shows]; // Otherwise, display three clones

  // Main render for when shows are available.
  return (
    <section className="relative my-8 pl-2 mr-2"> {/* Carousel section container. */}
      {/* Header: title. */}
      <div className="flex justify-between items-center mb-4 px-4 md:px-0">
        <h3 className="text-xl text-white font-bold md:pl-2 md:m-0 -m-2">
          {title}
        </h3>
        {/* "View All" link could be added here if applicable. */}
      </div>
      {/* Scrollable container. */}
      <div
        ref={containerRef}
        className="relative w-full overflow-x-auto no-scrollbar px-4" // Hides scrollbar, allows x-scroll.
      >
        {/* Content div holding all show cards. */}
        <div ref={contentRef} className="flex">
          <AnimatePresence> {/* For item enter/exit animations if items were dynamically added/removed. */}
            {displayItems.map((show, index) => (
              // Animated wrapper for each TVShowCard.
              <motion.div
                key={`${show.id}-${index}`} // Unique key including index for cloned items.
                className="flex-shrink-0 mx-2 py-2" // Styling for item wrapper (mx-2 provides 0.5rem margin each side).
                style={{ width: `${itemWidth}px` }} // Set fixed width.
                // Framer Motion animation properties.
                initial={{ opacity: 0, y: 20, scale: 0.95 }} // Initial state.
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { // Staggered spring animation for appearance.
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
                {/* Link each card to its show detail page. */}
                <Link to={`/show/${show.id}`}>
                  <TVShowCard
                    imageUrl={
                      show.poster_path // Construct image URL if poster_path exists.
                        ? `https://image.tmdb.org/t/p/w300${show.poster_path}`
                        : undefined // Pass undefined if no poster.
                    }
                    title={show.name || show.title} // Use name or title field.
                    cardWidth={cardActualWidth} // Pass card width to TVShowCard.
                  />
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

// Export the RecentlyWatched component as the default.
export default RecentlyWatched;