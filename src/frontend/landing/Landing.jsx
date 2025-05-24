/**
 * @file Landing.jsx
 * @description The main landing page component for unauthenticated users.
 * It showcases various sections of the application like trending shows, popular reviews,
 * feature highlights, statistics, and includes a top navigation bar and footer.
 * It also handles redirection for authenticated users.
 */

// Import `motion` from framer-motion for animations.
import { motion } from 'framer-motion';
// Import `useEffect` hook from React for side effects.
import { useEffect } from 'react';
// Import `useNavigate` from react-router-dom for programmatic navigation.
import { useNavigate } from 'react-router-dom';
// Import `useAuth` custom hook to access authentication context (user state and loading status).
import { useAuth } from "../../context/AuthContext";
// Import various components that make up the landing page.
import TopNavbar from './TopNavbar.jsx';      // Navigation bar for the landing page.
import MottoBanner from './MottoBanner.jsx';    // A banner displaying the application's motto or tagline.
import FeatureCards from './FeatureCards.jsx';  // Cards highlighting key features of the application.
import Statistics from './Statistics.jsx';      // Section displaying some statistics (e.g., users, shows tracked).
import PopularReviews from './PopularReviews.jsx';// Section displaying popular reviews.
import ShowCarousel from '../../components/ShowCarousel.jsx'; // Reusable carousel component for TV shows.
import Footer from './Footer.jsx';              // Page footer.
import LoadingSpinner from '../../components/LoadingSpinner.jsx'; // Loading indicator.

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
 * @function Landing
 * @description A React functional component that serves as the main landing page for unauthenticated users.
 * It aggregates various informational and promotional components. If a user is already authenticated,
 * they are redirected to the main application home page.
 *
 * @returns {JSX.Element | null} The rendered Landing page component, or a loading spinner, or null if redirecting.
 */
function Landing() {
  // Destructure `user` (authenticated user object) and `loading` (auth loading status) from AuthContext.
  const { user, loading } = useAuth();
  // Get the `navigate` function for programmatic redirection.
  const navigate = useNavigate();

  /**
   * `useEffect` hook to handle redirection for authenticated users.
   * If the authentication check is complete (`!loading`) and a user is authenticated (`user`),
   * it navigates the user to the '/home' page.
   * This effect runs when `user`, `loading`, or `navigate` changes.
   */
  useEffect(() => {
    if (!loading && user) { // If not loading and a user is authenticated
      navigate('/home');   // Redirect to the main application home page
    }
  }, [user, loading, navigate]); // Dependencies for the effect

  // If authentication state is still loading, display a full-page loading spinner.
  if (loading) {
    return <LoadingSpinner/>;
  }

  // If there's an authenticated user (after loading is complete), return null.
  // This prevents rendering the landing page content before redirection occurs.
  if (user) {
    return null;
  }

  // Render the Landing page content for unauthenticated users.
  // Each main section is wrapped in a `motion.div` for staggered "fade in up" animations.
  return (
    <>
      {/* Render the TopNavbar component specific to the landing page. */}
      <TopNavbar />

      {/* Animated MottoBanner section. */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        transition={{ delay: 0.2 }} // Staggered animation delay
      >
        <MottoBanner />
      </motion.div>

      {/* Animated ShowCarousel for "Trending This Week". */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        transition={{ delay: 0.4 }}
      >
        <ShowCarousel
          title="Trending This Week"
          tmdbEndpoint="trending/tv/week" // TMDB endpoint for weekly trending TV shows
          mediaType="tv" // Specify media type (though ShowCarousel might infer this)
        />
      </motion.div>

      {/* Animated PopularReviews section. */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        transition={{ delay: 0.6 }}
      >
        <PopularReviews />
      </motion.div>

      {/* Animated FeatureCards section. */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        transition={{ delay: 0.8 }}
      >
        <FeatureCards />
      </motion.div>

      {/* Animated Statistics section. */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        transition={{ delay: 1.0 }}
      >
        <Statistics />
      </motion.div>

      {/* Animated Footer section. */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        transition={{ delay: 1.2 }}
      >
        <Footer />
      </motion.div>
    </>
  );
}

// Export the Landing component as the default export of this module.
export default Landing;