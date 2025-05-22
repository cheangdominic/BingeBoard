import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import ReviewCard from "../../components/ReviewCard";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import defaultProfilePic from "../../../public/img/profilePhotos/generic_profile_picture.jpg";

function RecentReviewsFiltered() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSpoilers, setShowSpoilers] = useState(false);
  const [filterByFriends, setFilterByFriends] = useState(false);

  useEffect(() => {
    fetchMostLikedReviews();
  }, []);

  const fetchMostLikedReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/reviews/most-liked');
      setReviews(response.data);
    } catch (err) {
      setError("Failed to fetch reviews");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSpoilers = () => {
    setShowSpoilers(!showSpoilers);
  };

  const toggleFriendsFilter = () => {
    setFilterByFriends(!filterByFriends);
    // TODO: Implement actual friends filter logic
  };

  const filteredReviews = showSpoilers 
    ? reviews 
    : reviews.filter(review => !review.containsSpoiler);

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
    imageUrl: review.showImage || "https://via.placeholder.com/300x450",
    reviewId: review._id,
  });

  return (
    <section className="ml-3 mt-6 mb-8">
      <div className="flex justify-between items-center mb-6 px-2">
        <h3 className="text-xl text-white font-bold">Recent Reviews</h3>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleFriendsFilter}
            className={`group relative overflow-hidden px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg ${
              filterByFriends
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-blue-500/25'
                : 'bg-gradient-to-r from-gray-700 to-gray-800 text-gray-200 hover:from-gray-600 hover:to-gray-700 shadow-gray-900/25'
            }`}
          >
            <div className="flex items-center space-x-2">
              <span className="text-base">👥</span>
              <span>Friends</span>
            </div>
            {filterByFriends && (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-blue-600/20 animate-pulse" />
            )}
          </button>
          
          <button
            onClick={toggleSpoilers}
            className={`group relative overflow-hidden px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg ${
              showSpoilers
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-amber-500/25'
                : 'bg-gradient-to-r from-gray-700 to-gray-800 text-gray-200 hover:from-gray-600 hover:to-gray-700 shadow-gray-900/25'
            }`}
          >
            <div className="flex items-center space-x-2">
              <span className="text-base">⚠️</span>
              <span>{showSpoilers ? 'Hide Spoilers' : 'Show Spoilers'}</span>
            </div>
            {showSpoilers && (
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-orange-400/20 animate-pulse" />
            )}
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="flex flex-col items-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <div className="text-white font-medium">Loading reviews...</div>
          </div>
        </div>
      ) : error ? (
        <div className="text-red-400 py-8 text-center bg-red-900/10 rounded-lg mx-2">
          <div className="text-lg font-semibold mb-2">⚠️ Error</div>
          <div>{error}</div>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="text-gray-400 py-12 text-center bg-gray-800/20 rounded-lg mx-2">
          <div className="text-6xl mb-4">📝</div>
          <div className="text-lg font-medium mb-2">No Reviews Found</div>
          <div className="text-sm">
            {showSpoilers ? 'No reviews available at the moment' : 'No spoiler-free reviews available'}
          </div>
        </div>
      ) : (
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
          
          {/* Gradient fade on the right edge */}
          <div className="absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-gray-900 to-transparent pointer-events-none" />
        </div>
      )}
    </section>
  );
}

export default RecentReviewsFiltered;