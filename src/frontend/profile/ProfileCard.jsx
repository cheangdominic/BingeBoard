/**
 * @file ProfileCard.jsx
 * @description A React component that displays a user's profile information in a card format.
 * It shows the user's avatar, username, number of friends, and provides actions
 * like viewing friend requests/settings (for own profile) or sending a friend request (for other profiles).
 */

// Import React and hooks (useState) for component logic.
import React, { useState } from 'react';
// Import axios for making HTTP requests (e.g., to send friend requests).
import axios from 'axios';
// Import Link component from react-router-dom for navigation.
import { Link } from 'react-router-dom';
// Import `useAuth` custom hook to access authentication context (current user data and refresh function).
import { useAuth } from '../../context/AuthContext';
// Import LocationInfo component, presumably to display user's location.
import LocationInfo from '../../components/LocationInfo.jsx'; // Assuming LocationBox was renamed or this is a different component
// Import ProfileImage component to display the user's avatar.
import ProfileImage from '../../components/ProfileImage.jsx';

/**
 * @function ProfileCard
 * @description A React functional component that renders a profile card for a user.
 * It displays user details and interaction buttons based on whether the profile
 * being viewed is the logged-in user's own profile or another user's profile.
 *
 * @param {object} props - The properties passed to the component.
 * @param {object} props.user - The user object whose profile is being displayed.
 *                              Expected to have `_id`, `username`, and `friends` (array of friend IDs).
 * @param {string} props.profilePic - The URL of the profile picture for the user.
 * @param {boolean} props.isOwnProfile - Boolean indicating if this profile card represents the currently logged-in user.
 * @returns {JSX.Element | null} The rendered ProfileCard component, or null if `user` or `currentUser` is not available.
 */
export default function ProfileCard({ user, profilePic, isOwnProfile }) {
  /**
   * `currentUser`: The currently authenticated user object from AuthContext.
   * `refreshUser`: Function from AuthContext to refresh the current user's data.
   * @type {{user: object, refreshUser: function}}
   */
  const { user: currentUser, refreshUser } = useAuth();
  /**
   * State to track if a friend request is currently being sent.
   * Used to disable the "Add Friend" button and show a "Sending..." message.
   * @type {[boolean, function(boolean): void]}
   */
  const [sending, setSending] = useState(false);

  // If either the profile user (`user`) or the current authenticated user (`currentUser`) is not available,
  // render nothing (or a loading/error state could be implemented here).
  if (!user || !currentUser) return null;

  // Determine if the profile user is already a friend of the current user.
  // Optional chaining `?.` is used in case `currentUser.friends` is undefined.
  const isFriend = currentUser.friends?.includes(user._id);
  // Determine if the current user has already sent a friend request to the profile user.
  const isPending = currentUser.friendRequestsSent?.includes(user._id);

  /**
   * Handles sending a friend request to the profile user.
   * Makes a POST request to the `/api/friends/request/:userId` endpoint.
   * Refreshes the current user's data on success to update friend request status.
   * @async
   */
  const handleAdd = async () => {
    setSending(true); // Set sending state to true.
    try {
      // Make POST request to send friend request.
      await axios.post(`/api/friends/request/${user._id}`);
      // Refresh the current user's data (e.g., to update `friendRequestsSent` list).
      await refreshUser();
    } catch (err) {
      console.error('Friend request failed', err);
      // Optionally, set an error state here to display a message to the user.
    } finally {
      setSending(false); // Reset sending state.
    }
  };

  // Render the profile card.
  return (
    // Main section container for the profile card with styling.
    <section className="bg-[#2E2E2E] rounded-lg shadow-lg p-6 flex items-center justify-between">
      {/* Left part of the card: Profile image, username, and friends count. */}
      <div className="flex items-center space-x-4">
        {/* ProfileImage component to display the avatar. */}
        <ProfileImage
          src={profilePic} // Profile picture URL.
          alt={`${user.username}'s profile`} // Alt text.
          size="lg" // Size of the image.
          isOwnProfile={isOwnProfile} // Pass `isOwnProfile` for potential edit functionality within ProfileImage.
        />
        {/* Container for username and friends link. */}
        <div>
          <h2 className="text-2xl font-bold">@{user.username}</h2>
          {/* Link to the user's friends list page. */}
          <Link to={`/user/${user.username}/friends`} className="text-gray-400 text-md hover:text-blue-400 transition-colors">
            {/* Display number of friends, with correct singular/plural form. */}
            {user.friends?.length || 0} {user.friends?.length === 1 ? 'Friend' : 'Friends'}
          </Link>
        </div>
      </div>

      {/* Right part of the card: Action buttons or location info, depending on `isOwnProfile`. */}
      {isOwnProfile ? (
        // If it's the user's own profile:
        <div className="flex justify-end items-center flex-1 space-x-6"> {/* `flex-1` to push LocationInfo to the right. */}
          {/* Container for Friend Requests and Settings buttons. */}
          <div className='flex flex-col space-y-4'>
            {/* Button linking to the friend requests page. */}
            <Link to="/requests">
              <button className="w-full bg-blue-500 hover:bg-blue-300 text-white font-bold py-2 px-3 rounded">
                Friend Requests
              </button>
            </Link>
            {/* Button linking to the settings page. */}
            <Link to="/settings">
              <button className="w-full bg-blue-500 hover:bg-amber-400 hover:text-black text-white font-bold py-2 px-3 rounded">
                Settings
              </button>
            </Link>
          </div>
          {/* Component to display location information (presumably for the current user). */}
          <LocationInfo />
        </div>
      ) : isFriend ? (
        // If it's another user's profile and they are already a friend:
        <button
          className="bg-gray-500 text-white font-bold py-2 px-4 rounded"
          disabled // Button is disabled as they are already friends.
        >
          Friends
        </button>
      ) : (
        // If it's another user's profile and they are not a friend:
        <button
          onClick={handleAdd} // Call `handleAdd` to send a friend request.
          disabled={sending || isPending} // Disable button if request is sending or already pending.
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          {/* Dynamically set button text based on `sending` and `isPending` states. */}
          {sending
            ? 'Sending…'
            : isPending
              ? 'Request Sent'
              : 'Add Friend'}
        </button>
      )}
    </section>
  );
}