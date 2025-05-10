import React from "react";

function TVShowCard({ imageUrl, size = "md" }) {
  const sizes = {
    sm: "w-[72px] h-[108px]",
    md: "w-[120px] h-[180px]",
  };

  return (
    <div className={`flex-shrink-0 ${sizes[size]} rounded-lg overflow-hidden shadow bg-[#2E2E2E]`}>
      <img
        src={imageUrl}
        alt="TV Show Poster"
        className="w-full h-full object-cover"
      />
    </div>
  );
}

export default TVShowCard;