/**
 * @file PopularReviews.jsx
 * @description A React component that displays a horizontally scrolling carousel of popular reviews.
 * Currently uses placeholder data for the reviews.
 */

// Import React for creating the component.
import React from "react";
// Import the ReviewCard component to display individual reviews.
import ReviewCard from "../../components/ReviewCard"; // Assuming ReviewCard is in a components directory two levels up.

/**
 * @function PopularReviews
 * @description A React functional component that renders a section showcasing popular reviews.
 * This component uses placeholder data and is intended to be updated with real data
 * fetched from a database or API.
 *
 * @returns {JSX.Element} The rendered PopularReviews component.
 */
function PopularReviews() {
  // Placeholder data for popular reviews.
  // TODO: Replace this with actual data fetched from a database or API.
  // Each review object should match the props expected by the `ReviewCard` component.
  const reviews = [
    {
      user: { // User who wrote the review
        username: "@johndoe",
        profilePhoto: "/profilePhotos/generic_profile_picture.jpg", // Path to user's profile picture
      },
      date: "May 6, 2025", // Date of the review
      reviewText: "This show completely changed the way I think about reality. The third episode was wild and then...", // Content of the review
      rating: 4, // Rating given (e.g., out of 5)
      imageUrl: "https://via.placeholder.com/300x450", // Image URL of the reviewed show's poster
    },
    {
      user: {
        username: "@johndoe",
        profilePhoto: "/profilePhotos/generic_profile_picture.jpg",
      },
      date: "May 5, 2025",
      reviewText: "A solid show overall, but I felt like the finale didn’t land as hard as it could’ve. Still worth watching though...",
      rating: 3,
      imageUrl: "https://via.placeholder.com/300x450",
    },
    {
      user: {
        username: "@johndoe",
        profilePhoto: "/profilePhotos/generic_profile_picture.jpg",
      },
      date: "May 5, 2025",
      reviewText: "A solid show overall, but I felt like the finale didn’t land as hard as it could’ve. Still worth watching though...",
      rating: 3,
      imageUrl: "https://via.placeholder.com/300x450",
    },
    {
      user: {
        username: "@johndoe",
        profilePhoto: "/profilePhotos/generic_profile_picture.jpg",
      },
      date: "May 5, 2025",
      reviewText: "A solid show overall, but I felt like the finale didn’t land as hard as it could’ve. Still worth watching though...",
      rating: 3,
      imageUrl: "https://via.placeholder.com/300x450",
    },
    {
      user: {
        username: "@johndoe",
        profilePhoto: "/profilePhotos/generic_profile_picture.jpg",
      },
      date: "May 5, 2025",
      reviewText: "A solid show overall, but I felt like the finale didn’t land as hard as it could’ve. Still worth watching though...",
      rating: 3,
      imageUrl: "https://via.placeholder.com/300x450",
    },
  ];

  return (
    // Main section container.
    <section>
      {/* Header for the section, including a title and a "View All" link. */}
      <div className="flex justify-between items-center mb-4 pl-4 mr-2">
        {/* Section title. */}
        <h3 className="text-xl font-bold text-white pl-1">Popular Reviews</h3>
        {/* "View All" link. Currently a simple anchor tag, should ideally use <Link> from react-router-dom. */}
        <a href="/profile/recent-reviews" className="text-sm text-blue-400 font-semibold hover:underline">
          View All
        </a>
      </div>

      {/* Horizontally scrollable container for the review cards.
          `overflow-x-auto` enables horizontal scrolling if content exceeds width.
          `space-x-4` adds spacing between cards.
          `pb-2` adds padding at the bottom (might be for scrollbar visibility or aesthetics).
          `scroll-smooth` enables smooth scrolling behavior (browser dependent).
          `pl-4 mr-2` provides horizontal padding/margin for the scrollable area. */}
      <div className="flex overflow-x-auto space-x-4 pb-2 scroll-smooth pl-4 mr-2">
        {/* Map over the `reviews` array to render a ReviewCard for each review. */}
        {reviews.map((review, index) => (
          // Wrapper div for each ReviewCard.
          // `flex-shrink-0` prevents cards from shrinking if the container is too small.
          // `w-[300px]` sets a fixed width for each card in the carousel.
          <div key={index} className="flex-shrink-0 w-[300px]">
            {/* ReviewCard component, spreading the properties from the `review` object. */}
            <ReviewCard {...review} />
          </div>
        ))}
      </div>
    </section>
  );
}

// Export the PopularReviews component as the default export of this module.
export default PopularReviews;