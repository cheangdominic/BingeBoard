import React from "react";
import ProfileCard from "./ProfileCard.jsx";
import RecentlyWatched from "./RecentlyWatched.jsx";
import RecentReviews from "./RecentReviews.jsx";
import Watchlist from "./Watchlist.jsx";

function ProfilePage() {
  return (
    <div className="p-6 max-w-6xl mx-auto font-coolvetica text-white space-y-6">
      <ProfileCard />
      <RecentlyWatched />
      <RecentReviews />
      <Watchlist />
    </div>
  );
}

export default ProfilePage;