import React, { useState } from 'react';
import { Apple } from 'lucide-react';

export default function ReviewCard({ 
  user, 
  date, 
  reviewText, 
  rating, 
  imageUrl,
  showName,
  showId,
  containsSpoiler
}) {
  const [expanded, setExpanded] = useState(false);

  const renderAppleRating = (rating) => {
    return (
      <div className="flex items-center mt-1 space-x-1">
        {[...Array(5)].map((_, i) => (
          <Apple
            key={i}
            className={`w-5 h-5 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'}`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-400">{rating}/5</span>
      </div>
    );
  };

  return (
    <div className="flex-shrink-0 w-[300px] h-[500px] bg-[#2a2a2a] rounded-lg p-4 flex flex-col shadow-lg">
      {/* User info */}
      <div className="flex items-center gap-3 h-16">
        <img 
          src={user.profilePhoto} 
          alt={user.username}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <p className="text-white font-semibold">@{user.username}</p>
          <p className="text-gray-400 text-xs">{date}</p>
        </div>
      </div>

      {/* Spoiler warning - Optional section */}
      <div className="h-8">
        {containsSpoiler && (
          <div className="bg-yellow-900 text-yellow-200 text-xs px-2 py-1 rounded self-start">
            Contains Spoilers
          </div>
        )}
      </div>

      {/* Rating */}
      <div className="h-8 my-1">
        {renderAppleRating(rating)}
      </div>

      {/* Review text */}
      <div className="h-20 overflow-y-auto mb-2">
        <p className="text-gray-300 text-sm">
          {reviewText}
        </p>
      </div>
      
      {/* Show info */}
      <div className="h-8 mb-2">
        {showName && (
          <p className="text-white font-medium text-sm truncate">{showName}</p>
        )}
      </div>
      
      {/* Show image */}
      <div className="flex-grow mt-auto overflow-hidden rounded-lg">
        <img 
          src={imageUrl} 
          alt={showName || "Show poster"} 
          className="w-full h-64 object-cover rounded-lg"
        />
      </div>
    </div>
  );
}