/**
 * @file AboutUsPage.jsx
 * @description A React component that renders the "About Us" page.
 * This page includes a landing navigation bar, information about the team, and a footer.
 * It also handles redirection to the home page if a user is already logged in.
 */

// Import `useEffect` hook from React for side effects.
import { useEffect } from 'react';
// Import `motion` from framer-motion for animations.
import { motion } from 'framer-motion';
// Import `useNavigate` from react-router-dom for programmatic navigation.
import { useNavigate } from 'react-router-dom';
// Import `useAuth` custom hook to access authentication context (user state).
import { useAuth } from "../../context/AuthContext";
// Import `Landing` component, likely a top navigation bar for non-authenticated users.
import Landing from '../landing/TopNavbar';
// Import `Footer` component.
import Footer from '../landing/Footer';
// Import `AboutUsInfo` component, which contains the main content about the team.
import AboutUsInfo from './AboutUsInfo';

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
 * @function AboutUsPage
 * @description A React functional component that serves as the main container for the "About Us" page.
 * It orchestrates the display of different sections and handles user authentication status for redirection.
 *
 * @returns {JSX.Element} The rendered AboutUsPage component.
 */
function AboutUsPage() {
  /**
   * `useEffect` hook to scroll the window to the top (0, 0) when the component mounts.
   * This ensures the user sees the page from the beginning.
   * The empty dependency array `[]` means this effect runs only once after the initial render.
   */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Destructure `user` from the authentication context.
  const { user } = useAuth();
  // Get the `navigate` function from react-router-dom for redirection.
  const navigate = useNavigate();

  /**
   * `useEffect` hook to handle redirection if a user is already logged in.
   * If `user` object exists (meaning a user is authenticated), it navigates them to the '/home' page.
   * This effect runs when `user` or `navigate` changes.
   */
  useEffect(() => {
    if (user) { // If a user is logged in
      navigate('/home'); // Redirect to the home page
    }
  }, [user, navigate]); // Dependencies: re-run if user state or navigate function changes

  // Render the About Us page structure.
  return (
    <>
      {/* Render the Landing component (likely a top navigation bar specific to landing/unauthenticated pages). */}
      <Landing />

      {/* Animated container for the AboutUsInfo component. */}
      <motion.div
        initial="hidden" // Initial animation state (from `fadeInUp` variant)
        animate="visible" // Animate to "visible" state
        variants={fadeInUp} // Use the `fadeInUp` animation variants
        transition={{ delay: 0.3 }} // Apply a delay to this animation
        key="aboutus-info" // Unique key for Framer Motion's AnimatePresence or list rendering (though not strictly necessary here without AnimatePresence directly on it)
      >
        <AboutUsInfo /> {/* Render the main content about the team. */}
      </motion.div>

      {/* Animated container for the Footer component. */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        transition={{ delay: 0.5 }} // Apply a slightly longer delay for a staggered effect
        key="footer"
      >
        <Footer /> {/* Render the page footer. */}
      </motion.div>
    </>
  );
}

// Export the AboutUsPage component as the default export of this module.
export default AboutUsPage;