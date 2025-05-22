import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext"; 
import ProfileCard from "../profile/ProfileCard.jsx";
import RecentlyWatched from "../profile/RecentlyWatched.jsx";
import RecentReviews from "../profile/RecentReviews.jsx";
import Watchlist from "../profile/Watchlist.jsx";
import BottomNavbar from "../../components/BottomNavbar.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

function UserProfile() {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [userActivities, setUserActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: authUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const isOwnProfile = authUser && username === authUser.username;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [username]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/users/${username}`);
        if (!response.ok) {
          if (response.status === 404) {
            navigate('/404'); 
          } else {
            throw new Error(`Failed to fetch user profile: ${response.statusText}`);
          }
        }
        const data = await response.json();
        setUser(data.user);
        setUserActivities(data.activities);
        console.log("User activities from server:", data.activities); 
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchUserProfile();
    }
  }, [username, authLoading, navigate]);

  return (
    <>
      <div className="min-h-screen bg-[#1e1e1e] text-white p-4 pb-20">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
            >
              <ProfileCard user={user} profilePic={user.profilePic || "/img/profilePhotos/generic_profile_picture.jpg"} isOwnProfile={isOwnProfile} />
            </motion.div>

            {/* RecentlyWatched */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.2 }}
            >
              <RecentlyWatched
                userId={user._id}
                username={user.username}
                activities={userActivities}
              />
            </motion.div>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.4 }}
            >
              <RecentReviews
                userId={user._id}
                username={user.username}
                isOwnProfile={isOwnProfile}
              />
            </motion.div>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.6 }}
            >
              <Watchlist
                userId={user._id}
                username={user.username}
                isOwnProfile={isOwnProfile}
                userProfileData={user}
              />
            </motion.div>
          </>
        )}
      </div>
      <BottomNavbar />
    </>
  );
}

export default UserProfile;