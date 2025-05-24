/**
 * @file SearchBar.js
 * @description A React component that provides a search input field and a button to toggle an AI chat box.
 * It uses Framer Motion for animations.
 */

// Import useState hook from React for managing component state.
import { useState } from "react";
// Import icons (Search, MessageSquare) from react-icons.
import { FiSearch, FiMessageSquare } from "react-icons/fi";
// Import `motion` and `AnimatePresence` from framer-motion for animations.
import { motion, AnimatePresence } from "framer-motion";
// Import the ChatBox component, which is toggled by this search bar.
import ChatBox from "./ChatBox"; // Assuming ChatBox.js is in the same directory.

/**
 * @function SearchBar
 * @description A React functional component that renders a search input field along with
 * a search button and a button to open/close an AI chat interface.
 *
 * @param {object} props - The properties passed to the component.
 * @param {string} props.query - The current value of the search query string.
 * @param {function(string): void} props.setQuery - Callback function to update the search query string.
 * @param {function(): void} props.onSearch - Callback function to be invoked when a search is submitted.
 * @returns {JSX.Element} The rendered SearchBar component.
 */
export default function SearchBar({ query, setQuery, onSearch }) {
  /**
   * State variable to control the visibility of the ChatBox component.
   * `true` if the chat box should be open, `false` otherwise.
   * @type {[boolean, function(boolean): void]}
   */
  const [isChatOpen, setIsChatOpen] = useState(false);

  /**
   * Handles the form submission for the search input.
   * Prevents default form submission and calls the `onSearch` callback if the query is not empty.
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event object.
   */
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent the default browser form submission behavior.
    // If the query is empty or only whitespace, do not proceed with the search.
    if (!query.trim()) return;
    onSearch(); // Call the provided onSearch callback function.
  };

  /**
   * Toggles the visibility of the ChatBox component.
   * Reverses the current value of `isChatOpen` state.
   */
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  // Framer Motion variants for the chat toggle button animations (hover, tap).
  const chatButtonVariants = {
    hover: { 
      scale: 1.05, // Scale up slightly on hover.
      rotate: -3,  // Rotate slightly on hover.
      transition: {
        type: "tween", // Use tween for smooth, non-springy animation.
        duration: 0.3
      } 
    },
    tap: { 
      scale: 0.97, // Scale down slightly on tap.
      transition: {
        type: "tween",
        duration: 0.2
      } 
    }
  };

  // Framer Motion variants for the ChatBox component animations (enter, exit).
  const chatBoxVariants = {
    // Initial state before entering (hidden).
    hidden: { 
      opacity: 0,
      y: 10, // Start slightly below its final position.
      x: 10, // Start slightly to the right of its final position (for bottom-right origin).
      transition: {
        type: "tween",
        duration: 0.2
      }
    },
    // State when visible.
    visible: {
      opacity: 1,
      y: 0, // Animate to original y-position.
      x: 0, // Animate to original x-position.
      transition: {
        type: "tween",
        duration: 0.25
      }
    },
    // State when exiting (before being removed from DOM).
    exit: {
      opacity: 0,
      y: 10, // Animate slightly down.
      x: 10, // Animate slightly to the right.
      transition: {
        type: "tween",
        duration: 0.2
      }
    }
  };

  // Render the search bar and chat box.
  return (
    // Main container for the search bar, with relative positioning for the chat box.
    <div className="mt-4 px-4 sm:px-0 relative">
      {/* Search form. */}
      <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto"> {/* Centered with max width. */}
        {/* Relative container for input field and action buttons (Search, Chat). */}
        <div className="relative flex gap-2"> {/* `gap-2` if there were multiple direct children, but buttons are absolutely positioned. */}
          {/* Search input field. */}
          <input
            id="search" // ID for label association (label not present here, but good practice).
            type="text"
            value={query} // Controlled component: value is bound to `query` prop.
            onChange={(e) => setQuery(e.target.value)} // Update query state on change.
            placeholder="Search..."
            // Styling for the input field.
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
          {/* Search submit button (magnifying glass icon). */}
          <button
            type="submit"
            // Positioned absolutely within the input field's parent.
            className="absolute inset-y-0 right-10 flex items-center px-3 text-[#1963da] hover:text-[#ebbd34] focus:outline-none"
            title="Search" // Tooltip for accessibility.
          >
            <FiSearch size={20} /> {/* Search icon. */}
          </button>
          {/* Chat toggle button (message square icon). */}
          <motion.button
            type="button" // Important: `type="button"` prevents form submission.
            onClick={toggleChat} // Call `toggleChat` on click.
            // Positioned absolutely.
            className="absolute inset-y-0 right-0 flex items-center px-3 text-[#1963da] focus:outline-none"
            title="Chat with AI" // Tooltip.
            variants={chatButtonVariants} // Apply animation variants.
            whileHover="hover" // Trigger "hover" variant on mouse enter.
            whileTap="tap"     // Trigger "tap" variant on mouse press.
            initial={false}    // Prevents initial animation run if variant properties are simple values.
          >
            <FiMessageSquare size={20} /> {/* Chat icon. */}
          </motion.button>
        </div>
      </form>

      {/* Container for the ChatBox, fixed position at bottom-right of viewport. */}
      {/* This div itself isn't animated, but it positions the animated ChatBox. */}
      <div className="fixed bottom-4 right-4 z-50">
        {/* AnimatePresence handles the enter and exit animations of its children. */}
        <AnimatePresence>
          {/* Conditionally render the ChatBox component if `isChatOpen` is true. */}
          {isChatOpen && (
            <motion.div
              key="chatbox" // Unique key for AnimatePresence to track the component.
              variants={chatBoxVariants} // Apply chat box animation variants.
              initial="hidden"  // Start with the "hidden" variant.
              animate="visible" // Animate to the "visible" variant.
              exit="exit"       // Animate to the "exit" variant when removed.
              style={{
                transformOrigin: "bottom right" // Set transform origin for scale/position animations to originate from bottom-right.
              }}
            >
              {/* Render the ChatBox component, passing `toggleChat` as the onClose handler. */}
              <ChatBox onClose={toggleChat} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}