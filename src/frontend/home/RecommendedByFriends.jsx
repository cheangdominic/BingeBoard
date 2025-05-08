import React from "react";
import TVShowCard from "../../components/TVShowCard.jsx";

function RecommendedByFriends() {
  const recentShows = [ // TODO: replace with real tv shows from db
    { imageUrl: "https://via.placeholder.com/300x450" },
    { imageUrl: "https://via.placeholder.com/300x450" },
    { imageUrl: "https://via.placeholder.com/300x450" },
    { imageUrl: "https://via.placeholder.com/300x450" },
    { imageUrl: "https://via.placeholder.com/300x450" },
  ];

  return (
    <section className="ml-3 mt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl text-white font-bold">Recommended By Friends</h3>
        <a href="/profile/recommended-by-friends" className="text-sm font-semibold mr-4 text-white hover:underline">
          View All
        </a>
      </div>

      <div className="flex overflow-x-auto space-x-4 pb-2 scroll-smooth">
        {recentShows.map((show, index) => (
          <div key={index} className="flex-shrink-0">
            <TVShowCard imageUrl={show.imageUrl} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default RecommendedByFriends;