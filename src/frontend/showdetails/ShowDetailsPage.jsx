/**
 * @file ShowDetailsPage.js
 * @description A React component that displays detailed information about a specific TV show.
 * It fetches data from TMDB, including show details, seasons, and episodes.
 * It also integrates sections for logging episodes, viewing episodes by season, and managing reviews.
 * The layout and available actions adapt based on user authentication status.
 */

// Import React hooks and utilities.
import { useState, useEffect, useCallback, useRef } from 'react';
// Import `useParams` from react-router-dom to get the show ID from the URL.
import { useParams } from 'react-router-dom';
// Import `motion` and `AnimatePresence` from framer-motion for animations.
import { motion, AnimatePresence } from 'framer-motion';
// Import `FaChevronDown` icon from react-icons.
import { FaChevronDown } from 'react-icons/fa';
// Import `fetchTVShow` utility function to get show data from TMDB (or a backend proxy).
// The path '/src/backend/tmdb' suggests it might be a client-side utility directly calling TMDB
// or a function that calls a backend endpoint which then calls TMDB.
import { fetchTVShow } from '/src/backend/tmdb';
// Import `useAuth` custom hook to access authentication context.
import { useAuth } from '../../context/AuthContext';
// Import various UI components for different sections of the page.
import ShowHero from './ShowHero';                 // Displays the main hero section with backdrop and basic info.
import ShowDescription from './ShowDescription';   // Displays the show's synopsis.
import EpisodeList from './EpisodeList';           // Component for logging episodes (interactive).
import EpisodeListView from './EpisodeListView';     // Component for viewing episodes by season (display-oriented).
import ReviewSection from './ReviewSection';       // Component for managing and displaying reviews.
import BottomNavbar from '../../components/BottomNavbar.jsx'; // Navigation bar for authenticated users.
import AddToWatchlistButton from './AddToWatchlistButton.jsx'; // Button to add/remove show from watchlist.
import TopNavbar from '../../frontend/landing/TopNavbar.jsx'; // Navigation bar for unauthenticated users.
import Footer from '../../frontend/landing/Footer.jsx';         // Footer for unauthenticated users.
import LoadingSpinner from '../../components/LoadingSpinner.jsx'; // Loading indicator.

// Framer Motion variant for "fade in up" animation.
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1] // Custom easing for a smooth effect.
    }
  }
};

// Framer Motion variant for staggering child animations.
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Delay between each child's animation.
      delayChildren: 0.2   // Initial delay before children start animating.
    }
  }
};

// Framer Motion variant for "scale up" animation.
const scaleUp = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

/**
 * @function ShowDetailsPage
 * @description A React functional component that serves as the main page for displaying TV show details.
 *
 * @returns {JSX.Element} The rendered ShowDetailsPage component.
 */
