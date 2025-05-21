import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import ProfileCard from "../../profile/ProfileCard.jsx";
import RecentlyWatched from "../../profile/RecentlyWatched.jsx";
import RecentReviews from "../../profile/RecentReviews.jsx";
import Watchlist from "../../profile/Watchlist.jsx";
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
  const { user: authUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [username]);

  useEffect(() => {
    if (!authLoading && !authUser) {
      navigate('/login');
    }
  }, [authUser, authLoading, navigate]);

  useEffect(() => {
    if (!authLoading && authUser) {
      setShowCard(false);
      setUser(null);
      fetch(`/api/users/${username}`)
        .then(res => {
          if (!res.ok) {
            if (res.status === 404) {
              console.warn("User not found:", username);
            } else {
              console.error("Error fetching user, status:", res.status);
            }
            return null;
          }
          return res.json();
        })
        .then(data => {
          if (data && data.user) {
            setUser(data.user);
            setTimeout(() => setShowCard(true), 100);
          } else {
            setUser(null);
          }
        })
        .catch(err => {
          console.error("Failed to fetch user:", err);
          setUser(null);
        });
    }
  }, [username, authUser, authLoading]);

  if (authLoading && !user && authUser) {
    return (
      <LoadingSpinner />
    );
  }

  if (!authUser) {
    return null;
  }
  
  if (!user) {
    return null;
  }


  const profilePic = user.profilePic || "/img/profilePhotos/generic_profile_picture.jpg";
  const isOwnProfile = authUser.username === user.username;

  return (
    <>
      <div className="min-h-screen bg-[#1e1e1e] p-6 text-white space-y-6 pb-20">
        {showCard && (
          <>
            <ProfileCard
              user={user}
              profilePic={profilePic}
              isOwnProfile={isOwnProfile}
            />

            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.2 }}
            >
              <RecentlyWatched userId={user._id} />
            </motion.div>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.4 }}
            >
              <RecentReviews userId={user._id} />
            </motion.div>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: 0.6 }}
            >
              <Watchlist userId={user._id} />
            </motion.div>
          </>
        )}
      </div>
      <BottomNavbar />
    </>
  );
}

export default UserProfile;