/**
 * @file WatchlistFeature.js
 * @description A React component that displays a dedicated page for the "Watchlist" feature of the application.
 * It includes a top navigation bar, a main feature card highlighting watchlist capabilities, detailed text content, and a footer.
 * It also handles redirection to the home page if a user is already logged in.
 */

// Import `motion` from framer-motion for animations.
import { motion } from "framer-motion";
// Import `useNavigate` from react-router-dom for programmatic navigation.
import { useNavigate } from 'react-router-dom';
// Import `useAuth` custom hook to access authentication context (user state).
import { useAuth } from "../../context/AuthContext";
// Import `TopNavbar` component, likely a navigation bar for landing/unauthenticated pages.
import TopNavbar from '../landing/TopNavbar.jsx';
// Import `Footer` component.
import Footer from '../landing/Footer.jsx';
// Import React hooks: `useEffect` for side effects, `useRef` for DOM references,
// `useState` for managing component state, and `useLayoutEffect` for layout-dependent effects.
import { useEffect, useRef, useState, useLayoutEffect } from "react";

// Import an icon specific to the watchlist feature.
import watchlistIcon from "../../assets/watchlist_icon.svg";

/**
 * @function WatchlistFeature
 * @description A React functional component that renders the "Watchlist Feature" page.
 * This page details how users can save and organize shows they want to watch.
 * It includes animations and adaptive layout for content presentation.
 *
 * @returns {JSX.Element} The rendered WatchlistFeature component.
 */
