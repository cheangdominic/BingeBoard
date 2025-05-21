import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow, format, isValid, parseISO } from 'date-fns';
import AppleRating from '../../components/AppleRating';

const formatActivityTimestamp = (timestamp) => {
  const date = parseISO(timestamp);
  if (!isValid(date)) {
    return "Invalid date";
  }
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return formatDistanceToNow(date, { addSuffix: true });
  } else {
    return format(date, 'MMM d, yyyy');
  }
};

const ActivityCard = ({ activity }) => {
  const { action, details, createdAt, targetId } = activity;

  let content = null;
  let titleText = "";
  let showLink = null;

  const defaultShowImage = "https://via.placeholder.com/100x150?text=No+Image";
  const showImage = details?.showImage || defaultShowImage;
  const showName = details?.showName || "a show";
  
  const canLinkToShow = action === 'review_create' || action === 'watchlist_add' || action === 'watchlist_remove';
  if (canLinkToShow && targetId) {
    showLink = `/show/${targetId}`;
  }


  switch (action) {
    case 'account_creation':
      titleText = "Created an account.";
      break;
    case 'login':
      titleText = "Logged in.";
      break;
    case 'profile_update':
      titleText = `Updated profile ${details?.field ? `(${details.field})` : ''}.`;
      if (details?.profilePhoto) {
        content = (
          <img src={details.profilePhoto} alt="New Profile Pic" className="w-16 h-16 rounded-full object-cover mt-2" />
        );
      }
      break;
    case 'review_create':
      titleText = <>Wrote a review for <strong className="font-semibold">{showName}</strong>.</>;
      content = (
        <div className="mt-2 text-sm text-gray-400">
          {details.rating && <AppleRating rating={details.rating} />}
          <p className="mt-1 line-clamp-3">{details.content}</p>
        </div>
      );
      break;
    case 'review_like':
      titleText = "Liked a review.";
      break;
    case 'review_dislike':
      titleText = "Disliked a review.";
      break;
    case 'review_unlike':
      titleText = "Removed like from a review.";
      break;
    case 'review_undislike':
      titleText = "Removed dislike from a review.";
      break;
    case 'watchlist_add':
      titleText = <>Added <strong className="font-semibold">{showName}</strong> to watchlist.</>;
      break;
    case 'watchlist_remove':
      titleText = <>Removed <strong className="font-semibold">{showName}</strong> from watchlist.</>;
      break;
    default:
      titleText = `Performed an action: ${action}`;
  }

  const CardContent = () => (
    <div className="bg-[#282828] p-4 rounded-lg shadow-md w-full max-w-xl hover:bg-[#333] transition-colors duration-200">
      <div className="flex items-start space-x-3">
        {(action.includes('review_create') || action.includes('watchlist')) && canLinkToShow && (
          <img src={showImage} alt={showName} className="w-16 h-24 object-cover rounded-sm flex-shrink-0" />
        )}
         {(action.includes('review_like') || action.includes('review_dislike') || action.includes('review_unlike') || action.includes('review_undislike')) && !canLinkToShow ? (
          <div className="w-16 h-24 flex-shrink-0 bg-gray-700 rounded-sm flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </div>
        ) : null}
         {(action.includes('review_like') || action.includes('review_dislike') || action.includes('review_unlike') || action.includes('review_undislike')) && canLinkToShow && (
           <img src={showImage} alt={showName} className="w-16 h-24 object-cover rounded-sm flex-shrink-0" />
         )}


        <div className="flex-1">
          <p className="text-base text-gray-200">{titleText}</p>
          {content}
          <p className="text-xs text-gray-500 mt-2">{formatActivityTimestamp(createdAt)}</p>
        </div>
      </div>
    </div>
  );

  if (showLink) {
    return (
      <Link to={showLink} className="block w-full max-w-xl">
        <CardContent />
      </Link>
    );
  }

  return <CardContent />;
};

export default ActivityCard;