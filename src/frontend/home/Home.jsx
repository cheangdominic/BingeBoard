/**
 * @file Home.js
 * @description The main home page component for authenticated users.
 * It displays various carousels of TV shows (trending, popular, top-rated, etc.) and popular reviews.
 * It also handles redirection for unauthenticated users.
 */

// Import `motion` from framer-motion for animations.
import { motion } from 'framer-motion';
// Import `useEffect` hook from React for side effects.
import { useEffect } from 'react';
// Import `useNavigate` from react-router-dom for programmatic navigation.
import { useNavigate } from 'react-router-dom';
// Import `useAuth` custom hook to access authentication context (user state and loading status).
import { useAuth } from "../../context/AuthContext";
// Import `BottomNavbar` component for navigation.
import BottomNavbar from '../../components/BottomNavbar.jsx';
// Import `TrendingCarousel` component for displaying top-rated shows in a prominent way.
import TrendingCarousel from './TrendingCarousel.jsx';
// Import `ShowCarousel` component for displaying various lists of shows.
import ShowCarousel from '../../components/ShowCarousel.jsx';
// Import `PopularReviewsFiltered` component for displaying popular reviews.
import PopularReviewsFiltered from './PopularReviewsFiltered.jsx';

/**
 * @constant {object} fadeInUp
 * @description A Framer Motion variant object for a "fade in up" animation.
 * @property {object} hidden - The initial state (opacity 0, translated 20px down).
 * @property {object} visible - The target state (opacity 1, original y-position) with transition settings.
 */
const fadeInUp = {
  hidden: { opacity: 0, y: 20 }, // Initial state: invisible and slightly shifted down
  visible: {
    opacity: 1, // Target state: fully visible
    y: 0,       // Target state: original y-position
    transition: {
      duration: 0.6, // Animation duration
      ease: "easeOut" // Easing function for a smooth effect
    }
  }
};

/**
 * @function Home
 * @description A React functional component that serves as the main landing page for authenticated users.
 * It displays various carousels of TV shows fetched from TMDB and a section for popular reviews.
 * If the user is not authenticated, they are redirected to the login page.
 *
 * @returns {JSX.Element | null} The rendered Home page component, or null if redirecting or not yet loaded.
 */
function Home() {
  // Destructure `user` (authenticated user object) and `loading` (auth loading status) from AuthContext.
  const { user, loading } = useAuth();
  // Get the `navigate` function for programmatic redirection.
  const navigate = useNavigate();

  /**
   * `useEffect` hook to handle redirection for unauthenticated users.
   * If the authentication check is complete (`!loading`) and no user is authenticated (`!user`),
   * it navigates the user to the '/login' page.
   * This effect runs when `user`, `loading`, or `navigate` changes.
   */
  useEffect(() => {
    if (!loading && !user) { // If not loading and no user is authenticated
      navigate('/login');   // Redirect to login page
    }
  }, [user, loading, navigate]); // Dependencies for the effect

  // If authentication state is still loading, display a simple "Loading..." message.
  // A more sophisticated loading spinner could be used here.
  if (loading) {
    return <div>Loading...</div>; // Or a LoadingSpinner component
  }

  // If there's no authenticated user (after loading is complete), return null.
  // This prevents rendering the home page content before redirection occurs.
  if (!user) {
    return null; // Or redirect immediately, though useEffect handles this.
  }

  // Render the Home page content for authenticated users.
  return (
    <>
      {/* Animated main container for the home page content. */}
      <motion.div
        initial="hidden" // Initial animation state (from `fadeInUp` variant)
        animate="visible" // Animate to "visible" state
        variants={fadeInUp} // Use the `fadeInUp` animation variants
        transition={{ delay: 0.2 }} // Apply a delay to the overall page animation
        className="pb-20" // Add padding at the bottom to prevent content from being hidden by the BottomNavbar
      >
        {/* TrendingCarousel component, configured to show top-rated TV shows. */}
        <TrendingCarousel tmdbEndpoint="tv/top_rated" />
        {/* ShowCarousel for "Trending Today" TV shows. */}
        <ShowCarousel title="Trending Today" tmdbEndpoint="trending/tv/day" />
        {/* ShowCarousel for "Airing Today TV Shows". */}
        <ShowCarousel title="Airing Today TV Shows" tmdbEndpoint="tv/airing_today" />
        {/* Component to display popular reviews, possibly filtered. */}
        <PopularReviewsFiltered />
        {/* ShowCarousel for "Popular TV Shows". */}
        <ShowCarousel title="Popular TV Shows" tmdbEndpoint="tv/popular" />
        {/* ShowCarousel for "Top Rated TV Shows". */}
        <ShowCarousel title="Top Rated TV Shows" tmdbEndpoint="tv/top_rated" />
        {/* ShowCarousel for "On Air TV Shows". */}
        <ShowCarousel title="On Air TV Shows" tmdbEndpoint="tv/on_the_air" />
      </motion.div>
      {/* Render the BottomNavbar component for navigation. */}
      <BottomNavbar />
    </>
  );
}

// Export the Home component as the default export of this module.
export default Home;