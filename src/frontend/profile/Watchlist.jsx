/**
 * @file Watchlist.jsx
 * @description A React component that serves as a wrapper or section display for a user's watchlist.
 * It utilizes the `WatchlistCarousel` component to display the actual watchlist items.
 * It handles loading state based on authentication context.
 */

// Import React for creating the component.
import React from "react";
// Import the WatchlistCarousel component, which is responsible for displaying the watchlist items.
import WatchlistCarousel from "./WatchlistCarousel"; 
// Import useAuth custom hook to access authentication context (authenticated user and loading status).
import { useAuth } from "../../context/AuthContext.jsx"; 
// Import LoadingSpinner component to display while authentication status is being determined.
import LoadingSpinner from "../../components/LoadingSpinner.jsx";

/**
 * @function Watchlist
 * @description A React functional component that renders a section for a user's watchlist.
 * It determines whether to display the authenticated user's own watchlist or another user's
 * watchlist based on the provided props.
 *
 * @param {object} props - The properties passed to the component.
 * @param {string} [props.username] - The username of the user whose watchlist is being displayed.
 *                                  Used for the title when `isOwnProfile` is false.
 * @param {boolean} [props.isOwnProfile] - Flag indicating if the watchlist being displayed belongs
 *                                       to the currently authenticated user.
 * @param {object} [props.userProfileData] - The profile data of the user whose watchlist is being displayed,
 *                                         used when `isOwnProfile` is false. This object should contain
 *                                         the watchlist items or necessary info for `WatchlistCarousel`.
 * @returns {JSX.Element} The rendered Watchlist section component or a loading spinner.
 */
function Watchlist({ username, isOwnProfile, userProfileData }) { 
  /**
   * `authUser`: The currently authenticated user object from AuthContext.
   * `authLoading`: Boolean indicating if the authentication status is currently being loaded.
   * @type {{user: object|null, loading: boolean}}
   */
  const { user: authUser, loading: authLoading } = useAuth(); 

  // If the authentication status is still loading, display a small loading spinner.
  // The `small` prop for LoadingSpinner is assumed to be a custom prop of that component.
  if (authLoading) {
    return <LoadingSpinner small={true} />;
  }

  // Render the watchlist section.
  return (
    // Main section container with styling for width, margins, and text color.
    <section className="mx-auto w-[97vw] sm:w-[97.5vw] mt-2 sm:mt-3 text-white">
      {/* WatchlistCarousel component handles the actual display of watchlist items. */}
      <WatchlistCarousel
        // Pass the appropriate user object to WatchlistCarousel:
        // - If `isOwnProfile` is true, pass the `authUser` (authenticated user).
        // - Otherwise, pass `userProfileData` (data of the user whose profile is being viewed).
        user={isOwnProfile ? authUser : userProfileData} 
        // Dynamically set the title for the carousel.
        title='Watchlist'
        // Other props for WatchlistCarousel (like cardActualWidth, userScrollBehavior)
        // would use their default values if not specified here.
      />
    </section>
  );
}

// Export the Watchlist component as the default export of this module.
export default Watchlist;