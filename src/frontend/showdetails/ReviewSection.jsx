import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Star, Filter, Flame, Clock } from "lucide-react";
import ReviewForm from "./ReviewSection/ReviewForm";
import ReviewCard from "./ReviewSection/ReviewCard";

export default function ReviewSection({ showId, showTitle, currentUserId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [sortMethod, setSortMethod] = useState("relevant");
  const [showSpoilers, setShowSpoilers] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching reviews for showId:", showId); 

      const { data } = await axios.get(`/api/reviews`, {
        params: {
          showId: showId,
          sort: sortMethod
        }
      });

      console.log("Received reviews data:", data); 

      if (!Array.isArray(data)) {
        throw new Error("Invalid response format");
      }

      setReviews(data.map(review => ({
        ...review,
        _id: review._id || review.id, // Ensure we have both formats
        id: review.id || review._id, // Ensure we have both formats
        createdAt: review.createdAt || new Date().toISOString(),
        likes: Array.isArray(review.likes) ? review.likes : [],
        dislikes: Array.isArray(review.dislikes) ? review.dislikes : [],
        rating: Math.min(5, Math.max(1, review.rating || 3))
      })));
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [showId, sortMethod]);

  useEffect(() => {
    if (showId) {
      fetchReviews();
    }
  }, [fetchReviews, showId]);

  const createReview = async (reviewData) => {
    try {
      console.log("Submitting review:", { ...reviewData, showId });

      const { data } = await axios.post('/api/reviews', {
        ...reviewData,
        showId
      });

      console.log("Review submission successful:", data);

      setReviews(prev => [data, ...prev]);
      setShowForm(false);
    } catch (err) {
      console.error("Review submission failed:", err);
      throw err.response?.data?.error || 'Failed to submit review.';
    }
  };

  const voteReview = async (reviewId, action) => {
    try {
      console.log(`Voting ${action} for review ${reviewId}`);

      if (!currentUserId) {
        console.error("Cannot vote: User not logged in");
        setError("Please log in to vote on reviews");
        return;
      }

      const { data } = await axios.put(`/api/reviews/${reviewId}`, { action });

      console.log("Vote successful, updated review:", data);

      setReviews(prev => prev.map(r =>
        (r._id === reviewId || r.id === reviewId) ? {
          ...data,
          _id: data._id || data.id,
          id: data.id || data._id
        } : r
      ));
    } catch (err) {
      console.error("Voting failed:", err);
      setError(err.response?.data?.message || "Voting failed");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Reviews</h2>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div className="flex flex-wrap gap-2">
          {["relevant", "popular", "latest"].map(option => (
            <button
              key={option}
              onClick={() => setSortMethod(option)}
              className={`flex items-center px-4 py-2 rounded-lg text-sm md:text-base font-medium transition-colors ${sortMethod === option
                ? "bg-blue-600 text-white"
                : "bg-[#3a3a3a] text-gray-300 hover:bg-[#4a4a4a]"
                }`}
            >
              {option === "relevant" && <Filter className="w-5 h-5 mr-2" />}
              {option === "popular" && <Flame className="w-5 h-5 mr-2" />}
              {option === "latest" && <Clock className="w-5 h-5 mr-2" />}
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>

        {/* Spoiler Toggle */}
        <label className="flex items-center space-x-3 cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              checked={showSpoilers}
              onChange={() => setShowSpoilers(!showSpoilers)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[#3a3a3a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </div>
          <span className="text-gray-300 text-sm md:text-base">Show spoilers</span>
        </label>
      </div>

      {/* Add Review Button or Sign In Prompt */}
      {currentUserId && !showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Write a Review
        </button>
      ) : !currentUserId && (
        <div className="mb-6 bg-[#3a3a3a] rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-white mb-2">Want to share your thoughts?</h3>
          <p className="text-gray-300 mb-4">Sign in to review {showTitle}</p>
          <a
            href="/login"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Sign In
          </a>
        </div>
      )}

      {/* Review Form */}
      {showForm && (
        <ReviewForm
          onSubmit={createReview}
          showTitle={showTitle}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Reviews Display */}
      {error && (
        <div className="text-center py-4 px-6 bg-red-900/20 border border-red-800 rounded-lg mb-6">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-400">
          Loading reviews...
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          No reviews yet. Be the first to review!
        </div>
      ) : (
        <div className="space-y-6 mt-6">
          {reviews
            .filter(review => !review.containsSpoiler || showSpoilers)
            .map(review => (
              <ReviewCard
                key={review._id || review.id || `review-${Math.random().toString(36).substring(7)}`}
                review={review}
                onVote={voteReview}
                currentUserId={currentUserId}
              />
            ))}
        </div>
      )}
    </div>
  );
}