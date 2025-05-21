import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
import ProfileCard from "./ProfileCard.jsx";
import RecentlyWatched from "./RecentlyWatched.jsx";
import RecentReviews from "./RecentReviews.jsx";
import WatchlistCarousel from "./WatchlistCarousel.jsx";
import BottomNavbar from "../../components/BottomNavbar.jsx";
import LogoutButton from "./LogoutButton.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

function ProfilePage() {
  const [user, setUser] = useState(null);
  const { user: authUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !authUser) {
      navigate('/login');
    }
  }, [authUser, authLoading, navigate]);

  useEffect(() => {
    if (!authLoading && authUser) {
      window.scrollTo(0, 0);
      fetch("/api/getUserInfo", { credentials: "include" })
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          console.log("Logged-in user data:", data);
          setUser(data);
        })
        .catch(err => {
          console.error("Error loading user data:", err);
          setUser({ username: "error", error: true });
        });
    }
  }, [authUser, authLoading]);

  if (authLoading) {
    return (
      <LoadingSpinner />
    );
  }

  if (!authUser) {
    return null;
  }

  if (!user) {
    return (
      <LoadingSpinner />
    );
  }

  if (user.error) {
    return (
         <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#1e1e1e', color: 'white', padding: '20px', textAlign: 'center' }}>
            <p>Could not load profile data. Please try again later.</p>
            <div className="fixed bottom-0 left-0 right-0 w-full">
                <BottomNavbar />
            </div>
        </div>
    )
  }


  const profilePic = user.profilePic || "/img/profilePhotos/generic_profile_picture.jpg";

  return (
    <>
      <div className="p-6 mx-auto font-coolvetica text-white space-y-6 bg-[#1e1e1e] min-h-screen pb-20">
        <ProfileCard user={user} profilePic={profilePic} isOwnProfile={true} />

        {/*<motion.div
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
        </motion.div>*/}

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.6 }}
        >
          <WatchlistCarousel user={user} />
          <LogoutButton />
        </motion.div>
      </div>
      <BottomNavbar />
    </>
  );
}

export default ProfilePage;