/**
 * @file FriendsListPage.jsx
 * @description A React component that displays the list of friends (connections) for a given user.
 * It fetches the friend list from an API based on the username provided in the URL parameters.
 */

// Import React and hooks (useEffect, useState) for component logic.
import React, { useEffect, useState } from 'react';
// Import axios for making HTTP requests.
import axios from 'axios';
// Import Link for client-side navigation, useParams to get URL parameters, and useNavigate for programmatic navigation.
import { Link, useParams, useNavigate } from 'react-router-dom';
// Import BottomNavbar component for consistent navigation across pages.
import BottomNavbar from '../../components/BottomNavbar';
// Import LoadingSpinner component to display while data is being fetched.
import LoadingSpinner from '../../components/LoadingSpinner';

/**
 * @function FriendsListPage
 * @description A React functional component that fetches and displays a list of a user's friends.
 * The username of the profile owner is taken from the URL parameters.
 * It handles loading and error states.
 *
 * @returns {JSX.Element} The rendered FriendsListPage component.
 */
export default function FriendsListPage() {
  /**
   * `username` from the URL parameters, indicating whose friends list to display.
   * @type {{username: string}}
   */
  const { username } = useParams();
  /**
   * State variable to store the array of friend objects.
   * @type {[Array<object>, function(Array<object>): void]}
   */
  const [friends, setFriends] = useState([]);
  /**
   * State variable to track the loading status of the API request.
   * @type {[boolean, function(boolean): void]}
   */
  const [loading, setLoading] = useState(true);
  /**
   * State variable to store any error messages if the API request fails.
   * @type {[string | null, function(string | null): void]}
   */
  const [error, setError] = useState(null);
  /**
   * State variable to store the profile information of the user whose friends are being listed.
   * @type {[object | null, function(object | null): void]}
   */
  const [profileUser, setProfileUser] = useState(null);
  /**
   * `useNavigate` hook for programmatic navigation.
   * @type {function}
   */
  const navigate = useNavigate();

  /**
   * `useEffect` hook to fetch the friends list and the profile user's data when the component mounts
   * or when the `username` parameter or `navigate` function changes.
   */
  useEffect(() => {
    /**
     * Asynchronous function to fetch friend data.
     * It first fetches the profile user's basic info (to display their username in the title)
     * and then fetches their list of friends.
     * @async
     */
    const fetchFriends = async () => {
      // If no username is provided in the URL, do nothing.
      if (!username) return;
      // Set loading state to true and clear any previous errors.
      setLoading(true);
      setError(null);
      try {
        // Fetch the profile user's data.
        const userRes = await axios.get(`/api/users/${username}`);
        setProfileUser(userRes.data.user); // Store the fetched user data.

        // Fetch the list of friends for the given username.
        const res = await axios.get(`/api/friends/list/${username}`);
        setFriends(res.data); // Store the fetched friends list.
      } catch (err) {
        // Log the error and set an error message for the UI.
        console.error(`Failed to load friends for ${username}:`, err);
        setError(`Failed to load friends. User may not exist or an error occurred.`);
        // If a 404 error occurs (user not found), navigate to a 404 page.
        if (err.response && err.response.status === 404) {
          navigate('/404');
        }
      } finally {
        // Set loading state to false after the API request is complete (success or failure).
        setLoading(false);
      }
    };

    fetchFriends();
  }, [username, navigate]); // Dependencies: re-run effect if `username` or `navigate` changes.

  // If data is currently being loaded, display a loading spinner.
  if (loading) {
    return (
      <>
        <div className="min-h-screen bg-[#1e1e1e] flex items-center justify-center">
          <LoadingSpinner />
        </div>
        <BottomNavbar />
      </>
    );
  }

  // If an error occurred during data fetching, display an error message.
  if (error) {
    return (
      <>
        <div className="min-h-screen bg-[#1e1e1e] text-white p-4 pt-8 text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-500">Error</h1>
          <p>{error}</p>
        </div>
        <BottomNavbar />
      </>
    );
  }

  // If loading is complete and no error, render the friends list.
  return (
    <>
      {/* Main container for the friends list page. */}
      <div className="min-h-screen bg-[#1e1e1e] text-white p-4 pt-8 pb-20">
        {/* Button to navigate back to the previous page (presumably the user's profile). */}
        <button onClick={() => navigate(-1)} className="mb-4 text-blue-400 hover:text-blue-300">
          ← Back to Profile
        </button>
        {/* Page title, dynamically displaying the username if `profileUser` data is available. */}
        <h1 className="text-3xl font-bold mb-6 text-center">
          {profileUser ? `@${profileUser.username}'s` : "User's"} Connections
        </h1>
        {/* Conditional rendering: Display a message if the user has no friends. */}
        {friends.length === 0 ? (
          <p className="text-gray-400 text-center">No connections yet.</p>
        ) : (
          // If friends exist, render them as an unordered list.
          <ul className="space-y-4">
            {/* Map over the `friends` array to render each friend as a list item. */}
            {friends.map((friend) => (
              <li
                key={friend._id} // Unique key for each friend.
                // Styling for the list item (card-like appearance).
                className="bg-[#2E2E2E] p-4 rounded-lg shadow-md hover:bg-[#3a3a3a] transition-colors w-full"
              >
                {/* Link each friend item to their respective profile page. */}
                <Link to={`/user/${friend.username}`} className="flex items-center space-x-4 w-full">
                  {/* Friend's profile picture with a fallback. */}
                  <img
                    src={friend.profilePic || '/img/profilePhotos/generic_profile_picture.jpg'}
                    alt={`${friend.username}'s profile`}
                    className="w-14 h-14 rounded-full object-cover border-2 border-gray-700"
                  />
                  {/* Friend's username. */}
                  <span className="text-lg font-semibold hover:text-blue-300">@{friend.username}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Bottom navigation bar. */}
      <BottomNavbar />
    </>
  );
}