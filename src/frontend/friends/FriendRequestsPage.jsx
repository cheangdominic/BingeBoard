import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import BottomNavbar from "../../components/BottomNavbar.jsx";

export default function FriendRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { refreshUser } = useAuth(); // ✅ bring in refreshUser

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get('/api/friends/requests', { withCredentials: true });
        setRequests(res.data);
      } catch (err) {
        console.error('Failed to load friend requests:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleAccept = async (userId) => {
    try {
      await axios.post(`/api/friends/accept/${userId}`, {}, { withCredentials: true });
      setRequests(prev => prev.filter(user => user._id !== userId));
      await refreshUser();
    } catch (err) {
      console.error('Accept failed:', err);
    }
  };

  const handleDecline = async (userId) => {
    try {
      await axios.post(`/api/friends/decline/${userId}`, {}, { withCredentials: true });
      setRequests(prev => prev.filter(user => user._id !== userId));
      await refreshUser();
    } catch (err) {
      console.error('Decline failed:', err);
    }
  };

  return (
    <>
      <div className="max-w-2xl mx-auto mt-8 text-white">
        <h1 className="text-2xl font-bold mb-4">Friend Requests</h1>
        {loading ? (
          <p>Loading…</p>
        ) : requests.length === 0 ? (
          <p className="text-gray-400">No friend requests.</p>
        ) : (
          <ul className="space-y-4">
            {requests.map((user) => (
              <li key={user._id} className="flex items-center justify-between bg-[#333] p-4 rounded">
                <Link to={`/profile/${user.username}`} className="flex items-center space-x-3">
                  <img
                    src={user.profilePic || '/img/profilePhotos/generic_profile_picture.jpg'}
                    alt="Profile"
                    className="w-12 h-12 rounded-full"
                  />
                  <span className="text-lg font-semibold">@{user.username}</span>
                </Link>
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
      <BottomNavbar />
    </>
  );
}