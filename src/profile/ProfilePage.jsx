import { motion } from 'framer-motion';
import React from "react";
import ProfileCard from "./ProfileCard.jsx";
import RecentlyWatched from "./RecentlyWatched.jsx";
import RecentReviews from "./RecentReviews.jsx";
import Watchlist from "./Watchlist.jsx";
import BottomNavbar from "../frontend/home/BottomNavbar.jsx";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

function ProfilePage() {
  return (
    <>
    <div className="p-6 max-w-6xl mx-auto font-coolvetica text-white space-y-6">
      <ProfileCard />

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
        transition={{ delay: 0.4 }}
      >
      <Watchlist />
      </motion.div>
    </div>
    <BottomNavbar/> 
    </>
  );
}

export default ProfilePage;