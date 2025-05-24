/**
 * @file PopularReviewsFiltered.jsx
 * @description A React component that displays a horizontally scrolling carousel of popular TV show reviews.
 * Users can filter reviews to show/hide spoilers and to see reviews only from friends.
 */

// Import React hooks and utilities.
import React, { useState, useEffect, useCallback } from "react";
// Import axios for making HTTP requests.
import axios from "axios";
// Import ReviewCard component for displaying individual reviews.
import ReviewCard from "../../components/ReviewCard";
// Import useAuth custom hook to access authentication context (user data).
import { useAuth } from "../../context/AuthContext";
// Import motion from framer-motion for animations.
import { motion } from "framer-motion";

/**
 * @function PopularReviewsFiltered
 * @description A React functional component that fetches and displays popular reviews.
 * It allows filtering by friends and spoiler content.
 *
 * @returns {JSX.Element} The rendered PopularReviewsFiltered component.
 */
function PopularReviewsFiltered() {
  // Access the current user from the authentication context.
  const { user } = useAuth();
  // State to store the array of fetched reviews.
  const [reviews, setReviews] = useState([]);
  // State to track loading status.
  const [loading, setLoading] = useState(true);
  // State to store any error messages during data fetching.
  const [error, setError] = useState(null);
  // State to control whether reviews containing spoilers are shown.
  const [showSpoilers, setShowSpoilers] = useState(false);
  // State to control whether to filter reviews by the user's friends.
  const [filterByFriends, setFilterByFriends] = useState(false);
  // State to store the list of the current user's friends' IDs.
  const [friendsList, setFriendsList] = useState([]);
  // Default profile picture URL for users without one.
  const defaultProfilePic = "/img/profilePhotos/generic_profile_picture.jpg";

  /**
   * Fetches the most liked reviews from the API.
   * Wrapped in `useCallback` for memoization.
   * @async
   */
  const fetchMostLikedReviews = useCallback(async () => {
    try {
      setLoading(true);
      // Make GET request to fetch most liked reviews.
      const response = await axios.get('/api/reviews/most-liked');
      setReviews(response.data.reviews); // Update reviews state.
    } catch (err) {
      setError("Failed to fetch reviews"); // Set error message.
      console.error(err);
    } finally {
      setLoading(false); // Set loading to false.
    }
  }, []); // Empty dependency array: function is created once.

  /**
   * Fetches the current user's friends list from the API.
   * Wrapped in `useCallback` for memoization.
   * @async
   */
  const fetchFriendsList = useCallback(async () => {
    // Proceed only if there is an authenticated user with an ID.
    if (user && user._id) {
      try {
        // Make GET request to fetch user details (which should include friends).
        const response = await axios.get(`/api/user`); // Assumes /api/user returns the authenticated user's details including friends list
        if (response.data && response.data.friends) {
          setFriendsList(response.data.friends); // Set friends list from API response.
        } else if (user.friends) { // Fallback to user object from AuthContext if API response is missing friends
            setFriendsList(user.friends);
        }
      } catch (err) {
        console.error("Failed to fetch friends list:", err);
      }
    }
  }, [user]); // Dependency: re-create if user object changes.

  // `useEffect` hook to fetch initial reviews and friends list if needed.
  // Runs on mount and when filterByFriends or user changes.
  useEffect(() => {
    fetchMostLikedReviews(); // Fetch reviews on mount.
    if (filterByFriends && user) { // If filtering by friends is enabled and user is logged in.
      fetchFriendsList(); // Fetch the friends list.
    }
  }, [filterByFriends, user, fetchMostLikedReviews, fetchFriendsList]); // Dependencies.


  /**
   * Toggles the `showSpoilers` state.
   */
  const toggleSpoilers = () => {
    setShowSpoilers(!showSpoilers);
  };

  /**
   * Toggles the `filterByFriends` state.
   */
  const toggleFriendsFilter = () => {
    setFilterByFriends(!filterByFriends);
  };

  // Filter the reviews based on `showSpoilers` and `filterByFriends` states.
  const filteredReviews = reviews.filter(review => {
    // Spoiler condition: show review if `showSpoilers` is true OR review does not contain spoilers.
    const spoilerCondition = showSpoilers || !review.containsSpoiler;
    // If filtering by friends and user is logged in:
    if (filterByFriends && user) {
      // Check if the review's author is in the user's friends list.
      // Handles cases where review.userId might be an ObjectId object or a string.
      const isFriendReview = friendsList.includes(review.userId?.toString()) || friendsList.includes(review.userId);
      return spoilerCondition && isFriendReview; // Apply both conditions.
    }
    return spoilerCondition; // Otherwise, only apply spoiler condition.
  });

  /**
   * Handles voting (like/dislike) on a review.
   * Sends a PUT request to the API and updates the local reviews state.
   * @async
   * @param {string} reviewId - The ID of the review to vote on.
   * @param {'like' | 'dislike'} action - The vote action.
   */
  const handleVote = async (reviewId, action) => {
    try {
      // Make PUT request to vote on the review.
      const response = await axios.put(`/api/reviews/${reviewId}`, { action });
      // Update the local reviews state with the updated review data from the response.
      setReviews(prev => prev.map(review =>
        review._id === reviewId ? { ...review, ...response.data } : review
      ));
    } catch (err) {
      console.error("Vote failed:", err);
    }
  };

  /**
   * Formats a review object received from the API into the props structure expected by `ReviewCard`.
   * @param {object} review - The raw review object from the API.
   * @returns {object} The formatted review object.
   */
  const formatReviewForCard = (review) => ({
    ...review, // Spread original review properties.
    // Create a user object for ReviewCard.
    user: {
      username: review.username || "@unknown", // Fallback username.
      profilePhoto: review.userProfilePic || defaultProfilePic, // Fallback profile picture.
      _id: review.userId // User ID.
    },
    // Format the creation date.
    date: new Date(review.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }),
    reviewText: review.content, // Review content.
    // Construct image URL or use a placeholder.
    imageUrl: review.posterPath
      ? `https://image.tmdb.org/t/p/w500${review.posterPath}`
      : "https://via.placeholder.com/300x450",
    showName: review.showName, // Show name.
    showId: review.showId,     // Show ID.
    reviewId: review._id,    // Review ID.
  });

  // Main render method for the PopularReviewsFiltered component.
  return (
    <section className="ml-3 mt-6 mb-8"> {/* Section container with margins. */}
      {/* Header with title and filter buttons. */}
      <div className="flex justify-between items-center mb-6 px-2">
        <h3 className="text-xl text-white font-bold">Popular Reviews</h3>
        {/* Filter buttons container. */}
        <div className="flex items-center space-x-3">
          {/* Button to toggle filtering by friends. */}
          <button
            onClick={toggleFriendsFilter}
            // Dynamic classes for styling based on `filterByFriends` state.
            className={`group relative overflow-hidden px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg ${filterByFriends
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-blue-500/25' // Active style
                : 'bg-gradient-to-r from-gray-700 to-gray-800 text-gray-200 hover:from-gray-600 hover:to-gray-700 shadow-gray-900/25' // Inactive style
              }`}
          >
            <div className="flex items-center space-x-2">
              <span className="text-base">👥</span> {/* Friends icon */}
              <span>Friends</span>
            </div>
            {/* Pulsing background effect when filter is active. */}
            {filterByFriends && (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-blue-600/20 animate-pulse" />
            )}
          </button>
          {/* Button to toggle showing/hiding spoilers. */}
          <button
            onClick={toggleSpoilers}
            // Dynamic classes for styling based on `showSpoilers` state.
            className={`group relative overflow-hidden px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg ${showSpoilers
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-amber-500/25' // Active style
                : 'bg-gradient-to-r from-gray-700 to-gray-800 text-gray-200 hover:from-gray-600 hover:to-gray-700 shadow-gray-900/25' // Inactive style
              }`}
          >
            <div className="flex items-center space-x-2">
              <span className="text-base">⚠️</span> {/* Spoiler icon */}
              <span>{showSpoilers ? 'Hide Spoilers' : 'Show Spoilers'}</span>
            </div>
            {/* Pulsing background effect when filter is active. */}
            {showSpoilers && (
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-orange-400/20 animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* Conditional rendering based on loading, error, or data availability. */}
      {loading ? (
        // Loading state: display a simple spinner and text.
        <div className="flex justify-center py-12">
          <div className="flex flex-col items-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <div className="text-white font-medium">Loading reviews...</div>
          </div>
        </div>
      ) : error ? (
        // Error state: display the error message.
        <div className="text-red-400 py-8 text-center bg-red-900/10 rounded-lg mx-2">
          <div className="text-lg font-semibold mb-2">⚠️ Error</div>
          <div>{error}</div>
        </div>
      ) : filteredReviews.length === 0 ? (
        // No reviews found state: display an appropriate message.
        <div className="text-gray-400 py-12 text-center bg-gray-800/20 rounded-lg mx-2">
          <div className="text-6xl mb-4">📝</div> {/* Icon representing no reviews */}
          <div className="text-lg font-medium mb-2">No Reviews Found</div>
          <div className="text-sm">
            {/* Dynamically adjust message based on active filters. */}
            {filterByFriends && 'No reviews from friends found. '}
            {showSpoilers ? (filterByFriends ? '' : 'No reviews available at the moment.') : (filterByFriends ? '' : 'No spoiler-free reviews available.')}
          </div>
        </div>
      ) : (
        // Data available state: display the carousel of review cards.
        <div className="relative"> {/* Relative container for potential absolute positioned elements like fade-out gradient. */}
          {/* Horizontally scrollable container for reviews. */}
          <div
            className="flex overflow-x-auto overflow-y-hidden no-scrollbar px-2 pb-4" // Hides scrollbar, enables x-scroll.
            style={{ scrollBehavior: 'smooth' }} // Smooth scrolling for programmatic scrolls (if any).
          >
            <div className="flex space-x-4"> {/* Inner flex container for spacing between cards. */}
              {/* Map over filtered reviews to render ReviewCard components. */}
              {filteredReviews.map((review, index) => (
                <motion.div
                  key={review._id} // Unique key for each review.
                  // Framer Motion animation properties for staggered appearance.
                  initial={{ opacity: 0, x: 50 }} // Start off-screen and transparent.
                  animate={{ opacity: 1, x: 0 }}   // Animate to on-screen and opaque.
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1, // Staggered delay.
                    ease: "easeOut"
                  }}
                  className="flex-shrink-0" // Prevents cards from shrinking.
                >
                  <ReviewCard
                    {...formatReviewForCard(review)} // Spread formatted review props.
                    currentUserId={user?._id} // Pass current user's ID for voting logic.
                    onVote={handleVote} // Pass vote handler function.
                  />
                </motion.div>
              ))}
            </div>
          </div>
          {/* Optional: A gradient overlay on the right edge to indicate more content. */}
          <div className="absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-gray-900 to-transparent pointer-events-none" />
        </div>
      )}
    </section>
  );
}

// Export the PopularReviewsFiltered component as the default.
export default PopularReviewsFiltered;