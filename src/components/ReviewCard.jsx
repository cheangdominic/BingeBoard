import React, { useState, useEffect } from 'react';
import { Apple, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import defaultProfilePic from "../../public/img/profilePhotos/generic_profile_picture.jpg";

export default function ReviewCard({
  user,
  date,
  reviewText,
  rating,
  imageUrl,
  showName,
  showId,
  reviewId,
  containsSpoiler,
  likes = [],
  dislikes = [],
  currentUserId,
  onVote
}) {
  const [expanded, setExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [userLiked, setUserLiked] = useState(false);
  const [userDisliked, setUserDisliked] = useState(false);
  const [localLikes, setLocalLikes] = useState(likes);
  const [localDislikes, setLocalDislikes] = useState(dislikes);
  const [isVoting, setIsVoting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUserId) {
      setUserLiked(localLikes.includes(currentUserId));
      setUserDisliked(localDislikes.includes(currentUserId));
    }
  }, [currentUserId, localLikes, localDislikes]);

  useEffect(() => {
    setLocalLikes(likes);
    setLocalDislikes(dislikes);
  }, [likes, dislikes]);

  const isCurrentUser = currentUserId && user._id === currentUserId;

  const handleVote = async (action, event) => {
    event.stopPropagation(); // Prevent card click navigation

    if (!currentUserId || isCurrentUser || isVoting) return;

    setIsVoting(true);

    const wasLiked = userLiked;
    const wasDisliked = userDisliked;

    if (action === 'like') {
      if (wasLiked) {
        setLocalLikes(prev => prev.filter(id => id !== currentUserId));
        setUserLiked(false);
      } else {
        setLocalLikes(prev => [...prev.filter(id => id !== currentUserId), currentUserId]);
        setLocalDislikes(prev => prev.filter(id => id !== currentUserId));
        setUserLiked(true);
        setUserDisliked(false);
      }
    } else if (action === 'dislike') {
      if (wasDisliked) {
        setLocalDislikes(prev => prev.filter(id => id !== currentUserId));
        setLocalLikes(prev => prev.filter(id => id !== currentUserId));
        setUserDisliked(true);
        setUserLiked(false);
      } else {
        setLocalDislikes(prev => [...prev.filter(id => id !== currentUserId), currentUserId]);
        setLocalLikes(prev => prev.filter(id => id !== currentUserId));
        setUserDisliked(true);
        setUserLiked(false);
      }
    }

    try {
      const idToUse = reviewId || showId;
      await onVote(idToUse, action);
    } catch (error) {
      console.error('Vote failed:', error);
      setLocalLikes(likes);
      setLocalDislikes(dislikes);
      setUserLiked(likes.includes(currentUserId));
      setUserDisliked(dislikes.includes(currentUserId));
    } finally {
      setIsVoting(false);
    }
  };

  const renderAppleRating = (rating) => {
    return (
      <div className="flex items-center mt-1 space-x-1">
        {[...Array(5)].map((_, i) => (
          <Apple
            key={i}
            className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'}`}
          />
        ))}
        <span className="ml-2 text-xs text-gray-400">{rating}/5</span>
      </div>
    );
  };

  const handleCardClick = () => {
    if (showId) {
      navigate(`/show/${showId}`);
    }
  };

  return (
    <div
      className={`flex-shrink-0 w-[280px] h-[450px] bg-[#2a2a2a] rounded-lg p-3 flex flex-col shadow-lg transition-transform duration-200 cursor-pointer ${isHovered ? 'transform -translate-y-2 shadow-xl pt-5' : 'pt-3'
        }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* User info */}
      <div className="flex items-center gap-3 h-14">
        <img
          src={user.profilePhoto || defaultProfilePic}
          alt={user.username}
          className="w-9 h-9 rounded-full object-cover"
          onError={(e) => {
            e.target.src = defaultProfilePic;
          }}
        />
        <div>
          <p className="text-white font-semibold text-sm">@{user.username}</p>
          <p className="text-gray-400 text-xs">{date}</p>
        </div>
      </div>

      {/* Spoiler warning - Optional section */}
      {/* Reduced height from h-8 to h-6 and removed mb-1 */}
      <div className="h-6 flex items-center">
        {containsSpoiler && (
          <div className="bg-yellow-900 text-yellow-200 text-xs px-2 py-1 rounded self-start">
            Contains Spoilers
          </div>
        )}
      </div>

      {/* Rating */}
      {/* Reduced height from h-8 to h-6 and removed my-1 */}
      <div className="h-6 flex items-center">
        {renderAppleRating(rating)}
      </div>

      {/* Review text */}
      {/* Reduced height from h-16 to h-12 and mb-2 to mb-1 */}
      <div className="h-12 overflow-y-auto mb-1">
        <p className="text-gray-300 text-sm leading-relaxed">
          {reviewText}
        </p>
      </div>

      {/* Show info */}
      {/* Reduced height from h-6 to h-5 and mb-2 to mb-1 */}
      <div className="h-5 mb-1">
        {showName && (
          <p className="text-white font-medium text-sm truncate">{showName}</p>
        )}
      </div>

      {/* Show image */}
      {/* Reduced height from h-48 to h-40 */}
      <div className="flex-grow mt-auto overflow-hidden rounded-lg">
        <img
          src={imageUrl}
          alt={showName || "Show poster"}
          className="w-full h-40 object-cover rounded-lg"
        />
      </div>

      {/* Like/Dislike buttons */}
      <div className="flex gap-3 mt-3">
        {/* Like button */}
        <button
          onClick={(e) => handleVote('like', e)}
          disabled={isVoting}
          className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-all duration-200 ${!currentUserId || isCurrentUser ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            } ${userLiked
              ? 'bg-blue-900/40 text-blue-400 scale-105'
              : 'text-gray-400 hover:bg-[#3a3a3a] hover:text-blue-400 hover:scale-105'
            } ${isVoting ? 'opacity-70' : ''}`}
          title={!currentUserId ? "Log in to vote" : isCurrentUser ? "You can't vote on your own review" : "Like this review"}
        >
          <ThumbsUp className={`w-4 h-4 transition-all duration-200 ${userLiked ? 'fill-blue-400' : ''}`} />
          <span className="font-medium text-sm">
            {localLikes.length}
          </span>
        </button>

        {/* Dislike button */}
        <button
          onClick={(e) => handleVote('dislike', e)}
          disabled={isVoting}
          className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-all duration-200 ${!currentUserId || isCurrentUser ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            } ${userDisliked
              ? 'bg-red-900/40 text-red-400 scale-105'
              : 'text-gray-400 hover:bg-[#3a3a3a] hover:text-red-400 hover:scale-105'
            } ${isVoting ? 'opacity-70' : ''}`}
          title={!currentUserId ? "Log in to vote" : isCurrentUser ? "You can't vote on your own review" : "Dislike this review"}
        >
          <ThumbsDown className={`w-4 h-4 transition-all duration-200 ${userDisliked ? 'fill-red-400' : ''}`} />
          <span className="font-medium text-sm">
            {localDislikes.length}
          </span>
        </button>
      </div>
    </div>
  );
}