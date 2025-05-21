import React from "react";
import TVShowCard from "../../components/TVShowCard";

function RecentlyWatched() {
  const recentShows = [ // TODO: replace with real tv shows from db
    { imageUrl: "https://via.placeholder.com/300x450" },
    { imageUrl: "https://via.placeholder.com/300x450" },
    { imageUrl: "https://via.placeholder.com/300x450" },
    { imageUrl: "https://via.placeholder.com/300x450" },
    { imageUrl: "https://via.placeholder.com/300x450" },
  ];

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Recently Watched</h3>
        <a href="/profile/recently-watched" className="text-sm text-blue-400 hover:underline">
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

export default RecentlyWatched;