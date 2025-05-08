import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BiHome,
  BiSearch,
  BiChat,
  BiUserCircle,
  BiPlus,
  BiPencil,
  BiTimeFive,
  BiShow,
} from "react-icons/bi";

export default function BottomNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(-1);
  const [activeNav, setActiveNav] = useState("Home");

  const arcButtons = [
    { icon: <BiShow size={20} />, label: "Watchlist" },
    { icon: <BiPencil size={20} />, label: "Log" },
    { icon: <BiTimeFive size={20} />, label: "Activity" },
  ];

  const navButtons = [
    { icon: <BiHome size={20} />, label: "Home" },
    { icon: <BiSearch size={20} />, label: "Search" },
    { icon: <BiChat size={20} />, label: "Social" },
    { icon: <BiUserCircle size={20} />, label: "Profile" },
  ];

  const radius = 100;

  const handleButtonClick = (label) => {
    console.log("Clicked:", label);
    setMenuOpen(false);
  };

  const handleNavClick = (label) => {
    setActiveNav(label);
  };

  return (
    <header className="fixed bottom-0 w-full z-50 bg-[#000000]">
      <nav aria-label="Global" className="flex items-center relative h-16">
        <div className="flex flex-1 h-full divide-x divide-white/15 pr-8 md:pr-10 lg:pr-12">
          {navButtons.slice(0, 2).map((btn) => (
            <button
              key={btn.label}
              className={`flex-1 flex flex-col items-center justify-end text-xs md:text-sm font-semibold pb-2 ${
                activeNav === btn.label ? 'text-white' : 'text-[#ECE6DD]'
              }`}
              onClick={() => handleNavClick(btn.label)}
            >
              <div className={`p-1 rounded-full ${
                activeNav === btn.label ? 'bg-[#2A2A2A]' : ''
              }`}>
                {btn.icon}
              </div>
              <span className="mt-1">{btn.label}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-1 h-full divide-x divide-white/15 pl-8 md:pl-10 lg:pl-12">
          {navButtons.slice(2, 4).map((btn) => (
            <button
              key={btn.label}
              className={`flex-1 flex flex-col items-center justify-end text-xs md:text-sm font-semibold pb-2 ${
                activeNav === btn.label ? 'text-white' : 'text-[#ECE6DD]'
              }`}
              onClick={() => handleNavClick(btn.label)}
            >
              <div className={`p-1 rounded-full ${
                activeNav === btn.label ? 'bg-[#2A2A2A]' : ''
              }`}>
                {btn.icon}
              </div>
              <span className="mt-1">{btn.label}</span>
            </button>
          ))}
        </div>

        <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 z-50 flex flex-col items-center">
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ clipPath: 'circle(0% at 0% 100%)' }}
                animate={{ clipPath: 'circle(150% at 0% 100%)' }}
                exit={{ clipPath: 'circle(0% at 0% 100%)' }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="relative mb-[-32px] w-[240px] h-[120px] rounded-t-full bg-[#000000] flex items-end justify-center overflow-hidden"
              >
                {arcButtons.map((btn, index) => {
                  const angle = Math.PI - (Math.PI / (arcButtons.length + 1)) * (index + 1);
                  const x = radius * Math.cos(angle);
                  const y = radius * Math.sin(angle);

                  return (
                    <motion.button
                      key={btn.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ 
                        opacity: 1, 
                        x: x,
                        y: -y + 50,
                        transition: { 
                          delay: 0.2 + index * 0.1,
                          duration: 0.3 
                        }
                      }}
                      exit={{ 
                        opacity: 0, 
                        x: -20,
                        transition: { 
                          delay: (arcButtons.length - 1 - index) * 0.05,
                          duration: 0.2 
                        }
                      }}
                      className="absolute flex flex-col items-center z-40 group"
                      style={{ width: "60px" }}
                      onClick={() => handleButtonClick(btn.label)}
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(-1)}
                    >
                      <div className="text-[#ECE6DD] flex items-center justify-center p-2">
                        {btn.icon}
                      </div>
                      <span className="text-[#ECE6DD] text-xs whitespace-nowrap mt-1">
                        {btn.label}
                      </span>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: hoveredIndex === index ? '100%' : 0 }}
                        className="h-[2px] bg-[#ECE6DD] mt-1"
                        transition={{ duration: 0.2 }}
                      />
                    </motion.button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="relative z-50 flex items-center justify-center w-20 h-20 mb-3.5 sm:mb-3.5 md:mb-0 md:w-24 md:h-24 border-2 border-[#1e1e1e] bg-black rounded-full"
          >
            <BiPlus className="w-8 h-8 md:w-10 md:h-10 text-[#ECE6DD] transform transition-transform duration-300 group-hover:rotate-45" />
          </button>
        </div>
      </nav>
    </header>
  );
}