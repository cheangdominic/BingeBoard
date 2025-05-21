import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";
import BottomNavbar from '../../components/BottomNavbar.jsx';
import { Apple, ThumbsUp, ThumbsDown, AlertTriangle } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import axios from 'axios';

function ActivityPage() {
    const [count, setCount] = useState(0);
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        }
    }, [user, authLoading, navigate]);
  const [userReviews, setUserReviews] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchCurrentUser();
    fetchUserReviews();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get('/api/user', { withCredentials: true });
      if (response.data && response.data._id) {
        setCurrentUserId(response.data._id);
      }
    } catch (err) {
      console.log('User not logged in or session expired');
    }
  };

  const fetchUserReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/user/reviews', { withCredentials: true });
      
      if (response.data) {
        const sortedReviews = response.data.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );

        console.log('User Reviews received:', sortedReviews);

        const missingNames = sortedReviews.filter(review => 
          !review.showName || review.showName === 'Unknown Show' || review.showName === 'Unknown TV Show'
        );
        
        if (missingNames.length > 0) {
          console.warn(`${missingNames.length} reviews have missing show names:`, 
            missingNames.map(r => ({id: r._id, showId: r.showId})));
        }
        
        setUserReviews(sortedReviews);
      }
    } catch (err) {
      console.error('Error fetching user reviews:', err);
      setError('Failed to load your reviews. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (reviewId, action) => {
    if (!currentUserId) return;
    
    try {
      const response = await axios.put(`/api/reviews/${reviewId}`, 
        { action },
        { withCredentials: true }
      );
      
      if (response.data) {
        setUserReviews(prevReviews => 
          prevReviews.map(review => 
            review._id === reviewId ? response.data : review
          )
        );
      }
    } catch (err) {
      console.error('Error updating review vote:', err);
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const getMonthYear = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const getUserVoteStatus = (review) => {
    if (!currentUserId) return { liked: false, disliked: false };
    
    const userIdStr = currentUserId.toString();
    
    const liked = Array.isArray(review.likes) && 
      review.likes.some(id => id && id.toString() === userIdStr);
    
    const disliked = Array.isArray(review.dislikes) && 
      review.dislikes.some(id => id && id.toString() === userIdStr);
    
    return { liked, disliked };
  };

  const isOwnReview = (review) => {
    if (!currentUserId || !review.userId) return false;
    return review.userId.toString() === currentUserId.toString();
  };

  const getShowTitle = (review) => {
    if (review.showName && review.showName !== 'Unknown Show' && review.showName !== 'Unknown TV Show') {
      return review.showName;
    }
    
    if (review.showId) {
      return `Show #${review.showId}`;
    }
    
    return 'Untitled Show';
  };

  let lastMonth = "";

  return (
    <>
      <section className="min-h-screen flex flex-col items-center justify-start bg-gray-900 pt-6 pb-20">
        <div className="text-center mb-10 px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-white font-coolvetica relative inline-block">
            Activity
          </h2>
          <p className="text-gray-400 mt-2 text-sm sm:text-base max-w-md mx-auto">
            Your latest reviews and ratings.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-400 py-8 px-4">
            <p>{error}</p>
            <button 
              onClick={fetchUserReviews}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="flex flex-col space-y-4 w-full px-4 sm:px-8 mb-20">
            {userReviews.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <p>You haven't written any reviews yet.</p>
                <button 
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                  onClick={() => window.location.href = '/discover'}
                >
                  Discover Shows
                </button>
              </div>
            ) : (
              userReviews.map((review, index) => {
                const currentMonth = getMonthYear(review.createdAt);
                const showHeader = currentMonth !== lastMonth;
                lastMonth = currentMonth;
                const { liked, disliked } = getUserVoteStatus(review);
                const isUsersReview = isOwnReview(review);
                const showTitle = getShowTitle(review);

                return (
                  <div key={review._id} className="w-full flex flex-col items-center">
                    {showHeader && (
                      <div className="w-full flex items-center mb-4 mt-6 px-2 sm:px-4">
                        <div className="h-px flex-1 bg-gradient-to-r from-blue-400/30 via-gray-500/30 to-transparent" />
                        <h4 className="px-4 py-1 bg-[#2E2E2E] text-white text-md sm:text-lg font-semibold rounded-full shadow border border-gray-700 mx-4">
                          {currentMonth}
                        </h4>
                        <div className="h-px flex-1 bg-gradient-to-l from-blue-400/30 via-gray-500/30 to-transparent" />
                      </div>
                    )}

                    <motion.div
                      initial="hidden"
                      animate="visible"
                      variants={fadeInUp}
                      transition={{ delay: index * 0.1 }}
                      className="w-full max-w-xl"
                    >
                      <div className="bg-[#333333] rounded-xl p-4 sm:p-6 shadow-lg border border-gray-700 mb-6 transition-all hover:shadow-[0_6px_16px_rgba(0,0,0,0.3)]">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-white mb-1">
                              {review.showId ? (
                                <a href={`/show/${review.showId}`} className="hover:text-blue-400 transition-colors">
                                  {showTitle}
                                </a>
                              ) : (
                                <span className="text-gray-300">
                                  {showTitle}
                                </span>
                              )}
                            </h3>
                            <div className="flex items-center mt-1 space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <Apple
                                  key={i}
                                  className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'}`}
                                />
                              ))}
                              <span className="ml-2 text-sm text-gray-400">{review.rating}/5</span>
                            </div>
                          </div>
                          <span className="text-sm text-gray-400">
                            {review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            }) : 'Just now'}
                          </span>
                        </div>

                        <div className="mb-4">
                          <p className="text-gray-200">
                            {review.content}
                          </p>
                        </div>

                        {review.containsSpoiler && (
                          <div className="bg-[#3a3a3a] p-3 rounded-lg mb-4 border-l-4 border-yellow-400">
                            <p className="text-yellow-400 font-medium flex items-center">
                              <AlertTriangle className="mr-2 w-5 h-5" />
                              <span>Spoiler Warning</span>
                            </p>
                          </div>
                        )}

                        <div className="flex justify-between items-center pt-3 border-t border-[#3a3a3a]">
                          <div className="flex space-x-4">
                            {/* Like button */}
                            <button
                              onClick={() => currentUserId && !isUsersReview && handleVote(review._id, 'like')}
                              className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors ${
                                !currentUserId || isUsersReview ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                              } ${
                                liked
                                  ? 'bg-blue-900/30 text-blue-400'
                                  : 'text-gray-400 hover:bg-[#3a3a3a] hover:text-blue-400'
                              }`}
                              title={!currentUserId ? "Log in to vote" : isUsersReview ? "You can't vote on your own review" : "Like this review"}
                            >
                              <ThumbsUp className={`w-5 h-5 ${liked ? 'fill-blue-400' : ''}`} />
                              <span className="font-medium">
                                {Array.isArray(review.likes) ? review.likes.length : 0}
                              </span>
                            </button>

                            {/* Dislike button */}
                            <button
                              onClick={() => currentUserId && !isUsersReview && handleVote(review._id, 'dislike')}
                              className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors ${
                                !currentUserId || isUsersReview ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                              } ${
                                disliked
                                  ? 'bg-red-900/30 text-red-400'
                                  : 'text-gray-400 hover:bg-[#3a3a3a] hover:text-red-400'
                              }`}
                              title={!currentUserId ? "Log in to vote" : isUsersReview ? "You can't vote on your own review" : "Dislike this review"}
                            >
                              <ThumbsDown className={`w-5 h-5 ${disliked ? 'fill-red-400' : ''}`} />
                              <span className="font-medium">
                                {Array.isArray(review.dislikes) ? review.dislikes.length : 0}
                              </span>
                            </button>
                          </div>

                          {review.containsSpoiler && (
                            <span className="text-xs bg-[#3a3a3a] text-gray-400 px-2 py-1 rounded-full">
                              Contains Spoilers
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </section>
      <div className="fixed bottom-0 w-full">
      <BottomNavbar />
      </div>
    </>
  );
}

export default ActivityPage;