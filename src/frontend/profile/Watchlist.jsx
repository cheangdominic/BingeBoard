import React from "react";
import WatchlistCarousel from "./WatchlistCarousel"; 
import { useAuth } from "../../context/AuthContext.jsx"; 
import LoadingSpinner from "../../components/LoadingSpinner.jsx";

function Watchlist({ username, isOwnProfile, userProfileData }) { 
  const { user: authUser, loading: authLoading } = useAuth(); 

  if (authLoading) {
    return <LoadingSpinner small={true} />;
  }

  return (
    <section className="mx-auto w-[97vw] sm:w-[97.5vw] mt-2 sm:mt-3 text-white">
      <WatchlistCarousel
        user={isOwnProfile ? authUser : userProfileData} 
        title={isOwnProfile ? 'Your Watchlist' : `${username}'s Watchlist`}
      />
    </section>
  );
}

export default Watchlist;