function WatchlistFeature() {
  // Destructure `user` from the authentication context.
  const { user } = useAuth();
  // Get the `navigate` function from react-router-dom for redirection.
  const navigate = useNavigate();

  /**
   * `useEffect` hook to handle redirection if a user is already logged in.
   * If `user` object exists, it navigates them to the '/home' page.
   * This effect runs when `user` or `navigate` changes.
   */
  useEffect(() => {
    if (user) { // If a user is logged in
      navigate('/home'); // Redirect to the home page
    }
  }, [user, navigate]); // Dependencies: re-run if user state or navigate function changes

  /**
   * `useEffect` hook to scroll the window to the top (0, 0) when the component mounts.
   * Ensures the user sees the page from the beginning.
   * The empty dependency array `[]` means this effect runs only once after the initial render.
   */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Ref to access the DOM element containing the detailed text content.
  const ref = useRef(null);
  // State to store the calculated scroll height of the text content, used for animation.
  const [contentHeight, setContentHeight] = useState(0);

  /**
   * `useLayoutEffect` hook to measure the scroll height of the content `div` after the layout has been calculated.
   * This is used to set the `contentHeight` state, which then drives an animation to reveal the content.
   * Runs after every render where `ref.current` might change (though in this case, it's stable after mount).
   */
  useLayoutEffect(() => {
    if (ref.current) { // If the ref is attached to an element
      setContentHeight(ref.current.scrollHeight); // Set the contentHeight to the element's scrollHeight
    }
  }, []); // Empty dependency array, but will re-run if the component re-renders and the ref changes (unlikely here).

  // Render the Watchlist Feature page structure.
  return (
    <>
      {/* Render the TopNavbar component. */}
      <TopNavbar />
      {/* Main section for the watchlist feature content with padding and background color. */}
      <section className="px-4 py-4 md:py-6 bg-[#1e1e1e]">
        {/* Container for the main feature card, centered with a max width. */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-6 max-w-7xl mx-auto text-center">
          {/* Array containing data for the feature card. Mapped to render the card. */}
          {[{
            title: "Save For Later", // Title for the watchlist feature card
            icon: watchlistIcon,     // Icon for the watchlist feature
          }].map((feature, index) => (
            // Wrapper for the feature card.
            <div className="w-full max-w-10xl group" key={index}> {/* `group` for Tailwind group-hover states */}
              {/* Animated card container with styling. */}
              <motion.div
                initial={{ y: 0, scale: 1 }} // Initial animation state (can be enhanced)
                className="h-full bg-[#2E2E2E] rounded-xl overflow-hidden border border-gray-800 relative"
              >
                {/* Decorative gradient bar at the top of the card with a hover shimmer effect. */}
                <motion.div className="p-1 bg-gradient-to-r from-amber-200/60 to-blue-300/60 relative overflow-hidden">
                  {/* Shimmer effect element, becomes visible on group hover. */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -rotate-45 w-200% -left-[100%]" />
                  {/* Feature icon image. */}
                  <img
                    className="w-full h-40 object-contain p-4 relative z-10" // `z-10` to be above shimmer
                    src={feature.icon}
                    alt={feature.title}
                  />
                </motion.div>
                {/* Text content of the feature card (title). */}
                <div className="p-6">
                  <motion.h3 className="text-4xl font-bold text-white mb-3 transition-colors duration-300">
                    {feature.title}
                  </motion.h3>
                  {/* Description could be added here if needed. */}
                </div>
                {/* Subtle inner shadow effect (optional visual enhancement). */}
                <div
                  className="absolute inset-0 rounded-xl pointer-events-none opacity-0 transition-opacity duration-300"
                  style={{ boxShadow: "inset 0 0 20px rgba(59, 130, 246, 0.15)" }} // Example shadow
                />
              </motion.div>
            </div>
          ))}
        </div>

        {/* Animated container for the detailed text content, revealed with a height animation. */}
        <motion.div
          initial={{ height: 0, opacity: 0 }} // Initial state: collapsed and transparent
          animate={{ height: contentHeight, opacity: 1 }} // Animate to: full calculated height and opaque
          transition={{ duration: 1, ease: "easeOut" }} // Animation transition settings
          className="overflow-hidden bg-[#2E2E2E] rounded-xl mt-6 mx-auto w-full max-w-7xl" // Styling for the container
        >
          {/* Inner div that holds the text content, its `scrollHeight` is measured by `ref`. */}
          <div ref={ref} className="p-6 text-white space-y-6"> {/* Increased space-y for better readability */}
            {/* Series of headings and paragraphs detailing the watchlist feature. */}
            <h2 className="text-3xl font-bold text-white mb-4">Never Miss a Must-Watch Again</h2>
            <p className="text-gray-300">
              Our Watchlist feature lets you save shows and movies you're interested in watching, making it easy to keep track of your entertainment goals.
            </p>

            <h3 className="text-2xl font-semibold text-white mt-8">Plan Your Next Binge</h3>
            <p className="text-gray-300">
              Add any show or movie to your personal Watchlist with a single click. Whether it's a recommendation from a friend or a title that caught your eye, your Watchlist is your go-to queue.
            </p>

            <h3 className="text-2xl font-semibold text-white mt-8">Smart Organization</h3>
            <p className="text-gray-300">
              Your Watchlist is automatically organized by release date and genre, helping you prioritize upcoming releases or dive into specific moods.
            </p>

            <h3 className="text-2xl font-semibold text-white mt-8">Sync Across Devices</h3>
            <p className="text-gray-300">
              Log in from any device and pick up right where you left off. Your Watchlist stays with you, whether you're browsing from your phone, tablet, or laptop.
            </p>

            <h3 className="text-2xl font-semibold text-white mt-8">Share and Discover</h3>
            <p className="text-gray-300">
              Share your Watchlist with friends, or browse theirs for inspiration. It's a great way to discover hidden gems and stay connected over shared interests.
            </p>

            <p className="text-gray-300 mt-6">
              Your Watchlist is more than just a list—it's a personalized roadmap to your entertainment journey. With smart features and seamless sync, BingeBoard makes sure you’re always ready for what’s next.
            </p>
          </div>
        </motion.div>
      </section>
      {/* Render the Footer component. */}
      <Footer />
    </>
  );
}

// Export the WatchlistFeature component as the default export of this module.
export default WatchlistFeature;