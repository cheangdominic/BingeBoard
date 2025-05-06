import { useState } from "react";
import TopNavbar from '../landing/TopNavbar.jsx';

function BrowseFeature() {
  const [count, setCount] = useState(0);

  return (
    <>
        <TopNavbar/>
        <div class="flex justify-center">
        <div class="w-full max-w-[78rem] rounded overflow-hidden shadow-lg bg-[#2E2E2E]">
          <img
            class="w-full h-64"
            src="src\assets\browse_tv_icon.svg"
            alt="Sunset in the mountains"
          ></img>
          <div class="px-6 py-4">
            <div class="font-bold text-xl mb-2 text-[#ECE6DD] ">
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
        </div>

        <div class="flex justify-center">
        <div class="w-full max-w-[78rem] rounded overflow-hidden shadow-lg bg-[#2E2E2E] mt-2">
          <div class="px-6 py-4">
            <p class="text-[#ECE6DD] text-base">
            Not sure what to watch next? 
            BingeBoard helps you discover new shows based on your interests, 
            trending picks, and what your friends are watching—so your next 
            binge is always one click away.
            </p>
          </div>
        </div>
        </div>
    </>
  );
}

export default BrowseFeature;
