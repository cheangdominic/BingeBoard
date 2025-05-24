/**
 * @file ActivityCard.js
 * @description A React component to display a single user activity in a card format.
 * It dynamically renders content based on the type of activity.
 */

// Import React for creating the component.
import React from 'react';
// Import Link component from react-router-dom for navigation.
import { Link } from 'react-router-dom';
// Import date-fns functions for formatting timestamps.
import { formatDistanceToNow, format, isValid, parseISO } from 'date-fns';
// Import AppleRating component for displaying star ratings.
import AppleRating from '../../components/AppleRating';

/**
 * Formats a given ISO timestamp into a human-readable string.
 * If the date is within the last 24 hours, it shows relative time (e.g., "2 hours ago").
 * Otherwise, it shows a formatted date (e.g., "Jan 1, 2023").
 *
 * @param {string} timestamp - The ISO 8601 timestamp string.
 * @returns {string} A formatted date string or "Invalid date" if the timestamp is invalid.
 */
const formatActivityTimestamp = (timestamp) => {
  // Parse the ISO timestamp string into a Date object.
  const date = parseISO(timestamp);
  // Check if the parsed date is valid.
  if (!isValid(date)) {
    return "Invalid date";
  }
  // Get the current date and time.
  const now = new Date();
  // Calculate the difference in hours between now and the activity date.
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  // If the difference is less than 24 hours, use relative time format.
  if (diffInHours < 24) {
    return formatDistanceToNow(date, { addSuffix: true }); // e.g., "about 2 hours ago"
  } else {
    // Otherwise, use a specific date format.
    return format(date, 'MMM d, yyyy'); // e.g., "Jan 1, 2023"
  }
};

/**
 * @function ActivityCard
 * @description A React functional component that renders a card for a user activity.
 * The content and appearance of the card vary based on the `activity.action` type.
 *
 * @param {object} props - The properties passed to the component.
 * @param {object} props.activity - The activity object.
 * @param {string} props.activity.action - The type of activity (e.g., 'review_create', 'login').
 * @param {object} [props.activity.details] - Additional details specific to the activity.
 * @param {string} props.activity.createdAt - The ISO timestamp when the activity occurred.
 * @param {string} [props.activity.targetId] - The ID of the target entity (e.g., show ID), if applicable.
 * @returns {JSX.Element} The rendered ActivityCard component.
 */
