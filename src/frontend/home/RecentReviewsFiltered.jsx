  import React, { useState } from "react";
  import ReviewCard from "../../components/ReviewCard";
  
  function RecentReviewsFiltered() {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState("Friends");
  
    const filterOptions = ["Friends", "Connections", "Most Liked"];
    const otherOptions = filterOptions.filter(opt => opt !== selectedFilter);
  
    const reviews = [{
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
    },];
  
    const handleFilterSelect = (option) => {
      setSelectedFilter(option);
      setIsFilterOpen(false);
    };
  
    return (
      <section className="ml-3 mt-4">
        <div className="flex items-center mb-4 gap-2.5">
          <h3 className="text-xl text-white font-bold">Recent Reviews By</h3>
          <div className="relative flex items-center gap-2">
            <button
              onClick={() => setIsFilterOpen(prev => !prev)}
              className="bg-white text-gray-900 px-3 py-1.5 rounded-md font-semibold text-sm shadow hover:bg-gray-100 transition"
            >
              {selectedFilter}
            </button>
  
            {isFilterOpen && (
              <div className="flex gap-2">
                {otherOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleFilterSelect(option)}
                    className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md text-sm hover:bg-gray-200 transition"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
  
        <div className="flex overflow-x-auto space-x-4 pb-2 mr-3 scroll-smooth rounded-md">
          {reviews.map((review, index) => (
            <div key={index} className="flex-shrink-0 w-[300px]">
              <ReviewCard {...review} />
            </div>
          ))}
        </div>
      </section>
    );
  }
  
  export default RecentReviewsFiltered;
  
