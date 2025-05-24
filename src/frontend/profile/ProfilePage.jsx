/**
 * @file ProfilePage.jsx
 * @description A React component that renders a user's profile page.
 * It displays various sections like the profile card, recently watched shows, recent reviews,
 * and watchlist. It handles fetching user data and authentication checks.
 */

// Import React hooks (useEffect, useState) for managing state and side effects.
import { useEffect, useState } from "react";
// Import `motion` from framer-motion for animations.
import { motion } from "framer-motion";
// Import `useNavigate` and `useParams` from react-router-dom for navigation and accessing URL parameters.
import { useNavigate, useParams } from 'react-router-dom';
// Import `useAuth` custom hook to access authentication context (current user and loading status).
import { useAuth } from "../../context/AuthContext.jsx";
// Import various components that make up the profile page.
import ProfileCard from "./ProfileCard.jsx";           // Displays the main profile information.
import RecentlyWatched from "./RecentlyWatched.jsx";   // Displays recently watched shows.
import RecentReviews from "./RecentReviews.jsx";       // Displays recent reviews by the user.
import WatchlistCarousel from "./WatchlistCarousel.jsx"; // Displays the user's watchlist.
import BottomNavbar from "../../components/BottomNavbar.jsx"; // Navigation bar at the bottom.
import LogoutButton from "./LogoutButton.jsx";         // Button for logging out.
import LoadingSpinner from "../../components/LoadingSpinner.jsx"; // Loading indicator.

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
    transition: { duration: 0.6, ease: "easeOut" }, // Animation transition settings
  },
};

/**
 * @function ProfilePage
 * @description A React functional component that serves as the main container for a user's profile page.
 * It fetches user data based on the username from URL parameters or the authenticated user's info.
 * It handles loading and error states, and ensures user authentication.
 *
 * @returns {JSX.Element | null} The rendered ProfilePage component, a loading spinner, an error message, or null if redirecting.
 */
function ProfilePage() {
  /**
   * `username` from the URL parameters. If present, it indicates viewing another user's profile.
   * If undefined, it implies viewing the authenticated user's own profile.
   * @type {{username?: string}}
   */
  const { username } = useParams();
  /**
   * State to store the data of the user whose profile is being viewed.
   * @type {[object|null, function(object|null): void]}
   */
  const [user, setUser] = useState(null);
  /**
   * `authUser`: The currently authenticated user object from AuthContext.
   * `authLoading`: Boolean indicating if the authentication status is currently being loaded.
   * @type {{user: object|null, loading: boolean}}
   */
  const { user: authUser, loading: authLoading } = useAuth();
  /**
   * `navigate`: Function from `react-router-dom` used for programmatic navigation.
   * @type {function}
   */
  const navigate = useNavigate();

  /**
   * `useEffect` hook to redirect unauthenticated users to the login page.
   * Runs when `authUser`, `authLoading`, or `navigate` changes.
   */
  useEffect(() => {
    if (!authLoading && !authUser) { // If auth check is complete and no user is authenticated
      navigate('/login'); // Redirect to login page
    }
  }, [authUser, authLoading, navigate]); // Dependencies

  /**
   * `useEffect` hook to fetch the profile data.
   * It determines whether to fetch the authenticated user's data or another user's data based on `username` param.
   * Runs when `authUser`, `authLoading`, or `username` changes.
   */
  useEffect(() => {
  // Proceed only if auth check is complete and a user is authenticated (or if viewing another's profile, this check is still good).
  if (!authLoading && authUser) {
    window.scrollTo(0, 0); // Scroll to top on profile load.
    // Determine the API endpoint based on whether a `username` URL parameter is present.
    // If `username` exists, fetch that user's public profile. Otherwise, fetch the authenticated user's info.
    const endpoint = username ? `/api/users/${username}` : '/api/getUserInfo';
    
    fetch(endpoint, { credentials: "include" }) // `credentials: "include"` sends cookies.
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`); // Handle HTTP errors.
        return res.json(); // Parse JSON response.
      })
      .then(data => {
        console.log("User data:", data); // Log fetched data for debugging.
        // The API might return data directly or nested under a 'user' key.
        // This handles both cases: `data.user` for `/api/users/:username` and `data` for `/api/getUserInfo`.
        setUser(data.user || data);
      })
      .catch(err => {
        console.error("Error loading user data:", err);
        // Set a user object with an error flag to display an error message in the UI.
        setUser({ username: "error", error: true }); // Placeholder for error state.
      });
  }
}, [authUser, authLoading, username]); // Dependencies for fetching profile data.

  // If authentication status is still loading, display a full-page loading spinner.
  if (authLoading) {
    return (
      <LoadingSpinner />
    );
  }

  // If no authenticated user (after loading), return null (redirection is handled by useEffect).
  if (!authUser) {
    return null;
  }

  // If the profile data (`user` state) is not yet loaded (and not an error state), show loading spinner.
  // This covers the period after auth is loaded but before profile data is fetched.
  if (!user) {
    return (
      <LoadingSpinner />
    );
  }

  // If an error occurred while fetching profile data, display an error message.
  if (user.error) {
    return (
         <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#1e1e1e', color: 'white', padding: '20px', textAlign: 'center' }}>
            <p>Could not load profile data. Please try again later.</p>
            {/* Ensure BottomNavbar is still accessible even on error pages within the authenticated part of the app. */}
            <div className="fixed bottom-0 left-0 right-0 w-full">
                <BottomNavbar />
            </div>
        </div>
    )
  }

  // Determine the profile picture URL, using a default if not available.
  const profilePic = user.profilePic || "/img/profilePhotos/generic_profile_picture.jpg";

  // Render the Profile Page content.
  return (
    <>
      {/* Main container for the profile page content with styling. */}
      <div className="p-6 mx-auto font-coolvetica text-white space-y-6 bg-[#1e1e1e] min-h-screen pb-20"> {/* Padding at bottom for BottomNavbar */}
        {/* ProfileCard component displaying user's main profile info.
            `isOwnProfile` is set to true here. This logic might need adjustment if `username` param
            is used to view other profiles. Currently, it assumes this page is always for the authenticated user's own profile,
            or that `ProfileCard` internally handles the distinction if `user` object is different from `authUser`.
            A more robust check for `isOwnProfile` would be `authUser?._id === user?._id`.
            Given the endpoint logic, if `username` is present, `user` will be that other user.
            If `username` is not present, `user` will be `authUser`. So, `!username` implies own profile.
        */}
        <ProfileCard user={user} profilePic={profilePic} isOwnProfile={!username || authUser?.username === username} />

        {/* Animated section for "Recently Watched" shows. */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.2 }} // Staggered animation delay
        >
          <RecentlyWatched userId={user._id} />
        </motion.div>

        {/* Animated section for "Recent Reviews". */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.4 }}
        >
          <RecentReviews userId={user._id} />
        </motion.div>

        {/* Animated section for "Watchlist Carousel" and "Logout Button". */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.6 }}
        >
          <WatchlistCarousel user={user} /> {/* Pass the profile user object to the carousel. */}
          {/* LogoutButton is displayed on the profile page. */}
          <LogoutButton />
        </motion.div>
      </div>
      {/* Bottom navigation bar. */}
      <BottomNavbar />
    </>
  );
}

// Export the ProfilePage component as the default export of this module.
export default ProfilePage;