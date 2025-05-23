/**
 * @file MottoBanner.jsx
 * @description A React component that displays a prominent banner with the application's motto,
 * a call-to-action button with cycling text, and a backdrop image of a trending TV show.
 */

// Import React hooks (useState, useEffect) for managing state and side effects.
import { useState, useEffect } from 'react';
// Import `motion` and `AnimatePresence` from framer-motion for animations.
import { motion, AnimatePresence } from 'framer-motion';
// Import Link component from react-router-dom for navigation.
import { Link } from 'react-router-dom';
// Import axios for making HTTP requests to the TMDB API.
import axios from 'axios';

/**
 * @function MottoBanner
 * @description A React functional component that renders a large banner, typically for a landing page.
 * It features:
 * - A background image of a currently trending TV show.
 * - The application's motto or tagline.
 * - A call-to-action button ("Get Started") that cycles through different messages.
 * - A link to the featured trending show.
 *
 * @returns {JSX.Element} The rendered MottoBanner component.
 */
function MottoBanner() {
  // State for the text displayed on the call-to-action button.
  const [buttonText, setButtonText] = useState("Get Started");
  // State to track if the call-to-action button is currently being hovered over.
  const [isHovered, setIsHovered] = useState(false);
  // State to store data about the trending TV show used for the banner background and link.
  const [trendingShow, setTrendingShow] = useState(null);
  // TMDB API key retrieved from environment variables.
  const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

  // Array of messages to cycle through for the call-to-action button text.
  const messages = [
    "Join the community",
    "Start tracking",
    "Discover new shows",
    "Review your favorites",
    "See new episodes",
  ];

  /**
   * `useEffect` hook to handle the cycling text animation for the call-to-action button.
   * Changes the button text at regular intervals unless the button is being hovered.
   */
  useEffect(() => {
    // If the button is hovered, do not cycle the text.
    if (isHovered) return;

    // Set up an interval to change the button text.
    const interval = setInterval(() => {
      setButtonText(prev => { // Use functional update to get the previous state.
        let newMessage;
        do {
          // Pick a random message from the `messages` array.
          newMessage = messages[Math.floor(Math.random() * messages.length)];
        } while (newMessage === prev && messages.length > 1); // Ensure the new message is different from the previous one (if possible).
        return newMessage;
      });
    }, 3000); // Change text every 3 seconds.

    // Cleanup function: clear the interval when the component unmounts or `isHovered` changes.
    return () => clearInterval(interval);
  }, [isHovered]); // Dependency: re-run effect if `isHovered` state changes.

  /**
   * `useEffect` hook to fetch data for a trending TV show when the component mounts
   * or when the `API_KEY` changes.
   */
  useEffect(() => {
    /**
     * Asynchronous function to fetch the top trending TV show of the week from TMDB.
     * @async
     */
    const fetchTrendingShow = async () => {
      try {
        // Fetch weekly trending TV shows.
        const res = await axios.get(
          `https://api.themoviedb.org/3/trending/tv/week?api_key=${API_KEY}&language=en-US`
        );

        // Get the first show from the results (assumed to be the top trending).
        const topShow = res.data.results[0];

        // Fetch detailed information for this top show to get its overview.
        const details = await axios.get(
          `https://api.themoviedb.org/3/tv/${topShow.id}?api_key=${API_KEY}&language=en-US`
        );

        // Update the `trendingShow` state with relevant data.
        setTrendingShow({
          id: topShow.id,
          backdrop_path: topShow.backdrop_path, // Backdrop image path for the banner background.
          name: topShow.name,                   // Name of the show.
          overview: details.data.overview,      // Overview/description (currently unused in this component's JSX).
        });
      } catch (error) {
        console.error("Error fetching trending TV show:", error);
        // Optionally, set a fallback or error state here.
      }
    };

    fetchTrendingShow();
  }, [API_KEY]); // Dependency: re-run effect if `API_KEY` changes.

  // Determine the banner image URL: use the fetched trending show's backdrop or a fallback.
  const bannerImage = trendingShow?.backdrop_path
    ? `https://image.tmdb.org/t/p/original${trendingShow.backdrop_path}` // Construct full image URL
    : '/fallback-banner.jpg'; // Fallback image if no trending show data or backdrop path

  // Render the MottoBanner component.
  return (
    // Main container for the banner, with relative positioning for overlay content.
    <div className="relative">
      {/* Background image for the banner. */}
      <img
        src={bannerImage}
        alt={trendingShow?.name || "Trending show"} // Alt text for accessibility.
        className="w-full h-[500px] object-cover" // Styling for full width, fixed height, and image covering.
      />
      {/* Dark overlay to improve text readability over the background image. */}
      <div className="absolute inset-0 bg-black bg-opacity-35 flex items-center justify-center">
        {/* Container for the motto text and call-to-action button, centered and styled. */}
        <div className="flex flex-col items-center space-y-4 text-center -mt-24"> {/* Negative margin to shift content up slightly. */}
          {/* Main motto/tagline. */}
          <h1 className="text-white text-4xl lg:text-6xl font-bold font-coolvetica">
            Track What You Watch.
          </h1>
          <h1 className="text-white text-4xl lg:text-6xl font-bold font-coolvetica">
            Share What You Love.
          </h1>

          {/* Call-to-action button, styled as an anchor tag linking to the signup page. */}
          <a
            href="/signup" // Direct link to signup page (could also be a <Link> component if part of client-side routing).
            className="min-w-[120px] inline-block text-center no-underline" // Styling for minimum width and text decoration.
            onMouseEnter={() => setIsHovered(true)} // Set hover state on mouse enter.
            onMouseLeave={() => setIsHovered(false)} // Clear hover state on mouse leave.
          >
            {/* Animated div for the button appearance. */}
            <motion.div
              className="px-6 py-3 bg-[#1963da] text-white font-bold rounded-lg hover:bg-[#ebbd34] hover:text-black transition-colors cursor-pointer mt-4" // Styling and hover effects.
              layout // Enables layout animations if button size changes.
              transition={{ // Transition settings for layout changes.
                type: "tween",
                ease: "easeInOut",
                duration: 0.3,
              }}
            >
              {/* AnimatePresence to handle enter/exit animations for the cycling button text. */}
              <AnimatePresence mode="wait"> {/* `mode="wait"` ensures exit animation completes before enter. */}
                {/* Animated span for the button text. */}
                <motion.span
                  key={buttonText} // Key changes when `buttonText` changes, triggering animation.
                  initial={{ opacity: 0, y: 5 }} // Initial state: transparent and slightly down.
                  animate={{ opacity: 1, y: 0 }}   // Animate to: opaque and original position.
                  exit={{ opacity: 0, y: -5 }}    // Exit state: transparent and slightly up.
                  transition={{ duration: 0.2 }} // Animation duration.
                  className="inline-block"
                >
                  {buttonText} {/* Display the current button text. */}
                </motion.span>
              </AnimatePresence>
            </motion.div>
          </a>
        </div>

        {/* Link to the featured trending show, positioned at the bottom-left of the banner. */}
        {/* Only renders if `trendingShow.name` exists. */}
        {trendingShow?.name && (
          <Link
            to={`/show/${trendingShow.id}`} // Links to the show's detail page.
            className="absolute bottom-4 left-4 bg-[#1963da] bg-opacity-70 text-white px-2 py-1 rounded-lg text-lg font-semibold max-w-[80%] hover:underline" // Styling for the link.
          >
            {trendingShow.name} {/* Display the name of the trending show. */}
          </Link>
        )}
      </div>
    </div>
  );
}

// Export the MottoBanner component as the default export of this module.
export default MottoBanner;