import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ProfileCard from "./ProfileCard.jsx";
import RecentlyWatched from "./RecentlyWatched.jsx";
import RecentReviews from "./RecentReviews.jsx";
import WatchlistCarousel from "./WatchlistCarousel.jsx";
import BottomNavbar from "../components/BottomNavbar.jsx";

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

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch("/api/getUserInfo", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        console.log("Logged-in user data:", data);
        setUser(data);
      })
      .catch(err => {
        console.error("Error loading user data:", err);
        setUser({ username: "error" });
      });
  }, []);

  if (!user) return <div className="p-6 text-white">Loading profile...</div>;

  const profilePic = user.profilePic || "/img/profilePhotos/generic_profile_picture.jpg";

  return (
    <>
      <div className="p-6 mx-auto font-coolvetica text-white space-y-6">
        <ProfileCard user={user} profilePic={profilePic} isOwnProfile={true} />

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
          <WatchlistCarousel user={user} />
        </motion.div>
      </div>
      <BottomNavbar />
    </>
  );
}

export default ProfilePage;