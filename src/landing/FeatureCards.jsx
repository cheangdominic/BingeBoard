import { useState } from "react";

function FeatureCards() {
  const [count, setCount] = useState(0);

  return (
    <>
        <h1 class="text-white text-2xl font-bold ml-4 mt-10 mb-10 font-coolvetica text-center">
        BingeBoard gives you the power to...
        </h1>
        <div class="flex flex-col md:flex-row items-center justify-evenly font-coolvetica text-center gap-6">
        <div class="w-full max-w-[28rem] rounded overflow-hidden shadow-lg gap-4 bg-[#2E2E2E]">
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
              Lorem ipsum dolor sit amet, consectetur adipisicing elit.
              Voluptatibus quia, nulla! Maiores et perferendis eaque,
              exercitationem praesentium nihil.
            </p>
          </div>
        </div>

        <div class="w-full max-w-[28rem] rounded overflow-hidden shadow-lg bg-[#2E2E2E]">
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
              Lorem ipsum dolor sit amet, consectetur adipisicing elit.
              Voluptatibus quia, nulla! Maiores et perferendis eaque,
              exercitationem praesentium nihil.
            </p>
          </div>
        </div>

        <div class="w-full max-w-[28rem] rounded overflow-hidden shadow-lg bg-[#2E2E2E]">
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
              Lorem ipsum dolor sit amet, consectetur adipisicing elit.
              Voluptatibus quia, nulla! Maiores et perferendis eaque,
              exercitationem praesentium nihil.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default FeatureCards;
