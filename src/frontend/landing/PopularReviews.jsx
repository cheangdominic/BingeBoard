import React from "react";
import ReviewCard from "../../components/ReviewCard";

function PopularReviews() {
  const reviews = [ // TODO: replace placeholder cards with reviews from db
    {
      user: {
        username: "@johndoe",
        profilePhoto: "/profilePhotos/generic_profile_picture.jpg",
      },
      date: "May 6, 2025",
      reviewText: "This show completely changed the way I think about reality. The third episode was wild and then...",
      rating: 4,
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
    <section>
      <div className="flex justify-between items-center mb-4 pl-4 mr-2">
        <h3 className="text-xl font-bold text-white">Popular Reviews</h3>
        <a href="/profile/recent-reviews" className="text-sm text-blue-400 hover:underline">
          View All
        </a>
      </div>

      <div className="flex overflow-x-auto space-x-4 pb-2 scroll-smooth pl-4 mr-2">
        {reviews.map((review, index) => (
          <div key={index} className="flex-shrink-0 w-[300px]">
            <ReviewCard {...review} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default PopularReviews;