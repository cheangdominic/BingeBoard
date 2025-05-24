// Import necessary dependencies and components.
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import ReviewCard from "../../components/ReviewCard";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";

/**
 * @file PopularReviews.jsx
 * @description A React component that displays a horizontally scrolling carousel of popular, spoiler-free reviews.
 * Reviews are fetched from the backend and dynamically rendered using ReviewCard components with animations.
 */

/**
 * @function PopularReviews
 * @description A React functional component that fetches and displays the most-liked reviews,
 * filtering out those that contain spoilers. It handles loading, error states, and allows voting on reviews.
 *
 * @returns {JSX.Element} The rendered PopularReviews component.
 */
function PopularReviews() {
  const { user } = useAuth(); // Access the authenticated user context
  const [reviews, setReviews] = useState([]); // State to hold fetched reviews
  const [loading, setLoading] = useState(true); // Loading indicator
  const [error, setError] = useState(null); // Error message holder
  const defaultProfilePic = "/img/profilePhotos/generic_profile_picture.jpg"; // Fallback profile picture

  // Fetch the most-liked reviews from the backend
  const fetchMostLikedReviews = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/reviews/most-liked');
      setReviews(response.data.reviews);
    } catch (err) {
      setError("Failed to fetch reviews");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Run the fetch function on component mount
  useEffect(() => {
    fetchMostLikedReviews();
  }, [fetchMostLikedReviews]);

  // Handles upvoting or downvoting a review
  const handleVote = async (reviewId, action) => {
    try {
      const response = await axios.put(`/api/reviews/${reviewId}`, { action });
      setReviews(prev => prev.map(review =>
        review._id === reviewId ? { ...review, ...response.data } : review
      ));
    } catch (err) {
      console.error("Vote failed:", err);
    }
  };

  // Filter out reviews that contain spoilers
  const filteredReviews = reviews.filter(review => !review.containsSpoiler);

  // Format review object to match props expected by ReviewCard
  const formatReviewForCard = (review) => ({
    ...review,
    user: {
      username: review.username || "@unknown",
      profilePhoto: review.userProfilePic || defaultProfilePic,
      _id: review.userId 
    },
    date: new Date(review.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }),
    reviewText: review.content,
    imageUrl: review.posterPath
      ? `https://image.tmdb.org/t/p/w500${review.posterPath}`
      : "https://via.placeholder.com/300x450",
    showName: review.showName,
    showId: review.showId,
    reviewId: review._id,
  });

  return (
    <section className="ml-3 mt-6 mb-8">
      <div className="mb-6 px-2">
        <h3 className="text-xl text-white font-bold">Popular Reviews</h3>
      </div>

      {loading ? (
        // Loading spinner and message
        <div className="flex justify-center py-12">
          <div className="flex flex-col items-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <div className="text-white font-medium">Loading reviews...</div>
          </div>
        </div>
      ) : error ? (
        // Error state message
        <div className="text-red-400 py-8 text-center bg-red-900/10 rounded-lg mx-2">
          <div className="text-lg font-semibold mb-2">⚠️ Error</div>
          <div>{error}</div>
        </div>
      ) : filteredReviews.length === 0 ? (
        // Empty state if no spoiler-free reviews are available
        <div className="text-gray-400 py-12 text-center bg-gray-800/20 rounded-lg mx-2">
          <div className="text-6xl mb-4">📝</div>
          <div className="text-lg font-medium mb-2">No Reviews Found</div>
          <div className="text-sm">
            No spoiler-free reviews available.
          </div>
        </div>
      ) : (
        // Carousel of review cards
        <div className="relative">
          <div
            className="flex overflow-x-auto overflow-y-hidden no-scrollbar px-2 pb-4"
            style={{ scrollBehavior: 'smooth' }}
          >
            <div className="flex space-x-4">
              {filteredReviews.map((review, index) => (
                <motion.div
                  key={review._id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                    ease: "easeOut"
                  }}
                  className="flex-shrink-0"
                >
                  <ReviewCard
                    {...formatReviewForCard(review)}
                    currentUserId={user?._id}
                    onVote={handleVote}
                  />
                </motion.div>
              ))}
            </div>
          </div>
          {/* Right edge gradient overlay for aesthetic scroll cue */}
          <div className="absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-gray-900 to-transparent pointer-events-none" />
        </div>
      )}
    </section>
  );
}

// Export the PopularReviews component as the default export of this module.
export default PopularReviews;
