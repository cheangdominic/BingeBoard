import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import LocationInfo from '../../components/LocationInfo.jsx';
import ProfileImage  from '../../components/ProfileImage.jsx';
import LogoutButton from './LogoutButton.jsx';

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
          <p className="text-gray-400 text-sm">12 Connections</p>
          <p className="text-gray-400 text-sm">2 Groups</p>
        </div>
      </div>

      {/* ── RIGHT‑HAND BUTTONS ───────────────────────────────────────────────── */}
      {isOwnProfile ? (
        <>
          <LogoutButton />

          <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
            Settings
          </button>

          <LocationInfo />
        </>
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