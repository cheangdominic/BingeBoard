import React from "react";
import AppleRating from "./AppleRating";

function TVShowCard({ imageUrl, title, cardWidth, averageRating, onRemove }) {
  return (
    <div className="group relative" style={{ width: cardWidth }}>
      <div className="relative rounded-lg overflow-hidden">
        <img
          src={imageUrl || "/fallback-image.jpg"}
          alt={title}
          className="w-full object-cover rounded-lg"
        />

        <div
          className="
            absolute top-0 left-0 right-0
            bg-[#4a4a4a]/80
            text-white
            text-center
            text-sm
            py-1
            rounded-t-lg
            opacity-0 group-hover:opacity-100
            transition-all duration-300
            transform -translate-y-full group-hover:translate-y-0
            z-20
            truncate
            px-3
            whitespace-nowrap
          "
          title={title}
        >
          {title}
        </div>

       
        <div
          className="
            absolute bottom-0 left-0 right-0
            bg-black/70 text-white
            flex items-center justify-center
            py-1 text-xs
            opacity-0 group-hover:opacity-100
            transition-all duration-300
            transform translate-y-full group-hover:translate-y-0
            z-10
          "
        >
          <AppleRating rating={averageRating ? averageRating / 2 : 0} />
        </div>
      </div>
    </div>
  );
}

export default TVShowCard;
