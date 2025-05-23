/**
 * @file BrowseFeature.jsx
 * @description A React component that displays a dedicated page for the "Browse" feature of the application.
 * It includes a top navigation bar, a main feature card, detailed text content about the feature, and a footer.
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
// Import React hooks: `useEffect` for side effects, `useLayoutEffect` for layout-dependent effects,
// `useRef` for DOM references, and `useState` for managing component state.
import { useEffect, useLayoutEffect, useRef, useState } from "react";

// Import an icon specific to the browse feature.
import browseIcon from "../../assets/browse_tv_icon.svg";

/**
 * @function BrowseFeature
 * @description A React functional component that renders the "Browse Feature" page.
 * This page details the discovery and browsing capabilities of the application.
 * It includes animations and adaptive layout for content presentation.
 *
 * @returns {JSX.Element} The rendered BrowseFeature component.
 */
function BrowseFeature() {

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
   * This ensures the user sees the page from the beginning.
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

  // Render the Browse Feature page structure.
  return (
    <>
      {/* Render the TopNavbar component. */}
      <TopNavbar />
      {/* Main section for the browse feature content with padding and background color. */}
      <section className="px-4 py-4 md:py-6 bg-[#1e1e1e]">
        {/* Container for the main feature card, centered with a max width. */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-6 max-w-7xl mx-auto text-center">
          {/* Array containing data for the feature card. Mapped to render the card. */}
          {[{
            title: "Browse Your Next Watch",
            description:
              "Not sure what to watch next? BingeBoard helps you discover new shows based on your interests, trending picks, and what your friends are watching—so your next binge is always one click away.",
            icon: browseIcon, // Icon for the feature.
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

                {/* Text content of the feature card (title and description). */}
                <div className="p-6">
                  <motion.h3 className="text-4xl font-bold text-white mb-3 transition-colors duration-300">
                    {feature.title}
                  </motion.h3>
                  <p className="text-gray-300 text-base">{feature.description}</p>
                </div>

                {/* Subtle inner shadow effect (optional visual enhancement). */}
                <div className="absolute inset-0 rounded-xl pointer-events-none opacity-0 transition-opacity duration-300" style={{
                  boxShadow: "inset 0 0 20px rgba(59, 130, 246, 0.15)" // Example shadow
                }} />
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
          <div ref={ref} className="p-6 text-white space-y-8">
            {/* Series of headings and paragraphs detailing the browse feature. */}
            <h2 className="text-3xl font-semibold text-white">Discover Smarter, Binge Better</h2>
            <p className="text-gray-300 text-lg">
              With BingeBoard, discovering your next obsession is effortless. Whether you're into thrillers, sitcoms, or documentaries, our recommendation engine and social feeds bring you tailored suggestions based on what you love and what’s trending. You can also explore genre-specific lists, follow friends or critics, and even join watch parties.
            </p>

            <h2 className="text-2xl font-semibold text-white">Track Every Episode with Ease</h2>
            <p className="text-gray-300 text-lg">
              Dive into detailed show pages to track what you’ve seen, rate seasons, and read or write reviews. Each episode can be marked off as you watch, helping you stay organized and up to date—no more forgetting where you left off. Plus, get notified when new episodes air so you never miss a premiere.
            </p>

            <h2 className="text-2xl font-semibold text-white">Your Personalized TV Journal</h2>
            <p className="text-gray-300 text-lg">
              Your profile becomes your TV journal—log your watched history, curate personal lists, and share your viewing habits with others. Whether you're a casual viewer or a hardcore binger, BingeBoard gives you the tools to reflect on your watching journey and connect with a community that gets it.
            </p>

            <h2 className="text-2xl font-semibold text-white">Social Connections That Matter</h2>
            <p className="text-gray-300 text-lg">
              BingeBoard isn't just about tracking—it's about connecting. See what your friends are watching, comment on their reviews, and get inspired by their lists. Your public profile lets you express your TV personality while discovering others who share your taste.
            </p>

            <h2 className="text-2xl font-semibold text-white">Stay in the Loop</h2>
            <p className="text-gray-300 text-lg">
              Stay ahead of premieres and finales with our episode release tracker. Show pages highlight upcoming episodes and notify you when it's time to binge again. Never fall behind on your favorite series.
            </p>

            <h2 className="text-2xl font-semibold text-white">Mobile-Optimized and Future-Ready</h2>
            <p className="text-gray-300 text-lg">
              Use BingeBoard on the go with our mobile-optimized web app. A dedicated mobile app is coming soon, with more ways to watch, share, and connect from anywhere.
            </p>

            <h2 className="text-2xl font-semibold text-white">Get Started Today</h2>
            <p className="text-gray-300 text-lg">
              Whether you're watching alone or with friends, tracking casually or reviewing deeply, BingeBoard is your home for everything TV. Create your account, build your watchlist, and start discovering smarter.
            </p>
          </div>
        </motion.div>
      </section>
      {/* Render the Footer component. */}
      <Footer />
    </>
  );
}

// Export the BrowseFeature component as the default export of this module.
export default BrowseFeature;