import { useState } from "react";
import TopNavbar from '../landing/TopNavbar.jsx';

function WatchlistFeature() {
  const [count, setCount] = useState(0);

  return (
    <>
        <TopNavbar/>
        <div class="flex justify-center">
        <div class="w-full max-w-[78rem] rounded overflow-hidden shadow-lg bg-[#2E2E2E]">
          <img
            class="w-full h-64"
            src="src\assets\watchlist_icon.svg"
            alt="Sunset in the mountains"
          ></img>
          <div class="px-6 py-4">
            <div class="font-bold text-xl mb-2 text-[#ECE6DD] ">
            Save For Later
            </div>
            <p class="text-[#ECE6DD] text-base">
            Never forget that show you wanted to watch but never found the time for. 
            With BingeBoard, you can build and manage your personal watchlist—so 
            every must-watch moment is right where you left it.
            </p>
          </div>
        </div>
        </div>

        <div class="flex justify-center">
        <div class="w-full max-w-[78rem] rounded overflow-hidden shadow-lg bg-[#2E2E2E] mt-2">
          <div class="px-6 py-4">
            <p class="text-[#ECE6DD] text-base">
            Never forget that show you wanted to watch but never found the time for. 
            With BingeBoard, you can build and manage your personal watchlist—so 
            every must-watch moment is right where you left it.
            </p>
          </div>
        </div>
        </div>
    </>
  );
}

export default WatchlistFeature;