const ShowDetailsPage = () => {
  /**
   * `id`: The ID of the TV show, extracted from the URL parameters.
   * @type {{id: string}}
   */
  const { id } = useParams();
  // State to store the fetched and formatted show data.
  const [show, setShow] = useState(null);
  // State to track loading status for the main show data.
  const [loading, setLoading] = useState(true);
  // State to store any error messages during data fetching.
  const [error, setError] = useState(null);
  // State for reviews (currently unused directly in this component, passed to ReviewSection).
  const [reviews, setReviews] = useState([]);
  // State for loading status of reviews (currently unused directly, passed to ReviewSection).
  const [reviewsLoading, setReviewsLoading] = useState(false);
  // Get the authenticated user from AuthContext.
  const { user } = useAuth();
  // Refs for scrolling to specific sections of the page.
  const episodesRef = useRef(null);   // Ref for the "Log Episodes" section.
  const seasonViewRef = useRef(null); // Ref for the "Episodes by Season" section.
  const reviewsRef = useRef(null);    // Ref for the "Reviews" section.

  /**
   * Scrolls the window smoothly to a specified ref's element.
   * @param {React.RefObject} ref - The ref object of the target element.
   */
  const scrollToRef = (ref) => {
    if (ref.current) {
      window.scrollTo({
        top: ref.current.offsetTop - 20, // Scroll to 20px above the element for some spacing.
        behavior: 'smooth' // Smooth scrolling.
      });
    }
  };

  /**
   * Formats an air date into a countdown string (e.g., "5 days", "Available now").
   * @param {string} airDate - The ISO air date string.
   * @returns {string} The formatted countdown string or "Coming soon".
   */
  const formatCountdown = (airDate) => {
    if (!airDate) return 'Coming soon';
    const now = new Date();
    const airDateObj = new Date(airDate);
    const diffTime = airDateObj - now; // Difference in milliseconds.
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert to days.
    return diffDays > 0 ? `${diffDays} days` : 'Available now';
  };

  /**
   * Extracts and formats platform/network names from TMDB data.
   * @param {object} tmdbData - The raw show data object from TMDB.
   * @returns {Array<string>} An array of unique platform/network names.
   */
  const getPlatforms = (tmdbData) => {
    const networks = tmdbData.networks?.map(n => n.name) || [];
    // Accessing watch providers, assuming US region and flatrate providers.
    const providers = tmdbData['watch/providers']?.results?.US?.flatrate?.map(p => p.provider_name) || [];
    return [...new Set([...networks, ...providers])]; // Combine and get unique names.
  };

  /**
   * Formats the raw TMDB show data into a more structured object for use in the component.
   * Wrapped in `useCallback` for memoization, as it's a dependency of `useEffect`.
   * @param {object} tmdbData - The raw show data object from TMDB.
   * @returns {object} The formatted show data object.
   */
  const formatShowData = useCallback((tmdbData) => ({
    id: tmdbData.id,
    title: tmdbData.name,
    releaseDate: tmdbData.first_air_date,
    description: tmdbData.overview,
    status: tmdbData.status,
    creator: tmdbData.created_by?.map(c => c.name).join(', ') || 'Unknown', // Join multiple creators.
    // Get US content rating or default.
    rating: (tmdbData.content_ratings?.results.find(r => r.iso_3166_1 === 'US') || {}).rating || 'TV-MA',
    platforms: getPlatforms(tmdbData), // Get formatted platform/network names.
    // Filter out season 0 (specials) and map season data.
    seasons: tmdbData.seasons?.filter(s => s.season_number > 0).map(season => ({
      id: season.id,
      number: season.season_number,
      name: season.name,
      episodes: [], // Episodes will be fetched separately by EpisodeList/EpisodeListView.
      episodeCount: season.episode_count
    })) || [],
    // Format next episode air date if available.
    nextEpisode: tmdbData.next_episode_to_air ? {
      countdown: formatCountdown(tmdbData.next_episode_to_air.air_date)
    } : null,
    // Construct backdrop URL or use fallback.
    backdropUrl: tmdbData.backdrop_path
      ? `https://image.tmdb.org/t/p/w1280${tmdbData.backdrop_path}`
      : '/images/fallback.jpg', // Ensure this fallback image exists.
    poster_path: tmdbData.poster_path // Keep poster_path for components that need it.
  }), []); // Empty dependency array for useCallback as it doesn't depend on component state/props.

  /**
   * `useEffect` hook to load the show details when the component mounts or `id`/`formatShowData` changes.
   */
  useEffect(() => {
    const loadShow = async () => {
      try {
        setError(null); // Clear previous errors.
        setLoading(true); // Set loading state.
        // Fetch show data using the utility function (which calls TMDB).
        const showDataFromTMDB = await fetchTVShow(id); // `fetchTVShow` needs to be robust.
        if (showDataFromTMDB) {
          setShow(formatShowData(showDataFromTMDB)); // Format and set show data.
        } else {
          setError('Show data not found.'); // Set error if no data returned.
        }
      } catch (err) {
        setError('Failed to load show details'); // Set error on fetch failure.
        console.error("API Error fetching show:", err);
      } finally {
        setLoading(false); // Reset loading state.
      }
    };

    if (id) { // Fetch only if ID is present.
      loadShow();
    }
  }, [id, formatShowData]); // Dependencies.

  // If main show data is loading, display a full-page loading spinner.
  if (loading) return <LoadingSpinner />;

  // If an error occurred while fetching main show data.
  if (error) return (
    <motion.div
      className="flex items-center justify-center h-screen bg-[#1e1e1e]"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
    >
      <motion.div
        className="text-white text-lg font-medium p-8 bg-red-900/30 rounded-xl"
        initial={{ scale: 0.9 }} animate={{ scale: 1 }}
      >
        {error} {/* Display error message. */}
      </motion.div>
    </motion.div>
  );

  // If no show data was found (after loading and no error).
  if (!show) return (
    <motion.div
      className="flex items-center justify-center h-screen bg-[#1e1e1e]"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
    >
      <motion.div
        className="text-white text-lg font-medium"
        initial={{ y: 20 }} animate={{ y: 0 }}
      >
        Show not found
      </motion.div>
    </motion.div>
  );

  // Boolean flag indicating if the current user is authenticated.
  const isAuthenticatedBool = !!user;

  // Main render method for the ShowDetailsPage.
  return (
    // Animated page container.
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#1e1e1e] text-gray-100" // Base styling.
    >
      {/* Conditionally render TopNavbar if user is not authenticated. */}
      {!isAuthenticatedBool && <TopNavbar />}
      {/* Main content area with padding and spacing. */}
      <div className="p-6 max-w-8xl mx-auto space-y-8"> {/* Max width and centering. */}
        {/* Hero section for the show, animated. */}
        <AnimatePresence mode="wait"> {/* Ensures smooth transitions if `show` data changes. */}
          <motion.div
            key={`hero-${id}`} // Key based on show ID for re-animation if ID changes.
            initial="hidden"
            animate="visible"
            variants={fadeInUp} // Use fadeInUp animation.
            transition={{ delay: 0.2 }} // Animation delay.
          >
            <ShowHero show={show} isLoading={loading} /> {/* Pass show data and loading state. */}
          </motion.div>
        </AnimatePresence>

        {/* Quick navigation buttons to scroll to different sections. */}
        <motion.div
          className="flex flex-wrap justify-center gap-4 my-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {/* Button to scroll to "Log Episodes" section. */}
          <motion.button
            onClick={() => scrollToRef(episodesRef)}
            className="flex items-center gap-2 px-4 py-2 bg-[#2a2a2a] rounded-full shadow-lg hover:shadow-xl transition-all"
            whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)" }} // Hover animation.
          >
            <span>Log Episodes</span>
            <FaChevronDown className="text-blue-400" /> {/* Icon. */}
          </motion.button>
          {/* Button to scroll to "Episodes by Season" section. */}
          <motion.button
            onClick={() => scrollToRef(seasonViewRef)}
            className="flex items-center gap-2 px-4 py-2 bg-[#2a2a2a] rounded-full shadow-lg hover:shadow-xl transition-all"
            whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)" }}
          >
            <span>Episodes by Season</span>
            <FaChevronDown className="text-blue-400" />
          </motion.button>
          {/* Button to scroll to "Reviews" section. */}
          <motion.button
            onClick={() => scrollToRef(reviewsRef)}
            className="flex items-center gap-2 px-4 py-2 bg-[#2a2a2a] rounded-full shadow-lg hover:shadow-xl transition-all"
            whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)" }}
          >
            <span>Reviews</span>
            <FaChevronDown className="text-blue-400" />
          </motion.button>
        </motion.div>

        {/* Main content grid: Description, Watchlist Button, and Show Details card. */}
        <motion.div
          variants={staggerContainer} // Apply stagger animation to children.
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-8" // Responsive grid layout.
        >
          {/* Left column: Show description and Add to Watchlist button. */}
          <motion.div
            variants={fadeInUp} // Individual item animation.
            className="lg:col-span-2 space-y-6" // Spans 2 columns on large screens.
          >
            <ShowDescription show={show} /> {/* Pass show data. */}
            {/* Add to Watchlist button, shown if user is authenticated. */}
            <motion.div
              whileHover={{ scale: 1.02 }} // Subtle hover scale.
              whileTap={{ scale: 0.98 }}   // Tap animation.
            >
              {isAuthenticatedBool && <AddToWatchlistButton showId={id} />}
            </motion.div>
          </motion.div>

          {/* Right column: Show Details card. */}
          <motion.div
            variants={scaleUp} // Individual item animation (scale up).
            className="lg:col-span-1" // Spans 1 column on large screens.
          >
            <div className="bg-[#2a2a2a] rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <motion.h3
                className="text-xl font-bold mb-4"
                whileHover={{ x: 5 }} // Slight horizontal shift on hover.
              >
                Show Details
              </motion.h3>
              <div className="space-y-3">
                {/* Array of show detail items to display. */}
                {[
                  { label: 'Status', value: show.status },
                  { label: 'Creator', value: show.creator },
                  { label: 'First Aired', value: show.releaseDate },
                  { label: 'Rating', value: show.rating }, // This is content rating (e.g., TV-MA).
                  { label: 'Available On', value: show.platforms.join(', ') || 'N/A' }, // Join platforms or show N/A.
                  // Conditionally add "Next Episode" info if available.
                  ...(show.nextEpisode ? [{ label: 'Next Episode', value: show.nextEpisode.countdown }] : [])
                ].map((item, index) => (
                  // Animated list item for each detail.
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }} // Staggered delay.
                  >
                    <p className="text-gray-400 text-sm">{item.label}</p>
                    <p className="font-medium">{item.value}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* "Log Episodes" section (interactive EpisodeList). */}
        <motion.div
          ref={episodesRef} // Attach ref for scrolling.
          initial="hidden" animate="visible" variants={fadeInUp} transition={{ delay: 0.6 }}
          className="bg-[#2a2a2a] rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
        >
          <motion.h2 className="text-2xl font-bold mb-6" whileHover={{ scale: 1.01 }}>
            Log Episodes
          </motion.h2>
          {/* Render EpisodeList if show and season data are available. */}
          {show && show.seasons && (
            <EpisodeList
              seasons={show.seasons}
              showId={id}
              isAuthenticated={isAuthenticatedBool}
              showName={show.title || "Unknown Show"} // Pass show name.
              posterPath={show.poster_path || null} // Pass poster path.
            />
          )}
        </motion.div>

        {/* "Episodes by Season" section (display-oriented EpisodeListView). */}
        <motion.div
          ref={seasonViewRef} // Attach ref for scrolling.
          initial="hidden" animate="visible" variants={fadeInUp} transition={{ delay: 0.7 }}
          className="bg-[#2a2a2a] rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
        >
          <motion.h2 className="text-2xl font-bold mb-6" whileHover={{ scale: 1.01 }}>
            Episodes by Season
          </motion.h2>
          {/* Render EpisodeListView if show and season data are available. */}
          {show && show.seasons && (
            <EpisodeListView seasons={show.seasons} showId={id} showName={show.title} posterPath={show.poster_path} />
          )}
        </motion.div>

        {/* "Reviews" section. */}
        <motion.div
          ref={reviewsRef} // Attach ref for scrolling.
          initial="hidden" animate="visible" variants={fadeInUp} transition={{ delay: 0.8 }}
          className="bg-[#2a2a2a] rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
        >
          <ReviewSection
            showId={id}
            showTitle={show.title}
            currentUserId={user?._id} // Pass current user's ID.
            // Reviews and setReviews are managed by ReviewSection itself based on showId.
            // Passing them as props here might be redundant if ReviewSection fetches its own data.
            // If ReviewSection is meant to display reviews passed from parent, then these props are fine.
            // reviews={reviews} 
            // setReviews={setReviews}
            // isLoading={reviewsLoading} 
          />
        </motion.div>
        {/* Conditionally render BottomNavbar if user is authenticated, Footer otherwise. */}
        {isAuthenticatedBool && <BottomNavbar />}
        {!isAuthenticatedBool && <Footer />}
      </div>
    </motion.div>
  );
};

// Export the ShowDetailsPage component as the default.
export default ShowDetailsPage;