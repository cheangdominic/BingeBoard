/**
 * @file RecentReviews.jsx
 * @description A React component that displays a horizontally scrolling carousel of recent reviews
 * written by a specific user (either the authenticated user or another user whose profile is being viewed).
 */

// Import React and hooks (useEffect, useState) for component logic.
import React, { useEffect, useState } from "react";
// Import ReviewCard component to display individual reviews.
import ReviewCard from "../../components/ReviewCard";
// Import useAuth custom hook to access authentication context (current user data).
import { useAuth } from "../../context/AuthContext.jsx";
// Import useNavigate hook from react-router-dom for programmatic navigation.
import { useNavigate } from "react-router-dom";
// Import LoadingSpinner component to display while data is being fetched.
import LoadingSpinner from "../../components/LoadingSpinner.jsx";

/**
 * @function RecentReviews
 * @description A React functional component that fetches and displays a user's recent reviews.
 * It can display reviews for the currently logged-in user or another user based on props.
 *
 * @param {object} props - The properties passed to the component.
 * @param {string} [props.userId] - The ID of the user whose reviews are to be displayed.
 *                                  (Note: This prop is passed but the API call primarily uses `username` or `/api/user/reviews`).
 * @param {string} [props.username] - The username of the user whose reviews are to be displayed.
 *                                   Used to construct the API endpoint if `isOwnProfile` is false.
 * @param {boolean} [props.isOwnProfile] - Flag indicating if the reviews are for the authenticated user's own profile.
 *                                       If true, uses a specific API endpoint.
 * @returns {JSX.Element} The rendered RecentReviews component.
 */
function RecentReviews({ userId, username, isOwnProfile }) {
  // State to store the array of fetched reviews.
  const [reviews, setReviews] = useState([]);
  // State to track loading status.
  const [loading, setLoading] = useState(true);
  // State to store any error messages during data fetching.
  const [error, setError] = useState(null);
  // Get the authenticated user from AuthContext.
  const { user: authUser } = useAuth();
  // Hook for programmatic navigation.
  const navigate = useNavigate();

  /**
   * `useEffect` hook to fetch recent reviews when the component mounts or when relevant props change.
   */
  useEffect(() => {
    /**
     * Asynchronous function to fetch reviews from the API.
     * The API endpoint depends on whether `isOwnProfile` is true or a `username` is provided.
     * @async
     */
    const fetchReviews = async () => {
      try {
        setLoading(true); // Set loading state.
        let url; // Variable to hold the API endpoint URL.
        
        // Determine the API URL based on `isOwnProfile` and `username`.
        if (isOwnProfile) {
          // If it's the authenticated user's own profile, use the dedicated endpoint.
          url = '/api/user/reviews';
        } else {
          // If viewing another user's profile, use the endpoint with their username.
          url = `/api/users/${username}/reviews`;
        }
        
        // Fetch reviews from the determined URL.
        // `credentials: "include"` sends cookies (for session authentication if needed by the 'own profile' endpoint).
        const response = await fetch(url, {
          credentials: "include"
        });

        // If the response is not OK, attempt to parse error and throw.
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({})); // Fallback if JSON parsing fails.
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        // Parse successful response as JSON.
        const data = await response.json();
        // Set the reviews state with the first 3 reviews from the fetched data.
        // The backend might return more; this component slices to show only a few in the carousel.
        setReviews(data.slice(0, 3));
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setError(err.message); // Set error message.
      } finally {
        setLoading(false); // Set loading to false.
      }
    };

    // Fetch reviews only if a `username` is provided (or implicitly if `isOwnProfile` leads to a valid user context).
    // The `isOwnProfile` logic in `url` determination relies on `authUser` potentially.
    // A check for `authUser` might be needed if `/api/user/reviews` strictly requires authentication.
    if (username || isOwnProfile) { // Ensure either username is present (for others) or it's own profile
      fetchReviews();
    } else {
        setLoading(false); // If no identifier, don't attempt fetch.
    }
  }, [userId, username, isOwnProfile, authUser]); // Dependencies for the effect. `authUser` added for `isOwnProfile` scenario.

  // If loading, display a small loading spinner.
  if (loading) {
    // The `small` prop for LoadingSpinner is not standard; assuming it's a custom prop.
    return <LoadingSpinner small={true} />;
  }

  // If an error occurred, display the error message.
  if (error) {
    return <div className="text-red-500">Error loading reviews: {error}</div>;
  }

  // If no reviews are found (after loading and no error).
  if (reviews.length === 0) {
    return (
      <section>
        {/* Section header with dynamic title. */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">
            {isOwnProfile ? 'Recent Reviews' : `${username}'s Recent Reviews`}
          </h3>
          {/* "View All" button, shown only if it's the user's own profile.
              Navigates to the '/activity' page which might show all activities including reviews. */}
          {isOwnProfile && (
            <button
              onClick={() => navigate('/activity')}
              className="text-sm text-blue-400 hover:underline"
            >
              View All
            </button>
          )}
        </div>
        {/* Message indicating no reviews are available. */}
        <div className="text-gray-400">
          {isOwnProfile 
            ? "You haven't written any reviews yet." 
            : `${username} hasn't written any reviews yet.`
          }
        </div>
      </section>
    );
  }

  // Main render for when reviews are available.
  return (
    <section>
      {/* Section header. */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">
          {isOwnProfile ? 'Recent Reviews' : `${username}'s Recent Reviews`}
        </h3>
        {isOwnProfile && (
          <button
            onClick={() => navigate('/activity')} // Navigate to a page showing all activities/reviews.
            className="text-sm text-blue-400 hover:underline"
          >
            View All
          </button>
        )}
      </div>

      {/* Horizontally scrollable container for review cards. */}
      <div className="flex overflow-x-auto space-x-4 pb-2 scroll-smooth">
        {/* Map over the `reviews` array to render a ReviewCard for each. */}
        {reviews.map((review) => (
          // Wrapper div for each ReviewCard with fixed width for carousel layout.
          <div key={review._id} className="flex-shrink-0 w-[300px]">
            <ReviewCard
              // Pass props to ReviewCard, formatting data as needed.
              user={{ // User object for the review author.
                username: review.username || username || "Anonymous", // Use review's username, then profile username, then fallback.
                // Profile picture logic: use authUser's pic if own profile, otherwise review's userProfilePic, then default.
                profilePhoto: (isOwnProfile ? authUser?.profilePic : review.userProfilePic) || "/img/profilePhotos/generic_profile_picture.jpg",
              }}
              // Format review creation date.
              date={new Date(review.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
              reviewText={review.content}
              rating={review.rating}
              // Construct image URL for the show poster or use a fallback.
              imageUrl={review.posterPath ? `https://image.tmdb.org/t/p/w300${review.posterPath}` : "/img/no-poster.png"}
              showName={review.showName}
              showId={review.showId}
              containsSpoiler={review.containsSpoiler}
              // Note: Like/dislike counts and actions (onVote) are not passed here,
              // implying this instance of ReviewCard might be display-only for votes
              // or these props are optional in ReviewCard.
            />
          </div>
        ))}
      </div>
    </section>
  );
}

// Export the RecentReviews component as the default export of this module.
export default RecentReviews;