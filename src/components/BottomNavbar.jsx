/**
 * @file BottomNavbar.jsx
 * @description A React component for a responsive bottom navigation bar with a central animated arc menu.
 * It handles user authentication status to display a profile image and fetches user data like watchlist and username.
 */

// Import React hooks for state and side effects, and animation/navigation utilities.
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion"; // For animations
import { useNavigate, useLocation } from "react-router-dom"; // For navigation and getting current path
import axios from "axios"; // For making HTTP requests
// Import icons from react-icons library.
import {
  BiHome,
  BiSearch,
  BiChat,
  BiPlus,
  BiPencil,
  BiTimeFive,
  BiShow,
} from "react-icons/bi";

/**
 * @function BottomNavbar
 * @description A functional React component that renders a bottom navigation bar.
 * Features include:
 * - Standard navigation buttons (Home, Search, Social, Profile).
 * - A central "+" button that expands into an animated arc menu with additional actions.
 * - Displays the user's profile image, fetched from an API or localStorage.
 * - Highlights the active navigation button based on the current route.
 * - Fetches user data (profile picture, watchlist, username) on mount and updates on profile image changes.
 * @returns {JSX.Element} The rendered BottomNavbar component.
 */
export default function BottomNavbar() {
  // State to control the visibility of the arc menu.
  const [menuOpen, setMenuOpen] = useState(false);
  // State to track which arc menu button is currently hovered, for visual feedback.
  const [hoveredIndex, setHoveredIndex] = useState(-1);
  // State for the user's profile image URL. Initializes from localStorage or null.
  const [profileImage, setProfileImage] = useState(() => {
    return localStorage.getItem('profileImage') || null;
  });
  // State to track if the profile image has loaded (for smooth transition).
  const [imageLoaded, setImageLoaded] = useState(false);
  // State to store fetched user data (watchlist, username).
  const [user, setUser] = useState(null);
  // Hook for programmatic navigation.
  const navigate = useNavigate();
  // Hook to get the current location object (e.g., pathname).
  const location = useLocation();

  /**
   * @function fetchUserData
   * @description Fetches user information (profile picture, watchlist, username) from the `/api/getUserInfo` endpoint.
   * Updates component state and localStorage with the fetched data.
   * Wrapped in `useCallback` to memoize the function and prevent unnecessary re-creations.
   * @async
   */
  const fetchUserData = useCallback(async () => {
  try {
    // Make a GET request to the API endpoint.
    const response = await axios.get("/api/getUserInfo", {
      withCredentials: true, // Send cookies with the request
    });
    // If the request was successful and data is present.
    if (response.data.success) {
      const { profilePic, watchlist, username } = response.data;
      // Store profile picture in localStorage.
      localStorage.setItem('profileImage', profilePic);
      // Update component state for profile image and user data.
      setProfileImage(profilePic);
      setUser({ watchlist, username }); 
    }
  } catch (error) {
    // Log any errors during data fetching.
    console.error("Failed to fetch user data:", error);
  }
}, []); // Empty dependency array means this callback is created once.

  // `useEffect` hook to fetch user data when the component mounts or `fetchUserData` changes (which it won't).
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // `useEffect` hook to handle updates to the profile image.
  // Listens for a custom event 'profileImageUpdated' to re-fetch user data.
  useEffect(() => {
    const handleProfileUpdate = () => {
      // Clear localStorage and reset image loaded state to force re-fetch and re-render.
      localStorage.removeItem('profileImage');
      setImageLoaded(false);
      fetchUserData(); // Re-fetch user data which includes the new profile image.
    };

    // Add event listener for profile image updates.
    window.addEventListener('profileImageUpdated', handleProfileUpdate);
    // Cleanup function to remove the event listener when the component unmounts.
    return () => window.removeEventListener('profileImageUpdated', handleProfileUpdate);
  }, [fetchUserData]); // Dependency on `fetchUserData` to ensure the correct version is used.

  // Configuration for buttons in the animated arc menu.
  const arcButtons = [
    { icon: <BiShow size={20} />, label: "Watchlist", path: "/view-all/watchlist" },
    { icon: <BiPencil size={20} />, label: "Log", path: "/log" },
    { icon: <BiTimeFive size={20} />, label: "Activity", path: "/activity" },
  ];

  // Configuration for the main navigation buttons in the bottom bar.
  const navButtons = [
    { icon: <BiHome size={20} />, label: "Home", path: "/home" },
    { icon: <BiSearch size={20} />, label: "Search", path: "/search" },
    { icon: <BiChat size={20} />, label: "Social", path: "/social" },
    {
      // Profile button icon, dynamically displays profile image or a placeholder.
      icon: (
        <div className="flex items-center justify-center w-6 h-6 rounded-full overflow-hidden border border-gray-600">
          <AnimatePresence mode="wait"> {/* AnimatePresence for smooth transitions between image and placeholder */}
            {profileImage ? (
              // If profileImage exists, display it with an animation.
              <motion.img
                key="profile-image" // Key for AnimatePresence
                src={`${profileImage}?${new Date().getTime()}`} // Append timestamp to URL to bust cache for updated images
                alt="Profile"
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: imageLoaded ? 1 : 0 }} // Animate opacity based on imageLoaded state
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onLoad={() => setImageLoaded(true)} // Set imageLoaded to true when image successfully loads
                onError={() => setProfileImage(null)} // If image fails to load, reset profileImage to null (shows placeholder)
              />
            ) : (
              // If no profileImage, display a placeholder.
              <motion.div
                key="profile-placeholder" // Key for AnimatePresence
                className="w-full h-full bg-gray-700 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <span className="text-xs text-gray-400">?</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ),
      label: "Profile",
      // Profile path dynamically uses the fetched username, or an empty string if not available.
      path: `/user/${user?.username || ""}` 
    },
  ];

  // Radius for positioning buttons in the arc menu.
  const radius = 100;

  /**
   * Handles clicks on navigation buttons (both main and arc menu).
   * Navigates to the specified path. For watchlist, passes watchlist data in state.
   * Closes the arc menu if it was open.
   * @param {string} path - The path to navigate to.
   */
  const handleButtonClick = (path) => {
    if (path === "/view-all/watchlist") {
      // For watchlist, navigate with watchlist data in location state.
      navigate(path, {
        state: {
          watchlist: user?.watchlist || [] // Pass current user's watchlist or an empty array
        }
      });
    } else {
      // For other paths, navigate normally.
      navigate(path);
    }
    // Close the arc menu.
    setMenuOpen(false);
  };

  // Main render method for the BottomNavbar.
  return (
    // Placeholder div to account for the fixed navbar's height, preventing content overlap.
    <div className="pb-[15vh]"> {/* Adjust padding-bottom based on navbar height and desired spacing */}
      {/* Fixed header element for the navbar at the bottom of the screen. */}
      <header className="fixed bottom-0 w-full z-50 bg-[#1A1A1A]/95 backdrop-blur-sm shadow-2xl shadow-black/60 border-t border-gray-800">
        {/* Navigation container with relative positioning for the central button. */}
        <nav aria-label="Global" className="flex items-center relative h-16">
          {/* Left-side navigation buttons (Home, Search). */}
          <div className="flex flex-1 h-full divide-x divide-gray-800 pr-8 md:pr-10 lg:pr-12">
            {navButtons.slice(0, 2).map((btn) => (
              <motion.button
                key={btn.label}
                whileHover={{ scale: 1.05 }} // Hover animation
                // Styling for the button, highlighting if it matches the current path.
                className={`flex-1 flex flex-col items-center justify-end text-xs md:text-sm font-medium pb-2 ${location.pathname === btn.path ? "text-blue-400" : "text-gray-300"
                  }`}
                onClick={() => navigate(btn.path)} // Navigate on click
              >
                {/* Icon container with dynamic background and ring for active state. */}
                <div className={`p-2 rounded-full transition-all ${location.pathname === btn.path
                    ? "bg-[#2E2E2E] ring-2 ring-blue-400/20"
                    : "hover:bg-[#2E2E2E]/50"
                  }`}>
                  {btn.icon}
                </div>
                <span className="mt-1">{btn.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Right-side navigation buttons (Social, Profile). */}
          <div className="flex flex-1 h-full divide-x divide-gray-800 pl-8 md:pl-10 lg:pl-12">
            {navButtons.slice(2, 4).map((btn) => (
              <motion.button
                key={btn.label}
                whileHover={{ scale: 1.05 }}
                className={`flex-1 flex flex-col items-center justify-end text-xs md:text-sm font-medium pb-2 ${location.pathname === btn.path ? "text-blue-400" : "text-gray-300"
                  }`}
                onClick={() => navigate(btn.path)}
              >
                <div className={`p-2 rounded-full transition-all ${location.pathname === btn.path
                    ? "bg-[#2E2E2E] ring-2 ring-blue-400/20"
                    : "hover:bg-[#2E2E2E]/50"
                  }`}>
                  {btn.icon}
                </div>
                <span className="mt-1">{btn.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Central "+" button and its associated animated arc menu. */}
          <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 z-50 flex flex-col items-center">
            <AnimatePresence> {/* Manages enter/exit animations for the arc menu. */}
              {menuOpen && ( // Conditionally render the arc menu if `menuOpen` is true.
                <motion.div
                  // Animation for the arc menu container (clip-path reveal).
                  initial={{ clipPath: "circle(0% at 0% 100%)" }}
                  animate={{ clipPath: "circle(150% at 0% 100%)" }}
                  exit={{ clipPath: "circle(0% at 0% 100%)" }}
                  transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
                  // Styling for the arc menu container.
                  className="relative mb-[-32px] w-[240px] h-[120px] rounded-t-full bg-[#1A1A1A] flex items-end justify-center overflow-hidden border-t border-gray-800"
                >
                  {/* Map over `arcButtons` to render each button in the arc. */}
                  {arcButtons.map((btn, index) => {
                    // Calculate position (x, y) for each button on the arc.
                    const angle = Math.PI - (Math.PI / (arcButtons.length + 1)) * (index + 1);
                    const x = radius * Math.cos(angle);
                    const y = radius * Math.sin(angle);

                    return (
                      <motion.button
                        key={btn.label}
                        // Animation for individual arc buttons (elastic pop-in).
                        initial={{ opacity: 0, x: -20 }}
                        animate={{
                          opacity: 1,
                          x: x,
                          y: -y + 50, // Adjust y position for visual placement.
                          transition: {
                            delay: 0.1 + index * 0.1, // Staggered delay.
                            duration: 0.3,
                            type: "elastic",
                            stiffness: 200,
                            damping: 10,
                          },
                        }}
                        // Exit animation for arc buttons.
                        exit={{
                          opacity: 0,
                          x: -20,
                          transition: {
                            delay: (arcButtons.length - 1 - index) * 0.05, // Staggered exit.
                            duration: 0.2,
                          },
                        }}
                        className="absolute flex flex-col items-center z-40 group" // Group for hover effects on children.
                        style={{ width: "60px" }} // Fixed width for layout.
                        onClick={() => handleButtonClick(btn.path)} // Handle click for navigation.
                        onMouseEnter={() => setHoveredIndex(index)} // Set hovered state.
                        onMouseLeave={() => setHoveredIndex(-1)} // Clear hovered state.
                      >
                        {/* Icon container for arc button. */}
                        <div className="text-gray-300 flex items-center justify-center p-2 rounded-full bg-[#2E2E2E]/80 hover:bg-[#2E2E2E] transition-all duration-200 group-hover:scale-110">
                          {btn.icon}
                        </div>
                        {/* Label for arc button. */}
                        <span className="text-gray-300 text-xs font-medium whitespace-nowrap mt-1 group-hover:text-blue-400 transition-colors">
                          {btn.label}
                        </span>
                        {/* Animated underline for hovered arc button. */}
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: hoveredIndex === index ? "100%" : 0 }} // Animate width based on hover state.
                          className="h-[2px] bg-gradient-to-r from-blue-400 to-blue-500 mt-1"
                          transition={{ duration: 0.2 }}
                        />
                      </motion.button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            {/* The central "+" button to toggle the arc menu. */}
            <motion.button
              onClick={() => setMenuOpen((prev) => !prev)} // Toggle `menuOpen` state.
              whileHover={{ scale: 1.1 }} // Hover animation.
              whileTap={{ scale: 0.95 }} // Tap animation.
              // Styling for the central button.
              className="relative z-50 flex items-center justify-center w-20 h-20 mb-3.5 sm:mb-3.5 md:mb-0 md:w-24 md:h-24 border-2 border-[#2E2E2E] bg-[#1A1A1A] rounded-full hover:border-blue-400 transition-all"
            >
              {/* Animated "+" icon that rotates to "x" when menu is open. */}
              <motion.div
                animate={{ rotate: menuOpen ? 135 : 0 }} // Rotate based on `menuOpen` state.
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