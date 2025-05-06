import { useState } from 'react'

function MottoBanner() {
  const [count, setCount] = useState(0)

  return (
    <>
        <div className="relative">
        <img
          src={"src/assets/severance-apple-tv-plus.jpg"}
          alt="Landing banner"
          className="w-full h-[500px] object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4 text-center -mt-24">
            <h1 className="text-white text-4xl lg:text-6xl font-bold font-coolvetica">
              Track What You Watch.
            </h1>
            <h1 className="text-white text-4xl lg:text-6xl font-bold font-coolvetica">
              Share What You Love.
            </h1>
            <button 
              className="px-6 py-3 bg-[#1963da] text-white font-bold rounded-lg hover:bg-[#ebbd34] hover:text-black transition duration-300"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default MottoBanner
