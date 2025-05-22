import React, { useEffect, useState } from "react";
import ReviewCard from "../../components/ReviewCard";
import { useAuth } from "../../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";

function RecentReviews({ userId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user: authUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/user/reviews', {
          credentials: "include"
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setReviews(data.slice(0, 3));
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [userId]); 

  if (loading) {
    return <LoadingSpinner small={true} />;
  }

  if (error) {
    return <div className="text-red-500">Error loading reviews: {error}</div>;
  }

  if (reviews.length === 0) {
    return (
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Recent Reviews</h3>
          <button
            onClick={() => navigate('/activity')}
            className="text-sm text-blue-400 hover:underline"
          >
            View All
          </button>
        </div>
        <div className="text-gray-400">
          You haven't written any reviews yet.
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold pl-4">Recent Reviews</h3>
        <button
          onClick={() => navigate('/activity')}
          className="text-sm text-blue-400 hover:underline"
        >
          View All
        </button>
      </div>

      <div className="flex overflow-x-auto space-x-4 pb-2 scroll-smooth">
        {reviews.map((review) => (
          <div key={review._id} className="flex-shrink-0 w-[300px]">
            <ReviewCard
              user={{
                username: review.username || authUser?.username || "Anonymous",
                profilePhoto: authUser?.profilePic || "/img/profilePhotos/generic_profile_picture.jpg",
              }}
              date={new Date(review.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
              reviewText={review.content}
              rating={review.rating}
              imageUrl={review.posterPath ? `https://image.tmdb.org/t/p/w300${review.posterPath}` : "/img/no-poster.png"}
              showName={review.showName}
              showId={review.showId}
              containsSpoiler={review.containsSpoiler}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export default RecentReviews;