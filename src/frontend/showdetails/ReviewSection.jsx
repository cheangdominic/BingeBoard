/**
 * @file ReviewSection.js
 * @description A React component that displays a section for TV show reviews.
 * It fetches reviews, allows users to sort and filter them (e.g., by spoilers),
 * submit new reviews (if logged in), and vote on existing reviews.
 */

// Import React hooks and utilities.
import React, { useState, useEffect, useCallback } from 'react';
// Import axios for making HTTP requests.
import axios from 'axios';
// Import icons from lucide-react for UI elements.
import { Star, Filter, Flame, Clock } from "lucide-react"; // Star is imported but not directly used in this file's JSX, assumed to be used within ReviewCard or AppleRatingDisplay.
// Import ReviewForm component for submitting new reviews.
import ReviewForm from "./ReviewSection/ReviewForm"; // Assuming ReviewForm is in a subdirectory.
// Import ReviewCard component for displaying individual reviews.
import ReviewCard from "./ReviewSection/ReviewCard"; // Assuming ReviewCard is in a subdirectory.

/**
 * @function ReviewSection
 * @description A React functional component that manages and displays reviews for a specific TV show.
 *
 * @param {object} props - The properties passed to the component.
 * @param {string|number} props.showId - The ID of the TV show for which reviews are displayed.
 * @param {string} props.showTitle - The title of the TV show (used in forms and messages).
 * @param {string|null} props.currentUserId - The ID of the currently logged-in user, or null if not logged in.
 * @returns {JSX.Element} The rendered ReviewSection component.
 */