const ActivityCard = ({ activity }) => {
  // Destructure properties from the activity object.
  const { action, details, createdAt, targetId } = activity;

  // Initialize variables for dynamic content.
  let content = null; // JSX for specific content related to the action (e.g., review text, profile pic).
  let titleText = "";   // The main descriptive text for the activity.
  let showLink = null;  // URL to link the card to, if applicable (e.g., to a show page).

  // Define a default image URL for shows if no image is provided in details.
  const defaultShowImage = "https://via.placeholder.com/100x150?text=No+Image";
  // Get the show image from details or use the default.
  const showImage = details?.showImage || defaultShowImage;
  // Get the show name from details or use a generic placeholder.
  const showName = details?.showName || "a show";
  
  // Determine if the activity card should link to a show page.
  const canLinkToShow = action === 'review_create' || action === 'watchlist_add' || action === 'watchlist_remove' || action.includes('review_like') || action.includes('review_dislike') || action.includes('review_unlike') || action.includes('review_undislike');

  // If a targetId exists and the action is related to a show with a valid name, set the showLink.
  if (targetId && (action === 'review_create' || action === 'watchlist_add' || action === 'watchlist_remove' || 
                  ((action.includes('review_like') || action.includes('review_dislike') || action.includes('review_unlike') || action.includes('review_undislike')) && details?.showName && details?.showName !== "a show"))) {
    showLink = `/show/${targetId}`;
  }

  // Use a switch statement to determine `titleText` and `content` based on the `action` type.
  switch (action) {
    case 'account_creation':
      titleText = "Created an account.";
      break;
    case 'login':
      titleText = "Logged in.";
      break;
    case 'profile_update':
      // Title includes the field that was updated, if available.
      titleText = <>Updated profile {details?.field ? <span className="font-semibold">{`(${details.field})`}</span> : ''}.</>;
      // If a profile photo was updated, display the new photo.
      if (details?.profilePhoto) {
        content = (
          <img src={details.profilePhoto} alt="New Profile Pic" className="w-16 h-16 rounded-full object-cover mt-2" />
        );
      }
      break;
    case 'review_create':
      titleText = <>Wrote a review for <strong className="font-semibold">{showName}</strong>.</>;
      // Content includes the rating and a snippet of the review.
      content = (
        <div className="mt-2 text-sm text-gray-400">
          {details.rating && <AppleRating rating={details.rating} />}
          <p className="mt-1 line-clamp-3">{details.content}</p> {/* Truncates review content to 3 lines */}
        </div>
      );
      break;
    case 'review_like':
      // If show name is available and not generic, include it in the title.
      titleText = details?.showName && details.showName !== "a show" ? 
        <>Liked a review for <strong className="font-semibold">{showName}</strong>.</> : 
        "Liked a review.";
      break;
    case 'review_dislike':
      titleText = details?.showName && details.showName !== "a show" ? 
        <>Disliked a review for <strong className="font-semibold">{showName}</strong>.</> : 
        "Disliked a review.";
      break;
    case 'review_unlike':
      titleText = details?.showName && details.showName !== "a show" ? 
        <>Removed like from a review for <strong className="font-semibold">{showName}</strong>.</> : 
        "Removed like from a review.";
      break;
    case 'review_undislike':
      titleText = details?.showName && details.showName !== "a show" ? 
        <>Removed dislike from a review for <strong className="font-semibold">{showName}</strong>.</> : 
        "Removed dislike from a review.";
      break;
    case 'watchlist_add':
      titleText = <>Added <strong className="font-semibold">{showName}</strong> to watchlist.</>;
      break;
    case 'watchlist_remove':
      titleText = <>Removed <strong className="font-semibold">{showName}</strong> from watchlist.</>;
      break;
    case 'logout':
      titleText = "Logged out.";
      break;
    default:
      // Fallback title for unknown actions.
      titleText = `Performed an action: ${action}`;
  }

  /**
   * @function CardContent
   * @description An inner component that renders the main content of the activity card.
   * This is defined as a separate component to be reused whether the card is a Link or a div.
   * @returns {JSX.Element} The JSX for the card's content.
   */
  const CardContent = () => (
    // Main card container with styling.
    <div className="bg-[#282828] p-4 rounded-lg shadow-md w-full hover:bg-[#333333] transition-colors duration-200">
      {/* Flex container for layout (image on left, text on right). */}
      <div className="flex items-start space-x-3">
        {/* Conditionally render the show image if the action involves a show and an image is available. */}
        {( (action.includes('review_create') || action.includes('watchlist')) || 
           ( (action.includes('review_like') || action.includes('review_dislike') || action.includes('review_unlike') || action.includes('review_undislike')) && details?.showName && details.showName !== "a show" )
         ) && showImage !== defaultShowImage && (
          <img src={showImage} alt={showName} className="w-16 h-24 object-cover rounded-sm flex-shrink-0" />
        )}
        {/* Conditional rendering for review like/dislike actions when show details are minimal or image is default.
            Shows a generic review icon instead of a show poster. */}
        {(action.includes('review_like') || action.includes('review_dislike') || action.includes('review_unlike') || action.includes('review_undislike')) && (!details?.showName || details.showName === "a show" || showImage === defaultShowImage) && !action.includes('review_create') && !action.includes('watchlist') && (
          <div className="w-16 h-24 flex-shrink-0 bg-gray-700 rounded-sm flex items-center justify-center">
            {/* Generic review/comment SVG icon. */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </div>
        )}
        
        {/* Container for text content (title, specific content, timestamp). */}
        <div className="flex-1 min-w-0"> {/* `min-w-0` is important for flex items with truncation. */}
          {/* Activity title text, with multi-line truncation if necessary. */}
          <p className="text-base text-gray-200 truncate-multiline">{titleText}</p>
          {/* Dynamically rendered content specific to the action type. */}
          {content}
          {/* Formatted timestamp of the activity. */}
          <p className="text-xs text-gray-500 mt-2">{formatActivityTimestamp(createdAt)}</p>
        </div>
      </div>
    </div>
  );

  // If a `showLink` is defined, wrap the `CardContent` in a `Link` component.
  if (showLink) {
    return (
      <Link to={showLink} className="block w-full"> {/* `block w-full` ensures the link takes up the card space. */}
        <CardContent />
      </Link>
    );
  }

  // Otherwise, render `CardContent` directly (as a div).
  return <CardContent />;
};

// Export the ActivityCard component as the default export of this module.
export default ActivityCard;