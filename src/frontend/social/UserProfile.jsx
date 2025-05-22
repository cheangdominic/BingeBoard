// UserProfile.jsx
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
  const [showCard, setShowCard] = useState(false);
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
        let url;
        if (isOwnProfile) {
          url = '/api/getUserInfo';
        } else {
          url = `/api/users/${username}`; 
        }

        const response = await fetch(url, {
          credentials: "include"
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch user profile: ${response.statusText}`);
        }
        const data = await response.json();
        setUser(data);
        setUserActivities(data.activities || []); 

      } catch (error) {
        console.error("Error fetching user profile:", error);
        setUser(null);
        setUserActivities([]);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchUserProfile();
    }
  }, [username, isOwnProfile, authLoading]);

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <div className="p-6 mx-auto font-coolvetica text-white space-y-6 bg-[#1e1e1e] min-h-screen pb-20">
        {user && (
          <>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0 }}
            >
              <ProfileCard user={user} profilePic={user.profilePic || "/img/profilePhotos/generic_profile_picture.jpg"} isOwnProfile={isOwnProfile} />
            </motion.div>

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
                isOwnProfile={isOwnProfile}
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