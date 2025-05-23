import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LocationInfo from '../../components/LocationInfo.jsx';
import ProfileImage from '../../components/ProfileImage.jsx';

export default function ProfileCard({ user, profilePic, isOwnProfile }) {
  const { user: currentUser, refreshUser } = useAuth();
  const [sending, setSending] = useState(false);

  if (!user || !currentUser) return null;

  // Determine button state
  const isFriend  = currentUser.friends?.includes(user._id);
  const isPending = currentUser.friendRequestsSent?.includes(user._id);

  const handleAdd = async () => {
    setSending(true);
    try {
      await axios.post(`/api/friends/request/${user._id}`);
      await refreshUser();               // reload your user so sent‑array updates
    } catch (err) {
      console.error('Friend request failed', err);
      // you could toast an error here
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="bg-[#2E2E2E] rounded-lg shadow-lg p-6 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <ProfileImage
          src={profilePic}
          alt={`${user.username}'s profile`}
          size="lg"
          isOwnProfile={isOwnProfile}
        />
        <div>
          <h2 className="text-2xl font-bold">@{user.username}</h2>
          <p className="text-gray-400 text-md">
            {user.friends?.length || 0} {user.friends?.length === 1 ? 'Connection' : 'Connections'}
          </p>
          {/* <p className="text-gray-400 text-sm">2 Groups</p> */}
        </div>
      </div>

      {/* ── RIGHT BUTTONS ───────────────────────────────────────────────── */}
      {isOwnProfile ? (
        <div className="flex justify-end items-center flex-1 space-x-6">
          <div className='flex flex-col space-y-4'>
            <Link to="/requests">
              <button className="w-full bg-blue-500 hover:bg-blue-300 text-white font-bold py-2 px-3 rounded">
                Friend Requests
              </button>
            </Link>

            <Link to="/settings">
              <button className="w-full bg-blue-500 hover:bg-amber-400 hover:text-black text-white font-bold py-2 px-3 rounded">
                Settings
              </button>
            </Link>

          </div>

          <LocationInfo/>
        </div>
      ) : isFriend ? (
        <button
          className="bg-gray-500 text-white font-bold py-2 px-4 rounded"
          disabled
        >
          Friends
        </button>
      ) : (
        <button
          onClick={handleAdd}
          disabled={sending || isPending}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
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
