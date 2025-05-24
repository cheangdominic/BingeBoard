/**
 * @file FriendRequestsPage.jsx
 * @description A React component that displays a list of pending friend requests for the logged-in user.
 * It allows the user to accept or decline these requests.
 */

// Import React and hooks (useState, useEffect) for component logic.
import React, { useState, useEffect } from 'react';
// Import axios for making HTTP requests.
import axios from 'axios';
// Import Link component from react-router-dom for navigation.
import { Link } from 'react-router-dom';
// Import `useAuth` custom hook to access authentication context, specifically the `refreshUser` function.
import { useAuth } from '../../context/AuthContext';
// Import BottomNavbar component for consistent navigation.
import BottomNavbar from "../../components/BottomNavbar.jsx";

/**
 * @function FriendRequestsPage
 * @description A React functional component that fetches and displays pending friend requests.
 * Users can accept or decline requests, which updates the UI and potentially the user's auth context.
 *
 * @returns {JSX.Element} The rendered FriendRequestsPage component.
 */
export default function FriendRequestsPage() {
  /**
   * State variable to store the array of friend request objects.
   * Each object typically contains user details of the requester.
   * @type {[Array<object>, function(Array<object>): void]}
   */
  const [requests, setRequests] = useState([]);
  /**
   * State variable to track the loading status of the API request for friend requests.
   * @type {[boolean, function(boolean): void]}
   */
  const [loading, setLoading] = useState(true);
  /**
   * `refreshUser` function from the AuthContext.
   * Used to update the authenticated user's data (e.g., friends list) after accepting/declining a request.
   * @type {function}
   */
  const { refreshUser } = useAuth(); // ✅ bring in refreshUser

  /**
   * `useEffect` hook to fetch pending friend requests when the component mounts.
   */
  useEffect(() => {
    /**
     * Asynchronous function to fetch friend requests from the API.
     * @async
     */
    const fetchRequests = async () => {
      try {
        // Make a GET request to the `/api/friends/requests` endpoint.
        // `withCredentials: true` ensures cookies (for session authentication) are sent.
        const res = await axios.get('/api/friends/requests', { withCredentials: true });
        // Update the `requests` state with the data received from the API.
        setRequests(res.data);
      } catch (err) {
        // Log any errors that occur during the fetch operation.
        console.error('Failed to load friend requests:', err);
        // Optionally, set an error state here to display a message to the user.
      } finally {
        // Set loading state to false after the API request is complete (success or failure).
        setLoading(false);
      }
    };

    fetchRequests();
  }, []); // Empty dependency array: run only on mount.

  /**
   * Handles accepting a friend request.
   * Sends a POST request to the backend and updates the UI and user context on success.
   * @async
   * @param {string} userId - The ID of the user whose friend request is being accepted.
   */
  const handleAccept = async (userId) => {
    try {
      // Make a POST request to the `/api/friends/accept/:userId` endpoint.
      await axios.post(`/api/friends/accept/${userId}`, {}, { withCredentials: true });
      // Remove the accepted request from the local `requests` state to update the UI immediately.
      setRequests(prev => prev.filter(user => user._id !== userId));
      // Refresh the authenticated user's data in the AuthContext.
      // This ensures changes (like an updated friends list) are reflected globally.
      await refreshUser();
    } catch (err) {
      // Log any errors that occur during the accept operation.
      console.error('Accept failed:', err);
      // Optionally, display an error message to the user.
    }
  };

  /**
   * Handles declining a friend request.
   * Sends a POST request to the backend and updates the UI.
   * (Note: The current backend route for decline might not exist or might be `/api/friends/reject/:userId`.
   * This function assumes `/api/friends/decline/:userId`.)
   * @async
   * @param {string} userId - The ID of the user whose friend request is being declined.
   */
  const handleDecline = async (userId) => {
    try {
      // Make a POST request to the `/api/friends/decline/:userId` endpoint.
      // Ensure this endpoint exists and handles declining requests appropriately on the backend.
      await axios.post(`/api/friends/decline/${userId}`, {}, { withCredentials: true });
      // Remove the declined request from the local `requests` state.
      setRequests(prev => prev.filter(user => user._id !== userId));
      // Refresh user data if declining a request also affects the user's state (e.g., received requests count).
      await refreshUser();
    } catch (err) {
      // Log any errors.
      console.error('Decline failed:', err);
    }
  };

  // Render the friend requests page.
  return (
    <>
      {/* Main container for the page content. */}
      <div className="max-w-2xl mx-auto mt-8 text-white">
        {/* Page title. */}
        <h1 className="text-2xl font-bold mb-4">Friend Requests</h1>
        {/* Conditional rendering based on loading state and number of requests. */}
        {loading ? (
          // Display a loading message while data is being fetched.
          <p>Loading…</p>
        ) : requests.length === 0 ? (
          // Display a message if there are no pending friend requests.
          <p className="text-gray-400">No friend requests.</p>
        ) : (
          // If requests exist, render them as an unordered list.
          <ul className="space-y-4">
            {/* Map over the `requests` array to render each request. */}
            {requests.map((user) => (
              <li key={user._id} className="flex items-center justify-between bg-[#333] p-4 rounded">
                {/* Link to the requester's profile. */}
                <Link to={`/profile/${user.username}`} className="flex items-center space-x-3">
                  {/* Requester's profile picture with a fallback. */}
                  <img
                    src={user.profilePic || '/img/profilePhotos/generic_profile_picture.jpg'}
                    alt="Profile"
                    className="w-12 h-12 rounded-full"
                  />
                  {/* Requester's username. */}
                  <span className="text-lg font-semibold">@{user.username}</span>
                </Link>
                {/* Container for Accept and Decline buttons. */}
                <div className="space-x-2">
                  <button
                    onClick={() => handleAccept(user._id)}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleDecline(user._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Decline
                  </button>
                </div>
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