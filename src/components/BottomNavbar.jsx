import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
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
  const navigate = useNavigate();
  const location = useLocation();

  const arcButtons = [
    { icon: <BiShow size={20} />, label: "Watchlist", path: "/watchlist" },
    { icon: <BiPencil size={20} />, label: "Log", path: "/log" },
    { icon: <BiTimeFive size={20} />, label: "Activity", path: "/activity" },
  ];

  const navButtons = [
    { icon: <BiHome size={20} />, label: "Home", path: "/home" },
    { icon: <BiSearch size={20} />, label: "Search", path: "/search" },
    { icon: <BiChat size={20} />, label: "Social", path: "/social" },
    { icon: <BiUserCircle size={20} />, label: "Profile", path: "/profile" },
  ];

  const radius = 100;

  const handleButtonClick = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  return (
    <div className= "pb-20">
    <header className="fixed bottom-0 w-full z-50 bg-[#1A1A1A]/95 backdrop-blur-sm shadow-2xl shadow-black/60 border-t border-gray-800">
      <nav aria-label="Global" className="flex items-center relative h-16">
        <div className="flex flex-1 h-full divide-x divide-gray-800 pr-8 md:pr-10 lg:pr-12">
          {navButtons.slice(0, 2).map((btn) => (
            <motion.button
              key={btn.label}
              whileHover={{ scale: 1.05 }}
              className={`flex-1 flex flex-col items-center justify-end text-xs md:text-sm font-medium pb-2 ${
                location.pathname === btn.path ? "text-blue-400" : "text-gray-300"
              }`}
              onClick={() => navigate(btn.path)}
            >
              <div
                className={`p-2 rounded-full transition-all ${
                  location.pathname === btn.path
                    ? "bg-[#2E2E2E] ring-2 ring-blue-400/20"
                    : "hover:bg-[#2E2E2E]/50"
                }`}
              >
                {btn.icon}
              </div>
              <span className="mt-1">{btn.label}</span>
            </motion.button>
          ))}
        </div>

        <div className="flex flex-1 h-full divide-x divide-gray-800 pl-8 md:pl-10 lg:pl-12">
          {navButtons.slice(2, 4).map((btn) => (
            <motion.button
              key={btn.label}
              whileHover={{ scale: 1.05 }}
              className={`flex-1 flex flex-col items-center justify-end text-xs md:text-sm font-medium pb-2 ${
                location.pathname === btn.path ? "text-blue-400" : "text-gray-300"
              }`}
              onClick={() => navigate(btn.path)}
            >
              <div
                className={`p-2 rounded-full transition-all ${
                  location.pathname === btn.path
                    ? "bg-[#2E2E2E] ring-2 ring-blue-400/20"
                    : "hover:bg-[#2E2E2E]/50"
                }`}
              >
                {btn.icon}
              </div>
              <span className="mt-1">{btn.label}</span>
            </motion.button>
          ))}
        </div>

        <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 z-50 flex flex-col items-center">
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ clipPath: "circle(0% at 0% 100%)" }}
                animate={{ clipPath: "circle(150% at 0% 100%)" }}
                exit={{ clipPath: "circle(0% at 0% 100%)" }}
                transition={{
                  duration: 0.4,
                  ease: [0.25, 1, 0.5, 1],
                }}
                className="relative mb-[-32px] w-[240px] h-[120px] rounded-t-full bg-[#1A1A1A] flex items-end justify-center overflow-hidden border-t border-gray-800"
              >
                {arcButtons.map((btn, index) => {
                  const angle =
                    Math.PI - (Math.PI / (arcButtons.length + 1)) * (index + 1);
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
                          delay: 0.1 + index * 0.1,
                          duration: 0.3,
                          type: "elastic",
                          stiffness: 200,
                          damping: 10,
                        },
                      }}
                      exit={{
                        opacity: 0,
                        x: -20,
                        transition: {
                          delay: (arcButtons.length - 1 - index) * 0.05,
                          duration: 0.2,
                        },
                      }}
                      className="absolute flex flex-col items-center z-40 group"
                      style={{ width: "60px" }}
                      onClick={() => handleButtonClick(btn.path)}
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(-1)}
                    >
                      <div className="text-gray-300 flex items-center justify-center p-2 rounded-full bg-[#2E2E2E]/80 hover:bg-[#2E2E2E] transition-all duration-200 group-hover:scale-110">
                        {btn.icon}
                      </div>
                      <span className="text-gray-300 text-xs font-medium whitespace-nowrap mt-1 group-hover:text-blue-400 transition-colors">
                        {btn.label}
                      </span>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: hoveredIndex === index ? "100%" : 0 }}
                        className="h-[2px] bg-gradient-to-r from-blue-400 to-blue-500 mt-1"
                        transition={{ duration: 0.2 }}
                      />
                    </motion.button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            onClick={() => setMenuOpen((prev) => !prev)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="relative z-50 flex items-center justify-center w-20 h-20 mb-3.5 sm:mb-3.5 md:mb-0 md:w-24 md:h-24 border-2 border-[#2E2E2E] bg-[#1A1A1A] rounded-full hover:border-blue-400 transition-all"
          >
            <motion.div
              animate={{ rotate: menuOpen ? 135 : 0 }}
              transition={{ type: "elastic", stiffness: 300 }}
              className="text-gray-300 hover:text-blue-400 transition-colors"
            >
              <BiPlus className="w-8 h-8 md:w-10 md:h-10" />
            </motion.div>
          </motion.button>
        </div>
      </nav>
    </header>
    </div>
  );
}