export default function ReviewSection({ showId, showTitle, currentUserId }) {
  /**
   * State variable to store the array of fetched review objects.
   * @type {[Array<object>, function(Array<object>): void]}
   */
  const [reviews, setReviews] = useState([]);
  /**
   * State variable to track loading status for fetching reviews.
   * @type {[boolean, function(boolean): void]}
   */
  const [loading, setLoading] = useState(true);
  /**
   * State variable to store any error messages encountered during API interactions.
   * @type {[string|null, function(string|null): void]}
   */
  const [error, setError] = useState(null);
  /**
   * State variable to control the visibility of the new review submission form.
   * @type {[boolean, function(boolean): void]}
   */
  const [showForm, setShowForm] = useState(false);
  /**
   * State variable to store the current sorting method for reviews (e.g., "relevant", "popular", "latest").
   * @type {[string, function(string): void]}
   */
  const [sortMethod, setSortMethod] = useState("relevant");
  /**
   * State variable to control whether reviews containing spoilers are shown.
   * @type {[boolean, function(boolean): void]}
   */
  const [showSpoilers, setShowSpoilers] = useState(false);
  /**
   * State variable to track if a vote (like/dislike) operation is currently in progress
   * to prevent multiple rapid submissions.
   * @type {[boolean, function(boolean): void]}
   */
  const [voteInProgress, setVoteInProgress] = useState(false);

  /**
   * Fetches reviews from the API based on `showId` and `sortMethod`.
   * Wrapped in `useCallback` for memoization, as it's a dependency of `useEffect`.
   * @async
   */
  const fetchReviews = useCallback(async () => {
  try {
    setLoading(true); // Set loading state.
    setError(null);   // Clear previous errors.

    // Make GET request to fetch reviews with showId and sort method as parameters.
    const response = await axios.get(`/api/reviews`, { 
      params: {
        showId: showId,
        sort: sortMethod
      }
    });

    // Extract reviews data from the response. `response.data.reviews` is assumed based on usage.
    const reviewsData = response.data.reviews; 

    // Validate that reviewsData is an array.
    if (!Array.isArray(reviewsData)) { 
      throw new Error("Invalid response format: reviews data is not an array");
    }

    // Process and set reviews, ensuring essential fields and normalizing some data.
    setReviews(reviewsData.map(review => ({
      ...review, // Spread original review properties.
      _id: review._id || review.id, // Use _id or id as a consistent identifier.
      id: review.id || review._id,   // Duplicate for convenience if components expect 'id'.
      createdAt: review.createdAt || new Date().toISOString(), // Fallback for the creation createdAt.
      likes: Array.isArray(review.likes) ? review.likes : [], // Ensure likes is an array.
      dislikes: Array.isArray(review.dislikes) ? review.dislikes : [], // Ensure dislikes is an array.
      rating: Math.min(5, Math.max(1, review.rating || 3)) // Clamp rating between 1 and 5, default to 3 if missing.
    })));
  } catch (err) {
    // Log error and set error message for UI.
    console.error("Failed to fetch reviews:", err);
    setError(err.response?.data?.message || err.message); // Set error message from API or generic.
  } finally {
    setLoading(false); // Reset loading state.
  }
}, [showId, sortMethod]); // Dependencies: re-fetch if showId or sortMethod changes.

  /**
   * `useEffect` hook to fetch reviews when `fetchReviews` function or `showId` changes.
   * `fetchReviews` is memoized by `useCallback`, so it changes only when its dependencies change (showId, sortMethod).
   * This effectively means reviews are fetched on mount, and when showId or sortMethod changes.
   */
  useEffect(() => {
    if (showId) { // Fetch reviews only if a showId is provided.
      fetchReviews();
    }
  }, [fetchReviews, showId]); // Dependencies.

  /**
   * Handles the submission of a new review.
   * Sends a POST request to the API and updates the local reviews state on success.
   * @async
   * @param {object} reviewData - The review data from the ReviewForm ({ rating, content, containsSpoiler }).
   * @throws {string} Throws an error message string if submission fails, to be handled by ReviewForm.
   */
  const createReview = async (reviewData) => {
    try {
      // Make POST request to create a new review.
      const { data } = await axios.post('/api/reviews', {
        ...reviewData,
        showId // Include the showId with the review data.
      });

      // Add the newly created review to the beginning of the local reviews array for immediate UI update.
      setReviews(prev => [data, ...prev]);
      setShowForm(false); // Hide the review form after successful submission.
    } catch (err) {
      // If submission fails, re-throw a user-friendly error message for ReviewForm to catch and display.
      throw err.response?.data?.error || 'Failed to submit review.';
    }
  };

  /**
   * Handles voting (like/dislike) on a review.
   * Implements an optimistic update for the UI, then makes an API call.
   * Refreshes all reviews after a delay to ensure consistency with server state.
   * @async
   * @param {string} reviewId - The ID of the review to vote on.
   * @param {'like' | 'dislike'} action - The vote action ('like' or 'dislike').
   */
  const voteReview = async (reviewId, action) => {
    try {
      // Prevent multiple simultaneous vote requests.
      if (voteInProgress) return;
      setVoteInProgress(true);
      
      // User must be logged in to vote.
      if (!currentUserId) {
        setError("Please log in to vote on reviews");
        setVoteInProgress(false); // Reset flag.
        return;
      }

      // Optimistic UI Update: Update the local state immediately for better UX.
      setReviews(prev => prev.map(review => {
        // Find the review being voted on.
        if (review._id === reviewId || review.id === reviewId) {
          const updatedReview = { ...review }; // Clone the review object.
          
          // Ensure likes and dislikes arrays exist and are copies to avoid mutating original state directly.
          updatedReview.likes = Array.isArray(updatedReview.likes) ? [...updatedReview.likes] : [];
          updatedReview.dislikes = Array.isArray(updatedReview.dislikes) ? [...updatedReview.dislikes] : [];
          
          // Convert currentUserId to string for consistent comparison.
          const userIdStr = currentUserId.toString();
          // Check if user has already liked or disliked this review.
          const hasLiked = updatedReview.likes.some(id => id && id.toString() === userIdStr);
          const hasDisliked = updatedReview.dislikes.some(id => id && id.toString() === userIdStr);
          
          // Apply vote logic.
          if (action === 'like') {
            if (hasLiked) { // If already liked, remove the like (toggle off).
              updatedReview.likes = updatedReview.likes.filter(id => id && id.toString() !== userIdStr);
            } else { // If not liked, add the like and remove any dislike.
              updatedReview.likes.push(currentUserId); // Add user's ID (original format, could be ObjectId or string).
              updatedReview.dislikes = updatedReview.dislikes.filter(id => id && id.toString() !== userIdStr);
            }
          } else if (action === 'dislike') {
            if (hasDisliked) { // If already disliked, remove the dislike.
              updatedReview.dislikes = updatedReview.dislikes.filter(id => id && id.toString() !== userIdStr);
            } else { // If not disliked, add the dislike and remove any like.
              updatedReview.dislikes.push(currentUserId);
              updatedReview.likes = updatedReview.likes.filter(id => id && id.toString() !== userIdStr);
            }
          }
          
          return updatedReview; // Return the optimistically updated review object.
        }
        return review; // Return other reviews unchanged.
      }));

      // API Call: Persist the vote on the server.
      // The backend response is not directly used to update UI here due to the optimistic update strategy,
      // but a subsequent `fetchReviews` call ensures eventual consistency.
      const response = await axios.put(`/api/reviews/${reviewId}`, { action });
      
      // Refresh all reviews after a short delay.
      // This ensures the UI reflects the authoritative server state, especially for like/dislike counts
      // and in case other users voted concurrently.
      setTimeout(() => {
        fetchReviews();
      }, 1000); // 1-second delay.
      
    } catch (err) {
      // If the API call fails, log the error, set an error message, and revert UI by re-fetching.
      console.error("Voting failed:", err);
      setError(err.response?.data?.message || "Voting failed");
      fetchReviews(); // Re-fetch to revert to server state.
    } finally {
      setVoteInProgress(false); // Reset the vote in progress flag.
    }
  };

  // Main render method for the ReviewSection component.
  return (
    <div>
      {/* Section title. */}
      <h2 className="text-2xl font-bold mb-6">Reviews</h2>

      {/* Filter Controls: Sort method buttons and spoiler toggle switch. */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        {/* Sort method buttons. */}
        <div className="flex flex-wrap gap-2">
          {["relevant", "popular", "latest"].map(option => (
            <button
              key={option}
              onClick={() => setSortMethod(option)} // Set sort method on click.
              // Dynamic classes for styling active vs. inactive sort buttons.
              className={`flex items-center px-4 py-2 rounded-lg text-sm md:text-base font-medium transition-colors ${sortMethod === option
                ? "bg-blue-600 text-white" // Active style.
                : "bg-[#3a3a3a] text-gray-300 hover:bg-[#4a4a4a]" // Inactive style.
                }`}
            >
              {/* Icons for different sort options. */}
              {option === "relevant" && <Filter className="w-5 h-5 mr-2" />}
              {option === "popular" && <Flame className="w-5 h-5 mr-2" />}
              {option === "latest" && <Clock className="w-5 h-5 mr-2" />}
              {/* Capitalize first letter of the option for display. */}
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>

        {/* Spoiler Toggle Switch. */}
        <label className="flex items-center space-x-3 cursor-pointer">
          <div className="relative">
            {/* Hidden actual checkbox input. */}
            <input
              type="checkbox"
              checked={showSpoilers} // Controlled component.
              onChange={() => setShowSpoilers(!showSpoilers)} // Toggle spoiler state.
              className="sr-only peer" // Style using `peer` variants on the visible div.
            />
            {/* Custom styled toggle switch UI. */}
            <div className="w-11 h-6 bg-[#3a3a3a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </div>
          <span className="text-gray-300 text-sm md:text-base">Show spoilers</span>
        </label>
      </div>

      {/* Error Message Display Area. */}
      {error && (
        <div className="text-center py-4 px-6 bg-red-900/20 border border-red-800 rounded-lg mb-6">
          <p className="text-red-400">{error}</p>
          <button 
            onClick={() => setError(null)} // Button to dismiss the error message.
            className="text-sm text-red-400 hover:text-red-300 mt-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* "Write a Review" Button or Sign In Prompt. */}
      {currentUserId && !showForm ? ( // If user is logged in and review form is not currently shown.
        <button
          onClick={() => setShowForm(true)} // Show the review form on click.
          className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
        >
          Write a Review
        </button>
      ) : !currentUserId && ( // If user is not logged in.
        <div className="mb-6 bg-[#3a3a3a] rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-white mb-2">Want to share your thoughts?</h3>
          <p className="text-gray-300 mb-4">Sign in to review {showTitle}</p>
          <a // Simple link to login page (could be a <Link> from react-router-dom).
            href="/login"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer"
          >
            Sign In
          </a>
        </div>
      )}

      {/* Review Form (conditionally rendered if `showForm` is true). */}
      {showForm && (
        <ReviewForm
          onSubmit={createReview} // Pass the `createReview` handler.
          showTitle={showTitle}   // Pass the show title for context within the form.
          onCancel={() => setShowForm(false)} // Handler to hide the form on cancel.
        />
      )}

      {/* Reviews Display Section. */}
      {loading ? (
        // Loading state: display a loading message.
        <div className="text-center py-8 text-gray-400">
          Loading reviews...
        </div>
      ) : reviews.length === 0 ? (
        // No reviews found state (after loading and no error).
        <div className="text-center py-8 text-gray-400">
          No reviews yet. Be the first to review!
        </div>
      ) : (
        // If reviews are available, display them.
        <div className="space-y-6 mt-6">
          {reviews
            // Filter reviews based on `showSpoilers` state:
            // If `showSpoilers` is true, all reviews pass.
            // If `showSpoilers` is false, only reviews where `containsSpoiler` is false pass.
            .filter(review => !review.containsSpoiler || showSpoilers)
            // Map over filtered reviews to render ReviewCard components.
            .map(review => (
              <ReviewCard
                // Use review._id or review.id as key. Fallback to a random string if both are missing (highly unlikely for DB data).
                key={review._id || review.id || `review-${Math.random().toString(36).substring(7)}`}
                review={review} // Pass the full review object to ReviewCard.
                onVote={voteReview} // Pass the vote handler function.
                currentUserId={currentUserId} // Pass the current user's ID for voting logic in ReviewCard.
              />
            ))}
        </div>
      )}
    </div>
  );
}