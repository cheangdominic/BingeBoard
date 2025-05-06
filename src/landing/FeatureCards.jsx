import { useState } from "react";

function FeatureCards() {
  const [count, setCount] = useState(0);

  return (
    <>
        <h1 class="text-white text-2xl font-bold ml-4 mt-10 mb-10 font-coolvetica">
        BingeBoard gives you the power to...
        </h1>
      <div class="flex justify-evenly font-coolvetica">
        <div class="max-w-sm rounded overflow-hidden shadow-lg gap-4 bg-[#2E2E2E]">
          <img
            class="w-full"
            src="src\assets\friend_feature_icon.svg"
            alt="Sunset in the mountains"
          ></img>
          <div class="px-6 py-4">
            <div class="font-bold text-xl mb-2 text-[#ECE6DD] ">
              Connect With Friends and Share What You Are Watching
            </div>
            <p class="text-[#ECE6DD] text-base">
              Lorem ipsum dolor sit amet, consectetur adipisicing elit.
              Voluptatibus quia, nulla! Maiores et perferendis eaque,
              exercitationem praesentium nihil.
            </p>
          </div>
          <div class="px-6 pt-4 pb-2">
            <span class="inline-block bg-[#525252] rounded-full px-3 py-1 text-sm font-semibold text-[#ECE6DD] mr-2 mb-2">
              #photography
            </span>
            <span class="inline-block bg-[#525252] rounded-full px-3 py-1 text-sm font-semibold text-[#ECE6DD] mr-2 mb-2">
              #travel
            </span>
            <span class="inline-block bg-[#525252] rounded-full px-3 py-1 text-sm font-semibold text-[#ECE6DD] mr-2 mb-2">
              #winter
            </span>
          </div>
        </div>

        <div class="max-w-sm rounded overflow-hidden shadow-lg bg-[#2E2E2E]">
          <img
            class="w-full"
            src="src\assets\watchlist_icon.svg"
            alt="Sunset in the mountains"
          ></img>
          <div class="px-6 py-4">
            <div class="font-bold text-xl mb-2 text-[#ECE6DD]">
              Add Shows to a Watchlist For Later
            </div>
            <p class="text-[#ECE6DD] text-base">
              Lorem ipsum dolor sit amet, consectetur adipisicing elit.
              Voluptatibus quia, nulla! Maiores et perferendis eaque,
              exercitationem praesentium nihil.
            </p>
          </div>
          <div class="px-6 pt-4 pb-2">
            <span class="inline-block bg-[#525252] rounded-full px-3 py-1 text-sm font-semibold text-[#ECE6DD] mr-2 mb-2">
              #photography
            </span>
            <span class="inline-block bg-[#525252] rounded-full px-3 py-1 text-sm font-semibold text-[#ECE6DD] mr-2 mb-2">
              #travel
            </span>
            <span class="inline-block bg-[#525252] rounded-full px-3 py-1 text-sm font-semibold text-[#ECE6DD] mr-2 mb-2">
              #winter
            </span>
          </div>
        </div>

        <div class="max-w-sm rounded overflow-hidden shadow-lg bg-[#2E2E2E]">
          <img
            class="w-full"
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
          <div class="px-6 pt-4 pb-2">
            <span class="inline-block bg-[#525252] rounded-full px-3 py-1 text-sm font-semibold text-[#ECE6DD] mr-2 mb-2">
              #photography
            </span>
            <span class="inline-block bg-[#525252] rounded-full px-3 py-1 text-sm font-semibold text-[#ECE6DD] mr-2 mb-2">
              #travel
            </span>
            <span class="inline-block bg-[#525252] rounded-full px-3 py-1 text-sm font-semibold text-[#ECE6DD] mr-2 mb-2">
              #winter
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

export default FeatureCards;
