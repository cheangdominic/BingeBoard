import { useState } from "react";
import TopNavbar from '../landing/TopNavbar.jsx';

function SocialFeatures() {
  const [count, setCount] = useState(0);

  return (
    <>
        <TopNavbar/>
        <div class="flex justify-center">
        <div class="w-full max-w-[78rem] rounded overflow-hidden shadow-lg bg-[#2E2E2E]">
          <img
            class="w-full h-64"
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
        </div>

        <div class="flex justify-center">
        <div class="w-full max-w-[78rem] rounded overflow-hidden shadow-lg bg-[#2E2E2E] mt-2">
          <div class="px-6 py-4">
            <p class="text-[#ECE6DD] text-base">
            Binging doesn't have to be lonely. 
            BingeBoard lets you connect with friends, 
            share what you’re watching, and discover 
            new favorites together—making your streaming experience social and fun.
            
            </p>
          </div>
        </div>
        </div>
    </>
  );
}

export default SocialFeatures;
