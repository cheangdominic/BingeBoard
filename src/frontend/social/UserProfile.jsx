import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import ProfileCard from "../../profile/ProfileCard.jsx";
import RecentlyWatched from "../../profile/RecentlyWatched.jsx";
import RecentReviews from "../../profile/RecentReviews.jsx";
import Watchlist from "../../profile/Watchlist.jsx";
import BottomNavbar from "../../components/BottomNavbar.jsx";

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

  useEffect(() => {
    setShowCard(false);
    fetch(`/api/users/${username}`)
      .then(res => res.json())
      .then(data => {
        console.log("Fetched user data in UserProfile:", data.user);
        setUser(data.user);
        setTimeout(() => setShowCard(true), 100);
      })
      .catch(err => {
        console.error("Failed to fetch user:", err);
        setUser(null);
      });
  }, [username]);

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  if (!user) return;

  const profilePic = user.profilePic || "/img/profilePhotos/generic_profile_picture.jpg";

  return (
    <div className="min-h-screen bg-[#1e1e1e] p-6 text-white space-y-6">
      {showCard && (
        <>
          <ProfileCard
            user={user}
            profilePic={profilePic}
            isOwnProfile={false}
          />

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.2 }}
          >
            <RecentlyWatched />
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.4 }}
          >
            <RecentReviews />
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.6 }}
          >
            <Watchlist />
          </motion.div>

          <BottomNavbar />
        </>
      )}
    </div>
  );
}

export default UserProfile;
