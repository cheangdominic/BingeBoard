import { Link } from "react-router-dom";
import { useState } from "react";

function FeatureCards() {
  const [count, setCount] = useState(0);

  return (
    <>
        <h1 class="text-white text-2xl font-bold ml-4 mt-10 mb-10 font-coolvetica text-center">
        BingeBoard gives you the power to...
        </h1>
        <div class="flex flex-col md:flex-row items-center justify-evenly font-coolvetica text-center gap-6">
        
        <Link to="/socialfeature">
        <div class="w-full max-w-[28rem] rounded overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 hover:scale-105 transition-all duration-300 ease-in-out bg-[#2E2E2E]">
          <img
            class="w-full h-32"
            src="src\assets\friend_feature_icon.svg"
            alt="Sunset in the mountains"
          ></img>
          <div class="px-6 py-4">
            <div class="font-bold text-xl mb-2 text-[#ECE6DD] ">
              Connect and Share
            </div>
            <p class="text-[#ECE6DD] text-base">
            Binging doesn't have to be lonely. 
            BingeBoard lets you connect with friends, 
            share what you’re watching, and discover 
            new favorites together—making your streaming experience social and fun.
            </p>
          </div>
        </div>
        </Link>

        <Link to="/watchlistfeature">
        <div class="w-full max-w-[28rem] rounded overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 hover:scale-105 transition-all duration-300 ease-in-out bg-[#2E2E2E]">
          <img
            class="w-full h-32"
            src="src\assets\watchlist_icon.svg"
            alt="Sunset in the mountains"
          ></img>
          <div class="px-6 py-4">
            <div class="font-bold text-xl mb-2 text-[#ECE6DD]">
              Save For Later
            </div>
            <p class="text-[#ECE6DD] text-base">
            Never forget that show you wanted to watch but never found the time for. 
            With BingeBoard, you can build and manage your personal watchlist—so 
            every must-watch moment is right where you left it.
            </p>
          </div>
        </div>
        </Link>

        <Link to="/browsefeature">
        <div class="w-full max-w-[28rem] rounded overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 hover:scale-105 transition-all duration-300 ease-in-out bg-[#2E2E2E]">
          <img
            class="w-full h-32"
            src="src\assets\browse_tv_icon.svg"
            alt="Sunset in the mountains"
          ></img>
          <div class="px-6 py-4">
            <div class="font-bold text-xl mb-2 text-[#ECE6DD]">
              Browse Your Next Watch
            </div>
            <p class="text-[#ECE6DD] text-base">
            Not sure what to watch next? 
            BingeBoard helps you discover new shows based on your interests, 
            trending picks, and what your friends are watching—so your next 
            binge is always one click away.
            </p>
          </div>
        </div>
        </Link>
      </div>
    </>
  );
}

export default FeatureCards;
