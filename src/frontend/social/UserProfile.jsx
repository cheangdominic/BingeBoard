/**
 * @file UserProfile.js
 * @description A React component that displays a user's profile page.
 * It fetches user data and their activities based on the username from URL parameters.
 * It conditionally renders sections like profile card, recently watched, recent reviews, watchlist,
 * and a logout button if it's the authenticated user's own profile.
 */

// Import React hooks (useParams, useEffect, useState) for URL parameters, side effects, and state management.
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
// Import `motion` from framer-motion for animations.
import { motion } from "framer-motion";
// Import `useAuth` custom hook to access authentication context (current user and auth loading status).
import { useAuth } from "../../context/AuthContext"; 
// Import various profile-related components.
import ProfileCard from "../profile/ProfileCard.jsx";        // Displays the main profile information.
import RecentlyWatched from "../profile/RecentlyWatched.jsx"; // Displays recently watched shows.
import RecentReviews from "../profile/RecentReviews.jsx";     // Displays recent reviews by the user.
import Watchlist from "../profile/Watchlist.jsx";             // Displays the user's watchlist.
import BottomNavbar from "../../components/BottomNavbar.jsx"; // Navigation bar at the bottom.
import LoadingSpinner from "../../components/LoadingSpinner.jsx"; // Loading indicator.
import LogoutButton from "../profile/LogoutButton.jsx";       // Button for logging out.

/**
 * @constant {object} fadeInUp
 * @description A Framer Motion variant object for a "fade in up" animation.
 * @property {object} hidden - The initial state (opacity 0, translated 20px down).
 * @property {object} visible - The target state (opacity 1, original y-position) with transition settings.
 */
const fadeInUp = {
  hidden: { opacity: 0, y: 20 }, // Initial state: invisible and slightly shifted down.
  visible: {
    opacity: 1, // Target state: fully visible.
    y: 0,       // Target state: original y-position.
    transition: { duration: 0.6, ease: "easeOut" }, // Animation transition settings.
  },
};

/**
 * @function UserProfile
 * @description A React functional component that serves as the main container for a user's public profile page.
 * It fetches and displays user-specific information and activities.
 *
 * @returns {JSX.Element | null} The rendered UserProfile page component, a loading spinner, an error message, or null if redirecting.
 */
