import { useState } from "react";

function Statistics() {
  const [count, setCount] = useState(0);

  return (
    <>
    <br></br>
      <div className="bg-[#2E2E2E] rounded-xl px-10 py-2 max-w-[1400px] mx-auto">
  <div className="flex justify-evenly gap-16 font-coolvetica">
    
    <div className="w-[40rem] rounded overflow-hidden px-6 py-4">
      <div className="flex items-center gap-6">
        <img
          className="w-40 h-40"
          src="src/assets/person_statistics_icon.svg"
          alt="Person Icon"
        />
        <h1 className="text-[#1963da] text-4xl font-bold">
          10,000+ Active Users
        </h1>
      </div>
    </div>

    <div className="w-[40rem] rounded overflow-hidden px-6 py-4">
      <div className="flex items-center gap-6">
        <img
          className="w-40 h-40"
          src="src/assets/review_rating_icon.svg"
          alt="Review Icon"
        />
        <h1 className="text-[#1963da] text-4xl font-bold">
          50,000+ Reviews Made
        </h1>
      </div>
    </div>
  </div>
</div>
    </>
  );
}

export default Statistics;
