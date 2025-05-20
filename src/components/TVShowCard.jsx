import React from "react";
import AppleRating from "./AppleRating";

function TVShowCard({ imageUrl, title, cardWidth, averageRating }) {
  return (
    <div className="relative group w-full" style={{ width: cardWidth }}>
      <img
        src={imageUrl || "/fallback-image.jpg"}
        alt={title}
        className="w-full rounded-lg object-cover"
      />

      <div
        className="
          absolute bottom-0 left-0 right-0 
          h-0 group-hover:h-1/3 
          bg-black/70 text-white 
          flex items-center justify-center 
          transition-all duration-300 ease-in-out
          rounded-b-lg
          overflow-hidden
        "
      >
        <AppleRating rating={averageRating ? averageRating / 2 : 0} />
      </div>
    </div>
  );
}

export default TVShowCard;
