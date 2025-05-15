import { useState } from 'react';
import { Apple, Flame } from 'lucide-react';

export default function ReviewCard({ review, onVote, currentUserId }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const userLiked = Array.isArray(review.likes) && 
    review.likes.some(id => id === currentUserId || id.toString() === currentUserId);
  const userDisliked = Array.isArray(review.dislikes) && 
    review.dislikes.some(id => id === currentUserId || id.toString() === currentUserId);
  
  const isCurrentUser = review.userId === currentUserId;

  return (
    <div className="bg-[#333333] rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.25)] mb-6 transition-all hover:shadow-[0_6px_16px_rgba(0,0,0,0.3)]">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-lg font-semibold text-white">{review.username}</h4>
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
        <p className={`text-gray-200 ${isExpanded ? '' : 'line-clamp-3'}`}>
          {review.content}
        </p>
        {review.content && review.content.length > 200 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-400 hover:text-blue-300 text-sm mt-1 font-medium"
          >
            {isExpanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>

      {review.containsSpoiler && (
        <div className="bg-[#3a3a3a] p-3 rounded-lg mb-4 border-l-4 border-yellow-400">
          <p className="text-yellow-400 font-medium flex items-center">
            <span className="mr-2">⚠️</span> 
            <span>Spoiler Warning</span>
          </p>
        </div>
      )}

      <div className="flex justify-between items-center pt-3 border-t border-[#3a3a3a]">
        <div className="flex space-x-4">
          <button
            onClick={() => onVote(review._id || review.id, 'like')}
            className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors ${userLiked ? 'bg-blue-900/30 text-blue-400' : 'text-gray-400 hover:bg-[#3a3a3a] hover:text-blue-400'}`}
            disabled={isCurrentUser}
          >
            <Flame className="w-5 h-5" />
            <span className="font-medium">
              {Array.isArray(review.likes) ? review.likes.length : 0}
            </span>
          </button>
          
          <button
            onClick={() => onVote(review._id || review.id, 'dislike')}
            className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors ${userDisliked ? 'bg-red-900/30 text-red-400' : 'text-gray-400 hover:bg-[#3a3a3a] hover:text-red-400'}`}
            disabled={isCurrentUser}
          >
            <Flame className="w-5 h-5 rotate-180" />
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
  );
}