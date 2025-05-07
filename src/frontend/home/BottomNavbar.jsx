import { PopoverGroup } from "@headlessui/react";
import { BiHome, BiSearch, BiChat, BiUserCircle, BiPlus } from "react-icons/bi";

export default function BottomNavbar() {
  return (
    <header className="fixed bottom-0 w-full z-50 bg-[#000000]">
      <nav aria-label="Global" className="flex items-center relative h-16">
        <PopoverGroup className="flex w-full justify-between items-end h-full">
          {/* Left Buttons */}
          <div className="flex flex-1 h-full divide-x divide-white/15 pr-8 md:pr-10 lg:pr-12">
            <a
              href="#"
              className="flex-1 flex flex-col items-center justify-end text-[#ECE6DD] text-xs md:text-sm font-semibold pb-2"
            >
              <BiHome size={20} className="md:w-6 md:h-6" />
              <span className="mt-1">Home</span>
            </a>
            <a
              href="#"
              className="flex-1 flex flex-col items-center justify-end text-[#ECE6DD] text-xs md:text-sm font-semibold pb-2"
            >
              <BiSearch size={20} className="md:w-6 md:h-6" />
              <span className="mt-1">Search</span>
            </a>
          </div>

          {/* Right Buttons */}
          <div className="flex flex-1 h-full divide-x divide-white/15 pl-8 md:pl-10 lg:pl-12">
            <a
              href="#"
              className="flex-1 flex flex-col items-center justify-end text-[#ECE6DD] text-xs md:text-sm font-semibold pb-2"
            >
              <BiChat size={20} className="md:w-6 md:h-6" />
              <span className="mt-1">Social</span>
            </a>
            <a
              href="#"
              className="flex-1 flex flex-col items-center justify-end text-[#ECE6DD] text-xs md:text-sm font-semibold pb-2"
            >
              <BiUserCircle size={20} className="md:w-6 md:h-6" />
              <span className="mt-1">Profile</span>
            </a>
          </div>
        </PopoverGroup>

        {/* Centered Circle Button */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0">
          <a
            href="#"
            className="flex items-center justify-center w-20 h-20 md:w-24 md:h-24 lg:w-24 lg:h-24 border-2 border-white/15 rounded-full bg-black transform transition-all duration-300"
          >
            <BiPlus className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-[#ECE6DD]" />
          </a>
        </div>
      </nav>
    </header>
  );
}