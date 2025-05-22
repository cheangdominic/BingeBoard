import { useState } from "react";
import { FiSearch, FiMessageSquare } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import ChatBox from "./ChatBox";

export default function SearchBar({ query, setQuery, onSearch }) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSearch();
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const chatButtonVariants = {
    hover: { 
      scale: 1.05,
      rotate: -3,
      transition: {
        type: "tween",
        duration: 0.3
      } 
    },
    tap: { 
      scale: 0.97,
      transition: {
        type: "tween",
        duration: 0.2
      } 
    }
  };

  const chatBoxVariants = {
    hidden: { 
      opacity: 0,
      y: 10,
      x: 10,
      transition: {
        type: "tween",
        duration: 0.2
      }
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: {
        type: "tween",
        duration: 0.25
      }
    },
    exit: {
      opacity: 0,
      y: 10,
      x: 10,
      transition: {
        type: "tween",
        duration: 0.2
      }
    }
  };

  return (
    <div className="mt-4 px-4 sm:px-0 relative">
      <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto">
        <div className="relative flex gap-2">
          <input
            id="search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
          <button
            type="submit"
            className="absolute inset-y-0 right-10 flex items-center px-3 text-[#1963da] hover:text-[#ebbd34] focus:outline-none"
            title="Search"
          >
            <FiSearch size={20} />
          </button>
          <motion.button
            type="button"
            onClick={toggleChat}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-[#1963da] focus:outline-none"
            title="Chat with AI"
            variants={chatButtonVariants}
            whileHover="hover"
            whileTap="tap"
            initial={false}
          >
            <FiMessageSquare size={20} />
          </motion.button>
        </div>
      </form>

      <div className="fixed bottom-4 right-4 z-50">
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              key="chatbox"
              variants={chatBoxVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{
                transformOrigin: "bottom right"
              }}
            >
              <ChatBox onClose={toggleChat} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
