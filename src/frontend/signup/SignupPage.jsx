/**
 * @file SignupPage.jsx
 * @description A React component that renders the signup page.
 * It includes a top navigation bar, the signup form, and a footer.
 * It also handles redirection to the home page if a user is already logged in.
 */

// Import `motion` from framer-motion for animations.
import { motion } from 'framer-motion';
// Import `useEffect` hook from React for side effects.
import { useEffect } from 'react';
// Import `useNavigate` from react-router-dom for programmatic navigation.
import { useNavigate } from 'react-router-dom';
// Import `useAuth` custom hook to access authentication context (user state).
import { useAuth } from "../../context/AuthContext";
// Import `SignupForm` component, which contains the actual signup form UI and logic.
import SignupForm from "./SignupForm";
// Import `TopNavbar` component, likely a navigation bar for landing/unauthenticated pages.
import TopNavbar from "../landing/TopNavbar";
// Import `Footer` component.
import Footer from '../landing/Footer.jsx';

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
 * @function SignupPage
 * @description A React functional component that serves as the container for the signup page.
 * It displays the `TopNavbar`, the `SignupForm`, and the `Footer`.
 * If a user is already authenticated, they are redirected to the '/home' page.
 *
 * @returns {JSX.Element | null} The rendered SignupPage component or null if redirecting.
 */
function SignupPage() {
  /**
   * `user`: The authenticated user object from the AuthContext. Null if not authenticated.
   * @type {object|null}
   */
  const { user } = useAuth(); // Note: `loading` state from useAuth is not used here.
                              // If redirection should wait for auth check completion, `loading` would be needed.
  /**
   * `navigate`: Function from `react-router-dom` used for programmatic navigation.
   * @type {function}
   */
  const navigate = useNavigate();

  /**
   * `useEffect` hook to handle redirection for authenticated users.
   * If a `user` object exists (meaning a user is logged in), it navigates them to the '/home' page.
   * This effect runs when `user` or `navigate` changes.
   */
  useEffect(() => {
    if (user) { // If a user is already logged in
      navigate('/home'); // Redirect to the home page
    }
  }, [user, navigate]); // Dependencies for the effect

  // If a user is already authenticated, this component might return null,
  // or the redirection might happen before a full render.
  // A loading state check (if `loading` from `useAuth` was used) could show a spinner here.

  // Render the SignupPage structure.
  return (
    <>
      {/* Render the TopNavbar component. */}
      <TopNavbar />
      
      {/* Animated container for the SignupForm component. */}
      <motion.div
        initial="hidden" // Initial animation state (from `fadeInUp` variant)
        animate="visible" // Animate to "visible" state
        variants={fadeInUp} // Use the `fadeInUp` animation variants
        transition={{ delay: 0.2 }} // Apply a delay to this animation
        key="signup-form" // Unique key for Framer Motion (useful with AnimatePresence, though not strictly needed here).
      >
        <SignupForm /> {/* Render the actual signup form. */}
      </motion.div>
      
      {/* Animated container for the Footer component. */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        transition={{ delay: 0.4 }} // Apply a slightly longer delay for a staggered effect
        key="footer" // Unique key.
      >
        <Footer /> {/* Render the page footer. */}
      </motion.div>
    </>
  );
}

// Export the SignupPage component as the default export of this module.
export default SignupPage;