/**
 * @file ReviewCard.jsx
 * @description A React component that displays a single review in a card format.
 * It shows the reviewer's username, rating, review content (expandable), date,
 * spoiler warning, and like/dislike buttons with counts.
 */

// Import React and useState hook for managing component state (e.g., text expansion).
import React, { useState } from 'react';
// Import ThumbsUp and ThumbsDown icons from lucide-react for like/dislike buttons.
import { ThumbsUp, ThumbsDown } from 'lucide-react';
// Import AppleRatingDisplay component for showing star/apple ratings.
import AppleRatingDisplay from '../../../components/AppleRatingDisplay'; // Assuming path is correct

/**
 * @function ReviewCard
 * @description A React functional component that renders a card for a single review.
 * It displays review details and allows the current user to vote (like/dislike) if applicable.
 *
 * @param {object} props - The properties passed to the component.
 * @param {object} props.review - The review object containing details like username, rating, content, etc.
 *                                Expected fields: `username`, `rating`, `content`, `createdAt`, `containsSpoiler`,
 *                                `likes` (array of user IDs), `dislikes` (array of user IDs), `_id` or `id`, `userId`.
 * @param {function} props.onVote - Callback function invoked when a user votes (likes/dislikes) on the review.
 *                                  Receives `reviewId` and `action` ('like' or 'dislike') as arguments.
 * @param {string|null} props.currentUserId - The ID of the currently logged-in user, or null if not logged in.
 *                                            Used to determine if the user has already voted or if it's their own review.
 * @returns {JSX.Element} The rendered ReviewCard component.
 */
