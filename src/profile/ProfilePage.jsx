import React from "react";
import ProfileCard from "./ProfileCard.jsx";
import RecentlyWatched from "./RecentlyWatched.jsx";
import RecentReviews from "./RecentReviews.jsx";
import Watchlist from "./Watchlist.jsx";
import BottomNavbar from "../frontend/home/BottomNavbar.jsx";

function ProfilePage() {
  return (
    <>
    <div className="p-6 max-w-6xl mx-auto font-coolvetica text-white space-y-6">
      <ProfileCard />
      <RecentlyWatched />
      <RecentReviews />
      <Watchlist />
    </div>
    <BottomNavbar/> 
    </>
  );
}

export default ProfilePage;