function UserProfile() {
  /**
   * `username`: The username extracted from the URL parameters, indicating whose profile to display.
   * @type {{username: string}}
   */
  const { username } = useParams();
  /**
   * State to store the data of the user whose profile is being viewed.
   * @type {[object|null, function(object|null): void]}
   */
  const [user, setUser] = useState(null);
  /**
   * State to store the activities of the user whose profile is being viewed.
   * @type {[Array<object>, function(Array<object>): void]}
   */
  const [userActivities, setUserActivities] = useState([]);
  /**
   * State to track loading status for fetching profile data.
   * @type {[boolean, function(boolean): void]}
   */
  const [loading, setLoading] = useState(true);
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
   * Boolean indicating if the currently viewed profile belongs to the authenticated user.
   * True if `authUser` exists, `user` (profile data) exists, and their usernames match.
   * @const {boolean}
   */
  const isOwnProfile = authUser && user && authUser.username === user.username;

  /**
   * `useEffect` hook to scroll the window to the top when the `username` parameter changes.
   * Ensures that navigating to a different user's profile starts at the top of the page.
   */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [username]); // Dependency: re-run if `username` URL parameter changes.

  /**
   * `useEffect` hook to fetch the user's profile data and activities.
   * Runs when `username`, `authLoading`, or `navigate` changes.
   * It only proceeds if authentication loading is complete and a `username` is available.
   */
  useEffect(() => {
    /**
     * Asynchronous function to fetch user profile data from the API.
     * @async
     */
    const fetchUserProfile = async () => {
      setLoading(true); // Set loading state for profile data.
      try {
        // Make GET request to `/api/users/:username` to fetch profile data.
        const response = await fetch(`/api/users/${username}`);
        if (!response.ok) { // Handle HTTP errors.
          if (response.status === 404) { // If user not found (404).
            navigate('/404'); // Redirect to a 404 page.
            return; // Stop further execution.
          } else {
            // For other errors, throw an error to be caught by the catch block.
            throw new Error(`Failed to fetch user profile: ${response.statusText}`);
          }
        }
        const data = await response.json(); // Parse JSON response.
        // Update state with fetched user data and activities.
        setUser(data.user);
        setUserActivities(data.activities);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setUser(null); // Set user to null on error to indicate failure.
        // Optionally, set an error message state here to display to the user.
      } finally {
        setLoading(false); // Reset loading state.
      }
    };

    // Fetch profile data if auth loading is complete and a username is present in the URL.
    if (!authLoading && username) {
      fetchUserProfile();
    } else if (!authLoading && !username) {
      // If no username in URL (e.g., route is `/profile` for own profile, but this component expects a username param)
      // and auth is loaded, set loading to false. This case might need specific handling
      // if this component is also intended for `/me` or similar routes without a username param.
      // Currently, it implies an issue if reached without a `username` and auth is loaded.
      setLoading(false);
    }
  }, [username, authLoading, navigate]); // Dependencies.

  // If authentication or profile data is still loading, display a full-page loading spinner.
  if (loading || authLoading) {
    return <LoadingSpinner />;
  }

  // If, after loading, no user data was fetched (e.g., due to an error or invalid username).
  if (!user) {
    return (
      // Display a generic "Could not load profile" message.
      <div className="min-h-screen bg-[#1e1e1e] text-white p-4 pb-20 flex flex-col items-center justify-center">
        <p>Could not load user profile.</p>
        {/* Ensure BottomNavbar is still accessible. */}
        <BottomNavbar />
      </div>
    );
  }

  // Render the UserProfile page content.
  return (
    <>
      {/* Main container for the profile page content with styling. */}
      <div className="min-h-screen bg-[#1e1e1e] text-white p-4 pb-20">
        <> {/* Fragment to group multiple top-level motion.divs if needed, or just for structure. */}
          {/* ProfileCard section, animated. */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp} // Apply "fade in up" animation.
          >
            {/* Pass fetched user data, profile picture URL, and isOwnProfile flag to ProfileCard. */}
            <ProfileCard user={user} profilePic={user.profilePic || "/img/profilePhotos/generic_profile_picture.jpg"} isOwnProfile={isOwnProfile} />
          </motion.div>

          {/* RecentlyWatched section, animated. */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.2 }} // Staggered animation delay.
          >
            <RecentlyWatched
              userId={user._id}         // Pass user ID for fetching recently watched.
              username={user.username}  // Pass username for display purposes.
              activities={userActivities} // Pass fetched user activities.
            />
          </motion.div>

          {/* RecentReviews section, animated. */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.4 }}
          >
            <RecentReviews
              userId={user._id}
              username={user.username}
              isOwnProfile={isOwnProfile} // Pass isOwnProfile flag.
            />
          </motion.div>

          {/* Watchlist section, animated. */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.6 }}
            className="mb-6" // Add bottom margin.
          >
            <Watchlist
              userId={user._id} // Not strictly needed by Watchlist if it uses userProfileData.watchlist
              username={user.username}
              isOwnProfile={isOwnProfile}
              userProfileData={user} // Pass the full profile data which should include the watchlist.
            />
          </motion.div>
          
          {/* LogoutButton, displayed only if it's the user's own profile. */}
          {isOwnProfile && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.8 }}
            >
              <LogoutButton />
            </motion.div>
          )}
        </>
      </div>
      {/* Bottom navigation bar. */}
      <BottomNavbar />
    </>
  );
}

// Export the UserProfile component as the default.
export default UserProfile;