import React, { useState } from "react";
import TVShowCard from "./TVShowCard";

function ReviewCard({ user, date, reviewText, rating, imageUrl }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex-shrink-0 w-[300px] bg-[#234345] rounded-lg p-4 flex sm:flex-row justify-between gap-4 shadow">
      {/* Left side */}
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1">
          <img
            src={user.profilePhoto}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="text-white font-semibold text-sm">{user.username}</p>
            <p className="text-gray-400 text-xs">{date}</p>
          </div>
        </div>

        {/* Review Text */}
        <p className={`text-[#ECE6DD] text-sm mb-2 ${!expanded ? "line-clamp-1" : ""}`}>
            {reviewText}
        </p>

        {/* Stars */}
        <div className="flex text-yellow-400 text-lg">
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i}>{i < rating ? "★" : "☆"}</span>
          ))}
        </div>
      </div>

      {/* Right side: Small TV Show Card */}
      <div className="flex-shrink-0">
        <TVShowCard imageUrl={imageUrl} size="sm" />
      </div>
    </div>
  );
}

export default ReviewCard;