import React, { useState, useEffect, useMemo } from 'react';
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
  const [isHovered, setIsHovered] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const navigate = useNavigate();

  const userLiked = useMemo(() => currentUserId && likes.includes(currentUserId), [currentUserId, likes]);
  const userDisliked = useMemo(() => currentUserId && dislikes.includes(currentUserId), [currentUserId, dislikes]);

  const isCurrentUserReview = currentUserId && user._id === currentUserId;

  const handleVote = async (action, event) => {
    event.stopPropagation();
    if (!currentUserId || isCurrentUserReview || isVoting) return;

    setIsVoting(true);
    try {
      await onVote(reviewId, action);
    } catch (error) {
      console.error('Vote failed:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const renderAppleRating = (val) => {
    return (
      <div className="flex items-center mt-1 space-x-1">
        {[...Array(5)].map((_, i) => (
          <Apple
            key={i}
            className={`w-4 h-4 ${i < val ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'}`}
          />
        ))}
        <span className="ml-2 text-xs text-gray-400">{val}/5</span>
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
      <div className="h-6 flex items-center">
        {containsSpoiler && (
          <div className="bg-yellow-900 text-yellow-200 text-xs px-2 py-1 rounded self-start">
            Contains Spoilers
          </div>
        )}
      </div>
      <div className="h-6 flex items-center">
        {renderAppleRating(rating)}
      </div>
      <div className="h-12 overflow-y-auto mb-1">
        <p className="text-gray-300 text-sm leading-relaxed">
          {reviewText}
        </p>
      </div>
      <div className="h-5 mb-1">
        {showName && (
          <p className="text-white font-medium text-sm truncate">{showName}</p>
        )}
      </div>
      <div className="flex-grow mt-auto overflow-hidden rounded-lg">
        <img
          src={imageUrl}
          alt={showName || "Show poster"}
          className="w-full h-40 object-cover rounded-lg"
        />
      </div>
      <div className="flex gap-3 mt-3">
        <button
          onClick={(e) => handleVote('like', e)}
          disabled={isVoting || !currentUserId || isCurrentUserReview}
          className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-all duration-200 ${!currentUserId || isCurrentUserReview ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            } ${userLiked
              ? 'bg-blue-900/40 text-blue-400 scale-105'
              : 'text-gray-400 hover:bg-[#3a3a3a] hover:text-blue-400 hover:scale-105'
            } ${isVoting ? 'opacity-70' : ''}`}
          title={!currentUserId ? "Log in to vote" : isCurrentUserReview ? "You can't vote on your own review" : "Like this review"}
        >
          <ThumbsUp className={`w-4 h-4 transition-all duration-200 ${userLiked ? 'fill-blue-400' : ''}`} />
          <span className="font-medium text-sm">
            {likes.length}
          </span>
        </button>
        <button
          onClick={(e) => handleVote('dislike', e)}
          disabled={isVoting || !currentUserId || isCurrentUserReview}
          className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-all duration-200 ${!currentUserId || isCurrentUserReview ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            } ${userDisliked
              ? 'bg-red-900/40 text-red-400 scale-105'
              : 'text-gray-400 hover:bg-[#3a3a3a] hover:text-red-400 hover:scale-105'
            } ${isVoting ? 'opacity-70' : ''}`}
          title={!currentUserId ? "Log in to vote" : isCurrentUserReview ? "You can't vote on your own review" : "Dislike this review"}
        >
          <ThumbsDown className={`w-4 h-4 transition-all duration-200 ${userDisliked ? 'fill-red-400' : ''}`} />
          <span className="font-medium text-sm">
            {dislikes.length}
          </span>
        </button>
      </div>
    </div>
  );
}