/**
 * @file ProfilePage.js
 * @description A React component that renders the authenticated user's own profile page.
 * It fetches the user's data and displays sections like a profile card and watchlist.
 * (Note: RecentlyWatched and RecentReviews sections are currently commented out in the JSX).
 */

// Import React hooks (useEffect, useState) for managing state and side effects.
import { useEffect, useState } from "react";
// Import `motion` from framer-motion for animations.
import { motion } from "framer-motion";
// Import various profile-related components.
import ProfileCard from "./ProfileCard.jsx";           // Displays the main profile information.
import RecentlyWatched from "./RecentlyWatched.jsx";   // Displays recently watched shows (currently commented out).
import RecentReviews from "./RecentReviews.jsx";       // Displays recent reviews by the user (currently commented out).
import WatchlistCarousel from "./WatchlistCarousel.jsx"; // Displays the user's watchlist.
import BottomNavbar from "../components/BottomNavbar.jsx"; // Navigation bar at the bottom.
// Note: `useAuth` from context and `useParams`, `useNavigate` from react-router-dom are not used in this version,
// as it's simplified to always fetch the logged-in user's data directly.

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
 * @function ProfilePage
 * @description A React functional component that displays the authenticated user's profile page.
 * It fetches user data from `/api/getUserInfo` and renders profile sections.
 *
 * @returns {JSX.Element} The rendered ProfilePage component or a loading message.
 */
function ProfilePage() {
  /**
   * State to store the data of the authenticated user.
   * @type {[object|null, function(object|null): void]}
   */
  const [user, setUser] = useState(null);

  /**
   * `useEffect` hook to fetch the authenticated user's data when the component mounts.
   * It also scrolls the window to the top.
   */
  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to top on component mount.
    // Fetch user data from the `/api/getUserInfo` endpoint.
    // `credentials: "include"` ensures cookies (for session authentication) are sent.
    fetch("/api/getUserInfo", { credentials: "include" })
      .then(res => res.json()) // Parse the response as JSON.
      .then(data => {
        console.log("Logged-in user data:", data); // Log fetched data for debugging.
        // Set the user state with the fetched data. The structure of `data` might vary;
        // this assumes it directly contains user info or nests it under a key handled by ProfileCard.
        setUser(data);
      })
      .catch(err => {
        console.error("Error loading user data:", err);
        // Set a user object with a username "error" to indicate failure.
        // This allows the component to render an error state if `user.username === "error"`.
        // A more robust error handling might involve a separate error state.
        setUser({ username: "error" });
      });
  }, []); // Empty dependency array: run only on mount.

  // If user data is not yet loaded (i.e., `user` state is still null), display a loading message.
  if (!user) return <div className="p-6 text-white">Loading profile...</div>; // Or a LoadingSpinner component

  // Determine the profile picture URL, using a default if not available in user data.
  const profilePic = user.profilePic || "/img/profilePhotos/generic_profile_picture.jpg";

  // Render the Profile Page content.
  return (
    <>
      {/* Main container for the profile page content with styling. */}
      {/* The background color is missing here, should be added (e.g., bg-[#1e1e1e]) for consistency if this page is standalone. */}
      <div className="p-6 mx-auto font-coolvetica text-white space-y-6">
        {/* ProfileCard component displaying the user's main profile information.
            `isOwnProfile` is set to true, as this page is intended for the authenticated user's own profile. */}
        <ProfileCard user={user} profilePic={profilePic} isOwnProfile={true} />

        {/* RecentlyWatched section (currently commented out in the original code).
            If uncommented, it would display recently watched shows.
            It would require `user._id` if it fetches data based on userId. */}
        {/* 
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.2 }}
        >
          <RecentlyWatched /> 
        </motion.div>
        */}

        {/* RecentReviews section (currently commented out).
            If uncommented, it would display recent reviews by the user.
            It would require props like `userId`, `username`, and `isOwnProfile`. */}
        {/*
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.4 }}
        >
          <RecentReviews />
        </motion.div>
        */}

        {/* WatchlistCarousel section, animated. */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.6 }} // Animation delay.
        >
          {/* Pass the authenticated user object to WatchlistCarousel. */}
          <WatchlistCarousel user={user} />
      
          {/* The LogoutButton was previously inside this motion.div in another file,
              but it's not included here. If needed, it would be placed here or elsewhere appropriate. */}
        </motion.div>
      </div>
      {/* Bottom navigation bar. */}
      <BottomNavbar />
    </>
  );
}

// Export the ProfilePage component as the default export of this module.
export default ProfilePage;