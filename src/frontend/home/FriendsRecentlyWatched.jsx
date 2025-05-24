/**
 * @file FriendsRecentlyWatched.js
 * @description A React component that displays a horizontally scrolling carousel
 * of TV shows recently watched by the user's friends. Currently uses placeholder data.
 */

// Import React for creating the component.
import React from "react";
// Import the TVShowCard component to display individual show posters.
import TVShowCard from "../../components/TVShowCard.jsx";

/**
 * @function FriendsRecentlyWatched
 * @description A React functional component that renders a section showcasing
 * TV shows recently watched by friends. This component uses placeholder data
 * and is intended to be updated with real data from a database.
 *
 * @returns {JSX.Element} The rendered FriendsRecentlyWatched component.
 */
function FriendsRecentlyWatched() {
  // Placeholder data for recently watched shows.
  // TODO: Replace this with actual data fetched from a database or API.
  // Each object should ideally include more details like show ID, title, etc.
  const recentShows = [
    { imageUrl: "https://via.placeholder.com/300x450" }, // Placeholder image
    { imageUrl: "https://via.placeholder.com/300x450" },
    { imageUrl: "https://via.placeholder.com/300x450" },
    { imageUrl: "https://via.placeholder.com/300x450" },
    { imageUrl: "https://via.placeholder.com/300x450" },
    { imageUrl: "https://via.placeholder.com/300x450" },
    { imageUrl: "https://via.placeholder.com/300x450" },
    { imageUrl: "https://via.placeholder.com/300x450" },
    { imageUrl: "https://via.placeholder.com/300x450" },
    { imageUrl: "https://via.placeholder.com/300x450" },
    { imageUrl: "https://via.placeholder.com/300x450" },
    { imageUrl: "https://via.placeholder.com/300x450" },
    { imageUrl: "https://via.placeholder.com/300x450" },
    { imageUrl: "https://via.placeholder.com/300x450" },
    { imageUrl: "https://via.placeholder.com/300x450" },
  ];

  return (
    // Main section container with margin.
    <section className="ml-3 mt-4">
      {/* Header for the section, including a title and a "View All" link. */}
      <div className="flex justify-between items-center mb-4">
        {/* Section title. */}
        <h3 className="text-xl text-white font-bold">Friends Recently Watched</h3>
        {/* "View All" link, currently a simple anchor tag. Should ideally use <Link> from react-router-dom. */}
        <a href="/profile/friends-recently-watched" className="text-sm font-semibold mr-4 text-white hover:underline">
          View All
        </a>
      </div>

      {/* Horizontally scrollable container for the TV show cards.
          `overflow-x-auto` enables horizontal scrolling if content exceeds width.
          `space-x-4` adds spacing between cards.
          `pb-2` adds padding at the bottom (might be for scrollbar visibility or aesthetics).
          `scroll-smooth` enables smooth scrolling behavior (browser dependent). */}
      <div className="flex overflow-x-auto space-x-4 pb-2 scroll-smooth">
        {/* Map over the `recentShows` array to render a TVShowCard for each show. */}
        {recentShows.map((show, index) => (
          // `flex-shrink-0` prevents cards from shrinking if the container is too small.
          <div key={index} className="flex-shrink-0">
            {/* TVShowCard component, passing the image URL.
                Ideally, other props like title, cardWidth, etc., would also be passed. */}
            <TVShowCard imageUrl={show.imageUrl} />
          </div>
        ))}
      </div>
    </section>
  );
}

// Export the FriendsRecentlyWatched component as the default export of this module.
export default FriendsRecentlyWatched;