export default function ReviewCard({ review, onVote, currentUserId }) {
  /**
   * State variable to control whether the review text is fully expanded or truncated.
   * `isExpanded` is a boolean: true if expanded, false if truncated.
   * @type {[boolean, function(boolean): void]}
   */
  const [isExpanded, setIsExpanded] = useState(false);

  /**
   * The ID of the current user, converted to a string for consistent comparison.
   * Null if no user is logged in.
   * @const {string|null}
   */
  const userIdStr = currentUserId ? currentUserId.toString() : null;
  
  /**
   * Boolean indicating if the current user has liked this review.
   * Checks if `review.likes` is an array and if `userIdStr` is present in it.
   * Safely handles cases where `id` within `review.likes` might be null or undefined.
   * @const {boolean}
   */
  const userLiked = Array.isArray(review.likes) &&
    review.likes.some(id => id && id.toString() === userIdStr); // `id &&` guards against null/undefined IDs in the array.
  
  /**
   * Boolean indicating if the current user has disliked this review.
   * Checks if `review.dislikes` is an array and if `userIdStr` is present in it.
   * Safely handles cases where `id` within `review.dislikes` might be null or undefined.
   * @const {boolean}
   */
  const userDisliked = Array.isArray(review.dislikes) &&
    review.dislikes.some(id => id && id.toString() === userIdStr);
  
  /**
   * Boolean indicating if the review was written by the current user.
   * Ensures `review.userId` and `userIdStr` exist before comparison.
   * @const {boolean}
   */
  const isCurrentUser = review.userId && // Ensure review.userId exists
    userIdStr && // Ensure currentUserId (as string) exists
    review.userId.toString() === userIdStr; // Compare as strings

  /**
   * The review rating formatted as a string (e.g., "4.50").
   * Defaults to "N/A" if `review.rating` is not a number.
   * @const {string}
   */
  const displayRating = typeof review.rating === 'number' ? review.rating.toFixed(2) : 'N/A';

  // Render the review card UI.
  return (
    // Main container for the review card with styling for background, rounded corners, shadow, margin, and hover effect.
    <div className="bg-[#333333] rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.25)] mb-6 transition-all hover:shadow-[0_6px_16px_rgba(0,0,0,0.3)]">
      {/* Top section of the card: Reviewer's username, rating display, and review date. */}
      <div className="flex justify-between items-start mb-4">
        {/* Left part of the top section: username and rating. */}
        <div>
          {/* Reviewer's username. Defaults to "Anonymous" if not provided. */}
          <h4 className="text-lg font-semibold text-white">{review.username || "Anonymous"}</h4>
          {/* Rating display using AppleRatingDisplay component and numerical rating text. */}
          <div className="flex items-center mt-1 space-x-1">
            <AppleRatingDisplay rating={review.rating} appleSize="w-5 h-5" /> {/* Pass rating and apple size. */}
            {/* Numerical rating text (e.g., "4.50/5"). */}
            <span className="ml-2 text-sm text-gray-400">{displayRating}/5</span>
          </div>
        </div>
        {/* Right part of the top section: Date of the review. */}
        <span className="text-sm text-gray-400">
          {/* Format the `createdAt` date. If `createdAt` is not available, display "Just now" as a fallback. */}
          {review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }) : 'Just now'}
        </span>
      </div>

      {/* Main content section of the review. */}
      <div className="mb-4">
        {/* Review text. Uses `line-clamp-3` for truncation if not expanded. */}
        <p className={`text-gray-200 ${isExpanded ? '' : 'line-clamp-3'}`}>
          {review.content}
        </p>
        {/* "Read more" / "Show less" button. Displayed if the review content is longer than 200 characters. */}
        {review.content && review.content.length > 200 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)} // Toggle the `isExpanded` state on click.
            className="text-blue-400 hover:text-blue-300 text-sm mt-1 font-medium cursor-pointer"
          >
            {isExpanded ? 'Show less' : 'Read more'} {/* Dynamically set button text. */}
          </button>
        )}
      </div>

      {/* Spoiler warning section. Displayed if `review.containsSpoiler` is true. */}
      {review.containsSpoiler && (
        // Styled warning box with a left border and icon.
        <div className="bg-[#3a3a3a] p-3 rounded-lg mb-4 border-l-4 border-yellow-400">
          <p className="text-yellow-400 font-medium flex items-center">
            <span className="mr-2">⚠️</span> {/* Warning icon. */}
            <span>Spoiler Warning</span>
          </p>
        </div>
      )}

      {/* Bottom section of the card: Like/dislike buttons and an optional spoiler tag. */}
      {/* Separated by a top border. */}
      <div className="flex justify-between items-center pt-3 border-t border-[#3a3a3a]">
        {/* Container for like and dislike buttons. */}
        <div className="flex space-x-4">
          {/* Like button. */}
          <button
            // Click handler: calls `onVote` if user is logged in and not the author of the review.
            onClick={() => currentUserId && !isCurrentUser && onVote(review._id || review.id, 'like')}
            // Dynamic classes for styling based on login status, authorship, and if already liked.
            className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors ${
              !currentUserId || isCurrentUser ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer' // Disabled appearance
            } ${
              userLiked
                ? 'bg-blue-900/30 text-blue-400' // Liked state style
                : 'text-gray-400 hover:bg-[#3a3a3a] hover:text-blue-400' // Default state style
            }`}
            // Dynamic title attribute for accessibility and user guidance.
            title={!currentUserId ? "Log in to vote" : isCurrentUser ? "You can't vote on your own review" : "Like this review"}
          >
            <ThumbsUp className={`w-5 h-5 ${userLiked ? 'fill-blue-400' : ''}`} /> {/* ThumbsUp icon, filled if liked. */}
            <span className="font-medium">
              {/* Display like count. Ensures `review.likes` is an array before accessing its length. */}
              {Array.isArray(review.likes) ? review.likes.length : 0}
            </span>
          </button>

          {/* Dislike button. */}
          <button
            onClick={() => currentUserId && !isCurrentUser && onVote(review._id || review.id, 'dislike')}
            className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors ${
              !currentUserId || isCurrentUser ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            } ${
              userDisliked
                ? 'bg-red-900/30 text-red-400' // Disliked state style
                : 'text-gray-400 hover:bg-[#3a3a3a] hover:text-red-400' // Default state style
            }`}
            title={!currentUserId ? "Log in to vote" : isCurrentUser ? "You can't vote on your own review" : "Dislike this review"}
          >
            <ThumbsDown className={`w-5 h-5 ${userDisliked ? 'fill-red-400' : ''}`} /> {/* ThumbsDown icon, filled if disliked. */}
            <span className="font-medium">
              {/* Display dislike count. Ensures `review.dislikes` is an array. */}
              {Array.isArray(review.dislikes) ? review.dislikes.length : 0}
            </span>
          </button>
        </div>

        {/* Optional: A smaller spoiler tag at the bottom right, possibly for quick identification if content is long. */}
        {review.containsSpoiler && (
          <span className="text-xs bg-[#3a3a3a] text-gray-400 px-2 py-1 rounded-full">
            Contains Spoilers
          </span>
        )}
      </div>
    </div>
  );
}