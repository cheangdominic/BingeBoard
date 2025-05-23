import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams, useNavigate } from 'react-router-dom';
import BottomNavbar from '../../components/BottomNavbar';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function FriendsListPage() {
  const { username } = useParams();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFriends = async () => {
      if (!username) return;
      setLoading(true);
      setError(null);
      try {
        const userRes = await axios.get(`/api/users/${username}`);
        setProfileUser(userRes.data.user);

        const res = await axios.get(`/api/friends/list/${username}`);
        setFriends(res.data);
      } catch (err) {
        console.error(`Failed to load friends for ${username}:`, err);
        setError(`Failed to load friends. User may not exist or an error occurred.`);
        if (err.response && err.response.status === 404) {
          navigate('/404');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, [username, navigate]);

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

  return (
    <>
      <div className="min-h-screen bg-[#1e1e1e] text-white p-4 pt-8 pb-20">
        <button onClick={() => navigate(-1)} className="mb-4 text-blue-400 hover:text-blue-300">
          ← Back to Profile
        </button>
        <h1 className="text-3xl font-bold mb-6 text-center">
          {profileUser ? `@${profileUser.username}'s` : "User's"} Connections
        </h1>
        {friends.length === 0 ? (
          <p className="text-gray-400 text-center">No connections yet.</p>
        ) : (
          <ul className="space-y-4">
            {friends.map((friend) => (
              <li
                key={friend._id}
                className="bg-[#2E2E2E] p-4 rounded-lg shadow-md hover:bg-[#3a3a3a] transition-colors w-full"
              >
                <Link to={`/user/${friend.username}`} className="flex items-center space-x-4 w-full">
                  <img
                    src={friend.profilePic || '/img/profilePhotos/generic_profile_picture.jpg'}
                    alt={`${friend.username}'s profile`}
                    className="w-14 h-14 rounded-full object-cover border-2 border-gray-700"
                  />
                  <span className="text-lg font-semibold hover:text-blue-300">@{friend.username}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      <BottomNavbar />
    </>
  );
}
