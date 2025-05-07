import { PopoverGroup } from "@headlessui/react";
import { BiHome, BiSearch, BiChat, BiUserCircle, BiPlus } from "react-icons/bi";

export default function BottomNavbar() {
  return (
    <header className="fixed bottom-0 w-full z-50 bg-[#000000]">
      <nav
        aria-label="Global"
        className="relative flex justify-between items-center p-8"
      >
        <div className="absolute left-1/2 -translate-x-1/2">
          <PopoverGroup className="flex items-center justify-center w-full">
            <div className="flex divide-x divide-white/15">
              <a
                href="#"
                className="flex flex-col items-center text-[#ECE6DD] text-sm font-semibold py-2.5 px-5"
              >
                <BiHome size={24} />
                Home
              </a>
              <a
                href="#"
                className="flex flex-col items-center text-[#ECE6DD] text-sm font-semibold py-2.5 px-5"
              >
                <BiSearch size={24} />
                Search
              </a>
            </div>

            <a
              href="#"
              className="flex flex-col items-center text-[#ECE6DD] text-sm font-semibold -translate-y-4 border-2 border-white/15 rounded-full p-2 bg-black mx-4"
            >
              <BiPlus size={40} />
            </a>

            <div className="flex divide-x divide-white/15">
              <a
                href="#"
                className="flex flex-col items-center text-[#ECE6DD] text-sm font-semibold py-2.5 px-5"
              >
                <BiChat size={24} />
                Social
              </a>
              <a
                href="#"
                className="flex flex-col items-center text-[#ECE6DD] text-sm font-semibold py-2.5 px-5"
              >
                <BiUserCircle size={24} />
                Profile
              </a>
            </div>
          </PopoverGroup>
        </div>
      </nav>
    </header>
  );
}
