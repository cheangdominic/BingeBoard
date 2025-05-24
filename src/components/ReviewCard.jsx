/**
 * @file ReviewCard.jsx
 * @description A React component that displays a user's review for a TV show.
 * It includes user details, review content, rating, show information, and like/dislike functionality.
 */

// Import React and hooks (useState, useEffect, useMemo) for component logic.
import React, { useState, useEffect, useMemo } from 'react';
// Import icons (Apple for rating, ThumbsUp/Down for voting) from lucide-react.
import { Apple, ThumbsUp, ThumbsDown } from 'lucide-react';
// Import useNavigate hook from react-router-dom for programmatic navigation.
import { useNavigate } from 'react-router-dom';
// Import a default profile picture to be used as a fallback.
import defaultProfilePic from "../../public/img/profilePhotos/generic_profile_picture.jpg";

/**
 * @function ReviewCard
 * @description A React functional component that renders a card displaying a review.
 * The card shows the reviewer's information, review text, rating, show poster, and like/dislike buttons.
 * Clicking the card navigates to the show's detail page.
 *
 * @param {object} props - The properties passed to the component.
 * @param {object} props.user - The user object who wrote the review (should contain `_id`, `username`, `profilePhoto`).
 * @param {string} props.date - The date the review was posted.
 * @param {string} props.reviewText - The content of the review.
 * @param {number} props.rating - The star rating given in the review.
 * @param {string} props.imageUrl - URL for the show's poster image.
 * @param {string} props.showName - The name of the TV show.
 * @param {string|number} props.showId - The ID of the TV show.
 * @param {string|number} props.reviewId - The ID of the review.
 * @param {boolean} props.containsSpoiler - Flag indicating if the review contains spoilers.
 * @param {Array<string>} [props.likes=[]] - Array of user IDs who liked the review.
 * @param {Array<string>} [props.dislikes=[]] - Array of user IDs who disliked the review.
 * @param {string|null} props.currentUserId - The ID of the currently logged-in user, or null if not logged in.
 * @param {function} props.onVote - Callback function to handle a vote (like/dislike) on the review.
 *                                 Receives `reviewId` and `action` ('like' or 'dislike') as arguments.
 * @returns {JSX.Element} The rendered ReviewCard component.
 */
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
  likes = [], // Default to an empty array if not provided
  dislikes = [], // Default to an empty array if not provided
  currentUserId,
  onVote
}) {
  // State to track if the card is currently being hovered over (for hover animation).
  const [isHovered, setIsHovered] = useState(false);
  // State to track if a vote action is currently in progress (to disable buttons).
  const [isVoting, setIsVoting] = useState(false);
  // Hook for programmatic navigation.
  const navigate = useNavigate();

  // Memoized value to check if the current user has liked this review.
  // Recalculates only if `currentUserId` or `likes` array changes.
  const userLiked = useMemo(() => currentUserId && likes.includes(currentUserId), [currentUserId, likes]);
  // Memoized value to check if the current user has disliked this review.
  // Recalculates only if `currentUserId` or `dislikes` array changes.
  const userDisliked = useMemo(() => currentUserId && dislikes.includes(currentUserId), [currentUserId, dislikes]);

  // Determine if the review was written by the current user.
  const isCurrentUserReview = currentUserId && user._id === currentUserId;

  /**
   * Handles a vote (like or dislike) action on the review.
   * Prevents voting if not logged in, if it's the user's own review, or if a vote is already in progress.
   * @async
   * @param {'like' | 'dislike'} action - The type of vote.
   * @param {React.MouseEvent} event - The click event object (to stop propagation).
   */
  const handleVote = async (action, event) => {
    event.stopPropagation(); // Prevent the card's onClick from firing when a vote button is clicked.
    // Guard conditions: do nothing if not logged in, or it's the user's own review, or already voting.
    if (!currentUserId || isCurrentUserReview || isVoting) return;

    setIsVoting(true); // Set voting state to true to disable buttons.
    try {
      await onVote(reviewId, action); // Call the provided onVote handler.
    } catch (error) {
      console.error('Vote failed:', error); // Log errors if the vote fails.
    } finally {
      setIsVoting(false); // Reset voting state regardless of success or failure.
    }
  };

  /**
   * Renders the star rating display using Apple icons.
   * @param {number} val - The rating value (0-5).
   * @returns {JSX.Element} The JSX for the star rating.
   */
  const renderAppleRating = (val) => {
    return (
      <div className="flex items-center mt-1 space-x-1">
        {/* Create an array of 5 elements to map over for the stars. */}
        {[...Array(5)].map((_, i) => (
          <Apple
            key={i}
            // Apply yellow color if index `i` is less than the rating value, otherwise gray.
            className={`w-4 h-4 ${i < val ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'}`}
          />
        ))}
        {/* Display the numerical rating (e.g., "4/5"). */}
        <span className="ml-2 text-xs text-gray-400">{val}/5</span>
      </div>
    );
  };

  /**
   * Handles click events on the entire card. Navigates to the show's detail page if `showId` is available.
   */
  const handleCardClick = () => {
    if (showId) {
      navigate(`/show/${showId}`);
    }
  };

  // Main render method for the ReviewCard.
  return (
    <div
      // Styling for the card container: size, background, padding, layout, shadow, hover animations.
      className={`flex-shrink-0 w-[280px] h-[450px] bg-[#2a2a2a] rounded-lg p-3 flex flex-col shadow-lg transition-transform duration-200 cursor-pointer ${isHovered ? 'transform -translate-y-2 shadow-xl pt-5' : 'pt-3' // Dynamic padding and transform on hover.
        }`}
      onMouseEnter={() => setIsHovered(true)} // Set hover state on mouse enter.
      onMouseLeave={() => setIsHovered(false)} // Clear hover state on mouse leave.
      onClick={handleCardClick} // Handle card click for navigation.
    >
      {/* Section for user avatar, username, and review date. */}
      <div className="flex items-center gap-3 h-14">
        <img
          src={user.profilePhoto || defaultProfilePic} // Use user's profile photo or default.
          alt={user.username} // Alt text for accessibility.
          className="w-9 h-9 rounded-full object-cover"
          onError={(e) => { // Fallback if the profile image fails to load.
            e.target.src = defaultProfilePic;
          }}
        />
        <div>
          <p className="text-white font-semibold text-sm">@{user.username}</p>
          <p className="text-gray-400 text-xs">{date}</p>
        </div>
      </div>
      {/* Section for spoiler warning tag. */}
      <div className="h-6 flex items-center">
        {containsSpoiler && ( // Conditionally render spoiler tag.
          <div className="bg-yellow-900 text-yellow-200 text-xs px-2 py-1 rounded self-start">
            Contains Spoilers
          </div>
        )}
      </div>
      {/* Section for star rating. */}
      <div className="h-6 flex items-center">
        {renderAppleRating(rating)}
      </div>
      {/* Section for review text (scrollable if it overflows). */}
      <div className="h-12 overflow-y-auto mb-1"> {/* Fixed height with overflow scroll. */}
        <p className="text-gray-300 text-sm leading-relaxed">
          {reviewText}
        </p>
      </div>
      {/* Section for show name (truncated if too long). */}
      <div className="h-5 mb-1">
        {showName && ( // Conditionally render show name.
          <p className="text-white font-medium text-sm truncate">{showName}</p>
        )}
      </div>
      {/* Section for the show's poster image. */}
      <div className="flex-grow mt-auto overflow-hidden rounded-lg"> {/* `flex-grow` and `mt-auto` push this to the bottom. */}
        <img
          src={imageUrl}
          alt={showName || "Show poster"} // Alt text.
          className="w-full h-40 object-cover rounded-lg" // Ensure image covers its container.
        />
      </div>
      {/* Section for like and dislike buttons. */}
      <div className="flex gap-3 mt-3">
        {/* Like button. */}
        <button
          onClick={(e) => handleVote('like', e)}
          disabled={isVoting || !currentUserId || isCurrentUserReview} // Disable conditions.
          // Dynamic classes for styling based on vote state, login status, and whether it's user's own review.
          className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-all duration-200 ${!currentUserId || isCurrentUserReview ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            } ${userLiked
              ? 'bg-blue-900/40 text-blue-400 scale-105' // Liked state.
              : 'text-gray-400 hover:bg-[#3a3a3a] hover:text-blue-400 hover:scale-105' // Default state.
            } ${isVoting ? 'opacity-70' : ''}`} // Dim if voting is in progress.
          title={!currentUserId ? "Log in to vote" : isCurrentUserReview ? "You can't vote on your own review" : "Like this review"} // Tooltip.
        >
          <ThumbsUp className={`w-4 h-4 transition-all duration-200 ${userLiked ? 'fill-blue-400' : ''}`} />
          <span className="font-medium text-sm">
            {likes.length} {/* Display like count. */}
          </span>
        </button>
        {/* Dislike button. */}
        <button
          onClick={(e) => handleVote('dislike', e)}
          disabled={isVoting || !currentUserId || isCurrentUserReview} // Disable conditions.
          // Dynamic classes for styling.
          className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-all duration-200 ${!currentUserId || isCurrentUserReview ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            } ${userDisliked
              ? 'bg-red-900/40 text-red-400 scale-105' // Disliked state.
              : 'text-gray-400 hover:bg-[#3a3a3a] hover:text-red-400 hover:scale-105' // Default state.
            } ${isVoting ? 'opacity-70' : ''}`} // Dim if voting.
          title={!currentUserId ? "Log in to vote" : isCurrentUserReview ? "You can't vote on your own review" : "Dislike this review"} // Tooltip.
        >
          <ThumbsDown className={`w-4 h-4 transition-all duration-200 ${userDisliked ? 'fill-red-400' : ''}`} />
          <span className="font-medium text-sm">
            {dislikes.length} {/* Display dislike count. */}
          </span>
        </button>
      </div>
    </div>
  );
}