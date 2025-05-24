/**
 * @file SocialFeature.jsx
 * @description A React component that displays a dedicated page for the "Social" feature of the application.
 * It includes a top navigation bar, a main feature card highlighting social aspects, detailed text content, and a footer.
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

// Import an icon specific to the social feature.
import friendIcon from "../../assets/friend_feature_icon.svg";

/**
 * @function SocialFeature
 * @description A React functional component that renders the "Social Feature" page.
 * This page details the social interaction capabilities of the application, such as following friends,
 * commenting, and privacy controls. It includes animations and adaptive layout.
 *
 * @returns {JSX.Element} The rendered SocialFeature component.
 */
function SocialFeature() {
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

  // Render the Social Feature page structure.
  return (
    <>
      {/* Render the TopNavbar component. */}
      <TopNavbar />
      {/* Main section for the social feature content with padding and background color. */}
      <section className="px-4 py-4 md:py-6 bg-[#1e1e1e]">
        {/* Container for the main feature card, centered with a max width. */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-6 max-w-7xl mx-auto text-center">
          {/* Array containing data for the feature card. Mapped to render the card. */}
          {[{
            title: "Connect and Share", // Title for the social feature card
            icon: friendIcon,         // Icon for the social feature
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
                  {/* Description could be added here if needed, similar to BrowseFeature.jsx */}
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
            {/* Series of headings and paragraphs detailing the social feature. */}
            <h2 className="text-3xl font-bold text-white mb-4">Social TV Watching, Reimagined</h2>
            <p className="text-gray-300">
              BingeBoard isn’t just about watching TV—it’s about connecting with the people who love it as much as you do. With our social features, you can follow your friends, discover new shows through your network, and keep up with what everyone’s watching.
            </p>

            <h3 className="text-2xl font-semibold text-white mt-8">Follow Friends & See Their Activity</h3>
            <p className="text-gray-300">
              Want to see what your friends thought about the season finale of your favorite show? Follow them and get updates when they rate or review something. BingeBoard makes it easy to stay in sync and never miss out on the conversation.
            </p>

            <h3 className="text-2xl font-semibold text-white mt-8">Comment and React</h3>
            <p className="text-gray-300">
              Each review, rating, or list can be liked and commented on. Whether it’s insightful analysis or a hot take, jump into discussions and make your voice heard in the community.
            </p>

            <h3 className="text-2xl font-semibold text-white mt-8">Privacy Controls</h3>
            <p className="text-gray-300">
              You're in control. Choose to make your profile public or private, approve follower requests, and select who sees your ratings and reviews. Your viewing habits stay as personal—or as social—as you want.
            </p>

            <h3 className="text-2xl font-semibold text-white mt-8">A Feed Built Around You</h3>
            <p className="text-gray-300">
              Your homepage feed surfaces the most relevant content: trending reviews, friends’ activities, newly released episodes, and more—all personalized to your tastes.
            </p>

            <h3 className="text-2xl font-semibold text-white mt-8">Celebrate Your Watch History</h3>
            <p className="text-gray-300">
              Milestones like finishing a series or hitting your 100th episode watched are celebrated with digital badges and notifications—because your binge journey deserves some recognition.
            </p>

            <p className="text-gray-300 mt-6">
              Whether you're a casual watcher or a die-hard fan, BingeBoard transforms your solo binges into a shared experience. Connect, discover, and celebrate the shows you love with a community that gets it.
            </p>
          </div>
        </motion.div>
      </section>
      {/* Render the Footer component. */}
      <Footer />
    </>
  );
}

// Export the SocialFeature component as the default export of this module.
export default SocialFeature;